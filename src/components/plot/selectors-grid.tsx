import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import { Responsive, WidthProvider } from 'react-grid-layout';
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

//In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);


/**
 * It sets a new value in templateParams.$control_values based on selector, 
 * triggers the setSelectorOptionChanged function, and returns the option
 * @param option changed option
 * @param selectorConfig configuration of the given selector
 * @param templateParams 
 * @param setSelectorOptionChanged setState method to indicate the change
 * @returns 
 */
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
    //Collect uid's and valueKey's for all selectors
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

    const gridProps=gridLayoutConfigMap(selectorData.gridConfig);
    //Convert snake_case keys inside different selector's layout to camel case
    const mappedLayoutValues=Object.values(selectorData.layout)?.map((resLayout: any) => (
        resLayout.map((item: LayoutConfig)=>gridLayoutConfigMap(({
        //i defines the item on which the given layout will be applied
        i: item?.source_uid,
        ...item,
    })))
    ));
    const layoutObj=Object.fromEntries(Object.entries(selectorData.layout).map(([key,val],index)=>[key,mappedLayoutValues[index]]));
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
