import { createRoot } from 'react-dom/client';
import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_booleansearch.scss';
// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import TreeView from '@isrd-isi-edu/deriva-webapps/src/components/boolean-search/tree-view';
import BooleanTable from '@isrd-isi-edu/deriva-webapps/src/components/boolean-search/boolean-table';
import Modal from '@isrd-isi-edu/deriva-webapps/src/components/boolean-search/info-modal';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import Title from '@isrd-isi-edu/chaise/src/components/title';
import { CustomError } from '@isrd-isi-edu/chaise/src/models/errors';
// hooks
import { useEffect, useRef, useState, type JSX } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import { useBooleanData, getSourceOptions, headerInfo, getDefaultValues } from '@isrd-isi-edu/deriva-webapps/src/hooks/boolean-search';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';
import { BooleanSearchConfig } from '@isrd-isi-edu/deriva-webapps/src/models/boolean-search-config';
const booleanSearchSettings = {
  appName: 'app/boolean-search',
  appTitle: 'Boolean Search',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};
export type BooleanSearchProps = {
  config: BooleanSearchConfig
};

const BooleanSearchApp = (): JSX.Element => {

  const { dispatchError, errors } = useError();
  const [treeviewOpen, setTreeviewOpen] = useState(true);
  const displayname = {
    value: 'Boolean Search',
    isHTML: true
  }
  const [source, setSource] = useState('p{in "" TS17..TS28}');
  const [booleanSearchProps, setBooleanSearchProps] = useState<BooleanSearchProps | null>(null);
  const [showModal, setShowModal] = useState(false);

  // since we're using strict mode, the useEffect is getting called twice in dev mode
  // this is to guard against it
  const setupStarted = useRef<boolean>(false);
  const [rows, setRows] = useState<any[]>([]);
  const [addClicked, setAddClicked] = useState(false);
  const downloadLinkRef = useRef(null);

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;

    try {
      setBooleanSearchProps({ config: windowRef.booleanSearchConfig });

    } catch (error: any) {
      dispatchError({ error })
    }

  }, []);

  const {
    strengthData,
    stageFromData,
    patternData,
    locationData
  } = useBooleanData();
  
  /**
   * Handles modal opening
   */
  const handleModalOpen = () => {
    setShowModal(true);
  };

 /**
   * Handles modal closing
   */
  const handleModalClose = () => {
    setShowModal(false);
  };

  /**
   * Handles adding row
   */
  const handleAddRow = () => {
    setAddClicked(true);
    const defaultValues = getDefaultValues(stageFromData);
    setRows([...rows, defaultValues]);
  };

  /**
   * Handles toggling left view
   */
  const togglePanel = () => {
    setTreeviewOpen(!treeviewOpen);
  };

  /**
   * Handles changing the search input field
   * @param {any} event- change event
   */
  const changeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSource(event.target.value);
  };

  /**
   * Handles clearing the input field
   */
  const clearSearch = () => {
    setSource('p{in "" TS17..TS28}');
    setRows([]);
  }
  
  /**
   * type for invalid param
   */
  type invalid ={
    strength: any[];
    source: any[];
    fromStage: any[];
    toStage: any[];
    pattern: any[];
    location: any[];
  }
  /**
   * forms the error message
   */
  const formErrorMessage = (invalid: invalid) => {
    let message = '';
    if (invalid.strength.length > 0) {
        message += errorMessageHelper(invalid.strength, 'Strength');
    }
    if (invalid.source.length > 0) {
        message += errorMessageHelper(invalid.source, 'Anatomical Source');
    }
    if (invalid.fromStage.length > 0) {
        message += errorMessageHelper(invalid.fromStage, 'From Stage');
    }
    if (invalid.toStage.length > 0) {
        message += errorMessageHelper(invalid.toStage, 'To Stage');
    }
    if (invalid.pattern.length > 0) {
        message += errorMessageHelper(invalid.pattern, 'Pattern');
    }
    if (invalid.location.length > 0) {
        message += errorMessageHelper(invalid.location, 'Location');
    }
    return message;
  }

  /**
   * Helper function to form the error messgae
   */
  const errorMessageHelper = (param: any[], name: string) => {
    let message = '<li>Invalid "' + name;
    if (param.length > 1) {
        message += '" values : ';
    } else {
        message += '" value : ';
    }

    message += '<b>';
    message += (param.join(', '));
    message += '</b></li>';
    return message;
  }
  /**
   * forms the query for the search
   */
  const formQuery =() => {
    let query = '';
    rows.forEach( (row) => {
        const pattern = row.pattern === '' || row.pattern === null ? '' : '&Pattern=' + row.pattern;
        const location = row.location === '' || row.location === null ? '' : '&Pattern_Location=' + row.location;
        query = query + '/(Stage_ID)=(Vocabulary:Developmental_Stage:ID)/Ordinal::geq::' +
        row.stageFrom.Ordinal + '&Ordinal::leq::' + row.stageTo.Ordinal + '/$M/(RID)=(Specimen_Expression:Specimen)/Strength='
        + encodeURIComponent(row.strength) + pattern + location + '/(Region)=(Vocabulary:Anatomy:ID)/Name='
        + encodeURIComponent(row.source.name) + '/$M';
    });
    const customFacet = {
        'displayname': source,
        'ermrest_path': query
    };
    
    const url = window.location.origin + '/chaise/recordset/' +
    ConfigService.ERMrest.createPath('2', 'Gene_Expression', 'Specimen', null, customFacet)
+ '?pcid=' + headerInfo.cid + '&ppid=' + headerInfo.pid;
    window.open(url, '_blank');
    
  }
  /**
   * calling the chaise custom error model
   */
  const throwCustomError = (header: string, message: string, okActionMessage: string) => {
    throw new CustomError(header, message, undefined, okActionMessage, true);
  }
  const validateOtherParams = (invalidSource: any[], submitQuery: boolean) => {
    let valid = true;
  
    if (invalidSource.length > 0) {
      valid = false;
    }
  
    const invalid: any = {
      strength: [],
      source: invalidSource,
      fromStage: [],
      toStage: [],
      pattern: [],
      location: []
    };
  
    rows.map( (row: any, index: number) => {
      if (!strengthData.some((item: any) => item.Strength === row.strength)) {
        valid = false;
        invalid.strength.push(row.strength);
        row.strengthInvalid = true;
      } else {
        row.strengthInvalid = false;
      }

    if (stageFromData.filter( (fromStage) => {
        return fromStage.Name === row.stageFrom.Name && fromStage.Ordinal === row.stageFrom.Ordinal;
    }).length === 0) {
        valid = false;
        invalid.fromStage.push(row.stageFrom.Name);
        row.stageFromInvalid = true;
    } else {
        row.stageFromInvalid = false;
    }

    if (stageFromData.filter( (toStage) => {
        return toStage.Name === row.stageTo.Name && toStage.Ordinal === row.stageTo.Ordinal;
    }).length === 0) {
        valid = false;
        invalid.toStage.push(row.stageTo.Name);
        row.stageToInvalid = true;
    } else {
        row.stageToInvalid = false;
    }
    if (row.pattern !== '' && !patternData.some((item: any) => item.Pattern === row.pattern)) {
        valid = false;
        invalid.pattern.push(row.pattern);
        row.patternInvalid = true;
    } else {
        row.patternInvalid = false;
    }
    if (row.location !== '' && !locationData.some((item: any) => item.Pattern_Location === row.location)) {
        valid = false;
        invalid.location.push(row.location);
        row.locationInvalid = true;
    } else {
        row.locationInvalid = false;
    }
  
      if (index === rows.length - 1) {
        if (valid) {
          if (submitQuery) {
            formQuery();
          } else {
            alert('All parameters are valid');
          }
        } else {
          let message = 'Following errors exist in the query:<ul>';
          const err = formErrorMessage(invalid);
          message += err;
          message += '</ul>';
          const okActionMessage = 'Click OK to <b>go back</b> to the page.';
          if(row.source.name !== '') {
          throwCustomError('Invalid Query', message, okActionMessage);
          }
      }
      }
    });
    setRows(rows);
  };
  
  const validateSourceParam = (submitQuery: boolean) => {
    const sources: any[] = [];
    rows.forEach( (row) => {
      sources.push(row.source.name);
    });
  
    const invalidSource: any[] = [];
  
    getSourceOptions(sources).then( (data) => {
      rows.map( (row: any) => {
        const match = data.filter( (source: any) => {
          return source.Name === row.source.name;
        });
  
        if (match.length === 0) {
          invalidSource.push(row.source.name);
          if(row.source.name === '') {
            row.sourceInvalid = true;
          } else {
            row.noMatchSource = true;
          }
          
        } else {
          row.sourceInvalid = false;
          row.noMatchSource = false;
          row.source.id = match[0].ID;
        }
  
        return row;
      });
  
      setRows(rows);
  
      validateOtherParams(invalidSource, submitQuery);
    });
  };
  
  

  /**
   * Changes the input field query based on selection of fields in the table
   */
  const changeFiltersDisplayText = () => {
    let displayname = '';
    rows.forEach((row, index) => {
      const pattern = row.pattern || '';
      const location = row.location || '';

      if (index !== 0) {
        displayname += ' AND ';
      }

      // Strength can have 3 values and also the translation is used in parseQueryText()
      switch (row.strength) {
        case 'present':
          displayname += 'p';
          break;
        case 'not detected':
          displayname += 'nd';
          break;
        case 'uncertain':
          displayname += 'u';
          break;
        default: displayname += row.strength
          break;
      }

      displayname += `{in "${row.source?.name}" ${row.stageFrom.Name}..${row.stageTo.Name}`;

      if (pattern !== '') {
        displayname += ` pt=${pattern}`;
      }

      if (location !== '') {
        displayname += ` lc=${location}`;
      }

      displayname += '}';
    });

    setSource(displayname);
  };
  
  const setClass = () => {
    return treeviewOpen ? 'fa fa-caret-left' : 'fa fa-caret-right';
  };

  /**
   * Handles downloading the query to text file
   */
  const handleSaveFilters = () => {
    const filterBlob = new Blob([source], { type: 'text/plain' });
    const fileName = 'booleanQuery.txt';
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(filterBlob);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
  };

  const parseQueryText = (submitQuery: boolean) => {
    const inputQuery = source;
    const filters = inputQuery.split('AND');
    const updatedRows = filters.map((filter, index) => {
      filter = filter.trim();
      let strength;
      switch (filter.substring(0, filter.indexOf('{'))) {
        case 'p':
          strength = 'present';
          break;
        case 'u':
          strength = 'uncertain';
          break;
        case 'nd':
          strength = 'not detected';
          break;
        default:
          strength = filter.substring(0, filter.indexOf('{'));
      }

      if (!rows[index]) {
        const defaultValues = getDefaultValues(stageFromData);
        const row = defaultValues;
        rows[index] = row;
      }

      const row = rows[index];
      row.strength = strength;

      if (row.source.name === null) {
        row.source.name = {};
      }

      const sourceStart = filter.indexOf('\"');
      const sourceEnd = filter.lastIndexOf('\"');
      let sourceName = filter.substring(sourceStart + 1, sourceEnd);

      if (sourceName.indexOf(':') >= 0) {
        const idStart = sourceName.lastIndexOf('(');
        const idEnd = sourceName.lastIndexOf(')');
        const id = sourceName.substring(idStart + 1, idEnd);
        sourceName = sourceName.substring(0, idStart - 1);
        row.source.id = id;
      }

      row.source.name = sourceName;
      const stageCompStart = sourceEnd + 2;
      let stageCompEnd;

      if (filter.indexOf('pt=') !== -1) {
        stageCompEnd = filter.indexOf('pt=') - 1;
      } else if (filter.indexOf('lc=') !== -1) {
        stageCompEnd = filter.indexOf('lc=') - 1;
      } else {
        stageCompEnd = filter.indexOf('}');
      }

      const stageComp = filter.substring(stageCompStart, stageCompEnd);
      const stages = stageComp.split('..');
      const stageFromName = stages.length === 2 ? stages[0] : '';
      let stageFrom;

      for (let i = 0; i < stageFromData.length; i++) {
        if (stageFromData[i].Name === stageFromName) {
          stageFrom = stageFromData[i];
          break;
        }
      }

      if (stageFrom === undefined) {
        row.stageFrom = {
          'Name': stageFromName,
          'Ordinal': -1
        };
      } else {
        row.stageFrom = stageFrom;
      }

      const stageToName = stages.length === 2 ? stages[1].replace('}', '') : '';
      let stageTo;

      for (let i = 0; i < stageFromData.length; i++) {
        if (stageFromData[i].Name === stageToName) {
          stageTo = stageFromData[i];
          break;
        }
      }

      if (stageTo === undefined) {
        row.stageTo = {
          'Name': stageToName,
          'Ordinal': -1
        };
      } else {
        row.stageTo = stageTo;
      }

      let pattern = '';

      if (filter.indexOf('pt=') !== -1) {
        let endPt;
        if (filter.indexOf('lc=') !== -1) {
          endPt = filter.indexOf('lc=') - 1;
        } else {
          endPt = filter.indexOf('}');
        }
        pattern = filter.substring(filter.indexOf('pt=') + 3, endPt);
      }

      row.pattern = pattern;

      let location = '';

      if (filter.indexOf('lc=') !== -1) {
        location = filter.substring(filter.indexOf('lc=') + 3, filter.indexOf('}'));
      }

      row.location = location;

      return row;
    });

    setRows(updatedRows)
    validateSourceParam(submitQuery);
  };

  const handleValidate = (submitQuery: boolean) => {
    parseQueryText(submitQuery);
  }
  // if there was an error during setup, hide the spinner
  if (!booleanSearchProps && errors.length > 0) {
    return <></>;
  }

  if (!booleanSearchProps) {
    return <ChaiseSpinner />;
  }

  return (<>
  <Modal showModal={showModal} handleModalClose={handleModalClose}/>
  <div className='boolean-search-container app-content-container'>
    <div className='top-panel-container'>
      <div className='top-flex-panel'>
        <div className='top-left-panel'>
        <h1><Title displayname={displayname} /></h1>
        </div>
      </div>
    </div>
    <div className='bottom-panel-container'>
      <div className={`resizable-panel resizable ${treeviewOpen ? 'open-panel' : 'close-panel'}`}>
        <div className='treeview-panel'>
          <TreeView />
        </div>
        <div className='resize-btn'>
          <button
          className={`sidePanFiddler chaise-btn chaise-btn-primary ${treeviewOpen ? 'open-panel' : 'close-panel'}`}
          type='button'
          onClick={togglePanel}
          data-toggle='tooltip'
          data-placement='right'
          title={`Click to ${treeviewOpen ? 'hide' : 'show'} treeview`}
          >
            <span className={setClass()}></span>
          </button>
        </div>
   
      </div>
      <div className={`right-panel-container ${!treeviewOpen ? 'right-panel-container-fullwidth' : ''}`}>
        <div className='boolean-header-btn'>
          <div className='search-icons'>
            <div className='chaise-input-group'>
              <div className='chaise-input-control'>
                <input
                  value={source}
                  onChange={changeSearch}
                  className={`main-search-input ${!treeviewOpen ? 'input-fullwidth' : ''}`}
                />
             </div>
              <div className='chaise-input-group-append'>
              <button
                id='clear-filter-btn'
                className='chaise-btn chaise-btn-primary fa fa-close'
                onClick={() => {clearSearch()}}
                type='button'
                data-toggle='tooltip'
                data-placement='auto top'
                title='Clear all filters' />
              </div>
              <div className='chaise-input-group-append'>
              <button
                id='submit-button'
                className='chaise-btn chaise-btn-primary'
                type='submit'
                disabled={false}
                onClick={() => {handleValidate(true)}}
                data-toggle='tooltip'
                title='Submit query to search specimens'>
                Search Specimen
              </button>
              </div>
          </div>
      </div>
      <div className='boolean-action-btn chaise-btn-group'>
          <button
            id='validate-filter-btn'
            className='chaise-btn chaise-btn-primary'
            onClick={() => {handleValidate(false)}}
            type='button'
            data-toggle='tooltip'
            data-placement='auto top'
            title='Validate filters query text'
          >
            <span className='fa fa-check'></span>
          </button>
          <a
            ref={downloadLinkRef}
            style={{ display: 'none' }}
          />
          <button
            id='save-filter-btn'
            className='chaise-btn chaise-btn-primary'
            onClick={() => handleSaveFilters()}
            type='button'
            data-toggle='tooltip'
            data-placement='auto top'
            title='Save entered query as a text file'
          >
            <span className='fa fa-download'></span>
          </button>
          <button
            id='info-btn'
            className='chaise-btn chaise-btn-primary'
            onClick={()=>handleModalOpen()}
            type='button'
            data-toggle='tooltip'
            data-placement='auto top'
            title='Learn more about the app.'
          >
            <span className='fa fa-info-circle'></span>
          </button>
      </div>
      <div className='add-button'>
          <button
            id='create-filter-btn'
            className='chaise-btn chaise-btn-primary'
            onClick={handleAddRow}
            type='button'
            data-toggle='tooltip'
            data-placement='auto top'
            title='Add more search filters'
          >
            <span className='fa fa-plus'></span>
          </button>
      </div>
        
      </div>
      <BooleanTable
        setAddClicked={setAddClicked}
        addClicked={addClicked}
        location={locationData}
        strength={strengthData} 
        pattern={patternData} 
        stageFrom={stageFromData}
        changeFiltersDisplayText={changeFiltersDisplayText}
        rows={rows} 
        setRows={setRows} />
      
      </div>   
    </div>
  </div> 
 </>);
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={booleanSearchSettings} includeNavbar displaySpinner ignoreHashChange>
    <BooleanSearchApp />
  </AppWrapper>
);