import { createRoot } from 'react-dom/client';

// components
import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import Legend from '@isrd-isi-edu/deriva-webapps/src/components/matrix/legend';
import VirtualizedGrid from '@isrd-isi-edu/deriva-webapps/src/components/matrix/virtualized-grid';

// hooks
import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/hooks/window-size';
import { useMatrixData } from '@isrd-isi-edu/deriva-webapps/hooks/matrix';

// utilities
import { ID_NAMES } from '@isrd-isi-edu/chaise/src/utils/constants';
import { windowRef } from '@isrd-isi-edu/deriva-webapps/src/utils/window-ref';

const matrixSettings = {
  appName: 'app/matrix',
  appTitle: 'Matrix',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false,
};

const MatrixApp = (): JSX.Element => {
  const { width = 0, height = 0 } = useWindowSize();
  const { matrixData, errors } = useMatrixData(windowRef.matrixConfigs);

  // if there was an error during setup, hide the spinner
  if (!matrixData && errors.length > 0) {
    return <></>;
  }

  if (!matrixData) {
    return <ChaiseSpinner />;
  }

  const { gridData, legendData } = matrixData;

  // layout values:
  const minHorizontalCells = 30;
  const minVerticalCells = 20;
  const rowHeaderWidth = 300;
  const columnHeaderHeight = 50;
  const bufferWidth = 20;
  const cellHeight = 25;
  const cellWidth = 25;
  const widthBufferSpace = 50;
  const heightBufferSpace = 350;
  const gridHeight = Math.min(
    height - columnHeaderHeight - heightBufferSpace,
    columnHeaderHeight + cellHeight * minVerticalCells
  );
  const gridWidth = Math.min(
    width - rowHeaderWidth - widthBufferSpace,
    rowHeaderWidth + cellWidth * minHorizontalCells
  );
  const legendWidth = gridWidth + rowHeaderWidth;
  const legendHeight = 170;
  const legendItemSize = 55;

  return (
    <div className='matrix-page'>
      <div className='title-container'>
        <h1>Mouse Data Summary</h1>
        <p>Click a cell or label to see the related datasets..</p>
      </div>
      <div className='matrix-container'>
        <VirtualizedGrid
          gridHeight={gridHeight}
          gridWidth={gridWidth}
          bufferWidth={bufferWidth}
          rowHeaderWidth={rowHeaderWidth}
          columnHeaderHeight={columnHeaderHeight}
          cellHeight={cellHeight}
          cellWidth={cellWidth}
          data={gridData}
        />
        <Legend
          width={legendWidth}
          height={legendHeight}
          itemSize={legendItemSize}
          data={legendData}
        />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById(ID_NAMES.APP_ROOT) as HTMLElement);
root.render(
  <AppWrapper appSettings={matrixSettings} includeNavbar displaySpinner ignoreHashChange>
    <MatrixApp />
  </AppWrapper>
);
