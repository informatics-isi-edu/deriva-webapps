import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import Example from '@isrd-isi-edu/deriva-webapps/src/components/example';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';

const matrixSettings = {
  appName: 'app/matrix',
  appTitle: 'Matrix',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};

const MatrixApp = (): JSX.Element => {
  return (
    <>
      <div>Matrix app!</div>
      <Example />
    </>
  )
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={matrixSettings} includeNavbar displaySpinner ignoreHashChange>
    <MatrixApp />
  </AppWrapper>
);
