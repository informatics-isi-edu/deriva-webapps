import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  PlotData as PlotlyPlotData,
  ViolinData as PlotlyViolinData,
  PieData as PlotlyPieData,
} from 'plotly.js';

import { getConfigObject } from '@isrd-isi-edu/deriva-webapps/src/utils/config';
import { formatPlotData, createLink } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { flatten2DArray } from '@isrd-isi-edu/deriva-webapps/src/utils/data';

import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import useIsFirstRender from '@isrd-isi-edu/chaise/src/hooks/is-first-render';

import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import {
  Plot,
  PlotConfig,
  PlotConfigAxis,
  DataConfig,
  Trace,
  TraceConfig,
} from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';
import {
  RecordsetDisplayMode,
  RecordsetSelectMode,
} from '@isrd-isi-edu/chaise/src/models/recordset';

/**
 * Data received from API request
 */
type Response = {
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
type ResponseData = Array<any>;

/**
 * Data packed in result
 */
type PlotResultData = {
  x: string[] & number[];
  y: string[] & number[];
  text?: string[];
};

/**
 * Data packed in result
 */
export type PieResultData = {
  text: string[] & number[];
  labels: string[] & number[];
};

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
      const config = getConfigObject(plotConfigs);
      setTypeConfig(config);
    } catch (error) {
      dispatchError({ error });
    }
  }, [plotConfigs, dispatchError]);

  return { errors, config: typeConfig };
};

/**
 * Hook function to use plot config object
 *
 * @param plot configuration object
 * @returns all data to be used by plot
 */
