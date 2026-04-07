# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make deps           # Install npm dependencies (npm ci)
make dist           # Build all apps (webpack)
make lint           # ESLint on TS/TSX files
make lint-w-warn    # ESLint with warnings shown
make deploy         # rsync dist to /var/www/html/deriva-webapps/
make clean          # Remove build artifacts
make distclean      # Remove build artifacts + node_modules
```

Node >= 20, npm >= 7 required.

There are no automated tests, only manual test. The github e2e-test workflow is only making sure the build step goes through properly.

## Architecture Overview

Six standalone React web apps, each building to its own webpack bundle in `dist/react/{app-name}/`. The apps share code via `src/providers/`, `src/hooks/`, `src/models/`, `src/components/controls/`, and `src/utils/` but each app has its own entry point in `src/pages/`.

**Apps**: `plot`, `matrix`, `heatmap`, `boolean-search`, `treeview`, `vitessce` (disabled — commented out in `webpack/main.config.js`)

**Deployment model**: Bundles are deployed independently. Chaise (UI framework) and ERMrestJS (REST API client) are loaded from sibling paths on the server (`CHAISE_BASE_PATH`, `ERMRESTJS_BASE_PATH`, `WEBAPPS_BASE_PATH`) — they are not bundled. Plotly is loaded as a webpack external. jQuery and jstree are also webpack externals (treeview only).

**Config loading**: Each app reads a `config/*-config.js` file at runtime (loaded via webpack's `externals`). Sample configs live in `config/*-config-sample.js`. The plot app selects which config to use via the `?config=` URL parameter. Configs expose data on `window` (e.g., `window.plotConfigs`, `window.matrixConfigs`).

**Build-time variables**: `CHAISE_BASE_PATH`, `ERMRESTJS_BASE_PATH`, `WEBAPPS_BASE_PATH`, `BUILD_VERSION` (timestamp injected by webpack).

## Apps

### Plot App

The most complex app. Renders Plotly charts in a responsive grid, driven entirely by runtime config.

#### Data Flow

1. `usePlotConfig` hook (`src/hooks/chart.ts`) loads and validates `plotConfigs[configName]`
2. `PlotAppProvider` (`src/providers/plot-app-context.tsx`) holds global state: user control values, template params, grid layout, app styles
3. For each plot/trace: template the `url_pattern` using `$url_parameters`, `$control_values`, `$catalog`, then fetch CSV or JSON data
4. Parse data with PapaParse (CSV) or native JSON, map columns to Plotly trace fields (`x`, `y`, `z`, `text`, etc.)
5. Render via `react-plotly.js` inside a `react-grid-layout` responsive grid

#### Templating**

URL patterns and display strings use Handlebars-style templates. Template context (`PlotTemplateParams` in `src/models/plot.ts`):
- `$url_parameters` — URL query params
- `$control_values` — current user control selections (keyed by `uid`)
- `$row` — current data row (for per-row templates)
- `$catalog.id` — Chaise catalog metadata

Example: `{{#if $url_parameters.Study}}Study: {{{$url_parameters.Study}}}{{/if}}`

#### User Controls

Defined in `user_controls` arrays at the config or per-plot level. Types: `dropdown`, `facet-search-popup`, `markdown`. When a control value changes, affected traces re-template their URLs and refetch data.

#### Grid Layout

Uses `react-grid-layout` with responsive breakpoints (lg/md/sm/xs). Each plot and control has a position in `grid_layout_config`. Default grid props are in `src/models/webapps-core.ts`.

#### Key Files

- `src/hooks/chart.ts` — Core logic: config validation, data fetching, CSV/JSON parsing, trace generation (~1900 lines)
- `src/hooks/chart-select-grid.ts` — Grid/layout state management (~600 lines)
- `src/models/plot.ts` — All TypeScript types for the plot config schema
- `src/providers/plot-app-context.tsx` — Global state provider
- `src/hooks/plot.ts` — Context consumer hook
- `config/plot-config-sample.js` — Full annotated example of plot config structure

### Matrix App

Renders a virtualized grid of data cells with hierarchical tree headers on rows and columns. Uses `react-window` for virtualization.

#### Key Files

- `src/hooks/matrix.ts` — Data fetching, tree-structure building, color scaling (~800 lines)
- `src/models/matrix-config.ts` — Config types: grid layout, tree config, color scaling, styles
- `src/components/matrix/virtualized-grid.tsx` — Main virtualized grid with synchronized scrolling
- `src/components/matrix/row-tree-headers.tsx`, `column-tree-headers.tsx` — Hierarchical headers
- `src/utils/colors.ts` — Color scaling (parula/viridis colormaps from `src/assets/colormaps/*.json`)
- `config/matrix-config-sample.js` — Annotated example

### Heatmap App

Simpler Plotly heatmap. Uses `src/hooks/` for data loading and `react-plotly.js` for rendering.

- `src/models/heatmap-config.ts` — Config types
- `src/components/heatmap/heatmap-plot.tsx` — Plotly renderer
- `config/heatmap-config-sample.js`

### Boolean-Search App

Query builder for specimen searches. Users navigate an anatomical term tree, select terms, and build boolean queries that filter a results table.

- `src/hooks/boolean-search.ts` — Loads dropdown data (strength, stages, patterns, locations)
- `src/models/boolean-search-config.ts` — Config types
- `src/components/boolean-search/tree-view.tsx` — MUI `@mui/x-tree-view` tree navigator
- `src/components/boolean-search/boolean-table.tsx` — Query builder table
- `config/boolean-search-config-sample.js`

### Treeview App (Legacy)

**This is a jQuery-based legacy app** wrapped in a thin React shell. Do not treat it as a modern React app.

- The actual implementation is `src/utils/legacy-treeview.js`.
- `src/components/treeview/legacy-treeview.tsx` — React wrapper that mounts the jQuery component
- `treeview/` (root directory) — jQuery, jstree, and jstree-grid assets bundled as webpack externals

### Vitessce App (Disabled)

Spatial visualization app. Commented out in `webpack/main.config.js`. Entry point exists at `src/pages/vitessce.tsx` and providers at `src/providers/vitessce-app.tsx` but it is not built.

## Key Patterns

- **Hook-heavy**: Business logic lives in hooks, not components. Components are thin wrappers.
- **Provider pattern**: `PlotAppProvider` → `PlotlyChartProvider` → components. Use `usePlot()` to access context.
- **Column mapping**: Traces reference data columns by name (`x_col`, `y_col`, `z_col`). The hook maps column names to array values from parsed API responses.
- **plot_type vs Plotly type**: `plot_type` in config (`violin`, `bar`, `pie`, etc.) maps to one or more Plotly trace types internally.
- **Strict TypeScript**: `tsconfig.json` has `strict: true`. Module paths aliased via `@isrd-isi-edu/deriva-webapps/*`.
- **HTTP client**: Use `ConfigService.http.get()` from Chaise — not raw `fetch`. This handles auth, catalog headers, and error normalization.
- **Error handling**: Dispatch errors via Chaise's `useError` hook. Errors surface in the global alert context, not via thrown exceptions.

## Source Layout

```
src/
├── pages/          # App entry points (one per app)
├── providers/      # React context providers (global app state)
├── hooks/          # Business logic, data fetching, state
├── components/
│   ├── plot/       # Plot-specific components
│   ├── matrix/     # Matrix grid, tree headers, legend
│   ├── heatmap/    # Heatmap renderer
│   ├── boolean-search/  # Tree navigator, query table
│   ├── treeview/   # Legacy jQuery wrapper
│   ├── vitessce/   # Disabled
│   └── controls/   # Shared: dropdown, facet-search-popup, label
├── models/         # TypeScript types for all config schemas
├── utils/
│   ├── plot-utils.ts    # Handlebars template rendering, URL substitution
│   ├── colors.ts        # Color scaling (parula, viridis)
│   ├── config.ts        # Config loading and validation helpers
│   ├── string.ts        # String formatting, markdown escape, sanitization
│   ├── tree.ts          # Tree walking utilities
│   ├── ui-utils.ts      # DOM utilities, modal/tooltip helpers
│   └── message-map.ts   # Error/warning message lookup
└── assets/
    ├── scss/       # Per-app stylesheets (_plot.scss, _matrix.scss, etc.)
    └── colormaps/  # parula.json, viridis.json (used by matrix/heatmap)
```

## Key Dependencies

| Package | Purpose |
|---|---|
| `@isrd-isi-edu/chaise` | UI framework: HTTP client, alerts, facet search popup, Chaise components |
| `react-grid-layout` | Responsive drag-and-drop grid for plot app |
| `react-window` | Virtualized lists/grids (matrix app, virtualized selects) |
| `react-select` | Select dropdowns with search |
| `@mui/x-tree-view` | Tree view component (boolean-search app) |
| `@mui/material` + `@emotion/react` | MUI dependency (required by tree-view) |
| `papaparse` | CSV parsing |
| `plotly.js-cartesian-dist-min` | Plotly charts (loaded as webpack external, not bundled) |
| `handlebars` | Template rendering for URL patterns and display strings |

