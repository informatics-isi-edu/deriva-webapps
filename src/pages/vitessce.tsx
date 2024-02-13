import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import DerivaVitessce, { DerivaVitessceProps} from '@isrd-isi-edu/deriva-webapps/src/components/vitessce/vitessce'
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useRef, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';


const derivaVitessceSettings = {
  appName: 'app/vitessce',
  appTitle: 'Vitessce',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};

const DerivaVitessceApp = (): JSX.Element => {

  const { dispatchError, errors } = useError();

  const [vitessceProps, setVitessceProps] = useState<DerivaVitessceProps | null>(null);

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      setVitessceProps({ config: windowRef.vitessceConfig });

    } catch (error: any) {
      dispatchError({ error })
    }

  }, []);

  // if there was an error during setup, hide the spinner
  if (!vitessceProps && errors.length > 0) {
    return <></>;
  }

  if (!vitessceProps) {
    return <ChaiseSpinner />;
  }

  return <DerivaVitessce {...vitessceProps} />;
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={derivaVitessceSettings} includeNavbar displaySpinner ignoreHashChange>
    <DerivaVitessceApp />
  </AppWrapper>
);