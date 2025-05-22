/* eslint-disable max-len */
/* Alert messages */
// Data parsing alert messages
export const invalidCsvAlert = 'Format of response data from “url_pattern” does not match configuration property “response_format” while trying to parse data as “csv”.';
export const invalidDataAlert = 'Invalid format of response data from “url_pattern” while trying to parse data as “json”.';
export const invalidJsonAlert = 'Format of response data from “url_pattern” does not match configuration property “response_format” while trying to parse data as “json”.';
export const invalidKeyAlert = 'Invalid key provided for hover template display pattern';
export const invalidResponseFormatAlert = 'Invalid value for “response_format”, expected “csv” or “json”';
// column definitions for extracting data alert messages
export const emptyDataColArrayAlert = '"data_col" is defined but empty';
export const emptyXColArrayAlert = '"x_col" is defined but empty';
export const emptyYColArrayAlert = '"y_col" is defined but empty';
export const incompatibleColArraysAlert = '"x_col" and "y_col" arrays are different sizes, data cannot be parsed until this is fixed';
export const noColumnsDefinedAlert = '"x_col", "y_col", and "data_col" are all empty';
export const xColOnlyAlert = '"y_col" is missing, both x_col and y_col need to be defined';
export const yColOnlyAlert = '"x_col" is missing, both x_col and y_col need to be defined';
export const xYColsNotAnArrayAlert = '"x_col" and "y_col" are required to be an array';
export const xColPatternemptyArrayAlert = '"x_col_pattern" returned empty array';
export const yColPatternemptyArrayAlert = '"y_col_pattern" returned empty array';
export const zColPatternemptyArrayAlert = '"z_col_pattern" returned empty array';
export const noColumnExistsAlert = 'column does not exist in the data item.';
export const missingColumnValueAlert = 'column exists but values are undefined.';