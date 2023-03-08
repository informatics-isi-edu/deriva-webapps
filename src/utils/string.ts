import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

/**
 * Appends and returns the pcid and ppid for the given link
 *
 * @param link
 * @returns
 */
export const appendContextParameters = (link: string) => {
  const contextUrlParams = ConfigService.contextHeaderParams;
  const qCharacter = getQueryParamCharacter(link);
  return qCharacter + 'pcid=' + contextUrlParams.cid + '&ppid=' + contextUrlParams.pid;
};

/**
 * Checks if the given link already has a "?" if yes append "&" else append "?" to add the parameters to the link
 *
 * @param link
 * @returns
 */
export const getQueryParamCharacter = (link: string) => {
  return link.indexOf('?') !== -1 ? '&' : '?';
};

/**
 * Extracts the link from the given string pattern, otherwise returns false if no link was found
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
 * @param data
 * @param format
 * @param type
 * @returns
 */
export const formatPlotData = (data: any, format: any, type: string) => {
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
 * @param data
 * @returns
 */
export const addComma = (data: any) => {
  return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

export const getLink = (markdownPattern: string, templateParam?: any) => {
  let markdown = markdownPattern;
  if (templateParam) {
    markdown = ConfigService.ERMrest.renderHandlebarsTemplate(markdownPattern, templateParam);
  }
  const patternLink = ConfigService.ERMrest.renderMarkdown(markdown, true);
  const extractedLink = extractLink(markdownPattern);
  const linkWithContextParams = getLinkWithContextParams(markdownPattern, extractedLink);
  return patternLink.replace(extractedLink, linkWithContextParams);
};

export const getLinkWithContextParams = (
  markdownPattern?: string,
  extractedLink?: string | false,
) => {
  let link: string | false = '';
  if (extractedLink) {
    link = extractedLink;
  } else if (markdownPattern) {
    link = extractLink(markdownPattern);
  }
  return link + appendContextParameters(link || '');
};
