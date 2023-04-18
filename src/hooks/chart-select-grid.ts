import { useState, useCallback } from 'react';
import { Plot } from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import { getPatternUri } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';

import {
  RecordsetDisplayMode,
  RecordsetSelectMode,
} from '@isrd-isi-edu/chaise/src/models/recordset';

/**
 * This hook is used to handle the effects and state of the select grid in the chart.
 *
 * @returns
 */
export const useChartSelectGrid = ({ templateParams, setModalProps, setIsModalOpen }: any) => {
  const [selectData, setSelectData] = useState<any>(null);
  const [isFetchSelected, setIsFetchSelected] = useState<boolean>(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitModal = (selectedRows: any[], indices: number[], cell: any) => {
    const { isMulti, urlParamKey, requestInfo } = cell;

    setIsFetchSelected(true);
    setSelectData((prevValues: any) => {
      const newValues = [...prevValues];
      const [i, j] = indices;

      newValues[i][j] = { ...prevValues[i][j], selectedRows };

      if (selectedRows && selectedRows.length > 0) {
        if (prevValues[i][j].id === 'study') {
          // TODO: eventually remove this hack. Don't use noData or this condition
          templateParams.noData = false;
        }

        if (!isMulti) {
          const selectedTuple = selectedRows[selectedRows.length - 1];
          const value = {
            value: selectedTuple.data[requestInfo.valueKey],
            label: selectedTuple.data[requestInfo.labelKey],
          };
          newValues[i][j] = { ...prevValues[i][j], value, selectedRows };
          newValues[i][j].value = value;
          templateParams.$url_parameters[urlParamKey].data = selectedTuple.data;
        } else {
          templateParams.$url_parameters[urlParamKey] = selectedRows.map((tuple: any) => ({
            data: tuple.data,
          }));
        }
      } else {
        if (prevValues[i][j].id === 'study') {
          // TODO: remove this hack. Don't use noData or this condition
          templateParams.noData = true;
        }
      }

      return newValues;
    });
    setIsModalOpen(false);
  };

  const handleClickSelectAll = useCallback(
    (indices: number[], cell: any) => {
      const { urlParamKey } = cell;
      templateParams.noData = false;
      setIsFetchSelected(true);
      setSelectData((prevValues: any) => {
        const newValues = [...prevValues];
        const [i, j] = indices;

        newValues[i][j] = { ...prevValues[i][j], selectedRows: [] };

        templateParams.$url_parameters[urlParamKey] = [];

        return newValues;
      });
    },
    [setIsFetchSelected, templateParams]
  );

  const handleClickSelectSome = useCallback(
    (indices: number[], cell: any) => {
      const { requestInfo } = cell;
      const { recordsetProps } = requestInfo;

      setIsFetchSelected(true);
      setModalProps({
        indices,
        recordsetProps,
      });
      setIsModalOpen(true);
    },
    [setIsModalOpen, setIsFetchSelected, setModalProps]
  );

  const handleRemoveCallback = useCallback(
    (removed: any, indices: number[], cell: any) => {
      const { urlParamKey } = cell;

      if (removed === null) {
        // REMOVE ALL OCCURRED
        setSelectData((prevValues: any) => {
          const newValues = [...prevValues];
          const [i, j] = indices;
          newValues[i][j] = { ...prevValues[i][j], selectedRows: null };
          templateParams.$url_parameters[urlParamKey] = null;
          templateParams.noData = true;

          return newValues;
        });
      } else {
        // REMOVE ONE OCCURRED
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
            templateParams.$url_parameters[urlParamKey] = null;
          } else {
            templateParams.noData = false;
            newValues[i][j] = { ...prevSelectData, selectedRows };
            templateParams.$url_parameters[urlParamKey] = selectedRows;
          }

          return newValues;
        });
      }
    },
    [templateParams, setSelectData]
  );

  const handleClick = useCallback(
    (indices: number[], cell: any) => {
      const { requestInfo } = cell;
      const { recordsetProps } = requestInfo;
      setIsFetchSelected(true);
      setModalProps({
        indices,
        recordsetProps,
      });
      setIsModalOpen(true);
    },
    [setIsFetchSelected, setIsModalOpen, setModalProps]
  );

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
   * @param compact
   * @returns
   */
  const fetchSelectGridCellData = async (uri: string, headers: any, compact: boolean) => {
    const resolvedRef = await ConfigService.ERMrest.resolve(uri, { headers });
    const ref = compact ? resolvedRef.contextualize.compactSelect : resolvedRef;
    const initialReference = resolvedRef.contextualize.compactSelect;
    const page = await ref.read(1);
    const tupleData = page.tuples;
    return { initialReference, tupleData };
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
    async (cell: any, templateParams: PlotTemplateParams) => {
      const { type, isMulti, compact, urlParamKey, requestInfo } = cell;
      const selectResult: any = { ...cell };

      if (requestInfo) {
        // there is requestInfo, so we need to fetch data for the select grid cell

        const { uriPattern, valueKey, labelKey, recordsetProps } = requestInfo;
        const { uri, headers } = getPatternUri(uriPattern, templateParams);

        // only fetch data if the uri is valid
        if (uri) {
          const { initialReference, tupleData } = await fetchSelectGridCellData(
            uri,
            headers,
            compact
          ); // perform the data fetch
          recordsetProps.initialReference = initialReference; // set initial ref
          selectResult.selectedRows = tupleData; // set initial selected rows

          // fill in the default value for the dropdown selection type from the received tuple data
          if (type === 'dropdown-select') {
            const firstTuple = tupleData[0];
            selectResult.value = {
              value: firstTuple.data[valueKey],
              label: firstTuple.data[labelKey],
            };

            if (!isMulti) {
              templateParams.$url_parameters[urlParamKey].data = firstTuple.data;
            } else {
              templateParams.$url_parameters[urlParamKey] = tupleData.map((tuple: any) => ({
                data: tuple.data,
              }));
            }
          }
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

  const fetchSelectData = useCallback(
    async (selectGrid: any) =>
      Promise.all(
        selectGrid.map(async (row: any[]) =>
          Promise.all(row.map(async (cell: any) => parseSelectGridCell(cell, templateParams)))
        )
      ),
    [parseSelectGridCell, templateParams]
  );

  return {
    selectData,
    setSelectData,
    fetchSelectData,
    isFetchSelected,
    handleCloseModal,
    handleSubmitModal,
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

  const GeneSelectData = {
    id: 'gene',
    urlParamKey: 'Gene',
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
      label: group_keys[0].title_display_pattern,
    };
    GroupBySelectData.defaultOptions = group_keys.map((data) => {
      return { value: data.column_name, label: data.title_display_pattern };
    });
    const groupKeysMap: any = {};
    group_keys.forEach((data) => {
      groupKeysMap[data.column_name] = data;
    });
    GroupBySelectData.groupKeysMap = groupKeysMap;
  }

  row1.push(GeneSelectData);
  row1.push(GroupBySelectData);
  row1.push(ScaleSelectData);
  row2.push(StudySelectData);

  result.push(row1);
  result.push(row2);

  return result;
};
