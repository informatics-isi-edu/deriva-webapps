/**
 * Audiogram chart: builds a Plotly figure from AudiogramMeasurement[]. Owns the
 * fixed ISO/ASHA display (axes, symbols, colors) so the plot renders the same
 * way regardless of the data or runtime config.
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
};

const DEFAULT_LAYOUT = {
  xaxis: {
    title: { text: 'Frequency (Hz)' },
    type: 'log',
    tickvals: [125, 250, 500, 1000, 2000, 4000, 8000],
    ticktext: ['125', '250', '500', '1000', '2000', '4000', '8000'],
    range: [Math.log10(100), Math.log10(9000)],
    showgrid: true,
    gridcolor: '#ccc',
  },
  yaxis: {
    title: { text: 'Hearing Level (dB HL)' },
    // Fixed reversed scale (soft at top, loud at bottom); never auto-ranges to
    // the data. 128 leaves room for the no-response arrows drawn below 120.
    range: [128, -10],
    autorange: false,
    showgrid: true,
    gridcolor: '#ccc',
    dtick: 10,
  },
  showlegend: false,
  height: 550,
  margin: { t: 50, b: 60, l: 60, r: 20 },
};

const AudiogramChart = ({ ear, measurements }: AudiogramChartProps): JSX.Element => {
  const traces = useMemo(() => {
    const out: any[] = [];

    // AC curve: masked threshold where present, else unmasked. Pushed first so
    // it draws beneath the symbols.
    const acColor = getSymbol(ear, 'air_unmasked')?.color;
    const acByFreq = new Map<number, number>();
    for (const m of measurements) {
      if (m.ear !== ear || m.level == null) continue;
      if (m.testType === 'air_masked') {
        acByFreq.set(m.frequency, m.level);
      } else if (m.testType === 'air_unmasked' && !acByFreq.has(m.frequency)) {
        acByFreq.set(m.frequency, m.level);
      }
    }
    if (acByFreq.size > 1 && acColor) {
      const acFreqs = Array.from(acByFreq.keys()).sort((a, b) => a - b);
      out.push({
        type: 'scatter',
        mode: 'lines',
        x: acFreqs,
        y: acFreqs.map((f) => acByFreq.get(f) as number),
        line: { color: acColor, width: 2 },
        name: 'AC threshold',
        showlegend: false,
        hoverinfo: 'skip',
      });
    }

    for (const t of presentTestTypes(measurements, ear)) {
      const sym = getSymbol(ear, t);
      if (!sym) continue;

      const points = measurements
        .filter((m) => m.ear === ear && m.testType === t && m.level != null)
        .sort((a, b) => a.frequency - b.frequency);

      if (points.length === 0) continue;

      const x = points.map((p) => p.frequency);
      const y = points.map((p) => p.level as number);

      if (sym.mode === 'marker') {
        out.push({
          type: 'scatter',
          mode: 'markers',
          x,
          y,
          marker: {
            symbol: sym.markerSymbol,
            color: sym.color,
            size: 14,
            line: { color: sym.color, width: 2 },
          },
          name: sym.label,
          showlegend: false,
          hovertemplate: `${sym.label}<br>%{x} Hz : %{y} dB HL<extra></extra>`,
        });
      } else {
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

      // No-response: a down-arrow below the base symbol (ASHA convention).
      const noResp = measurements.filter(
        (m) => m.ear === ear && m.testType === t && m.noResponse && m.level != null,
      );
      if (noResp.length > 0) {
        out.push({
          type: 'scatter',
          mode: 'text',
          x: noResp.map((m) => m.frequency),
          y: noResp.map((m) => m.level as number),
          text: noResp.map(() => '↓'),
          textposition: 'bottom center',
          textfont: { family: 'Arial Black', size: 26, color: sym.color },
          name: `${sym.label} (no response)`,
          showlegend: false,
          hovertemplate: `${sym.label}, no response<br>%{x} Hz<extra></extra>`,
        });
      }
    }

    return out;
  }, [ear, measurements]);

  const layout = useMemo(
    () => ({ ...DEFAULT_LAYOUT, title: { text: ear === 'right' ? 'Right Ear' : 'Left Ear' } }),
    [ear],
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
          style={{ width: '100%', height: DEFAULT_LAYOUT.height }}
          useResizeHandler
        />
      </div>
    </div>
  );
};

export default AudiogramChart;
