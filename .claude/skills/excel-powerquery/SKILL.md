---
name: excel-powerquery
description: Refresh/recompute Power Query in Excel-for-Mac workbooks and read cells back, driving real Excel through the computer-use MCP (screenshots + clicks + clipboard). Use when the user wants to refresh prisma/data.xlsx, recompute Power Query / data connections, run an Excel refresh on macOS, or read values out of an .xlsx after a query refresh.
---

# Excel + Power Query (macOS, via computer-use MCP)

Drives **Excel for Mac** through the `computer-use` MCP: take a screenshot,
click `Data → Refresh All` in the ribbon, wait for the engine to finish, save,
close. Same code path Windows Excel uses for `RefreshAll`, just clicked instead
of called. The M / Power Query engine ships only inside Excel — no pure library
can recompute these queries, so we drive the real app.

> Excel is computer-use tier **"full"** — clicks, typing, and `key` all work.

## Preconditions

1. Computer-use MCP connected. Call `request_access` with
   `["Microsoft Excel", "Finder"]` (Finder so the workbook can be opened via
   `open_application` if needed). Excel must be installed.
2. Excel display scaling reasonable — UI elements need to be findable in a
   screenshot. If the user has a tiny window, resize first.
3. Target file defaults to `prisma/data.xlsx` (16 internal Power Query queries,
   `$Workbook$` connections).

## Workflow — refresh prisma/data.xlsx

1. **Open the workbook** with Bash (much faster than navigating the Open
   dialog):
   ```bash
   open -a "Microsoft Excel" /Users/lucasbic/Lushomo/who_srhr/prisma/data.xlsx
   ```
   Then `mcp__computer-use__screenshot` to confirm the workbook is frontmost
   and no modal is blocking (recovery prompt, "external links present",
   "enable content"). Dismiss any modal before continuing.

2. **Click `Data → Refresh All`** in the ribbon.
   - Switch to the Data tab: `left_click` on the "Data" tab label, or press
     the tab via keyboard. Screenshot to confirm.
   - The **Refresh All** button is the leftmost group on the Data tab,
     labelled "Refresh" with a small dropdown caret. Click the **icon body**,
     not the caret — caret opens a menu.
   - Screenshot immediately after — Excel shows a small "Querying…" indicator
     in the status bar (bottom of window).

3. **Wait for completion.** Poll by screenshot every ~2s using
   `mcp__computer-use__wait` + `screenshot`. Refresh is done when the status
   bar returns to "Ready" / "Calculate" goes away. For `data.xlsx` (16
   queries) expect 10–60s on first run, faster on warm cache. Cap the wait at
   ~120s; if still spinning, surface the state to the user instead of
   guessing.

4. **Save and close.**
   - `key` → `cmd+s` (in-place save; .xlsx is already the right format).
   - Screenshot to confirm no "save as" dialog appeared. If one did, the file
     was opened read-only — stop and report.
   - `key` → `cmd+w` to close the workbook.

## Reading cells back (read-range)

Use this both for verification after refresh and as a standalone read.

1. Workbook must be open and on the target sheet — click the sheet tab if
   needed.
2. Select the range via the Name Box (top-left address field, left of the
   formula bar):
   - `left_click` the Name Box.
   - `type` the range, e.g. `Sheet1!A1:C5` (sheet-qualified is safest).
   - `key` → `return` to select.
3. Copy: `key` → `cmd+c`.
4. `mcp__computer-use__read_clipboard` — returns tab-separated rows, newline
   between rows. Parse and sanity-check.

## Mandatory verification

Mac Power Query refreshes are best-effort — unsupported external connectors
no-op silently. Never report success on the screenshot alone:

- **Read-back**: pull a known output range (see above) and confirm values
  changed / are sane.
- **Or downstream**: run `npx prisma db seed` and confirm it ingests cleanly
  with no row-count regressions.

State explicitly what you verified and the observed values.

## Workflow checklist

- [ ] `request_access` for Microsoft Excel granted
- [ ] Workbook opened via `open -a "Microsoft Excel" <abs path>`
- [ ] No modal blocking; Excel frontmost
- [ ] Data tab → Refresh All clicked (icon body, not caret)
- [ ] Polled until status bar returns to Ready (≤120s)
- [ ] `cmd+s` succeeded with no Save-As dialog
- [ ] Verified via read-range or `prisma db seed`
- [ ] Reported: queries refreshed, cells/values observed

## When this skill is the wrong tool

- Read-only extraction of **cached** values, no recompute needed → openpyxl
  / SheetJS is faster and headless. Use this skill only when the M engine
  must actually run.
- Bulk programmatic Excel work → consider the Windows `sbroenne` MCP on a
  Windows host; Mac has no equivalent headless path.

See [REFERENCE.md](REFERENCE.md) for UI quirks, modal recovery, and the
clipboard TSV format.
