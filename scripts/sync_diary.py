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
MIN_DATE = date(2026, 8, 1)

MONTHS = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
}

WEEKDAY_RE = re.compile(r"^(mon(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|fri(day)?|sat(urday)?|sun(day)?)(\s*-\s*(mon(day)?|tue(sday)?|wed(nesday)?|thu(rsday)?|fri(day)?|sat(urday)?|sun(day)?))?$", re.I)
OWNER_TOKENS = {"darren", "daz", "both", "family", "gang", "tracy", "tracys"}


def norm(value):
    return re.sub(r"[^a-z0-9]+", "", str(value or "").strip().lower())


def parse_month_year(value):
    raw = str(value or "").strip()
    m = re.search(r"\b([A-Za-z]+)\s+(20\d{2})\b", raw)
    if not m:
        return None
    month = MONTHS.get(m.group(1).lower())
    return (int(m.group(2)), month) if month else None


def ordinal_day(value):
    raw = str(value or "").strip()
    if not raw:
        return None
    m = re.search(r"\b(\d{1,2})(?:st|nd|rd|th)\b", raw, flags=re.I)
    if m:
        return int(m.group(1))
    if re.fullmatch(r"\d{1,2}", raw):
        return int(raw)
    return None


def parse_full_date(value):
    raw = str(value or "").strip()
    for fmt in [
        "%d/%m/%Y", "%d/%m/%y", "%Y-%m-%d", "%d-%m-%Y", "%d-%m-%y",
        "%d %b %Y", "%d %B %Y", "%d %b %y", "%d %B %y",
    ]:
        try:
            return datetime.strptime(raw, fmt).date()
        except ValueError:
            pass
    return None


def derive_status(parsed_date, explicit_status=""):
    if norm(explicit_status) in {"waiting", "blocked", "hold", "onhold", "pending"}:
        return "waiting"
    if parsed_date:
        return "done" if parsed_date < date.today() else "planned"
    return "planned"


def build_entry(cells, month_context):
    non_empty = [(i, c) for i, c in enumerate(cells) if c]
    if not non_empty:
        return None

    parsed = None
    date_index = None
    raw_date = ""
    for i, cell in non_empty:
        full = parse_full_date(cell)
        if full:
            parsed = full
            date_index = i
            raw_date = cell
            break

    if parsed is None and month_context:
        for i, cell in non_empty:
            day = ordinal_day(cell)
            if day is None:
                continue
            year, month = month_context
            try:
                parsed = date(year, month, day)
                date_index = i
                raw_date = cell
                break
            except ValueError:
                continue

    if parsed and parsed < MIN_DATE:
        return None

    weekday = ""
    owner = ""
    event_parts = []
    for i, cell in non_empty:
        if parse_month_year(cell):
            continue
        if WEEKDAY_RE.fullmatch(cell):
            weekday = cell
            continue
        if i == date_index:
            continue
        if norm(cell) in OWNER_TOKENS and not owner:
            owner = cell
            continue
        event_parts.append(cell)

    if parsed is None and len(event_parts) <= 1:
        return None

    title = " | ".join(event_parts) if event_parts else (weekday or "Diary item")
    detail_parts = []
    if weekday:
        detail_parts.append(weekday)
    if owner:
        detail_parts.append(owner)
    if raw_date and "-" in raw_date:
        detail_parts.append(raw_date)

    display_date = parsed.strftime("%a %-d %b %Y") if parsed else ""
    return {
        "date": display_date,
        "dateISO": parsed.isoformat() if parsed else "",
        "title": title,
        "detail": " | ".join(detail_parts),
        "category": owner,
        "status": derive_status(parsed),
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

    entries = []
    month_context = None

    for raw_row in values:
        cells = [str(c).strip() for c in raw_row]
        if not any(cells):
            continue

        found_month = None
        for cell in cells:
            found_month = parse_month_year(cell)
            if found_month:
                break
        if found_month:
            month_context = found_month
            continue

        entry = build_entry(cells, month_context)
        if entry:
            entries.append(entry)

    payload = {
        "source": "Google Sheets - DiaryEvents",
        "sheetId": SHEET_ID,
        "tab": worksheet.title,
        "updated": datetime.now().astimezone().isoformat(timespec="seconds"),
        "rules": {
            "ignoreBefore": "2026-08-01",
            "monthHeader": "Month/year is read from any cell in a section row",
            "rowLayout": "weekday + ordinal day + owner + event",
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
