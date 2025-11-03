let
    Source = Excel.CurrentWorkbook(){[Name="Table7"]}[Content],
  #"Removed top rows" = Table.Skip(Source, 1),
  #"Promoted headers" = Table.PromoteHeaders(#"Removed top rows", [PromoteAllScalars = true]),
  #"Filtered rows" = Table.SelectRows(#"Promoted headers", each ([Column1] <> null and [Column1] <> "Country")),
  #"Unpivoted other columns" = Table.UnpivotOtherColumns(#"Filtered rows", {"Column1", "Column2"}, "Attribute", "Value"),
  #"Changed column type" = Table.TransformColumnTypes(#"Unpivoted other columns", {{"Attribute", Int64.Type}}),
  #"Renamed columns" = Table.RenameColumns(#"Changed column type", {{"Value", "Target coding"}, {"Column1", "Country"}, {"Column2", "Country code"}}),
  #"Merged queries" = Table.NestedJoin(#"Renamed columns", {"Attribute"}, #"Target coding KPI", {"Attribute"}, "Target coding KPI", JoinKind.LeftOuter),
  #"Expanded Target coding KPI" = Table.ExpandTableColumn(#"Merged queries", "Target coding KPI", {"Value"}, {"Target coding KPI.Value"}),
  #"Renamed columns 1" = Table.RenameColumns(#"Expanded Target coding KPI", {{"Target coding KPI.Value", "KPI"}}),
  #"Merged queries 1" = Table.NestedJoin(#"Renamed columns 1", {"Attribute"}, #"Target coding Split", {"Attribute"}, "Target coding Split", JoinKind.LeftOuter),
  #"Expanded Target coding Split" = Table.ExpandTableColumn(#"Merged queries 1", "Target coding Split", {"Value"}, {"Value"}),
  #"Renamed columns 2" = Table.RenameColumns(#"Expanded Target coding Split", {{"Value", "Split"}}),
  #"Sorted rows" = Table.Sort(#"Renamed columns 2", {{"Attribute", Order.Ascending}}),
  #"Reordered columns" = Table.ReorderColumns(#"Sorted rows", {"Country", "Country code", "KPI", "Split", "Attribute", "Target coding"}),
  #"Inserted conditional column" = Table.AddColumn(#"Reordered columns", "Target color", each if [Target coding] = 1 then "Achieved" else if [Target coding] = 2 then "Challenges remain" else if [Target coding] = 3 then "Major challenges remain" else if [Target coding] = 0 then "No target" else if [Target coding] = 9 then "Data not available" else "")
in
    #"Inserted conditional column"
