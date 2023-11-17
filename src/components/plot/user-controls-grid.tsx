import { useContext, useEffect, useState } from 'react';
import { Option } from '@isrd-isi-edu/deriva-webapps/src/components/virtualized-select';
import { Responsive, WidthProvider, ResponsiveProps as ResponsiveGridProps, Layouts } from 'react-grid-layout';
import '/node_modules/react-resizable/css/styles.css';
import '/node_modules/react-grid-layout/css/styles.css';
import { UserControlConfig, LayoutConfig, defaultGridProps } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { convertKeysSnakeToCamel, validateGridProps } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
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
    const [layout, setLayout] = useState<Layouts>({});
    const [gridProps, setGridProps] = useState<ResponsiveGridProps>({});  
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

    //set layout and grid props for local react grid
    useEffect(() => {
        if (userControlData.gridConfig) {
          if (userControlData?.layout && Object.values(userControlData.layout).length > 0) {
            const mappedLayoutValues = Object.values(userControlData?.layout)?.map((resLayout: any) => (
              resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
                //i defines the item on which the given layout will be applied
                i: item?.source_uid,
                ...item,
              })))
            ));
            setLayout(Object.fromEntries(Object.entries(userControlData.layout).map(([key]: any, index) => [key, mappedLayoutValues[index]])));
          } else {
            const defaultControlUid = userControlData.userControlConfig.map((control) => {
              return control.uid;
            });
            const columnNumber = typeof userControlData.gridConfig.cols === 'number' && userControlData.gridConfig.cols;
            const defaultColumns = userControlData.gridConfig.cols && !columnNumber &&  Object.values(userControlData.gridConfig.cols) 
                              || Object.values(defaultGridProps.cols);
            const breakpointsApplied = userControlData.gridConfig?.breakpoints || defaultGridProps.breakpoints;

            setLayout(Object.fromEntries(Object.entries(breakpointsApplied).map(([key]: any, index) => [key, defaultControlUid.map((id, ind) => ({
              i: id,
              x: ind%2===0 ? 0 : ind + (columnNumber ? columnNumber/2 : defaultColumns[index]/2),
              y: Math.floor(ind / 2),
              w: columnNumber ? columnNumber/2 : defaultColumns[index]/2,
              h: 1,
              static: true,
            }))])));
          }
        }
      }, [userControlData.gridConfig, userControlData.layout]);

    //Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
    useEffect(()=>{
        if(userControlData.gridConfig){
          setGridProps(validateGridProps(userControlData.gridConfig));
        }
      },[userControlData.gridConfig])
    return (
        <div className='selectors-grid' style={{ display: 'flex', flex: '0 1 0%', width: gridProps.width || width }}>
            <ResponsiveGridLayout className='grid-layout layout'
                layouts={layout}
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

