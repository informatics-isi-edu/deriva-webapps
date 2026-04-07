# Audiogram — Progress 02

Meeting prep doc covering V4 (values tables, editing, query-param deep links).

> **Scope decision (locked-in)**: we're sticking strictly to the **ISO/ASHA standard**. The non-standard clinical additions previously listed in V2/V3 (Soundfield Aided, Soundfield Unaided, Uncomfortable Loudness Level) are **out**. The data model, symbols map, table layout, and chart traces all assume the six ISO/ASHA conditions only:
>
> - AC Unmasked / Masked
> - BC Unmasked / Masked (mastoid)
> - BC Unmasked / Masked (forehead)
>
> Q1 in `progress-01.md` is therefore narrowed to "do you have forehead BC measurements?" — the SF/ULL rows there can be ignored.

## Status recap

V3 shipped on the `audiogram` branch as a standalone app at `audiogram/?config=audiogram`. Three-column layout (right plot | custom HTML legend | left plot), Plotly's built-in legend hidden, ISO/ASHA symbols rendered as inline SVG / Unicode in the centre legend column. Reuses the plot-app config schema and `ChartWithEffect`.

Open questions from `progress-01.md` still pending the meeting:

- **Q1** — Which test types are actually in the data (forehead BC, SF aided/unaided, ULL)?
- **Q1a** — How is *no response* encoded? Boolean flag on a measurement, or a separate set of columns?
- **Q2** — Storage format: file vs ERMrest; flat (option 2) vs long (option 1) vs fully wide (option 3)?

## Storage: file vs database

The chart's read path doesn't care which it is. The trace's `url_pattern` resolves to a static JSON URL or to an ERMrest query URL — both come back as JSON the audiogram app can consume.

The decision matters for two things:

- **Editing.** Per-cell PATCH against ERMrest is one HTTP call per change (or one batched bulk update). Editing a static JSON file in place is awkward — you need a writable endpoint that accepts a full file replacement, and you lose history/audit unless layered on top.
- **Cross-audiogram queries.** "Show me all audiograms for subject X" or faceting by subject/visit/diagnosis only works cleanly if the data lives in ERMrest.

**Argument for "file per audiogram"**: simplest to author, diff-friendly in git, no schema migration when test types change, trivial to copy/share.
**Argument against**: doesn't compose with ERMrest faceting, makes editing+audit harder, doesn't scale to "browse all audiograms".

**Recommendation**: support both via `url_pattern` from day one (already true). Defer the binding decision until the meeting. The V4 code is backend-agnostic for read; the editing path stubs the save call so we can wire it to either backend later.

## Row encoding — three options

### Option 1 — long (one row per measurement)

```
audiogram_id | ear   | test_type    | frequency | level | masked | no_response
A1           | Right | air          | 250       | 20    | false  | false
A1           | Right | air          | 500       | 30    | false  | false
A1           | Left  | bone         | 1000      | 70    | false  | false
```

- **Read**: needs a pivot in the app (group by frequency/ear) before plotting.
- **Edit**: one PATCH per cell maps to one row. Adding a measurement = one INSERT. Removing = one DELETE. Cleanest for ERMrest.
- **Schema growth**: adding a new test type is data-only, no schema change.
- **Querying**: trivial — "all left-ear bone measurements for subject X" is one filter.

### Option 2 — semi-wide (one row per frequency) — **what the current sample uses**

```
Frequency_Right_Air_Unmasked | Level_Right_Air_Unmasked | Frequency_Right_Air_Masked | …
250                          | 20                       | null                       | …
500                          | 30                       | 500                        | …
```

- **Read**: plots directly without pivoting (the current code consumes this).
- **Edit**: a single cell edit becomes a PATCH against one column of one row. Workable but column count grows fast.
- **Schema growth**: adding a test type means adding columns (a schema migration in ERMrest).
- **Querying**: awkward — "all bone unmasked for left ear" requires referencing a specific column.

