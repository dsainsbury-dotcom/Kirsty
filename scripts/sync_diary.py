import json
import os
import re
from datetime import datetime, date
from pathlib import Path

import gspread
from google.oauth2.service_account import Credentials

SHEET_ID = "18-tyMUVrdJHzTE5RRZrtl1dt0dj7C-Hoa6stf6_PdT4"
OUTPUT = Path("data/home-diary.json")
SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
}


def norm(value):
    return re.sub(r"[^a-z0-9]+", "", str(value or "").strip().lower())


def first_present(row, aliases):
    for alias in aliases:
        key = norm(alias)
        if row.get(key, "").strip():
            return row[key].strip()
    return ""


def parse_month_year(value):
    raw = str(value or "").strip()
    m = re.fullmatch(r"([A-Za-z]+)\s+(20\d{2})", raw)
    if not m:
        return None
    month = MONTHS.get(m.group(1).lower())
    return (int(m.group(2)), month) if month else None


def parse_date(value, month_context=None):
    raw = str(value or "").strip()
    if not raw:
        return None

    formats = [
        "%d/%m/%Y", "%d/%m/%y",
        "%Y-%m-%d",
        "%d-%m-%Y", "%d-%m-%y",
        "%d %b %Y", "%d %B %Y",
        "%d %b %y", "%d %B %y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            pass

    # Supports diary rows such as "Saturday 23rd", "Sat 23", or just "23rd"
    # when the month/year is supplied by a preceding row such as "August 2026".
    if month_context:
        cleaned = re.sub(r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b", "", raw, flags=re.I)
        cleaned = re.sub(r"(\d)(st|nd|rd|th)\b", r"\1", cleaned, flags=re.I).strip(" ,-/")
        m = re.search(r"\b(\d{1,2})\b", cleaned)
        if m:
            day = int(m.group(1))
            year, month = month_context
            try:
                return date(year, month, day)
            except ValueError:
                return None
    return None


def derive_status(parsed_date, explicit_status):
    """Past dates are done. Today/future are planned. Explicit blocked items stay waiting."""
    if norm(explicit_status) in {"waiting", "blocked", "hold", "onhold", "pending"}:
        return "waiting"
    if parsed_date:
        return "done" if parsed_date < date.today() else "planned"
    return "planned"


def row_to_entry(row, month_context=None):
    date_value = first_present(row, ["date", "day", "when", "event date"])
    category = first_present(row, ["category", "type", "area", "group"])
    explicit_status = first_present(row, ["status", "state", "progress"])
    title = first_present(row, ["title", "item", "event", "task", "activity", "what", "name"])
    detail = first_present(row, ["notes", "note", "details", "detail", "description", "comments", "comment"])

    used = {norm(x) for x in [
        "date", "day", "when", "event date", "category", "type", "area", "group",
        "status", "state", "progress", "title", "item", "event", "task", "activity",
        "what", "name", "notes", "note", "details", "detail", "description", "comments", "comment"
    ]}
    leftovers = [v.strip() for k, v in row.items() if k not in used and v.strip()]
    if not title and leftovers:
        title = leftovers.pop(0)
    if not detail and leftovers:
        detail = " | ".join(leftovers)

    if not title:
        return None

    parsed = parse_date(date_value, month_context)
    display_date = date_value
    if parsed:
        display_date = parsed.strftime("%a %-d %b %Y")

    return {
        "date": display_date or "",
        "dateISO": parsed.isoformat() if parsed else "",
        "title": title,
        "detail": detail,
        "category": category,
        "status": derive_status(parsed, explicit_status),
    }


def main():
    raw_secret = os.environ.get("GOOGLE_SERVICE_ACCOUNT", "").strip()
    if not raw_secret:
        raise RuntimeError("GOOGLE_SERVICE_ACCOUNT secret is missing")

    creds_info = json.loads(raw_secret)
    creds = Credentials.from_service_account_info(creds_info, scopes=SCOPES)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(SHEET_ID)

    tab_name = os.environ.get("SHEET_TAB", "").strip()
    worksheet = spreadsheet.worksheet(tab_name) if tab_name else spreadsheet.get_worksheet(0)
    values = worksheet.get_all_values()

    if not values:
        raise RuntimeError("The Google Sheet is empty")

    header_index = next((i for i, r in enumerate(values) if any(str(c).strip() for c in r)), None)
    if header_index is None:
        raise RuntimeError("No header row found")

    headers = [norm(h) or f"column{i+1}" for i, h in enumerate(values[header_index])]
    entries = []
    month_context = None

    for raw_row in values[header_index + 1:]:
        cells = [str(c).strip() for c in raw_row]
        non_empty = [c for c in cells if c]
        if not non_empty:
            continue

        # A standalone row such as "August 2026" sets the month/year for the rows below it.
        if len(non_empty) == 1:
            possible_month = parse_month_year(non_empty[0])
            if possible_month:
                month_context = possible_month
                continue

        padded = cells + [""] * max(0, len(headers) - len(cells))
        row = {headers[i]: padded[i] for i in range(len(headers))}
        entry = row_to_entry(row, month_context)
        if entry:
            entries.append(entry)

    payload = {
        "source": "Google Sheets - DiaryEvents",
        "sheetId": SHEET_ID,
        "tab": worksheet.title,
        "updated": datetime.now().astimezone().isoformat(timespec="seconds"),
        "rules": {
            "monthHeader": "A row such as August 2026 supplies month/year to following entries",
            "pastDate": "done",
            "todayOrFuture": "planned",
            "blocked": "waiting"
        },
        "count": len(entries),
        "entries": entries,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Synced {len(entries)} diary entries from tab '{worksheet.title}'.")


if __name__ == "__main__":
    main()
