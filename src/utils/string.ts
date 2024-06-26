// models
import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { VitessceTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/models/vitessce';
import { ControlScope, defaultGridProps } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// utils
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

/**
 * Appends and returns the pcid and ppid for the given link
 *
 * @param link string to append pcid and ppid to
 * @returns {string}
 */
export const appendContextParameters = (link: string): string => {
  const contextUrlParams = ConfigService.contextHeaderParams;
  const qCharacter = getQueryParamCharacter(link);
  return qCharacter + 'pcid=' + contextUrlParams.cid + '&ppid=' + contextUrlParams.pid;
};

/**
 * Checks if the given link already has a "?" if yes append "&" else append "?" to add the parameters to the link
 *
 * @param link
 * @returns {string}
 */
export const getQueryParamCharacter = (link: string): string => {
  return link.indexOf('?') !== -1 ? '&' : '?';
};

/**
 * Extracts the link from the given markdown string pattern, otherwise returns false if no link was found
 *
 * @param pattern
 * @returns
 */
export const extractLink = (pattern: string): string | false => {
  // Checking if the pattern contains link if yes then extract the link directly else
  let extractedLink: string | boolean = false;
  let match = null;
  if (pattern.includes('(') && pattern.includes(')')) {
    // Defined regex to extract url from the pattern defined in the configuration file
    // Example: [{{{ Number of records }}}](/deriva-webapps/plot/?config=gudmap-todate-pie){target=_blank}
    // extractedLink = /deriva-webapps/plot/?config=gudmap-todate-pie
    // Extracts all the characters placed between "( )".
    // "]/(" : find a ']' bracket followed by '('
    // "." : matches any character and
    // "*?" : matches the previous token between zero and unlimited times
    // "i" modifier :  insensitive. Case insensitive match (ignores case of [a-zA-Z])
    // "g" modifier :  global. All matches.
    const markdownUrlRegex = /]\((.*?)\)/gi;
    match = markdownUrlRegex.exec(pattern);
    extractedLink = match ? match[1] : false;
  } else if (pattern.includes('href')) {
    // Defined regex to extract url from the generated html element with href attribute
    // Example: <a href="(/deriva-webapps/plot/?config=gudmap-todate-pie" target="_blank">prostate gland</a>
    // extractedLink = /deriva-webapps/plot/?config=gudmap-todate-pie
    // Extracts a link from the anchor tag
    // "\s" : matches a space character
    // ^\n\r : matches a string that does not have new line or carriage return
    const htmlUrlRegex = /<a\shref="([^\n\r]*?)"/gi;
    match = htmlUrlRegex.exec(pattern);
    extractedLink = match ? match[1] : false;
  }

  // return false if no extracted link
  return extractedLink;
};

/**
 * Formats the string data used by plot by adding commas for numbers when neccesary
 *
 * @param data data value
 * @param format whether to format or not
 * @param type the type of plot data
 * @returns
 */
export const formatPlotData = (data: string, format: boolean, type: string): string | number => {
  if (format) {
    try {
      const formatedData = parseInt(data.split(' ')[0], 10);
      if (isNaN(formatedData)) {
        return data;
      }
      if (type === 'pie') {
        return formatedData.toString();
      }
      // this regex is used to add a thousand separator in the number if possible
      return addComma(formatedData);
    } catch (e) {
      return data;
    }
  } else {
    if (type === 'pie' || typeof data !== 'number') {
      return data;
    }
    return addComma(data);
  }
};

/**
 * Adds a thousand separator in the given number if possible
 *
 * @param data data to add thousand separator
 * @returns
 */
