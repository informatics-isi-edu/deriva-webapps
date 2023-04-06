import { memo } from 'react';
import Plotly from 'plotly.js-cartesian-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import SelectGrid from '@isrd-isi-edu/deriva-webapps/src/components/plot/select-grid';
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';

const PlotlyChart = createPlotlyComponent(Plotly);

export type ChartProps = {
  isChartLoading?: boolean;
  selectors?: any;
  plotlyProps: any;
};

const Chart = ({ selectors, plotlyProps, isChartLoading }: ChartProps): JSX.Element => {
  console.log('ISCHARTLOADING', isChartLoading);

  return (
    <div className='chart'>
      {selectors && selectors.length > 0 ? (
        <SelectGrid selectors={selectors} width={plotlyProps.layout.width} />
      ) : null}
      {isChartLoading ? (
        <ChaiseSpinner />
      ) : (
        <PlotlyChart className='plotly-chart' {...plotlyProps} />
      )}
    </div>
  );
};

export default memo(Chart);
