import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_plot.scss';

import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import ChartWithEffect from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-effect';
import { Responsive, WidthProvider, ResponsiveProps as ResponsiveGridProps, Layouts } from 'react-grid-layout';
import DropdownSelect from '@isrd-isi-edu/deriva-webapps/src/components/plot/dropdown-select';



// hooks
import { usePlotConfig } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';
import { useEffect, useState } from 'react';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { DataConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { TemplateParamsProvider } from '@isrd-isi-edu/deriva-webapps/src/components/plot/template-params';

import PlotControlGrid from '@isrd-isi-edu/deriva-webapps/src/components/plot/plot-control-grid';


const plotSettings = {
  appName: 'app/plot',
  appTitle: 'Plot',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};
//In simple cases a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events.

const PlotApp = (): JSX.Element => {
  /**
   * Use plot data to be visualized by plotly component
   */
  const { config, errors } = usePlotConfig(windowRef.plotConfigs);

  const [plotAppProps, setPlotAppProps] = useState<DataConfig>();

  useEffect(()=>{
    if(config){
      setPlotAppProps(config);
    }
  },[config])

   
  // if there was an error during setup, hide the spinner
  if (!plotAppProps && errors.length > 0) {
    return <></>;
  }

  if (!plotAppProps) {
    return <ChaiseSpinner />;
  }

  return <PlotControlGrid config={plotAppProps} />;

  
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={plotSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts>
    <TemplateParamsProvider>
    <PlotApp />
    </TemplateParamsProvider>
  </AppWrapper>
);
