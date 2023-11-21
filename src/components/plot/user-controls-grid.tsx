// import '/node_modules/react-resizable/css/styles.css';
// import '/node_modules/react-grid-layout/css/styles.css';

// components
import Dropdown from '@isrd-isi-edu/deriva-webapps/src/components/controls/dropdown';
import FacetSearchPopupControl from '@isrd-isi-edu/deriva-webapps/src/components/controls/facet-search-popup';

// models
import { Responsive, WidthProvider, ResponsiveProps as ResponsiveGridProps } from 'react-grid-layout';
import { LayoutConfig, UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

// utils
import { convertKeysSnakeToCamel } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

type UserControlsGridProps = {
  /**
   * selectors data to be rendered
   */
  userControlData: {
    gridConfig: ResponsiveGridProps,
    layout: LayoutConfig[],
    userControlConfig: UserControlConfig[]
  };
  width: number | string;
};

// In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

const UserControlsGrid = ({ userControlData, width }: UserControlsGridProps): JSX.Element => {
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

  const renderUserControls = () => {
    return (
      userControlData.userControlConfig?.map((config, idx) => {
        switch (config.type) {
          case 'dropdown':
            return (
              <div key={config.uid}>
                <Dropdown
                  userControlConfig={config} 
                />
              </div>
            )
          case 'facet-search-popup':
            return (
              <div key={config.uid}>
                <FacetSearchPopupControl
                  id={config.uid}
                  label={config?.label}
                  userControlConfig={config}
                />
              </div>
            )
          default:
            break;
        }
      })
    )
  }

  return (
    <div className='selectors-grid' style={{ display: 'flex', flex: '0 1 0%', width: gridProps.width || width }}>
      <ResponsiveGridLayout className='grid-layout layout'
        layouts={layoutObj}
        {...gridProps}
      >
        {renderUserControls()}
      </ResponsiveGridLayout>
    </div>
  );

};

export default UserControlsGrid;
