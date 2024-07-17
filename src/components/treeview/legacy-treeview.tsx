import Alert from 'react-bootstrap/Alert';

// hooks
import { useLayoutEffect, useEffect, useRef } from 'react';

// utils
import { TreeViewLegacyCode } from '@isrd-isi-edu/deriva-webapps/src/utils/legacy-treeview';
import { attachContainerHeightSensors } from '@isrd-isi-edu/chaise/src/utils/ui-utils';
import Modal from 'bootstrap/js/dist/Modal';

const LegacyTreeViewApp = (): JSX.Element => {
  /**
 * make sure the setup is done only once
   */
  const setupStarted = useRef<boolean>(false);

  // using layoutEffect to make sure the DOM is available for the jQuery code
  useLayoutEffect(() => {
    // run this setup only once
    if (setupStarted.current) return;
    setupStarted.current = true;
    TreeViewLegacyCode();
  }, []);

  // properly set scrollable section height
  useEffect(() => {
    const resizeSensors = attachContainerHeightSensors();

    return () => {
      resizeSensors?.forEach((rs) => !!rs && rs.detach());
    }
  }, []);

  const hideNoSearchResultAlert = () => {
    const alert = document.querySelector('#no-search-result-alert') as HTMLElement;
    alert!.style.display = 'none';
  }

  return (
    <div className='treeview-container app-content-container'>
      <div className='row' style={{ display: 'block', paddingTop: '20px' }}>
        <div className='tree-panel' style={{ height: '100%', overflow: 'auto' }}>
          <div className='top-panel-container'>
            <div className='top-flex-panel'>
              <div className='top-left-panel close-panel closable-panel'></div>
              <div className='top-right-panel'>
                <div id='anatomyHeading'>
                  <h3></h3>
                </div>
                <div id='parent'>
                  <div id='filterDropDown'>
                    <select name='number' id='number'></select>
                  </div>
                  <div id='searchDiv' className='input-group' style={{ visibility: 'hidden', width: 'auto' }}>
                    <input type='text' id='main-search-input' className='input' placeholder='Search'></input>
                    <button type='button' id='reset_text' className='btn btn-primary btn-inverted input-btn'>
                      <span className='fa-solid fa-xmark' ></span>
                    </button>
                    <button type='button' id='search_btn' className='btn btn-primary btn-inverted input-btn'>
                      <span className='fa-solid fa-magnifying-glass'></span>
                    </button>
                    <div id='expandCollapse' className='btn-group' style={{ visibility: 'hidden' }}>
                      <button type='button' id='expand_all_btn' className='btn btn-primary btn-inverted'>Expand
                        All</button>
                      <button type='button' id='collapse_all_btn' className='btn btn-primary btn-inverted'>Collapse
                        All</button>
                    </div>
                  </div>
                </div>
                <p id='error-message' className='alert alert-dismissible alert-danger' style={{ display: 'none', marginLeft: '5px' }}>
                  <button type='button' className='close'><span aria-hidden='true'>&times;</span></button>
                  <strong>Error</strong> <span id='alert-error-text'></span>
                </p>
                <p id='warning-message' className='alert alert-dismissible alert-warning' style={{ display: 'none', marginLeft: '5px' }}>
                  <button type='button' className='close'><span aria-hidden='true'>&times;</span></button>
                  <strong>Warning</strong> <span id='alert-warning-text'></span>
                </p>
                <div id='no-search-result-alert' className='alert alert-warning alert-dismissible' role='alert' style={{ display: 'none' }}>
                  <span id='no-search-result-alert-content'>No maching results were found.</span>
                  <button type="button" className="btn-close" onClick={hideNoSearchResultAlert}></button>
                </div>
              </div>
            </div>
          </div>
          <div className='bottom-panel-container'>
            <div className='side-panel-resizable resizable close-panel closable-panel'>
              <div className='side-panel-container'>
                <div id='look-up'>
                  <div className='panel-group'>
                    <div className='panel panel-default'>
                      <div className='panel-heading'>
                        <h4 className='panel-title'>
                          <a id='facets-1-heading' className='facet-heading-link'><span className='pull-left fa-solid fa-chevron-down'></span> Strength</a>
                        </h4>
                      </div>
                      <div id='facets-1' className='panel-collapse'>
                        <ul className='list-group'>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(unspecifiedStrength).gif' className='icon' />
                            <span className='plaintext'>Present (unspecified strength)</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(strong).gif' className='icon' />
                            <span className='plaintext'>Present (strong)</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(moderate).gif' className='icon' />
                            <span className='plaintext'>Present (moderate)</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(weak).gif' className='icon' />
                            <span className='plaintext'>Present (weak)</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionStrengthsKey/Uncertain.gif' className='icon' />
                            <span className='plaintext'>Uncertain</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionStrengthsKey/notDetected.gif' className='icon' />
                            <span className='plaintext'>Not Detected</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className='panel panel-default'>
                      <div className='panel-heading'>
                        <h4 className='panel-title'>
                          <a id='facets-2-heading' className='facet-heading-link'><span className='pull-left toggle-icon fa-solid fa-chevron-down'></span> Pattern</a>
                        </h4>
                      </div>
                      <div id='facets-2' className='panel-collapse'>
                        <ul className='list-group'>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionPatternKey/Homogeneous.png' className='icon' />
                            <span className='plaintext'>Homogeneous</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionPatternKey/Graded.png' className='icon' />
                            <span className='plaintext'>Graded</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionPatternKey/Regional.png' className='icon' />
                            <span className='plaintext'>Regional</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionPatternKey/Spotted.png' className='icon' />
                            <span className='plaintext'>Spotted</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionPatternKey/Ubiquitous.png' className='icon' />
                            <span className='plaintext'>Ubiquitous</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionPatternKey/Restricted.png' className='icon' />
                            <span className='plaintext'>Restricted</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/ExpressionMapping/ExpressionPatternKey/SingleCell.png' className='icon' />
                            <span className='plaintext'>Single cell</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className='panel panel-default'>
                      <div className='panel-heading'>
                        <h4 className='panel-title'>
                          <a id='facets-3-heading' className='facet-heading-link'><span className='pull-left toggle-icon fa-solid fa-chevron-down'></span> Density</a>
                        </h4>
                      </div>
                      <div id='facets-3' className='panel-collapse'>
                        <ul className='list-group'>
                          <li className='list-group-item'>
                            <img src='resources/images/NerveDensity/RelativeToTotal/high.png' className='icon' />
                            <span className='plaintext'>High</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/NerveDensity/RelativeToTotal/medium.png' className='icon' />
                            <span className='plaintext'>Medium</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/NerveDensity/RelativeToTotal/low.png' className='icon' />
                            <span className='plaintext'>Low</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className='panel panel-default'>
                      <div className='panel-heading'>
                        <h4 className='panel-title'>
                          <a id='facets-4-heading' className='facet-heading-link'><span className='pull-left toggle-icon fa-solid fa-chevron-down'></span> Density Change</a>
                        </h4>
                      </div>
                      <div id='facets-4' className='panel-collapse'>
                        <ul className='list-group'>
                          <li className='list-group-item'>
                            <img src='resources/images/NerveDensity/RelativeToP0/inc_large.png' className='icon' />
                            <span className='plaintext'>Increase, large</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/NerveDensity/RelativeToP0/inc_small.png' className='icon' />
                            <span className='plaintext'>Increase, small</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/NerveDensity/RelativeToP0/dec_large.png' className='icon' />
                            <span className='plaintext'>Decrease, large</span>
                          </li>
                          <li className='list-group-item'>
                            <img src='resources/images/NerveDensity/RelativeToP0/dec_small.png' className='icon' />
                            <span className='plaintext'>Decrease, small</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className='panel panel-default'>
                      <div className='panel-heading'>
                        <h4 className='panel-title'>
                          <img src='resources/images/NerveDensity/note.gif' className='icon' />
                          <span className='plaintext'>Contains note</span>
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='main-container dynamic-padding'>
              <div className='main-body'>
                <div className='loader' id='loadIcon' style={{ visibility: 'hidden' }}></div>
                <div id='jstree' style={{ visibility: 'hidden' }}></div>
                <div className='btn btn-primary btn-inverted back-to-top' style={{ display: 'none' }}>
                  <i className='fa-solid fa-caret-up'></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id='schematic-modal' className='modal fade' tabIndex={-1} role='dialog' aria-hidden='true'>
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='center-aligned-title modal-header'>
              <h3 id='schematic-title' className='modal-title'>Some image</h3>
              <button
                className='chaise-btn chaise-btn-secondary modal-close modal-close-absolute'
                id='schematic-modal-close-btn' type='button' data-dismiss='modal' aria-label='Close'
              >
                <strong className='chaise-btn-icon'>X</strong><span>Close</span>
              </button>
            </div>
            <div className='modal-body'>
              <img width='500px'></img>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegacyTreeViewApp;
