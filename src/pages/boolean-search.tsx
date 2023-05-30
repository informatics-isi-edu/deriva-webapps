import { createRoot } from 'react-dom/client';
import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_booleansearch.scss';
// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import TreeView from '@isrd-isi-edu/deriva-webapps/src/components/boolean-search/tree-view';
import BooleanTable from '@isrd-isi-edu/deriva-webapps/src/components/boolean-search/boolean-table';
import Modal from '@isrd-isi-edu/deriva-webapps/src/components/boolean-search/info-modal';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

// hooks
import { useEffect, useRef, useState } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import DisplayValue from '@isrd-isi-edu/chaise/src/components/display-value';
import { useBooleanData, getSourceOptions, headerInfo } from '@isrd-isi-edu/deriva-webapps/src/hooks/boolean-search';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

const booleanSearchSettings = {
  appName: 'app/boolean-search',
  appTitle: 'Boolean Search',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};
export type BooleanSearchProps = {
  config: any
};

const BooleanSearchApp = (): JSX.Element => {

  const { dispatchError, errors } = useError();
  const [treeviewOpen, setTreeviewOpen] = useState(true);

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
    const newRow = {
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
      toStageOptions: stageFromData.slice(17)
    };
    setAddClicked(true);
    setRows([...rows, newRow]);
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
  const changeSearch = (event: any) => {
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
   * forms the query for the search
   */
  const formQuery =() => {
    let query = '';
    rows.forEach(function (row) {
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

  const validateOtherParams = (invalidSource: any, submitQuery: boolean) => {
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
  
    rows.forEach(function (row: any, index: number) {
      if (!strengthData.some((item: any) => item.Strength === row.strength)) {
        valid = false;
        invalid.strength.push(row.strength);
        row.strengthInvalid = true;
      } else {
        row.strengthInvalid = false;
      }
  
      if (index === rows.length - 1) {
        if (valid) {
          if (submitQuery) {
            formQuery();
          } else {
            alert('All parameters are valid');
          }
        }
      }
    });
  };
  
  const validateSourceParam = (submitQuery: boolean) => {
    const sources: any[] = [];
    rows.forEach(function (row) {
      sources.push(row.source.name);
    });
    
    const invalidSource: any[] = [];
    
    getSourceOptions(sources).then(function (data) {
      rows.map(function (row: any, index: any) {
        const updatedRows = [...rows];
        const updatedRow = { ...updatedRows[index] };
        const match = data.filter(function (source: any) {
          return source.Name === row.source.name;
        });
  
        if (match.length === 0) {
          invalidSource.push(row.source.name);
          
          
        updatedRow['sourceInvalid'] = true;
        updatedRows[index] = updatedRow;
        setRows(updatedRows);
        } else {
         
          updatedRow['sourceInvalid'] = false;
          updatedRow['source']['id'] =  match[0].ID;
        updatedRows[index] = updatedRow;
          setRows(updatedRows);
        }
  
        if (index === rows.length - 1) {
          validateOtherParams(invalidSource, submitQuery);
        }
      });
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
      }

      displayname += `{in '${row.source?.name}' ${row.stageFrom.Name}..${row.stageTo.Name}`;

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
    return treeviewOpen ? 'fa fa-chevron-left' : 'fa fa-chevron-right';
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

      const row = rows[index];
      row.strength = strength;

      if (row.source.name === null) {
        row.source.name = {};
      }

      const sourceStart = filter.indexOf('\'');
      const sourceEnd = filter.lastIndexOf('\'');
      let sourceName = filter.substring(sourceStart + 1, sourceEnd);

      if (sourceName.indexOf(':') >= 0) {
        const idStart = sourceName.lastIndexOf('(');
        const idEnd = sourceName.lastIndexOf(')');
        const id = sourceName.substring(idStart + 1, idEnd);
        sourceName = sourceName.substring(0, idStart - 1);
        row.source.id = id;
      }

      if(row.source && row.source.name) {
        row.source.name = sourceName;
      }
      

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
      const stageFromName = stages.length === 2 ? stages[0] : 'unknown';
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

      const stageToName = stages.length === 2 ? stages[1].replace('}', '') : 'unknown';
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
  <div className='boolean-container'>
    <div className='title-container'>
        <h1>
           <DisplayValue addClass value={{ value: 'Boolean Search', isHTML: true }} />
        </h1>
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
            <input
              value={source}
              onChange={changeSearch}
              className={`main-search-input ${!treeviewOpen ? 'input-fullwidth' : ''}`}
            />
            <button
              id='clear-filter-btn'
              className='chaise-btn chaise-btn-primary fa fa-close'
              onClick={() => {clearSearch()}}
              type='button'
              data-toggle='tooltip'
              data-placement='auto top'
              title='Clear all filters' />
            <button
              id='submit-button'
              className='chaise-btn chaise-btn-primary'
              type='submit'
              disabled={false}
              onClick={() => {handleValidate(true)}}
              data-toggle='tooltip'
              title='Submit query to search specimens'
          >
            Search Specimen
          </button>
      </div>
      <div className='boolean-action-btn'>
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
        source={source}
        setAddClicked={setAddClicked}
        addClicked={addClicked}
        location={locationData}
        strength={strengthData} 
        pattern={patternData} 
        stageFrom={stageFromData}
        changeFiltersDisplayText={changeFiltersDisplayText}
        handleAddRow={handleAddRow} 
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