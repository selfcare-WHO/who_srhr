# WHO SRHR Data Portal

A data visualization dashboard for the World Health Organization's Sexual and Reproductive Health and Rights (SRHR) indicators, featuring interactive country comparisons through maps, charts, and tables.

## 🎯 Project Overview

This application provides a comprehensive platform for visualizing and comparing SRHR health indicators across countries. It presents data through three main views:
- **Map View**: Geographic visualization with heatmaps and color-coded regions
- **Chart View**: Dot plots and paginated numerical comparisons
- **Table View**: Detailed tabular data with advanced filtering

## 🏗️ Architecture

### Tech Stack

**Frontend Framework:**
- **Nuxt 3** - SPA mode (SSR disabled)
- **Vue 3** - Composition API with `<script setup>` syntax
- **TypeScript 5** - Strict mode enabled
- **Pug 3** - Template language for cleaner markup

**UI & Styling:**
- **Element Plus 2** - Primary UI component library
- **Tailwind CSS 3** - Utility-first CSS framework
- **Sass/SCSS** - Custom styling and Element Plus theming

**Data Visualization:**
- **D3.js 7** - Custom chart components (dot plots)
- **Mapbox GL** - Interactive map visualizations
- **Tabulator Tables 6** - Advanced data tables

**State Management:**
- **Pinia 2** - Vue store for global state
- **VueUse 10** - Composition utilities

**Database & ORM:**
- **Prisma 6** - Database ORM
- **SQLite** - Local database

**Data Processing:**
- **Excel (XLSX)** - Source data format
- **Power Query** - Data transformation scripts
- **simple-statistics 7** - Statistical calculations (Jenks breaks)

### Project Structure

```
who_srhr/
├── assets/           # CSS, SCSS, and static assets
├── components/       # Vue components organized by feature
├── composables/      # Vue composables for shared logic
├── lib/              # Core libraries and utilities
├── pages/            # Nuxt pages (file-based routing)
├── prisma/           # Database schema, migrations, and seed data
├── scripts/          # Data processing and utility scripts
├── server/           # API endpoints and server-side logic
├── stores/           # Pinia state stores
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 💾 Database Schema

### Core Models

**Indicator** - Health indicators with metadata
- Unique identifier and naming (short, full)
- Data type classification (Numerical, Categorical, Percentage, etc.)
- Target and view configuration flags
- Visualization type specifications
- Domain relationships

**Domain** - Categorical grouping of indicators
- Health systems
- Reproductive health
- Sexual and reproductive health
- Context
- Enabling environment

**Subgroup** - Optional subgroups for disaggregated data
- Population segments (Total, Male, Female, etc.)
- Age groups
- Other demographic breakdowns

**DataPoint** - Actual data values
- Multiple value representations (original, parsed, display)
- Target status indicators
- Trend information
- Data year and source
- Relationships to Indicator, Subgroup, and Country

**Country** - Country entities
- Name and ISO codes
- WHO regional classification
- Income type classification

### Performance Optimizations
- Indexed fields for common queries
- Optimized relationships with proper cascading

## 🔄 Data Flow

### Overview
```
Excel Source → Power Query Transform → Database Seed → API → Client Visualization
```

### 1. Data Source
Excel workbooks containing multiple sheets:
- Main comparison data
- Country metadata
- Indicator details and groupings
- Supporting reference data

### 2. Data Transformation

**Power Query in Excel** (not directly executed from scripts):
- The transformation logic is embedded in `prisma/data.xlsx`
- Access via: Data tab → Get Data → Launch Power Query Editor → "Comparison data" query
- A reference copy is stored in `scripts/DataComparisonPowerQuery.m` for version control
- **Important**: Always edit queries in Excel, then copy to the .m file for tracking

What it does:
- Merges multiple data sources
- Applies transformations and calculations
- Adds computed fields
- Integrates metadata

### 3. Database Seeding
Automated process that:
- Reads Excel files
- Parses sheets into structured data
- Creates/updates database records
- Maintains referential integrity

### 4. API Layer
Server endpoints provide:
- Filter options for UI controls
- Paginated chart data
- Geographic data with statistical breaks
- Tabular data with flexible filtering

### 5. Client-Side Rendering
**State Management:**
```
User Input → Pinia Store → API Request → Component Update
                ↓
         URL Query Params (synchronized)
```

**Visualization Pipeline:**
```
API Data → Composable → Component → Visualization Library
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **Yarn** v4+ (package manager)
- **Mapbox Access Token** (for map visualizations)

### Installation