export const useChartData = (plot: Plot) => {
  const isFirstRender = useIsFirstRender();
  const { dispatchError, errors } = useError();

  const [data, setData] = useState<any | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [selectData, setSelectData] = useState<any>(null);
  const [modalProps, setModalProps] = useState<any>(null);
  const [isInitLoading, setIsInitLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [isParseLoading, setIsParseLoading] = useState<boolean>(false);
  const [isFetchSelected, setIsFetchSelected] = useState<boolean>(false);

  // TODO: change this to a more local scope and don't hardcode the values
  const templateParams: unknown = useMemo(
    () => ({
      $url_parameters: {
        Gene: {
          data: {
            NCBI_GeneID: '1', // TODO: deal with default value
          },
        },
        Study: [],
      },
    }),
    []
  );

  const fetchSelectGridCellData = async (uri: string, headers: any, compact: boolean) => {
    const resolvedRef = await ConfigService.ERMrest.resolve(uri, { headers });
    const ref = compact ? resolvedRef.contextualize.compactSelect : resolvedRef;
    const initialReference = resolvedRef.contextualize.compactSelect;
    const page = await ref.read(1);
    const tupleData = page.tuples;
    return { initialReference, tupleData };
  };

  const parseSelectGridCell = useCallback(
    async (cell: any, templateParams: any, indices: number[]) => {
      const { isMulti, compact, templateParamKey, ...restOfSeletData } = cell;
      const { requestInfo } = cell;
      const selectResult: any = { ...restOfSeletData };
      if (requestInfo) {
        const { uriPattern, valueKey, labelKey, recordsetProps } = requestInfo;
        const { uri, headers } = getPatternUri(uriPattern, templateParams);
        if (uri) {
          const { initialReference, tupleData } = await fetchSelectGridCellData(
            uri,
            headers,
            compact
          );
          recordsetProps.initialReference = initialReference;
          requestInfo.tupleData = tupleData;
          const firstTuple = tupleData[0];

          // set default value for selector
          selectResult.value = {
            value: firstTuple.data[valueKey],
            label: firstTuple.data[labelKey],
          };

          if (!isMulti) {
            templateParams.$url_parameters[templateParamKey].data = firstTuple.data;
          } else {
            templateParams.$url_parameters[templateParamKey] = tupleData.map((tuple: any) => ({
              data: tuple.data,
            }));
          }
        }

        if (selectResult.action === 'modal') {
          const onCloseModal = () => {
            setModalProps(null);
          };

          const onSubmitModal = (selectedRows: any[]) => {
            if (selectedRows && selectedRows.length > 0) {
              setSelectData((prevValues: any) => {
                const newValues = [...prevValues];
                const [i, j] = indices;

                const firstTuple = selectedRows[0];
                const value = {
                  value: firstTuple.data[requestInfo.valueKey],
                  label: firstTuple.data[requestInfo.labelKey],
                };

                newValues[i][j] = { ...prevValues[i][j], value, selectedRows };

                // TODO: remove this hack. Don't use noData or this condition
                if (prevValues[i][j].id === 'study') {
                  templateParams.noData = false;
                }

                if (!isMulti) {
                  templateParams.$url_parameters[templateParamKey].data = selectedRows[0].data;
                } else {
                  templateParams.$url_parameters[templateParamKey] = selectedRows.map(
                    (tuple: any) => ({
                      data: tuple.data,
                    })
                  );
                }

                return newValues;
              });
              setIsFetchSelected(true);
              onCloseModal();
            }
          };

          const onClickSelectAll = () => {
            if (requestInfo.recordsetProps) {
              templateParams.noData = false;
              setIsFetchSelected(true);
              setSelectData((prevValues: any) => {
                const newValues = [...prevValues];
                const [i, j] = indices;

                newValues[i][j] = { ...prevValues[i][j], selectedRows: [] };

                templateParams.$url_parameters[templateParamKey] = [];

                return newValues;
              });
            }
          };

          const removeCallback = (removed: any) => {
            setIsFetchSelected(true);
            if (removed === null) {
              // REMOVE ALL
              setSelectData((prevValues: any) => {
                const newValues = [...prevValues];
                const [i, j] = indices;
                newValues[i][j] = { ...prevValues[i][j], selectedRows: null };
                templateParams.$url_parameters[templateParamKey] = null;
                templateParams.noData = true;

                return newValues;
              });
            } else {
              // REMOVE ONE
              setSelectData((prevValues: any) => {
                const newValues = [...prevValues];
                const [i, j] = indices;
                const prevSelectData = prevValues[i][j];
                const selectedRows = prevSelectData.selectedRows.filter(
                  (curr: any) => curr.uniqueId !== removed.uniqueId
                );
                if (selectedRows.length === 0) {
                  templateParams.noData = true;
                  newValues[i][j] = { ...prevSelectData, selectedRows: null };
                  templateParams.$url_parameters[templateParamKey] = null;
                } else {
                  templateParams.noData = false;
                  newValues[i][j] = { ...prevSelectData, selectedRows };
                  templateParams.$url_parameters[templateParamKey] = selectedRows;
                }

                return newValues;
              });
            }
          };

          const onClickSelectSome = () => {
            if (requestInfo.recordsetProps) {
              setIsFetchSelected(true);
              setModalProps({
                recordsetProps: requestInfo.recordsetProps,
                onCloseModal,
                onSubmitModal,
              });
            }
          };

          const onClick = () => {
            if (requestInfo.recordsetProps) {
              setModalProps({
                recordsetProps: requestInfo.recordsetProps,
                onCloseModal,
                onSubmitModal,
              });
            }
          };

          // functions for button-select
          selectResult.onClickSelectAll = onClickSelectAll;
          selectResult.onClickSelectSome = onClickSelectSome;
          selectResult.removeCallback = removeCallback;

          // functions for dropdown-select
          selectResult.onClick = onClick;
        }
      }

      const onChange = (option: any) => {
        if (option) {
          console.log(option);
          setSelectData((prevValues: any) => {
            const newValues = [...prevValues];
            const [i, j] = indices;
            newValues[i][j] = { ...prevValues[i][j], value: option };
            console.log(newValues);
            return newValues;
          });
          setIsFetchSelected(false);
        }
      };
      selectResult.onChange = onChange;

      return selectResult;
    },
    []
  );

  const fetchData = useCallback(async () => {
    // Fulfill promise for plot
    const plotResponses: Array<Response> = await Promise.all(
      // request for each trace
      plot.traces.map((trace) => {
        if (trace.uri) {
          return ConfigService.http.get(trace.uri);
        } else if (trace.queryPattern) {
          const { uri, headers } = getPatternUri(trace.queryPattern, templateParams);
          return ConfigService.http.get(uri, { headers });
        } else {
          return { data: [] };
        }
      })
    );

    return plotResponses.map((response: Response) => response.data); // unpack data
  }, [plot, templateParams]);

  //  Effect to fetch initial Data
  useEffect(() => {
    const fetchSelectData = async (selectGrid: any) =>
      Promise.all(
        selectGrid.map(async (row: any[], i: number) =>
          Promise.all(
            row.map(async (cell: any, j: number) =>
              parseSelectGridCell(cell, templateParams, [i, j])
            )
          )
        )
      );

    const fetchInitialData = async () => {
      setIsInitLoading(true);
      if (plot.plot_type === 'violin') {
        const selectGrid = createStudyViolinSelectGrid(plot);
        const initialSelectData = await fetchSelectData(selectGrid);
        setSelectData(initialSelectData);
      }
      const plotData = await fetchData();
      setData(plotData);
      setIsInitLoading(false);
    };

    if (isFirstRender) {
      try {
        fetchInitialData();
      } catch (error) {
        dispatchError({ error });
      }
    }
  }, [isFirstRender, plot, templateParams, fetchData, dispatchError, parseSelectGridCell]);

  // Effect to fetch data on subsequent selectData changes
  useEffect(() => {
    const fetchSubsequentData = async () => {
      setIsDataLoading(true);
      const plotData = await fetchData();
      setData(plotData);
      setIsDataLoading(false);
    };

    if (!isFirstRender && isFetchSelected) {
      try {
        fetchSubsequentData();
      } catch (error) {
        dispatchError({ error });
      }
    }
  }, [isFirstRender, isFetchSelected, selectData, templateParams, fetchData, dispatchError]);

  // Parse data on state changes to data and selectData
  useEffect(() => {
    if (data) {
      setIsParseLoading(true);
      const parsedPlotData = parsePlotData(plot, data, selectData, templateParams);
      setParsedData(parsedPlotData);
      setIsParseLoading(false);
    }
  }, [plot, data, selectData, templateParams]);

  return {
    isFirstRender,
    isInitLoading,
    isDataLoading,
    isParseLoading,
    modalProps,
    selectData,
    parsedData,
    data,
    errors,
  };
};

const getPatternUri = (queryPattern: string, templateParams: any) => {
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

// TODO: deprecate this
const createStudyViolinSelectGrid = (plot: Plot) => {
  const result = [];
  const row1 = [];
  const row2 = [];

  const GeneSelectData = {
    id: 'gene',
    templateParamKey: 'Gene',
    label: 'Gene',
    type: 'dropdown-select',
    action: 'modal',
    isButton: true,
    compact: true,
    requestInfo: {
      valueKey: 'NCBI_GeneID',
      labelKey: 'NCBI_Symbol',
      uriPattern: plot.gene_uri_pattern,
      recordsetProps: {
        initialReference: null,
        config: {
          viewable: false,
          editable: false,
          deletable: false,
          sortable: false,
          selectMode: RecordsetSelectMode.SINGLE_SELECT,
          showFaceting: false,
          disableFaceting: false,
          displayMode: RecordsetDisplayMode.POPUP,
        },
        logInfo: {
          logStack: [{ type: 'set', s_t: 'Common:Gene' }],
          logStackPath: 'set/gene-selector',
        },
      },
    },
  };

  const { group_keys = [] } = plot.config.xaxis || {};

  // TODO: define typing for this
  const GroupBySelectData: any = {
    id: 'groupby',
    label: 'Group By',
    type: 'dropdown-select',
    action: 'groupby',
    axis: 'x',
  };

  // Set default data for group by
  if (group_keys.length > 0) {
    GroupBySelectData.value = {
      value: group_keys[0].column_name,
      label: group_keys[0].title_display_pattern,
    };
    GroupBySelectData.defaultOptions = group_keys.map((data) => {
      return { value: data.column_name, label: data.title_display_pattern };
    });
  }

  const ScaleSelectData: any = {
    id: 'scale',
    label: 'Scale',
    type: 'dropdown-select',
    action: 'scale',
    axis: 'y',
    setting: plot.config.yaxis,
    value: { value: 'linear', label: 'Linear' },
    defaultOptions: [
      { value: 'linear', label: 'Linear' },
      { value: 'log', label: 'Log' },
    ],
  };

  const StudySelectData = {
    id: 'study',
    templateParamKey: 'Study',
    label: 'Study',
    type: 'button-select',
    isMulti: true,
    action: 'modal',
    selectedRows: [],
    requestInfo: {
      uriPattern: plot.study_uri_pattern,
      valueKey: 'RID',
      labelKey: 'RID',
      recordsetProps: {
        initialReference: null,
        config: {
          viewable: false,
          editable: false,
          deletable: false,
          sortable: false,
          selectMode: RecordsetSelectMode.MULTI_SELECT,
          showFaceting: false,
          disableFaceting: false,

          displayMode: RecordsetDisplayMode.POPUP,
        },
        logInfo: {
          logStack: [{ type: 'set', s_t: 'RNASeq:Study' }],
          logStackPath: 'set/study-selector',
        },
      },
    },
  };

  row1.push(GeneSelectData);
  row1.push(GroupBySelectData);
  row1.push(ScaleSelectData);
  row2.push(StudySelectData);

  result.push(row1);
  result.push(row2);

  return result;
};

/**
 * Parses data for the unpackedResponses for every plot based on its type
 *
 * @param plot configs for a specific plot
 * @param unpackedResponses response data
 * @returns plotly data to be inserted into props
 */
const parsePlotData = (
  plot: Plot,
  unpackedResponses: ResponseData[],
  selectDataGrid: any,
  templateParams: any
) => {
  const result: any = { ...plot.plotly, data: [] };

  // Add all plot "traces" to data array based on plot type
  result.data = unpackedResponses.map((responseData: ResponseData, index: number) => {
    const currTrace = plot.traces[index];
    if (plot.plot_type === 'bar') {
      return parseBarResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'pie') {
      return parsePieResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'scatter') {
      return parseScatterResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'histogram') {
      return parseHistogramResponse(currTrace, plot, responseData);
    } else if (plot.plot_type === 'violin') {
      return parseViolinResponse(
        currTrace,
        plot,
        responseData,
        selectDataGrid,
        templateParams.noData
      );
    }
  });

  updatePlotlyConfig(plot, result); // update the config
  updatePlotlyLayout(plot, result, templateParams, selectDataGrid); // update the layout

  return result;
};

/**
 * Updates the plotly config based on the given plot configs
 *
 * @param plot configs for a specific plot
 * @param result result to be updated
 */
const updatePlotlyConfig = (plot: Plot, result: any): void => {
  result.config.displaylogo = Boolean(plot.config.displaylogo);
  result.config.responsive = Boolean(plot.config.responsive);
};

/**
 * Updates the plotly layout based on given plot configs
 *
 * @param plot configs for a specific plot
 * @param result result to be updated
 */
const updatePlotlyLayout = (
  plot: Plot,
  result: any,
  templateParams: any,
  selectDataGrid?: any
): void => {
  // title
  if (plot.config.title_display_markdown_pattern) {
    result.layout.title = createLink(plot.config.title_display_markdown_pattern, templateParams);
  }
  if (templateParams.noData) {
    result.layout.title = 'No Data';
  }

  // legend
  if (plot.config.disable_default_legend_click) {
    result.layout.disable_default_legend_click = plot.config.disable_default_legend_click;
  }

  // x axis
  if (!result.layout.xaxis) {
    result.layout.xaxis = {};
  }
  if (plot.config.xaxis?.title_display_markdown_pattern) {
    result.layout.xaxis.title = createLink(plot.config.xaxis.title_display_markdown_pattern);
  }
  result.layout.xaxis.automargin = true;
  result.layout.xaxis.tickformat = plot.config.x_axis_thousands_separator ? ',d' : '';
  result.layout.xaxis.ticksuffix = '  ';

  // y axis
  if (!result.layout.yaxis) {
    result.layout.yaxis = {};
  }

  // set yaxis type and title
  if (plot.config.yaxis?.title_display_markdown_pattern) {
    // TODO: figure out cleaner way to do this
    if (Array.isArray(selectDataGrid)) {
      selectDataGrid.forEach((row: any) => {
        row.forEach((cell: any) => {
          if (cell.action === 'scale') {
            if (cell.value.value === 'log') {
              result.layout.yaxis.title = createLink(
                `log(${plot.config.yaxis?.title_display_markdown_pattern} + 1)`
              );
            } else {
              result.layout.yaxis.title = createLink(
                `${plot.config.yaxis?.title_display_markdown_pattern}`
              );
            }
            result.layout.yaxis.type = cell.value.value;
          }
        });
      });
    } else {
      result.layout.yaxis.title = createLink(plot.config.yaxis.title_display_markdown_pattern);
    }
  }

  result.layout.yaxis.automargin = true;
  result.layout.yaxis.ticksuffix = '  ';

  // buttons
  if (plot?.plotly?.config?.modeBarButtonsToRemove) {
    result.layout.modebar = { remove: plot?.plotly?.config?.modeBarButtonsToRemove };
  }
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parseViolinResponse = (
  trace: Trace,
  plot: Plot,
  responseData: ResponseData,
  selectDataGrid: any,
  noData?: boolean
) => {
  const { ...plotlyTrace } = trace;
  const result: Partial<TraceConfig> & Partial<PlotlyViolinData> & Partial<{ transforms: any[] }> =
    {
      ...plotlyTrace,
      type: 'violin',
      text: [],
      x: [],
      y: [],
      // todo: maybe migrate the bottom params to config
      points: 'all',
      pointpos: 0,
      box: {
        visible: true,
      },
      meanline: {
        visible: true,
      },
      line: {
        width: 1,
      },
    };

  if (!noData) {
    const selectDataArray = flatten2DArray(selectDataGrid);
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

    // console.log('parseViolinResponse X GROUPBY OBJ', xGroupBy);
    // console.log('Y SCALE OBJ', yScale);

    const x: any[] = [];
    const y: any[] = [];
    const xTicks = [];
    responseData.forEach((item: any) => {
      if (xGroupBy) {
        const groupByKey = xGroupBy.value.value;
        const xVal = item[groupByKey];
        const xTick = xGroupBy?.setting?.tick_display_markdown_pattern
          ? createLink(xGroupBy?.setting?.tick_display_markdown_pattern)
          : xVal;
        if (xVal !== null && xVal !== undefined) {
          x.push(xVal);
        }
        if (xTick !== null && xTick !== undefined) {
          xTicks.push(xTick);
        }
      }

      if (yScale) {
        const yItem = item[yScale.setting.group_key];
        if (yScale.value.value === 'log') {
          const yVal = yItem + 1;
          y.push(yVal);
        } else {
          const yVal = yItem ? createLink(yItem.toString()) : yItem;
          y.push(yVal);
        }
      }
    });

    // console.log('parseViolinResponse XVALUES', x);
    // console.log('YVALUES', y);

    result.x = x;
    result.y = y;
    result.transforms = [
      {
        type: 'groupby',
        groups: x,
      },
    ];
  }

  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parseHistogramResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> = {
    ...trace,
    type: 'histogram',
  };

  const { config } = plot;
  const { format_data = false } = config;

  const dataPoints: Array<any> = [];
  responseData.forEach((item: any) => {
    if (trace.data_col) {
      const value = getValue(item, trace.data_col, undefined, format_data, plot);
      dataPoints.push(value);
    }
  });

  // Add data to correct axis depending on orientation
  if (trace.orientation === 'h') {
    result.y = dataPoints;
  } else if (trace.orientation === 'v') {
    result.x = dataPoints;
  }

  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parseScatterResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> & PlotResultData = {
    ...trace,
    mode: 'markers',
    name: trace.legend ? trace.legend[0] : '',
    type: plot.plot_type,
    text: [],
    x: [],
    y: [],
  };

  const { config } = plot;
  const { xaxis, yaxis, format_data_x = false, format_data_y = false } = config; // why is format_data_x not in xaxis?

  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);
    // Add X data
    trace?.x_col?.forEach((colName) => {
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      result.x?.push(value.toString());
    });
    // Add Y data
    trace?.y_col?.forEach((colName) => {
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      result.y?.push(value.toString());
    });
  });

  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parsePieResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPieData> & PieResultData = {
    ...trace,
    type: plot.plot_type,
    hoverinfo: 'text+value+percent', // value to show on hover of a pie slice
    textinfo: 'value', // data shown on a pie slice
    labels: [],
    values: [],
    text: [],
    // legend_clickable_links: [], // TODO: confirm deprecated
    // graphic_clickable_links: [], // TODO: confirm deprecated
  };

  const { config } = plot;
  const { format_data = false } = config;

  responseData.forEach((item: any, i: number) => {
    updateWithTraceColData(result, trace, item, i);
    // Add data
    if (trace.data_col) {
      const value = getValue(item, trace.data_col, undefined, format_data, plot);
      if (Array.isArray(result.values)) {
        result.values.push(value);
      }
    }

    // Add legend data if exists
    if (trace.legend_col) {
      const value = getValue(item, trace.legend_col, undefined, false, plot);
      result.text.push(item[trace.legend_col]);
      result.labels.push(value);
    }
  });

  return result;
};

