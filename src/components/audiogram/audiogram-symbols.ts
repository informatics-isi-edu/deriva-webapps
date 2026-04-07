/**
 * ISO/ASHA standard symbol map for the audiogram.
 *
 * This is a property of the standard, not of any particular dataset, so it
 * lives in the app rather than in user-facing config. See progress-02.md
 * "Audiogram-specific config" for the rationale.
 */

import type { Ear, TestType } from '@isrd-isi-edu/deriva-webapps/src/components/audiogram/audiogram-data';

export type SymbolSpec = {
  /** Short label shown next to the symbol in the legend and in table headers. */
  label: string;
  /** Color used for plot markers, lines, and table accents. */
  color: string;
  /** Render mode: 'marker' = a Plotly marker shape, 'text' = a Unicode glyph. */
  mode: 'marker' | 'text';
  /** Plotly marker symbol name (when mode === 'marker'). */
  markerSymbol?: string;
  /** Unicode character to render (when mode === 'text'). */
  textChar?: string;
  /** Whether AC unmasked traces should connect points with a line. */
  connectLine?: boolean;
};

const RED = '#c00000';
const BLUE = '#0033cc';

export const AUDIOGRAM_SYMBOLS: Record<Ear, Partial<Record<TestType, SymbolSpec>>> = {
  right: {
    air_unmasked: {
      label: 'AC Unmasked',
      color: RED,
      mode: 'marker',
      markerSymbol: 'circle-open',
      connectLine: true,
    },
    air_masked: {
      label: 'AC Masked',
      color: RED,
      mode: 'marker',
      markerSymbol: 'triangle-up-open',
    },
    bone_unmasked_mastoid: {
      label: 'BC Unmasked (mastoid)',
      color: RED,
      mode: 'text',
      textChar: '<',
    },
    bone_masked_mastoid: {
      label: 'BC Masked (mastoid)',
      color: RED,
      mode: 'text',
      textChar: '[',
    },
    bone_unmasked_forehead: {
      label: 'BC Unmasked (forehead)',
      color: RED,
      mode: 'text',
      textChar: '∨',
    },
    bone_masked_forehead: {
      label: 'BC Masked (forehead)',
      color: RED,
      mode: 'text',
      textChar: '¬',
    },
  },
  left: {
    air_unmasked: {
      label: 'AC Unmasked',
      color: BLUE,
      mode: 'marker',
      markerSymbol: 'x-thin',
      connectLine: true,
    },
    air_masked: {
      label: 'AC Masked',
      color: BLUE,
      mode: 'marker',
      markerSymbol: 'square-open',
    },
    bone_unmasked_mastoid: {
      label: 'BC Unmasked (mastoid)',
      color: BLUE,
      mode: 'text',
      textChar: '>',
    },
    bone_masked_mastoid: {
      label: 'BC Masked (mastoid)',
      color: BLUE,
      mode: 'text',
      textChar: ']',
    },
    bone_unmasked_forehead: {
      label: 'BC Unmasked (forehead)',
      color: BLUE,
      mode: 'text',
      textChar: '∨',
    },
    bone_masked_forehead: {
      label: 'BC Masked (forehead)',
      color: BLUE,
      mode: 'text',
      textChar: '⌐',
    },
  },
};

export function getSymbol(ear: Ear, testType: TestType): SymbolSpec | undefined {
  return AUDIOGRAM_SYMBOLS[ear][testType];
}
