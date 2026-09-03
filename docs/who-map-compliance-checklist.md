# WHO map compliance checklist

Source: Jon Hopkins (WHO), 27 Jul 2026 — thread "Map on SRHR Dashboard - changes/updates needed".
Audit of https://srhrdashboard.org maps against the WHO map SOP (section refs below).

A ticked box means implemented and covered by a named assertion in
`tests/map-visual.spec.ts` — not that WHO have signed it off.

Compliant base files from WHO GIS (Admin 0 GeoJSON + ArcGIS Pro / QGIS templates with legal-approved
disputed-border symbology): https://drive.google.com/drive/folders/1yyQIbVMeaIVUp762-ANM5jU6fVNtbMfI

## Disputed areas

Borders are broadly correct; these are the gaps.

- [x] **Kosovo** — missing dotted line border (SOP 2.2.2)
- [x] **Sudan / Egypt** — missing the straight solid line; only the dashed line renders (2.2.3)
- [x] **South Sudan / Kenya** — missing the dashed line; only the straight solid line renders (2.2.4)
- [x] **Kashmir / Aksai Chin** — missing the dotted line within the disputed area; Aksai Chin not shown correctly (2.2.7)
- [x] **Arunachal Pradesh** — missing the solid line marking it out (2.2.8)
- [x] **Israel / Palestine** — remove the blanked-out Golan Heights; the SOP does not appear to require it (2.2.6)

## Map content

- [x] **Great lakes of the world** — must show on a global map, currently missing (2.3)
- [x] **Legend: "Not applicable"** — add the entry in dark grey (applies to Western Sahara, Jammu and Kashmir,
      Abyei area). These already render dark grey on the map; only the legend entry and matching colour are missing (2.4)

## Attribution

Jon's suggestion: place these below the map, as on the
[GHO maternal mortality page](https://www.who.int/data/gho/data/themes/topics/sdg-target-3-1-maternal-mortality).

- [x] **WHO map disclaimer** (2.5) — verbatim text:

  > The designations employed and the presentation of the material in this publication do not imply the
  > expression of any opinion whatsoever on the part of WHO concerning the legal status of any country,
  > territory, city or area or of its authorities, or concerning the delimitation of its frontiers or
  > boundaries. Dotted and dashed lines on maps represent approximate border lines for which there may not
  > yet be full agreement.

- [x] **WHO logo and copyright**

## Optional

- [x] **Scale bar** — "recommended but not essential"; Jon asked how easy this would be to do

## Related

- Map button removed from srhrdashboard.org on 4 Aug 2026 while these fixes are made, per Jon's suggestion
  to break the link from the dashboard and the WHO website.
