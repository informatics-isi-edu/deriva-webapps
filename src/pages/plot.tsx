import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_plot.scss';

import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { usePlotConfig } from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

import ChartWithState from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-state';

const plotSettings = {
  appName: 'app/plot',
  appTitle: 'Plot',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const PlotApp = (): JSX.Element => {
  /**
   * Use plot data to be visualized by plotly component
   */
  const { config, errors } = usePlotConfig(windowRef.plotConfigs);

  if (!config && errors.length > 0) {
    return <></>;
  }
  if (!config) {
    return <ChaiseSpinner />;
  }

  return (
    <div className='plot-page'>
      {config.plots.map((plotConfig, i): JSX.Element => {
        return <ChartWithState key={i} config={plotConfig} />;
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
