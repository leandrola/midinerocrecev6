# Mi Dinero Crece v6

SPA built with Vite + React + TypeScript for **experience diagnosis ingestion and project traceability**.

---

## Webapp Goal

This application is designed to support Project Managers by:

* Visualizing project flow and status
* Identifying experience debt
* Understanding prioritization vs feasibility
* Enabling decision-making (not just visualization)

All features must serve this goal.

---

## Tech Stack

* Vite 6
* React 18
* TypeScript (strict)
* Zustand (state management)
* Dexie (IndexedDB persistence)
* ECharts (Sankey visualization)
* Tailwind CSS

---

## Core Flow

1. User imports an `.xlsx` file
2. Data is parsed and normalized in-browser
3. Header row is ignored
4. Dataset replaces previous data in IndexedDB
5. Zustand store updates active dataset
6. UI renders:

   * Diagnostico table
   * Proyectos Sankey chart

---

## Runtime Constraints (CRITICAL)

* The application MUST run fully offline
* NO external APIs are allowed
* NO remote calls (AI, analytics, CDNs, etc.)
* NO API keys allowed
* All logic must run locally in the browser

This is a strict constraint for all future changes.

---

## Data Source

* The ONLY data source is the imported `.xlsx` file
* Data is persisted using IndexedDB (Dexie)
* Each import MUST fully replace the previous dataset

### Forbidden

* mock data
* fallback data
* hardcoded datasets
* demo/sample content

### Behavior rule

If no file is imported:
→ The UI must show empty state (no rows, no charts)

---

## Data Mapping Rules

* Excel structure is FIXED
* Headers NEVER change
* Mapping is strictly position-based

### Column mapping

0  → producto
1  → funcionalidad
2  → canal
3  → squad
4  → deudaExperiencia
5  → objetivoDolor
6  → kpi
7  → cuandoSeDetecto
8  → recurrencia
9  → criticidad
10 → cliente
11 → prioridadDiseno
12 → prioridadSquad
13 → factibilidadTecnica
14 → racionalNivel
15 → fueCorregida
16 → estado

---

## Rendering Rules

* UI must NOT use Excel headers
* Table headers are defined in the app
* DO NOT render using:

  * `Object.values()`
  * dynamic column inference

Always map explicitly by field.

---

## Sankey Model (Proyectos View)

The Sankey represents project flow:

canal → funcionalidad → deudaExperiencia → prioridadDiseno → factibilidadTecnica → estado

### Rules

* Order is FIXED
* No reordering
* No inference
* Must be derived only from persisted dataset

---

## Sankey Behavior

### Label truncation

* `funcionalidad` → max 15 chars
* `deudaExperiencia` → max 15 chars
* Use ellipsis ("...")
* Do NOT modify underlying data

### Interaction

* Hover must highlight full connected subgraph
* Must include upstream and downstream nodes

---

## Feature Flags

All major behavioral changes must be reversible.

Example:

```ts
const USE_FULL_SUBGRAPH_HIGHLIGHT = true;
```

Rules:

* Keep previous behavior intact
* Allow easy rollback
* Do not overwrite existing logic permanently

---

## Architecture Rules

* Persistence logic MUST be outside React components
* Transformation logic MUST NOT live in JSX
* UI must be a pure rendering layer
* Separate:

  * data access
  * transformation
  * visualization

---

## Anti-patterns (DO NOT DO)

* Do not use mock data
* Do not fetch remote resources
* Do not rely on Excel headers
* Do not use dynamic schema inference
* Do not use `Object.values()` for rendering
* Do not introduce external dependencies without approval

---

## Offline-First Requirement

* App must work fully without internet
* All assets must be bundled locally
* No runtime dependency on network
* IndexedDB is the only persistence layer

---

## Development Rules

* Prefer deterministic logic over heuristics
* Avoid unnecessary abstractions
* Every feature must be explainable
* Focus on PM value, not visual complexity

---

## AI Usage Policy (Future)

AI features are optional and must:

* be local-first where possible
* be decoupled from core functionality
* NEVER block the main app flow
* NEVER introduce external API dependency without approval

---

## 📌 Summary

This application is a **local-first, deterministic decision tool for PMs**.

It is NOT:

* a demo app
* a data playground
* a generic BI tool

It is:
→ a controlled system for importing, visualizing, and understanding project flow and experience debt.
