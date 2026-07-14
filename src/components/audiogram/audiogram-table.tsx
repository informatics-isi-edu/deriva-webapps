/**
 * Single-ear values table built on ag-grid-community.
 *
 * Layout: rows are frequencies (one per frequency present, from the default
 * set unioned with the data), columns are the four ISO/ASHA pure-tone tests
 * grouped under Air Conduction / Bone Conduction headers, with a leading
 * pinned "Freq (Hz)" column.
 *
 * Uses `readOnlyEdit` so edits don't mutate row data — instead they fire
 * `cellEditRequest`, which we forward to AudiogramApp. AudiogramApp owns the
 * draftRows state and feeds new values back into both the table and the chart
 * for the live-preview-with-batched-save flow described in progress-02.md.
 *
 * No-response is a per-cell marker (not free text): each editable cell shows a
 * small "NR" toggle on hover/focus; clicking it flags/unflags no-response for
 * that (frequency, test) via `onCellEdit`.
 */

import { useCallback, useMemo, type JSX, type MouseEvent } from 'react';
import { AgGridReact } from 'ag-grid-react';
import ChaiseTooltip from '@isrd-isi-edu/chaise/src/components/tooltip';
import {
  AllCommunityModule,
  ModuleRegistry,
  type CellEditRequestEvent,
  type ColDef,
  type ColGroupDef,
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import {
  type AudiogramMeasurement,
  type Ear,
  type TestType,
  TABLE_TEST_TYPES,
  tableFrequencies,
  testTypeGroup,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';
import { getSymbol } from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-symbols';

ModuleRegistry.registerModules([AllCommunityModule]);

export type AudiogramCellEdit = {
  ear: Ear;
  testType: TestType;
  frequency: number;
  level: number | null;
  noResponse: boolean;
};

type AudiogramTableProps = {
  ear: Ear;
  measurements: AudiogramMeasurement[];
  editable: boolean;
  onCellEdit: (edit: AudiogramCellEdit) => void;
};

/** One row per frequency: `frequency`, plus `<testType>` (level) and `<testType>__nr` (0|1). */
type RowShape = {
  frequency: number;
  [key: string]: number | null;
};

const MIN_LEVEL = -10;
const MAX_LEVEL = 120;

const nrField = (t: TestType) => `${t}__nr`;

/**
 * Build the row data: one row per frequency (default set unioned with the
 * data), each carrying the level and no-response flag for all four tests.
 */
function buildRows(measurements: AudiogramMeasurement[], ear: Ear): RowShape[] {
  return tableFrequencies(measurements).map((freq) => {
    const row: RowShape = { frequency: freq };
    for (const t of TABLE_TEST_TYPES) {
      const m = measurements.find(
        (x) => x.ear === ear && x.testType === t && x.frequency === freq,
      );
      row[t] = m?.level ?? null;
      row[nrField(t)] = m?.noResponse ? 1 : 0;
    }
    return row;
  });
}

/**
 * Cell display: the dB value, plus a down-arrow when the cell is flagged
 * no-response (the value is the level tested; the arrow means "no response at
 * that level"). A small NR / × toggle button is revealed on hover; it stops
 * propagation so a click toggles the flag instead of starting a cell edit.
 */
const NrCellRenderer = (params: any): JSX.Element => {
  const field = params.colDef?.field as TestType;
  const level = params.value as number | null;
  const nr = params.data?.[nrField(field)] === 1;
  const onToggle = (e: MouseEvent) => {
    e.stopPropagation();
    params.toggleNr?.(params.data.frequency, field, level, nr);
  };
  return (
    <div className={`audiogram-cell-inner${nr ? ' is-nr' : ''}`}>
      <span className='audiogram-cell-value'>{level == null ? '' : level}</span>
      {nr && (
        <span className='audiogram-cell-nrmark' aria-label='no response'>
          ↓
        </span>
      )}
      {params.editable && (
        <ChaiseTooltip
          placement='bottom'
          dynamicTooltipString
          tooltip={nr ? 'Clear no response' : 'Mark as no response'}
        >
          <button
            type='button'
            className='audiogram-nr-btn'
            tabIndex={-1}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onToggle}
          >
            {nr ? '×' : 'NR'}
          </button>
        </ChaiseTooltip>
      )}
    </div>
  );
};

const AudiogramTable = ({
  ear,
  measurements,
  editable,
  onCellEdit,
}: AudiogramTableProps): JSX.Element => {
  const rowData = useMemo(() => buildRows(measurements, ear), [measurements, ear]);

  // Toggle no-response for a cell. NR keeps the value (a no-response has a real
  // level, the max output tested). Flagging an empty cell seeds the level at the
  // floor as a starting point; clearing NR keeps the value as a plain threshold.
  const handleToggleNr = useCallback(
    (frequency: number, testType: TestType, level: number | null, currentNr: boolean) => {
      const nextNr = !currentNr;
      const nextLevel = nextNr && level == null ? MAX_LEVEL : level;
      onCellEdit({ ear, testType, frequency, level: nextLevel, noResponse: nextNr });
    },
    [ear, onCellEdit],
  );

  const columnDefs = useMemo<(ColDef<RowShape> | ColGroupDef<RowShape>)[]>(() => {
    const leafCol = (t: TestType): ColDef<RowShape> => {
      const sym = getSymbol(ear, t);
      const isAcEnd = t === 'air_masked';
      return {
        headerName: t.includes('unmasked') ? 'Unmasked' : 'Masked',
        headerTooltip: sym?.label ?? t,
        field: t,
        editable,
        flex: 1,
        minWidth: 88,
        wrapHeaderText: true,
        autoHeaderHeight: true,
        cellEditor: 'agNumberCellEditor',
        cellEditorParams: { min: MIN_LEVEL, max: MAX_LEVEL, precision: 0 },
        cellRenderer: NrCellRenderer,
        cellRendererParams: { toggleNr: handleToggleNr, editable },
        // Reject out-of-range / non-numeric edits by reverting to the old value.
        valueParser: (p) => {
          const nv = p.newValue;
          if (nv === '' || nv == null) return null;
          const n = Number(nv);
          if (Number.isNaN(n)) return p.oldValue;
          if (n < MIN_LEVEL || n > MAX_LEVEL) return p.oldValue;
          return n;
        },
        // The last AC column carries the vertical AC/BC seam.
        cellClass: isAcEnd ? 'audiogram-col-ac-end' : undefined,
        headerClass: isAcEnd ? ['audiogram-header-centered', 'audiogram-col-ac-end'] : undefined,
      };
    };

    return [
      {
        headerName: 'Freq (Hz)',
        field: 'frequency',
        pinned: 'left',
        width: 92,
        editable: false,
        cellClass: 'audiogram-freq-cell',
      },
      {
        headerName: 'Air Conduction',
        headerClass: 'audiogram-group-header audiogram-col-ac-end',
        // Without this, ag-grid's sticky group label pins to the left and can't center.
        suppressStickyLabel: true,
        children: TABLE_TEST_TYPES.filter((t) => testTypeGroup(t) === 'AC').map(leafCol),
      },
      {
        headerName: 'Bone Conduction',
        headerClass: 'audiogram-group-header',
        suppressStickyLabel: true,
        children: TABLE_TEST_TYPES.filter((t) => testTypeGroup(t) === 'BC').map(leafCol),
      },
    ];
  }, [editable, ear, handleToggleNr]);

  const onCellEditRequest = (event: CellEditRequestEvent<RowShape>) => {
    const field = event.colDef.field;
    if (!field || field === 'frequency') return;
    const nv = event.newValue;
    const level = nv === '' || nv == null ? null : Number(nv);
    // Editing the number keeps the cell's no-response flag (a no-response has a
    // real level); clearing the value clears the flag too.
    const currentNr = (event.data as any)[nrField(field as TestType)] === 1;
    onCellEdit({
      ear,
      testType: field as TestType,
      frequency: event.data.frequency,
      level,
      noResponse: level == null ? false : currentNr,
    });
  };

  const themeClass = `audiogram-table audiogram-table-${ear} ag-theme-quartz`;

  return (
    <div className={themeClass}>
      <div className='audiogram-table-title'>{ear === 'right' ? 'RIGHT' : 'LEFT'}</div>
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
        readOnlyEdit
        onCellEditRequest={onCellEditRequest}
        stopEditingWhenCellsLoseFocus
        suppressMovableColumns
        suppressDragLeaveHidesColumns
        domLayout='autoHeight'
      />
    </div>
  );
};

export default AudiogramTable;
