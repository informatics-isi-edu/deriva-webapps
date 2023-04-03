import { MouseEventHandler } from 'react';
import SelectView from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-view';
import SelectedRows from '@isrd-isi-edu/chaise/src/components/selected-rows';
import { SelectedRow } from '@isrd-isi-edu/chaise/src/models/recordset';
import ChaiseTooltip from '@isrd-isi-edu/chaise/src/components/tooltip';

export type DropdownSelectProps = {
  selectedRows?: SelectedRow[];
  removeCallback?: (row: SelectedRow | null, event: any) => void;
  label?: string;
  onClickSelectAll?: MouseEventHandler;
  onClickSelectSome?: MouseEventHandler;
};

const ButtonSelect = ({
  selectedRows,
  removeCallback = () => null,
  label,
  onClickSelectAll,
  onClickSelectSome,
}: DropdownSelectProps): JSX.Element => {
  // TODO: remove this if chaise has a way to show this when rows.length === 0
  const ClearAllButton = (): JSX.Element => (
    <ChaiseTooltip placement='bottom-start' tooltip='Clear all the selected items.'>
      <button
        className='chaise-btn chaise-btn-tertiary clear-all-btn selected-chiclets-btn'
        onClick={(event) => removeCallback(null, event)}
      >
        <span>Clear selection</span>
      </button>
    </ChaiseTooltip>
  );

  const AllStudiesComponent = (): JSX.Element => (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <span style={{ marginRight: 8 }}>All Studies Selected</span>
      <ClearAllButton />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <SelectView label={label}>
        <span className='chaise-btn-group'>
          <button
            className='chaise-btn chaise-btn-secondary'
            type='button'
            onClick={onClickSelectAll}
          >
            Select All
          </button>
          <button
            className='chaise-btn chaise-btn-secondary'
            type='button'
            onClick={onClickSelectSome}
          >
            Select Some <span className='fa fa-chevron-down' />
          </button>
        </span>
      </SelectView>
      <div style={{ marginTop: 8 }}>
        {!selectedRows ? <span>No Studies Selected</span> : null}
        {selectedRows && selectedRows.length === 0 ? <AllStudiesComponent /> : null}
        {selectedRows && selectedRows.length > 0 && removeCallback ? (
          <SelectedRows rows={selectedRows} removeCallback={removeCallback} />
        ) : null}
      </div>
    </div>
  );
};

export default ButtonSelect;