/**
 * Parses response data obtained for every trace within the plot
 *
 * @param trace current trace the plot config
 * @param plot plot config
 * @param responseData data received from request to be parsed
 * @returns
 */
const parseBarResponse = (trace: Trace, plot: Plot, responseData: ResponseData) => {
  const result: Partial<TraceConfig> & Partial<PlotlyPlotData> & PlotResultData = {
    ...trace,
    type: plot.plot_type,
    textposition: 'outside', // position of bar values
    hoverinfo: 'text', // value to show on hover of a bar
    x: [], // x data
    y: [], // y data
    text: [], // text data
    // legend_clickable_links: [], // TODO: confirm deprecated
    // graphic_clickable_links: [], // TODO: confirm deprecated
  };

  const { config } = plot;
  const { xaxis, yaxis, format_data_x = false, format_data_y = false } = config; // why is format_data_x not in xaxis?

  responseData.forEach((item: any) => {
    // Add the x values for the bar plot
    trace?.x_col?.forEach((colName, i: number) => {
      if (trace.orientation === 'h') {
        // update the trace data if orientation is horizontal
        updateWithTraceColData(result, trace, item, i);
        const textValue = getValue(item, colName, undefined, true, plot);
        result.text?.push(textValue.toString());
      }
      const value = getValue(item, colName, xaxis, format_data_x, plot);
      result.x.push(value.toString());
    });

    // Add the y values for the bar plot
    trace?.y_col?.forEach((colName, i: number) => {
      if (trace.orientation === 'v') {
        // update the trace data if orientation is vertical
        updateWithTraceColData(result, trace, item, i);
        const textValue = getValue(item, colName, undefined, true, plot);
        result.text?.push(textValue.toString());
      }
      const value = getValue(item, colName, yaxis, format_data_y, plot);
      result.y.push(value.toString());
    });
  });
  return result;
};

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
  formatData: boolean,
  plot: Plot
): string | number => {
  let value = item[colName];
  if (axis && axis?.tick_display_markdown_pattern) {
    value = createLink(axis.tick_display_markdown_pattern, { $self: { data: item } });
  }
  return formatPlotData(value, formatData, plot.plot_type);
};

