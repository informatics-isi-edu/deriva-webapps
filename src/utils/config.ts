
// utils
import { CustomError } from '@isrd-isi-edu/chaise/src/models/errors';
import { isObjectAndNotNull, isStringAndNotEmpty } from '@isrd-isi-edu/chaise/src/utils/type-utils';
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { DataConfig, PlotConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

const throwCustomError = (header: string, message: string) => {
  throw new CustomError(header, message);
}

/**
 * return the config object based on the query parameter in the URL.
 *
 * Will throw an error if the config was missing or had issues.
 */
export const getConfigObject = (configObj: PlotConfig): DataConfig => {
  const errorHeader = 'Invalid Config';
  const defaultConfig = '*';

  // if the urls is defined like `?config` or `?config=`, getQueryParam returns `true`
  let configName = getQueryParam(windowRef.location.href, 'config');
  if (!isStringAndNotEmpty(configName) || configName === 'true') {
    configName = defaultConfig;
  }

  if (!isObjectAndNotNull(configObj)) {
    throwCustomError(errorHeader, 'Config is not defined.');
  }

  if (!(configName in configObj)) {
    throwCustomError(errorHeader, 'Invalid config parameter in the url');
  }

  /** 
   * This will recursively go through "aliases" trying to fetch a config object
   * will continue to look for an object if one alias points to another alias
   * if config name ends in an invalid or undefined config, the default config is used
   *   - default config would be named '*' in the document
   */
  const recursiveConfigName = (name: string): string => {
    const plotConfig = configObj[name];  
    if (typeof plotConfig === 'string') {
      return recursiveConfigName(plotConfig);
    } else if (name !== defaultConfig && !isObjectAndNotNull(configObj[name])){
      // if the alias doesn't match any known configs, check for `default config` to show
      // make sure we don't recursively keep trying to fetch the default config
      return recursiveConfigName(defaultConfig);
    } else {
      return name;
    }
  }

  configName = recursiveConfigName(configName);
  if (!isObjectAndNotNull(configObj[configName])) {
    throwCustomError(errorHeader, 'Defined config object is not valid.');
  }

  // TODO more validation?

  return configObj[configName];
}

/**
 * This function is used to config the Row Headers / Col Headers
 * @param size - Width of the row headers or Height of the column headers
 * @param scrollable - Whether allow the headers scroll
 * @param scrollableMaxSize - The max Width / Height of the scrollable content
 * @returns 
 */
export const processMatrixHeaderStyles = (size: number, scrollable?: boolean, scrollableMaxSize?: number) => {
  // Check whether user config the scrollableMaxSize, if not and scrollable is true, this will be used to config scrollableMaxSize as auto
  const validMaxSize = typeof scrollableMaxSize === 'number' && scrollableMaxSize > 0;

  // Ensure usedScrollable is a real boolean true or false by handling various types of input value
  let usedScrollable = !!scrollable;
  // Ensure the usedMaxSize to be a type of number
  let usedMaxSize = validMaxSize ? scrollableMaxSize : size;

  // If header is not scrollable or scrollableMaxSize is less than size, set scrollableMaxSize to be size
  if (!usedScrollable || usedMaxSize < size) {
    usedMaxSize = size;
  }

  // If user set the scrollableMaxSize equal to the size exactly, then make the header non-scrollable
  if(usedMaxSize === size && usedScrollable && validMaxSize){
    usedScrollable = false;
  }

  // If user did not config scrollableMaxSize and usedScrollable is true, this means scrollableMaxSize should be auto
  // usedMaxSize (-1) means this is auto and will be used in logic statement in headers components
  if (!validMaxSize && usedScrollable) {
    usedMaxSize = -1;
  }

  return {
    scrollable: usedScrollable,
    scrollableMaxSize: usedMaxSize
  }
}