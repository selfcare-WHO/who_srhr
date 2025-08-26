# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server with Prisma Studio
yarn dev

# Separate development servers
yarn dev:nuxt      # Nuxt dev server only
yarn dev:prisma    # Prisma Studio only

# Build for production
yarn build

# Preview production build
yarn preview

# Generate static site
yarn generate

# Code formatting
yarn format
yarn format:check

# Database management
npx prisma migrate dev    # Run migrations
npx prisma db seed        # Seed database
npx prisma studio         # Open Prisma Studio
```

## Project Architecture

This is a **Nuxt 3 SSR-disabled (SPA)** application for the WHO SRHR (Sexual and Reproductive Health and Rights) Data Portal - a data visualization dashboard featuring country comparisons through maps, charts, and tables.

### Core Technologies

- **Nuxt 3** (SSR disabled - SPA mode)
- **Vue 3** with Composition API
- **TypeScript** with strict mode
- **Prisma ORM** with SQLite database
- **Element Plus** UI framework
- **D3.js** for data visualizations
- **Mapbox** for map visualizations
- **Pinia** for state management
- **Tailwind CSS** with Sass/SCSS

### Data Architecture

**Database Structure** (`prisma/schema.prisma`):
- **Country**: Country entities with metadata
- **Indicator**: Health indicators with types (Numerical, Categorical, Nominal)
- **Subgroup**: Optional subgroups for indicators
- **DataPoint**: Actual data values linking countries, indicators, and subgroups
- **Region**: Geographic regions for grouping countries

**Data Management**:
- SQLite database at `prisma/database.sqlite3`
- Seed data from Excel files (`prisma/data.xlsx`)
- Prisma migrations for schema evolution

### Component Architecture

**Layout Components** (`components/layout/`):
- `LayoutHeader.vue`: Main site header with WHO branding
- `LayoutNavbar.vue`: Navigation bar with section links
- `MobileEmptyState.vue`: Mobile device warning

**Chart Components** (`components/chart/`):
- `DotPlot.vue`: D3-based dot plot visualization
- `Paginated.vue`: Paginated chart container
- `Key.vue`: Chart legend/key display

**Map Components** (`components/map/`):
- `Filters.vue`: Map-specific filter controls
- `Legend.vue`: Map legend for data ranges
- `DetailsPopover.vue`: Country detail popover

**Table Components** (`components/table/`):
- `KeySection.vue`: Table legend display

**UI Components** (`components/ui/`):
- `SwitchToggle.vue`: Custom toggle switch
- `FilterItem.vue`: Reusable filter component

### State Management (Pinia Stores)

**Filter Stores** (`stores/`):
- `filters.ts`: Global filter options
- `chartFilters.ts`: Chart-specific filters
- `mapFilters.ts`: Map-specific filters
- `tableFilters.ts`: Table-specific filters
- `color.ts`: Color blind friendly mode
- `navigation.ts`: Navigation state

### API Endpoints

**Server Routes** (`server/api/`):
- `/api/filter-options`: Available filter options
- `/api/chart-data`: Paginated chart data with empty state handling
- `/api/map-data`: Geographic data for map visualization
- `/api/table-data`: Paginated table data

### Key Technical Details

**Styling**:
- **Tailwind CSS** with custom SCSS modules in `assets/scss/`
- Element Plus theming customizations
- Tabulator table styling
- Responsive design with mobile-first approach
- Custom fonts: Source Sans Pro (Adobe Fonts)

**Data Visualization**:
- **D3.js** for custom chart components (dot plots)
- **Mapbox GL** for interactive maps
- **Tabulator** for complex data tables
- SVG patterns for map hatching (missing data)

**Performance**:
- SSR disabled for SPA performance
- Lazy loading for routes
- Pagination for large datasets
- Optimized SVG rendering

### Development Guidelines

**Code Style and Structure**:
- Use TypeScript with strict mode enabled
- Composition API with `<script setup>` syntax
- No semicolons - prettier will handle formatting
- Use arrow functions for methods and computed properties
- Prefer types over interfaces in TypeScript
- Use descriptive variable names (e.g., isLoading, hasError)

**Component Conventions**:
- Use Pug templates for cleaner markup
- PascalCase for component names (e.g., `DotPlot.vue`)
- camelCase for composables (e.g., `useChartData.ts`)
- kebab-case for directories (e.g., `country-comparison/`)

**State Management**:
- Use Pinia stores for global state
- Keep filter state synchronized with URL query params
- Use composables for shared logic (`composables/`)

**Data Handling**:
- Always validate data from API responses
- Handle empty states explicitly
- Use proper TypeScript types for all data structures
- Format large numbers appropriately (`formatLargeNumbers` utility)

**Testing Workflow**:
- Always use Playwright MCP on full-screen for UI testing
- Test with multiple indicators and countries selected
- Verify empty states appear correctly
- Check responsive behavior on different screen sizes

**UI/UX Guidelines**:
- Use Element Plus components for consistency
- Implement proper loading states
- Show meaningful empty states when no data
- Ensure color blind friendly visualizations
- Mobile warning for complex visualizations

**API Development**:
- Return consistent response structures
- Include pagination metadata
- Handle missing data gracefully
- Return placeholder data for empty indicators

**Database Guidelines**:
- Use Prisma migrations for schema changes
- Keep seed data in Excel format for easy updates
- Use transactions for complex operations
- Index frequently queried columns

### File Structure Notes

**Key Utilities** (`utils/`):
- `formatData.ts`: Format data based on indicator type
- `formatLargeNumbers.ts`: Number formatting with units
- `isNullish.ts`: Null/undefined checking
- `getStatusColor.ts`: Color coding for data values

**Key Composables** (`composables/`):
- `useChartData.ts`: Chart data fetching and pagination
- `useMapData.ts`: Map data management
- `useSyncRouteFilters.ts`: URL query sync
- `useMapStyles.ts`: Dynamic map styling

**Type Definitions** (`types/`):
- `chart.ts`: Chart data structures
- `map.ts`: Map configuration types
- `filter.ts`: Filter option types
- `data.ts`: Core data types
- `prisma.ts`: Serialized Prisma types

### MCP Integration

- Always assume the app is running on `http://localhost:3001/` (fallback from 3000)
- Use Playwright MCP browser tools for testing and debugging
- Always use full-screen mode for Playwright testing
- Take screenshots after making UI changes
- Use browser console to check for errors
- Test navigation between map, charts, and table views

### Common Tasks

**Adding New Indicators**:
1. Update Excel data file (`prisma/data.xlsx`)
2. Run database seed: `npx prisma db seed`
3. Test all three views (map, charts, table)

**Debugging Empty States**:
1. Check API response in Network tab
2. Verify placeholder data is returned for missing indicators
3. Ensure chart components handle empty dataPoints arrays
4. Test with multiple indicators and countries

**Performance Optimization**:
1. Use pagination for large datasets
2. Implement virtual scrolling for long lists
3. Optimize D3 rendering with proper data binding
4. Cache API responses where appropriate