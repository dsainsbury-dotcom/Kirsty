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


def norm(value):
    return re.sub(r"[^a-z0-9]+", "", str(value or "").strip().lower())


def first_present(row, aliases):
    for alias in aliases:
        key = norm(alias)
        if row.get(key, "").strip():
            return row[key].strip()
    return ""


def normalise_status(value):
    v = norm(value)
    if v in {"done", "complete", "completed", "finished", "yes"}:
        return "done"
    if v in {"waiting", "blocked", "pending", "hold", "onhold"}:
        return "waiting"
    if v in {"open", "todo", "planned", "plan", "active", "inprogress"}:
        return "open"
    return value.strip().lower() if value.strip() else "logged"


def row_to_entry(row):
    date_value = first_present(row, ["date", "day", "when", "event date"])
    category = first_present(row, ["category", "type", "area", "group"])
    status = normalise_status(first_present(row, ["status", "state", "progress"]))
    title = first_present(row, ["title", "item", "event", "task", "activity", "what", "name"])
    detail = first_present(row, ["notes", "note", "details", "detail", "description", "comments", "comment"])

    # If the sheet uses different headings, keep the row useful instead of dropping it.
    used = {norm(x) for x in ["date", "day", "when", "event date", "category", "type", "area", "group",
                                     "status", "state", "progress", "title", "item", "event", "task", "activity",
                                     "what", "name", "notes", "note", "details", "detail", "description", "comments", "comment"]}
    leftovers = [v.strip() for k, v in row.items() if k not in used and v.strip()]
    if not title and leftovers:
        title = leftovers.pop(0)
    if not detail and leftovers:
        detail = " | ".join(leftovers)

    if not title:
        return None

    return {
        "date": date_value or "",
        "title": title,
        "detail": detail,
        "category": category,
        "status": status,
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

    # First non-empty row is treated as the header row.
    header_index = next((i for i, r in enumerate(values) if any(str(c).strip() for c in r)), None)
    if header_index is None:
        raise RuntimeError("No header row found")

    headers = [norm(h) or f"column{i+1}" for i, h in enumerate(values[header_index])]
    entries = []

    for raw_row in values[header_index + 1:]:
        if not any(str(c).strip() for c in raw_row):
            continue
        padded = raw_row + [""] * max(0, len(headers) - len(raw_row))
        row = {headers[i]: str(padded[i]) for i in range(len(headers))}
        entry = row_to_entry(row)
        if entry:
            entries.append(entry)

    payload = {
        "source": "Google Sheets - DiaryEvents",
        "sheetId": SHEET_ID,
        "tab": worksheet.title,
        "updated": datetime.now().astimezone().isoformat(timespec="seconds"),
        "count": len(entries),
        "entries": entries,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Synced {len(entries)} diary entries from tab '{worksheet.title}'.")


if __name__ == "__main__":
    main()
