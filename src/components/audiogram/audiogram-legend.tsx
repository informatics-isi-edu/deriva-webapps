import { type JSX } from 'react';

// models
import { Trace } from '@isrd-isi-edu/deriva-webapps/src/models/plot';

type AudiogramLegendProps = {
  rightTrace: Trace;
  leftTrace: Trace;
};

const SYMBOL_SIZE = 22;

function renderTextSymbol(textSymbol: string, textfont: any): JSX.Element {
  return (
    <span
      style={{
        fontFamily: textfont?.family || 'Arial Black',
        fontSize: `${textfont?.size || 18}px`,
        color: textfont?.color || 'black',
        display: 'inline-block',
        minWidth: SYMBOL_SIZE,
        textAlign: 'center',
        lineHeight: 1,
      }}
    >
      {textSymbol}
    </span>
  );
}

function renderMarkerSVG(markerSymbol: string, color: string): JSX.Element {
  const size = SYMBOL_SIZE;
  const center = size / 2;
  const r = center - 3;

  let inner: JSX.Element;
  switch (markerSymbol) {
    case 'circle-open':
      inner = <circle cx={center} cy={center} r={r} fill='none' stroke={color} strokeWidth={2} />;
      break;
    case 'circle':
      inner = <circle cx={center} cy={center} r={r} fill={color} stroke={color} strokeWidth={2} />;
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
    case 'triangle-up':
      inner = (
        <polygon
          points={`${center},3 ${size - 3},${size - 3} 3,${size - 3}`}
          fill={color}
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'triangle-down-open':
      inner = (
        <polygon
          points={`${center},${size - 3} ${size - 3},3 3,3`}
          fill='none'
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'triangle-down':
      inner = (
        <polygon
          points={`${center},${size - 3} ${size - 3},3 3,3`}
          fill={color}
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'triangle-left-open':
      inner = (
        <polygon
          points={`3,${center} ${size - 3},3 ${size - 3},${size - 3}`}
          fill='none'
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'triangle-right-open':
      inner = (
        <polygon
          points={`${size - 3},${center} 3,3 3,${size - 3}`}
          fill='none'
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'square-open':
      inner = (
        <rect
          x={3}
          y={3}
          width={size - 6}
          height={size - 6}
          fill='none'
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'square':
      inner = (
        <rect
          x={3}
          y={3}
          width={size - 6}
          height={size - 6}
          fill={color}
          stroke={color}
          strokeWidth={2}
        />
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
    case 'diamond-open':
      inner = (
        <polygon
          points={`${center},3 ${size - 3},${center} ${center},${size - 3} 3,${center}`}
          fill='none'
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'diamond':
      inner = (
        <polygon
          points={`${center},3 ${size - 3},${center} ${center},${size - 3} 3,${center}`}
          fill={color}
          stroke={color}
          strokeWidth={2}
        />
      );
      break;
    case 'arrow-down':
      inner = (
        <polygon
          points={`${center},${size - 3} 3,3 ${size - 3},3`}
          fill={color}
          stroke={color}
          strokeWidth={1}
        />
      );
      break;
    default:
      // fallback: small filled dot
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

function renderSymbol(mode: string, marker: any, textSymbol: string, textfont: any): JSX.Element {
  if (mode === 'text' && textSymbol) {
    return renderTextSymbol(textSymbol, textfont);
  }
  // mode === 'markers' or default
  const color = marker?.color || 'black';
  const symbol = marker?.symbol || 'circle-open';
  return renderMarkerSVG(symbol, color);
}

const AudiogramLegend = ({ rightTrace, leftTrace }: AudiogramLegendProps): JSX.Element => {
  const labels = rightTrace.legend || [];

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
          {labels.map((label, i) => {
            const rMode = rightTrace.mode?.[i] || 'markers';
            const lMode = leftTrace.mode?.[i] || 'markers';
            const rMarker = rightTrace.marker?.[i];
            const lMarker = leftTrace.marker?.[i];
            const rTextSymbol = rightTrace.textSymbol?.[i] || '';
            const lTextSymbol = leftTrace.textSymbol?.[i] || '';
            const rTextfont = rightTrace.textfont?.[i];
            const lTextfont = leftTrace.textfont?.[i];

            return (
              <tr key={i}>
                <td className='audiogram-legend-symbol audiogram-legend-right'>
                  {renderSymbol(rMode, rMarker, rTextSymbol, rTextfont)}
                </td>
                <td className='audiogram-legend-label'>{label}</td>
                <td className='audiogram-legend-symbol audiogram-legend-left'>
                  {renderSymbol(lMode, lMarker, lTextSymbol, lTextfont)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AudiogramLegend;
