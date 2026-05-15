# Code Style

## TypeScript

- Strict mode enabled
- Prefer `type` over `interface`
- Use arrow functions for methods and computed properties

## Vue Components

- `<template lang="pug">` — Pug templates, not HTML
- `<script setup lang="ts">` — Composition API
- No semicolons — Prettier handles formatting

## Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `DotPlot.vue` |
| Composables | camelCase | `useChartData.ts` |
| Directories | kebab-case | `country-comparison/` |
| Booleans | descriptive prefix | `isLoading`, `hasError` |
