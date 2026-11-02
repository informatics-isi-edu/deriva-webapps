// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// models
import { CustomError } from '@isrd-isi-edu/chaise/src/models/errors';
import {
  AudiogramRecord,
  AudiogramSource,
  AudiogramThresholds,
} from '@isrd-isi-edu/deriva-webapps/src/models/audiogram-config';

// utils
import { fixedEncodeURIComponent } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { getPatternUri } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { CASE_DISPLAY_ALIAS } from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';

export type AudiogramRequest = { uri: string; headers: any };

/** the thresholds of the audiogram: the rows of the thresholds table that reference it */
export function thresholdsRequest(
  thresholds: AudiogramThresholds,
  rid: string,
  templateParams: any,
): AudiogramRequest {
  if (thresholds.url_pattern) return patternRequest(thresholds.url_pattern, templateParams);
  const column = fixedEncodeURIComponent(thresholds.audiogram_column as string);
  return request(`/entity/${tablePath(thresholds)}/${column}=${fixedEncodeURIComponent(rid)}`, thresholds);
}

/** all rows of the frequency vocabulary */
export function frequencyVocabRequest(vocab: AudiogramSource, templateParams: any): AudiogramRequest {
  if (vocab.url_pattern) return patternRequest(vocab.url_pattern, templateParams);
  return request(`/entity/${tablePath(vocab)}`, vocab);
}

/**
 * The audiogram row. With a case configured, an attribute request that also projects the
 * case's display column as CASE_DISPLAY_ALIAS.
 */
export function audiogramRequest(
  record: AudiogramRecord,
  rid: string,
  templateParams: any,
): AudiogramRequest {
  if (record.url_pattern) return patternRequest(record.url_pattern, templateParams);
  const filter = `RID=${fixedEncodeURIComponent(rid)}`;
  if (!record.case) return request(`/entity/${tablePath(record)}/${filter}`, record);

  const caseColumn = fixedEncodeURIComponent(record.case.column);
  const caseKey = fixedEncodeURIComponent(record.case.key_column);
  let path =
    `/attribute/M:=${tablePath(record)}/${filter}` +
    `/C:=left(${caseColumn})=(${tablePath(record.case)}:${caseKey})/$M/*`;
  if (record.case.display_column) {
    path += `,${CASE_DISPLAY_ALIAS}:=C:${fixedEncodeURIComponent(record.case.display_column)}`;
  }
  return request(path, record);
}

function tablePath(source: { schema_name?: string; table_name?: string }): string {
  const schema = fixedEncodeURIComponent(source.schema_name as string);
  const table = fixedEncodeURIComponent(source.table_name as string);
  return `${schema}:${table}`;
}

/** a request to the current catalog, with the deriva context header the other apps send */
function request(path: string, source: AudiogramSource): AudiogramRequest {
  const catalog = ConfigService.catalogID;
  if (!catalog) {
    throw new CustomError('Audiogram', 'No catalog to read from: add ?catalog=<id> to the page URL.');
  }
  // an object: ermrestjs adds its own params to it and encodes it, a string would be replaced
  const headers = {
    [ConfigService.ERMrest.contextHeaderName]: {
      catalog,
      schema_table: `${source.schema_name}:${source.table_name}`,
    },
  };
  return { uri: `${ConfigService.ERMrestLocation}/catalog/${catalog}${path}`, headers };
}

/** a url_pattern rendered with the template params */
function patternRequest(pattern: string, templateParams: any): AudiogramRequest {
  const { uri, headers } = getPatternUri(pattern, templateParams);
  if (!uri) {
    throw new CustomError('Invalid Config', `url_pattern "${pattern}" rendered empty, a value it uses is missing.`);
  }
  return { uri, headers };
}
