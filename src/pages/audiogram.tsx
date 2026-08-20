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

/*
 * Quick hack: standalone webapp pages have no catalog in the path, but the
 * navbar needs one to fetch the catalog's chaise-config annotation (navbar
 * menu, branding). Feed the ?catalog= URL param in as defaultCatalog before
 * chaise configures itself.
 */
const catalogParam = new URLSearchParams(windowRef.location.search).get('catalog');
if (catalogParam) {
  (windowRef as any).chaiseConfig = {
    ...((windowRef as any).chaiseConfig || {}),
    defaultCatalog: catalogParam,
  };
}

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={audiogramSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts>
    <AudiogramPage />
  </AppWrapper>
);
