import React from 'react';

// hooks
import { useLayoutEffect, useEffect, useRef } from 'react';

// utils
import { attachContainerHeightSensors } from '@isrd-isi-edu/chaise/src/utils/ui-utils';

const TreeviewContainer = (): JSX.Element => {
  /**
 * make sure the setup is done only once
   */
  const setupStarted = useRef<boolean>(false);

  // properly set scrollable section height
  useEffect(() => {
    const resizeSensors = attachContainerHeightSensors();

    return () => {
      resizeSensors?.forEach((rs) => !!rs && rs.detach());
    }
  }, []);

  return (
    <div className='treeview-container app-content-container'>
      <div className='top-panel-container'>
        <div className='top-flex-panel'>
          <div className='top-left-panel close-panel closable-panel'></div>
          <div className='top-right-panel'>
            {/* TODO */}
            header
          </div>
        </div>
      </div>
      <div className='bottom-panel-container'>
        <div className='side-panel-resizable resizable close-panel closable-panel'>
          <div className='side-panel-container'>
            {/* TODO */}
            side panel that is currently closed
          </div>
        </div>
        <div className='main-container dynamic-padding'>
          <div className='main-body'>
            {/* TODO */}
            content
          </div>
        </div>
      </div>
    </div>
  )
}

export default TreeviewContainer;
