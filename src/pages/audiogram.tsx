import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_audiogram.scss';
import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// components
import AudiogramApp from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-app';

// hooks
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import { useEffect, useRef, useState, type JSX } from 'react';

// models
import { AudiogramConfig } from '@isrd-isi-edu/deriva-webapps/src/models/audiogram-config';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { getAudiogramConfig } from '@isrd-isi-edu/deriva-webapps/src/utils/audiogram-config';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';


const audiogramSettings = {
  appName: 'app/audiogram',
  appTitle: 'Audiogram',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const AudiogramPage = (): JSX.Element => {
  const { dispatchError, errors } = useError();
  const [config, setConfig] = useState<AudiogramConfig | null>(null);

  // strict mode runs the effect twice in dev mode
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;
    try {
      setConfig(getAudiogramConfig());
    } catch (error: any) {
      dispatchError({ error });
    }
  }, []);

  // if there was an error during setup, hide the spinner
  if (!config && errors.length > 0) {
    return <></>;
  }
  if (!config) {
    return <ChaiseSpinner />;
  }
  return <AudiogramApp config={config} />;
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
