import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { getDefaultValues  } from '@isrd-isi-edu/deriva-webapps/src/hooks/boolean-search';
export type BooleanTableProps = {
  /**
   * rows in the table
   */
  rows: any[];
  /**
   * callback set rows
   */
  setRows: (rows: any[]) => void;
  /**
   * strength data
   */
  strength: any[];
  /**
   * pattern data
   */
  pattern: any[];
  /**
   * location data
   */
  location: any[];
  /**
   * stageFrom data
   */
  stageFrom: any[];
  /**
   * callback to change the filter query text
   */
  changeFiltersDisplayText: () => void;
  /**
   * boolean to show the add button is clicked
   */
  addClicked: boolean;
  /**
   * callback to set the add button click
   */
  setAddClicked: (value: boolean) => void;
};
const BooleanTable = ({
  rows,
  setRows,
  strength,
  pattern,
  location,
  stageFrom,
  changeFiltersDisplayText,
  addClicked,
  setAddClicked
}: BooleanTableProps) => {
  const [activeRow, setActiveRow] = useState(rows.length - 1);
  const defaultValues = getDefaultValues(stageFrom);
  const handleAddRow = () => {
    
    setRows([...rows, defaultValues]);
  };

  useEffect(() => {
    // This is to add one row by default 
    if (rows.length === 0 && stageFrom.length > 0) {
      handleAddRow();
    }
    changeFiltersDisplayText();
  }, [rows, stageFrom]);

  // This is to set active row when a new row is added
  useEffect(() => {
    setActiveRow(rows.length - 1);
    setAddClicked(false);
  }, [addClicked]);

  useEffect(() => {
    const setSourceForFilter = (sourceObject: any) => {
      const updatedRows = [...rows];
      const updatedRow = { ...updatedRows[activeRow], source: sourceObject };
      updatedRow.sourceInvalid = false;
      updatedRows[activeRow] = updatedRow;
      setRows(updatedRows);
    };

    windowRef.setSourceForFilter = setSourceForFilter;

  }, [rows, activeRow]);

  const handleRemoveRow = (evt: React.MouseEvent<HTMLButtonElement>, index: number) => {
    const updatedRows = rows.slice(0, index).concat(rows.slice(index + 1));
    setRows(updatedRows);
    evt.stopPropagation();
  };

  const handleClearFilter = (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...defaultValues
    };
    setRows(updatedRows);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updatedRows = [...rows];
    const updatedRow = { ...updatedRows[index] };

    if (field === 'stageFrom') {
      updatedRow.stageFrom = { ...updatedRow.stageFrom, Name: value };

      const pos = stageFrom.findIndex((obj: any) => obj.Name === updatedRow.stageFrom.Name);
      updatedRow.toStageOptions = stageFrom.slice(pos);
      updatedRow.stageTo = { ...updatedRow.stageTo,
        Name: updatedRow.toStageOptions[0].Name,
        Ordinal: updatedRow.toStageOptions[0].Ordinal };
        
    } else if (field === 'stageTo') {
      updatedRow.stageTo = { ...updatedRow.stageTo, Name: value };

    } else {
      updatedRow[field] = value;
    }

    updatedRows[index] = updatedRow;
    setRows(updatedRows);
  };

  const handleActiveRow = (e: React.MouseEvent<HTMLTableRowElement>, index: number) => {
    setActiveRow(index);
  };

  return (
    <div className='form-container'>
      <table className='boolean-table' cellSpacing='10'>
        <tbody>
          <tr>
            <th></th>
            <th><span><span className='text-danger'><b>*</b></span><span> Strength</span></span></th>
            <th><span><span className='text-danger'><b>*</b></span><span> In Anatomical Source</span></span></th>
            <th><span><span className='text-danger'><b>*</b></span><span> Stages</span></span></th>
            <th>With Pattern</th>
            <th>At Location</th>
            <th>Actions</th>
          </tr>
          {rows.map((row: any, index: number) => (
            <tr
              key={index}
              className={`${activeRow === index ? 'active-row' : ''}`}
              onClick={(e) => handleActiveRow(e, index)}
            >
              <td>{index === 0 ? '' : 'AND'}</td>
              <td>
                <select
                  value={row.strength || defaultValues.strength}
                  onChange={(e) => handleChange(index, 'strength', e.target.value)}
                >
                  {strength.map((option: any, index: number) => (
                    <option key={index}>{option.Strength}</option>
                  ))}
                </select>
              </td>
              <td>
                <>
                  <input
                    className='red-text'
                    value={row.source.name || ''}
                    disabled
                    required
                    onChange={(e) => handleChange(index, 'source', e.target.value)}
                  />
                  {row.sourceInvalid ? <div className='red-text'>Please enter a value for this field.</div> : null}
                </>
              </td>
              <td>
                <>
                  <span>From: </span>
                  <select
                    className='stageDropdown'
                    value={row.stageFrom.Name || defaultValues.stageFrom.Name}
                    onChange={(e) => handleChange(index, 'stageFrom', e.target.value)}
                  >
                    {stageFrom.map((option: any, index: number) => (
                      <option key={index}>{option.Name}</option>
                    ))}
                  </select>
                  <span className='to-dropdown'>To: </span>
                  <select
                    className='stageDropdown'
                    value={row.stageTo.Name || defaultValues.stageTo.Name}
                    onChange={(e) => handleChange(index, 'stageTo', e.target.value)}
                  >
                    {row.toStageOptions.map((option: any, index: number) => (
                      <option key={index}>{option.Name}</option>
                    ))}
                  </select>
                </>
              </td>
              <td>
                <select
                  value={row.pattern || defaultValues.pattern || ''}
                  onChange={(e) => handleChange(index, 'pattern', e.target.value)}
                >
                  <option selected value=''></option>
                  {pattern.map((option: any, index: number) => (
                    <option key={index}>{option.Pattern}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={row.location || defaultValues.location || ''}
                  onChange={(e) => handleChange(index, 'location', e.target.value)}
                >
                  <option selected value=''></option>
                  {location.map((option: any, index: number) => (
                    <option key={index}>{option.Pattern_Location}</option>
                  ))}
                </select>
              </td>
              <td>
                <div className='actions-button-wrapper'>
                  <button
                    onClick={(e) => handleClearFilter(e, index)}
                    className='chaise-btn chaise-btn-primary action-button'
                    title='Click to remove this filter'
                  >
                    <span className='fa fa-close'></span>
                  </button>
                  <button
                    onClick={(e) => handleRemoveRow(e, index)}
                    className={`chaise-btn chaise-btn-primary action-button ${
                      rows.length === 1 ? 'disable-trash' : ''
                    }`}
                    title='Click to remove this filter'
                  >
                    <span className='fa fa-trash'></span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BooleanTable;
