// ============================================================================
// WHO SRHR Data Comparison - Power Query Script
// ============================================================================
//
// IMPORTANT: This file is stored in the repository for reference only.
//
// The actual query is embedded within the Excel workbook (prisma/data.xlsx)
// and should be modified using Excel's Power Query Editor interface.
//
// To access and edit this query in Excel:
// 1. Open prisma/data.xlsx
// 2. Go to Data tab > Get Data > Launch Power Query Editor
// 3. Select the "Comparison data" query
// 4. Make your modifications in the Advanced Editor
// 5. Click "Close & Load" to apply changes
//
// This script transforms raw data from multiple Excel sheets into the
// "Comparison data" sheet format required by the database seeding process.
//
// It performs the following operations:
// - Merges data from Main_Data, KPI_ID, KPI_details, and KPI_subgroups
// - Standardizes column names and types
// - Integrates endnote information
// - Applies data transformations for database compatibility
//
// After making changes to this query in Excel, you should:
// 1. Copy the updated M code to this file for version control
// 2. Re-run the database seed: npx prisma db seed
//
// ============================================================================

let
    Source = Excel.CurrentWorkbook(),
    Main_Data = Source{[Name="Main_Data"]}[Content],
    Data_to_load = Source{[Name="Table1"]}[Content],
    KPI_ID = Source{[Name="KPI_ID"]}[Content],
    KPI_subgroups = Source{[Name="KPI_subgroups"]}[Content],
    AllDomains = Source{[Name="KPI_details"]}[Content],
    Endnote = Source{[Name="Endnote_to_load"]}[Content],

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
        {"Heading", "Subheading", "Target", "Table", "Map", "Map type", "Law", "String mask", "Data type", "Domain", "Domain ID", "Translate value", "Display value" },
        {"kpi_full_name", "kpi_subheading", "has_target", "table_view", "map_view", "map_type", "is_law", "mask", "kpi_data_type", "domain_name", "domain_id", "translate_value", "display_value" }),

    // Merge with KPI_subgroups to get kpi_subgroup_full
    #"Merged with KPI_subgroups" = Table.NestedJoin(
        #"Expanded AllDomains",
        {"kpi_name", "kpi_subgroup" },
        KPI_subgroups_Typed,
        {"kpi_name", "kpi_subgroup" },
        "KPI_subgroups",
        JoinKind.LeftOuter
    ),

    #"Expanded KPI_subgroups" = Table.ExpandTableColumn(#"Merged with KPI_subgroups", "KPI_subgroups", {"kpi_subgroup_full" , "invert_scale" }, {"kpi_subgroup_full", "invert_scale" }),
    #"Filtered Rows" = Table.SelectRows(#"Expanded KPI_subgroups", each true),

    // Ensure join column types match
    #"Typed Join Columns" = Table.TransformColumnTypes(#"Filtered Rows", {{"kpi_id", type text}, {"country", type text}}),

    // Ensure Endnote join columns are text
    Endnote_Typed = Table.TransformColumnTypes(Endnote, {{"Key", type text}, {"Country", type text}}),

    // Merge with Endnote
    #"Merged with Endnote" = Table.NestedJoin(#"Typed Join Columns", {"kpi_id", "country"}, Endnote_Typed, {"Key", "Country"}, "endnote", JoinKind.LeftOuter),
    #"Expanded Endnote" = Table.ExpandTableColumn(#"Merged with Endnote", "endnote", {"Value"}, {"endnote"})
in
    #"Expanded Endnote"
