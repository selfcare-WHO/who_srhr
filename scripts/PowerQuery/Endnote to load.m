let
  Source = Excel.CurrentWorkbook(){[Name="Table19"]}[Content],
  EndnoteColumns = List.Select(Table.ColumnNames(Source), each Text.StartsWith(_, "endnotes_")),
  #"Replaced errors" = Table.ReplaceErrorValues(Source, List.Transform(EndnoteColumns, each {_, null})),
  #"Converted to text" = Table.TransformColumnTypes(#"Replaced errors", List.Transform(EndnoteColumns, each {_, type text})),
  #"Replaced value" = Table.ReplaceValue(#"Converted to text", null, " ", Replacer.ReplaceValue, EndnoteColumns),
  #"Unpivoted other columns" = Table.UnpivotOtherColumns(#"Replaced value", {"Country"}, "Attribute", "Value"),
  #"Changed column type" = Table.TransformColumnTypes(#"Unpivoted other columns", {{"Value", type text}}),
  #"Inserted conditional column" = Table.AddColumn(#"Changed column type", "year sign", each if [Value] = " " then "" else ", "),
  #"Merged queries" = Table.NestedJoin(#"Inserted conditional column", {"Attribute"}, #"Endnote base", {"Key"}, "Endnote base", JoinKind.LeftOuter),
  #"Expanded Endnote base" = Table.ExpandTableColumn(#"Merged queries", "Endnote base", {"Value"}, {"Value.1"}),
  #"Split column by delimiter" = Table.SplitColumn(#"Expanded Endnote base", "Attribute", Splitter.SplitTextByDelimiter("_"), {"Attribute.1", "Attribute.2"}),
  #"Changed column type 1" = Table.TransformColumnTypes(#"Split column by delimiter", {{"Attribute.1", type text}, {"Attribute.2", type text}}),
  #"Removed columns" = Table.RemoveColumns(#"Changed column type 1", {"Attribute.1"}),
  #"Renamed columns" = Table.RenameColumns(#"Removed columns", {{"Attribute.2", "Key"}, {"Value", "year"}}),
  #"Inserted merged column" = Table.AddColumn(#"Renamed columns", "Merged", each Text.Combine({[year], Text.From([year sign]), Text.From([Value.1])}, ""), type text),
  #"Renamed columns 1" = Table.RenameColumns(#"Inserted merged column", {{"Merged", "Value"}}),
  #"Removed columns 1" = Table.RemoveColumns(#"Renamed columns 1", {"year", "year sign", "Value.1"})
in
  #"Removed columns 1"
