/**
 * Compact per-ear summary card: PTA (computed from AC measurements at
 * 500/1000/2000 Hz) plus SRT / Word ID / Word ID Level user inputs.
 *
 * Sits in the centre column between the two ear plots (see
 * .audiogram-legend-col in _audiogram.scss) so clinicians can glance at
 * both the plot and the numerical summary at once.
 *
 * The three non-PTA rows are local input state for V4; persisting them
 * follows the same path as cell edits once Q2 is answered.
 */

import { useState, type JSX } from 'react';

import {
  type AudiogramMeasurement,
  computePTA,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';

type AudiogramSummaryProps = {
  measurements: AudiogramMeasurement[];
};

type PairState = { right: string; left: string };
const EMPTY: PairState = { right: '', left: '' };

const AudiogramSummary = ({ measurements }: AudiogramSummaryProps): JSX.Element => {
  const rightPTA = computePTA(measurements, 'right');
  const leftPTA = computePTA(measurements, 'left');

  const [srt, setSrt] = useState<PairState>(EMPTY);
  const [wordId, setWordId] = useState<PairState>(EMPTY);
  const [wordIdLevel, setWordIdLevel] = useState<PairState>(EMPTY);

  const fmtPTA = (v: number | null) => (v == null ? '—' : String(v));

  const renderInputRow = (
    label: string,
    state: PairState,
    setState: (s: PairState) => void,
    inputType: 'number' | 'text',
  ) => (
    <tr>
      <td className='audiogram-summary-rowlabel'>{label}</td>
      <td className='audiogram-summary-right'>
        <input
          className='audiogram-summary-input'
          type={inputType}
          value={state.right}
          onChange={(e) => setState({ ...state, right: e.target.value })}
        />
      </td>
      <td className='audiogram-summary-left'>
        <input
          className='audiogram-summary-input'
          type={inputType}
          value={state.left}
          onChange={(e) => setState({ ...state, left: e.target.value })}
        />
      </td>
    </tr>
  );

  return (
    <div className='audiogram-summary'>
      <table className='audiogram-summary-table'>
        <thead>
          <tr>
            <th></th>
            <th>Right</th>
            <th>Left</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='audiogram-summary-rowlabel'>PTA (db)</td>
            <td className='audiogram-summary-right'>{fmtPTA(rightPTA)}</td>
            <td className='audiogram-summary-left'>{fmtPTA(leftPTA)}</td>
          </tr>
          {renderInputRow('SRT (db)', srt, setSrt, 'number')}
          {renderInputRow('Word ID (%)', wordId, setWordId, 'number')}
          {renderInputRow('Word ID Level (db)', wordIdLevel, setWordIdLevel, 'number')}
        </tbody>
      </table>
    </div>
  );
};

export default AudiogramSummary;
