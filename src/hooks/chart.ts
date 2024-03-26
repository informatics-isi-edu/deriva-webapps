// hooks
import useAlert from '@isrd-isi-edu/chaise/src/hooks/alerts';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import useIsFirstRender from '@isrd-isi-edu/chaise/src/hooks/is-first-render';
import { createStudyViolinSelectGrid, useChartControlsGrid, } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart-select-grid';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';
import usePlotlyChart from '@isrd-isi-edu/deriva-webapps/src/hooks/plotly-chart';
import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/src/hooks/window-size';
import { useCallback, useEffect, useRef, useState } from 'react';

// models
import {
  DataConfig,
  Plot, PlotConfig, PlotConfigAxis,
  Trace,
  UserControlConfig,
  plotAreaFraction,
  screenWidthThreshold,
  validFileTypes
} from '@isrd-isi-edu/deriva-webapps/src/models/plot';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// utils
import { ChaiseAlertType } from '@isrd-isi-edu/chaise/src/providers/alerts';
import { getQueryParam, getQueryParams } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import { flatten2DArray } from '@isrd-isi-edu/deriva-webapps/src/utils/data';
import {
  emptyDataColArrayAlert, emptyXColArrayAlert, emptyYColArrayAlert, incompatibleColArraysAlert,
  invalidCsvAlert, invalidJsonAlert, invalidKeyAlert, invalidResponseFormatAlert,
  noColumnsDefinedAlert, xColOnlyAlert,
  xYColsNotAnArrayAlert,
  yColOnlyAlert
} from '@isrd-isi-edu/deriva-webapps/src/utils/message-map';
import {
  addComma, createLink, createLinkWithContextParams,
  extractAndFormatDate,
  extractValue,
  formatPlotData,
  getPatternUri,
  isDataJSON, wrapText
} from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import Papa from 'papaparse';

/**
 * Data received from API request
 */
export type Response = {
  /**
   * Dta received from response
   */
  data: ResponseData;
  /**
   * Status code for response
   */
  status: number;
};

/**
 * Uunpacked within the response
 */
export type ResponseData = Array<any>;

/**
 * Data packed in result
 */
export type PlotResultData = {
  /**
   * Data for the x axis
   */
  x: string[] & number[];
  /**
   * Data for the y axis
   */
  y: string[] & number[];
  /**
   * text hover for the plot
   */
  text?: string[];
};

export type HeatmapZData = {
  /**
 * Data for the z axis
 */
  z: any[];
}

export type StringArray = string[];

export type ClickableLinks = {
  /**
   * Links for the plot graphic
   */
  graphic_clickable_links: string[];
  /**
   * Links for the legend
   */
  legend_clickable_links: string[];
};

/**
 * Data packed in result
 */
export type PieResultData = {
  /**
   * Hover text for the plot
   */
  text: string[] & number[];
  /**
   * Legend labels for the plot
   */
  labels: string[] & number[];
};

export type inputParamsType = {
  /**
   * Width of heatmap plot
   */
  width: number,
  /**
   * x axis tick text angle
  */
  xTickAngle: number | 'auto',
}

export type layoutParamsType = {
  /**
  * Height of heatmap plot
  */
  height: number,
  /**
  * Width of heatmap plot
  */
  width: number,
  /**
  * Margin values of heatmap plot
  */
  margin: {
    t: number,
    r: number,
    b: number,
    l: number,
  },
  /**
   * x axis tick text angle
  */
  xTickAngle: number | 'auto',
  /**
   * y axis tick text angle
  */
  yTickAngle: number,
}

/**
 * Sets the plot configs
 *
 * @param plotConfigs
 */
export const usePlotConfig = (plotConfigs: PlotConfig) => {
  const { dispatchError, errors } = useError();

  /**
   * config object state
   */
  const [typeConfig, setTypeConfig] = useState<DataConfig | null>(null);

  useEffect(() => {
    try {
      const config = getConfigObject<DataConfig>(plotConfigs);
      setTypeConfig(config);
    } catch (error) {
      dispatchError({ error });
    }
  }, [plotConfigs, dispatchError]);

  return { errors, config: typeConfig };
};

/**
 * Hook function to handle the needed data to be used by the chart
 *
 * @param plot configuration object
 * @returns all data to be used by plot
 */
