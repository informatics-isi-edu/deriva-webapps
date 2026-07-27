/**
 * Center-column symbol key. Renders straight from AUDIOGRAM_SYMBOLS (the same
 * source the chart uses), so the legend and the plot can never disagree. One
 * row per test type plus a shared "No Response" row (a down-arrow, since
 * no-response is a modifier on any symbol, not a test type of its own).
 */

import { type JSX } from 'react';

import { TABLE_TEST_TYPES } from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';
import {
  getSymbol,
  type SymbolSpec,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-symbols';

const SYMBOL_SIZE = 22;

/** A Unicode glyph (bone-conduction brackets, the no-response arrow) in a color. */
function renderTextGlyph(char: string, color: string): JSX.Element {
  return (
    <span
      style={{
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color,
        display: 'inline-block',
        minWidth: SYMBOL_SIZE,
        textAlign: 'center',
        lineHeight: 1,
      }}
    >
      {char}
    </span>
  );
}

/** The ISO/ASHA marker shapes AUDIOGRAM_SYMBOLS actually uses, drawn as SVG. */
function renderMarkerSVG(markerSymbol: string, color: string): JSX.Element {
  const size = SYMBOL_SIZE;
  const center = size / 2;
  const r = center - 3;

  let inner: JSX.Element;
  switch (markerSymbol) {
    case 'circle-open':
      inner = <circle cx={center} cy={center} r={r} fill='none' stroke={color} strokeWidth={2} />;
      break;
    case 'triangle-up-open':
      inner = (
        <polygon
          points={`${center},3 ${size - 3},${size - 3} 3,${size - 3}`}
          fill='none'
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'square-open':
      inner = (
        <rect x={3} y={3} width={size - 6} height={size - 6} fill='none' stroke={color} strokeWidth={2} />
      );
      break;
    case 'x':
    case 'x-thin':
      inner = (
        <>
          <line x1={3} y1={3} x2={size - 3} y2={size - 3} stroke={color} strokeWidth={2} />
          <line x1={size - 3} y1={3} x2={3} y2={size - 3} stroke={color} strokeWidth={2} />
        </>
      );
      break;
    default:
      // Fallback dot — should not hit for the ISO/ASHA marker set.
      inner = <circle cx={center} cy={center} r={r / 2} fill={color} stroke={color} strokeWidth={1} />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {inner}
    </svg>
  );
}

/** Render a symbol spec as either its marker SVG or its Unicode glyph. */
function renderSymbol(spec: SymbolSpec | undefined): JSX.Element | null {
  if (!spec) return null;
  return spec.mode === 'text'
    ? renderTextGlyph(spec.textChar || '', spec.color)
    : renderMarkerSVG(spec.markerSymbol || 'circle-open', spec.color);
}

// The no-response row reuses each ear's AC color for its down-arrow.
const RIGHT_COLOR = getSymbol('right', 'air_unmasked')?.color ?? '#c00000';
const LEFT_COLOR = getSymbol('left', 'air_unmasked')?.color ?? '#0033cc';

const AudiogramLegend = (): JSX.Element => {
  return (
    <div className='audiogram-legend-container'>
      <table className='audiogram-legend-table'>
        <thead>
          <tr>
            <th className='audiogram-legend-symbol-header'>Right</th>
            <th></th>
            <th className='audiogram-legend-symbol-header'>Left</th>
          </tr>
        </thead>
        <tbody>
          {TABLE_TEST_TYPES.map((t) => {
            const right = getSymbol('right', t);
            const left = getSymbol('left', t);
            return (
              <tr key={t}>
                <td className='audiogram-legend-symbol audiogram-legend-right'>{renderSymbol(right)}</td>
                <td className='audiogram-legend-label'>{right?.label ?? left?.label ?? t}</td>
                <td className='audiogram-legend-symbol audiogram-legend-left'>{renderSymbol(left)}</td>
              </tr>
            );
          })}
          <tr>
            <td className='audiogram-legend-symbol audiogram-legend-right'>
              {renderTextGlyph('↓', RIGHT_COLOR)}
            </td>
            <td className='audiogram-legend-label'>No Response</td>
            <td className='audiogram-legend-symbol audiogram-legend-left'>
              {renderTextGlyph('↓', LEFT_COLOR)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AudiogramLegend;
