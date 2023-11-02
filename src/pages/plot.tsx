import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_plot.scss';
import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import ChartWithControls from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-controls';

// hooks
import { usePlotConfig } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';

// provider
import PlotProvider from '@isrd-isi-edu/deriva-webapps/src/providers/plot';

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
      <PlotProvider>
        {config.plots.map((plotConfig, i): JSX.Element => {
          return <ChartWithControls key={i} config={plotConfig} />;
        })}
      </PlotProvider>
    </div>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={plotSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts>
    <PlotApp />
  </AppWrapper>
);
