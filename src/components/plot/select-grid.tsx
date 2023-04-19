import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import ButtonSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/button-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

import { SelectedRow } from '@isrd-isi-edu/chaise/src/models/recordset';

type SelectGridProps = {
  /**
   * selectors data to be rendered
   */
  selectors: any;
  /**
   * width of grid
   */
  width: number;
};

const SelectGrid = ({ selectors, width }: SelectGridProps): JSX.Element => (
  <div className='selectors-grid' style={{ display: 'flex', flex: 1, width: width }}>
    {selectors.map((row: any, i: number) => {
      return (
        <div key={i} className='selectors-row'>
          {row.map((cell: any, j: number) => {
            const indices = [i, j];
            const {
              type,
              onClick,
              onChange,
              onClickSelectAll,
              onClickSelectSome,
              removeCallback,
              ...props
            } = cell;

            if (type === 'dropdown-select') {
              return (
                <DropdownSelect
                  key={j}
                  onClick={() => {
                    if (typeof onClick === 'function') {
                      onClick(indices, cell);
                    }
                  }}
                  onChange={(option: Option) => {
                    if (typeof onChange === 'function') {
                      onChange(option, indices, cell);
                    }
                  }}
                  {...props}
                />
              );
            } else if (type === 'button-select') {
              return (
                <ButtonSelect
                  key={j}
                  onClickSelectAll={() => {
                    if (typeof onClickSelectAll === 'function') {
                      onClickSelectAll(indices, cell);
                    }
                  }}
                  onClickSelectSome={() => {
                    if (typeof onClickSelectSome === 'function') {
                      onClickSelectSome(indices, cell);
                    }
                  }}
                  removeCallback={(row: SelectedRow) => {
                    if (typeof removeCallback === 'function') {
                      removeCallback(row, indices, cell);
                    }
                  }}
                  {...props}
                />
              );
            }
          })}
        </div>
      );
    })}
  </div>
);

export default SelectGrid;
