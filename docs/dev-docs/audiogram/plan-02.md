# Audiogram — Next Steps Plan

## Context

V3 (the standalone `audiogram` app on the `audiogram` branch) renders right/left ear plots with a custom HTML legend, reusing the plot-app's config schema and `ChartWithEffect` for rendering. The next priority is **showing a table of the raw measurement values below the audiogram** so reviewers in tomorrow's meeting can see chart + tabular data side by side.

Two related questions need to be addressed in the same pass so we have answers ready for the meeting:

1. **Storage backend** — file vs ERMrest. The user wants to argue for files but expects pushback toward DB. Either way, the read path should be backend-agnostic (just a `url_pattern`).
2. **Row encoding** — three candidate shapes for how a single audiogram is represented in storage (long/measurement-per-row, semi-wide/per-frequency, fully-wide/per-frequency-pre-declared columns). The user leans toward option 3 but wants the trade-offs and the cost of switching documented.

The immediate code change is the table. Everything else is documentation in `progress-02.md` to drive the meeting.

## Deliverables

### 1. `docs/dev-docs/audiogram/progress-02.md` (new)

Captures the planning discussion. Sections:

- **Status recap** — V3 is shipped on the `audiogram` branch, what it does, what's still open from `progress-01.md` (Q1 test types, Q1a no-response encoding, Q2 storage format).
- **Storage: file vs database** — read path is identical (the trace's `url_pattern` resolves to either a static JSON or an ERMrest query). Differences only matter for write/edit and for multi-subject queries. Argument for "file per audiogram": simplest to author, diff-friendly, no schema migration; argument against: doesn't compose with ERMrest faceting or per-cell editing. Recommend: support both via `url_pattern` from day one and defer the decision.
- **Row encoding — three options** — for each: example row shape, what the audiogram app needs to do to consume it, write/edit ergonomics, query ergonomics, and how hard it is to switch later.
  - Option 1 (long, one row per measurement: `ear, test_type, frequency, level, masked, no_response`): cleanest for ERMrest, trivial per-cell edits, natural for partial data, but needs a pivot step in the app before plotting. Switching cost: pivot helper (~30 lines) in `src/utils/`.
  - Option 2 (semi-wide, one row per frequency with per-(ear×test) columns): the current sample format. Plots directly without pivoting. Adding a new test type means adding columns. Editing is awkward in a relational store. **This is what the current code consumes.**
  - Option 3 (fully wide, one row per audiogram with `left_air_unmasked_250`, `left_air_unmasked_250_masked`, …): compact, one row = one audiogram, easy joins to subject metadata. Requires the column set to be known up front. Plot consumption needs an "unflatten by frequency" step. This is the option the user expects clinicians to want.
  - **Switching cost summary**: in all three cases the only file that changes is a small data-shape adapter; the Plotly trace generation and the new table component both consume an internal "normalized" structure (`{ ear, testType, frequency, level, noResponse }[]`). So picking the wrong option now is cheap to undo.
- **Recommendation for the meeting**: introduce an internal normalized shape (option 1 in memory), and write a thin adapter from whichever storage shape gets chosen. Default the sample/dev data to option 2 (no change to current sample) and add an option-3 sample so clinicians can react to it.
- **Audiogram-specific config** — argue that the only thing the user should specify is `url_pattern` (and optionally a title, the subject/visit template params, and which test types to show). Symbols, colors, marker shapes, axis ranges, ISO/ASHA legend ordering should all be hard-coded in the app, not in config. For now, keep the plot-config syntax (it works) and revisit an `audiogram-config` schema once the storage question is answered.
- **URL templating / query params** — the audiogram app must support per-instance URLs like `audiogram/?config=audiogram&Subject_RID=ABC&Visit=2`. The plot app already does this: `chart.ts:471` walks `allQueryParams` into `tempParams.$url_parameters`, and `url_pattern` is rendered via the Handlebars helper in `src/utils/plot-utils.ts`. The audiogram app inherits this through `usePlot` / `PlotAppProvider`, but since we're moving the data fetch out of the chart hook (see editing section below), we must explicitly call the same templating helper from `AudiogramApp` before fetching. Verification: load `audiogram/?config=audiogram&Foo=bar` and confirm `{{$url_parameters.Foo}}` in `url_pattern` resolves to `bar`. Document in progress-02 with an example link template so callers know how to deep-link to a specific audiogram instance.
- **Plan for the values tables** (two tables, one per ear; mirrors section 2 below).
- **Editable table & batched save/cancel** — using ag-grid's `readOnlyEdit` mode with a draft buffer, live chart preview while editing, Save/Cancel buttons that batch all edits into one PATCH (or one file write). See section 2 for the wiring.
- **Audiogram app as an input form** — once editing lands, an empty audiogram can be authored in the app itself. Caveat: a new audiogram needs to be associated with a subject/visit/dataset first, so the create flow would likely be: Chaise creates the parent row with FK to subject → redirect to `audiogram/?id=<rid>` to fill in measurements → Save commits. Worth discussing in the meeting; not in V4 scope.
- **Optional follow-ups** to discuss in the meeting (no code yet): multiple-audiogram comparison, no-response rendering as a modifier on the base symbol per ISO/ASHA, PTA/SRT summary row.

### 2. Values tables — one per ear (the actual code change)

Per `screenshots/example01.png`, there are **two separate tables** (Right ear, Left ear), each showing all test conditions for that ear across all frequencies. They sit below the chart row, side by side, mirroring the chart layout above.

**New files**:
- `src/components/audiogram/audiogram-table.tsx` — single ear table (used twice)
- `src/components/audiogram/audiogram-data.ts` — normalized type + adapters

**Edited files**: `src/components/audiogram/audiogram-app.tsx`, `src/assets/scss/_audiogram.scss`, `package.json` (add ag-grid)

#### Library: ag-grid

Use **ag-grid-community** + **ag-grid-react** (MIT licensed, no external data calls — confirmed self-contained, fits the privacy-respecting tooling rule). The community edition supports cell editing, custom cell renderers, and crucially the `readOnlyEdit` / `cellEditRequest` pattern needed for the batched save flow described below.

Add to `package.json` and `webpack/main.config.js` if needed (no externalization — bundle it). Estimated bundle impact: ~500KB gzipped, only loaded by the audiogram app.

#### Editable mode + batched save/cancel

**Yes**, ag-grid can absolutely do the save-on-confirm flow you described. The mechanism:

1. Set `readOnlyEdit={true}` on the grid. In this mode ag-grid does **not** mutate row data when a user finishes editing a cell — instead it fires a `cellEditRequest` event with the new value.
2. We keep two pieces of state in the table component: `committedRows` (the last server-confirmed snapshot) and `draftRows` (the local working copy). The grid binds to `draftRows`.
3. On `cellEditRequest`, update `draftRows` only, and bubble the new draft up to `AudiogramApp` via an `onDraftChange` callback so the **chart re-renders live** as the user types. The chart already accepts data via the trace config; we'll route the draft through a small `DataOverrideContext` that the chart hook (option B fetch path) consults before falling back to the URL fetch. Implementation note: since the audiogram app uses `ChartWithEffect` directly, we'll need a thin wrapper that injects the override — see "live preview wiring" below.
4. Render Save / Cancel buttons above the tables (or in a floating action bar) that appear only when `draftRows !== committedRows`:
   - **Save**: PATCH the diff back to the URL endpoint (only meaningful once Q2 — file vs ERMrest — is answered; for V4 the button is wired but the network call is stubbed with a TODO and a console.log of the diff).
   - **Cancel**: `setDraftRows(committedRows)` — chart snaps back.
5. Browser-tab-close guard: a `beforeunload` listener while there are unsaved drafts.

**Live preview wiring**: the cleanest way to feed `draftRows` into the chart without touching `useChartData` is to lift the data fetch out of the chart hook for the audiogram app specifically — i.e., move to "Option A" (fetch in `AudiogramApp`, pass down) instead of "Option B" (fetch in table). This is a reversal of the earlier recommendation, prompted by the live-edit requirement. Plan:

- `AudiogramApp` fetches the JSON once via `ConfigService.http.get`, normalizes via `normalizeAudiogramRows`, holds it in `committedRows`.
- It passes `draftRows` (== `committedRows` initially) to **both** the chart wrapper and the two tables.
- The chart wrapper builds the Plotly traces directly from `draftRows` (bypassing `useChartData`'s URL fetch). Since the existing audiogram code already uses `ChartWithEffect` from the plot app, we'll need a small `audiogram-chart.tsx` that constructs Plotly figures from normalized data + the symbol/marker config (which moves out of the user-facing config — see "audiogram-specific config" point in progress-02). The existing `patchShowLegend` logic moves there too.
- This is a bigger change than originally planned, but it's the right shape for editing and it removes the awkward "fetch twice" duplication.

**Editing UX details for the meeting** (to capture in progress-02):
- Only `level` cells are editable; frequency labels are not.
- Valid range: -10 to 120 dB HL; ag-grid `valueParser` rejects out-of-range and reverts.
- Empty string clears the cell (sets level to null = "no measurement").
- A separate "no response" toggle per cell (right-click menu or a checkbox column) — defer until Q1a is answered.
- Using the audiogram app **as an input form**: this is a natural extension once editing works, but adding a *new* audiogram requires picking a subject/visit/dataset first. Out of scope for V4; flag in progress-02 as a meeting topic. Likely path: Chaise's existing record-create flow creates the empty audiogram row, then redirects to the audiogram app with `?id=<rid>` to fill it in.

#### Per-ear table layout

Each table:
- Rows = frequencies (250, 500, 1000, 2000, 3000, 4000, 6000, 8000) — frequency column pinned left.
- Columns = the test conditions present for that ear (AC Unmasked, AC Masked, BC Unmasked, BC Masked, [SF Aided, SF Unaided, ULL if present], No Response).
- Header cell renders the ISO/ASHA symbol for that condition (reusing the SVG renderers from `audiogram-legend.tsx`) above the text label. Matches the example screenshot.
- Cell renderer: numeric value, italic/grey if it's a no-response, empty for null.
- Right-ear table uses red header accents, left-ear uses blue, matching the chart colors.

#### Component signature

```ts
type AudiogramTableProps = {
  ear: 'right' | 'left';
  rows: AudiogramMeasurement[];        // draftRows filtered to this ear
  onCellEdit: (edit: { frequency: number; testType: string; level: number | null }) => void;
  editable: boolean;
};
```

#### Data flow

The chart currently fetches its own data inside `ChartWithEffect` → `useChartData` (`src/hooks/chart.ts`). The table needs the same rows but lives outside that hook. Options:

- **A.** Fetch once at the `AudiogramApp` level using `ConfigService.http.get` and pass the rows down to both charts and the table. This is the clean option but requires bypassing/refactoring the plot hook's internal fetch.
- **B.** Fetch a second time inside the table component using the same `url_pattern` (templated identically). The browser HTTP cache makes this cheap, and it lets us ship the table without touching `chart.ts`.

**Recommendation: B for now.** Reason: the plot hook is ~1900 lines and its data plumbing is shared with the generic plot app — changing it risks regressing the other apps before tomorrow's meeting. A duplicate fetch of a single small JSON is fine. We can promote to A in a follow-up once we introduce the audiogram-specific config.

The table component will:

1. Read `traces[0].url_pattern` from `config.plots[0]` (right ear) — left ear shares the same URL in current samples; if they ever differ, fetch both and merge.
2. Resolve the URL using the same template-resolution helper the plot app uses (`src/utils/plot-utils.ts` — `getPatternUri` / similar). Need to confirm exact export name during implementation.
3. `ConfigService.http.get(url)` (Chaise-aware client, per CLAUDE.md — never raw fetch).
4. Normalize the wide rows into the internal shape `{ frequency, ear, testType, level, noResponse }[]` via a `normalizeAudiogramRows` helper colocated in `src/components/audiogram/audiogram-data.ts` (new). This is the seam where future option-1/option-3 adapters plug in.
5. Render a table grouped by frequency: rows = frequencies (250, 500, 1000, 2000, 3000, 4000, 6000, 8000), columns = (Right AC Unmasked, Right AC Masked, Right BC Unmasked, Right BC Masked, Left AC Unmasked, Left AC Masked, Left BC Unmasked, Left BC Masked). Empty cells for nulls. No-response rendered as the level value with a trailing `↓` (matches V3 chart approximation; revisit when Q1a is answered).

#### Layout

Add a third row to `.audiogram-page` below the existing `.audiogram-layout` row:

```
[ right ear plot │ legend │ left ear plot ]
[              values table              ]
```

Stylesheet additions in `_audiogram.scss`: a `.audiogram-table` block with a thin border, monospaced cells for numeric alignment, sticky frequency column, and a header row that visually separates Right vs Left with a subtle background.

#### Component signature

```ts
type AudiogramTableProps = {
  rightUrl: string;
  leftUrl: string; // same in current samples; kept separate for flexibility
  templateParams: PlotTemplateParams; // pass-through for url templating
};
```

`AudiogramApp` will resolve URLs from `config.plots[0|1].traces[0].url_pattern` and pass them in.

## Critical files

- `src/components/audiogram/audiogram-app.tsx` — fetch data once, hold draft state, render chart row + two-table row + save/cancel bar.
- `src/components/audiogram/audiogram-chart.tsx` (new) — replaces direct use of `ChartWithEffect` for the audiogram app; builds Plotly figure from `AudiogramMeasurement[]` + hard-coded ISO/ASHA symbol map.
- `src/components/audiogram/audiogram-table.tsx` (new) — single ag-grid table for one ear, parameterized by `ear` prop.
- `src/components/audiogram/audiogram-data.ts` (new) — `AudiogramMeasurement` type, `normalizeAudiogramRows()` adapter (seam for switching encodings), `denormalizeForSave()` for the save path.
- `src/components/audiogram/audiogram-symbols.ts` (new) — hard-coded ISO/ASHA symbol map (color, marker, text-character) keyed by `(ear, testType)`. Replaces the per-trace marker/textSymbol arrays in the current sample config.
- `src/assets/scss/_audiogram.scss` — `.audiogram-tables-row` and `.audiogram-table` styles, ag-grid theme override.
- `src/utils/plot-utils.ts` — reuse existing Handlebars URL templating helper for `url_pattern` resolution.
- `package.json`, `webpack/main.config.js` — add `ag-grid-community` and `ag-grid-react`.
- `docs/dev-docs/audiogram/progress-02.md` (new) — meeting prep doc.
- `docs/dev-docs/audiogram/audiogram.json` — unchanged; current sample drives both chart and tables.

## Verification

1. `make dist` — confirm build passes.
2. Local: load `audiogram/?config=audiogram` against the dev sample (`/~ashafaei/plot-test-data/audiogram.json`) and visually confirm:
   - Two tables appear below the chart row, right under the corresponding ear plot.
   - Each table has frequency rows down the left and one column per test condition with the ISO/ASHA symbol in the header.
   - Values match what's plotted (spot-check 250/500/1000/4000).
   - Null cells render empty; no-response cells visually distinguished.
3. Editing flow:
   - Click a level cell, type a new value, press Tab/Enter — chart updates live, Save/Cancel buttons appear.
   - Edit a second cell — both pending in draft, chart reflects both.
   - Click Cancel — chart and tables snap back, buttons disappear.
   - Edit again, click Save — `console.log` shows the diff payload (network call stubbed pending Q2).
   - Out-of-range value (e.g. 200) is rejected by the value parser.
4. Query-param templating:
   - With a `url_pattern` containing `{{$url_parameters.Foo}}`, load `audiogram/?config=audiogram&Foo=bar` and confirm the resolved URL in the network tab contains `bar`.
3. `make lint` clean.
4. No regression in the plot/heatmap/matrix apps (unchanged code paths).

## Out of scope for this change

- Editing values in the table.
- Switching to option-1 or option-3 storage shape.
- Replacing `plot-config` with an `audiogram-config` schema.
- Promoting the table fetch from "duplicate request" to "shared with chart hook".
- Fixing the no-response symbol to match ISO/ASHA exactly.

These are tracked in `progress-02.md` for the meeting.
