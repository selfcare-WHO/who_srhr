# Reference — excel-powerquery (Python edits + manual refresh)

## Why this split

`prisma/data.xlsx` has 16 internal Power Query queries
(`Microsoft.Mashup.OleDb.1`, `$Workbook$`), M code in `customXml/item1.xml`,
14 query tables → sheets. The M / Power Query engine ships only inside Excel
/ Power BI. `openpyxl` / SheetJS / ClosedXML read **cached** values only —
they cannot recompute.

Previous attempts to automate the refresh:

- **AppleScript** (`macos_automator`) — permission walls (`-1743`), silent
  no-ops on `refresh queryTable` for several connectors.
- **computer-use MCP** (click Data → Refresh All in the ribbon) — works but
  flaky (modal handling, off-screen windows, locale-dependent ribbon, save
  dialogs on read-only opens). Slower and less reliable than asking the user
  to click once.

So: Python for edits (headless, deterministic), human for the refresh click.

## Tools used

| Step | Tool |
|---|---|
| Edit cells / sheets | Python + `openpyxl` (`/Users/lucasbic/miniconda3/bin/python3`) |
| Read cached values | `openpyxl.load_workbook(path, data_only=True)` |
| Recompute Power Query | **User**, manually in Excel (Data → Refresh All) |
| End-to-end verification | `npx prisma db seed` |

No computer-use, no AppleScript, no MCP automation for Excel itself.

## openpyxl gotchas on this workbook

- **`data_only` matters.** `False` (default) loads formula strings — needed
  for editing without nuking formulas. `True` loads last-cached values —
  needed for reading post-refresh results. You cannot do both at once; open
  twice if you need both views.
- **Styles can be lost.** openpyxl rewrites the file and may drop
  conditional-formatting rules / styles it doesn't fully model. Edit narrow
  ranges; avoid full-sheet rewrites.
- **Power Query metadata is preserved** in `customXml/` — openpyxl passes it
  through untouched. Editing a cell that feeds a query does not break the
  query; it just leaves the cached output stale until the user refreshes.
- **`keep_vba`** — set to `False` unless the workbook has macros (data.xlsx
  doesn't).
- **Saving over an open file** — if the user has the workbook open in Excel,
  `wb.save(path)` will fail or Excel will overwrite the change on its next
  save. Coordinate: either edit before asking the user to open it, or have
  them close the file first.

## Asking the user to refresh — script

Use the absolute path. Be explicit about the steps so the user doesn't have
to ask which button.

```
Please refresh Power Query in Excel:

1. Open: /Users/lucasbic/Lushomo/who_srhr/prisma/data.xlsx
2. Data tab → Refresh All (the leftmost button group; click the icon body,
   not the dropdown caret)
3. Wait for the bottom status bar to return to "Ready" (10–60s for this file)
4. Cmd+S to save in place, then Cmd+W to close
5. Reply here when done.
```

If the user reports a Save-As dialog or "Enable Content" banner, that's a
modal in Excel — they should dismiss it and retry; not your problem to
automate.

## Verification recipes

After the user confirms refresh:

1. **Known sentinel cell** — e.g. a `DateTime.LocalNow()` formula in a hidden
   helper sheet. Read with `data_only=True` before/after and assert it
   advanced.
2. **Row-count delta** — read e.g. `Sheet1!A1:A10000` cached values, count
   non-empty rows, compare to last seed.
3. **Downstream truth** — `npx prisma db seed` and inspect the row counts
   per table from its output. Highest fidelity.

## Editing the M code itself

If you need to change a Power Query (not just its inputs):

1. `data.xlsx` is a zip. M code lives in `customXml/item1.xml`.
2. Unzip → edit → rezip preserving structure. `zipfile` in Python works but
   be careful with file order / metadata; testing required.
3. After editing, hand to the user for refresh as usual.

This is out of scope for routine use; prefer editing the input data when
possible.

## Scope

Project-scoped — lives in `who_srhr/.claude/skills/` and is only available
inside this repo. No MCP dependencies — pure Python + a human at the
keyboard.
