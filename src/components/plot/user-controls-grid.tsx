// import '/node_modules/react-resizable/css/styles.css';
// import '/node_modules/react-grid-layout/css/styles.css';
import { memo, useEffect, useState } from 'react';

// components
import UserControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/user-control';

// models
import { LayoutConfig, UserControlConfig, defaultGridProps } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { Layouts, Responsive, ResponsiveProps as ResponsiveGridProps, WidthProvider } from 'react-grid-layout';

// utils
import { convertKeysSnakeToCamel, validateGridProps } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

type UserControlsGridProps = {
  /**
   * selectors data to be rendered
   */
  userControlData: {
    gridConfig: ResponsiveGridProps,
    layout: Layouts,
    userControlConfig: UserControlConfig[]
  };
  width: number | string;
};

// In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

const UserControlsGrid = ({
  userControlData,
  width
}: UserControlsGridProps): JSX.Element => {
  const [layout, setLayout] = useState<Layouts>({});
  const [gridProps, setGridProps] = useState<ResponsiveGridProps>({});

  const controlConfig = userControlData.userControlConfig;

  const defaultGridPropsConverted = convertKeysSnakeToCamel(defaultGridProps);

  // set layout and grid props for local react grid
  useEffect(() => {
    if (userControlData?.gridConfig?.layouts && Object.values(userControlData.gridConfig?.layouts).length > 0) {
      const mappedLayoutValues = Object.values(userControlData.gridConfig?.layouts)?.map((resLayout: any) => (
        resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
          // i defines the item on which the given layout will be applied
          i: item?.source_uid,
          ...item,
        })))
      ));

      setLayout(Object.fromEntries(Object.entries(userControlData.gridConfig?.layouts).map(([key]: any, index) => [key, mappedLayoutValues[index]])));
    } else {
      const gridConfig = userControlData.gridConfig;
      // Default uid for local controls will be considered as eg. local_dropdown_0 for first local control
      const defaultControlUid: string[] = controlConfig.map((control: UserControlConfig) => control.uid);
      // if `cols` is a number, use that number
      const columnNumber = typeof gridConfig.cols === 'number' && gridConfig.cols;
      // cols is an object, defaultColumns is an array containing key value pairs (breakpointKey, value)
      const defaultColumns = gridConfig.cols && !columnNumber && Object.values(gridConfig.cols) || Object.values(defaultGridProps.cols);
      const breakpointsApplied = gridConfig.breakpoints || defaultGridProps.breakpoints;

      const tempLayout = Object.fromEntries(Object.entries(breakpointsApplied).map(
        ([key]: any, index: number) => {
          return [key, defaultControlUid.map((id: string, ind: number) => {
            return {
              i: id,
              x: ind % 2 === 0 ? 0 : ind + (columnNumber ? columnNumber / 2 : defaultColumns[index] / 2),
              y: Math.floor(ind / 2),
              w: columnNumber ? columnNumber / 2 : defaultColumns[index] / 2,
              h: 1,
              static: true
            }
          })]
        }
      ))

      setLayout(tempLayout);
    }
  }, []);

  // Validate (Transform the keys to the correct case, adjust the values to suit ResponsiveGridLayout) and configure the grid layout props
  useEffect(() => {
    if (userControlData.gridConfig) {
      setGridProps(validateGridProps(userControlData.gridConfig));
    }
  }, [userControlData.gridConfig])

  const renderUserControls = () => {
    return (
      controlConfig?.map((config: UserControlConfig) => (
        <div key={config.uid}>
          <UserControl controlConfig={config} />
        </div>
      ))
    )
  }

  return (
    <div className='selectors-grid' style={{ display: 'flex', flex: '0 1 0%', width: gridProps.width || width }}>
      <ResponsiveGridLayout className='grid-layout layout' style={{ position: 'relative' }}
        // TODO: Look for another fix for overlapping issue in controls
        useCSSTransforms={false}
        {...defaultGridPropsConverted}
        {...gridProps}
        layouts={layout}
      >
        {renderUserControls()}
      </ResponsiveGridLayout>
    </div>
  );

};

// only rerender component if props change but the props should NOT change, so this component shouldn't "rerender"
export default memo(UserControlsGrid);
