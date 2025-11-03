let
    Source = Excel.CurrentWorkbook(){[Name="Table7"]}[Content],
  #"Removed top rows" = Table.Skip(Source, 1),
  #"Promoted headers" = Table.PromoteHeaders(#"Removed top rows", [PromoteAllScalars = true]),
  #"Filtered rows" = Table.SelectRows(#"Promoted headers", each [Column1] = "Country"),
  #"Unpivoted other columns" = Table.UnpivotOtherColumns(#"Filtered rows", {"Column1", "Column2"}, "Attribute", "Value"),
  #"Changed column type" = Table.TransformColumnTypes(#"Unpivoted other columns", {{"Attribute", Int64.Type}}),
  #"Sorted rows" = Table.Sort(#"Changed column type", {{"Attribute", Order.Ascending}}),
  #"Removed columns" = Table.RemoveColumns(#"Sorted rows", {"Column2", "Column1"})
in
    #"Removed columns"
