// models
import {
  AudiogramConfig,
  AudiogramSource,
  AudiogramSummaryMeasure,
} from '@isrd-isi-edu/deriva-webapps/src/models/audiogram-config';

// utils
import { CustomError } from '@isrd-isi-edu/chaise/src/models/errors';
import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

/**
 * Return the config picked by ?config=. Throws a CustomError naming every missing or
 * invalid key, so a bad config fails on load instead of showing an empty audiogram.
 */
export function getAudiogramConfig(): AudiogramConfig {
  if (!windowRef.audiogramConfigs && (windowRef as any).audiogramConfig) {
    throw new CustomError(
      'Invalid Config',
      'config/audiogram-config.js uses the old format (audiogramConfig). ' +
        'Replace it with a copy of config/audiogram-config-sample.js.',
    );
  }
  const config = getConfigObject<AudiogramConfig>(windowRef.audiogramConfigs);
  const problems: string[] = [];

  if (!config.rid_pattern) problems.push('rid_pattern');

  const frequencies = config.default_frequencies;
  if (
    frequencies !== undefined &&
    (!Array.isArray(frequencies) || frequencies.length === 0 || frequencies.some((hz) => !(hz > 0)))
  ) {
    problems.push('default_frequencies (a list of frequencies in Hz)');
  }

  const thresholds = config.thresholds;
  if (!thresholds) {
    problems.push('thresholds');
  } else {
    checkSource(thresholds, 'thresholds', problems);
    if (!thresholds.url_pattern && !thresholds.audiogram_column) {
      problems.push('thresholds.audiogram_column');
    }
    if (!thresholds.columns?.ear) problems.push('thresholds.columns.ear');
    if (!thresholds.columns?.conduction) problems.push('thresholds.columns.conduction');
    if (!thresholds.columns?.frequency) problems.push('thresholds.columns.frequency');
    if (!thresholds.columns?.level) problems.push('thresholds.columns.level');
    if (!thresholds.columns?.masked) problems.push('thresholds.columns.masked');
    if (!thresholds.columns?.no_response) problems.push('thresholds.columns.no_response');
    if (!thresholds.values?.ear?.right) problems.push('thresholds.values.ear.right');
    if (!thresholds.values?.ear?.left) problems.push('thresholds.values.ear.left');
    if (!thresholds.values?.conduction?.air) problems.push('thresholds.values.conduction.air');
    if (!thresholds.values?.conduction?.bone) problems.push('thresholds.values.conduction.bone');

    const vocab = thresholds.frequency_vocab;
    if (vocab) {
      checkSource(vocab, 'thresholds.frequency_vocab', problems);
      if (!vocab.name_column) problems.push('thresholds.frequency_vocab.name_column');
      if (!vocab.hz_column) problems.push('thresholds.frequency_vocab.hz_column');
    }
  }

  const audiogram = config.audiogram;
  if (audiogram) {
    checkSource(audiogram, 'audiogram', problems);
    if (!audiogram.summary) {
      problems.push('audiogram.summary');
    } else {
      checkMeasure(audiogram.summary.pta, 'pta', problems);
      checkMeasure(audiogram.summary.srt, 'srt', problems);
      checkMeasure(audiogram.summary.word_id, 'word_id', problems);
      checkMeasure(audiogram.summary.word_id_level, 'word_id_level', problems);
      checkMeasure(audiogram.summary.ucl, 'ucl', problems);
      checkMeasure(audiogram.summary.tympanogram, 'tympanogram', problems);
    }

    const caseConfig = audiogram.case;
    if (caseConfig) {
      if (!caseConfig.column) problems.push('audiogram.case.column');
      if (!caseConfig.schema_name) problems.push('audiogram.case.schema_name');
      if (!caseConfig.table_name) problems.push('audiogram.case.table_name');
      if (!caseConfig.key_column) problems.push('audiogram.case.key_column');
    }
  }

  if (problems.length > 0) {
    throw new CustomError(
      'Invalid Config',
      `The audiogram config has missing or invalid keys: ${problems.join(', ')}`,
    );
  }
  return config;
}

/** a source needs either a url_pattern, or a schema and table name */
function checkSource(source: AudiogramSource, path: string, problems: string[]) {
  if (source.url_pattern) return;
  if (!source.schema_name) problems.push(`${path}.schema_name`);
  if (!source.table_name) problems.push(`${path}.table_name`);
}

/** a configured measure needs a column per ear, and so does its no_response if it has one */
function checkMeasure(measure: AudiogramSummaryMeasure | undefined, name: string, problems: string[]) {
  if (!measure) return;
  if (!measure.value?.right) problems.push(`audiogram.summary.${name}.value.right`);
  if (!measure.value?.left) problems.push(`audiogram.summary.${name}.value.left`);
  if (measure.no_response && !measure.no_response.right) {
    problems.push(`audiogram.summary.${name}.no_response.right`);
  }
  if (measure.no_response && !measure.no_response.left) {
    problems.push(`audiogram.summary.${name}.no_response.left`);
  }
}
