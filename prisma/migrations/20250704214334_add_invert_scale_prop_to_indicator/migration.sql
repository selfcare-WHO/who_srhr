-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_indicators" (
    "kpi_id" TEXT NOT NULL PRIMARY KEY,
    "kpi_name" TEXT NOT NULL,
    "kpi_full_name" TEXT NOT NULL,
    "kpi_subheading" TEXT,
    "kpi_data_type" TEXT NOT NULL,
    "has_target" BOOLEAN NOT NULL DEFAULT false,
    "mask" TEXT,
    "is_law" BOOLEAN NOT NULL DEFAULT false,
    "translate_value" TEXT,
    "display_value" TEXT,
    "kpi_domain_id" INTEGER NOT NULL,
    "table_view" BOOLEAN NOT NULL DEFAULT false,
    "chart_view" BOOLEAN NOT NULL DEFAULT false,
    "map_view" BOOLEAN NOT NULL DEFAULT false,
    "map_type" TEXT,
    "invert_scale" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "indicators_kpi_domain_id_fkey" FOREIGN KEY ("kpi_domain_id") REFERENCES "domains" ("domain_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_indicators" ("chart_view", "display_value", "has_target", "is_law", "kpi_data_type", "kpi_domain_id", "kpi_full_name", "kpi_id", "kpi_name", "kpi_subheading", "map_type", "map_view", "mask", "table_view", "translate_value") SELECT "chart_view", "display_value", "has_target", "is_law", "kpi_data_type", "kpi_domain_id", "kpi_full_name", "kpi_id", "kpi_name", "kpi_subheading", "map_type", "map_view", "mask", "table_view", "translate_value" FROM "indicators";
DROP TABLE "indicators";
ALTER TABLE "new_indicators" RENAME TO "indicators";
CREATE UNIQUE INDEX "indicators_kpi_name_key" ON "indicators"("kpi_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
