// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import AudiogramChart from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-chart';
import AudiogramTable, {
  type AudiogramCellEdit,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-table';
import AudiogramLegend from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-legend';
import AudiogramSummary from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-summary';

// hooks
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type JSX } from 'react';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// utils
import { attachContainerHeightSensors } from '@isrd-isi-edu/chaise/src/utils/ui-utils';

// data
import {
  type AudiogramMeasurement,
  type AudiogramSummaryValues,
  diffMeasurements,
  normalizeAudiogramRows,
  normalizeSummaryRow,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';

// models
import { DataConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

export type AudiogramAppProps = {
  config: DataConfig;
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
    $catalog: { id: (ConfigService as any)?.catalogID || '' },
  };
}

const AudiogramApp = ({ config }: AudiogramAppProps): JSX.Element => {
  const { setConfig, globalControlsInitialized } = usePlot();

  useEffect(() => {
    setConfig(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Editable by default; embedded (iframe) instances are read-only viewers
   * with an "Open editor" link out. ?mode=edit / ?mode=readonly override
   * the default either way.
   */
  const embedded = window.self !== window.top;
  const editMode = useMemo(() => {
    const mode = new URLSearchParams(window.location.search).get('mode');
    if (mode === 'edit') return true;
    if (mode === 'readonly') return false;
    return !embedded;
  }, [embedded]);
  const editorHref = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'edit');
    if (embedded) url.searchParams.delete('hideNavbar');
    return url.toString();
  }, [embedded]);

  const [committedRows, setCommittedRows] = useState<AudiogramMeasurement[]>([]);
  const [draftRows, setDraftRows] = useState<AudiogramMeasurement[]>([]);
  const [storedSummary, setStoredSummary] = useState<AudiogramSummaryValues | null>(null);
  const [caseHref, setCaseHref] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Resolve the URL pattern (with $url_parameters substitution) and fetch.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const trace = config.plots[0]?.traces?.[0] as any;
        const pattern: string | undefined = trace?.url_pattern;
        if (!pattern) {
          setFetchError('No url_pattern in audiogram config (plots[0].traces[0]).');
          setLoading(false);
          return;
        }
        const tplParams = buildTemplateParams();
        let url = pattern;
        try {
          url = (ConfigService as any).ERMrest.renderHandlebarsTemplate(pattern, tplParams);
        } catch {
          // Fall back to raw pattern if templating helper isn't available.
          url = pattern;
        }
        const resp = await ConfigService.http.get(url);
        if (cancelled) return;
        const rows = normalizeAudiogramRows(resp.data as any[]);
        setCommittedRows(rows);
        setDraftRows(rows);
        // Stored per-ear summaries come from the audiogram record itself,
        // via an optional second pattern in the config. Non-fatal if absent.
        const summaryPattern: string | undefined = trace?.summary_url_pattern;
        if (summaryPattern) {
          try {
            const summaryUrl = (ConfigService as any).ERMrest.renderHandlebarsTemplate(
              summaryPattern, tplParams,
            );
            const summaryResp = await ConfigService.http.get(summaryUrl);
            if (cancelled) return;
            const summaryRow = (summaryResp.data as any[])?.[0];
            if (summaryRow) {
              setStoredSummary(normalizeSummaryRow(summaryRow));
              // link to the case, when the config says where cases live
              const casePattern: string | undefined = trace?.case_url_pattern;
              if (casePattern && summaryRow.case != null) {
                try {
                  setCaseHref((ConfigService as any).ERMrest.renderHandlebarsTemplate(
                    casePattern, { ...tplParams, $row: summaryRow },
                  ));
                } catch {
                  // no link
                }
              }
            }
          } catch {
            // leave the card unseeded
          }
        }
        setLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        setFetchError(err?.message || String(err));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [config]);

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
    if (!globalControlsInitialized || loading || fetchError) return;
    const sensors = attachContainerHeightSensors();
    return () => sensors?.forEach((rs) => rs && rs.detach());
  }, [globalControlsInitialized, loading, fetchError]);

  const handleSave = () => {
    const diff = diffMeasurements(committedRows, draftRows);
    // TODO: replace with PATCH/file-write once Q2 (storage backend) is decided.
    // See docs/dev-docs/audiogram/progress-02.md.
    // eslint-disable-next-line no-console
    console.log('[audiogram] saving %d edits:', diff.length, diff);
    setCommittedRows(draftRows);
  };

  const handleCancel = () => {
    setDraftRows(committedRows);
  };

  if (!globalControlsInitialized || loading) {
    return <ChaiseSpinner />;
  }

  if (fetchError) {
    return (
      <div className='audiogram-page'>
        <div className='audiogram-error'>Failed to load audiogram data: {fetchError}</div>
      </div>
    );
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
          <AudiogramChart ear='right' measurements={draftRows} />
        </div>
        <div className='audiogram-legend-col'>
          <AudiogramLegend />
          <AudiogramSummary
            measurements={draftRows}
            editable={editMode}
            stored={storedSummary}
            caseHref={caseHref}
            openLinksInNewTab={embedded}
          />
        </div>
        <div className='audiogram-ear audiogram-left-ear'>
          <AudiogramChart ear='left' measurements={draftRows} />
        </div>
      </div>

      <div className='audiogram-tables'>
        <div className='audiogram-tablecol'>
          <AudiogramTable
            ear='right'
            measurements={draftRows}
            editable={editMode}
            onCellEdit={handleCellEdit}
          />
        </div>
        <div className='audiogram-tablecol'>
          <AudiogramTable
            ear='left'
            measurements={draftRows}
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
