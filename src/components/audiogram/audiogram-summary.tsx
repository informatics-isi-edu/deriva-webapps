/**
 * Compact per-ear summary card: PTA (computed from AC measurements at
 * 500/1000/2000 Hz) plus the stored summary values from the audiogram
 * record (SRT / Word ID / Word ID Level / UCL / Tympanogram).
 *
 * Sits in the centre column between the two ear plots (see
 * .audiogram-legend-col in _audiogram.scss) so clinicians can glance at
 * both the plot and the numerical summary at once.
 *
 * Read-only mode renders the stored values as plain text; edit mode
 * renders inputs seeded from them. Persisting edits follows the same
 * save path as cell edits (future milestone).
 */

import { useEffect, useState, type JSX } from 'react';

import {
  type AudiogramMeasurement,
  type AudiogramSummaryValues,
  computePTA,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';

type AudiogramSummaryProps = {
  measurements: AudiogramMeasurement[];
  editable: boolean;
  stored: AudiogramSummaryValues | null;
};

type PairState = { right: string; left: string };
const EMPTY: PairState = { right: '', left: '' };

const AudiogramSummary = ({ measurements, editable, stored }: AudiogramSummaryProps): JSX.Element => {
  const rightPTA = computePTA(measurements, 'right');
  const leftPTA = computePTA(measurements, 'left');

  const [srt, setSrt] = useState<PairState>(EMPTY);
  const [wordId, setWordId] = useState<PairState>(EMPTY);
  const [wordIdLevel, setWordIdLevel] = useState<PairState>(EMPTY);
  const [ucl, setUcl] = useState<PairState>(EMPTY);
  const [tympanogram, setTympanogram] = useState<PairState>(EMPTY);

  // (Re)seed from the stored record whenever it loads.
  useEffect(() => {
    if (!stored) return;
    setSrt(stored.srt);
    setWordId(stored.wordId);
    setWordIdLevel(stored.wordIdLevel);
    setUcl(stored.ucl);
    setTympanogram(stored.tympanogram);
  }, [stored]);

  const fmtPTA = (v: number | null) => (v == null ? '' : String(v));

  const renderRow = (label: string, state: PairState, setState: (s: PairState) => void) => (
    <tr>
      <td className='audiogram-summary-rowlabel'>{label}</td>
      {(['right', 'left'] as const).map((side) => (
        <td key={side} className={`audiogram-summary-${side}`}>
          {editable ? (
            <input
              className='audiogram-summary-input'
              type='text'
              value={state[side]}
              onChange={(e) => setState({ ...state, [side]: e.target.value })}
            />
          ) : (
            <span>{state[side]}</span>
          )}
        </td>
      ))}
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
            <td className='audiogram-summary-rowlabel'>PTA (dB)</td>
            <td className='audiogram-summary-right'>{fmtPTA(rightPTA)}</td>
            <td className='audiogram-summary-left'>{fmtPTA(leftPTA)}</td>
          </tr>
          {renderRow('SRT (dB)', srt, setSrt)}
          {renderRow('Word ID (%)', wordId, setWordId)}
          {renderRow('Word ID Level (dB)', wordIdLevel, setWordIdLevel)}
          {renderRow('UCL (dB)', ucl, setUcl)}
          {renderRow('Tympanogram', tympanogram, setTympanogram)}
        </tbody>
      </table>
    </div>
  );
};

export default AudiogramSummary;
