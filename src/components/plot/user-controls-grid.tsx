import { useContext } from 'react';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import { Responsive, WidthProvider, ResponsiveProps as ResponsiveGridProps, Layouts } from 'react-grid-layout';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
import { UserControlConfig, LayoutConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { convertKeysSnakeToCamel } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/plot/user-control';
import { TemplateParamsContext } from '@isrd-isi-edu/deriva-webapps/src/components/plot/template-params';


type UserControlsGridProps = {
    /**
     * selectors data to be rendered
     */
    userControlData: {
        gridConfig: ResponsiveGridProps,
        layout: Layouts,
        userControlConfig: UserControlConfig[],
    };
    selectorOptions: Option[][];
    width: number | string;
};

//In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

const UserControlsGrid = ({ userControlData, selectorOptions, width }: UserControlsGridProps): JSX.Element => {
    const uid: string[] = [];
    const valueKey: string[] = [];
    const selectorValue: Option[] = [];
    const {templateParams} = useContext(TemplateParamsContext);
    //Collect uid's and valueKey's for all selectors
    userControlData.userControlConfig?.map((currentConfig, index) => {
        const currUid = currentConfig?.uid;
        const currValueKey = currentConfig?.request_info.value_key;
        uid.push(currUid);
        valueKey.push(currValueKey);
        const selectedOption = selectorOptions[index].find((option: Option) =>
            option.value === templateParams?.$control_values[currUid]?.values[currValueKey]);
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
    const layoutObj = Object.fromEntries(Object.entries(userControlData.layout).map(([key], index) => [key, mappedLayoutValues[index]]));
    return (
        <div className='selectors-grid' style={{ display: 'flex', flex: '0 1 0%', width: gridProps.width || width }}>
            <ResponsiveGridLayout className='grid-layout layout'
                layouts={layoutObj}
                {...gridProps}
            >
                {userControlData.userControlConfig?.map((currentConfig, index) => (
                    <div key={currentConfig.uid} style={{zIndex: 1}}>
                    <UserControl 
                    controlConfig={currentConfig} 
                    controlOptions={selectorOptions[index]} />
                    </div>
                ))}
            </ResponsiveGridLayout>
        </div> 
    );

};

export default UserControlsGrid;

