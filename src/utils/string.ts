import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

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
export const getPatternUri = (queryPattern: string, templateParams: any) => {
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
      schema_table, // TODO: camelcase?
      catalog,
    });
  }

  return { uri, headers };
};