### Option 3 — fully wide (one row per audiogram)

```
audiogram_id | left_air_unmasked_250 | left_air_unmasked_500 | … | right_bone_masked_8000
A1           | 50                    | 50                    | … | null
```

- **Read**: needs an "unflatten by frequency" pass. Dozens of columns per row.
- **Edit**: one row per audiogram is convenient for "open this audiogram, edit all of it, save once".
- **Schema growth**: every new test type **and** every new frequency adds columns. Most rigid of the three.
- **Querying**: easiest to join to subject metadata (one row = one audiogram), hardest to filter by measurement.

### Switching cost

In all three cases the only file that changes is `src/components/audiogram/audiogram-data.ts`, which exposes a `normalizeAudiogramRows()` adapter and an `AudiogramMeasurement[]` internal shape. Plot code, table code, and the symbol/marker map all consume the normalized array. Picking the wrong storage shape now is a one-file fix later.

**Recommendation**: standardize the in-memory shape on something close to option 1 (long), and write a thin adapter from whichever storage shape gets chosen. Default the dev sample to option 2 (no change). If we get pushback toward option 3 from clinicians, we can ship a second sample to react to.

## Audiogram-specific config

The current sample piggybacks on the plot-app config schema. After looking at what V4 actually needs, the user should only specify:

- `url_pattern` — where to fetch the audiogram from. Supports `{{$url_parameters.X}}` Handlebars substitution.
- (optional) `title_markdown_pattern` — page title.
- (optional) which test types to render (subset of the ISO/ASHA list).
- (optional) per-app subject/visit metadata for the page header.

**Should not be in config**: symbols, colors, marker shapes, axis ranges, ISO/ASHA legend ordering. Those are properties of the audiogram standard, not of any particular dataset, and live in `audiogram-symbols.ts` in the app.

For now V4 keeps the plot-config syntax (it works, no migration needed) but only reads `plots[0].traces[0].url_pattern` and the layout `xaxis`/`yaxis` blocks. Once Q2 is answered we can introduce a proper `audiogram-config` schema.

## URL templating / query params

The audiogram app must support per-instance deep links like:

```
audiogram/?config=audiogram&Subject_RID=ABC&Visit=2
```

The plot app already does this (`src/hooks/chart.ts:471`): query params get walked into `templateParams.$url_parameters` and the trace's `url_pattern` is rendered with `ConfigService.ERMrest.renderHandlebarsTemplate`. The audiogram app inherits this through `usePlot()` / `PlotAppProvider`, but because V4 lifts the data fetch out of the chart hook (see "Editing" below), `AudiogramApp` now templates the URL itself via the same helper.

**Example link template** (for callers who want to deep-link to a specific audiogram):

```
{{{$catalog.snapshot}}}/audiogram/?config=audiogram&audiogram_rid={{{RID}}}
```

with a sample `url_pattern` in the config:

```
/ermrest/catalog/{{$catalog.id}}/entity/Audiogram/RID={{$url_parameters.audiogram_rid}}
```

**Verification**: load `audiogram/?config=audiogram&Foo=bar` against a sample whose `url_pattern` contains `{{$url_parameters.Foo}}` and confirm the resolved URL in the network tab contains `bar`.

## Values tables (V4 — implemented)

Two ag-grid tables, one per ear, sit below the chart row mirroring the example screenshot (`screenshots/example01.png`):

```
[ right ear plot │ legend │ left ear plot ]
[   right table             left table    ]
```

Each table:
- Pinned-left frequency column.
- One column per test condition present in the data, with the ISO/ASHA symbol in the header (rendered via the same SVG helpers used by the legend).
- Numeric values in the cells; nulls render as empty; no-response values get a trailing `↓`.
- Right ear is red-accented, left ear is blue.

**Why ag-grid**: MIT-licensed community edition, no telemetry / no external calls, supports `readOnlyEdit` mode (the pattern needed for the batched save flow), and gives us free niceties like keyboard navigation, copy/paste, and column resize. Bundle impact ~500KB gzipped, audiogram-app only.

