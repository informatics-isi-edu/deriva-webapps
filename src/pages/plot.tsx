import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_plot.scss';

import { createRoot } from 'react-dom/client';
import Plotly from 'plotly.js-cartesian-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/src/hooks/window-size';
import { usePlotData } from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

const plotSettings = {
  appName: 'app/plot',
  appTitle: 'Plot',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const Plot = createPlotlyComponent(Plotly);

const PlotApp = (): JSX.Element => {
  /**
   * Use plot data to be visualized by plotly component
   */
  const { parsedData, config, errors } = usePlotData(windowRef.plotConfigs);
  const windowSize = useWindowSize();

  //   if there was an error during setup, hide the spinner
  if ((!config || parsedData.length === 0) && errors.length > 0) {
    return <></>;
  }
  if (!config || parsedData.length === 0) {
    return <ChaiseSpinner />;
  }

  return (
    <div className='plot-page'>
      {parsedData.map((data, i): JSX.Element => {
        if (!data.layout.width && windowSize.width) {
          data.layout.width = 0.9 * windowSize.width; // plot width based on window width
        }
        if (!data.layout.height && windowSize.height) {
          data.layout.height = 0.8 * windowSize.height; // plot height based on window height
        }
        return <Plot key={i} className='plot' {...data} />;
      })}
    </div>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={plotSettings} includeNavbar displaySpinner ignoreHashChange>
    <PlotApp />
  </AppWrapper>
);
