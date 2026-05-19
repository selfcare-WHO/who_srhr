---
name: excel-powerquery
description: Refresh/recompute Power Query in Excel-for-Mac workbooks and read cells back, driving real Excel via the macos_automator MCP (AppleScript). Use when the user wants to refresh prisma/data.xlsx, recompute Power Query / data connections, run an Excel refresh on macOS, or read values out of an .xlsx after a query refresh.
---

# Excel + Power Query (macOS, via macos_automator MCP)

Drives **Excel for Mac** through the project-scoped `macos_automator` MCP server.
No pure library can run the Power Query (M) engine — only real Excel can. This
skill opens the workbook, refreshes every query, recalculates, saves, and can
read ranges back.

## Preconditions (verify first, do not skip)

1. `macos_automator` MCP connected (`.mcp.json` at repo root; needs Claude Code restart + project trust).
2. macOS **Automation** permission granted to the terminal/Node process for Microsoft Excel
   (System Settings → Privacy & Security → Automation). Without it every script fails silently/with `-1743`.
3. Excel for Mac installed. The target file defaults to `prisma/data.xlsx` (16 internal Power Query queries).

If a script returns error `-1743` → permission not granted: stop and tell the user to grant it.

## Quick start — refresh data.xlsx

Call the `macos_automator` MCP `execute_script` tool with `scriptPath` pointing at the
bundled script and the workbook path as argument:

- script: `.claude/skills/excel-powerquery/scripts/refresh.applescript`
- argument 1: absolute POSIX path, e.g. `/Users/lucasbic/Lushomo/who_srhr/prisma/data.xlsx`

The script: opens (hidden), refreshes all query tables + list objects + pivot caches,
forces full recalculation, saves in place, closes. Returns a one-line summary
(`refreshed N query tables; calc done; saved`).

## Mandatory verification (Mac PQ refresh is best-effort)

Never report success on the script's word alone. After refreshing:

1. Read back a known output cell/range with `scripts/read-range.applescript`
   (args: file path, sheet name, range e.g. `A1:C5`) and sanity-check values.
2. Or re-run the downstream consumer: `npx prisma db seed` and confirm it ingests cleanly.

State explicitly what you verified and the observed values. If a query's
connector is unsupported on Mac Excel, refresh silently no-ops — only
verification catches this.

## Reading values without refreshing

Use `scripts/read-range.applescript` directly (file, sheet, range) for read-only
extraction of current cached values — no Excel recompute, fast.

## Workflow checklist

- [ ] Preconditions confirmed (MCP up, Automation permission, Excel installed)
- [ ] Workbook path is absolute POSIX
- [ ] Run `refresh.applescript`
- [ ] Verify via read-range or `prisma db seed`
- [ ] Report: queries refreshed, cells verified, observed values

## Limits & fallback

`refresh.applescript` refreshes enumerable query tables/connections — covers the
sheet-loaded queries. For guaranteed `ActiveWorkbook.RefreshAll` fidelity (true
dependency-ordered full refresh), use the one-time `.xlsm` controller recipe in
[REFERENCE.md](REFERENCE.md). REFERENCE.md also has the AppleScript verb map,
error codes, and troubleshooting.
