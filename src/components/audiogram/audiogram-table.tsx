/**
 * Single-ear values table built on ag-grid-community.
 *
 * Layout matches screenshots/example01.png: rows are test types
 * (AC Unmasked, AC Masked, BC Unmasked, …), columns are the standard
 * frequencies, with a leading "Test" column for the row label.
 *
 * Uses `readOnlyEdit` so edits don't mutate row data — instead they fire
 * `cellEditRequest`, which we forward to AudiogramApp. AudiogramApp owns
 * the draftRows state and feeds new values back into both the table and
 * the chart for the live-preview-with-batched-save flow described in
 * progress-02.md.
 */

import { useMemo, type JSX } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  type CellEditRequestEvent,
  type ColDef,
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import {
  type AudiogramMeasurement,
  type Ear,
  type TestType,
  STANDARD_FREQUENCIES,
  TABLE_TEST_TYPES,
  testTypeGroup,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';
import { getSymbol } from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-symbols';

ModuleRegistry.registerModules([AllCommunityModule]);

export type AudiogramCellEdit = {
  ear: Ear;
  testType: TestType;
  frequency: number;
  level: number | null;
};

export type AudiogramNoResponseEdit = {
  ear: Ear;
  testType: TestType;
  frequencies: number[];
};

type AudiogramTableProps = {
  ear: Ear;
  measurements: AudiogramMeasurement[];
  editable: boolean;
  onCellEdit: (edit: AudiogramCellEdit) => void;
  /**
   * Fired when the user edits the dedicated "No Response" column (mode B
   * only). The payload replaces the set of no-response frequencies for
   * the given (ear, testType) with the parsed list.
   */
  onNoResponseEdit?: (edit: AudiogramNoResponseEdit) => void;
  /**
   * How to surface no-response measurements:
   *  - 'inline'  → show "120 ↓" inside the level cell (mode A / example01)
   *  - 'column'  → drop the marker from the level cell, add a dedicated
   *                "No Response" column at the right listing the
   *                frequencies that had no response (mode B / example02)
   */
  noResponseStyle?: 'inline' | 'column';
};

type RowShape = {
  testType: TestType;
  testLabel: string;
  group: 'AC' | 'BC';
  // dynamic frequency columns: f250, f500, … hold level | null
  // and f250__nr, f500__nr hold the no-response flag (0 | 1)
  [key: string]: number | string | null;
};

const MIN_LEVEL = -10;
const MAX_LEVEL = 120;

const freqField = (f: number) => `f${f}`;
const freqNrField = (f: number) => `f${f}__nr`;

/**
 * Build the row data. Always 4 rows (AC Unmasked, AC Masked, BC Unmasked,
 * BC Masked) so users can fill in missing data, matching ISO/ASHA. The
 * `group` field drives the AC/BC visual separator.
 */
function buildRows(measurements: AudiogramMeasurement[], ear: Ear): RowShape[] {
  return TABLE_TEST_TYPES.map((t) => {
    const sym = getSymbol(ear, t);
    // Drop the leading "AC " / "BC " — the row label column shows the
    // unmasked/masked qualifier and the group is shown by the AC/BC band.
    const shortLabel = (sym?.label ?? t).replace(/^AC |^BC /, '');
    const row: RowShape = {
      testType: t,
      testLabel: shortLabel,
      group: testTypeGroup(t),
    };
    const noRespFreqs: number[] = [];
    for (const freq of STANDARD_FREQUENCIES) {
      const m = measurements.find(
        (x) => x.ear === ear && x.testType === t && x.frequency === freq,
      );
      row[freqField(freq)] = m?.level ?? null;
      row[freqNrField(freq)] = m?.noResponse ? 1 : 0;
      if (m?.noResponse) noRespFreqs.push(freq);
    }
    row.noResponseList = noRespFreqs.length > 0 ? noRespFreqs.join(', ') : '';
    return row;
  });
}

const AudiogramTable = ({
  ear,
  measurements,
  editable,
  onCellEdit,
  onNoResponseEdit,
  noResponseStyle = 'inline',
}: AudiogramTableProps): JSX.Element => {
  const rowData = useMemo(() => buildRows(measurements, ear), [measurements, ear]);

  const columnDefs = useMemo<ColDef<RowShape>[]>(() => {
    const cols: ColDef<RowShape>[] = [
      {
        headerName: '',
        field: 'group',
        pinned: 'left',
        width: 44,
        editable: false,
        cellClass: (params) =>
          `audiogram-cell-group audiogram-cell-group-${(params.data as any)?.group?.toLowerCase()}`,
        // Only the first row of each AC/BC group shows the letter; visually
        // mimics the row-spanning "AC" / "BC" label in example01.png.
        valueFormatter: (params) => {
          const idx = params.node?.rowIndex ?? -1;
          const data = params.data as any;
          if (!data) return '';
          // First row of each group (AC at row 0, BC at row 2 in TABLE_TEST_TYPES order).
          if (idx === 0 && data.group === 'AC') return 'AC';
          if (idx === 2 && data.group === 'BC') return 'BC';
          return '';
        },
      },
      {
        headerName: '',
        field: 'testLabel',
        pinned: 'left',
        // Wide enough for the longest ISO/ASHA label ("Unmasked (forehead)")
        // — labels must never be truncated.
        width: 175,
        editable: false,
        cellClass: 'audiogram-cell-testlabel',
        cellStyle: { textAlign: 'left' },
      },
    ];

    for (const freq of STANDARD_FREQUENCIES) {
      const field = freqField(freq);
      const nrField = freqNrField(freq);
      cols.push({
        headerName: String(freq),
        field,
        editable,
        // Flex so the frequency columns share whatever horizontal space
        // is left after the pinned label/group columns. Avoids the empty
        // gap on the right-hand side of the table.
        flex: 1,
        minWidth: 70,
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: { min: MIN_LEVEL, max: MAX_LEVEL, precision: 0 },
        valueFormatter: (params) => {
          if (params.value == null || params.value === '') return '';
          // In 'column' mode the no-response indicator lives in its own
          // dedicated column at the right, so the level cell just shows
          // the value without the trailing arrow.
          if (noResponseStyle === 'column') return String(params.value);
          const nr = (params.data as any)?.[nrField];
          return nr ? `${params.value} ↓` : String(params.value);
        },
        valueParser: (params) => {
          const nv = params.newValue;
          if (nv === '' || nv == null) return null;
          const n = Number(nv);
          if (Number.isNaN(n)) return params.oldValue;
          if (n < MIN_LEVEL || n > MAX_LEVEL) return params.oldValue;
          return n;
        },
        cellClass: (params) => {
          const nr = (params.data as any)?.[nrField];
          // In 'column' mode the level cell stays plain — the dedicated
          // no-response column carries the marker.
          if (noResponseStyle === 'column') return 'audiogram-cell-level';
          return nr ? 'audiogram-cell-level audiogram-cell-noresponse' : 'audiogram-cell-level';
        },
      });
    }

    if (noResponseStyle === 'column') {
      cols.push({
        headerName: 'No Response',
        field: 'noResponseList',
        editable,
        pinned: 'right',
        width: 150,
        cellEditor: 'agTextCellEditor',
        cellClass: 'audiogram-cell-noresp-list',
        // Accept either "2000, 4000" or "2000 Hz, 4000 Hz". Anything that
        // isn't a positive number gets dropped silently so typos don't
        // eat the whole list.
        valueParser: (params) => {
          const text = String(params.newValue ?? '').trim();
          if (!text) return '';
          const nums = text
            .split(',')
            .map((s) => Number(s.replace(/hz/i, '').trim()))
            .filter((n) => Number.isFinite(n) && n > 0);
          return nums.join(', ');
        },
        valueFormatter: (params) => (params.value ? `${params.value} Hz` : ''),
      });
    }
    return cols;
  }, [editable, noResponseStyle]);

  const onCellEditRequest = (event: CellEditRequestEvent<RowShape>) => {
    const field = event.colDef.field;
    if (!field || field === 'testLabel') return;
    if (field === 'noResponseList') {
      if (!onNoResponseEdit) return;
      // valueParser already normalized the text to "n, n, n" (or '').
      const text = String(event.newValue ?? '').trim();
      const freqs = text
        ? text
            .split(',')
            .map((s) => Number(s.trim()))
            .filter((n) => Number.isFinite(n) && n > 0)
        : [];
      onNoResponseEdit({ ear, testType: event.data.testType, frequencies: freqs });
      return;
    }
    // field is `f<frequency>` — extract the number.
    const freq = Number(field.slice(1));
    if (Number.isNaN(freq)) return;
    const newLevel = event.newValue == null ? null : Number(event.newValue);
    onCellEdit({
      ear,
      testType: event.data.testType,
      frequency: freq,
      level: newLevel,
    });
  };

  const themeClass = `audiogram-table audiogram-table-${ear} ag-theme-quartz`;

  return (
    <div className={themeClass}>
      <div className='audiogram-table-title'>{ear === 'right' ? 'RIGHT' : 'LEFT'}</div>
      <div className='audiogram-table-subtitle'>Frequency (Hz)</div>
      <AgGridReact<RowShape>
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          sortable: false,
          resizable: false,
          suppressMovable: true,
          suppressHeaderMenuButton: true,
          cellStyle: { textAlign: 'center' },
          headerClass: 'audiogram-header-centered',
        }}
        rowClassRules={{
          'audiogram-row-ac': (params) => (params.data as any)?.group === 'AC',
          'audiogram-row-bc': (params) => (params.data as any)?.group === 'BC',
          'audiogram-row-group-first': (params) =>
            params.node?.rowIndex === 2, // first BC row — thicker top border
        }}
        readOnlyEdit
        onCellEditRequest={onCellEditRequest}
        singleClickEdit
        stopEditingWhenCellsLoseFocus
        suppressMovableColumns
        suppressDragLeaveHidesColumns
        domLayout='autoHeight'
      />
    </div>
  );
};

export default AudiogramTable;
