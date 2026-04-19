# midinerocrece v6

midinerocrece v6 is a properly layered client-side ingestion and analysis SPA, with a solid import/persistence architecture.

This project is a Vite + React + TypeScript SPA for **experience diagnosis data ingestion and analysis**.

The core business flow is:
1. User uploads an `.xlsx` file.
2. The app parses and normalizes workbook data in-browser.
3. Data is validated.
4. Previous dataset is fully overwritten in IndexedDB.
5. Zustand store is updated.
6. UI renders persisted table data and chart summaries.

## Tech Stack

- Vite 6
- React 18
- TypeScript (strict)
- Tailwind + existing generated UI primitives
- Recharts
- React Router
- Zustand (global app/UI state)
- Dexie (IndexedDB persistence)
- xlsx / SheetJS (Excel parsing)

## Current Product Behavior

### Routes

- `/diagnostico`: main working screen.
- `/proyectos`: placeholder screen.
- `/` redirects to `/diagnostico`.

### Diagnóstico page behavior

- `Importar archivo` opens file picker (`.xlsx` only).
- Import status is shown (`reading_file`, `parsing_workbook`, `normalizing_data`, `persisting_dataset`, `completed`, `error`).
- Imported dataset name is shown in header (loaded from persisted active dataset on page mount).
- If there is an active dataset:
  - a Recharts bar chart shows row count per sheet.
  - table renders persisted data from Dexie.
- If there is no active dataset:
  - table falls back to legacy mock table component.

## Architecture

### Top-level structure

- `src/db/`: Dexie setup and repository layer.
- `src/store/`: Zustand stores for dataset/import and UI state.
- `src/features/import/`: Excel parsing + import orchestration.
- `src/features/data/`: pure transformation/validation/selectors/chart transforms.
- `src/types/`: domain types.
- `src/utils/`: small shared helpers.
- `src/app/`: routing, pages, layout, and UI components.

### DB layer (`src/db`)

- `appDb.ts`: Dexie instance and table definitions.
- `schema.ts`: persisted entity types.
- `repositories/datasetRepository.ts`:
  - `replaceActiveDataset` performs atomic full overwrite.
  - clear rows + datasets, then insert new active dataset + rows.
  - chunked bulk inserts for large datasets.
- `repositories/rowRepository.ts`:
  - row count, page reads, by-sheet reads, all-by-dataset reads, sheet-count aggregation.

### Store layer (`src/store`)

- `datasetStore.ts`:
  - `activeDataset`, `isLoading`, `importStatus`.
  - lifecycle helpers: `startImport`, `setImportPhase`, `completeImport`, `failImport`.
- `uiStore.ts`:
  - `searchQuery`, `showFilters`, `selectedRowIds`.

### Import flow (`src/features/import`)

- `parseWorkbook.ts`:
  - reads ArrayBuffer from file.
  - parses workbook with `xlsx`.
  - converts each sheet to matrix.
- `headerMapping.ts`:
  - detects probable header row in first N rows.
- `features/data/normalize.ts`:
  - normalizes headers.
  - applies fallback header names.
  - removes empty rows.
  - coerces mixed cell values to typed union.
- `features/data/validate.ts`:
  - validates workbook/sheets/rows.
  - blocks import on `error` severity.
- `importService.ts`:
  - orchestrates parsing -> validation -> Dexie overwrite -> result summary.

### Data rendering layer

- `PersistedDiagnosticoTable.tsx`:
  - reads persisted rows by active dataset.
  - applies search/sort/pagination via pure selectors in `features/data/selectors.ts`.
- `charts/DatasetOverviewChart.tsx`:
  - fetches row counts per sheet from repo.
  - uses `features/data/chartTransforms.ts` for chart-ready data.
  - renders Recharts `BarChart`.

## Data Flow (runtime)

`DiagnosticoPage` -> `importDatasetFromXlsx(file)` -> `parseWorkbookFile` -> `normalizeSheetFromMatrix` -> `validateWorkbookStructure` -> `datasetRepository.replaceActiveDataset` -> `datasetStore.setActiveDataset` -> UI updates (`DatasetOverviewChart` + `PersistedDiagnosticoTable`).

## File-level entry points

- App entry: `src/main.tsx`
- Router: `src/app/routes.tsx`
- Main page: `src/app/pages/DiagnosticoPage.tsx`
- Import orchestration: `src/features/import/importService.ts`
- DB instance: `src/db/appDb.ts`
- Global stores: `src/store/datasetStore.ts`, `src/store/uiStore.ts`

## Commands

- `npm install`
- `npm run dev`
- `npm run typecheck`
- `npm run build`

## Important constraints for future refactors

- Do not store datasets in `localStorage`; use Dexie/IndexedDB only.
- Keep persistence logic out of React components.
- Keep UI state in Zustand; do not couple with DB/repository implementation details.
- Keep transformation logic in `features/data`, not JSX.
- Keep Recharts for charts (already integrated).

## Known limitations / technical debt

- `PersistedDiagnosticoTable` currently loads all rows into memory for client-side search/sort/pagination. This is acceptable for now but should evolve to indexed DB-level querying for very large datasets.
- Bundle size warning exists (xlsx + charting code in main chunk). Dynamic import/code splitting is a good next optimization.
- Legacy mock table component still exists as fallback path when no persisted dataset is active.
- `ProyectosPage` is still placeholder.
