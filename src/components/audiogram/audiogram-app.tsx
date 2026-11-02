// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import AudiogramChart from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-chart';
import AudiogramTable, {
  type AudiogramCellEdit,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-table';
import AudiogramLegend from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-legend';
import AudiogramSummary from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-summary';

// hooks
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type JSX } from 'react';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// models
import { CustomError } from '@isrd-isi-edu/chaise/src/models/errors';

// utils
import { attachContainerHeightSensors } from '@isrd-isi-edu/chaise/src/utils/ui-utils';

// data
import {
  type AudiogramMeasurement,
  type AudiogramSummaryValues,
  audiogramColumnNames,
  checkConfiguredColumns,
  diffMeasurements,
  frequencyMap,
  STANDARD_FREQUENCIES,
  normalizeSummaryRow,
  normalizeThresholdRows,
  thresholdColumnNames,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';
import {
  type AudiogramRequest,
  audiogramRequest,
  frequencyVocabRequest,
  thresholdsRequest,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-requests';

// models
import { AudiogramConfig } from '@isrd-isi-edu/deriva-webapps/src/models/audiogram-config';

export type AudiogramAppProps = {
  config: AudiogramConfig;
};

/**
 * Build the template parameter context used to render `url_pattern`.
 * Mirrors the plot app's behaviour: the page's query string is exposed
 * under `$url_parameters`, plus the catalog id from ConfigService. See
 * src/hooks/chart.ts (search for `$url_parameters`) for the source of
 * truth in the plot app.
 */
function buildTemplateParams(): any {
  const params = new URLSearchParams(window.location.search);
  const $url_parameters: Record<string, string> = {};
  for (const [k, v] of params.entries()) $url_parameters[k] = v;
  return {
    $url_parameters,
    $catalog: { id: ConfigService.catalogID || '' },
  };
}

async function fetchRows(req: AudiogramRequest): Promise<any[]> {
  const resp = await ConfigService.http.get(req.uri, { headers: req.headers });
  if (!Array.isArray(resp.data)) {
    throw new CustomError('Audiogram', `${req.uri} didn't return a list of rows.`);
  }
  return resp.data;
}

const AudiogramApp = ({ config }: AudiogramAppProps): JSX.Element => {
  const { dispatchError, errors } = useError();
  const defaultFrequencies = config.default_frequencies ?? STANDARD_FREQUENCIES;

  // a url_pattern reads from somewhere the app can't write to, so the app is read-only
  const readOnly = Boolean(config.thresholds.url_pattern || config.audiogram?.url_pattern);

  /*
   * Editable by default; embedded (iframe) instances are read-only viewers
   * with an "Open editor" link out. ?mode=edit / ?mode=readonly override
   * the default either way.
   */
  const embedded = window.self !== window.top;
  const editMode = useMemo(() => {
    if (readOnly) return false;
    const mode = new URLSearchParams(window.location.search).get('mode');
    if (mode === 'edit') return true;
    if (mode === 'readonly') return false;
    return !embedded;
  }, [embedded, readOnly]);
  const editorHref = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'edit');
    if (embedded) url.searchParams.delete('hideNavbar');
    return url.toString();
  }, [embedded]);

  /*
   * TODO when saving lands: move the drafts, the dirty flag and the save state into a zustand
   * store (chaise's scoped-store pattern, see chaise's dev-guide), with actions like editCell,
   * save and cancel.
   */
  const [committedRows, setCommittedRows] = useState<AudiogramMeasurement[]>([]);
  const [draftRows, setDraftRows] = useState<AudiogramMeasurement[]>([]);
  const [storedSummary, setStoredSummary] = useState<AudiogramSummaryValues | null>(null);
  const [caseHref, setCaseHref] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // strict mode runs the effect twice in dev mode
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    async function load() {
      try {
        const templateParams = buildTemplateParams();
        const rid = ConfigService.ERMrest.renderHandlebarsTemplate(config.rid_pattern, templateParams);
        if (!rid) {
          throw new CustomError('Audiogram', 'No audiogram to show: add ?audiogram=<RID> to the page URL.');
        }
        const { thresholds, audiogram } = config;
        const vocab = thresholds.frequency_vocab;

        const [thresholdRows, vocabRows, audiogramRows] = await Promise.all([
          fetchRows(thresholdsRequest(thresholds, rid, templateParams)),
          vocab ? fetchRows(frequencyVocabRequest(vocab, templateParams)) : null,
          audiogram ? fetchRows(audiogramRequest(audiogram, rid, templateParams)) : null,
        ]);

        if (thresholdRows.length > 0) {
          checkConfiguredColumns(thresholdRows[0], thresholdColumnNames(thresholds), 'thresholds');
        }
        const hzByName = vocab && vocabRows ? frequencyMap(vocabRows, vocab) : undefined;
        const rows = normalizeThresholdRows(thresholdRows, thresholds, hzByName);
        setCommittedRows(rows);
        setDraftRows(rows);

        if (audiogram) {
          const audiogramRow = audiogramRows?.[0];
          if (!audiogramRow && !audiogram.url_pattern) {
            throw new CustomError('Audiogram', `Audiogram ${rid} not found.`);
          }
          if (audiogramRow) {
            checkConfiguredColumns(audiogramRow, audiogramColumnNames(audiogram), 'audiogram');
            setStoredSummary(normalizeSummaryRow(audiogramRow, audiogram));
            const caseConfig = audiogram.case;
            if (caseConfig?.link_pattern && audiogramRow[caseConfig.column] != null) {
              setCaseHref(ConfigService.ERMrest.renderHandlebarsTemplate(
                caseConfig.link_pattern, { ...templateParams, $row: audiogramRow },
              ));
            }
          }
        }
        setIsLoading(false);
      } catch (error: any) {
        setIsLoading(false);
        dispatchError({ error });
      }
    }

    void load();
    // the config never changes, so this runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply a single cell edit (value or no-response toggle) to draftRows,
  // without mutating the array.
  const handleCellEdit = useCallback((edit: AudiogramCellEdit) => {
    setDraftRows((prev) => {
      const idx = prev.findIndex(
        (m) =>
          m.ear === edit.ear && m.testType === edit.testType && m.frequency === edit.frequency,
      );
      if (idx === -1) {
        // Editing a frequency that didn't have a measurement yet — add one.
        if (edit.level == null && !edit.noResponse) return prev;
        return [
          ...prev,
          {
            ear: edit.ear,
            testType: edit.testType,
            frequency: edit.frequency,
            level: edit.level,
            noResponse: edit.noResponse,
          },
        ];
      }
      const next = prev.slice();
      next[idx] = { ...next[idx], level: edit.level, noResponse: edit.noResponse };
      return next;
    });
  }, []);

  const isDirty = useMemo(() => {
    if (draftRows === committedRows) return false;
    if (draftRows.length !== committedRows.length) return true;
    return diffMeasurements(committedRows, draftRows).length > 0;
  }, [committedRows, draftRows]);

  // Tab-close guard while there are unsaved drafts.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Height sensors keep the navbar sticky and let .audiogram-page scroll (chaise's <body> is overflow:hidden).
  useLayoutEffect(() => {
    if (isLoading || errors.length > 0) return;
    const sensors = attachContainerHeightSensors();
    return () => sensors?.forEach((rs) => rs && rs.detach());
  }, [isLoading, errors.length]);

  const handleSave = () => {
    const diff = diffMeasurements(committedRows, draftRows);
    // TODO: write the changes to the thresholds table once saving lands.
    console.log('[audiogram] saving %d edits:', diff.length, diff);
    setCommittedRows(draftRows);
  };

  const handleCancel = () => {
    setDraftRows(committedRows);
  };

  if (isLoading) {
    return <ChaiseSpinner />;
  }

  // the error itself is shown by chaise's error modal
  if (errors.length > 0) {
    return <></>;
  }

  return (
    <div className='audiogram-content app-content-container'>
      {/* Empty sticky-header slot: attachContainerHeightSensors needs it to exist; CSS collapses it while empty. */}
      <div className='top-panel-container' />
      <div className='bottom-panel-container'>
        <div className='audiogram-page'>
      {/*<div className='audiogram-modebar'>
        {editMode ? (
          <span className='audiogram-modebar-note'>
            Edit mode — changes stay as local drafts for now.
          </span>
        ) : (
          <a
            className='audiogram-modebar-link'
            href={editorHref}
            target={embedded ? '_blank' : '_self'}
            rel='noreferrer'
          >
            Open editor
          </a>
        )}
      </div>*/}

      {editMode && isDirty && (
        <div className='audiogram-savebar'>
          <span className='audiogram-savebar-msg'>You have unsaved changes.</span>
          <button type='button' className='audiogram-savebar-cancel' onClick={handleCancel}>
            Cancel
          </button>
          <button type='button' className='audiogram-savebar-save' onClick={handleSave}>
            Save
          </button>
        </div>
      )}

      <div className='audiogram-layout'>
        <div className='audiogram-ear audiogram-right-ear'>
          <AudiogramChart
            ear='right'
            measurements={draftRows}
            defaultFrequencies={defaultFrequencies}
          />
        </div>
        <div className='audiogram-legend-col'>
          <AudiogramLegend />
          <AudiogramSummary
            measurements={draftRows}
            measures={config.audiogram?.summary}
            editable={editMode}
            stored={storedSummary}
            caseHref={caseHref}
            openLinksInNewTab={embedded}
          />
        </div>
        <div className='audiogram-ear audiogram-left-ear'>
          <AudiogramChart
            ear='left'
            measurements={draftRows}
            defaultFrequencies={defaultFrequencies}
          />
        </div>
      </div>

      <div className='audiogram-tables'>
        <div className='audiogram-tablecol'>
          <AudiogramTable
            ear='right'
            measurements={draftRows}
            defaultFrequencies={defaultFrequencies}
            editable={editMode}
            onCellEdit={handleCellEdit}
          />
        </div>
        <div className='audiogram-tablecol'>
          <AudiogramTable
            ear='left'
            measurements={draftRows}
            defaultFrequencies={defaultFrequencies}
            editable={editMode}
            onCellEdit={handleCellEdit}
          />
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};

export default AudiogramApp;