/**
 * Updates the trace with given the given trace passed in from plot-cnofig and the item data
 *
 * @param result trace object to be updated
 * @param trace from plot configs
 * @param item from the response object
 * @param index index of the response
 */
const updateWithTraceColData = (result: any, trace: Trace, item: any, index: number): void => {
  // legend name
  let name = trace.legend ? trace.legend[index] : '';
  if (trace.legend_markdown_pattern) {
    name = createLink(trace.legend_markdown_pattern[index] || '');
  }
  result.name = name;

  // TODO: confirm deprecated
  // get legend clickable links
  // if (trace.legend_markdown_pattern) {
  //   const traceLinkWithContextParams = createLinkWithContextParams(
  //     trace.legend_markdown_pattern[i] || ''
  //   );
  //   result.legend_clickable_links.push(traceLinkWithContextParams);
  // }

  // TODO: confirm deprecated
  // Configure links for individual traces
  // For Configuring links we are only going to render the templating pattern as the link would not contain any of html content in it, it would be plain link like,
  // graphic_link_pattern: "/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}"
  // if (trace.graphic_link_pattern) {
  //   const linkPattern = Array.isArray(trace.graphic_link_pattern)
  //     ? trace.graphic_link_pattern[0]
  //     : trace.graphic_link_pattern;
  //   result.graphic_clickable_links.push(createLink(linkPattern, templateParams));
  // }
};
