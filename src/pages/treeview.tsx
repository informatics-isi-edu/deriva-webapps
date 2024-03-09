import { createRoot } from 'react-dom/client';
import React from 'react';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import LegacyTreeViewApp from '@isrd-isi-edu/deriva-webapps/src/components/treeview/legacy-treeview';

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
    // <LegacyTreeViewApp />
    <>This is the treeview app!</>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  // TODO dontFetchSession should be removed before merging with master
  <AppWrapper appSettings={treeviewSettings} includeNavbar displaySpinner ignoreHashChange includeAlerts dontFetchSession>
    <TreeviewApp />
  </AppWrapper>
);

