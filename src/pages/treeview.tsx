import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_treeview-app.scss';

import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import TreeviewContainer from '@isrd-isi-edu/deriva-webapps/src/components/treeview/treeview-containter';

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
    <TreeviewContainer />
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  // TODO dontFetchSession should be removed before merging with master
  <AppWrapper appSettings={treeviewSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts dontFetchSession>
    <TreeviewApp />
  </AppWrapper>
);
