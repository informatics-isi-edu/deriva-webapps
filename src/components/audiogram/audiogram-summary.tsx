/**
 * Compact per-ear summary card: PTA (computed from AC measurements at
 * 500/1000/2000 Hz, or the stored value when it can't be computed) plus the
 * stored summary values the config maps (SRT / Word ID / Word ID Level / UCL /
 * Tympanogram).
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
  type Ear,
  computePTA,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';
import { AudiogramRecord } from '@isrd-isi-edu/deriva-webapps/src/models/audiogram-config';

type AudiogramSummaryProps = {
  measurements: AudiogramMeasurement[];
  /** the measures the config maps to columns; only those rows are shown, PTA always is */
  measures: AudiogramRecord['summary'] | undefined;
  editable: boolean;
  stored: AudiogramSummaryValues | null;
  /** record page of the case this audiogram belongs to; no link when null */
  caseHref: string | null;
  /** embedded instances open the case in a new tab rather than inside the iframe */
  openLinksInNewTab: boolean;
};

type PairState = { right: string; left: string };
const EMPTY: PairState = { right: '', left: '' };

const AudiogramSummary = ({
  measurements, measures, editable, stored, caseHref, openLinksInNewTab,
}: AudiogramSummaryProps): JSX.Element => {
  // computed from the thresholds, the stored value only when it can't be computed
  const pta = (ear: Ear): string => {
    const computed = computePTA(measurements, ear);
    if (computed != null) return String(computed);
    return stored?.pta[ear] ?? '';
  };

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
            <td className='audiogram-summary-right'>{pta('right')}</td>
            <td className='audiogram-summary-left'>{pta('left')}</td>
          </tr>
          {measures?.srt && renderRow('SRT (dB)', srt, setSrt)}
          {measures?.word_id && renderRow('Word ID (%)', wordId, setWordId)}
          {measures?.word_id_level && renderRow('Word ID Level (dB)', wordIdLevel, setWordIdLevel)}
          {measures?.ucl && renderRow('UCL (dB)', ucl, setUcl)}
          {measures?.tympanogram && renderRow('Tympanogram', tympanogram, setTympanogram)}
        </tbody>
      </table>
      {caseHref && stored?.caseRid && (
        <div className='audiogram-summary-case'>
          Case:{' '}
          <a href={caseHref} target={openLinksInNewTab ? '_blank' : '_self'} rel='noreferrer'>
            {stored.caseDisplay || stored.caseRid}
          </a>
        </div>
      )}
    </div>
  );
};

export default AudiogramSummary;