export const addComma = (data: number | string): string => {
  return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

/**
 * Creates the link based on the given markdown pattern and templateParam
 *
 * @param markdownPattern pattern used to create link 
 * @param templateParam params used to replace values in the pattern to create the link
 * @returns
 */
export const createLink = (markdownPattern: string, templateParam?: any): string => {
  let markdown = markdownPattern;
  if (templateParam) {
    markdown = ConfigService.ERMrest.renderHandlebarsTemplate(markdownPattern, templateParam);
  }
  const patternLink = ConfigService.ERMrest.renderMarkdown(markdown, true);
  const extractedLink = extractLink(markdownPattern);
  const linkWithContextParams = createLinkWithContextParams(markdownPattern, extractedLink);
  return patternLink.replace(extractedLink, linkWithContextParams);
};


/**
 * Creates a link with context parameters based on the given markdown pattern or extracted link.
 * Uses the extracted link first, otherwise uses the markdown pattern. If neither is provided, it
 * will not create a proper link.
 *
 * @param markdownPattern pattern used to create result 
 * @param extractedLink link used to create result 
 * @returns
 */
export const createLinkWithContextParams = (
  markdownPattern?: string,
  extractedLink?: string | false
): string => {
  let link: string | false = '';
  if (extractedLink) {
    link = extractedLink;
  } else if (markdownPattern) {
    link = extractLink(markdownPattern);
  }
  return link + appendContextParameters(link || '');
};

/**
 * Gets the uri and headers for the given query pattern and template params
 * 
 * @param queryPattern 
 * @param templateParams 
 * @returns 
 */
export const getPatternUri = (queryPattern: string, templateParams: PlotTemplateParams | VitessceTemplateParams) => {
  const { contextHeaderName } = ConfigService.ERMrest;
  const defaultHeaders = ConfigService.contextHeaderParams;
  const uri = ConfigService.ERMrest.renderHandlebarsTemplate(queryPattern, templateParams);
  const headers = { [contextHeaderName]: defaultHeaders };

  if (uri) {
    const uriParams = uri.split('/');

    let schema_table = uriParams[uriParams.indexOf('entity') + 1];
    if (schema_table.includes(':=')) schema_table = schema_table.split(':=')[1]; // get schema_table

    const catalog = uriParams[uriParams.indexOf('catalog') + 1]; // get catalog

    headers[contextHeaderName] = ConfigService.ERMrest._certifyContextHeader({
      ...headers[contextHeaderName],
      schema_table,
      catalog,
    });
  }

  return { uri, headers };
};

/**
 * Extracts the text from the given markdown string pattern, otherwise returns false if no text was found
 * @param pattern markdown pattern 
 * @returns 
 */
export const extractAndFormatDate = (message: string): string => {
  let match = null;
  let extractedDate: string;
  let modifiedString = message;
  const timestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+-\d{2}:\d{2}/;
  const dateRegex = /\d{4}-\d{2}-\d{2}/;
  match = dateRegex.exec(message);
  extractedDate = match ? match[0] : '';
  if (extractedDate) {
    extractedDate = windowRef.moment(extractedDate).format('MMM D, YYYY');
    modifiedString = message.replace(timestampRegex, extractedDate);
  }
  return modifiedString;
};

/* 
* @param pattern uri link pattern
* @param width no. of characters to be shown in one line used by wrapText method
* @param wrapLimit maximum no. of lines to be shown after wrapping text used by wrapText method
* @returns wrapped text/link with <br> tags inserted
*/
export const extractValue = (pattern: string, width: number, wrapLimit: number) => {
  const anchorTagRegex = /<a\b[^>]*>(.*?)<\/a>/g;
  let messageText = pattern;
  const match = pattern?.match(anchorTagRegex);
  //If pattern has anchor tags then replace the text inside the anchor tag
  if (match) {
    const anchorTags = pattern?.split(anchorTagRegex);
    const extractedTexts = anchorTags?.filter(text => text !== '');
    messageText = pattern.replace(extractedTexts[1], wrapText(extractedTexts[1], width, wrapLimit));
  }
  //Else just wrap the given text without extracting
  else {
    messageText = wrapText(pattern, width, wrapLimit);
  }

  return messageText;
};

/**
 * 
 * @param text long string
 * @param width no. of characters to be shown in one line
 * @param wrapLimit maximum no. of lines to be shown after wrapping text
 * @returns wrapped text with <br> tags inserted
 */
export const wrapText = (text: string, width: number, wrapLimit: number) => {
  const words = text?.split(' ');
  let currentLine = '';
  let wrappedText = '';
  let brCount = 0;
  let i;
  //Return original text when it less than wrapping width
  if (text?.length <= width) {
    return text;
  }

  //Loop to create the wrapped text word by word
  for (i = 0; i < words?.length; i++) {
    const word = words[i];
    const wordWithSpace = (currentLine ? ' ' : '') + word;

    //If current line can accomodate given word within wrapping limit then add it to the current line
    if (currentLine?.length + wordWithSpace?.length <= width) {
      currentLine += wordWithSpace;
    }
    //Else put the word in next line i.e. add word after inserting <br> tag
    else {
      //Break the loop if maximum lines of wrapping has reached (to not show the text content after this line)
      if (brCount === wrapLimit - 1) {
        break;
      }
      wrappedText += (wrappedText ? '<br>' : '') + currentLine;
      currentLine = word;
      brCount++;
    }
  }
  //Append the currentline with text
  wrappedText += (wrappedText ? '<br>' : '') + currentLine;
  //Add ellipses at the end if the text is truncated due to limit
  if (i <= words?.length - 1) {
    wrappedText += '...';
  }
  return wrappedText;
};

/**
 * 
 * @param data It can be either csv or json data
 * @returns true if data is of json type and false for other types
 */
export const isDataJSON = (data: any) => {
  try {
    const parsedData = JSON.parse(JSON.stringify(data));
    return !(typeof parsedData === 'string');
  } catch (error) {
    return false;
  }
}

/**
 * Replace snake_case string to camel case
 * @param str 
 * @returns 
 */
export const toCamel = (str: string) => {
  return str.replace(
    /(?!^)_(.)/g,
    (_, char) => char.toUpperCase()
  );
}

/**
 * Converts snake_case keys of an object to camel case
 * @param configObject an object with snake case keys
 * @returns object with the camel case keys
 */
export const convertKeysSnakeToCamel = (configObject: any) => {
  if (typeof configObject === 'object') {
    const newObj: any = {};
    for (const oldKey in configObject) {
      if (configObject.hasOwnProperty(oldKey)) {
        const newKey = toCamel(oldKey);
        newObj[newKey] = configObject[oldKey];
      }
    }
    return newObj;
  }
}


/**
 * This function validates the grid props wrt the ResponsiveGridLayout component's layout object and creates a valid grid layout object
 * @param gridConfigObject an object with snake case keys (original grid config object)
 * @returns object with the camel case keys
 */
export const validateGridProps = (gridConfigObject: any) => {
  const convertedKeyProps = convertKeysSnakeToCamel(gridConfigObject);
  const breakpoints = convertedKeyProps?.breakpoints || defaultGridProps.breakpoints;
  const regenObject:any={};
  if (typeof convertedKeyProps === 'object') {
  Object.entries(convertedKeyProps).map(([key, val]) => {
    switch (key) {
      case 'cols':
        if (typeof val === 'number') {
          const colObj = Object.fromEntries(
            Object.entries(breakpoints).map(([key]) => [key, val])
          );
          regenObject[key]=colObj;
        }
        break;
      case 'margin':
        if (Array.isArray(val)) {
          const marginObj = Object.fromEntries(
            Object.entries(breakpoints).map(([key]) => [key, val])
          );
          regenObject[key]=marginObj;
        }
        break;
      case 'containerPadding':
        if (Array.isArray(val)) {
          const marginObj = Object.fromEntries(
            Object.entries(breakpoints).map(([key]) => [key, val])
          );
          regenObject[key]=marginObj;
        }
        break;
      default:
        regenObject[key]=val;
        break;
    }
  });
  return regenObject;
  }
}


/**
 * Generates a unique id based on scope, type, and index in the set of user_controls/plots
 * One item is a user_control or plot object
 * 
 * @param scope scope of the item either 'global' or 'local'
 * @param type type of the item
 * @param index index for itemin the user_controls[] or plots[]
 * @returns uid for the item
 */
export const generateUid = (scope: ControlScope, type: string, index: number) => {
  return scope + '_' + type + '_' + index;
}