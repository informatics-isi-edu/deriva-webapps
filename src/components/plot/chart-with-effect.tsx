import { useRef } from 'react';

import { Plot } from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';

import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/src/hooks/window-size';
import { useChartData } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';

// import Chart from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart';
import SelectGrid from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-grid';
import PlotlyChart from '@isrd-isi-edu/deriva-webapps/src/components/plot/plotly-chart';
import RecordsetModal from '@isrd-isi-edu/chaise/src/components/modals/recordset-modal';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import { SelectedRow } from '@isrd-isi-edu/chaise/src/models/recordset';

export type ChartWithEffectProps = {
  config: Plot;
};

const ChartWithEffect = ({ config }: ChartWithEffectProps): JSX.Element => {
  const plotlyRef = useRef<any>(null);

  /**
   * Window size of component
   */
  const { width = 0, height = 0 } = useWindowSize();

  /**
   * Data that goes into building the chart
   */
  const {
    parsedData,
    selectData,
    modalProps,
    isModalOpen,
    isDataLoading,
    isParseLoading,
    isInitLoading,
    handleCloseModal,
    handleSubmitModal,
  } = useChartData(config);

  if (!parsedData || isInitLoading) {
    return <ChaiseSpinner />;
  }

  /**
   * Handles the behavior when a graphic is clicked
   */
  const handlePlotlyClick = ({ points }: { points: any[]; event: MouseEvent }) => {
    if (
      !Array.isArray(points) || //  points not an array
      points.length !== 1 || // points not a single point
      !points[0].data // points does not have data
    ) {
      // invalid data point for clicking
      return; // do nothing
    }

    let url = '';
    if (
      points[0].pointNumber && // point has an index
      points[0].data.graphic_clickable_links && // point has a graphic
      points[0].data.graphic_clickable_links[points[0].pointNumber] // point has graphic link
    ) {
      // when pointNumber exists we want to use the index of the point to get the link
      url = points[0].data.graphic_clickable_links[points[0].pointNumber];
    } else if (points[0].uri) {
      // when pointNumber does not exist we want to use the uri
      url = points[0].uri;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  /**
   * Handles the behavior when a graphic is clicked
   */
  const handlePlotlyLegendClick = (clickData: any) => {
    const { data, label } = clickData;
    if (
      !Array.isArray(data) || //  points not an array
      data.length !== 1 || // points not a single point
      !data[0]
    ) {
      // invalid legend for clicking
      return; // do nothing
    }
    let url = '';
    if (label && Array.isArray(data[0].labels) && data[0].legend_clickable_links) {
      // when a label exists we want to use the index of the label to get the link
      url = data[0].legend_clickable_links[data[0].labels.indexOf(label)];
    } else if (data[0].legend_clickable_links && data[0].legend_clickable_links.length > 0) {
      // when a label does not exist we want to use the first link in the array
      url = data[0].legend_clickable_links[0];
    }

    if (url) {
      window.open(url, '_blank');
      return false;
    }
  };

  // set the width and height of the chart
  const { layout } = config.plotly || {};
  const minWidth = 800;
  const minHeight = 600;
  const layoutWidth = Math.max(minWidth, layout?.width || 0.8 * width);
  const layoutHeight = Math.max(minHeight, layout?.height || 0.7 * height);
  parsedData.layout.width = layoutWidth;
  parsedData.layout.height = layoutHeight;

  // set click handlers for chart
  parsedData.onClick = handlePlotlyClick; // append click handler to the chart
  parsedData.onLegendClick = handlePlotlyLegendClick; // append legend click handler to the chart

  // set modal data
  let modalIndices: number[] = [0, 0];
  let modalCell: any = null;
  if (modalProps && selectData) {
    const [i, j] = modalProps.indices;
    modalIndices = modalProps.indices;
    modalCell = selectData[i][j];

    // TODO: incorrect way of modifying a state. change the way this is done.
    if (modalCell.isMulti) {
      modalProps.recordsetProps.initialSelectedRows = selectData[i][j].selectedRows;
    }
  }

  return (
    <div>
      <div className='chart'>
        {selectData && selectData.length > 0 ? (
          <SelectGrid selectors={selectData} width={parsedData.layout.width} />
        ) : null}
        {isDataLoading || isParseLoading ? (
          <ChaiseSpinner />
        ) : (
          <PlotlyChart className='plotly-chart' ref={plotlyRef} {...parsedData} />
        )}
      </div>
      {isModalOpen && modalProps ? (
        <RecordsetModal
          recordsetProps={modalProps.recordsetProps}
          onSubmit={(selectedRows: SelectedRow[]) => {
            console.log('onSubmit func in recordsetmodal', selectedRows);
            handleSubmitModal(selectedRows, modalIndices, modalCell);
          }}
          onClose={handleCloseModal}
        />
      ) : null}
    </div>
  );
};

export default ChartWithEffect;
