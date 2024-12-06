let
    Source = Excel.CurrentWorkbook(),

    Main_Data = Source{[Name="Main_Data"]}[Content],
    Data_to_load = Source{[Name="Table1"]}[Content],
    KPI_ID = Source{[Name="KPI_ID"]}[Content],
    ContextTable = Source{[Name="Context"]}[Content],
    EnablingEnvironmentTable = Source{[Name="EnablingEnvironment"]}[Content],
    HealthSystemsTable = Source{[Name="HealthSystems"]}[Content],
    ReproductiveHealthTable = Source{[Name="ReproductiveHealth"]}[Content],
    SexualHealthTable = Source{[Name="SexualHealth"]}[Content],
    SRHTable = Source{[Name="SexualAndReproductiveHealth"]}[Content],

    #"Changed Type1" = Table.TransformColumnTypes(Main_Data,{{"Country", type text}, {"Country code", type text}, {"Country income type", type text}, {"KPI Name", type text}, {"KPI Split", type text}, {"Current Year source", type text}, {"Current Year", Int64.Type}, {"Source", type text}, {"load status", type text}, {"Value", type any}, {"Value to use", type number}, {"Value adv", type any}, {"Change", type text}, {"Trend color", type text}}),
    #"Removed Columns" = Table.RemoveColumns(#"Changed Type1",{"load status"}),
    #"Renamed Columns" = Table.RenameColumns(#"Removed Columns",{
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

    #"Added Custom Column kpi_id" = Table.AddColumn(#"Renamed Columns", "kpi_id", each let
        current_kpi_name = [kpi_name],
        matchRow = Table.First(Table.SelectRows(KPI_ID, each [kpi_name] = current_kpi_name))
    in
        if matchRow = null then null else matchRow[kpi_id]),

    #"Added Custom Column kpi_full_name" = Table.AddColumn(#"Added Custom Column kpi_id", "kpi_full_name", each let
          current_kpi_id = [kpi_id],
          matchContext = Table.SelectRows(ContextTable, each [#"Indicator no."] = current_kpi_id),
          resultContext = if Table.IsEmpty(matchContext) then null else matchContext{0}[Heading],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[Heading],

          matchHealthSystems = Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_kpi_id),
          resultHealthSystems = if Table.IsEmpty(matchHealthSystems) then null else matchHealthSystems{0}[Heading],

          matchReproductive = Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultReproductive = if Table.IsEmpty(matchReproductive) then null else matchReproductive{0}[Heading],

          matchSexual = Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultSexual = if Table.IsEmpty(matchSexual) then null else matchSexual{0}[Heading],

          matchSRH = Table.SelectRows(SRHTable, each [#"Indicator no."] = current_kpi_id),
          resultSRH = if Table.IsEmpty(matchSRH) then null else matchSRH{0}[Heading],

          finalResult = 
              if resultContext <> null then resultContext
              else if resultEnabling <> null then resultEnabling
              else if resultHealthSystems <> null then resultHealthSystems
              else if resultReproductive <> null then resultReproductive
              else if resultSexual <> null then resultSexual
              else if resultSRH <> null then resultSRH
              else "Not Found"
      in
          finalResult
    ),

    #"Added Custom Column kpi_subheading" = Table.AddColumn(#"Added Custom Column kpi_full_name", "kpi_subheading", each let
          current_kpi_id = [kpi_id],
          matchContext = Table.SelectRows(ContextTable, each [#"Indicator no."] = current_kpi_id),
          resultContext = if Table.IsEmpty(matchContext) then null else matchContext{0}[Subheading],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[Subheading],

          matchHealthSystems = Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_kpi_id),
          resultHealthSystems = if Table.IsEmpty(matchHealthSystems) then null else matchHealthSystems{0}[Subheading],

          matchReproductive = Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultReproductive = if Table.IsEmpty(matchReproductive) then null else matchReproductive{0}[Subheading],

          matchSexual = Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultSexual = if Table.IsEmpty(matchSexual) then null else matchSexual{0}[Subheading],

          matchSRH = Table.SelectRows(SRHTable, each [#"Indicator no."] = current_kpi_id),
          resultSRH = if Table.IsEmpty(matchSRH) then null else matchSRH{0}[Subheading],

          finalResult = 
              if resultContext <> null then resultContext
              else if resultEnabling <> null then resultEnabling
              else if resultHealthSystems <> null then resultHealthSystems
              else if resultReproductive <> null then resultReproductive
              else if resultSexual <> null then resultSexual
              else if resultSRH <> null then resultSRH
              else ""
      in
          if finalResult = "-" then "" else finalResult
    ),

    #"Added Custom Column domain_id" = Table.AddColumn(#"Added Custom Column kpi_subheading", "domain_id", each let
          current_indicator_id = [kpi_id],
          isMatchContext = not Table.IsEmpty(Table.SelectRows(ContextTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchEnabling = not Table.IsEmpty(Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchHealthSystems = not Table.IsEmpty(Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchReproductive = not Table.IsEmpty(Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchSexual = not Table.IsEmpty(Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchSRH = not Table.IsEmpty(Table.SelectRows(SRHTable, each [#"Indicator no."] = current_indicator_id)),

          domain_id = 
              if isMatchContext then 1
              else if isMatchEnabling then 2
              else if isMatchHealthSystems then 3
              else if isMatchReproductive then 4
              else if isMatchSexual then 5
              else if isMatchSRH then 6
              else "Not Found"
      in
          domain_id
    ),

    #"Added Custom Column has_target" = Table.AddColumn(#"Added Custom Column domain_id", "has_target", each let
          current_kpi_id = [kpi_id],

          matchContext = Table.SelectRows(ContextTable, each [#"Indicator no."] = current_kpi_id),
          resultContext = if Table.IsEmpty(matchContext) then null else matchContext{0}[Target],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[Target],

          matchHealthSystems = Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_kpi_id),
          resultHealthSystems = if Table.IsEmpty(matchHealthSystems) then null else matchHealthSystems{0}[Target],

          matchReproductive = Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultReproductive = if Table.IsEmpty(matchReproductive) then null else matchReproductive{0}[Target],

          matchSexual = Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultSexual = if Table.IsEmpty(matchSexual) then null else matchSexual{0}[Target],

          matchSRH = Table.SelectRows(SRHTable, each [#"Indicator no."] = current_kpi_id),
          resultSRH = if Table.IsEmpty(matchSRH) then null else matchSRH{0}[Target],

          finalResult = 
              if resultContext <> null then resultContext
              else if resultEnabling <> null then resultEnabling
              else if resultHealthSystems <> null then resultHealthSystems
              else if resultReproductive <> null then resultReproductive
              else if resultSexual <> null then resultSexual
              else if resultSRH <> null then resultSRH
              else "Not Found"
      in
          finalResult
    ),
    #"Added Custom Column table_view" = Table.AddColumn(#"Added Custom Column has_target", "table_view", each let
          current_kpi_id = [kpi_id],

          matchContext = Table.SelectRows(ContextTable, each [#"Indicator no."] = current_kpi_id),
          resultContext = if Table.IsEmpty(matchContext) then null else matchContext{0}[Table],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[Table],

          matchHealthSystems = Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_kpi_id),
          resultHealthSystems = if Table.IsEmpty(matchHealthSystems) then null else matchHealthSystems{0}[Table],

          matchReproductive = Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultReproductive = if Table.IsEmpty(matchReproductive) then null else matchReproductive{0}[Table],

          matchSexual = Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultSexual = if Table.IsEmpty(matchSexual) then null else matchSexual{0}[Table],

          matchSRH = Table.SelectRows(SRHTable, each [#"Indicator no."] = current_kpi_id),
          resultSRH = if Table.IsEmpty(matchSRH) then null else matchSRH{0}[Table],

          finalResult = 
              if resultContext <> null then resultContext
              else if resultEnabling <> null then resultEnabling
              else if resultHealthSystems <> null then resultHealthSystems
              else if resultReproductive <> null then resultReproductive
              else if resultSexual <> null then resultSexual
              else if resultSRH <> null then resultSRH
              else "Not Found"
      in
          finalResult
    ),

    #"Added Custom Column map_view" = Table.AddColumn(#"Added Custom Column table_view", "map_view", each let
          current_kpi_id = [kpi_id],

          matchContext = Table.SelectRows(ContextTable, each [#"Indicator no."] = current_kpi_id),
          resultContext = if Table.IsEmpty(matchContext) then null else matchContext{0}[Map],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[Map],

          matchHealthSystems = Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_kpi_id),
          resultHealthSystems = if Table.IsEmpty(matchHealthSystems) then null else matchHealthSystems{0}[Map],

          matchReproductive = Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultReproductive = if Table.IsEmpty(matchReproductive) then null else matchReproductive{0}[Map],

          matchSexual = Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultSexual = if Table.IsEmpty(matchSexual) then null else matchSexual{0}[Map],

          matchSRH = Table.SelectRows(SRHTable, each [#"Indicator no."] = current_kpi_id),
          resultSRH = if Table.IsEmpty(matchSRH) then null else matchSRH{0}[Map],

          finalResult = 
              if resultContext <> null then resultContext
              else if resultEnabling <> null then resultEnabling
              else if resultHealthSystems <> null then resultHealthSystems
              else if resultReproductive <> null then resultReproductive
              else if resultSexual <> null then resultSexual
              else if resultSRH <> null then resultSRH
              else "Not Found"
      in
          finalResult
    ),

    #"Added Custom Column map_type" = Table.AddColumn(#"Added Custom Column map_view", "map_type", each let
          current_kpi_id = [kpi_id],

          matchContext = Table.SelectRows(ContextTable, each [#"Indicator no."] = current_kpi_id),
          resultContext = if Table.IsEmpty(matchContext) then null else matchContext{0}[#"Map type"],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[#"Map type"],

          matchHealthSystems = Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_kpi_id),
          resultHealthSystems = if Table.IsEmpty(matchHealthSystems) then null else matchHealthSystems{0}[#"Map type"],

          matchReproductive = Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultReproductive = if Table.IsEmpty(matchReproductive) then null else matchReproductive{0}[#"Map type"],

          matchSexual = Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultSexual = if Table.IsEmpty(matchSexual) then null else matchSexual{0}[#"Map type"],

          matchSRH = Table.SelectRows(SRHTable, each [#"Indicator no."] = current_kpi_id),
          resultSRH = if Table.IsEmpty(matchSRH) then null else matchSRH{0}[#"Map type"],

          finalResult = 
              if resultContext <> null then resultContext
              else if resultEnabling <> null then resultEnabling
              else if resultHealthSystems <> null then resultHealthSystems
              else if resultReproductive <> null then resultReproductive
              else if resultSexual <> null then resultSexual
              else if resultSRH <> null then resultSRH
              else "Not Found"
      in
          finalResult
    ),

    #"Added Custom Column is_law" = Table.AddColumn(#"Added Custom Column map_type", "is_law", each let
          current_kpi_id = [kpi_id],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[Law],

          finalResult = 
              if resultEnabling <> null then resultEnabling
              else "No"
      in
          finalResult
    ),

    #"Added Custom Column mask" = Table.AddColumn(#"Added Custom Column is_law", "mask", each let
          current_kpi_id = [kpi_id],

          matchContext = Table.SelectRows(ContextTable, each [#"Indicator no."] = current_kpi_id),
          resultContext = if Table.IsEmpty(matchContext) then null else matchContext{0}[#"String mask"],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[#"String mask"],

          matchHealthSystems = Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_kpi_id),
          resultHealthSystems = if Table.IsEmpty(matchHealthSystems) then null else matchHealthSystems{0}[#"String mask"],

          matchReproductive = Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultReproductive = if Table.IsEmpty(matchReproductive) then null else matchReproductive{0}[#"String mask"],

          matchSexual = Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultSexual = if Table.IsEmpty(matchSexual) then null else matchSexual{0}[#"String mask"],

          matchSRH = Table.SelectRows(SRHTable, each [#"Indicator no."] = current_kpi_id),
          resultSRH = if Table.IsEmpty(matchSRH) then null else matchSRH{0}[#"String mask"],

          finalResult = 
              if resultContext <> null then resultContext
              else if resultEnabling <> null then resultEnabling
              else if resultHealthSystems <> null then resultHealthSystems
              else if resultReproductive <> null then resultReproductive
              else if resultSexual <> null then resultSexual
              else if resultSRH <> null then resultSRH
              else ""
      in
          finalResult
    ),

    #"Added Custom Column domain_name" = Table.AddColumn(#"Added Custom Column mask", "domain_name", each let
          current_indicator_id = [kpi_id],
          isMatchContext = not Table.IsEmpty(Table.SelectRows(ContextTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchEnabling = not Table.IsEmpty(Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchHealthSystems = not Table.IsEmpty(Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchReproductive = not Table.IsEmpty(Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchSexual = not Table.IsEmpty(Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_indicator_id)),
          isMatchSRH = not Table.IsEmpty(Table.SelectRows(SRHTable, each [#"Indicator no."] = current_indicator_id)),

          domain_name = 
              if isMatchContext then "Context"
              else if isMatchEnabling then "Enabling Environment"
              else if isMatchHealthSystems then "Health Systems"
              else if isMatchReproductive then "Reproductive Health"
              else if isMatchSexual then "Sexual Health"
              else if isMatchSRH then "Sexual and Reproductive Health"
              else ""
      in
          domain_name
    ),

    #"Added Custom Column kpi_data_type" = Table.AddColumn(#"Added Custom Column domain_name", "kpi_data_type", each let
          current_kpi_id = [kpi_id],

          matchContext = Table.SelectRows(ContextTable, each [#"Indicator no."] = current_kpi_id),
          resultContext = if Table.IsEmpty(matchContext) then null else matchContext{0}[#"Data type"],

          matchEnabling = Table.SelectRows(EnablingEnvironmentTable, each [#"Indicator no."] = current_kpi_id),
          resultEnabling = if Table.IsEmpty(matchEnabling) then null else matchEnabling{0}[#"Data type"],

          matchHealthSystems = Table.SelectRows(HealthSystemsTable, each [#"Indicator no."] = current_kpi_id),
          resultHealthSystems = if Table.IsEmpty(matchHealthSystems) then null else matchHealthSystems{0}[#"Data type"],

          matchReproductive = Table.SelectRows(ReproductiveHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultReproductive = if Table.IsEmpty(matchReproductive) then null else matchReproductive{0}[#"Data type"],

          matchSexual = Table.SelectRows(SexualHealthTable, each [#"Indicator no."] = current_kpi_id),
          resultSexual = if Table.IsEmpty(matchSexual) then null else matchSexual{0}[#"Data type"],

          matchSRH = Table.SelectRows(SRHTable, each [#"Indicator no."] = current_kpi_id),
          resultSRH = if Table.IsEmpty(matchSRH) then null else matchSRH{0}[#"Data type"],

          finalResult = 
              if resultContext <> null then resultContext
              else if resultEnabling <> null then resultEnabling
              else if resultHealthSystems <> null then resultHealthSystems
              else if resultReproductive <> null then resultReproductive
              else if resultSexual <> null then resultSexual
              else if resultSRH <> null then resultSRH
              else "Not Found"
      in
          finalResult
    )

in
    #"Added Custom Column kpi_data_type"
