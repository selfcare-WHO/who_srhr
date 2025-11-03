let
    Source = Excel.CurrentWorkbook(){[Name="Table8"]}[Content],
  #"Removed top rows" = Table.Skip(Source, 1),
  #"Promoted headers" = Table.PromoteHeaders(#"Removed top rows", [PromoteAllScalars = true]),
  #"Filtered rows" = Table.SelectRows(#"Promoted headers", each ([Column1] <> null and [Column1] <> "Country name")),
  #"Replaced value" = Table.ReplaceValue(#"Filtered rows", null, 0, Replacer.ReplaceValue, {"2", "3", "4", "7", "8", "9", "10"}),
  #"Unpivoted other columns" = Table.UnpivotOtherColumns(#"Replaced value", {"Column1", "1"}, "Attribute", "Value"),
  #"Changed column type" = Table.TransformColumnTypes(#"Unpivoted other columns", {{"Attribute", Int64.Type}}),
  #"Renamed columns" = Table.RenameColumns(#"Changed column type", {{"Value", "Trend coding"}, {"1", "Country code"}, {"Column1", "Country"}}),
  #"Merged queries" = Table.NestedJoin(#"Renamed columns", {"Attribute"}, #"Trend coding KPI", {"Attribute"}, "Trend coding KPI", JoinKind.LeftOuter),
  #"Expanded Target coding KPI" = Table.ExpandTableColumn(#"Merged queries", "Trend coding KPI", {"Value"}, {"Trend coding KPI.Value"}),
  #"Renamed columns 1" = Table.RenameColumns(#"Expanded Target coding KPI", {{"Trend coding KPI.Value", "KPI"}}),
  #"Merged queries 1" = Table.NestedJoin(#"Renamed columns 1", {"Attribute"}, #"Trend coding Split", {"Attribute"}, "Trend coding Split", JoinKind.LeftOuter),
  #"Expanded Target coding Split" = Table.ExpandTableColumn(#"Merged queries 1", "Trend coding Split", {"Value"}, {"Value"}),
  #"Renamed columns 2" = Table.RenameColumns(#"Expanded Target coding Split", {{"Value", "Split"}}),
  #"Sorted rows" = Table.Sort(#"Renamed columns 2", {{"Attribute", Order.Ascending}}),
  #"Reordered columns" = Table.ReorderColumns(#"Sorted rows", {"Country", "Country code", "KPI", "Split", "Attribute", "Trend coding"}),
  #"Inserted conditional column" = Table.AddColumn(#"Reordered columns", "Trend color", each if [Trend coding] = 1 then "Increased" else if [Trend coding] = 2 then "No Change" else if [Trend coding] = 3 then "Decreased" else if [Trend coding] = 0 then "No Data" else if [Trend coding] = 9 then "No Data" else "")
in
    #"Inserted conditional column"
