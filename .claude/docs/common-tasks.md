# Common Tasks

## Adding New Indicators

1. Update `prisma/data.xlsx` with the new indicator data
2. Run `npx prisma db seed`
3. Test in all three views: Map, Charts, Table

## Debugging Empty States

1. Check the API response in the Network tab
2. Confirm the endpoint returns placeholder data (not an empty array)
3. Verify the chart component handles an empty `dataPoints` array
4. Re-test with multiple indicators and countries selected

## Performance

- Large datasets: use pagination (already wired into API endpoints)
- D3 rendering: use proper data binding — avoid re-rendering the full SVG on every update
- Routes: use lazy loading
