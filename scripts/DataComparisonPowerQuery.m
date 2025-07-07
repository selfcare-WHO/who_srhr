let
    Source = Excel.CurrentWorkbook(),
    Main_Data = Source{[Name="Main_Data"]}[Content],
    Data_to_load = Source{[Name="Table1"]}[Content],
    KPI_ID = Source{[Name="KPI_ID"]}[Content],
    KPI_subgroups = Source{[Name="KPI_subgroups"]}[Content],
    AllDomains = Source{[Name="KPI_details"]}[Content], // Single combined dimension table

    // Convert columns to text where necessary
    KPI_subgroups_Typed = Table.TransformColumnTypes(KPI_subgroups, {{"kpi_subgroup", type text}}),

    // Prepare Main Data
    #"Changed Type1" = Table.TransformColumnTypes(Main_Data, {
        {"Country", type text},
        {"Country code", type text},
        {"Country income type", type text},
        {"KPI Name", type text},
        {"KPI Split", type text},
        {"Current Year source", type text},
        {"Current Year", Int64.Type},
        {"Source", type text},
        {"load status", type text},
        {"Value", type any},
        {"Value to use", type number},
        {"Value adv", type any},
        {"Change", type text},
        {"Trend color", type text}
    }),
    #"Removed Columns" = Table.RemoveColumns(#"Changed Type1", {"load status"}),
    #"Renamed Columns" = Table.RenameColumns(#"Removed Columns", {
        {"Country", "country"},
        {"Country code", "country_code"},
        {"Country income type", "country_income_type"},
        {"KPI Name", "kpi_name"},
        {"KPI Split", "kpi_subgroup"},
        {"Current Year source", "current_year_source"},
        {"Current Year", "current_year"},
        {"Source", "source"},
        {"Value", "original_value"},
        {"Value to use", "value_to_use"},
        {"Value adv", "value"},
        {"Change", "change"},
        {"Trend color", "trend_color"}
    }),
    #"Main Data Typed" = Table.TransformColumnTypes(#"Renamed Columns", {{"kpi_subgroup", type text}}),

    // Merge to get kpi_id
    #"Merged with KPI_ID" = Table.NestedJoin(#"Main Data Typed", {"kpi_name"}, KPI_ID, {"kpi_name"}, "KPI_ID", JoinKind.LeftOuter),
    #"Expanded KPI_ID" = Table.ExpandTableColumn(#"Merged with KPI_ID", "KPI_ID", {"kpi_id"}, {"kpi_id"}),

    // Merge with AllDomains to get all domain-related info
    #"Merged with AllDomains" = Table.NestedJoin(#"Expanded KPI_ID", {"kpi_id"}, AllDomains, {"Indicator no."}, "AllDomains", JoinKind.LeftOuter),
    #"Expanded AllDomains" = Table.ExpandTableColumn(#"Merged with AllDomains", "AllDomains",
        {"Heading", "Subheading", "Target", "Table", "Map", "Map type", "Law", "String mask", "Data type", "Domain", "Domain ID", "Translate value", "Display value", "Invert scale"},
        {"kpi_full_name", "kpi_subheading", "has_target", "table_view", "map_view", "map_type", "is_law", "mask", "kpi_data_type", "domain_name", "domain_id", "translate_value", "display_value", "invert_scale"}),

    // Merge with KPI_subgroups to get kpi_subgroup_full
    #"Merged with KPI_subgroups" = Table.NestedJoin(
        #"Expanded AllDomains",
        {"kpi_name", "kpi_subgroup"},   // List both columns from the main table
        KPI_subgroups_Typed,
        {"kpi_name", "kpi_subgroup"},   // Matching columns from the KPI_subgroups table
        "KPI_subgroups",
        JoinKind.LeftOuter
    ),

    #"Expanded KPI_subgroups" = Table.ExpandTableColumn(#"Merged with KPI_subgroups", "KPI_subgroups", {"kpi_subgroup_full"}, {"kpi_subgroup_full"}),
    #"Filtered Rows" = Table.SelectRows(#"Expanded KPI_subgroups", each true)
in
     #"Filtered Rows"
