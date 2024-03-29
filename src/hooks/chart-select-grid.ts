// hooks
import { useEffect, useState, useCallback } from 'react';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';
import usePlotlyChart from '@isrd-isi-edu/deriva-webapps/src/hooks/plotly-chart';

// models
import { Plot } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import {
  RecordsetDisplayMode,
  RecordsetSelectMode,
} from '@isrd-isi-edu/chaise/src/models/recordset';

// services
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// utils
import { getPatternUri } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
import { getQueryParam } from '@isrd-isi-edu/chaise/src/utils/uri-utils';

/**
 * This hook is used to handle the effects and state of the select grid in the chart.
 * TODO: change how content is managed in select grid
 *    - each function has an indices array attached, this keeps track of where each selector is for accessing the information about the selector
 *    - this should be changed to a map that keeps track of the content that is separate from looking it up in the array of arrays each time
 *
 * @returns
 */
export const useChartControlsGrid = ({ setModalProps, setIsModalOpen }: any) => {
  const [selectData, setSelectData] = useState<any>(null);
  const [isFetchSelected, setIsFetchSelected] = useState<boolean>(false);
  const [optionRemoved, setOptionRemoved] = useState<boolean>(false);
  const [indicesForRemove, setIndicesForRemove] = useState<{row: number, column: number} | null>(null)

  const { templateParams, setTemplateParams } = usePlot();
  const { setNoData } = usePlotlyChart();

  /**
   * Handles closing the modal.
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  /**
   * Handles the submit of the modal data. This function will update the templateParams and selectData state.
   *
   * @param selectedRows
   * @param indices
   * @param cell
   */
  const handleSubmitModal = (selectedRows: any[], indices: number[], cell: any) => {
    const { isMulti, urlParamKey, requestInfo } = cell;
    const [i, j] = indices;

    setIsFetchSelected(true); // this action requires fetching data

    const newSelectData = [...selectData];
    newSelectData[i][j] = { ...selectData[i][j], selectedRows };

    const tempParams = { ...templateParams };
    if (selectedRows && selectedRows.length > 0) {
      if (!isMulti) {
        // if the cell is not multi, we update the selected row with one value
        const selectedTuple = selectedRows[selectedRows.length - 1];
        const value = {
          value: selectedTuple.data[requestInfo.valueKey],
          label: selectedTuple.data[requestInfo.labelKey],
        };
        newSelectData[i][j].value = value;

        tempParams.$url_parameters[urlParamKey].data = selectedTuple.data;
      } else {
        // if the cell is multi, we update the selected rows with all the values
        tempParams.$url_parameters[urlParamKey] = selectedRows.map((tuple: any) => ({
          data: tuple.data,
        }));
      }
    }

    setSelectData(newSelectData);
    setTemplateParams(tempParams);

    if (selectData[i][j].id === 'study') {
      setNoData(selectedRows.length === 0);
    }

    setIsModalOpen(false);
  };

  /**
   * Handles the click of the select all button. This function will update the templateParams and selectData state.
   */
  const handleClickSelectAll = useCallback(
    (indices: number[], cell: any) => {
      const { urlParamKey } = cell;
      setNoData(false); // set noData to false when select all is clicked
      setIsFetchSelected(true); // this action requires fetching data
      setSelectData((prevValues: any) => {
        const newValues = [...prevValues];
        const [i, j] = indices;

        newValues[i][j] = { ...prevValues[i][j], selectedRows: [] };

        return newValues;
      });

      // TODO: Using empty array to represent "all values" should be changed
      const tempParams = { ...templateParams };
      tempParams.$url_parameters[urlParamKey] = [];
      setTemplateParams(tempParams);
    },
    [setIsFetchSelected, templateParams]
  );

  /**
   * Handles the click of the select some button. This function will update the templateParams and selectData state.
   */
  const handleClickSelectSome = useCallback(
    (indices: number[], cell: any) => {
      const { requestInfo } = cell;
      const { recordsetProps } = requestInfo;

      setModalProps({
        indices,
        recordsetProps,
      });
      setIsModalOpen(true);
    },
    [setIsModalOpen, setModalProps]
  );
  

  const handleRemoveCallback = useCallback(
    (removed: any, indices: number[], cell: any) => {
      const [i, j] = indices;

      if (removed === null) {
        // removing all records occurred
        setSelectData((prevValues: any) => {
          const newValues = [...prevValues];
          newValues[i][j] = { ...prevValues[i][j], selectedRows: null };

          return newValues;
        });
      } else {
        // removing one record occurred
        setSelectData((prevValues: any) => {
          const newValues = [...prevValues];
          const prevSelectData = prevValues[i][j];
          const selectedRows = prevSelectData.selectedRows?.filter(
            (curr: any) => curr.uniqueId !== removed.uniqueId
          );
          
          // if null or empty array, no "studies" selected so show no data
          newValues[i][j] = { 
            ...prevSelectData, 
            selectedRows: (!selectedRows || selectedRows.length === 0 ? null : selectedRows)
          }; 

          return newValues;
        });
      }

      setOptionRemoved(true);
      setIndicesForRemove({ row: i, column: j});
    },
    [setSelectData]
  );

  // update select data then trigger this useEffect if an option is removed
  useEffect(() => {
    if (!optionRemoved || !indicesForRemove) return;
    setOptionRemoved(false);

    const userControl = selectData[indicesForRemove.row][indicesForRemove.column];
    const key = userControl.urlParamKey;
    const rows = userControl.selectedRows;

    // update template params and no data
    const tempParams = { ...templateParams };
    if (!rows || rows.length === 0) {
      tempParams.$url_parameters[key] = null;
      setNoData(true);
    } else {
      tempParams.$url_parameters[key] = rows;
      setNoData(false);
    }

    setTemplateParams(tempParams);
    setIsFetchSelected(true); // this action requires fetching data
  }, [selectData, optionRemoved])

  /**
   * Handles the click of the select button. This function will update the templateParams and selectData state.
   */
  const handleClick = useCallback(
    (indices: number[], cell: any) => {
      const { requestInfo } = cell;
      const { recordsetProps } = requestInfo;
      setModalProps({
        indices,
        recordsetProps,
      });
      setIsModalOpen(true);
    },
    [setIsModalOpen, setModalProps]
  );

  /**
   * Handles the change of select dropdown. This function will update the templateParams and selectData state.
   */
  const handleChange = useCallback(
    (option: any, indices: number[]) => {
      if (option) {
        setIsFetchSelected(false);
        setSelectData((prevValues: any) => {
          const newValues = [...prevValues];
          const [i, j] = indices;
          newValues[i][j] = { ...prevValues[i][j], value: option };
          return newValues;
        });
      }
    },
    [setIsFetchSelected]
  );

  /**
   * Fetch the data from the given uri for a select grid cell data
   * return the reference and tuple data received from the request
   *
   * @param uri
   * @param headers
   * @returns
   */
  const fetchSelectGridCellData = async (uri: string, headers: any) => {
    // console.log('fetchselectgridcell occurred', uri);
    const resolvedRef = await ConfigService.ERMrest.resolve(uri, { headers });
    const ref = resolvedRef.contextualize.compactSelect;
    const page = await ref.read(1);
    const tupleData = page.tuples;
    return { initialReference: ref, tupleData };
  };

  /**
   * Parses a select grid cell. When needed it will perform a request to get initial data
   * needed in the selection grid cell.
   *
   * @param cell
   * @param templateParams
   * @returns object containing a single data cell for the selection grid
   */
  const parseSelectGridCell = useCallback(
    async (cell: any) => {
      const { type, isMulti, urlParamKey, requestInfo } = cell;
      const selectResult: any = { ...cell };

      if (requestInfo) {
        // there is requestInfo, so we need to fetch data for the select grid cell

        const { uriPattern, valueKey, labelKey, recordsetProps } = requestInfo;
        const patternUri = getPatternUri(uriPattern, templateParams);
        const headers = patternUri.headers;
        let uri = patternUri.uri;

        // checks both urlparam and valuekey
        // TODO: maybe change query param to only urlparam
        const hrefQueryParam =
          getQueryParam(window.location.href, urlParamKey) ||
          getQueryParam(window.location.href, valueKey);
        if (hrefQueryParam) {
          uri += `/${valueKey}=` + hrefQueryParam;
        }

        const tempParams = { ...templateParams };
        // only fetch data if the uri is valid
        if (uri) {
          const { initialReference, tupleData } = await fetchSelectGridCellData(
            uri,
            headers
          ); // perform the data fetch

          recordsetProps.initialReference = initialReference; // set initial ref
          selectResult.selectedRows = tupleData; // set initial selected rows
          if (hrefQueryParam) {
            if (!isMulti) {
              tempParams.$url_parameters[urlParamKey].data = hrefQueryParam;
            } else {
              tempParams.$url_parameters[urlParamKey] = [
                { data: { [valueKey]: hrefQueryParam } },
              ];
            }
            selectResult.isHrefOn = true;
          }

          // fill in the default value for the dropdown selection type from the received tuple data
          const firstTuple = tupleData[0];
          selectResult.value = {
            value: firstTuple.data[valueKey],
            label: firstTuple.data[labelKey],
          };

          if (!isMulti) {
            tempParams.$url_parameters[urlParamKey].data = firstTuple.data;
          } else {
            tempParams.$url_parameters[urlParamKey] = tupleData.map((tuple: any) => ({
              data: tuple.data,
            }));
          }

          setTemplateParams(tempParams);
        }

        if (selectResult.action === 'modal') {
          // only add these functions if the action is a modal

          selectResult.onClickSelectAll = handleClickSelectAll; // function for select all of button-select
          selectResult.onClickSelectSome = handleClickSelectSome; // function for select some of button-select
          selectResult.removeCallback = handleRemoveCallback; // function for remove callback of button-select

          selectResult.onClick = handleClick; // functions for onclick dropdown-select
        }
      }

      selectResult.onChange = handleChange; // function for onchange of dropdown-select
      return selectResult;
    },
    [handleChange, handleClick, handleClickSelectAll, handleClickSelectSome, handleRemoveCallback]
  );

  /**
   * Fetch the data for the select grid
   */
  const fetchSelectData = useCallback(
    async (selectGrid: any) => {
      // harcoded to be 2 inner arrays for violin plot
      const initialData: any[][] = [[], []];

      for (let i = 0; i < selectGrid.length; i++) {
        const row = selectGrid[i];
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];

          initialData[i][j] = await parseSelectGridCell(cell);
        }
      }

      return initialData;

      // Promise.all assumes all data can be fetched at the same time
      // Promise.all(
      //   selectGrid.map((row: any[]) =>
      //     Promise.all(
      //       row.map((cell: any) =>
      //         // parse the select grid cell
      //         parseSelectGridCell(cell, templateParams)
      //       )
      //     )
      //   )
      // )
    },
    [parseSelectGridCell, templateParams]
  );

  return {
    selectData,
    setSelectData,
    fetchSelectData,
    isFetchSelected,
    handleCloseModal,
    handleSubmitModal,
    setIsFetchSelected,
  };
};

