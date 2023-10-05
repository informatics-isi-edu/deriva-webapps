import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import { Responsive, WidthProvider, ResponsiveProps as ResponsiveGridProps } from 'react-grid-layout';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
import { UserControlConfig, LayoutConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';
import { convertKeysSnakeToCamel } from '@isrd-isi-edu/deriva-webapps/src/utils/string';


type UserControlsGridProps = {
    /**
     * selectors data to be rendered
     */
    userControlData: {
        gridConfig: ResponsiveGridProps,
        layout: LayoutConfig[],
        userControlConfig: UserControlConfig[],
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
 * @param userControlConfig configuration of the given selector
 * @param templateParams 
 * @param setSelectorOptionChanged setState method to indicate the change
 * @returns 
 */
const handleChange = (option: Option, userControlConfig: UserControlConfig, templateParams: PlotTemplateParams, setSelectorOptionChanged: any) => {
    if (option) {
        setSelectorOptionChanged(true);
        const uid = userControlConfig?.uid;
        const valueKey = userControlConfig?.request_info?.value_key;
        templateParams.$control_values[uid].values = {
            [valueKey]: option.value, //else use default value
        };
        return option;
    }
};


const UserControlsGrid = ({ userControlData, selectorOptions, setSelectorOptionChanged, width }: UserControlsGridProps): JSX.Element => {
    const uid: string[] = [];
    const valueKey: string[] = [];
    const selectorValue: Option[] = [];
    //Collect uid's and valueKey's for all selectors
    userControlData.userControlConfig?.map((currentConfig, index) => {
        const currUid = currentConfig?.uid;
        const currValueKey = currentConfig?.request_info.value_key;
        uid.push(currUid);
        valueKey.push(currValueKey);
        const selectedOption = selectorOptions[index].find((option: Option) =>
            option.value === userControlData.templateParams?.$control_values[currUid].values[currValueKey]);
        if (selectedOption) {
            selectorValue.push(selectedOption);
        }
    });
    const gridProps = convertKeysSnakeToCamel(userControlData.gridConfig);
    //Convert snake_case keys inside different selector's layout to camel case
    const mappedLayoutValues = Object.values(userControlData.layout)?.map((resLayout: any) => (
        resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
            //i defines the item on which the given layout will be applied
            i: item?.source_uid,
            ...item,
        })))
    ));
    const layoutObj = Object.fromEntries(Object.entries(userControlData.layout).map(([key, val], index) => [key, mappedLayoutValues[index]]));
    return (
        <div className='selectors-grid' style={{ display: 'flex', flex: '0 1 0%', width: gridProps.width || width }}>
            <ResponsiveGridLayout className='grid-layout layout'
                layouts={layoutObj}
                {...gridProps}
            >
                {userControlData.userControlConfig?.map((currentConfig, index) => (
                    <div key={currentConfig.uid}>
                        <DropdownSelect
                            id={uid[index]}
                            defaultOptions={selectorOptions[index]}
                            label={currentConfig?.label}
                            //Using any for option type instead of 'Option' to avoid the lint error
                            onChange={(option: any) => {
                                handleChange(option, currentConfig, userControlData.templateParams, setSelectorOptionChanged);
                            }}
                            value={selectorValue[index]}
                        />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div>
    );

};

export default UserControlsGrid;
