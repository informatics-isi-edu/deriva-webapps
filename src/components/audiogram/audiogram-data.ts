/**
 * Audiogram data model.
 *
 * The audiogram app consumes a normalized in-memory shape regardless of how
 * the data is stored on the wire. This file is the only place that knows
 * about the storage shape; switching from option 2 (current sample, semi-wide)
 * to option 1 (long) or option 3 (fully wide) means rewriting the adapters
 * here, and nothing else.
 *
 * See docs/dev-docs/audiogram/progress-02.md "Row encoding" for the trade-offs.
 */

export type Ear = 'right' | 'left';

/**
 * Test conditions defined by the ISO/ASHA standard, plus the non-standard
 * additions we render today. The string is used as a stable key for the
 * symbol map and as the cell renderer's column id.
 */
export type TestType =
  | 'air_unmasked'
  | 'air_masked'
  | 'bone_unmasked_mastoid'
  | 'bone_masked_mastoid';

/**
 * Used by the table renderer to draw a thicker border between the AC and
 * BC groups, matching screenshots/example01.png.
 */
export function testTypeGroup(t: TestType): 'AC' | 'BC' {
  return t.startsWith('air_') ? 'AC' : 'BC';
}

/**
 * The internal canonical shape — one entry per (ear, test type, frequency).
 * `level === null` means "no measurement at this frequency".
 * `noResponse === true` means the patient did not respond at the masking
 * limit (the level field still holds the limit value used).
 */
export type AudiogramMeasurement = {
  ear: Ear;
  testType: TestType;
  frequency: number; // Hz
  level: number | null; // dB HL
  noResponse: boolean;
};

/** Default frequency rows shown by the table, in render order (the doc's set). */
export const STANDARD_FREQUENCIES: number[] = [125, 250, 500, 1000, 2000, 4000, 8000];

/**
 * The frequency rows the table renders: the default set unioned with any
 * frequency that actually appears in the data, sorted ascending. Keeps both
 * ear tables aligned and surfaces custom/extended frequencies present in a record.
 */
