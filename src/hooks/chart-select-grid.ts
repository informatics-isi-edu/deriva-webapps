import { useState, useCallback } from 'react';
import { Plot } from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import { getPatternUri } from '@isrd-isi-edu/deriva-webapps/src/utils/string';

import { PlotTemplateParams } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';

import {
  RecordsetDisplayMode,
  RecordsetSelectMode,
} from '@isrd-isi-edu/chaise/src/models/recordset';

export const useChartSelectGrid = ({ templateParams, setModalProps, setIsModalOpen }: any) => {
  const [selectData, setSelectData] = useState<any>(null);
  const [isFetchSelected, setIsFetchSelected] = useState<boolean>(false);

  const handleCloseModal = () => {
    console.log('onCloseModal');
    setIsModalOpen(false);
  };

  const handleSubmitModal = (selectedRows: any[], indices: number[], cell: any) => {
    console.log('onSubmitModal', selectedRows, indices, cell);
    const { isMulti, urlParamKey, requestInfo } = cell;

    setIsFetchSelected(true);
    setSelectData((prevValues: any) => {
      const newValues = [...prevValues];
      const [i, j] = indices;

      newValues[i][j] = { ...prevValues[i][j], selectedRows };

      if (selectedRows && selectedRows.length > 0) {
        console.log('setSelectData in handleSubmitModal', indices, prevValues[i][j].id);

        // TODO: remove this hack. Don't use noData or this condition
        if (prevValues[i][j].id === 'study') {
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
        // TODO: remove this hack. Don't use noData or this condition
        if (prevValues[i][j].id === 'study') {
          templateParams.noData = true;
        }
      }

      return newValues;
    });
    setIsModalOpen(false);
  };

  const handleClickSelectAll = useCallback(
    (indices: number[], cell: any) => {
      console.log('onClickSelectAll', indices, cell);
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
      console.log('handleClickSelectSome', indices, cell, selectData);
      const { requestInfo } = cell;
      const { recordsetProps } = requestInfo;
      if (selectData) {
        const [i, j] = indices;
        if (Array.isArray(selectData)) {
          console.log('test2', selectData[i][j]);
          console.log('test3', selectData[i][j].selectedRows);
        }
      }
      setIsFetchSelected(true);
      setModalProps({
        indices,
        recordsetProps,
      });
      setIsModalOpen(true);
    },
    [selectData, setIsModalOpen, setIsFetchSelected, setModalProps]
  );

  const handleRemoveCallback = useCallback(
    (removed: any, indices: number[], cell: any) => {
      const { urlParamKey } = cell;
      console.log('removeCallback', removed, indices, cell);
      if (removed === null) {
        // REMOVE ALL
        setSelectData((prevValues: any) => {
          const newValues = [...prevValues];
          const [i, j] = indices;
          newValues[i][j] = { ...prevValues[i][j], selectedRows: null };
          templateParams.$url_parameters[urlParamKey] = null;
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
      console.log('onClick', indices, cell);
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

  const fetchSelectGridCellData = async (uri: string, headers: any, compact: boolean) => {
    const resolvedRef = await ConfigService.ERMrest.resolve(uri, { headers });
    const ref = compact ? resolvedRef.contextualize.compactSelect : resolvedRef;
    const initialReference = resolvedRef.contextualize.compactSelect;
    const page = await ref.read(1);
    const tupleData = page.tuples;
    return { initialReference, tupleData };
  };

  const parseSelectGridCell = useCallback(
    async (cell: any, templateParams: PlotTemplateParams) => {
      const { isMulti, compact, urlParamKey } = cell;
      const { requestInfo } = cell;
      const selectResult: any = { ...cell };
      if (requestInfo) {
        const { uriPattern, valueKey, labelKey, recordsetProps } = requestInfo;
        const { uri, headers } = getPatternUri(uriPattern, templateParams);
        if (uri) {
          const { initialReference, tupleData } = await fetchSelectGridCellData(
            uri,
            headers,
            compact
          );
          recordsetProps.initialReference = initialReference; // set initial ref
          selectResult.selectedRows = tupleData; // set initial selected rows

          // set default value for selector
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

        if (selectResult.action === 'modal') {
          // functions for button-select
          selectResult.onClickSelectAll = handleClickSelectAll;
          selectResult.onClickSelectSome = handleClickSelectSome;
          selectResult.removeCallback = handleRemoveCallback;

          // functions for dropdown-select
          selectResult.onClick = handleClick;
        }
      }

      selectResult.onChange = handleChange;
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

// TODO: deprecate this
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
