import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import BooleanSearch, { BooleanSearchProps } from '@isrd-isi-edu/deriva-webapps/src/components/boolean-search/boolean-search';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useRef, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';


const booleanSearchSettings = {
  appName: 'app/boolean-search',
  appTitle: 'Boolean Search',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};

const BooleanSearchApp = (): JSX.Element => {

  const { dispatchError, errors } = useError();

  const [booleanSearchProps, setBooleanSearchProps] = useState<BooleanSearchProps | null>(null);

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      setBooleanSearchProps({ config: windowRef.booleanSearchConfig });

    } catch (error: any) {
      dispatchError({ error })
    }

  }, []);

  // if there was an error during setup, hide the spinner
  if (!booleanSearchProps && errors.length > 0) {
    return <></>;
  }

  if (!booleanSearchProps) {
    return <ChaiseSpinner />;
  }

  return <BooleanSearch {...booleanSearchProps} />;
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={booleanSearchSettings} includeNavbar displaySpinner ignoreHashChange>
    <BooleanSearchApp />
  </AppWrapper>
);