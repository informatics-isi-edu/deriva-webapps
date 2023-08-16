import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import ButtonSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/button-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';

import { SelectorConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

type SelectorsGridProps = {
  /**
   * selectors data to be rendered
   */
  selectorConfig: SelectorConfig;
};

const getDataOptions = ({selectorConfig}: SelectorsGridProps) => {
    if(selectorConfig?.request_info?.url_pattern){

    }
    console.log(selectorConfig);
}

const SelectorsGrid = ({ selectorConfig }: SelectorsGridProps): JSX.Element => {
// const dataOptions=getDataOptions(selectorConfig);

  return (
    <div className='selectors-grid' style={{ display: 'flex', flex: 1}}>
    <DropdownSelect />
   </div>
  );
};

export default SelectorsGrid;
