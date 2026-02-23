# Audiogram App — Dev Guide

## Test Environment

- **Base URL**: `https://dev.facebase.org/~ashafaei/deriva-webapps/`
- **Sample data**: `/~ashafaei/plot-test-data/audiogram.json` (flat JSON, one row per frequency step) — local copy at `docs/dev-docs/audiogram/audiogram.json`
- **Repo branch**: `audiogram`


## Version History

### V1 — `audiogram-icon-01` (plot app, approximate icons)

**URL**: `https://dev.facebase.org/~ashafaei/deriva-webapps/plot/?config=audiogram-icon-01`

Uses the existing plot app with scatter traces. Bone conduction symbols rendered as Unicode text on the plot, with approximate Plotly marker shapes in the legend.

**Test types shown**: Air Unmasked, Air Masked, Bone Unmasked (mastoid), Bone Masked (mastoid), SF Aided, SF Unaided, ULL, No Response

**Limitation**: Legend icons are Plotly approximations — `◁` instead of `<`, `□` instead of `[`, and "Aa" for symbols with no Plotly equivalent.


### V2 — `audiogram-icon-02` (plot app, ISO/ASHA standard)

**URL**: `https://dev.facebase.org/~ashafaei/deriva-webapps/plot/?config=audiogram-icon-02`

Strictly follows the ISO/ASHA standard symbol table. Removes non-standard SF/ULL traces. Adds forehead bone conduction.

**Test types shown:**

| Symbol (R) | Symbol (L) | Test type |
|:-:|:-:|---|
| ○ | × | Air conduction — Unmasked |
| △ | □ | Air conduction — Masked |
| `<` | `>` | Bone conduction — Unmasked, mastoid |
| `[` | `]` | Bone conduction — Masked, mastoid |
| `∨` | `∨` | Bone conduction — Unmasked, forehead |
| `¬` | `⌐` | Bone conduction — Masked, forehead |
| ↓ | ↓ | No Response |

**Limitation**: Same legend icon problem as V1 — Plotly has no API to render arbitrary text characters as legend icons.


### V3 — `audiogram` standalone app

**URL**: `https://dev.facebase.org/~ashafaei/deriva-webapps/audiogram/`

A new standalone app (separate from the generic plot app). Three-column layout: right ear plot | custom HTML legend | left ear plot. Plotly's built-in legend is hidden on both charts; the legend in the middle column renders exact symbols using inline SVG (for marker-type symbols) and raw Unicode text (for `<`, `[`, `>`, `]`, etc.).

**Test types in current config sample** (ISO/ASHA mastoid conditions):

| Symbol (R) | Symbol (L) | Test type |
|:-:|:-:|---|
| ○ | × | Air conduction — Unmasked |
| △ | □ | Air conduction — Masked |
| `<` | `>` | Bone conduction — Unmasked, mastoid |
| `[` | `]` | Bone conduction — Masked, mastoid |
| ○↓ | ×↘ | No Response (approximation — see note below) |

**Not yet in config** (pending answers to Q1 below):
- Forehead bone conduction: `∨` / `¬` / `⌐`
- Non-standard clinical types: SF Aided, SF Unaided, ULL

**Note on No Response**: Per the ISO/ASHA standard (see `audiogram/screenshots/icons.png`), a no-response result is indicated by drawing a short arrow from the base test-type symbol — e.g., a circle with a downward arrow for right AC unmasked, an X with a diagonal arrow for left AC unmasked. It is not a standalone symbol type. The current implementation uses a separate `arrow-down` Plotly marker as an approximation. Implementing the exact standard symbol would require either a custom Plotly SVG marker path or a separate overlay trace, and the correct approach depends on how no-response is stored in the database (see Q1a below).


## Open Questions


### Q1 — Which test types are in your data?

Below is the full list of conditions across both versions. Please confirm which exist in your database.

**ISO/ASHA standard:**

| Symbol R | Symbol L | Test type | In your data? |
|:-:|:-:|---|:-:|
| ○ | × | Air conduction — Unmasked | ✅ in sample |
| △ | □ | Air conduction — Masked | ✅ in sample |
| `<` | `>` | Bone conduction — Unmasked, mastoid | ✅ in sample |
| `[` | `]` | Bone conduction — Masked, mastoid | ✅ in sample |
| `∨` | `∨` | Bone conduction — Unmasked, forehead | ? |
| `¬` | `⌐` | Bone conduction — Masked, forehead | ? |

**Non-standard / clinical additions (not in ISO/ASHA):**

| Symbol R | Symbol L | Test type | In your data? |
|:-:|:-:|---|:-:|
| A | A | Soundfield — Aided | ? |
| S | S | Soundfield — Unaided | ? |
| L | J | Uncomfortable Loudness Level (ULL) | ? |

**Q1a — How is "no response" stored?**

The ISO/ASHA standard doesn't have a separate "No Response" test type — it's a modifier on any result: the base symbol (○, ×, `<`, etc.) is drawn with an arrow appended. There are two common ways this ends up in a database:

- **Option A** — a boolean flag per measurement (e.g. a `no_response` column alongside each level column). The base symbol stays the same; only the rendering changes.
- **Option B** — a separate set of columns for no-response results (e.g. `Frequency_Right_No_Response`, `Level_Right_No_Response`), where the symbol used is always AC Unmasked with an arrow.

Which does your data use, and which test types can have a no-response result?

### Q2 — How is audiogram data stored in your database?

The answer affects both how the chart app fetches data and how difficult an editable table would be to add later.

**Option A — Flat (wide)**: one row per frequency step, one column per (ear × test-type) combination. This is what the current sample data uses.

```
Frequency_Right_Air_Unmasked | Level_Right_Air_Unmasked | Frequency_Left_Air_Unmasked | ...
250                          | 20                       | 250                         | ...
500                          | 30                       | 500                         | ...
```

Local sample: `docs/dev-docs/audiogram/audiogram.json`

**Option B — Normalized (tall)**: one row per measurement. No nulls; missing frequencies simply have no row.

```
subject_id | ear   | test_type    | frequency_hz | level_db_hl
1          | Right | Air_Unmasked | 250          | 20
1          | Left  | Air_Unmasked | 250          | 50
1          | Right | Air_Masked   | 500          | 10
```

Local sample: `docs/dev-docs/audiogram/audiogram-normalized.json`

Both formats can drive the chart (the app pivots the data before plotting). The difference matters if an editable table is needed: the normalized format maps directly to ERMrest rows, making per-cell edits a single PATCH. The flat format works for display but is awkward to edit in a relational DB.

Which format does your database use, and what are the actual column/field names?
