import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import ButtonSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/button-select';
import { Option } from '../virtualized-select';
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
                      console.log('onclick selectgrid', indices, cell);
                      onClick(indices, cell);
                    }
                  }}
                  onChange={(option: Option) => {
                    if (typeof onChange === 'function') {
                      console.log('onchange selectgrid', indices, cell);
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
                      console.log('onClickSelectAll selectgrid', indices, cell);
                      onClickSelectAll(indices, cell);
                    }
                  }}
                  onClickSelectSome={() => {
                    if (typeof onClickSelectSome === 'function') {
                      console.log('onClickSelectSome selectgrid', indices, cell);
                      onClickSelectSome(indices, cell);
                    }
                  }}
                  removeCallback={(row: SelectedRow) => {
                    if (typeof removeCallback === 'function') {
                      console.log('removeCallback selectgrid', indices, cell);
                      removeCallback(row, indices, cell);
                    }
                  }}
                  {...props}
                />
              );
            } else {
              return null;
            }
          })}
        </div>
      );
    })}
  </div>
);

export default SelectGrid;
