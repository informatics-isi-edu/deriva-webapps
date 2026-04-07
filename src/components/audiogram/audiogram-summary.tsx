/**
 * Pure-tone average summary table — small bottom-of-screen card showing
 * the per-ear PTA computed from the AC Unmasked measurements at
 * 500/1000/2000 Hz. Mirrors the bottom-center "Average" widget in
 * docs/dev-docs/audiogram/screenshots/example02.png.
 *
 * Reads from the same draftRows the tables and chart bind to, so it
 * updates live as the user edits cells.
 */

import { type JSX } from 'react';

import {
  type AudiogramMeasurement,
  computePTA,
} from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';

type AudiogramSummaryProps = {
  measurements: AudiogramMeasurement[];
};

const AudiogramSummary = ({ measurements }: AudiogramSummaryProps): JSX.Element => {
  const rightPTA = computePTA(measurements, 'right');
  const leftPTA = computePTA(measurements, 'left');

  const fmt = (v: number | null) => (v == null ? '—' : `${v} dB HL`);

  return (
    <div className='audiogram-summary'>
      <div className='audiogram-summary-title'>
        Average (3-frequency PTA: 500 / 1000 / 2000 Hz)
      </div>
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
            <td className='audiogram-summary-rowlabel'>AC Unmasked PTA</td>
            <td className='audiogram-summary-right'>{fmt(rightPTA)}</td>
            <td className='audiogram-summary-left'>{fmt(leftPTA)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AudiogramSummary;
