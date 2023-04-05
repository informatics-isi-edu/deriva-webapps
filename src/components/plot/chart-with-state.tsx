import { Plot } from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';

import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/src/hooks/window-size';
import { useChartData } from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

import Chart from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart';
import RecordsetModal from '@isrd-isi-edu/chaise/src/components/modals/recordset-modal';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import {
  RecordsetSelectMode,
  RecordsetDisplayMode,
} from '@isrd-isi-edu/chaise/src/models/recordset';
import { LogService } from '@isrd-isi-edu/chaise/src/services/log';
import { LogStackPaths } from '@isrd-isi-edu/chaise/src/models/log';

export type ChartWithStateProps = {
  config: Plot;
};

const ChartWithState = ({ config }: ChartWithStateProps): JSX.Element => {
  /**
   * Window size of component
   */
  const { width = 0, height = 0 } = useWindowSize();

  /**
   * Data that goes into the chart
   */
  const { parsedData, selectData, modalProps, isPlotLoading, isInitLoading } = useChartData(config);


  // TODO: chart vs selectors loading
  if (!parsedData || isPlotLoading || isInitLoading) {
    return <ChaiseSpinner />;
  }

  const { layout } = config.plotly || {};
  const minWidth = 800;
  const minHeight = 600;
  const layoutWidth = Math.max(minWidth, layout?.width || 0.8 * width);
  const layoutHeight = Math.max(minHeight, layout?.height || 0.8 * height);
  parsedData.layout.width = layoutWidth;
  parsedData.layout.height = layoutHeight;

  const isModalOpen = modalProps ? true : false;

  return (
    <div>
      <Chart selectors={selectData} plotlyProps={parsedData} />
      {isModalOpen && (
        <RecordsetModal
          recordsetProps={modalProps.recordsetProps}
          onSubmit={modalProps.onSubmitModal}
          onClose={modalProps.onCloseModal}
        />
      )}
    </div>
  );
};

export default ChartWithState;
