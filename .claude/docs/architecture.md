# Architecture

## Core Technologies

- **Nuxt 3** — SSR disabled (SPA mode)
- **Vue 3** — Composition API with `<script setup>`
- **TypeScript** — strict mode
- **Prisma ORM** — SQLite at `prisma/database.sqlite3`
- **Element Plus** — UI component library
- **D3.js** — custom chart components (dot plots)
- **Mapbox GL** — interactive maps with SVG hatching for missing data
- **Tabulator** — complex data tables
- **Pinia** — state management
- **Tailwind CSS + SCSS** — styling with custom modules in `assets/scss/`

## Database Schema (`prisma/schema.prisma`)

- **Country** — country entities with metadata
- **Indicator** — health indicators with types: Numerical, Categorical, Nominal
- **Subgroup** — optional subgroups for indicators
- **DataPoint** — data values linking countries, indicators, and subgroups
- **Region** — geographic regions for grouping countries

Seed data lives in `prisma/data.xlsx`.

## Component Structure

```
components/
  layout/     LayoutHeader, LayoutNavbar, MobileEmptyState
  chart/      DotPlot (D3), Paginated, Key
  map/        Filters, Legend, DetailsPopover
  table/      KeySection
  ui/         SwitchToggle, FilterItem
```

## Pinia Stores (`stores/`)

- `filters.ts` — global filter options
- `chartFilters.ts`, `mapFilters.ts`, `tableFilters.ts` — view-specific filters
- `color.ts` — color blind friendly mode
- `navigation.ts` — navigation state

Filter state is kept in sync with URL query params.

## API Endpoints (`server/api/`)

- `/api/filter-options` — available filter options
- `/api/chart-data` — paginated chart data with empty state handling
- `/api/map-data` — geographic data for map visualization
- `/api/table-data` — paginated table data

All endpoints return consistent response structures with pagination metadata and placeholder data for empty indicators.

## Key Composables (`composables/`)

- `useChartData.ts` — chart data fetching and pagination
- `useMapData.ts` — map data management
- `useSyncRouteFilters.ts` — URL query sync
- `useMapStyles.ts` — dynamic map styling

## Key Utilities (`utils/`)

- `formatData.ts` — format data based on indicator type
- `formatLargeNumbers.ts` — number formatting with units
- `isNullish.ts` — null/undefined checking
- `getStatusColor.ts` — color coding for data values

## Type Definitions (`types/`)

`chart.ts`, `map.ts`, `filter.ts`, `data.ts`, `prisma.ts`