1. **Clone the repository**
   ```bash
   git clone git://github.com/lushomo-net/who_srhr
   cd who_srhr
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Configure environment variables**

   Create a `.env` file with required variables:
   ```env
   VITE_MAPBOX_PUBLIC_KEY=your_mapbox_token_here
   COMPARISON_FEATURE_ACTIVE=true
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed database from Excel
   npx prisma db seed
   ```

### Development

Start the development server with Prisma Studio:
```bash
yarn dev
```

This runs both the Nuxt dev server and Prisma Studio concurrently.

Or run separately:
```bash
yarn dev:nuxt      # Nuxt dev server only
yarn dev:prisma    # Prisma Studio only
```

### Database Management

```bash
npx prisma studio           # Open Prisma Studio GUI
npx prisma migrate dev      # Create and apply migration
npx prisma db seed          # Re-seed database
npx prisma generate         # Regenerate Prisma client
```

### Code Quality

```bash
yarn format              # Format code with Prettier
yarn format:check        # Check formatting
yarn lint:format         # Lint and check formatting
```

### Memory Profiling

The `scripts/` directory contains Node.js utilities for monitoring and profiling application memory:

```bash
yarn memory:monitor      # Real-time memory usage monitoring
yarn memory:snapshot     # Create heap snapshots for analysis
yarn memory:profile      # Profile memory allocation patterns
yarn memory:analyze      # Build and analyze memory
```

Available memory scripts:
- `memory-monitor.js` - Real-time memory usage monitoring
- `heap-snapshot.js` - Create heap snapshots for analysis
- `memory-profiler.js` - Profile memory allocation patterns
- `debug-memory-leak.js` - Debug potential memory leaks
- `load-test.js` - Load testing with memory tracking

## 🏭 Production

### Build
```bash
yarn build
```

Creates an optimized production build.

### Preview
```bash
yarn preview
```

Preview the production build locally.

### Start
```bash
yarn start
```

Start the production server (after build).

### Static Generation
```bash
yarn generate
```

Generate a static site (SPA mode).

## 🎨 Styling & Theming

### Tailwind Configuration
- Custom configuration available in project root
- Additional utilities defined in CSS assets
- Responsive design with mobile-first approach

### Element Plus Theming
- Custom SCSS variables for component theming
- Automatically imported via build configuration
- Consistent design system across application

### Color Blind Friendly Mode
- Toggle available in user interface
- Managed via centralized state store
- Affects all visualization color schemes

## 📊 Data Visualization Details

### Chart View (D3.js)
- Custom dot plot visualizations
- SVG-based rendering
- Dynamic scaling based on data ranges
- Country highlighting capabilities
- Paginated display

### Map View (Mapbox)
- Interactive choropleth maps
- Jenks natural breaks classification
- Custom color scales
- Hover tooltips with country details
- Visual indicators for missing data

### Table View (Tabulator)
- Advanced sortable/filterable tables
- Multi-indicator comparison
- Custom cell formatting
- Responsive columns
- Data export capabilities

## 🗂️ Key Features

### Filter Synchronization
- All filters sync with URL query parameters
- Shareable URLs with complete filter state
- Browser back/forward navigation support

### Pagination
- Configurable page sizes
- API-level pagination for performance
- Smooth navigation between pages

### Empty State Handling
- Placeholder data for indicators with no values
- Clear messaging for missing data
- Graceful degradation across all views

### Mobile Support
- Warning messages for mobile devices
- Desktop-optimized visualizations
- Responsive layouts where applicable

## 🔧 Configuration

### Nuxt Configuration
- SSR disabled (SPA mode)
- TypeScript strict mode enabled
- Modular architecture with plugins
- Path aliases for clean imports

### Prisma Configuration
- SQLite database provider
- Optimized indexes for performance
- Well-defined model relationships

## 📝 Development Guidelines

### Code Style
- No semicolons (Prettier enforced)
- TypeScript strict mode
- Composition API with `<script setup>`
- Pug templates for cleaner markup
- Arrow functions for methods/computed properties

### Naming Conventions
- **PascalCase**: Components
- **camelCase**: Composables and utilities
- **kebab-case**: Directories

### State Management Best Practices
- Use Pinia stores for global state
- Keep filter state synchronized with URL
- Use composables for shared logic
- Validate data from API responses

### Testing Workflow
- Test with multiple indicators and countries
- Verify empty states appear correctly
- Check responsive behavior
- Test all three views (map, chart, table)

## 🐛 Common Issues

### Chart View Empty
Check indicator configuration - ensure the indicator is enabled for chart view in the database.

### Map Not Loading
Verify Mapbox access token is properly configured in environment variables.

### Database Out of Sync
Re-run migrations and reseed:
```bash
npx prisma migrate dev
npx prisma db seed
```

### Modifying Data Transformations

**⚠️ IMPORTANT: `scripts/DataComparisonPowerQuery.m` is reference-only - DO NOT EXECUTE DIRECTLY**

This Power Query M script is stored in the repository for version control purposes only. The actual, executable query is embedded within the Excel workbook at `prisma/data.xlsx`.

**To modify the data transformation query:**

1. Open `prisma/data.xlsx` in Microsoft Excel
2. Navigate to: **Data** tab → **Get Data** → **Launch Power Query Editor**
3. In the Queries pane, select **"Comparison data"**
4. Click **Advanced Editor** to view/edit the M code
5. Make your modifications
6. Click **Close & Load** to apply changes to the Excel workbook

**After making changes:**

1. Copy the updated M code from Excel's Power Query Editor
2. Paste it into `scripts/DataComparisonPowerQuery.m` (replacing the existing code)
3. Commit the changes to version control
4. Re-seed the database:
   ```bash
   npx prisma db seed
   ```

**What this query does:**
- Transforms raw data from multiple Excel sheets
- Merges related tables (Main_Data, KPI_ID, KPI_details, KPI_subgroups, Endnotes)
- Standardizes column names and data types
- Prepares data in the format required by the database seeding process

### Performance Issues
- Check browser console for errors
- Use memory profiling scripts
- Verify pagination is working correctly
- Clear browser cache

## 📚 Additional Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Element Plus](https://element-plus.org/)
- [D3.js Documentation](https://d3js.org/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [Tabulator](http://tabulator.info/)

## 📄 License

This project is private and proprietary to the World Health Organization.

## 👤 Author

Lucas Bicudo

## 🔗 Repository

[https://github.com/lushomo-net/who_srhr](https://github.com/lushomo-net/who_srhr)