## Editing — batched save/cancel with live preview

**ag-grid `readOnlyEdit`** is the right primitive: when the user finishes editing a cell, ag-grid does **not** mutate the row data — it fires a `cellEditRequest` event with the new value. We catch that in our component and route the change through React state instead.

State model in `AudiogramApp`:

- `committedRows`: the last server-confirmed snapshot.
- `draftRows`: local working copy. Initially `=== committedRows`.

Both tables and the chart bind to `draftRows`. So as the user types in a cell:

1. ag-grid fires `cellEditRequest` → table calls `onCellEdit(...)` → `AudiogramApp` updates `draftRows`.
2. The chart re-renders from the new `draftRows` immediately.
3. `draftRows !== committedRows` so the floating Save / Cancel bar appears.

**Save**: computes the diff `(draftRows ↔ committedRows)`, batches it into a single update payload, and (in V4) `console.log`s the diff with a TODO comment. The actual network call is wired once Q2 is answered. On success → `setCommittedRows(draftRows)`.

**Cancel**: `setDraftRows(committedRows)`. Chart and tables snap back instantly.

**Tab-close guard**: a `beforeunload` listener while there are unsaved drafts.

**Validation**:
- Only `level` cells are editable.
- Valid range: -10 to 120 dB HL — out-of-range edits are rejected by the value parser and the cell reverts.
- Empty string clears the cell (sets level to `null`).
- A separate "no response" toggle per cell is deferred until Q1a is answered.

## Audiogram app as an input form

Once editing works, the natural extension is to use the audiogram app to **author** new audiograms, not just edit existing ones. Caveat: an audiogram needs to be associated with a subject/visit/dataset, and choosing those is a record-creation flow that doesn't belong inside the audiogram app.

**Likely path**:
1. Chaise's existing record-create flow creates an empty audiogram row with FKs to subject/visit.
2. Chaise redirects to `audiogram/?config=audiogram&audiogram_rid=<new_rid>`.
3. The audiogram app loads (empty grid, all nulls) and the user fills it in.
4. Save commits the measurements.

**Out of scope for V4** but worth discussing in the meeting — affects the answer to Q2 (the editing model nudges us toward ERMrest, since file-creation flows don't compose with Chaise).

## Optional follow-ups (meeting topics, not in V4)

- **Multiple-audiogram comparison**: overlay two audiograms (e.g. before/after intervention) in the same chart with reduced opacity for the prior one.
- **Exact ISO/ASHA no-response rendering**: a modifier on the base symbol (arrow appended to the existing symbol), rather than a separate marker. Requires either a custom Plotly SVG marker path or a paired overlay trace per condition.
- **PTA / SRT summary row**: pure tone average and speech reception threshold computed from the measurements, shown above or below the tables.
- **Per-cell history / audit**: who edited what and when. Free with ERMrest, expensive with files.
- **Hover sync**: hovering a frequency in the chart highlights the corresponding row in the tables, and vice versa.

## V4 file inventory

- `src/components/audiogram/audiogram-app.tsx` — fetch, draft state, layout.
- `src/components/audiogram/audiogram-chart.tsx` (new) — builds Plotly figure from `AudiogramMeasurement[]`.
- `src/components/audiogram/audiogram-table.tsx` (new) — single-ear ag-grid table.
- `src/components/audiogram/audiogram-data.ts` (new) — `AudiogramMeasurement` type + normalize/denormalize/diff.
- `src/components/audiogram/audiogram-symbols.ts` (new) — ISO/ASHA symbol map (color/marker/text).
- `src/components/audiogram/audiogram-legend.tsx` — unchanged.
- `src/assets/scss/_audiogram.scss` — adds `.audiogram-tables-row`, `.audiogram-table`, save/cancel bar.
- `package.json` — adds `ag-grid-community`, `ag-grid-react`.
