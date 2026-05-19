---
name: excel-powerquery
description: Edit Excel-for-Mac workbooks (e.g. prisma/data.xlsx) with Python/openpyxl, and when Power Query needs to recompute, hand the file path back to the user to refresh manually. Use when the user wants to update cells in a .xlsx, change inputs feeding Power Query, or refresh prisma/data.xlsx.
---

# Excel + Power Query (Python edits + manual refresh)

Two-mode skill:

- **Edit** cells / sheets with Python (`openpyxl`). Headless, scriptable, reproducible.
- **Recompute** Power Query / data connections → **ask the user to do it manually** in Excel. The M engine ships only inside Excel; no Python lib can run it. Give the user the absolute file path and the exact steps.

Do **not** drive Excel via computer-use for this skill. UI automation was unreliable; Python edits + a human click on Refresh All is faster and more honest.

## When to use which mode

| Task | Mode |
|---|---|
| Change a cell value, add a row, write a new sheet | Python |
| Read cached values out of the file | Python |
| Recompute Power Query queries / `$Workbook$` connections | Ask user |
| Verify a refresh happened (read post-refresh values) | Python (after user confirms) |

## Mode A — Edit with Python

1. Use the project's Python: `/Users/lucasbic/miniconda3/bin/python3` (has `openpyxl` 3.1.5).
2. Write a short script under `scripts/` (or inline via `python3 -c`) that:
   - Opens the workbook with `openpyxl.load_workbook(path, keep_vba=False, data_only=False)`.
     - `data_only=False` keeps formulas; use `True` only when reading cached results.
   - Mutates the target cells/sheets.
   - Saves back to the **same path** (`wb.save(path)`).
3. Prefer surgical edits — touch only the cells the task requires. openpyxl can drop styles / conditional formatting it doesn't understand, so don't rewrite whole sheets unless asked.
4. After editing, if the change feeds Power Query, hand off to Mode B.

Default target: `/Users/lucasbic/Lushomo/who_srhr/prisma/data.xlsx`.

## Mode B — Ask the user to refresh

When Power Query must recompute, **stop and message the user** with the absolute path and the exact steps. Do not try to automate this.

Template (adapt the file path):

```
The file needs a Power Query refresh in Excel. Please:

1. Open: /Users/lucasbic/Lushomo/who_srhr/prisma/data.xlsx
2. Data tab → Refresh All
3. Wait for the status bar to return to "Ready"
4. Cmd+S to save, then close
5. Tell me when it's done.
```

Then wait for confirmation before reading values back / proceeding.

## Verification (after user confirms refresh)

Use Python with `data_only=True` to read cached results post-refresh:

```python
from openpyxl import load_workbook
wb = load_workbook("/Users/lucasbic/Lushomo/who_srhr/prisma/data.xlsx", data_only=True)
ws = wb["Sheet1"]
print([[c.value for c in row] for row in ws["A1:C5"]])
```

Or run `npx prisma db seed` and check row counts — highest-fidelity end-to-end check.

State explicitly what you verified.

## Checklist

- [ ] Identified mode: edit (Python) vs. refresh (ask user)
- [ ] Edits done via `openpyxl`, saved in-place
- [ ] If refresh needed: messaged user with absolute path + steps, waited for confirmation
- [ ] Verified post-refresh values via Python (`data_only=True`) or `prisma db seed`

## When this skill is the wrong tool

- Pure read of cached values, no edit, no refresh → just call `openpyxl` directly; no need for this skill.
- Bulk Power Query authoring / M code changes → edit `customXml/item1.xml` inside the .xlsx zip, then ask user to refresh. Outside the default scope here.

See [REFERENCE.md](REFERENCE.md) for openpyxl gotchas and the data.xlsx structure.
