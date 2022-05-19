/* eslint-disable @typescript-eslint/no-var-requires */

const getAppConfig = require('@isrd-isi-edu/chaise/webpack/app.config');
const path = require('path');

// if NODE_DEV defined properly, uset it. otherwise set it to production.
const nodeDevs = ['production', 'development'];
let mode = process.env.NODE_ENV;
if (nodeDevs.indexOf(mode) == -1) {
  mode = nodeDevs[0];
}

const pathPrefix = path.resolve(__dirname, '..');
const pathAliases = {'@isrd-isi-edu/deriva-webapps': pathPrefix};

module.exports = (env) => {
  const WEBAPPS_BASE_PATH = env.BUILD_VARIABLES.WEBAPPS_BASE_PATH;
  return [
    getAppConfig(
      'matrix', 'Matrix', mode, env, {
      pathPrefix,
      pathAliases,
      appConfigLocation: `${WEBAPPS_BASE_PATH}config/matrix-config.js`
    }),
  ]
};
