// components
import DisplayValue from '@isrd-isi-edu/chaise/src/components/display-value';
import RecordsetModal from '@isrd-isi-edu/chaise/src/components/modals/recordset-modal';
import Spinner from 'react-bootstrap/Spinner';

// hooks
import { useEffect, useRef, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

// models
import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/webapps-core';
import { RecordsetDisplayMode, RecordsetSelectMode, SelectedRow } from '@isrd-isi-edu/chaise/src/models/recordset';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

// utils
import { isStringAndNotEmpty } from '@isrd-isi-edu/chaise/src/utils/type-utils';


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
  userControlConfig: UserControlConfig;
};

/**
 * DropdownSelect is a component that renders a dropdown select input.
 */
const FacetSearchPopupControl = ({
  id,
  label,
  isDisabled = false,
  userControlConfig
}: FacetSearchPopupControlProps): JSX.Element => {

  const [showSpinner, setShowSpinner] = useState<boolean>(true);
  const [reference, setReference] = useState<any>();
  const [recordsetModalProps, setRecordsetModalProps] = useState<any>(null);
  const [selectedValue, setSelectedValue] = useState<string>('');

  const [disabled, setDisabled] = useState<boolean>(isDisabled);

  const { dispatchError } = useError();
  const { setSelectorOptionChanged, templateParams, setTemplateParams } = usePlot();

  const requestInfo = userControlConfig.request_info;

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    if (requestInfo.url_pattern) {
      setDisabled(true);
      const createReference = async (url: string) => {
        const ref = await ConfigService.ERMrest.resolve(url);

        setReference(ref.contextualize.compactSelect);

        const valueKey = requestInfo.value_key;

        // Use value from template params since chart.ts initializes it from the url or default
        const initialValue = templateParams.$control_values[userControlConfig.uid].values[valueKey];
        const initialValueUrl = requestInfo.url_pattern + '/' + valueKey + '=' + initialValue;

        const data = await getInitialValue(initialValueUrl);

        const selfTemplateParams = { ...templateParams };
        selfTemplateParams['$self'] = { values: data }

        const displayValue = ConfigService.ERMrest.renderHandlebarsTemplate(requestInfo.selected_value_pattern, selfTemplateParams);

        setSelectedValue(displayValue);
        setShowSpinner(false);
        setDisabled(false);
      };

      const getInitialValue = async (url: string) => {
        const response = await ConfigService.http.get(url);

        return response.data[0];
      }

      try {
        // TODO: templating
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

    if (selectedRows && selectedRows.length > 0) {
      // if (!isMulti) {
      // if the cell is not multi, we update the selected row with one value
      // should have only 1 value
      const selectedTuple = selectedRows[0];

      tempParams.$control_values[userControlConfig.uid].values = selectedTuple.data;

      // we don't want $self to be saved to the templateParams, so copy again
      const selfTemplateParams = { ...tempParams };
      selfTemplateParams['$self'] = { values: selectedTuple.data }

      const displayValue = ConfigService.ERMrest.renderHandlebarsTemplate(requestInfo.selected_value_pattern, selfTemplateParams);

      setSelectedValue(displayValue);

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

    hideModal();
    setSelectorOptionChanged(true);
  }

  const hideModal = () => {
    setRecordsetModalProps(null);
  }

  /** 
   * if (show the spinner) 
   *   display spinner
   * else 
   *   if (string and not empty)
   *     display selected value
   *   else 
   *     display Select a value
   */
  const renderValue = () => {
    if (showSpinner) {
      return (
        <div className='column-cell-spinner-container'>
          <div className='column-cell-spinner-backdrop'></div>
          <Spinner animation='border' size='sm' />
        </div>
      )
    }

    if (isStringAndNotEmpty(selectedValue)) {
      return (
        <DisplayValue 
          className='popup-select-value' 
          value={{ value: selectedValue, isHTML: true }} 
        />
      )
    }
     
    return (
      <span 
        className='chaise-input-placeholder popup-select-value' 
        contentEditable={false}
      >Select a value</span>
    )
  }

return (
  <>
    <div className='selector-container'>
      <label className='selector-label'>{label}: </label>
      <div className='chaise-input-group' onClick={openModal} >
        <div className={`chaise-input-control${disabled ? ' input-disabled' : ''}`}>
          {renderValue()}
        </div>
        <div className='chaise-input-group-append'>
          <button
            id={`${id}-button`}
            className='chaise-btn chaise-btn-primary modal-popup-btn'
            role='button'
            type='button'
            disabled={disabled}
          >
            <span className='chaise-btn-icon fa-solid fa-chevron-down' />
          </button>
        </div>
      </div>
    </div>
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