/**
 * Audiogram data: the in-memory shape the app works with, and the adapters that read
 * threshold and audiogram rows into it, using the column names and values from the config.
 */

// models
import { CustomError } from '@isrd-isi-edu/chaise/src/models/errors';
import {
  AudiogramRecord,
  AudiogramSummaryMeasure,
  AudiogramThresholds,
} from '@isrd-isi-edu/deriva-webapps/src/models/audiogram-config';

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

/** the spec's default frequency set, for configs without default_frequencies */
export const STANDARD_FREQUENCIES: number[] = [125, 250, 500, 1000, 2000, 4000, 8000];

/**
 * The frequency rows the table renders: the default set unioned with any
 * frequency that actually appears in the data, sorted ascending. Keeps both
 * ear tables aligned and surfaces custom/extended frequencies present in a record.
 */
export function tableFrequencies(
  measurements: AudiogramMeasurement[],
  defaultFrequencies: number[],
): number[] {
  const set = new Set<number>(defaultFrequencies);
  for (const m of measurements) set.add(m.frequency);
  return Array.from(set).sort((a, b) => a - b);
}

/** projection alias for the case's display column, set by the audiogram request */
export const CASE_DISPLAY_ALIAS = 'case_display';

/** the threshold columns the config names */
export function thresholdColumnNames(thresholds: AudiogramThresholds): string[] {
  const columns = thresholds.columns;
  return [
    columns.ear,
    columns.conduction,
    columns.frequency,
    columns.level,
    columns.masked,
    columns.no_response,
  ];
}

/** the audiogram row columns the config names: the summary columns and the case column */
export function audiogramColumnNames(record: AudiogramRecord): string[] {
  const names: string[] = [];
  for (const measure of Object.values(record.summary)) {
    if (!measure) continue;
    names.push(measure.value.right, measure.value.left);
    if (measure.no_response) names.push(measure.no_response.right, measure.no_response.left);
  }
  if (record.case) names.push(record.case.column);
  return names;
}

/**
 * Throw when the row lacks a configured column. A config that doesn't match the data would
 * otherwise show an empty chart or blank summary cells without any error.
 */
export function checkConfiguredColumns(row: any, names: string[], block: string): void {
  const missing = names.filter((name) => !(name in row));
  if (missing.length > 0) {
    throw new CustomError(
      'Invalid Config',
      `The ${block} rows don't have these configured columns: ${missing.join(', ')}`,
    );
  }
}

/**
 * Per-ear stored summary values from the audiogram record, as display
 * strings ('' = not recorded, 'NR' = recorded as no-response).
 */
export type AudiogramSummaryValues = {
  caseRid: string;
  caseDisplay: string;
  pta: { right: string; left: string };
  srt: { right: string; left: string };
  wordId: { right: string; left: string };
  wordIdLevel: { right: string; left: string };
  ucl: { right: string; left: string };
  tympanogram: { right: string; left: string };
};

/** the audiogram row → stored summary values, through the configured columns */
export function normalizeSummaryRow(row: any, record: AudiogramRecord): AudiogramSummaryValues {
  const summary = record.summary;
  const caseRid = record.case ? row[record.case.column] : null;
  return {
    caseRid: caseRid == null ? '' : String(caseRid),
    caseDisplay: row[CASE_DISPLAY_ALIAS] == null ? '' : String(row[CASE_DISPLAY_ALIAS]),
    pta: summaryPair(row, summary.pta),
    srt: summaryPair(row, summary.srt),
    wordId: summaryPair(row, summary.word_id),
    wordIdLevel: summaryPair(row, summary.word_id_level),
    ucl: summaryPair(row, summary.ucl),
    tympanogram: summaryPair(row, summary.tympanogram),
  };
}

/** both ears of a measure as display text: '' when not recorded, 'NR' when flagged no response */
function summaryPair(row: any, measure: AudiogramSummaryMeasure | undefined) {
  return { right: summaryValue(row, measure, 'right'), left: summaryValue(row, measure, 'left') };
}

function summaryValue(row: any, measure: AudiogramSummaryMeasure | undefined, ear: Ear): string {
  if (!measure) return '';
  if (measure.no_response && row[measure.no_response[ear]]) return 'NR';
  const value = row[measure.value[ear]];
  return value == null ? '' : String(value);
}

/**
 * Threshold rows → AudiogramMeasurement[], one row per threshold. Column names and the ear and
 * conduction values come from the config. hzByName maps frequency names to hertz (from the
 * frequency vocabulary); a name it doesn't know falls back to the number in it ("250 Hz").
 * Rows with an unknown ear, conduction or frequency are skipped with a console warning.
 */
export function normalizeThresholdRows(
  rows: any[],
  thresholds: AudiogramThresholds,
  hzByName?: Map<string, number>,
): AudiogramMeasurement[] {
  const { columns, values } = thresholds;
  const out: AudiogramMeasurement[] = [];
  for (const row of rows) {
    const earValue = row[columns.ear];
    let ear: Ear;
    if (earValue === values.ear.right) ear = 'right';
    else if (earValue === values.ear.left) ear = 'left';
    else {
      warnSkipped('ear', earValue);
      continue;
    }

    const conductionValue = row[columns.conduction];
    let bone: boolean;
    if (conductionValue === values.conduction.bone) bone = true;
    else if (conductionValue === values.conduction.air) bone = false;
    else {
      warnSkipped('conduction', conductionValue);
      continue;
    }

    const frequencyValue = row[columns.frequency];
    let frequency = hzByName?.get(String(frequencyValue));
    if (frequency === undefined) frequency = parseInt(String(frequencyValue), 10);
    if (Number.isNaN(frequency) || frequency <= 0) {
      warnSkipped('frequency', frequencyValue);
      continue;
    }

    const masked = Boolean(row[columns.masked]);
    let testType: TestType;
    if (bone) testType = masked ? 'bone_masked_mastoid' : 'bone_unmasked_mastoid';
    else testType = masked ? 'air_masked' : 'air_unmasked';

    const level = row[columns.level];
    const noResponse = Boolean(row[columns.no_response]);
    if (noResponse && level == null) {
      console.warn(`[audiogram] a no-response threshold at ${frequency} Hz has no level, the chart can't show it`);
    }
    out.push({
      ear,
      testType,
      frequency,
      level: level == null ? null : Number(level),
      noResponse,
    });
  }
  return out;
}

/** frequency name → hertz, from the frequency vocabulary rows */
export function frequencyMap(
  rows: any[],
  vocab: { name_column: string; hz_column: string },
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const hz = Number(row[vocab.hz_column]);
    // a missing or zero hz would break the chart's log axis
    if (Number.isFinite(hz) && hz > 0) map.set(String(row[vocab.name_column]), hz);
  }
  return map;
}

function warnSkipped(field: string, value: unknown) {
  console.warn(`[audiogram] skipped a threshold with an unknown ${field}: ${value}`);
}

/**
 * For computing the diff payload on Save. Returns measurements that
 * differ between two snapshots. Used to log the pending edits today;
 * will feed the save requests once saving lands.
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
