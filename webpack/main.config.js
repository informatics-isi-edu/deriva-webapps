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
        appName: 'heatmap',
        appTitle: 'Heatmap',
        appConfigLocation: `${WEBAPPS_BASE_PATH}config/heatmap-config.js`,
      },
      {
        appName: 'matrix',
        appTitle: 'Matrix',
        appConfigLocation: `${WEBAPPS_BASE_PATH}config/matrix-config.js`,
      },
      {
        appName: 'plot',
        appTitle: 'Plot',
        appConfigLocation: `${WEBAPPS_BASE_PATH}config/plot-config.js`,
        externalFiles: [
          `${WEBAPPS_BASE_PATH}bundles/plotly-basic.min.js`
        ]
      }
    ],
    mode,
    env,
    { rootFolderLocation, resolveAliases, urlBasePath: WEBAPPS_BASE_PATH }
  );
};
