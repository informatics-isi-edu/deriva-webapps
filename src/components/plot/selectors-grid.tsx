import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import GridLayout, { Responsive, WidthProvider } from 'react-grid-layout';
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
        selectorConfig: SelectorConfig[],
        templateParams: PlotTemplateParams,
    };
    selectorOptions: Option[][];
    setSelectorOptionChanged: any;
    width: number | string;
};
const ResponsiveGridLayout = WidthProvider(Responsive);

const handleChange = (option: Option, selectorConfig: SelectorConfig, templateParams: PlotTemplateParams, setSelectorOptionChanged: any) => {
    if (option) {
        setSelectorOptionChanged(true);
        const uid = selectorConfig?.uid;
        const valueKey = selectorConfig?.request_info?.value_key;
        templateParams.$control_values[uid].values = {
            [valueKey]: option.value, //else use default value
        };
        return option;
    }
};


const SelectorsGrid = ({ selectorData, selectorOptions, setSelectorOptionChanged, width }: SelectorsGridProps): JSX.Element => {
    const uid:string[]=[];
    const valueKey:string[]=[];
    const selectorValue: Option[]=[];
    selectorData.selectorConfig?.map((currentConfig,index)=>{
        const currUid=currentConfig?.uid;
        const currValueKey=currentConfig?.request_info.value_key;
        uid.push(currUid);
        valueKey.push(currValueKey);
        const selectedOption=selectorOptions[index].find((option: Option) => 
        option.value === selectorData.templateParams?.$control_values[currUid].values[currValueKey]);
        if(selectedOption){
            selectorValue.push(selectedOption);
        }
    });
    const gridConfig = selectorData.gridConfig;
    const gridProps=gridLayoutConfigMap(gridConfig);
    const mappedLayoutValues=Object.values(selectorData.layout)?.map((resLayout: any) => 
    (
        resLayout.map((item: LayoutConfig)=>gridLayoutConfigMap(({
        i: item?.source_uid,
        ...item,
    })))
    ));
    const layoutObj=Object.fromEntries(Object.entries(selectorData.layout).map(([key,val],index)=>[key,mappedLayoutValues[index]]));
    console.log(layoutObj,Object.values(layoutObj)[0]);
    return (
        <div className='selectors-grid' style={{ display: 'flex', flex: 1, width: width }}>
        <ResponsiveGridLayout className='grid-layout layout' 
        layouts={layoutObj}
        {...gridProps}
        >
        {selectorData.selectorConfig?.map((currentConfig,index)=>(
        <div key={currentConfig.uid}>
            <DropdownSelect
                id={uid[index]}
                defaultOptions={selectorOptions[index]}
                label={currentConfig?.label}
                //Using any for option type instead of 'Option' to avoid the lint error
                onChange={(option: any) => {
                    handleChange(option, currentConfig, selectorData.templateParams, setSelectorOptionChanged);
                }}
                value={selectorValue[index]}
            />
        </div>
        ))}
        </ResponsiveGridLayout>
        </div>
    );

};

export default SelectorsGrid;
