// components
import RecordsetModal from '@isrd-isi-edu/chaise/src/components/modals/recordset-modal';
import SelectView from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-view';
import SelectInput from '@isrd-isi-edu/deriva-webapps/src/components/select-input';

// hooks
import { MouseEventHandler, useEffect, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

// models
import { ActionMeta, OnChangeValue } from 'react-select';
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { RecordsetDisplayMode, RecordsetSelectMode, SelectedRow } from '@isrd-isi-edu/chaise/src/models/recordset';

/**
 * DropdownSelectProps is the type of props for DropdownSelect component.
 */
export type FacetSearchPopupControlProps = {
  /**
   * id for the select input
   */
  id?: string;
  /**
   * label for the select input
   */
  label?: string;
  isDisabled?: boolean;
  /**
   * onChange callback for the select input
   * 
   * @param newValue 
   * @param actionMeta 
   * @returns 
   */
  onChange?: (newValue: OnChangeValue<unknown, boolean>, actionMeta: ActionMeta<unknown>) => void;
  /**
   * value for the select input
   */
  value?: any;
  /**
   * default options for the select input
   */
  defaultOptions?: any;
  userControlConfig: UserControlConfig;
};

/**
 * DropdownSelect is a component that renders a dropdown select input.
 */
const FacetSearchPopupControl = ({
  id,
  label,
  isDisabled,
  onChange,
  value,
  defaultOptions,
  userControlConfig
}: FacetSearchPopupControlProps): JSX.Element => {

  const [reference, setReference] = useState<any>();
  const [recordsetModalProps, setRecordsetModalProps] = useState<any>(null);
  const [selectedValue, setSelectedValue] = useState<any>(value);

  const { dispatchError } = useError();
  const { templateParams, setTemplateParams } = usePlot();

  const requestInfo = userControlConfig.request_info;

  useEffect(() => {
    if (requestInfo.url_pattern) {

      const createReference = async (url: string) => {
        const ref = await windowRef.ERMrest.resolve(url);

        console.log(value);

        setReference(ref);
      };

      try {
        console.log(value);
        createReference(requestInfo.url_pattern);
      } catch (error) {
        dispatchError({ error });
      }
    }
  }, [])

  const openModal = () => {
    setRecordsetModalProps({
      initialReference: reference,
      config: {
        viewable: false,
        editable: false,
        deletable: false,
        sortable: false,
        // TODO: if isMulti === true
        selectMode: RecordsetSelectMode.SINGLE_SELECT,
        showFaceting: true,
        disableFaceting: false,
        displayMode: RecordsetDisplayMode.POPUP,
      },
      logInfo: {
        // TODO: extract schema:table from url_pattern
        logStack: [{ type: 'set', s_t: 'RNASeq:Study' }],
        logStackPath: `set/${userControlConfig.uid}-selector`,
      },
    })
  }

  const handleSubmitModal = (selectedRows: SelectedRow[]) => {
    const tempParams = { ...templateParams }
    // TODO: change url_param_key being checked. It is required for this user control
    // if it's not defined, this user control configuration is invalid
    if (selectedRows && selectedRows.length > 0 && userControlConfig.url_param_key) {
      // if (!isMulti) {
      // if the cell is not multi, we update the selected row with one value
      // should have only 1 value
      const selectedTuple = selectedRows[0];

      

      tempParams.$control_values[userControlConfig.url_param_key].values = selectedTuple.data;
      // }
      // TODO: mode === multiSelect 
      // else {
      //   // if the cell is multi, we update the selected rows with all the values
      //   templateParams.$url_parameters[urlParamKey] = selectedRows.map((tuple: any) => ({
      //     data: tuple.data,
      //   }));
      // }
      setTemplateParams(tempParams);
    }
    // NOTE: set no data if control allowed to be empty
    // else {
    //   if (prevValues[i][j].id === 'study') {
    //     // if there is no selected rows, we need to set the noData flag to true for violin plot, study selector
    //     // TODO: remove this hack. Don't use noData or this condition
    //     templateParams.noData = true;
    //   }
    // }

    console.log(selectedRows);
    hideModal();
  }

  const hideModal = () => {
    setRecordsetModalProps(null);
  }

  if (!reference) return <></>;

  return (
    <>
      <SelectView label={label}>
        <button className='select-input-button' onClick={openModal}>
          <SelectInput
            className='dropdown-select'
            id={id}
            isDisabled={isDisabled}
            placeholder={'select...'}
            onChange={onChange}
            value={value}
            defaultOptions={defaultOptions}
          />
        </button>
      </SelectView>
      {
        recordsetModalProps &&
        <RecordsetModal
          modalClassName='foreignkey-popup'
          recordsetProps={recordsetModalProps}
          onClose={hideModal}
          onSubmit={(selectedRows: SelectedRow[]) => {
            handleSubmitModal(selectedRows);
          }}
        />
      }
    </>
  );
};

export default FacetSearchPopupControl;