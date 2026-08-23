# Darren's Compass

A simple static GitHub Pages dashboard for therapy notes, current homework, values, goals and progress.

## Publish on GitHub Pages

1. Create a new GitHub repository, for example `darrens-compass`.
2. Upload **all files and folders from this package** to the repository root.
3. In GitHub open **Settings > Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save. GitHub will show the Pages URL once deployed.

## Weekly updates

Most weekly changes only need `data/site-data.json`.

Update:
- `thisWeek` for Kirsty's new homework
- `currentGoals` for personal/work goals
- `progress` for new wins/avoidance patterns
- `timeline` only when there is a meaningful milestone
- `dailyLog` when you want recent day-by-day history shown

The PDFs in `assets/pdfs/` are the printable reference sheets.

## Privacy warning

This dashboard contains personal therapy and health-related information. GitHub Pages from a public repository is publicly accessible. Do not publish it publicly unless you are comfortable with anyone who has the URL potentially seeing the content. If privacy matters, use a private hosting setup instead.
