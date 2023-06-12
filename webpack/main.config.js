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
        appName: 'matrix',
        appTitle: 'Matrix',
        appConfigLocation: `${WEBAPPS_BASE_PATH}../../local-test/matrix-config.js`,
        // appConfigLocation: `${WEBAPPS_BASE_PATH}config/matrix-config.js`
      }
    ],
    mode,
    env,
    { rootFolderLocation, resolveAliases, urlBasePath: WEBAPPS_BASE_PATH }
  );
};
