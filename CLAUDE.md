# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
make deps           # Install npm dependencies
make dist           # Build all apps (webpack)
make lint           # ESLint on TS/TSX files
make lint-w-warn    # ESLint with warnings shown
make deploy         # rsync dist to /var/www/html/deriva-webapps/
make clean          # Remove build artifacts
make distclean      # Remove build artifacts + node_modules
```

Node >= 20, npm >= 7 required.

There are no unit tests — only e2e tests in the CI pipeline.

## Architecture Overview

Six standalone React web apps, each building to its own webpack bundle in `dist/react/{app-name}/`. The apps share code via `src/providers/`, `src/hooks/`, `src/models/`, and `src/utils/` but each app has its own entry point in `src/pages/`.

**Apps**: `plot`, `matrix`, `heatmap`, `boolean-search`, `treeview`, `vitessce` (disabled)

**Deployment model**: Bundles are deployed independently. Chaise (UI framework) and ERMrestJS (REST API client) are loaded from sibling paths on the server (`CHAISE_BASE_PATH`, `ERMRESTJS_BASE_PATH`) — they are not bundled. Plotly is loaded as a webpack external.

**Config loading**: Each app reads a `config/*-config.js` file at runtime (loaded via webpack's `externals`). Sample configs live in `config/*-config-sample.js`. The plot app selects which config to use via the `?config=` URL parameter.

## Plot App

### Data Flow

1. `usePlotConfig` hook (`src/hooks/chart.ts`) loads and validates `plotConfigs[configName]`
2. `PlotAppProvider` (`src/providers/plot-app-context.tsx`) holds global state: user control values, template params, grid layout, app styles
3. For each plot/trace: template the `url_pattern` using `$url_parameters`, `$control_values`, `$catalog`, then fetch CSV or JSON data
4. Parse data with PapaParse (CSV) or native JSON, map columns to Plotly trace fields (`x`, `y`, `z`, `text`, etc.)
5. Render via `react-plotly.js` inside a `react-grid-layout` responsive grid

### Templating

URL patterns and display strings use Handlebars-style templates. Template context (`PlotTemplateParams` in `src/models/plot.ts`):
- `$url_parameters` — URL query params
- `$control_values` — current user control selections (keyed by `uid`)
- `$row` — current data row (for per-row templates)
- `$catalog.id` — Chaise catalog metadata

### User Controls

Defined in `user_controls` arrays at the config or per-plot level. Types: `dropdown`, `facet-search-popup`, `markdown`. When a control value changes, affected traces re-template their URLs and refetch data.

### Grid Layout

Uses `react-grid-layout` with responsive breakpoints (lg/md/sm/xs). Each plot and control has a position in `grid_layout_config`. Default grid props are in `src/models/webapps-core.ts`.

### Key Files

- `src/hooks/chart.ts` — Core logic: config validation, data fetching, CSV/JSON parsing, trace generation (~2000 lines)
- `src/models/plot.ts` — All TypeScript types for the plot config schema
- `src/providers/plot-app-context.tsx` — Global state provider
- `src/hooks/plot.ts` — Context consumer hook
- `config/plot-config-sample.js` — Full annotated example of plot config structure

## Key Patterns

- **Hook-heavy**: Business logic lives in hooks, not components. Components are thin wrappers.
- **Provider pattern**: `PlotAppProvider` → `PlotlyChartProvider` → components. Use `usePlot()` to access context.
- **Column mapping**: Traces reference data columns by name (`x_col`, `y_col`, `z_col`). The hook maps column names to array values from parsed API responses.
- **plot_type vs Plotly type**: `plot_type` in config (`violin`, `bar`, `pie`, etc.) maps to one or more Plotly trace types internally.
- **Strict TypeScript**: `tsconfig.json` has `strict: true`. Module paths aliased via `@isrd-isi-edu/deriva-webapps/*`.
