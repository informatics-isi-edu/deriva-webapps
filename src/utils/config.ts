
// utils
import { CustomError } from '@isrd-isi-edu/chaise/src/models/errors';
import { isObjectAndNotNull, isStringAndNotEmpty } from '@isrd-isi-edu/chaise/src/utils/type-utils';
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

const throwCustomError = (header: string, message: string) => {
  throw new CustomError(header, message);
}

/**
 * return the config object based on the query parameter in the URL.
 *
 * Will throw an error if the config was missing or had issues.
 */
export const getConfigObject = (configObj: any) => {
  const errorHeader = 'Invalid Config';

  let configName = getQueryParam(windowRef.location.href, 'config');
  if (!isStringAndNotEmpty(configName)) {
    configName = '*';
  }

  if (!isObjectAndNotNull(configObj)) {
    throwCustomError(errorHeader, 'Config is not defined.');
  }

  if (!(configName in configObj)) {
    throwCustomError(errorHeader, 'Invalid config parameter in the url');
  }

  if (!isObjectAndNotNull(configObj[configName])) {
    throwCustomError(errorHeader, 'Defined config object is not valid.');
  }

  // TODO more validation?

  return configObj[configName];
}
