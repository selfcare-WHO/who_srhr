# Data & API

## API Guidelines

- Always include pagination metadata in responses
- Return placeholder data for empty indicators (never a bare empty array)
- Handle missing data explicitly — don't let it silently drop
- Validate all data from API responses before use
- Use proper TypeScript types for all data structures

## Data Formatting

- Use `formatLargeNumbers` utility for large numbers with units
- Use `formatData.ts` to format values based on indicator type (Numerical / Categorical / Nominal)

## Prisma / Database

- Use `npx prisma migrate dev` for schema changes — never edit the DB directly
- Seed data is maintained in `prisma/data.xlsx` — update the Excel file, then re-seed
- Use transactions for operations that touch multiple tables
