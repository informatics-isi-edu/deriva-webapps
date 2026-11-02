/**
 * config/audiogram-config.js defines window.audiogramConfigs: named configs picked with
 * ?config=, '*' being the default and a string value an alias to another name.
 *
 * A config names the tables, columns and vocabulary values of the model, and the app builds
 * its requests from them. What the audiogram standard fixes (symbols, axes, the PTA rule,
 * labels) stays in the code.
 *
 * TODO config keys to add along with their features:
 * - thresholds.inherited_columns: columns copied from the audiogram row when saving a
 *   threshold (dataset, which the composite fkey to the audiogram needs)
 * - audiogram.narrative: diagnostic_impression and additional_details, once the app shows them
 * - audiogram.summary.tympanogram.vocab: the tympanogram type vocabulary, for a select input
 *   instead of free text
 */
export type AudiogramConfigs = {
  [name: string]: AudiogramConfig | string;
};

export type AudiogramConfig = {
  /** RID of the audiogram to show, rendered with $url_parameters */
  rid_pattern: string;
  /** frequencies (Hz) always shown, besides the ones in the data. default: 125 to 8000 */
  default_frequencies?: number[];
  thresholds: AudiogramThresholds;
  audiogram?: AudiogramRecord;
};

/** a table to read from, or a url_pattern that replaces it and makes the app read-only */
export type AudiogramSource = {
  schema_name?: string;
  table_name?: string;
  url_pattern?: string;
};

/** the thresholds, one row each */
export type AudiogramThresholds = AudiogramSource & {
  /** the column that references the audiogram */
  audiogram_column?: string;
  columns: {
    ear: string;
    conduction: string;
    frequency: string;
    level: string;
    masked: string;
    no_response: string;
  };
  values: {
    ear: { right: string; left: string };
    conduction: { air: string; bone: string };
  };
  /** maps frequency names to hertz. without it, the number is parsed from the name ("250 Hz") */
  frequency_vocab?: AudiogramSource & {
    name_column: string;
    hz_column: string;
  };
};

export type AudiogramEarColumns = { right: string; left: string };

export type AudiogramSummaryMeasure = {
  value: AudiogramEarColumns;
  no_response?: AudiogramEarColumns;
};

/** the audiogram row itself: its stored summary values and its case */
export type AudiogramRecord = AudiogramSource & {
  summary: {
    pta?: AudiogramSummaryMeasure;
    srt?: AudiogramSummaryMeasure;
    word_id?: AudiogramSummaryMeasure;
    word_id_level?: AudiogramSummaryMeasure;
    ucl?: AudiogramSummaryMeasure;
    tympanogram?: AudiogramSummaryMeasure;
  };
  case?: {
    column: string;
    schema_name: string;
    table_name: string;
    key_column: string;
    display_column?: string;
    /** rendered with $location, $catalog, $url_parameters and $row (the audiogram row) */
    link_pattern?: string;
  };
};
