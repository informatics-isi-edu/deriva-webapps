import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import DerivaVitessce, { DerivaVitessceProps} from '@isrd-isi-edu/deriva-webapps/src/components/vitessce/vitessce'
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useState } from 'react';
import { useVitessceConfig } from '@isrd-isi-edu/deriva-webapps/src/hooks/vitessce';

// models

// provider
import VitessceAppProvider from '@isrd-isi-edu/deriva-webapps/src/providers/vitessce-app';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';


const derivaVitessceSettings = {
  appName: 'app/vitessce',
  appTitle: 'Vitessce',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};

const DerivaVitessceApp = (): JSX.Element => {

  const { config, errors } = useVitessceConfig(windowRef.vitessceConfigs);

  const [vitessceProps, setVitessceProps] = useState<DerivaVitessceProps | null>(null);

  useEffect(() => {
    if (config) {
      setVitessceProps({ config: config });
    }
  }, [config]);

  // if there was an error during setup, hide the spinner
  if (!vitessceProps && errors.length > 0) {
    return <></>;
  }

  if (!vitessceProps) {
    return <ChaiseSpinner />;
  }

  return (
    <VitessceAppProvider>
      <DerivaVitessce {...vitessceProps} />
    </VitessceAppProvider>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={derivaVitessceSettings} includeNavbar displaySpinner ignoreHashChange>
    <DerivaVitessceApp />
  </AppWrapper>
);