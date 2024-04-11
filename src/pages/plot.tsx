import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_plot.scss';
import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { usePlotConfig } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';
import { useEffect, useState } from 'react';

// provider
import PlotAppProvider from '@isrd-isi-edu/deriva-webapps/src/providers/plot-app';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { DataConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

import useAlert from '@isrd-isi-edu/chaise/src/hooks/alerts';
import { ChaiseAlertType } from '@isrd-isi-edu/chaise/src/providers/alerts';
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

  useEffect(() => {
    if (config) {
      // intiialize uids for plots if not defined
      const tempConfig = {...config}
      tempConfig.plots.forEach((plotConfig, index) => {
        // Default uid will be considered as eg. bar_0 for first bar plot
        if (!plotConfig.uid) {
          const genUid = plotConfig.plot_type + '_' + index;
          plotConfig.uid = genUid;
          // log this message instead of showing a warning that is showing in old configs
          console.log(`No UID found for the given plot. Using ${genUid} as default Id`)
        }
      });
      setPlotAppProps(tempConfig);
    }
  }, [config])

   
  // if there was an error during setup, hide the spinner
  if (!plotAppProps && errors.length > 0) {
    return <></>;
  }

  if (!plotAppProps) {
    return <ChaiseSpinner />;
  }

  return (
    <PlotAppProvider>
      <PlotControlGrid config={plotAppProps} />
    </PlotAppProvider>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={plotSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts>
    <PlotApp />
  </AppWrapper>
);
