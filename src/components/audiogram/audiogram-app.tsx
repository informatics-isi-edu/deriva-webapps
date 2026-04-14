// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import AudiogramChart from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-chart';
import AudiogramTable, {
  type AudiogramCellEdit,
  type AudiogramNoResponseEdit,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-table';
import AudiogramLegend from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-legend';
import AudiogramSummary from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-summary';

// hooks
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';
import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// data
import {
  type AudiogramMeasurement,
  diffMeasurements,
  normalizeAudiogramRows,
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

  const [committedRows, setCommittedRows] = useState<AudiogramMeasurement[]>([]);
  const [draftRows, setDraftRows] = useState<AudiogramMeasurement[]>([]);
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

  // Apply a single cell edit to draftRows. We don't mutate the array.
  const handleCellEdit = useCallback((edit: AudiogramCellEdit) => {
    setDraftRows((prev) => {
      const idx = prev.findIndex(
        (m) =>
          m.ear === edit.ear && m.testType === edit.testType && m.frequency === edit.frequency,
      );
      if (idx === -1) {
        // Editing a frequency that didn't have a measurement yet — add one.
        if (edit.level == null) return prev;
        return [
          ...prev,
          {
            ear: edit.ear,
            testType: edit.testType,
            frequency: edit.frequency,
            level: edit.level,
            noResponse: false,
          },
        ];
      }
      const next = prev.slice();
      next[idx] = { ...next[idx], level: edit.level };
      return next;
    });
  }, []);

  // Apply a "no response" list edit from the dedicated column in mode B.
  // Sets noResponse=true for the frequencies the user typed, and false for
  // any that are no longer in the list. Frequencies that don't yet have a
  // measurement get a placeholder row so the flag has somewhere to live.
  const handleNoResponseEdit = useCallback((edit: AudiogramNoResponseEdit) => {
    setDraftRows((prev) => {
      const target = new Set(edit.frequencies);
      const next = prev.map((m) => {
        if (m.ear !== edit.ear || m.testType !== edit.testType) return m;
        const shouldBeNR = target.has(m.frequency);
        return m.noResponse === shouldBeNR ? m : { ...m, noResponse: shouldBeNR };
      });
      for (const f of edit.frequencies) {
        if (!next.find((m) => m.ear === edit.ear && m.testType === edit.testType && m.frequency === f)) {
          next.push({
            ear: edit.ear,
            testType: edit.testType,
            frequency: f,
            level: null,
            noResponse: true,
          });
        }
      }
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

  // Pull the layout overrides (axis ranges, height) from the existing
  // sample config so we don't lose tuning that's already there.
  const rightLayout = (config.plots[0] as any)?.plotly?.layout;
  const leftLayout = (config.plots[1] as any)?.plotly?.layout;

  return (
    <div className='audiogram-page'>
      {isDirty && (
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
            title={rightLayout?.title?.text || rightLayout?.title || 'Right Ear'}
            layoutOverride={rightLayout}
          />
        </div>
        <div className='audiogram-legend-col'>
          <AudiogramLegend
            rightTrace={config.plots[0].traces[0]}
            leftTrace={config.plots[1].traces[0]}
          />
          <AudiogramSummary measurements={draftRows} />
        </div>
        <div className='audiogram-ear audiogram-left-ear'>
          <AudiogramChart
            ear='left'
            measurements={draftRows}
            title={leftLayout?.title?.text || leftLayout?.title || 'Left Ear'}
            layoutOverride={leftLayout}
          />
        </div>
      </div>

      {/* ── Mode A: connected tables (matches example01.png) ──────────── */}
      {/* <div className='audiogram-mode-label'>Table mode A — joined (example01.png)</div>
      <div className='audiogram-tables-row'>
        <div className='audiogram-table-col audiogram-table-right-col'>
          <AudiogramTable
            ear='right'
            measurements={draftRows}
            editable
            onCellEdit={handleCellEdit}
          />
        </div>
        <div className='audiogram-table-col audiogram-table-left-col'>
          <AudiogramTable
            ear='left'
            measurements={draftRows}
            editable
            onCellEdit={handleCellEdit}
          />
        </div>
      </div> */}

      {/* ── Mode B: per-ear separated tables + PTA summary (example02.png) ─ */}
      {/* <div className='audiogram-mode-label'>Table mode B — separated + PTA summary (example02.png)</div> */}
      <div className='audiogram-modeb-layout'>
        <div className='audiogram-modeb-tables'>
          <div className='audiogram-modeb-tablecol'>
            <AudiogramTable
              ear='right'
              measurements={draftRows}
              editable
              onCellEdit={handleCellEdit}
              onNoResponseEdit={handleNoResponseEdit}
              noResponseStyle='column'
            />
          </div>
          <div className='audiogram-modeb-tablecol'>
            <AudiogramTable
              ear='left'
              measurements={draftRows}
              editable
              onCellEdit={handleCellEdit}
              onNoResponseEdit={handleNoResponseEdit}
              noResponseStyle='column'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudiogramApp;