export const useChartData = (plot: Plot) => {
  const isFirstRender = useIsFirstRender();
  const [data, setData] = useState<any | null>(null);
  const [userControlData, setUserControlData] = useState<any>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [modalProps, setModalProps] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInitLoading, setIsInitLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [isParseLoading, setIsParseLoading] = useState<boolean>(false);
  const [controlTemplateVariablesInitialized, setControlTemplateVariablesInitialized] = useState<boolean>(false);

  const { dispatchError, errors } = useError();
  const alertFunctions = useAlert();
  const { width = 0, height = 0 } = useWindowSize();

  const {
    selectorOptionChanged, setSelectorOptionChanged,
    templateParams, setTemplateParams
  } = usePlot();

  const { noData, setNoData } = usePlotlyChart()
  const {appStyles} = usePlot();

  const {
    selectData,
    handleCloseModal,
    handleSubmitModal,
    fetchSelectData,
    setSelectData,
    isFetchSelected,
    setIsFetchSelected,
  } = useChartControlsGrid({
    plot,
    setModalProps,
    setIsModalOpen,
  });

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  /**
  * It should be called once to initialize the configuration data for the user controls into the state variable
  */
  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    const initSelectors = async () => {
      if (plot.user_controls?.length > 0) {
        const tempParams = { ...templateParams };

        const tempUserControls = [...plot.user_controls];

        for (let i = 0; i < plot.user_controls.length; i++) {
          const controlConfig = plot.user_controls[i];
          const values = await initalizeControlData(controlConfig);

          tempParams.$control_values[controlConfig.uid] = {
            values: values
          }
        }

        setUserControlData({
          userControlConfig: tempUserControls,
          gridConfig: plot?.grid_layout_config,
          layout: plot?.layout
        });

        setTemplateParams(tempParams);
      }

      setControlTemplateVariablesInitialized(true);
    };

    if (isFirstRender) {
      // only run on first render
      try {
        initSelectors();
      } catch (error) {
        dispatchError({ error });
      }
    }
  }, []);

  /**
   * extracts values for the selector returns them for the templateParams under the selector's uid
   * 
   * @param config User Control configuration
   * @returns values for intializing template params for control
   */
  const initalizeControlData = async (config: UserControlConfig) => {
    const paramKey = config.url_param_key;
    const valueKey = config.request_info?.value_key;
    const defaultValue = config.request_info?.default_value;

    let values: any = {};
    // use url_param value if defined, fall back to default value if not
    let paramValue;
    if (paramKey) paramValue = getQueryParam(windowRef.location.href, paramKey);

    let initValue;
    if (paramValue) {
      initValue = paramValue;
    } else if (defaultValue) {
      initValue = defaultValue;
    }
    values[valueKey] = initValue;

    if (config.request_info.url_pattern) {
      const initRowRequest = config.request_info.url_pattern + '/' + valueKey + '=' + initValue;
      const response = await ConfigService.http.get(initRowRequest);

      values = response.data[0];
    }

    return values;
  }

  /**
   * Updates the legend text and orientation for all plots for which legend is available as per the change in screen width
   */
  useEffect(() => {
    if (parsedData?.data && parsedData?.data[0].transforms?.length >= 1) {
      const uniqueX = parsedData?.layout?.xaxis?.tickvals?.filter(function (item: any, pos: number) {
        return parsedData?.layout?.xaxis?.tickvals?.indexOf(item) === pos;
      });
      const longestString = uniqueX?.reduce((a: any, b: any) => a.length > b.length ? a : b, '');
      const newPlot = wrapLegendNames(parsedData?.layout?.xaxis?.tickvals, uniqueX, longestString);
      if (width && width <= screenWidthThreshold) {
        //Setting the wrapped legend text for plot and show the legend horizontally below the plot when the screen size is less than or equal to 1000px
        //It overrides the settings made in plot config
        setParsedData((prevParsedData: { data: any, layout: any; }) => {
          if (prevParsedData?.data?.length > 0) {
            return {
              ...prevParsedData,
              data: [
                {
                  ...prevParsedData.data[0],
                  transforms: [
                    {
                      ...prevParsedData.data[0].transforms[0],
                      //Passing the modified legend text array to group by using new legend and display the wrapped legend on plot as per screen size
                      groups: newPlot,
                    },
                    ...prevParsedData.data[0].transforms?.slice(1),
                  ],
                },
                ...prevParsedData.data?.slice(1),
              ],
              layout: {
                ...prevParsedData?.layout,
                legend: {
                  xanchor: 'center',
                  x: 0.5,
                  y: -2,
                  orientation: 'h',
                },
              },
            };
          }
        });
      } else if (width && width > screenWidthThreshold) {
        setParsedData((prevParsedData: { data: any, layout: any; }) => {
          if (prevParsedData?.data?.length > 0) {
            return {
              ...prevParsedData,
              data: [
                {
                  ...prevParsedData.data[0],
                  transforms: [
                    {
                      ...prevParsedData.data[0].transforms[0],
                      //Passing the modified legend text array to group by using new legend and display the wrapped legend on plot as per screen size
                      groups: newPlot,
                    },
                    ...prevParsedData.data[0].transforms?.slice(1),
                  ],
                },
                ...prevParsedData.data?.slice(1),
              ],
              layout: {
                ...prevParsedData?.layout,
                legend: {
                  orientation: 'v',
                  x: 1,
                  y: 1,
                },
              },
            }
          }
        });
      }
    }
  }, [width]);
  /**
   * Fetches data from the plot traces in the plot config and returns the data
   */
  const fetchData = useCallback(async () => {
    // console.log('fetchData occurred');
    // Fulfill promise for plot
    // NOTE: If 1 trace request fails, all requests fail. Should this be addressed?
    const plotResponses: Array<Response> = await Promise.all(
      // request for each trace
      plot.traces.map((trace) => {
        /*TODO: Both this case (queryPattern) and the next one (uri) are deprecated and should be removed eventually. 
        These are currently kept here for backwards compatibility.*/
        // Check for queryPattern(dynamic link) parameter in traces, if not defined then check for uri(static link)
        if (trace.url_pattern || trace.queryPattern) {
          //To avoid the lint error, passing empty string if both are not present'
          const pattern = trace.url_pattern || trace.queryPattern || '';
          const { uri, headers } = getPatternUri(pattern, templateParams);
          return ConfigService.http.get(uri, { headers });
        } else if (trace.uri) {
          return ConfigService.http.get(trace.uri);
        } else {
          return { data: [] };
        }
      })
    );

    return plotResponses.map((response: Response) => response.data); // unpack data
  }, [plot, templateParams]);

  // if each row in response is an object with a single string value that looks like a path
  //   assume that string is a path to a file of data (or other API) and fetch the subsequent data
  const getDataIfFromFile = async (responseData: any) => {
    const fileResponses: Array<Response> = await Promise.all(
      responseData.map((responseArray: any) => {
        // responseArray.length is 1 from condition that limits this function from being called
        const row = responseArray[0];
        const key = Object.keys(row)[0];
        return ConfigService.http.get(row[key]);
      })
    )

    return fileResponses.map((response: Response) => response.data); // unpack data
  }

  const testResponseObjectString = (responseArray: any[]) => {
    if (responseArray.length === 1) {
      const row = responseArray[0];
      const rowKeys = Object.keys(row);

      if (rowKeys.length === 1) {
        const key = rowKeys[0];
        const value = row[key];

        const pathRegEx = /^(?:\/|[a-z]+:\/\/)/

        // NOTE: html path tests
        // console.log(pathRegEx.test('abcxyz'));   // ==> false
        // console.log(pathRegEx.test('/abcxyz'));  // ==> true
        // console.log(pathRegEx.test('abc/xyz'));  // ==> false
        // console.log(pathRegEx.test('abcxyz/'));  // ==> false
        // console.log('https://staging.atlas-d2k.org' + value);
        // console.log(pathRegEx.test('https://staging.atlas-d2k.org' + value));   // ==> true

        // // NOTE: file path tests
        // console.log(pathRegEx.test('File:/abcxyz'));  // ==> false
        // console.log(pathRegEx.test('File:/abcxyz/path/to/file.tiff'));  // ==> false
        return pathRegEx.test(value);
      }
    }
    return false;
  }

  // Effect to fetch initial data
  useEffect(() => {
    // wait until control template variables are initialized before fetching inital data
    if (!controlTemplateVariablesInitialized) return;


    const fetchInitData = async () => {
      setIsInitLoading(true);
      const allQueryParams = getQueryParams(window.location.href);

      const tempParams = { ...templateParams };
      // push query parameters into templating environment
      Object.keys(allQueryParams).forEach((key: string) => {
        tempParams.$url_parameters[key] = allQueryParams[key];
      });

      if (plot.plot_type === 'violin') {
        const selectGrid = createStudyViolinSelectGrid(plot);

        // selectGrid is a 2D array of selector objects
        // TODO: add proper typing once *SelectData objects are typed properly
        selectGrid.forEach((row: any[]) => {
          row.forEach((selectorConfig: any) => {
            // check each selector object for a urlParamKey and update the templateParams accordingly
            const paramKey = selectorConfig.urlParamKey;
            if (paramKey) {
              const paramValue = getQueryParam(windowRef.location.href, paramKey);
              const valueKey = selectorConfig.requestInfo.valueKey;
              const defaultValue = selectorConfig.requestInfo.defaultValue;

              // check if the param key is defined yet
              if (selectorConfig.isMulti) {
                if (!Array.isArray(tempParams.$url_parameters[selectorConfig.urlParamKey])) {
                  // probably not needed since this case SHOULD be initializing the data
                  // NOTE: the useMemo of templateParams above initalizes "Study" to an array so this case would be skipped there
                  tempParams.$url_parameters[selectorConfig.urlParamKey] = []
                }
              } else {
                tempParams.$url_parameters[selectorConfig.urlParamKey] = {}
              }

              if (paramValue) {
                if (!selectorConfig.isMulti) {
                  tempParams.$url_parameters[paramKey].data = {
                    [valueKey]: paramValue
                  }
                } else {
                  // NOTE: do we want to support multiple queyr params for one param key?
                  //    how would that look in the url?
                  //       - ?paramKey=RID1,RID2
                  //       - ?paramKey=RID1&paramKey=RID2
                  tempParams.$url_parameters[selectorConfig.urlParamKey].push({
                    data: { [valueKey]: paramValue }
                  });
                }
              } else if (defaultValue) {
                if (!selectorConfig.isMulti) {
                  tempParams.$url_parameters[paramKey].data = {
                    [valueKey]: defaultValue
                  }
                } else {
                  tempParams.$url_parameters[selectorConfig.urlParamKey].push({
                    data: { [valueKey]: defaultValue }
                  });
                }
              }
            }
          });
        });

        // NOTE: might have to pass tempParams here if fetchSelectData relies on them
        const initialSelectData = await fetchSelectData(selectGrid); // fetch the data needed for the select grid
        setSelectData(initialSelectData) // set the data for the select grid
      }
      setTemplateParams(tempParams);

      // array of reponse.data arrays 
      //    responseData = [response.data]
      //    response.data = [{...}]
      let responseData = await fetchData(); // fetch the data for the plot

      // check response format to see if we need to fetch data from string in response
      // if each response.data is an array with 1 object
      //   AND each object has 1 key/value pair, check if that value is a "string" that looks like a "path"
      const oneKeyInEachResponseAndPath = responseData.every((responseArray: any[]) => testResponseObjectString(responseArray));

      if (oneKeyInEachResponseAndPath) {
        responseData = await getDataIfFromFile(responseData);
      }

      setData(responseData); // set the data for the plot
      setIsInitLoading(false); // set loading to false
      setSelectorOptionChanged(false);
    };

    // only run on first render
    try {
      fetchInitData();
    } catch (error) {
      dispatchError({ error });
    }
  }, [controlTemplateVariablesInitialized]);

  // Effect to fetch data on subsequent changes when different selections are made (when selectData changes)
  useEffect(() => {
    const fetchSubsequentData = async () => {
      console.log('fetch occurred');
      setIsDataLoading(true);
      setIsParseLoading(true);

      // array of reponse.data arrays 
      //    responseData = [response.data]
      //    response.data = [{...}]
      let responseData = await fetchData();

      // check response format to see if we need to fetch data from string in response
      // if each response.data is an array with 1 object
      //   AND each object has 1 key/value pair, check if that value is a "string" that looks like a "path"
      const oneKeyInEachResponseAndPath = responseData.every((responseArray: any[]) => testResponseObjectString(responseArray));

      if (oneKeyInEachResponseAndPath) {
        responseData = await getDataIfFromFile(responseData);
      }

      setData(responseData);
      setIsDataLoading(false);
      setIsFetchSelected(false);
      setSelectorOptionChanged(false);
    };

    if (!isFirstRender && (isFetchSelected || selectorOptionChanged)) {
      // only run on subsequent renders and when selectData changes with isFetchSelected being true
      // we only want to fetch data when the selection made requires it
      // cause some selection changes can simply be handled by reparsing the existing data
      try {
        fetchSubsequentData();
      } catch (error) {
        dispatchError({ error });
      }
    }
  }, [
    isFetchSelected,
    templateParams,
    selectorOptionChanged
  ]);


  /**
   * Takes in legendNames array and modifies the contents based on the width of the values in the legend
   *   and how much that content would take on the screen
   * 
   * @param legendNames array of legend names
   * @param uniqueX array of unique X ticks
   * @param longestXTick longest X tick in the data
   * @returns updated(wrapped) legend names array based on screen size and no. of ticks
   */
  const wrapLegendNames = (legendNames: string[], uniqueX: string[], longestXTick: string) => {
    const truncationLimit = 20;
    const charLimit = {
      sm: 30,
      md: 65,
      lg: 80,
    };
    //Create a hidden div to check the width of the legend with the given font and size
    const hiddenDiv = document.createElement('div');
    hiddenDiv.id = 'hiddenDiv';
    hiddenDiv.innerHTML = longestXTick;
    hiddenDiv.style.visibility = 'hidden';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.fontSize = '12';
    hiddenDiv.style.width = 'fit-content';
    document.body.appendChild(hiddenDiv);
    //calculate the width of this hidden div
    const width = hiddenDiv.offsetWidth;
    const plotWidth = plotAreaFraction * width;
    //no. of unique violins to be shown on plot
    const noOfViolins = uniqueX?.length;
    /*If screen is less than 1000px and legend is 50% of plot area then wrap the text upto 30 characters 
    which will make the legend of minimum possible width*/
    if (plotWidth < screenWidthThreshold && width / plotWidth > 0.50) {
      legendNames = legendNames?.map((name) => name.includes('<a')
        ? extractValue(name, charLimit.sm, truncationLimit) : wrapText(name, charLimit.sm, truncationLimit))
    }
    /*NOTE: These numbers are taken of the basis of current data and different testing scenarios considering the longest x label and 
    amount of width legend is taking as compared to the plot area*/
    /*If the number of violins is less than or equal to 7 and the width-to-plot-width ratio is greater than 0.40, 
    the legendNames array is modified similarly to the previous step, but using the charLimit.lg character limit (i.e 80).*/
    else if (noOfViolins <= 7 && width / plotWidth > 0.40) {
      legendNames = legendNames.map((name) => name.includes('<a')
        ? extractValue(name, charLimit.lg, truncationLimit) : wrapText(name, charLimit.lg, truncationLimit))
    }
    /*If the number of violins is between 7 and 30 (inclusive) and the width-to-plot-width ratio is greater than 0.30, 
    the legendNames array is modified similarly to the previous step, but using the charLimit.md character limit (i.e 65).*/
    else if ((noOfViolins > 7 && noOfViolins <= 30) && width / plotWidth > 0.3) {
      legendNames = legendNames.map((name) => name.includes('<a')
        ? extractValue(name, charLimit.md, truncationLimit) : wrapText(name, charLimit.md, truncationLimit))
    }
    /*If the number of violins is greater than 30 and the width-to-plot-width ratio is greater than 0.3,
     the legendNames array is modified similarly to the previous step, but using the charLimit.sm character limit (i.e 30).*/
    else if (noOfViolins > 30 && width / plotWidth > 0.30) {
      legendNames = legendNames.map((name) => name.includes('<a')
        ? extractValue(name, charLimit.sm, truncationLimit) : wrapText(name, charLimit.sm, truncationLimit))
    }
    return legendNames;
  };

  /**
   * Updates the plotly config based on the given plot configs
   *
   * @param plot configs for a specific plot
   * @param result result to be updated
   */
  const updatePlotlyConfig = (result: any): void => {
    result.config.displaylogo = Boolean(plot.config.displaylogo);
    // result.config.responsive = Boolean(plot.config.responsive);
    result.config.responsive = true;

    // legend
    if (plot.config.disable_default_legend_click) {
      // disable default legend click if it exists
      result.layout.disable_default_legend_click = plot.config.disable_default_legend_click;
    }
  };

  /**
   * Gets the axis title for groupby selector
   *
   * @param selectDataGrid
   * @param axis
   * @returns
   */
  const getSelectGroupByAxisTitle = (axis: 'x' | 'y') => {
    let title = '';
    selectData.forEach((row: any) => {
      row.forEach((cell: any) => {
        if (cell.action === 'groupby' && cell.axis === axis) {
          const { groupKeysMap, value } = cell;
          const group = groupKeysMap[value.value];
          if (group.title_display_pattern) {
            title = createLink(group.title_display_pattern);
          }
        }
      });
    });
    return title;
  };

  /**
   * Gets the axis title for scale selector
   *
   * @param selectDataGrid
   * @param title_display_markdown_pattern
   * @param axis
   * @returns
   */
  const getSelectScaleAxisTitle = (
    title_display_markdown_pattern: string,
    axis: 'x' | 'y'
  ) => {
    let title = '';
    let type = '';
    selectData.forEach((row: any) => {
      row.forEach((cell: any) => {
        if (cell.action === 'scale' && cell.axis === axis) {
          if (cell.value.value === 'log') {
            title = createLink(`log(${title_display_markdown_pattern} + 1)`);
          } else {
            title = createLink(`${title_display_markdown_pattern}`);
          }
          type = cell.value.value;
        }
      });
    });
    return { title, type };
  };

  /**
   * Updates the plotly layout based on given plot configs
   *
   * @param plot configs for a specific plot
   * @param result result to be updated
   */
  const updatePlotlyLayout = (
    result: any,
    noDataTitle: boolean,
    additionalLayout?: any
  ): void => {
    // title
    let title = '';
    if (plot.config.title_display_markdown_pattern) {
      // use the title_display_markdown_pattern if it exists
      title = createLink(plot.config.title_display_markdown_pattern, templateParams);
    }
    if (noDataTitle) {
      title = 'No Data';
    }
    if (title) result.layout.title = title;
    // x axis
    if (!result.layout.xaxis) {
      // initialize xaxis if it doesn't exist
      result.layout.xaxis = {};
    }
    if (plot.config.xaxis?.title_display_markdown_pattern) {
      // use the title_display_markdown_pattern if it exists
      result.layout.xaxis.title = createLink(plot.config.xaxis.title_display_markdown_pattern);
    }
    if (additionalLayout?.xaxis?.tickvals) {
      // use the tickvals if it exists
      result.layout.xaxis.tickvals = additionalLayout.xaxis.tickvals;
    }
    if (additionalLayout?.xaxis?.ticktext) {
      // use the ticktext if it exists
      result.layout.xaxis.ticktext = additionalLayout.xaxis.ticktext;
    }
    if (selectData) {
      // use the groupby axis title if it exists
      const xaxisTitle = getSelectGroupByAxisTitle('x');
      if (xaxisTitle) {
        result.layout.xaxis.title = xaxisTitle;
      }
    }

    result.layout.xaxis.automargin = true; // always set automargin to true
    result.layout.xaxis.tickformat = plot.config.x_axis_thousands_separator ? ',d' : ''; // set tickformat based on the config
    result.layout.xaxis.ticksuffix = '  '; // add a space to the end of the tick for spacing

    // y axis
    if (!result.layout.yaxis) {
      result.layout.yaxis = {};
    }
    if (plot.config.yaxis?.title_display_markdown_pattern) {
      result.layout.yaxis.title = createLink(plot.config.yaxis.title_display_markdown_pattern);

      if (Array.isArray(selectData)) {
        const yaxisTitle = getSelectScaleAxisTitle(
          plot.config.yaxis.title_display_markdown_pattern,
          'y'
        );
        if (yaxisTitle.title) {
          result.layout.yaxis.title = yaxisTitle.title;
          result.layout.yaxis.type = yaxisTitle.type;
        }
      }
    }

    if (plot.plot_type === 'violin') {
      result.layout.hovermode = 'closest';
      result.layout.dragmode = 'pan';
      if (result.layout.yaxis.zeroline === undefined) {
        result.layout.yaxis.zeroline = false;
      }
      //To move the legend inside the plot the the width of screen is less than 1000px on load
      if (innerWidth < screenWidthThreshold) {
        result.layout.legend = {
          xanchor: 'center',
          x: 0.5,
          y: -2,
          orientation: 'h',
        }
      }
    }

    result.layout.yaxis.automargin = true;
    result.layout.yaxis.ticksuffix = '  ';

    // buttons
    if (plot?.plotly?.config?.modeBarButtonsToRemove) {
      result.layout.modebar = { remove: plot?.plotly?.config?.modeBarButtonsToRemove };
    }
    if (plot.plot_type === 'heatmap') {
      if (result.data[0]) {
        result.data[0]['colorbar'] = {
          lenmode: 'pixels',
          len: 100
        }
      }
    }
    result.layout.autoresize = true;
  };

  const initializePlotlyDataObject: any = (trace: Trace, idx: number) => {
    // TODO: dataObject is a combination of Trace and TracePlotlyData
    // NOTE: type in Trace is an array, type in TracePlotlyData is a string
    const dataObject: any = {
      ...trace,
      type: plot.plot_type,
      text: [],
      legend_clickable_links: [], // array of links for when clicking legend
      graphic_clickable_links: [], // array of links for when clicking graph
    };

    if (Array.isArray(trace.type)) dataObject.type = trace.type[idx];

    // plotly has default values for the following if not defined
    // set legend here if trace.legend is defined
    if (Array.isArray(trace.legend) && trace.legend[idx]) dataObject.name = trace.legend[idx];

    if (Array.isArray(trace.mode)) dataObject.mode = trace.mode[idx];
    if (Array.isArray(trace.marker)) dataObject.marker = trace.marker[idx];

    return dataObject;
  }

  /**
   * Calculates the height and margins of the heatmap based on the number of y values and length of the longest X label
   * so that the labels do not get clipped and the bar height is adjusted accordingly.
   * 
   * @param input : Input parameters of heatmap directive
   * @param longestXTick : Length of longest X axis label
   * @param longestYTick : Length of longest Y axis label
   * @param lengthY : Number of Y values
   * @returns an object with all the required layout parameters.
   * @example
   * {
   * 	height: height of the heatmap,
   * 	width: width of the heatmap,
   * 	margin: {
   * 		t: top margin of the heatmap,
   * 		r: right margin of the heatmap,
   * 		b: bottom margin of the heatmap,
   * 		l: left of the heatmap
   * 	},
   * 	xTickAngle: inclination of x axis labels,
   *  yTickAngle: inclination of y axis labels,
   * 	tickFont: font to be used in labels
   * }
   */
  const getHeatmapLayoutParams = (input: inputParamsType, longestXTick: number, longestYTick: number, lengthY: number) => {
    let height;
    let yTickAngle;
    const tMargin = 0;
    let rMargin, bMargin, lMargin;
    if (longestXTick <= 18) {
      height = longestXTick * 9 + lengthY * 10 + 50;
      bMargin = 8.4 * longestXTick;
    } else if (longestXTick <= 22) {
      height = longestXTick * 9 + lengthY * 10 + 55;
      bMargin = 8.4 * longestXTick;
    } else if (longestXTick <= 30) {
      height = longestXTick * 8.8 + lengthY * 10 + 55;
      bMargin = 8.2 * longestXTick;
    } else {
      height = longestXTick * 8.8 + lengthY * 10 + 45;
      bMargin = 8 * longestXTick;
    }

    if (lengthY === 1) {
      yTickAngle = -90;
      lMargin = 30;
      rMargin = 20;
    } else {
      yTickAngle = 0;
      lMargin = 20 + longestYTick * 7;
      rMargin = 5;
    }

    const layoutParams: layoutParamsType = {
      height: height,
      width: input.width,
      margin: {
        t: tMargin,
        r: rMargin,
        b: bMargin,
        l: lMargin,
      },
      xTickAngle: input.xTickAngle,
      yTickAngle: yTickAngle,
    };
    return layoutParams;
  }

  /**
   * Gets the value in the form of a link from the given markdown pattern.
   * Optionally formats the value.
   *
   * @param item each item of data
   * @param colName column name for the item of data
   * @param axis axis object from plot config
   * @param formatData whether to format the data or not
   * @param plot plot config
   * @returns
   */
  const getValue = (
    item: any,
    colName: string,
    axis: PlotConfigAxis | undefined,
    formatData: boolean
  ): string | number => {
    let value = item[colName];
    if (axis && axis?.tick_display_markdown_pattern) {
      value = createLink(axis.tick_display_markdown_pattern, {
        $self: {
          data: item, // TODO: to be deprecated
          values: item
        }
      });
    }
    return formatPlotData(value, formatData, plot.plot_type);
  };

  /**
   * Updates the plot data after parsing the legend name, legend pattern, and graphic pattern
   *   NOTE: why is extraInfo added when patterns are on trace?
   *
   * @param result trace object to be updated
   * @param trace current trace from the plot config
   * @param item each item/row of data
   * @param index index of the response
   * @param extraInfo object with legend_markdown_pattern and graphic_link_pattern
   */
  const updateWithTraceColData = (
    result: any,
    trace: Trace,
    item: any,
    index: number,
    extraInfo?: any
  ): void => {

    // result.name is set in initializePlotlyDataObject if trace.legend is defined
    // override if trace.legend_markdown_pattern is defined and an array
    if (Array.isArray(trace.legend_markdown_pattern)) {
      result.name = createLink(trace.legend_markdown_pattern[index] || '');
    }

    // legend click event
    // is attached as an array on result object so when legend_click plotly event is triggered we can find the link and navigate to it
    const legend_markdown_pattern =
      trace.legend_markdown_pattern || extraInfo?.legend_markdown_pattern; // use either the trace or extraInfo
    if (legend_markdown_pattern) {
      // if there is a legend_markdown_pattern then create the link and add it to the array
      const legendPattern = Array.isArray(legend_markdown_pattern)
        ? legend_markdown_pattern[index]
        : legend_markdown_pattern;
      const extractedLinkPattern = createLinkWithContextParams(legendPattern);

      if (extractedLinkPattern) {
        const link = createLink(extractedLinkPattern, {
          $self: {
            data: item, // TODO: to be deprecated
            values: item
          },
          $row: item
        });
        if (link) result.legend_clickable_links.push(link);
      }
    }

    // graph click event
    // is attached as an array on result object so when graph_click plotly event is triggered we can find the link and navigate to it
    const graphic_link_pattern = trace.graphic_link_pattern || extraInfo?.graphic_link_pattern; // use either the trace or extraInfo
    if (graphic_link_pattern) {
      // if there is a graphic_link_pattern then create the link and it to the array
      const graphClickPattern = Array.isArray(graphic_link_pattern)
        ? graphic_link_pattern[index]
        : graphic_link_pattern;

      if (graphClickPattern) {
        const link = createLink(graphClickPattern, {
          $self: {
            data: item, // TODO: to be deprecated
            values: item
          },
          $row: item
        });
        if (link) result.graphic_clickable_links.push(link);
      }
    }

  };

  const invalidLinkAlert = useRef<boolean>(false);

  /**
   * returns a formatted display value for display on hover in plot
   * 
   * @param trace current trace from the plot config
   * @param item each item/row of data
   * @returns formatted string
   */
  const generateHoverTemplateDisplay = (
    trace: Trace,
    item: any
  ) => {
    let link;

    const hovertemplate_display_pattern = trace.hovertemplate_display_pattern; // use trace info
    if (hovertemplate_display_pattern) {
      const validLink = ConfigService.ERMrest.renderHandlebarsTemplate(hovertemplate_display_pattern, {
        $self: {
          data: item, // TODO: to be deprecated
          values: item
        },
        $row: item,
        $url_parameters: templateParams.$url_parameters
      });

      /**
       * If there are any invalid params in the hover template display pattern, the link generated will be null.
       * Therefore the following piece of code will add an alert for stating that just once
       */
      if (!validLink && !invalidLinkAlert.current && !alertFunctions.alerts.some((alert) => alert.message.includes(invalidKeyAlert))) {
        invalidLinkAlert.current = true;
        alertFunctions.addAlert(invalidKeyAlert, ChaiseAlertType.WARNING);
      }

      link = ConfigService.ERMrest.renderHandlebarsTemplate(hovertemplate_display_pattern, {
        $self: {
          data: item, // TODO: to be deprecated
          values: item
        },
        $row: item,
        $url_parameters: templateParams.$url_parameters
      }, null, { avoidValidation: true });
    }

    return link;
  }

  /**
   * Adds default hover text to the result object when hovertemplate_display_pattern is not configured 
   * Note: This fixes the issue of displaying link in hover text when tick_display is configured for x or y axis 
   * which was making the text hard to read in some plot types
   * @param result trace object to be updated
   */
  const defaultHoverTemplateDisplay = (
    result: any,
  ): void => {
    const tempText: string[][] & string[] = [];
    if (result.data[0]?.type === 'heatmap') {
      result.data[0].hoverinfo = 'text';
      result.data[0].z.forEach((zArr: string[], index: number) => {
        const textArr: string[] = [];
        zArr.forEach((val: string, i: number) => {
          textArr.push(`x: ${extractValue(result.data[0].x[i], 30, 2)}` + '<br>' + `y: ${extractValue(result.data[0].y[index], 30, 2)}` +
            '<br>' + `z: ${val}`);
        })
        tempText.push(textArr);
      });
      result.data[0].text = tempText;
    } else if (result.data[0]?.type === 'scatter') {
      result.data[0].hoverinfo = 'text';
      result.data[0].x.forEach((xVal: string) => (
        tempText.push(extractValue(xVal, 30, 10))
      ));
      result.data[0].y.forEach((yVal: string, ind: number) => {
        const xValue = tempText[ind];
        tempText.splice(ind, 0, `(${xValue}, ${extractValue(yVal, 30, 2)})`);
      });
      result.data[0].text = tempText;
    }
  }

  /**
   * Sets the hovertext array and hoverinfo for all plots when hovertemplate_display_pattern is configured
   * @param result data object to be updated
   * @param textArray array of hover text
   * @param trace from plot configs
   */
  const setHoverText = (result: any, textArray: string[], trace: Trace) => {
    const hovertemplate_display_pattern = trace.hovertemplate_display_pattern; // use trace info
    if (hovertemplate_display_pattern) {
      result.hovertext = textArray;
      result.hoverinfo = 'text';
    }
  }

  const validateDataXYCol = (trace: Trace): string | boolean => {
    // Show warning if no data_col, x_col, or y_col
    if (!trace.data_col && (!trace.x_col || !trace.y_col)) {
      let noColumnAlertMessage = noColumnsDefinedAlert;

      if (!trace.x_col && trace.y_col) {
        // x_col error
        noColumnAlertMessage = yColOnlyAlert;
      } else if (trace.x_col && !trace.y_col) {
        // y_col error
        noColumnAlertMessage = xColOnlyAlert;
      }

      return noColumnAlertMessage;
    }

    // data_col is defined but empty
    if (Array.isArray(trace.data_col) && trace.data_col.length === 0) return emptyDataColArrayAlert;
    // no data_col and x_col or y_col are not an array
    if (!trace.data_col && (!Array.isArray(trace.x_col) || !Array.isArray(trace.y_col))) return xYColsNotAnArrayAlert;
    // x_col is defined as an array but empty
    if (Array.isArray(trace.x_col) && trace.x_col.length === 0) return emptyXColArrayAlert;
    // y_col is defined as an array but empty
    if (Array.isArray(trace.y_col) && trace.y_col.length === 0) return emptyYColArrayAlert;

    // if both arrays are size > 1 and x_col.length !== y_col.length, show a warning to user that data is inconsistent
    if ((trace.x_col?.length && trace.x_col?.length > 1) &&
      (trace.y_col?.length && trace.y_col?.length > 1) &&
      (trace.x_col?.length !== trace.y_col?.length)) {
      return incompatibleColArraysAlert;
    }

    return true;
  }

  /**
   * 
   * @param trace current trace object in plot config
   * @param responseData response data after parsing into a format we expect
   * @returns 
   */
  const parseGeneralResponse = (trace: Trace, responseData: ResponseData) => {
    const { config } = plot;
    const { xaxis, yaxis, format_data_x = false, format_data_y = false, format_data = false } = config;
    /** 
     * NOTE: tempText can be ['a','b','c'](other plots) as well as [['a','b'],['c','d']](heatmap)
     * At a given time it can be either of those types mentioned but to avoid lint error `string[] & string[][]` is used instead of `string[] | string[][]`
     * 
     * This most likely should be a Union type but I think the way the functions are nested and 
     * the use of a switch instead of if/else caused the linter to have an issue
     * 
     * More info about using '&' vs '|' (Mixin types vs Union types)
     * https://stackoverflow.com/questions/44688919/how-to-declare-a-variable-with-two-types-via-typescript/44689251#44689251
     **/
    const tempText: string[] & string[][] = [];

    const isValid = validateDataXYCol(trace);
    if (typeof isValid === 'string' && plot.plot_type !== 'violin') {
      alertFunctions.addAlert(isValid, ChaiseAlertType.WARNING);
      return;
    }

    // Either data_col is defined (a string or nonempty array) OR
    //   x_col and y_col are defined (non empty arrays)
    //   prefer x_col/y_col to data_col

    // do we have multiple x or multiple y?
    // x_col and y_col should be the same sized array
    //   - if one array is size 1 and the other size N,
    //     duplicate value in array of size 1 to be an array of size N with value N times

    let numberPlotTraces = (trace.y_col?.length && trace.x_col?.length === trace.y_col.length) ? trace.y_col.length : 1;
    // fix x_col and y_col to be same size
    if (trace.x_col?.length === 1 && (trace.y_col?.length && trace.y_col?.length > 1)) {
      numberPlotTraces = trace.y_col.length;
      // if only 1 x_col value, copy that value so x_col and y_col arrays are same size
      for (let i = 1; i < numberPlotTraces; i++) trace.x_col[i] = trace.x_col[0];
    } else if (trace.y_col?.length === 1 && (trace.x_col?.length && trace.x_col?.length > 1)) {
      numberPlotTraces = trace.x_col.length;
      // if only 1 y_col value, copy that value so x_col and y_col arrays are same size
      for (let i = 1; i < numberPlotTraces; i++) trace.y_col[i] = trace.y_col[0];
    } else if (Array.isArray(trace.data_col)) {
      numberPlotTraces = trace.data_col.length;
    } // else { x_col and y_col or data_col are length 1 so do nothing }

    // fix trace.type, trace.mode, trace.marker similar to above if length is 1 but there are multiple plotTraces
    if (numberPlotTraces > 1) {
      if (Array.isArray(trace.type) && trace.type.length === 1) {
        for (let i = 1; i < numberPlotTraces; i++) trace.type[i] = trace.type[0];
      }

      if (Array.isArray(trace.mode) && trace.mode.length === 1) {
        for (let i = 1; i < numberPlotTraces; i++) trace.mode[i] = trace.mode[0];
      }

      if (Array.isArray(trace.marker) && trace.marker.length === 1) {
        for (let i = 1; i < numberPlotTraces; i++) trace.marker[i] = trace.marker[0];
      }
    }


    const plotlyData: any[] = []
    for (let plotTraceIdx = 0; plotTraceIdx < numberPlotTraces; plotTraceIdx++) {
      const plotlyDataObject = initializePlotlyDataObject(trace, plotTraceIdx);

      // violin plot config sets up data using config.xaxis.group_keys and config.yaxis.group_key
      // TODO: when general user controls configuration is complete, change this
      if (plotlyDataObject.type === 'violin') {
        plotlyData.push(plotlyDataObject);
        continue;
      }

      let hoverTemplateLink;
      if (trace.z_col && trace.x_col && trace.y_col) {
        const x_col = trace.x_col[plotTraceIdx];
        const y_col = trace.y_col[plotTraceIdx];
        const z_col = trace.z_col[plotTraceIdx];

        plotlyDataObject.x = [];
        plotlyDataObject.y = [];
        plotlyDataObject.z = [];

        let yIndex = 0;
        plotlyDataObject.longestXTick = '';
        plotlyDataObject.longestYTick = '';

        responseData.forEach((item: any, i: number) => {
          updateWithTraceColData(plotlyDataObject, trace, item, i);

          const value = getValue(item, x_col, xaxis, format_data_x);
          if (plotlyDataObject.x.indexOf(value.toString()) < 0) {
            plotlyDataObject.x.push(value.toString());

            // unformatted x value
            const rawXVal = item[x_col].toString();
            if (rawXVal.length > plotlyDataObject.longestXTick?.length) {
              plotlyDataObject.longestXTick = rawXVal;
            }
          }

          // Add the y values for the heatmap plot
          const yValue = getValue(item, y_col, yaxis, format_data_y);
          // Adds the y value for the heatmap plot if it is not added yet in y array
          if (plotlyDataObject.y.indexOf(yValue.toString()) < 0) {
            // push returns new array length, subtract 1 to get index 
            yIndex = plotlyDataObject.y.push(yValue.toString()) - 1;

            // unformatted y value
            const rawYVal = item[y_col].toString();
            if (rawYVal.length > plotlyDataObject.longestYTick?.length) {
              plotlyDataObject.longestYTick = rawYVal;
            }

            // text and z are 2D arrays
            tempText.push([]);
            // z.length === uniqueY
            // z[n].length === uniqueX 
            plotlyDataObject.z.push([]);
          }

          // Add the z values for the heatmap plot based on yValue's index
          const zValue = item[z_col];
          plotlyDataObject.z[yIndex].push(zValue);

          // add hover template into array if not null
          hoverTemplateLink = generateHoverTemplateDisplay(trace, item);
          if (hoverTemplateLink) tempText[yIndex].push(hoverTemplateLink);
        });
      } else if (trace.x_col && trace.y_col) {
        const x_col = trace.x_col[plotTraceIdx];
        const y_col = trace.y_col[plotTraceIdx];

        plotlyDataObject.x = [];
        plotlyDataObject.y = [];

        responseData.forEach((item: any) => {
          // add legend name,
          updateWithTraceColData(plotlyDataObject, trace, item, plotTraceIdx);

          // set x value for this x_col
          const xValue = getValue(item, x_col, xaxis, format_data_x);
          plotlyDataObject.x.push(xValue.toString());

          // set y value for this y_col
          const yValue = getValue(item, y_col, yaxis, format_data_y);
          plotlyDataObject.y.push(yValue.toString());

          // add hover template into array if not null
          hoverTemplateLink = generateHoverTemplateDisplay(trace, item);
          if (hoverTemplateLink) tempText.push(hoverTemplateLink);
        });
      } else if (trace.data_col) {
        const data_col = Array.isArray(trace.data_col) ? trace.data_col[plotTraceIdx] : trace.data_col;

        if (plotlyDataObject.type === 'histogram') {
          // histogram will define the "values in buckets" themselves if one of x/y is not provided
          (trace.orientation === 'h') ? plotlyDataObject.y = [] : plotlyDataObject.x = [];
        } else {
          plotlyDataObject.values = [];
          // array of labels for the legend
          // TODO: legend_col as a string is deprecated, ensure it's an array when fully removed
          // if (Array.isArray(trace.legend_col)
          if (trace.legend_col) plotlyDataObject.labels = [];
        }

        responseData.forEach((item: any) => {
          const value = getValue(item, data_col, undefined, format_data);
          if (plotlyDataObject.type === 'histogram') {
            if (trace.orientation === 'h') {
              plotlyDataObject.y.push(value.toString());
            } else {
              // vertical is the default case
              plotlyDataObject.x.push(value.toString());
            }
          } else {
            // all other cases (currently only pie)
            plotlyDataObject.values.push(value);

            // Add legend data if it exists
            if (trace.legend_col) {
              const legendCol = Array.isArray(trace.legend_col) ? trace.legend_col[plotTraceIdx] || trace.legend_col[0] : trace.legend_col;

              const textValue = createLink(item[legendCol], {
                $self: {
                  data: item, // TODO: to be deprecated
                  values: item
                }
              });
              let labelValue = textValue;
              if (Array.isArray(trace.legend_markdown_pattern)) {
                const legendPattern = trace.legend_markdown_pattern[plotTraceIdx] || trace.legend_markdown_pattern[0]
                labelValue = createLink(legendPattern, {
                  $self: {
                    data: item, // TODO: to be deprecated
                    values: item
                  }
                });
              }

              plotlyDataObject.text.push(textValue);
              plotlyDataObject.labels.push(labelValue);
            }
          }

          // add hover template into array if not null
          hoverTemplateLink = generateHoverTemplateDisplay(trace, item);
          if (hoverTemplateLink) tempText.push(extractAndFormatDate(hoverTemplateLink));
        });
      }

      setHoverText(plotlyDataObject, tempText, trace);

      plotlyData.push(plotlyDataObject);
    }

    return plotlyData;
  }

  const updatePieReponse = (trace: Trace, data: any) => {
    // data displayed on a pie slice
    data.textinfo = plot.config.slice_label || 'value';
    // default value to show on hover of a pie slice
    data.hoverinfo = 'text+value+percent';
    // NOTE: should hoverinfo be allowed to be overridden?
  }

  /**
   * add extra properties specific to bar plot
   * text[] is handled differently depending on orientation of plot
   * 
   * @param trace trace from plot.traces[]
   * @param data plotlyDataObject after general parser
   */
  const updateBarResponse = (trace: Trace, data: any) => {
    data.textposition = 'outside'; // position of bar values
    data.hoverinfo = 'text'; // value to show on hover of a bar

    if (trace.orientation === 'h') {
      data.x.forEach((value: any) => {
        data.text?.push(value.toString());
      });
    } else {
      // default is vertical
      data.y.forEach((value: any) => {
        data.text?.push(value.toString());
      });
    }
  }

  /**
   * add extra properties specific to scatter/line plots
   * 
   * @param trace trace from plot.traces[]
   * @param data plotlyDataObject after general parser
   * @param index index of the data[] pertaining to 1 trace in the plot
   */
  const updateScatterResponse = (trace: Trace, data: any, defaultMode: string, index: number) => {
    // default to 'markers' for scatter and 'lines+markers' for line
    data.mode = defaultMode;

    if (trace.mode && Array.isArray(trace.mode) && trace.mode[index]) {
      data.mode = trace.mode[index];
    }

    // no default if marker is not defined
    if (trace.marker && Array.isArray(trace.marker) && trace.marker[index]) {
      data.marker = trace.marker[index];
    }
  }

  const updateHeatmapResponse = (trace: Trace, data: any) => {
    if (trace.xgap) data.xgap = trace.xgap;
    if (trace.ygap) data.xgap = trace.ygap;
  }

  /**
   * add extra properties specific to scatter/line plots
   * 
   * @param trace trace from plot.traces[]
   * @param data plotlyDataObject after general parser
   * @param responseData data received from request to be parsed
   */
  const updateViolinResponse = (trace: Trace, data: any, responseData: ResponseData) => {
    data.x = [];
    data.y = [];

    // for use with layout
    data.xTicks = [];

    data.points = 'all';
    data.pointpos = 0;
    data.box = { visible: true };
    data.meanline = { visible: true };
    data.line = { width: 1 }

    if (noData) return;

    const selectDataArray = flatten2DArray(selectData);
    let yScale: any = null;
    let xGroupBy: any = null;

    selectDataArray.forEach((selectObj) => {
      if (selectObj.action === 'groupby' && selectObj.axis === 'x') {
        xGroupBy = selectObj;
      }

      if (selectObj.action === 'scale' && selectObj.axis === 'y') {
        yScale = selectObj;
      }
    });

    const uniqueX: string[] = [];
    let longestXTick = '';

    let legendNames: string[] = [];
    const tempText: string[] & string[][] = [];

    let hoverTemplateLink;
    responseData.forEach((item: any, i: number) => {
      if (xGroupBy) {
        const groupByKey = xGroupBy.value.value;
        const xGroupItem = xGroupBy.groupKeysMap[groupByKey];

        updateWithTraceColData(data, trace, item, i, xGroupItem);

        const xVal = xGroupItem?.legend_markdown_pattern
          ? createLink(xGroupItem?.legend_markdown_pattern[0], { $row: item })
          : item[groupByKey] || 'N/A';

        // Adding all unique x values to array to calculate the no. of violins to be displayed on plot
        if (uniqueX.indexOf(xVal) === -1) {
          uniqueX.push(xVal);
        }

        // Extract text from xTick and wrap it upto 2 lines
        const xTick = xGroupItem?.tick_display_markdown_pattern
          ? extractValue(createLink(xGroupItem?.tick_display_markdown_pattern, { $row: item }), 25, 2)
          : item[groupByKey] || 'N/A';

        if (xVal.toString().length > longestXTick?.length) {
          longestXTick = xVal.toString();
        }

        data.x.push(xVal);
        data.xTicks.push(xTick);
        legendNames.push(xVal);
      }

      if (yScale) {
        const yItem = item[yScale.setting.group_key];
        if (yScale.value.value === 'log') {
          // increase 'TPM' by 1 for log scale
          const yVal = yItem + 1;
          if (yVal !== null && yVal !== undefined) {
            data.y.push(yVal);
          }
        } else {
          const yVal = yItem ? createLink(yItem.toString()) : yItem;
          if (yVal !== null && yVal !== undefined) {
            data.y.push(yVal);
          }
        }
      }

      hoverTemplateLink = generateHoverTemplateDisplay(trace, item);
      if (hoverTemplateLink) tempText.push(hoverTemplateLink);
    });

    // sets the hovertext array and hoverinfo
    setHoverText(data, tempText, trace);

    // Calculate width of legend using hidden div
    legendNames = wrapLegendNames(legendNames, uniqueX, longestXTick);

    // group by x
    data.transforms = [{
      type: 'groupby',
      groups: legendNames,
    }];
  }

  /**
   * @param data The csv data that needs to be parsed
   * @returns parsed csv data
   */
  const parseCsvData = (data: string) => {
    const csv = Papa.parse(data, { header: true, skipEmptyLines: true });
    const parsedData = csv?.data;
    return parsedData;
  }

  /**
  * Parses the data for the response objects for every plot based on its type
  * @returns plotly data to be inserted into props
  */
  const parsePlotData = () => {
    const result: any = { data: [] };

    result.config = { ...plot?.plotly?.config };
    let hovertemplate_display_pattern;
    // used for heatmap and violin plot
    let additionalLayout: any = {};

    // NOTE: width and height max are set in dynamic styles of chart-with-effect.tsx
    result.layout = {
      ...plot.plotly?.layout,
      width: undefined, // undefined to allow for responsive layout
      height: undefined, // undefined to allow for responsive layout
    };

    /**
     * 
     * @param currTrace - the trace we are parsing data for in plots.traces[]
     * @param plotData - a data object to go into plotly.data[]
     * @param responseData - data from server response we are parsing for plotly
     * @param plotlyTraceIdx - the index for the trace in the plotly chart (trace in this context is a line, bars, individual violin etc)
     */
    const updatePlotDataSwitch = (currTrace: Trace, plotData: any, responseData: ResponseData, plotlyTraceIdx: number) => {
      switch (plotData.type) {
        case 'bar':
          updateBarResponse(currTrace, plotData);
          break;
        case 'scatter':
          updateScatterResponse(currTrace, plotData, 'markers', plotlyTraceIdx);
          break;
        case 'line':
          updateScatterResponse(currTrace, plotData, 'lines+markers', plotlyTraceIdx);
          break;
        case 'heatmap':
          updateHeatmapResponse(currTrace, plotData);
          // setup the layout object using some information returned from the data
          const { plotly } = plot;
          // Getting the longest x tick in the given data to determine margin and height values in getHeatmapLayoutParams function
          const inputParams = {
            width: typeof plotly?.layout.width !== 'undefined' ? plotly?.layout.width : 1200,
            xTickAngle: typeof plotly?.layout.xaxis?.tickangle !== 'undefined' ? plotly?.layout.xaxis?.tickangle : 50,
          }

          additionalLayout = getHeatmapLayoutParams(
            inputParams,
            plotData.longestXTick?.length,
            plotData.longestYTick?.length,
            plotData.y?.length
          );

          if (plot.config.text_on_plot) {
            result.layout.annotations = [];

            const xData = plotData.x;
            const yData = plotData.y;
            const zData = plotData.z;
            for (let i = 0; i < yData.length; i++) {
              for (let j = 0; j < xData.length; j++) {
                let zText = zData[i][j];

                // zData in heatmap SHOULD be numeric type, still check and format if it is
                if (!isNaN(parseFloat(zText))) zText = addComma(zText);

                const annotation = {
                  xref: 'x' + (plotlyTraceIdx + 1),
                  yref: 'y' + (plotlyTraceIdx + 1),
                  x: j,
                  y: i,
                  text: zText,
                  font: {
                    family: 'Arial',
                    size: 12,
                    color: 'white'
                  },
                  showarrow: false
                };

                result.layout.annotations.push(annotation);
              }
            }
          }
          break;
        case 'violin':
          updateViolinResponse(currTrace, plotData, responseData);

          // add custom layout for x axis ticks
          additionalLayout.xaxis = {
            tickvals: plotData.x,
            ticktext: plotData.xTicks,
          };

          break;
        case 'pie':
          updatePieReponse(currTrace, plotData);
          break;
        case 'histogram':
        // do nothing special for now
        default:
          break;
      }
    }

    // array of plotly.data objects
    const plotlyData: any[] = [];

    // multiple data objects means multiple trace objects in plot.traces
    // data is an array of response objects
    // If the plot data object has multiple objects in the traces array, multiTrace will be set to true
    const multiTrace = data.length > 1;


    // Add all plot "traces" to data array based on plot type
    // NOTE: this assumes multiple traces in plot.traces[] will produce different objects in result.data[]
    // TODO: combine data from multiple data sources into the same result.data[n]
    //    - if all x_col or all y_col or all data_col are the same
    data.forEach((responseData: ResponseData, index: number) => {
      const currTrace = plot.traces[index];
      const isResponseJson = isDataJSON(responseData);

      // To add trace number against the alert message if multiple traces are given for a plot
      const alertMsg = multiTrace ? `Trace ${index + 1}: ` : '';
      hovertemplate_display_pattern = currTrace.hovertemplate_display_pattern; //use trace info

      // If the response_format is configured then check the format against type of file and parse the data accordingly
      if (responseData && currTrace.response_format) {
        if (!(validFileTypes.includes(currTrace.response_format)) && !alertFunctions.alerts.some(
          (alert) => alert.message.includes(invalidResponseFormatAlert))) {
          // If the given format is not from the allowed types then show an alert warning
          alertFunctions.addAlert(alertMsg + invalidResponseFormatAlert, ChaiseAlertType.WARNING);
        } else if (currTrace.response_format === 'csv' && !isResponseJson) {
          // If the given format is csv and the content of file is also of type csv then parse the data using csv parser
          responseData = parseCsvData(responseData?.toString());
        } else if (currTrace.response_format === 'json' && !isResponseJson) {
          // If the given format is json but the type of file is csv then parse the data using csv parser and show an alert warning for wrong configuration
          responseData = parseCsvData(responseData?.toString());
          if (!alertFunctions.alerts.some((alert) => alert.message.includes(alertMsg + invalidJsonAlert))) {
            alertFunctions.addAlert(alertMsg + invalidJsonAlert, ChaiseAlertType.WARNING);
          }
        } else if ((currTrace.response_format === 'csv' && isResponseJson)) {
          // If the given format is csv but the type of file is json then use the data as is and show an alert warning for wrong configuration
          if (!alertFunctions.alerts.some((alert) => alert.message.includes(alertMsg + invalidCsvAlert))) {
            alertFunctions.addAlert(alertMsg + invalidCsvAlert, ChaiseAlertType.WARNING);
          }
        }
      }

      // If response_format is not defined, and the response object is NOT json, assume it is CSV and try to parse the data
      if (responseData && currTrace?.response_format === undefined && !isResponseJson) {
        responseData = parseCsvData(responseData?.toString());
      }

      // If the responseData is succesfully parsed as json/csv, parse the data into a format plotly expects
      // after initially parsing the data, check the type of the plot and do any extra work to set up plotly for that plot type
      if (responseData?.length >= 1) {
        // intially parse the data to a general form that plotly expects before handling specific cases
        const allPlotData = parseGeneralResponse(currTrace, responseData);

        // error parsing the data
        if (!allPlotData) return;

        // each object in plot data is for displaying data in separate traces in plotly (so we can have multiple bars or bar + lines etc)
        for (let k = 0; k < allPlotData.length; k++) {
          const plotData = { ...allPlotData[k] };
          // update the plotData object for each plot type
          updatePlotDataSwitch(currTrace, plotData, responseData, k)

          plotlyData.push(plotData);
        }
      }
    });

    result.data = plotlyData;

    const emptyReponses = data.every((responseArray: any[]) => responseArray.length === 0);

    updatePlotlyConfig(result); // update the config
    updatePlotlyLayout(result, (data.length === 0 || emptyReponses), additionalLayout); // update the layout

    // If hovertemplate_display_pattern is not configured, set default hover text for plot
    if (!hovertemplate_display_pattern) {
      defaultHoverTemplateDisplay(result); // default hover template
    }
    // width and heigh are set in the css
    return result;
  };

  // Parse data on state changes to data or selectData
  useEffect(() => {
    if (data && !isDataLoading && !isInitLoading && !isFetchSelected) {
      // data is an array of arrays of ermrest response objects 
      //   data => [response.data] and response.data => [{}]
      // each array in data is for a different trace.uri_pattern
      const emptyReponses = data.every((responseArray: any[]) => responseArray.length === 0);

      setNoData((data.length === 0 || emptyReponses));
      setParsedData(parsePlotData());
      setIsParseLoading(false); // set loading to false after parsing
    }
  }, [data]);


  return {
    isInitLoading,
    isDataLoading,
    isParseLoading,
    isFetchSelected,
    modalProps,
    isModalOpen,
    selectData,
    userControlData,
    parsedData,
    data,
    errors,
    handleCloseModal,
    handleSubmitModal,
    controlTemplateVariablesInitialized
  };
};

