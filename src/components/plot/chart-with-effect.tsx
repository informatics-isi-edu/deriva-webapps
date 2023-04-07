import { Plot } from '@isrd-isi-edu/deriva-webapps/src/models/plot-config';

import { useWindowSize } from '@isrd-isi-edu/deriva-webapps/src/hooks/window-size';
import { useChartData } from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';

import Chart from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart';
import RecordsetModal from '@isrd-isi-edu/chaise/src/components/modals/recordset-modal';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

export type ChartWithEffectProps = {
  config: Plot;
};

const ChartWithEffect = ({ config }: ChartWithEffectProps): JSX.Element => {
  /**
   * Window size of component
   */
  const { width = 0, height = 0 } = useWindowSize();

  /**
   * Data that goes into the chart
   */
  const { parsedData, selectData, modalProps, isDataLoading, isParseLoading, isInitLoading } =
    useChartData(config);

  if (!parsedData || isInitLoading) {
    return <ChaiseSpinner />;
  }

  const { layout } = config.plotly || {};
  const minWidth = 800;
  const minHeight = 600;
  const layoutWidth = Math.max(minWidth, layout?.width || 0.8 * width);
  const layoutHeight = Math.max(minHeight, layout?.height || 0.7 * height);
  parsedData.layout.width = layoutWidth;
  parsedData.layout.height = layoutHeight;

  const isModalOpen = modalProps ? true : false;


  // TODO: incorrect way of changing a state. change the way this is done.
  if (modalProps && selectData) {
    const [i, j] = modalProps.indices;
    modalProps.recordsetProps.initialSelectedRows = selectData[i][j].selectedRows;
  }

  return (
    <div>
      <Chart
        isChartLoading={isDataLoading || isParseLoading}
        selectors={selectData}
        plotlyProps={parsedData}
      />
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

export default ChartWithEffect;
