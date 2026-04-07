/**
 * Audiogram chart — builds a Plotly figure from the normalized
 * AudiogramMeasurement[] shape. Replaces direct use of ChartWithEffect
 * for the audiogram app so that the chart can render live from the
 * draftRows state owned by AudiogramApp.
 */

import { useMemo, type JSX } from 'react';

import PlotlyChart from '@isrd-isi-edu/deriva-webapps/src/components/plot/plotly-chart';

import {
  type AudiogramMeasurement,
  type Ear,
  presentTestTypes,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';
import { getSymbol } from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-symbols';

type AudiogramChartProps = {
  ear: Ear;
  measurements: AudiogramMeasurement[];
  title: string;
  /** Optional layout overrides from the config (xaxis range, height, etc.). */
  layoutOverride?: any;
};

const DEFAULT_LAYOUT = {
  xaxis: {
    title: { text: 'Frequency (Hz)' },
    type: 'log',
    tickvals: [250, 500, 1000, 2000, 4000, 8000],
    ticktext: ['250', '500', '1000', '2000', '4000', '8000'],
    range: [Math.log10(200), Math.log10(9000)],
    showgrid: true,
    gridcolor: '#ccc',
  },
  yaxis: {
    title: { text: 'Hearing Level (dB HL)' },
    autorange: 'reversed',
    range: [-10, 120],
    showgrid: true,
    gridcolor: '#ccc',
    dtick: 10,
  },
  showlegend: false,
  height: 550,
  margin: { t: 50, b: 60, l: 60, r: 20 },
};

const AudiogramChart = ({
  ear,
  measurements,
  title,
  layoutOverride,
}: AudiogramChartProps): JSX.Element => {
  const traces = useMemo(() => {
    const types = presentTestTypes(measurements, ear);
    const out: any[] = [];

    for (const t of types) {
      const sym = getSymbol(ear, t);
      if (!sym) continue;

      // Filter to this test type and sort by frequency for the line.
      const points = measurements
        .filter((m) => m.ear === ear && m.testType === t && m.level != null)
        .sort((a, b) => a.frequency - b.frequency);

      if (points.length === 0) continue;

      const x = points.map((p) => p.frequency);
      const y = points.map((p) => p.level as number);

      if (sym.mode === 'marker') {
        out.push({
          type: 'scatter',
          mode: sym.connectLine ? 'lines+markers' : 'markers',
          x,
          y,
          marker: {
            symbol: sym.markerSymbol,
            color: sym.color,
            size: 14,
            line: { color: sym.color, width: 2 },
          },
          line: sym.connectLine ? { color: sym.color, width: 2 } : undefined,
          name: sym.label,
          showlegend: false,
          hovertemplate: `${sym.label}<br>%{x} Hz : %{y} dB HL<extra></extra>`,
        });
      } else {
        // Text mode — render the Unicode glyph at each (frequency, level).
        out.push({
          type: 'scatter',
          mode: 'text',
          x,
          y,
          text: x.map(() => sym.textChar || ''),
          textfont: { family: 'Arial Black', size: 18, color: sym.color },
          name: sym.label,
          showlegend: false,
          hovertemplate: `${sym.label}<br>%{x} Hz : %{y} dB HL<extra></extra>`,
        });
      }

      // No-response markers for this test type, drawn as arrow-down.
      const noResp = measurements.filter(
        (m) => m.ear === ear && m.testType === t && m.noResponse && m.level != null,
      );
      if (noResp.length > 0) {
        out.push({
          type: 'scatter',
          mode: 'markers',
          x: noResp.map((m) => m.frequency),
          y: noResp.map((m) => m.level as number),
          marker: {
            symbol: 'arrow-down',
            color: sym.color,
            size: 14,
            line: { color: sym.color, width: 2 },
          },
          name: `${sym.label} (no response)`,
          showlegend: false,
          hovertemplate: `${sym.label} — no response<br>%{x} Hz<extra></extra>`,
        });
      }
    }

    return out;
  }, [ear, measurements]);

  const layout = useMemo(
    () => ({
      ...DEFAULT_LAYOUT,
      ...(layoutOverride || {}),
      title: { text: title },
      xaxis: { ...DEFAULT_LAYOUT.xaxis, ...(layoutOverride?.xaxis || {}) },
      yaxis: { ...DEFAULT_LAYOUT.yaxis, ...(layoutOverride?.yaxis || {}) },
      showlegend: false,
    }),
    [title, layoutOverride],
  );

  return (
    <div className='chart-container'>
      <div className='chart'>
        <PlotlyChart
          className='plotly-chart'
          data={traces}
          layout={layout}
          config={{
            displaylogo: false,
            responsive: true,
            modeBarButtonsToRemove: ['select2d', 'lasso2d'],
          }}
          style={{ width: '100%', height: layout.height }}
          useResizeHandler
        />
      </div>
    </div>
  );
};

export default AudiogramChart;
