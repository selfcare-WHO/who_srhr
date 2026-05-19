# Reference — excel-powerquery (computer-use)

## Why drive the UI, not a library

`prisma/data.xlsx` has 16 internal Power Query queries
(`Microsoft.Mashup.OleDb.1`, `$Workbook$`), M code in `customXml/item1.xml`,
14 query tables → sheets. The M engine ships only inside Excel / Power BI.
openpyxl / SheetJS / ClosedXML read **cached** values only — they cannot
recompute. AppleScript via `macos_automator` was the previous approach but
hit permission walls (`-1743`) and silent no-ops on `refresh queryTable` for
several of the workbook's connectors. Clicking **Data → Refresh All** in the
ribbon hits the same code path as Windows `Workbook.RefreshAll`, which is the
known-good full refresh — so we drive Excel through `computer-use`.

## Tools used

| Step | Tool |
|---|---|
| Permission grant | `mcp__computer-use__request_access` (apps: `["Microsoft Excel"]`) |
| Open workbook | Bash: `open -a "Microsoft Excel" <abs path>` |
| Bring Excel forward (if needed) | `mcp__computer-use__open_application` `"Microsoft Excel"` |
| See current state | `mcp__computer-use__screenshot` |
| Click ribbon / cells | `mcp__computer-use__left_click` (coords from screenshot) |
| Type into Name Box / dialogs | `mcp__computer-use__type` |
| Keyboard shortcuts | `mcp__computer-use__key` (`cmd+s`, `cmd+c`, `cmd+w`, `return`) |
| Polling wait | `mcp__computer-use__wait` |
| Read selected range | `mcp__computer-use__read_clipboard` after `cmd+c` |

Excel is **tier "full"** — no restrictions on typing or clicks. (Contrast: the
Chrome MCP is tier "read" for browsers, IDEs are tier "click".)

## Ribbon layout cues (Excel for Mac 16.x)

The Refresh button lives on the **Data** tab, leftmost button group:

```
[ Data ▼ ]   ⟨ribbon body⟩
              [Refresh][▾]   [Get Data] [From Text/CSV] ...
                ^icon ^caret
```

- **Click the icon body** to refresh all queries.
- **Click the caret** to get a menu (Refresh, Refresh All, Connection
  Properties…). If you accidentally hit the caret, press `escape` and retry.
- The label under the icon reads "Refresh" not "Refresh All" — the icon
  defaults to refresh-all behaviour anyway when Power Query is present.

If the screenshot shows the ribbon collapsed, click the Data tab label once
to expand it before locating the button.

## Detecting refresh completion

The bottom status bar is the source of truth:

- **Active**: `Calculating: (n%)` or `Running background query…`
- **Done**: `Ready` (or the cell-mode indicator)

Poll: `screenshot` → check status bar text → `wait 2s` → repeat. Cap at
~120s. `data.xlsx` typically finishes in 10–60s.

If the status bar shows `Ready` but a known output cell is empty / unchanged,
a connector silently no-op'd — see verification in `SKILL.md`.

## Reading values via clipboard

After `cmd+c` on a selected range, the clipboard holds:

- **Rows separated by `\n`**
- **Columns separated by `\t`**
- Cell text matches the displayed format (date strings, percent signs, etc.)
  — not the underlying number. For raw numbers, format the range as General
  before copying.

`read_clipboard` returns the raw string; split on `\n` then `\t`.

## Modal dismissal

After `open -a "Microsoft Excel" …`, the first screenshot may show:

| Modal | Action |
|---|---|
| "Document recovery" panel | Click **Close** to skip recovery |
| "This workbook contains external links" | Click **Don't Update** for refresh-from-source workflows; **Update** is rarely what you want here since PQ handles its own connections |
| "Enable Content" yellow banner | Click **Enable Content** |
| "Sign in to your account" | Click **Maybe Later** or close — Power Query for `$Workbook$` connections does not need an account |

Always screenshot **after** dismissing to confirm the modal is gone before
proceeding.

## Known gotchas

- **Window must be visible.** Excel rendered off-screen (other Space, minimised)
  will fail clicks silently. Use `open_application "Microsoft Excel"` to bring
  it forward before screenshotting.
- **Locale.** Ribbon labels are localised. If the user runs Excel in non-English,
  identify buttons by position, not OCR'd text.
- **AutoSave to OneDrive.** If `data.xlsx` is in a OneDrive folder, AutoSave
  may interleave with the refresh. Toggle AutoSave off (top-left switch) once
  per session.
- **Save-As dialog after cmd+s.** Means the file was opened read-only — the
  workbook is checked out by another user, sitting in a locked dir, or Excel
  is in "Protected View." Stop and report; do **not** save under a new name.
- **Caret vs. icon click on Refresh.** The button is split. Hitting the caret
  opens a dropdown and your subsequent screenshot/click logic will be off
  until the menu is dismissed.

## Verification recipes

After refresh, pick the cheapest verification that actually proves the data
changed:

1. **Known sentinel cell** — pick a cell whose value changes on each refresh
   (e.g. a `DateTime.LocalNow()` formula in a hidden helper sheet). Read it
   before and after; assert it advanced.
2. **Row-count delta** — read e.g. `Sheet1!A1:A10000` and count non-empty
   rows; compare to last seed.
3. **Downstream truth** — `npx prisma db seed` and inspect the row counts
   per table from its output. This is the highest-fidelity check because it
   proves the Excel → DB pipeline still works end-to-end.

## Scope

This skill is **project-scoped** — it lives in `who_srhr/.claude/skills/` and
is only available inside this repo. The `computer-use` MCP it depends on is
user-global, not project-scoped (unlike the previous `macos_automator` MCP in
`.mcp.json`, which is now unused by this skill but kept around in case other
workflows still need it).
