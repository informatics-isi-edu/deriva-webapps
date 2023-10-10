import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_plot.scss';

import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import ChartWithEffect from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-effect';
import { Responsive, WidthProvider, ResponsiveProps as ResponsiveGridProps } from 'react-grid-layout';
import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';



// hooks
import { usePlotConfig } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { convertKeysSnakeToCamel } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { LayoutConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { useEffect, useState } from 'react';


const plotSettings = {
  appName: 'app/plot',
  appTitle: 'Plot',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};
//In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.
const ResponsiveGridLayout = WidthProvider(Responsive);

const PlotApp = (): JSX.Element => {
  /**
   * Use plot data to be visualized by plotly component
   */
  const { config, errors } = usePlotConfig(windowRef.plotConfigs);
  const [layout, setLayout] = useState({});
  const [gridProps, setGridProps] = useState({});

  useEffect(()=>{
    if(config){
    const mappedLayoutValues = Object.values(config?.layout)?.map((resLayout: any) => (
      resLayout.map((item: LayoutConfig) => convertKeysSnakeToCamel(({
        //i defines the item on which the given layout will be applied
        i: item?.source_uid,
        ...item,
      })))
    ));
    setLayout(Object.fromEntries(Object.entries(config.layout).map(([key, val], index) => [key, mappedLayoutValues[index]])));
    setGridProps(convertKeysSnakeToCamel(config?.grid_layout_config));
    }
  },[config]);
  console.log(layout, gridProps);

  return (
    !config ? <ChaiseSpinner /> : <ResponsiveGridLayout className='grid-layout layout'
      layouts={layout}
      {...gridProps}>
      {/* <div className='plot-page'> */}
      {/* {config.user_controls.map((currentControl): JSX.Element => {
          return  (<div key={currentControl.uid}>
          <DropdownSelect
              id={currentControl.uid}
              defaultOptions={currentControl[index]}
              label={currentControl?.label}
              //Using any for option type instead of 'Option' to avoid the lint error
              onChange={(option: any) => {
                  handleChange(option, currentControl, userControlData.templateParams, setSelectorOptionChanged);
              }}
              value={selectorValue[index]}
          />
      </div>);
        })} */}
        {config.plots.map((plotConfig): JSX.Element => {
          return <ChartWithEffect key={plotConfig.uid} config={plotConfig} />;
        })}
      {/* </div> */}
    </ResponsiveGridLayout>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={plotSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts>
    <PlotApp />
  </AppWrapper>
);
