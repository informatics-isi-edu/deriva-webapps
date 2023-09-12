import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import GridLayout from 'react-grid-layout';
import { gridLayoutConfigMap } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
import { GridLayoutConfig, SelectorConfig, LayoutConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';


type SelectorsGridProps = {
    /**
     * selectors data to be rendered
     */
    selectorData: {
        gridConfig: GridLayoutConfig,
        layout: LayoutConfig[],
        selectorConfig: SelectorConfig,
        templateParams: PlotTemplateParams,
    };
    selectorOptions: Option[];
    setSelectorOptionChanged: any;
    width: number | string;
};

const handleChange = (option: Option, selectorData: any, setSelectorOptionChanged: any) => {
    if (option) {
        setSelectorOptionChanged(true);
        const uid = selectorData?.selectorConfig?.uid;
        const valueKey = selectorData?.selectorConfig?.request_info?.value_key;
        selectorData.templateParams.$control_values[uid].values = {
            [valueKey]: option.value, //else use default value
        };
        return option;
    }
};


const SelectorsGrid = ({ selectorData, selectorOptions, setSelectorOptionChanged, width }: SelectorsGridProps): JSX.Element => {
    const uid = selectorData.selectorConfig.uid;
    const valueKey = selectorData.selectorConfig.request_info.value_key;
    const gridConfig = selectorData.gridConfig;
    const selectorValue = selectorOptions.filter((option: Option) => 
    option.value === selectorData.templateParams?.$control_values[uid].values[valueKey]);
    const gridProps=gridLayoutConfigMap(gridConfig);
    const layoutObj=selectorData.layout?.map((item: LayoutConfig)=>gridLayoutConfigMap(({
        i: item?.component,
        ...item,
    })));
    return (
        <div className='selectors-grid' style={{ display: 'flex', flex: 1, width: width }}>
        <GridLayout className='grid-layout layout' 
        layout={layoutObj}
        {...gridProps}
        >
        <div key={'scale1'}>
            <DropdownSelect
                id={selectorData.selectorConfig?.uid}
                defaultOptions={selectorOptions}
                label={selectorData.selectorConfig?.label}
                //Using any for option type instead of 'Option' to avoid the lint error
                onChange={(option: any) => {
                    handleChange(option, selectorData, setSelectorOptionChanged);
                }}
                value={selectorValue}
            />
        </div>
        <div key={'scale2'}>
            <DropdownSelect
                id={selectorData.selectorConfig?.uid}
                label={selectorData.selectorConfig?.label}
                defaultOptions={selectorOptions}
                onChange={(option: any) => {
                    handleChange(option, selectorData, setSelectorOptionChanged);
                }}
                value={selectorValue}
            />
        </div>
        </GridLayout>
        </div>
    );

};

export default SelectorsGrid;