export function tableFrequencies(measurements: AudiogramMeasurement[]): number[] {
  const set = new Set<number>(STANDARD_FREQUENCIES);
  for (const m of measurements) set.add(m.frequency);
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * Maps the option-2 (semi-wide) JSON column names from the dev sample
 * to (ear, test type) pairs. Adding a new column just means adding an
 * entry here.
 */
const WIDE_COLUMN_MAP: Record<string, { ear: Ear; testType: TestType }> = {
  Right_Air_Unmasked: { ear: 'right', testType: 'air_unmasked' },
  Right_Air_Masked: { ear: 'right', testType: 'air_masked' },
  Right_Bone_Unmasked: { ear: 'right', testType: 'bone_unmasked_mastoid' },
  Right_Bone_Masked: { ear: 'right', testType: 'bone_masked_mastoid' },
  Left_Air_Unmasked: { ear: 'left', testType: 'air_unmasked' },
  Left_Air_Masked: { ear: 'left', testType: 'air_masked' },
  Left_Bone_Unmasked: { ear: 'left', testType: 'bone_unmasked_mastoid' },
  Left_Bone_Masked: { ear: 'left', testType: 'bone_masked_mastoid' },
};

/**
 * Per-ear stored summary values from the audiogram record, as display
 * strings ('' = not recorded, 'NR' = recorded as no-response).
 */
export type AudiogramSummaryValues = {
  /** the case the audiogram belongs to: RID and its number (from the `case_number` projection), '' when unknown */
  caseRid: string;
  caseNumber: string;
  srt: { right: string; left: string };
  wordId: { right: string; left: string };
  wordIdLevel: { right: string; left: string };
  ucl: { right: string; left: string };
  tympanogram: { right: string; left: string };
};

/**
 * Adapter: earbase:diagnostic_test row (an Audiometric Test) → AudiogramSummaryValues.
 * Column names follow FaceBase's "<Measure> <Ear>" style ("SRT Left",
 * "Word ID Left No Response").
 *
 * TODO: the column names here and in normalizeLongRows (ear, conduction_type,
 * frequency, level_db, masked, no_response) are hardcoded to the earbase
 * model. They should come from a column mapping in audiogram-config.js so the
 * app works against any model without a code change.
 */
export function normalizeSummaryRow(row: any): AudiogramSummaryValues {
  const val = (v: any, nr?: any) => (nr ? 'NR' : v == null ? '' : String(v));
  const ear = (e: 'Left' | 'Right') => ({
    srt: val(row[`SRT ${e}`], row[`SRT ${e} No Response`]),
    wordId: val(row[`Word ID ${e}`], row[`Word ID ${e} No Response`]),
    wordIdLevel: val(row[`Word ID Level ${e}`]),
    ucl: val(row[`UCL ${e}`], row[`UCL ${e} No Response`]),
    tympanogram: val(row[`Tympanogram Type ${e}`]),
  });
  const left = ear('Left');
  const right = ear('Right');
  return {
    caseRid: row.case == null ? '' : String(row.case),
    caseNumber: row.case_number == null ? '' : String(row.case_number),
    srt: { right: right.srt, left: left.srt },
    wordId: { right: right.wordId, left: left.wordId },
    wordIdLevel: { right: right.wordIdLevel, left: left.wordIdLevel },
    ucl: { right: right.ucl, left: left.ucl },
    tympanogram: { right: right.tympanogram, left: left.tympanogram },
  };
}

/**
 * Adapter: option-1 (long) ERMrest rows → AudiogramMeasurement[].
 *
 * One input row per (ear, conduction, frequency) from earbase:pure_tone_threshold:
 * `ear` ("Left"/"Right"), `conduction_type` ("Air"/"Bone"), `frequency`
 * (vocabulary name like "250 Hz", parsed to its leading number), `level_db`,
 * `masked`, `no_response`. Masked picks the *_masked test type; a
 * no-response row keeps its level (the tested limit).
 */
function normalizeLongRows(rows: any[]): AudiogramMeasurement[] {
  const out: AudiogramMeasurement[] = [];
  for (const row of rows) {
    const ear: Ear = String(row.ear).toLowerCase() === 'right' ? 'right' : 'left';
    const bone = String(row.conduction_type).toLowerCase() === 'bone';
    const masked = Boolean(row.masked);
    const testType: TestType = bone
      ? (masked ? 'bone_masked_mastoid' : 'bone_unmasked_mastoid')
      : (masked ? 'air_masked' : 'air_unmasked');
    const frequency = parseInt(String(row.frequency), 10);
    if (Number.isNaN(frequency)) continue;
    out.push({
      ear,
      testType,
      frequency,
      level: row.level_db == null ? null : Number(row.level_db),
      noResponse: Boolean(row.no_response),
    });
  }
  return out;
}

/**
 * Adapter: option-2 (semi-wide) JSON rows → AudiogramMeasurement[].
 *
 * Each input row has Frequency_<Ear>_<Test> + Level_<Ear>_<Test> column
 * pairs. A row may carry several test types (one per pair). For the
 * "No Response" pair, the level value (e.g. 120) is the masking limit
 * and we mark the corresponding (ear, AC unmasked) measurement at that
 * frequency as no-response.
 */
export function normalizeAudiogramRows(rows: any[]): AudiogramMeasurement[] {
  if (!Array.isArray(rows)) return [];
  if (rows.length && rows[0] && 'conduction_type' in rows[0]) return normalizeLongRows(rows);
  const out: AudiogramMeasurement[] = [];

  // First pass: regular measurements.
  for (const row of rows) {
    for (const [suffix, key] of Object.entries(WIDE_COLUMN_MAP)) {
      const freq = row[`Frequency_${suffix}`];
      const level = row[`Level_${suffix}`];
      if (freq == null) continue;
      out.push({
        ear: key.ear,
        testType: key.testType,
        frequency: Number(freq),
        level: level == null ? null : Number(level),
        noResponse: false,
      });
    }
  }

  // Second pass: no-response markers. Per the open question Q1a in
  // progress-01.md the dev sample stores no-response in dedicated
  // Frequency_<Ear>_No_Response / Level_<Ear>_No_Response columns. We
  // attach them to the AC unmasked measurement at that frequency, or
  // synthesize a placeholder if none exists.
  for (const row of rows) {
    for (const ear of ['Right', 'Left'] as const) {
      const freq = row[`Frequency_${ear}_No_Response`];
      const level = row[`Level_${ear}_No_Response`];
      if (freq == null) continue;
      const earKey: Ear = ear === 'Right' ? 'right' : 'left';
      const existing = out.find(
        (m) => m.ear === earKey && m.testType === 'air_unmasked' && m.frequency === Number(freq),
      );
      if (existing) {
        existing.noResponse = true;
        if (level != null) existing.level = Number(level);
      } else {
        out.push({
          ear: earKey,
          testType: 'air_unmasked',
          frequency: Number(freq),
          level: level == null ? null : Number(level),
          noResponse: true,
        });
      }
    }
  }

  return out;
}

/**
 * For computing the diff payload on Save. Returns measurements that
 * differ between two snapshots. Used to log the pending edits today;
 * will feed the actual PATCH payload once Q2 is answered.
 */
export function diffMeasurements(
  before: AudiogramMeasurement[],
  after: AudiogramMeasurement[],
): { before: AudiogramMeasurement | null; after: AudiogramMeasurement | null }[] {
  const keyOf = (m: AudiogramMeasurement) => `${m.ear}|${m.testType}|${m.frequency}`;
  const byKeyBefore = new Map(before.map((m) => [keyOf(m), m]));
  const byKeyAfter = new Map(after.map((m) => [keyOf(m), m]));
  const allKeys = new Set([...byKeyBefore.keys(), ...byKeyAfter.keys()]);
  const out: { before: AudiogramMeasurement | null; after: AudiogramMeasurement | null }[] = [];
  for (const k of allKeys) {
    const b = byKeyBefore.get(k) ?? null;
    const a = byKeyAfter.get(k) ?? null;
    if (!b || !a || b.level !== a.level || b.noResponse !== a.noResponse) {
      out.push({ before: b, after: a });
    }
  }
  return out;
}

/**
 * Pure-tone average for an ear: mean of the AC unmasked thresholds at the
 * given frequencies (default 500/1000/2000 Hz), skipping no-response points.
 * Returns null when fewer than two have a value (a two-of-three average is
 * allowed), so we never show a misleading number.
 */
export function computePTA(
  measurements: AudiogramMeasurement[],
  ear: Ear,
  frequencies: number[] = [500, 1000, 2000],
): number | null {
  const levels: number[] = [];
  for (const f of frequencies) {
    const m = measurements.find(
      (x) =>
        x.ear === ear &&
        x.testType === 'air_unmasked' &&
        x.frequency === f &&
        x.level != null &&
        !x.noResponse,
    );
    if (m && m.level != null) levels.push(m.level);
  }
  if (levels.length < 2) return null;
  return Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
}

/** Find the test types actually present for an ear. Used to size the table columns. */
export function presentTestTypes(measurements: AudiogramMeasurement[], ear: Ear): TestType[] {
  const seen = new Set<TestType>();
  for (const m of measurements) {
    if (m.ear === ear) seen.add(m.testType);
  }
  return TABLE_TEST_TYPES.filter((t) => seen.has(t));
}

/**
 * The four test columns the table always shows even when the data has no
 * value for them, so the user can fill them in. ISO/ASHA order:
 * AC unmasked, AC masked, BC unmasked, BC masked.
 */
export const TABLE_TEST_TYPES: TestType[] = [
  'air_unmasked',
  'air_masked',
  'bone_unmasked_mastoid',
  'bone_masked_mastoid',
];
