import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import ButtonSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/button-select';

type SelectGridProps = {
  /**
   * selectors data to be rendered
   */
  selectors: any;
  /**
   * width of grid
   */
  maxWidth: number;
};

const SelectGrid = ({ selectors, maxWidth }: SelectGridProps): JSX.Element => (
  <div className='selectors-grid' style={{ display: 'flex', maxWidth: maxWidth }}>
    {selectors.map((row: any, i: number) => {
      return (
        <div key={i} className='selectors-row'>
          {row.map((cell: any, j: number) => {
            const { type, ...props } = cell;
            if (type === 'dropdown-select') {
              return <DropdownSelect key={j} {...props} />;
            } else if (type === 'button-select') {
              return <ButtonSelect key={j} {...props} />;
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
