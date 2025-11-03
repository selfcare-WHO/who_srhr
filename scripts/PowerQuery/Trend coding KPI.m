let
    Source = Excel.CurrentWorkbook(){[Name="Table8"]}[Content],
  #"Removed top rows" = Table.Skip(Source, 1),
  #"Promoted headers" = Table.PromoteHeaders(#"Removed top rows", [PromoteAllScalars = true]),
  #"Filtered rows" = Table.SelectRows(#"Promoted headers", each ([Column1] = null)),
  #"Removed top rows 1" = Table.Skip(#"Filtered rows", 1),
  #"Unpivoted other columns" = Table.UnpivotOtherColumns(#"Removed top rows 1", {"Column1", "1"}, "Attribute", "Value"),
  #"Changed column type" = Table.TransformColumnTypes(#"Unpivoted other columns", {{"Attribute", Int64.Type}}),
  #"Sorted rows" = Table.Sort(#"Changed column type", {{"Attribute", Order.Ascending}}),
  #"Removed columns" = Table.RemoveColumns(#"Sorted rows", {"1", "Column1"})
in
    #"Removed columns"
