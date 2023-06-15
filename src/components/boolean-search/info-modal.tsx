import { Modal } from 'react-bootstrap';
import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_modal.scss';
export type InfoModalProps = {
    /**
     * flag to show the modal
     */
    showModal: boolean;
    /**
     * callback close function
     */
    handleModalClose: any;
  };

/**
  * Renders the modal to show the information about boolean app
*/  
const InfoModal = ({ handleModalClose, showModal }: InfoModalProps): JSX.Element => {
  const filterOne = 'p{in &quot;bladder&quot; TS17..TS28 pt=regional lc=dorsal}';
  const filterTwo = 'p{in &quot;artery&quot; TS17..TS28} AND nd{in &quot;arteriole&quot; TS17..TS28}';

  return (
    <>
      <Modal size='lg' show={showModal} onHide={handleModalClose}>
        <Modal.Header className='info-modal-header' closeButton>
        <h3 className='modal-title text-center' id='myModalLabel'/><strong className='header'>How to perform boolean search</strong>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: '80vh', overflowY: 'auto' }} className='modal-body info-modal'>
            <p>There are 2 ways to perform boolean search of scored specimen expression:</p>
            <h4>1. Graphical User Interface (GUI)</h4>
            <ul>
              <li>
                Fill in the search form on the right pane by selecting appropriate values for <strong>Strength</strong>,
                <strong>From and To Developmental Stage</strong>,
                <strong>Pattern</strong>(Optional), and <strong>Pattern Location</strong>(Optional) from the respective
                dropdown options.
              </li>
              <li>
                For the <b>Anatomical Source</b>, select a term displayed in the Treeview (left pane).
                Clicking a term in the Treeview will change the Anatomical Source of the current (highlighted) row.
              </li>
              <li>You can add multiple filter rows by clicking the plus symbol on the top right corner.</li>
              <li>
                When ready, click on <strong>Search Specimen</strong> button to submit the query. If the query contains any
                invalid values then they will be highlighted in the table. If all the values are valid, the resulting Specimen
                recordset page will open in a new tab.
              </li>
              <li>
                Use the <b>Save</b> button to store the query in a text file. This could later be pasted in the textbox to get
                the same results again.
              </li>
            </ul>
            <h4>2. Search String</h4>
            <ul>
              <li>Provide query string consisting of one or more filters.</li>
              <li>
                Click the <b>Validate</b> button to check the validity of all values before submitting the query.
                This would also populate the table with any filters that were added directly in the textbox.
              </li>
              <li>
                When ready, click on <strong>Search Specimen</strong> button to submit the query. If the query contains any
                invalid values then they will be highlighted in the table. If all the values are valid, the resulting Specimen
                recordset page will open in a new tab.
              </li>
              <li>
                Use the <b>Save</b> button to store the query in a text file. This could later be pasted in the textbox to get
                the same results again.
              </li>
            </ul>
            <h4>Format</h4>
            <p>Each filter should conform to the following format:</p>
            <p>
              <code>&lt;strength&gt;{'{in \'anatomical source\' \'from stage\'..\'to stage\' pt=\'pattern\' lc=\'location\'}'}</code>
            </p>
            <p>Multiple filters are combined using the keyword <code>AND</code></p>
            <ul>
              <li>
                <code>&lt;strength&gt;</code> is one of the following symbols: <code>p</code> for present, <code>nd</code> for
                not detected, and <code>u</code> for uncertain.
              </li>
              <li>
                <code>&lt;anatomical source&gt;</code> is the anatomical name (e.g. gonad) shown in the Tree
              </li>
              <li>
                <code>&lt;from stage&gt;</code> and <code>&lt;to stage&gt;</code> identify the search range of specimens.
                Specimens without stage information will not be included.
              </li>
              <li>
                <code>&lt;pattern&gt;</code> should be one of the symbols shown in the drop-down menu under <strong>Pattern</strong> in
                the GUI
              </li>
              <li>
                <code>&lt;location&gt;</code> should be one of the symbols shown in the drop-down menu under <strong>Location</strong> in
                the GUI
              </li>
            </ul>
            <h4>Examples</h4>
            <ul>
              <li>
                One filter: <code dangerouslySetInnerHTML={{ __html: filterOne }} />
              </li>
              <li>
                More than one filter: <code dangerouslySetInnerHTML={{ __html: filterTwo }} />
              </li>
            </ul>
            <h4>Error Handling</h4>
            <p>The following errors could occur when using the app:</p>
            <ul>
              <li>Incorrect formatting of the query in the textbox. Please refer to the examples above.</li>
              <li>
                The <b>Anatomical Source</b> entered in the textbox <strong>does not exist</strong>. This can be resolved by
                searching for the term in the Treeview in the left pane, and use the exact term in the textbox.
              </li>
              <li>
                Invalid values of Strength, Developmental Stages, Pattern or Pattern location. These can be resolved by selecting
                the proper values from the respective dropdowns for each row.
              </li>
            </ul>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default InfoModal;
