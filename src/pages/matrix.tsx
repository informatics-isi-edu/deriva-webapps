import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import Matrix, { MatrixProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useRef, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';


const matrixSettings = {
  appName: 'app/matrix',
  appTitle: 'Matrix',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};

const MatrixApp = (): JSX.Element => {

  const { dispatchError, errors } = useError();

  const [matrixProps, setMatrixProps] = useState<MatrixProps | null>(null);

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      const config = getConfigObject(windowRef.matrixConfigs);
      setMatrixProps({ config });

    } catch (error: any) {
      dispatchError({ error })
    }

  }, []);

  // if there was an error during setup, hide the spinner
  if (!matrixProps && errors.length > 0) {
    return <></>;
  }

  if (!matrixProps) {
    return <ChaiseSpinner />;
  }

  return <Matrix {...matrixProps} />;
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={matrixSettings} includeNavbar displaySpinner ignoreHashChange>
    <MatrixApp />
  </AppWrapper>
);
