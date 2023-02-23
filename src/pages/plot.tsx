import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

import { createRoot } from 'react-dom/client';
import { useState } from 'react';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/hooks/window-size';

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

const PlotApp = (): JSX.Element => {
//   const { width = 0, height = 0 } = useWindowSize();
  return <div className='plot-page'>Hello World!</div>;
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={plotSettings} includeNavbar displaySpinner ignoreHashChange>
    <PlotApp />
  </AppWrapper>
);
