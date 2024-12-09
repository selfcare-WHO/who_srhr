/*
  Warnings:

  - Added the required column `kpi_subgroup` to the `Subgroup` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subgroup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kpi_subgroup" TEXT NOT NULL,
    "kpi_subgroup_full" TEXT NOT NULL
);
INSERT INTO "new_Subgroup" ("id", "kpi_subgroup_full") SELECT "id", "kpi_subgroup_full" FROM "Subgroup";
DROP TABLE "Subgroup";
ALTER TABLE "new_Subgroup" RENAME TO "Subgroup";
CREATE UNIQUE INDEX "Subgroup_kpi_subgroup_key" ON "Subgroup"("kpi_subgroup");
CREATE UNIQUE INDEX "Subgroup_kpi_subgroup_full_key" ON "Subgroup"("kpi_subgroup_full");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
