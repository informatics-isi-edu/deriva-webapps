/* eslint-disable @typescript-eslint/no-var-requires */

const { getWebPackConfig } = require('@isrd-isi-edu/chaise/webpack/app.config');
const path = require('path');

// if NODE_DEV defined properly, uset it. otherwise set it to production.
const nodeDevs = ['production', 'development'];
let mode = process.env.NODE_ENV;
if (nodeDevs.indexOf(mode) === -1) {
  mode = nodeDevs[0];
}

const rootFolderLocation = path.resolve(__dirname, '..');
const resolveAliases = { '@isrd-isi-edu/deriva-webapps': rootFolderLocation };

module.exports = (env) => {
  const WEBAPPS_BASE_PATH = env.BUILD_VARIABLES.WEBAPPS_BASE_PATH;
  return getWebPackConfig(
    [
      {
        appName: 'boolean-search',
        appTitle: 'Boolean Search',
        appConfigLocation: `${WEBAPPS_BASE_PATH}config/boolean-search-config.js`,
      },
      {
        appName: 'heatmap',
        appTitle: 'Heatmap',
        appConfigLocation: `${WEBAPPS_BASE_PATH}config/heatmap-config.js`,
      },
      {
        appName: 'matrix',
        appTitle: 'Matrix',
        appConfigLocation: `${WEBAPPS_BASE_PATH}config/matrix-config.js`
      },
      {
        appName: 'plot',
        appTitle: 'Plot',
        appConfigLocation: `${WEBAPPS_BASE_PATH}config/plot-config.js`,
        externalFiles: [
          `${WEBAPPS_BASE_PATH}bundles/plotly-basic.min.js`
        ]
      },
      {
        appName: 'treeview',
        appTitle: 'Treeview',
        appConfigLocation: `${WEBAPPS_BASE_PATH}config/treeview-config.js`,
        externalFiles: [
          `${WEBAPPS_BASE_PATH}treeview/util/jquery-3.4.1.min.js`,
          `${WEBAPPS_BASE_PATH}treeview/util/jquery-ui.js`,
          `${WEBAPPS_BASE_PATH}treeview/util/jstree.js`,
          `${WEBAPPS_BASE_PATH}treeview/util/jstreegrid.js`
        ],
        externalStyleFiles: [
          /**
           * TODO this is copied from the old implementation.
           * issue with using out own jquery-ui css is that it will be missing icons/images that have a relative path on jquery website
           */
          'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css',
          `${WEBAPPS_BASE_PATH}treeview/themes/default/images/style.css`
        ]
      },
      /**
       * NOTE: This application is not used anymore and since it made the whole install and build process very slow,
       * we decided to skip installing it. Do the following if you want to bring this app back:
       *
       * 1. Add "vitessce": "^3.3.7" to the package.json dependencies (and "@vitessce/types": "^3.3.11" to dev dependencies).
       *    Also adding this caused issues with how we're using react, so we also had to explicitly add react to dependencies:
       *      `"react": "^18.2.0"` and `"react-dom": "^18.2.0"`
       *    Then do `npm install --include=dev` to install the new dependencies and generate a new package-lock.json.
       *
       * 2. Modify `deploy` and `deploy-w-config` Makefile targets to call `deploy-vitessce` and `deploy-vitessce-w-config` respectively.
       *
       * 3. Uncomment the following.
       */
      // {
      //   appName: 'vitessce',
      //   appTitle: 'Vitessce',
      //   appConfigLocation: `${WEBAPPS_BASE_PATH}config/vitessce-config.js`,
      //   externalFiles: [
      //     `${WEBAPPS_BASE_PATH}bundles/plotly-basic.min.js`
      //   ]
      // },
    ],
    mode,
    env,
    {
      rootFolderLocation,
      resolveAliases,
      urlBasePath: WEBAPPS_BASE_PATH,
      extraWebpackProps: {
        externals: {
          // treat plotly as an external dependency and don't compute it
          // TODO we should most probably do something similar for the other version of plotly that we're including
          'plotly.js-basic-dist-min': 'Plotly'
        }
      }
    }
  );
};
