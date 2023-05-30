import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTable } from 'react-table';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

const BooleanTable = ({
  rows,
  setRows,
  strength,
  pattern,
  location,
  stageFrom,
  source,
  changeFiltersDisplayText,
  addClicked,
  setAddClicked
}: any) : JSX.Element=> {
  const [activeRow, setActiveRow] = useState(rows.length - 1);

  const defaultValues = {
    strength: 'present',
    source: {
      name: ''
    },
    stageFrom: {
      Name: 'TS16',
      Ordinal: 16
    },
    stageTo: {
      Name: 'P110',
      Ordinal: 110
    },
    pattern: '',
    location: '',
    sourceInvalid: false,
    toStageOptions: stageFrom.slice(17)
  };

  const handleAddRow = () => {
    setRows([...rows, defaultValues]);
  };

  /**
    * Handles changing the input field on change of rows
  */
  useEffect(() => {
    if (rows.length === 0 && stageFrom.length > 0) {
      handleAddRow();
    }
    setActiveRow(rows.length - 1);
    changeFiltersDisplayText();
  }, [rows, stageFrom]);

  /**
    * To add new row on click add button
  */
  useEffect(() => {
    setActiveRow(rows.length - 1);
    setAddClicked(false);
  }, [addClicked]);

  /**
    * setting the left side pane source name to the input field on the right side
  */
  useEffect(() => {
    // Implement the setSourceForFilter function in your React component
    const setSourceForFilter = (sourceObject: any) => {
      // Handle the source object and perform necessary actions
      const updatedRows = [...rows];
      const updatedRow = { ...updatedRows[activeRow], source: sourceObject };
      updatedRow.sourceInvalid = false;
      updatedRows[activeRow] = updatedRow;
      setRows(updatedRows);
    };

    // Assign the setSourceForFilter function to the window object
    windowRef.setSourceForFilter = setSourceForFilter;
    
  }, [rows, activeRow]);

  /**
    * Handles removing row
    * @param {object} e : click event
    * @param {number} index : row index
  */
  const handleRemoveRow = (evt: any, index: any) => {
    const updatedRows = rows.slice(0, index).concat(rows.slice(index + 1));
    setRows(updatedRows);
    evt.stopPropagation();
  };

  /**
    * handles clearing filter
    * @param {object} e : click event
    * @param {number} index : row index
  */
  const handleClearFilter = (e: any, index: number) => {
    const updatedRows = [...rows];
    updatedRows[index] = {
      ...defaultValues
    };
    setRows(updatedRows);
  };

  /**
    * Handles change of every field in the table
    * @param {number} index : row index
    * @param {string} field : column name
    * @param {any} value : changed value
  */
  const handleChange = (index: number, field: string, value: any) => {
    const updatedRows = [...rows];
    const updatedRow = { ...updatedRows[index] };

    if (field === 'stageFrom') {
      updatedRow.stageFrom = { ...updatedRow.stageFrom, Name: value };

      const pos = stageFrom.findIndex((obj: any) => obj.Name === updatedRow.stageFrom.Name);
      updatedRow.toStageOptions = stageFrom.slice(pos);
      updatedRow.stageTo = { ...updatedRow.stageTo, Name: updatedRow.toStageOptions[0].Name, Ordinal: updatedRow.toStageOptions[0].Ordinal };
    } else if (field === 'stageTo') {
      updatedRow.stageTo = { ...updatedRow.stageTo, Name: value };
    } else {
      updatedRow[field] = value;
    }

    updatedRows[index] = updatedRow;
    setRows(updatedRows);
  };

  const handleActiveRow = (e: any, index: any) => {
    setActiveRow(index);
  };

  const columns: any = useMemo(
    () => [
      // Define your columns here
      { Header: '', accessor: 'and' },
      { Header: <span><span className='text-danger'><b>*</b></span><span> Strength</span></span>, accessor: 'strength' },
      { Header: <span><span className='text-danger'><b>*</b></span><span> In Anatomical Source</span></span>, accessor: 'source' },
      { Header: <span><span className='text-danger'><b>*</b></span><span> Stages</span></span>, accessor: 'stages' },
      { Header: 'With Pattern', accessor: 'pattern' },
      { Header: 'At Location', accessor: 'location' },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }: any) => (
          <div className='actions-button-wrapper'>
            <button
              onClick={(e) => handleClearFilter(e, row.index)}
              className='chaise-btn chaise-btn-primary action-button'
              title='Click to remove this filter'
            >
              <span className='fa fa-close'></span>
            </button>
            <button
              onClick={(e) => handleRemoveRow(e, row.index)}
              className={`chaise-btn chaise-btn-primary action-button ${rows.length === 1 ? 'disable-trash' : ''}`}
              title='Click to remove this filter'
            >
              <span className='fa fa-trash'></span>
            </button>
          </div>
        )
      }
    ],
    [rows]
  );

  const data: any = useMemo(
    () =>
      rows?.map((row: any, index: any) => ({
        // Map your rows data here
        and: index === 0 ? '' : 'AND',
        strength: (
          <select
            value={row.strength || defaultValues.strength}
            onChange={(e) => handleChange(index, 'strength', e.target.value)}
          >
            {strength?.map((option: any, index: any) => {
              return <option key={index}>{option.Strength}</option>;
            })}
          </select>
        ),
        source: (
          <>
            <input
              className='red-text'
              value={row.source.name || ''}
              disabled
              required
              onChange={(e) => handleChange(index, 'source', e.target.value)}
            />
            {row.sourceInvalid ? <div className='red-text'>Please enter a value for this field.</div> : <></>}
          </>
        ),
        stages: (
          <>
            <span>From: </span>
            <select
              className='stageDropdown'
              value={row.stageFrom.Name || defaultValues.stageFrom.Name}
              onChange={(e) => handleChange(index, 'stageFrom', e.target.value)}
            >
              {stageFrom?.map((option: any, index: any) => {
                return <option key={index}>{option.Name}</option>;
              })}
            </select>
            <span>To: </span>
            <select
              className='stageDropdown'
              value={row.stageTo.Name || defaultValues.stageTo.Name}
              onChange={(e) => handleChange(index, 'stageTo', e.target.value)}
            >
              {row.toStageOptions?.map((option: any, index: any) => {
                return <option key={index}>{option.Name}</option>;
              })}
            </select>
          </>
        ),
        pattern: (
          <select
            value={row.pattern || defaultValues.pattern || ''}
            onChange={(e) => handleChange(index, 'pattern', e.target.value)}
          >
            <option style={{ display: 'none' }} disabled selected value=''></option>
            {pattern?.map((option: any, index: any) => (
              <option key={index}>{option.Pattern}</option>
            ))}
          </select>
        ),
        location: (
          <select
            value={row.location || defaultValues.location || ''}
            onChange={(e) => handleChange(index, 'location', e.target.value)}
          >
            <option style={{ display: 'none' }} disabled selected value=''></option>
            {location?.map((option: any, index: any) => {
              return (
                <option key={index}>
                  {option.Pattern_Location}
                </option>
              );
            })}
          </select>
        ),
        actions: <button onClick={(e) => handleRemoveRow(e, index)}>Remove</button>
      })),
    [rows, strength, pattern, location, stageFrom, source]
  );

  const tableInstance = useTable({
    columns,
    data
  });
  // Create the table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows: tableRows,
    prepareRow
  } = tableInstance;

  return (
    <div className='form-container'>
      <table {...getTableProps()} className='boolean-table' cellSpacing='10'>
        <tbody {...getTableBodyProps()}>
          {headerGroups.map((headerGroup, key) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={key}>
              {headerGroup.headers.map((column, key) => (
                <th {...column.getHeaderProps()} key={key}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
          {tableRows.map((row, index) => {
            prepareRow(row);
            return (
              <tr className={`${activeRow === index ? 'active-row' : ''}`}
                {...row.getRowProps()} key={index} onClick={(e) => handleActiveRow(e, index)}>
                {row.cells.map((cell, index) => (
                  <td {...cell.getCellProps()} key={index}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BooleanTable;

BooleanTable.propTypes = {
  rows: PropTypes.array.isRequired,
  setRows: PropTypes.func.isRequired,
  strength: PropTypes.array.isRequired,
  pattern: PropTypes.array.isRequired,
  location: PropTypes.any.isRequired,
  stageFrom: PropTypes.any.isRequired,
  source: PropTypes.any.isRequired,
  changeFiltersDisplayText: PropTypes.func.isRequired,
  addClicked: PropTypes.bool.isRequired,
  setAddClicked: PropTypes.func.isRequired,
  handleAddRow: PropTypes.func.isRequired,
};