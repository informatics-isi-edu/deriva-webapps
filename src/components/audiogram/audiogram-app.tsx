// components
import ChaiseSpinner from '@isrd-isi-edu/chaise/src/components/spinner';
import ChartWithEffect from '@isrd-isi-edu/deriva-webapps/src/components/plot/chart-with-effect';
import AudiogramLegend from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-legend';

// hooks
import usePlot from '@isrd-isi-edu/deriva-webapps/src/hooks/plot';
import { useEffect, type JSX } from 'react';

// models
import { DataConfig, Plot } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

// provider
import PlotlyChartProvider from '@isrd-isi-edu/deriva-webapps/src/providers/plotly-chart';

export type AudiogramAppProps = {
  config: DataConfig;
};

function patchShowLegend(plot: Plot): Plot {
  return {
    ...plot,
    plotly: {
      ...plot.plotly,
      layout: {
        ...plot.plotly?.layout,
        showlegend: false,
      },
    },
  };
}

const AudiogramApp = ({ config }: AudiogramAppProps): JSX.Element => {
  const { setConfig, globalControlsInitialized } = usePlot();

  useEffect(() => {
    setConfig(config);
  }, []);

  if (!globalControlsInitialized) {
    return <ChaiseSpinner />;
  }

  const rightPlot = patchShowLegend(config.plots[0]);
  const leftPlot = patchShowLegend(config.plots[1]);

  return (
    <div className='audiogram-page'>
      <div className='audiogram-layout'>
        <div className='audiogram-ear audiogram-right-ear'>
          <PlotlyChartProvider>
            <ChartWithEffect config={rightPlot} />
          </PlotlyChartProvider>
        </div>
        <div className='audiogram-legend-col'>
          <AudiogramLegend
            rightTrace={rightPlot.traces[0]}
            leftTrace={leftPlot.traces[0]}
          />
        </div>
        <div className='audiogram-ear audiogram-left-ear'>
          <PlotlyChartProvider>
            <ChartWithEffect config={leftPlot} />
          </PlotlyChartProvider>
        </div>
      </div>
    </div>
  );
};

export default AudiogramApp;
