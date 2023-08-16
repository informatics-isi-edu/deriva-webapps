import { useRef } from 'react';


import { Plot, plotAreaFraction } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/src/hooks/window-size';
import { useChartData } from '@isrd-isi-edu/deriva-webapps/src/hooks/chart';

// import Chart from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart';
import SelectGrid from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-grid';
import PlotlyChart from '@isrd-isi-edu/deriva-webapps/src/components/plot/plotly-chart';
import RecordsetModal from '@isrd-isi-edu/chaise/src/components/modals/recordset-modal';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import { SelectedRow } from '@isrd-isi-edu/chaise/src/models/recordset';
import SelectorsGrid from '@isrd-isi-edu/deriva-webapps/src/components/plot/selectors-grid';

export type ChartWithEffectProps = {
  config: Plot;
};

// NOTE: Currently only used for violin plots
const ChartWithEffect = ({ config }: ChartWithEffectProps): JSX.Element => {
  const plotlyRef = useRef<any>(null);

  /**
   * Window size of component
   */
  const { width = 0, height = 0 } = useWindowSize();

  // set the width and height of the chart
  const { layout } = config.plotly || {};

  // Add upper bounds to layout width and height for responsive
  const minWidth = 320; // absolute min width
  const minHeight = 600; // absolute min height
  const maxWidth = plotAreaFraction * width; // 95% of viewport, used as max width
  const maxHeight = 0.7 * height; // 70% of viewport, used as min height
  const dynamicStyles: { width: string | number; height: string | number } = {
    width: '100%',
    height: '100%',
  };
  dynamicStyles.width = Math.max(minWidth, Math.min(layout?.width || maxWidth, maxWidth)); // set width to min of VP or given Layout
  dynamicStyles.height = Math.max(minHeight, Math.min(layout?.height || maxHeight, maxHeight)); // set width to min of VP or given Layout

  /**
   * Data that goes into building the chart
   */
  const {
    parsedData,
    selectData,
    selectorData,
    modalProps,
    isModalOpen,
    isFetchSelected,
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
  const handlePlotlyClick = (clickData: { points: any[]; event: MouseEvent }) => {
    const { points } = clickData;
    if (
      !Array.isArray(points) || // points not an array
      points.length < 1 || // points is empty
      !points[0].data // points does not have data
    ) {
      // invalid data point for clicking
      return; // do nothing
    }

    let url = '';
    if (
      points[0].data.graphic_clickable_links && // point has a graphic
      points[0].data.graphic_clickable_links.length > 0 // point has graphic link
    ) {
      // when pointNumber exists we want to use the index of the point to get the link
      if (
        points[0].pointNumber >= 0 &&
        points[0].pointNumber < points[0].data.graphic_clickable_links.length
      ) {
        url = points[0].data.graphic_clickable_links[points[0].pointNumber];
      } else {
        url = points[0].data.graphic_clickable_links[0];
      }
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
    const { data, label, layout } = clickData;
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
      return !layout.disable_default_legend_click;
    }
  };
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
  console.log(selectorData);
  return (
    <div className='chart-container'>
      <div className='chart'>
        {selectData && selectData.length > 0 ? (
          <SelectGrid selectors={selectData} width={dynamicStyles.width} />
        ) : null}
        {selectorData ? (
          <SelectorsGrid selectorConfig={selectorData} />
        ) : null}
        {isParseLoading || isFetchSelected ? (
          <ChaiseSpinner />
        ) : (
          <PlotlyChart
            className='plotly-chart'
            style={dynamicStyles}
            ref={plotlyRef}
            {...parsedData}
            useResizeHandler
          />
        )}
      </div>
      {isModalOpen && modalProps ? (
        <RecordsetModal
          recordsetProps={modalProps.recordsetProps}
          onSubmit={(selectedRows: SelectedRow[]) => {
            handleSubmitModal(selectedRows, modalIndices, modalCell);
          }}
          onClose={handleCloseModal}
        />
      ) : null}
    </div>
  );
};

export default ChartWithEffect;
