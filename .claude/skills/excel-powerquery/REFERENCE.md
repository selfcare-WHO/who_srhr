# Reference — excel-powerquery

## Why AppleScript, not a library

`prisma/data.xlsx` has 16 internal Power Query queries (`Microsoft.Mashup.OleDb.1`,
`$Workbook$`), M code in `customXml/item1.xml`, 14 query tables → sheets. The M
engine ships only inside Excel/Power BI. openpyxl/SheetJS/ClosedXML read **cached**
values only — they cannot recompute. So we drive real Excel for Mac via AppleScript
through the `macos_automator` MCP.

## Calling the scripts via macos_automator MCP

The MCP `execute_script` tool runs a script by path and passes `arguments` to the
AppleScript `on run argv` handler:

- `scriptPath`: `.claude/skills/excel-powerquery/scripts/refresh.applescript`
- `arguments`: `["/Users/lucasbic/Lushomo/who_srhr/prisma/data.xlsx"]`

Paths must be absolute POSIX. Relative paths fail (Excel resolves CWD unpredictably).

## AppleScript verb map (Excel for Mac 16.x)

| Goal | AppleScript |
|---|---|
| Open | `open (POSIX file p)` then `set wb to active workbook` |
| Refresh a query table | `refresh queryTable` |
| Table→query | `refresh (query table of listObject)` |
| Pivot cache | `refresh pivotCache` |
| Full recalc | `calculate` |
| Save in place | `save wb` |
| Close no prompt | `close wb saving no` |
| Read range | `value of (range "A1:C5" of worksheet "Sheet1" of wb)` |

No `do Visual Basic` on Mac Excel — arbitrary VBA strings can't be executed via
AppleScript. `run VB macro "Name"` works only if the macro exists in an open
`.xlsm`/add-in (see controller fallback).

## Error codes

| Code | Meaning | Fix |
|---|---|---|
| `-1743` | Not authorized to send Apple events to Excel | Grant Automation permission to terminal/Node; first run also pops a one-time OS dialog — allow it |
| `-1728` | Object not found (e.g. no query tables on sheet) | Already guarded with `try`; benign |
| `-600` / `-609` | Excel not running / connection invalidated | Ensure Excel installed; script `activate`s it |
| Hang on open | Workbook prompting (recovery/links) | Open once manually, dismiss prompts, retry |

## Mac Power Query limitations

Mac Excel refreshes workbook-internal (`$Workbook$`) queries — the case `data.xlsx`
uses — but **silently no-ops** unsupported external connectors. There is no Power
Query editor on Mac. This is why verification is mandatory: read a known output
range or run `npx prisma db seed` and confirm clean ingestion + sane values.

`refresh.applescript` enumerates query tables / list objects / pivot caches. That
covers sheet-loaded queries; connection-only upstream queries (e.g. `KPI_ID`) are
recomputed transitively by the Mashup engine when a dependent loaded query refreshes.

## Full-fidelity fallback: `.xlsm` controller (one-time, manual)

For guaranteed dependency-ordered `ActiveWorkbook.RefreshAll`:

1. In Excel for Mac, create a new macro-enabled workbook saved at
   `~/.who_srhr_refresh_controller.xlsm`.
2. Add a module with:
   ```vba
   Sub RefreshTarget()
       Dim wb As Workbook
       Set wb = Workbooks.Open("/Users/lucasbic/Lushomo/who_srhr/prisma/data.xlsx")
       wb.RefreshAll
       Application.CalculateUntilAsyncQueriesDone
       wb.Save
       wb.Close SaveChanges:=False
   End Sub
   ```
3. Trust VBA: Excel → Settings → Security → enable macros.
4. Run via macos_automator with this inline AppleScript:
   ```applescript
   tell application "Microsoft Excel"
       activate
       open (POSIX file "/Users/lucasbic/.who_srhr_refresh_controller.xlsm")
       run VB macro "RefreshTarget"
   end tell
   ```

This routes through Excel's real `RefreshAll`, the same code path as the Windows
`sbroenne` MCP, but stays Mac-native. Still verify the result.

## Scope

This skill is **project-scoped** — it lives in `who_srhr/.claude/skills/` and is
only available inside this repo. The `macos_automator` MCP it depends on is
likewise project-scoped via `who_srhr/.mcp.json`.
