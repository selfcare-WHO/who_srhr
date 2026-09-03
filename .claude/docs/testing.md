# Testing

## Playwright MCP Workflow

- Always launch in **full-screen** mode
- App URL: `http://localhost:3001/` (fallback from 3000)
- Take a screenshot after every UI change
- Check the browser console for errors after each interaction

## What to Test

- Test with **multiple indicators and countries** selected — single-item states hide bugs
- Verify empty states render correctly when no data matches filters
- Test navigation between all three views: Map, Charts, Table
- Check responsive behavior — mobile shows a warning state, not the visualization
