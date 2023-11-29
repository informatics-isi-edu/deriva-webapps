import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseTreeview from '@isrd-isi-edu/deriva-webapps/src/components/treeview/chaise-treeview';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';

const treeviewSettings = {
  appName: 'app/treeview',
  appTitle: 'Treeview',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const TreeviewApp = (): JSX.Element => {
  return (
    <ChaiseTreeview />
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={treeviewSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts>
    <TreeviewApp />
  </AppWrapper>
);

