import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/hooks/window-size';
import { usePlotData } from '@isrd-isi-edu/deriva-webapps/hooks/plot';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

const plotSettings = {
  appName: 'app/plot',
  appTitle: 'Plot',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const Plot = createPlotlyComponent(Plotly);

const PlotApp = (): JSX.Element => {
  //   const { width = 0, height = 0 } = useWindowSize();
  const { errors, config, parsedData } = usePlotData(windowRef.plotConfigs);

  //   if there was an error during setup, hide the spinner
  if (!config && errors.length > 0) {
    return <></>;
  }
  if (!config) {
    return <ChaiseSpinner />;
  }

  console.log(parsedData);

  return (
    <div className='plot-page'>
      {parsedData.map((data, i) => (
        <Plot key={i} {...data} />
      ))}
    </div>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={plotSettings} includeNavbar displaySpinner ignoreHashChange>
    <PlotApp />
  </AppWrapper>
);
