-- CreateTable
CREATE TABLE "indicators" (
    "kpi_id" TEXT NOT NULL PRIMARY KEY,
    "kpi_name" TEXT NOT NULL,
    "kpi_full_name" TEXT NOT NULL,
    "kpi_subheading" TEXT,
    "kpi_data_type" TEXT NOT NULL,
    "has_target" BOOLEAN NOT NULL DEFAULT false,
    "mask" TEXT,
    "is_law" BOOLEAN NOT NULL DEFAULT false,
    "translate_value" TEXT,
    "kpi_domain_id" INTEGER NOT NULL,
    "table_view" BOOLEAN NOT NULL DEFAULT false,
    "chart_view" BOOLEAN NOT NULL DEFAULT false,
    "map_view" BOOLEAN NOT NULL DEFAULT false,
    "map_type" TEXT,
    CONSTRAINT "indicators_kpi_domain_id_fkey" FOREIGN KEY ("kpi_domain_id") REFERENCES "domains" ("domain_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "domains" (
    "domain_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Subgroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kpi_subgroup" TEXT NOT NULL,
    "kpi_subgroup_full" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "data_points" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "indicatorId" TEXT NOT NULL,
    "subgroupId" INTEGER,
    "countryId" INTEGER NOT NULL,
    "current_year_source" TEXT,
    "current_year" INTEGER,
    "source" TEXT,
    "original_value" TEXT,
    "value_to_use" TEXT,
    "value" TEXT,
    "change" TEXT,
    "trend_color" TEXT,
    CONSTRAINT "data_points_indicatorId_fkey" FOREIGN KEY ("indicatorId") REFERENCES "indicators" ("kpi_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "data_points_subgroupId_fkey" FOREIGN KEY ("subgroupId") REFERENCES "Subgroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "data_points_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "countries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "country" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "country_income_type" TEXT
);

-- CreateTable
CREATE TABLE "_IndicatorToSubgroup" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_IndicatorToSubgroup_A_fkey" FOREIGN KEY ("A") REFERENCES "indicators" ("kpi_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_IndicatorToSubgroup_B_fkey" FOREIGN KEY ("B") REFERENCES "Subgroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "indicators_kpi_name_key" ON "indicators"("kpi_name");

-- CreateIndex
CREATE UNIQUE INDEX "domains_domain_name_key" ON "domains"("domain_name");

-- CreateIndex
CREATE UNIQUE INDEX "Subgroup_kpi_subgroup_key" ON "Subgroup"("kpi_subgroup");

-- CreateIndex
CREATE UNIQUE INDEX "Subgroup_kpi_subgroup_full_key" ON "Subgroup"("kpi_subgroup_full");

-- CreateIndex
CREATE INDEX "data_points_indicatorId_idx" ON "data_points"("indicatorId");

-- CreateIndex
CREATE INDEX "data_points_countryId_idx" ON "data_points"("countryId");

-- CreateIndex
CREATE INDEX "data_points_indicatorId_countryId_idx" ON "data_points"("indicatorId", "countryId");

-- CreateIndex
CREATE UNIQUE INDEX "countries_country_key" ON "countries"("country");

-- CreateIndex
CREATE UNIQUE INDEX "countries_country_code_key" ON "countries"("country_code");

-- CreateIndex
CREATE UNIQUE INDEX "_IndicatorToSubgroup_AB_unique" ON "_IndicatorToSubgroup"("A", "B");

-- CreateIndex
CREATE INDEX "_IndicatorToSubgroup_B_index" ON "_IndicatorToSubgroup"("B");
