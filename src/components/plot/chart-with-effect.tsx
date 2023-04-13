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
   * Data that goes into the chart
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
    console.log('onClick Plotly', points);
    if (
      !Array.isArray(points) || //  points not an array
      points.length !== 1 || // points not a single point
      !points[0].data // points does not have data
    ) {
      return; // do nothing
    }
    let url = '';
    if (
      points[0].pointNumber && // point has an index
      points[0].data.graphic_clickable_links && // point has a graphic
      points[0].data.graphic_clickable_links[points[0].pointNumber] // point has graphic link
    ) {
      url = points[0].data.graphic_clickable_links[points[0].pointNumber];
    } else if (points[0].uri) {
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
    console.log('onLegendClick Plotly', clickData);
    const { data, label } = clickData;
    if (
      !Array.isArray(data) || //  points not an array
      data.length !== 1 || // points not a single point
      !data[0]
    ) {
      return; // do nothing
    }
    let url = '';
    if (label && Array.isArray(data[0].labels) && data[0].legend_clickable_links) {
      url = data[0].legend_clickable_links[data[0].labels.indexOf(label)];
    } else if (
      data[0].legend &&
      data[0].legend.length === 1 &&
      data[0].legend_clickable_links &&
      data[0].legend_clickable_links.length > 0
    ) {
      url = data[0].legend_clickable_links[0];
    }

    if (url) {
      window.open(url, '_blank');
      return false;
    }
  };

  const { layout } = config.plotly || {};
  const minWidth = 800;
  const minHeight = 600;
  const layoutWidth = Math.max(minWidth, layout?.width || 0.8 * width);
  const layoutHeight = Math.max(minHeight, layout?.height || 0.7 * height);
  parsedData.layout.width = layoutWidth;
  parsedData.layout.height = layoutHeight;
  parsedData.onClick = handlePlotlyClick;
  parsedData.onLegendClick = handlePlotlyLegendClick;

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
