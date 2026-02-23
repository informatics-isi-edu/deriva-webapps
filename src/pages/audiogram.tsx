import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_audiogram.scss';
import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// provider
import PlotAppProvider from '@isrd-isi-edu/deriva-webapps/src/providers/plot-app';

// components
import AudiogramApp from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-app';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { type JSX } from 'react';


const audiogramSettings = {
  appName: 'app/audiogram',
  appTitle: 'Audiogram',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const AudiogramPage = (): JSX.Element => {
  const config = windowRef.audiogramConfig;

  if (!config) {
    return <ChaiseSpinner />;
  }

  return (
    <PlotAppProvider>
      <AudiogramApp config={config} />
    </PlotAppProvider>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={audiogramSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts>
    <AudiogramPage />
  </AppWrapper>
);