/**
 * A temporary fix to get the data for the study violin plot
 * TODO: this function should be eventually replaced so that the selectors can be defined in the config file
 *
 * @param plot plot config object
 * @returns grid of select data to be used to create selectors of the chart
 */
export const createStudyViolinSelectGrid = (plot: Plot) => {
  const result = [];
  const row1 = [];
  const row2 = [];

  // TODO: define typing for these
  // TODO: should recordsetProps be part of requestInfo object?
  //    or moved to top level `GeneSelectData.recordsetProps`?
  const GeneSelectData = {
    id: 'gene',
    urlParamKey: 'Gene',
    label: 'Gene',
    type: 'dropdown-select',
    action: 'modal',
    isButton: true,
    requestInfo: {
      valueKey: 'NCBI_GeneID',
      labelKey: 'NCBI_Symbol',
      defaultValue: '1',
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
          disableFaceting: true,
          displayMode: RecordsetDisplayMode.POPUP,
        },
        logInfo: {
          logStack: [{ type: 'set', s_t: 'Common:Gene' }],
          logStackPath: 'set/gene-selector',
        },
      },
    },
  };

  const StudySelectData = {
    id: 'study',
    urlParamKey: 'Study',
    label: 'Study',
    type: 'button-select',
    isMulti: true,
    action: 'modal',
    selectedRows: [],
    requestInfo: {
      uriPattern: plot.study_uri_pattern,
      valueKey: 'RID',
      labelKey: 'RID',
      // this selector's data can't be fetched until the selector with id='gene' data is available
      waitFor: ['gene'],
      recordsetProps: {
        initialReference: null,
        config: {
          viewable: false,
          editable: false,
          deletable: false,
          sortable: false,
          selectMode: RecordsetSelectMode.MULTI_SELECT,
          showFaceting: true,
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

  const GroupBySelectData: any = {
    id: 'groupby',
    label: 'Group By',
    type: 'dropdown-select',
    action: 'groupby',
    axis: 'x',
  };
  // Set default data for group by
  const { group_keys = [] } = plot.config.xaxis || {};
  if (group_keys.length > 0) {
    GroupBySelectData.value = {
      value: group_keys[0].column_name,
      label: group_keys[0].title || group_keys[0].title_display_pattern, // title might not be defined in old configs
    };
    GroupBySelectData.defaultOptions = group_keys.map((data) => {
      return { value: data.column_name, label: data.title || data.title_display_pattern }; // title might not be defined in old configs
    });
    const groupKeysMap: any = {};
    group_keys.forEach((data) => {
      groupKeysMap[data.column_name] = data;
    });
    GroupBySelectData.groupKeysMap = groupKeysMap;
  }

  // TODO: define a configuration in plot-config to generalize how to display selectors
  //    this is hard coded specifically for violin-plot
  row1.push(GeneSelectData);
  row1.push(GroupBySelectData);
  row1.push(ScaleSelectData);
  row2.push(StudySelectData);

  result.push(row1);
  result.push(row2);

  return result;
};
