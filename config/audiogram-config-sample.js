/**
 * Audiogram app configuration sample.
 *
 * Assumes exactly 2 plots:
 *   - index 0: right ear
 *   - index 1: left ear
 *
 * Each plot has one trace whose arrays (legend, x_col, y_col, mode, marker,
 * textSymbol, textfont) are parallel — index i describes one audiogram test
 * condition. Follows the ISO/ASHA standard symbol set (V2 conditions only).
 *
 * The audiogram app hides Plotly's built-in legend and renders a custom
 * HTML legend in the centre column instead.
 *
 * Symbol reference (ISO/ASHA standard):
 *   Right ear (red)  │  Left ear (blue)  │  Test type
 *   ○                │  ×                │  AC Unmasked
 *   △                │  □                │  AC Masked
 *   <                │  >                │  BC Unmasked, mastoid
 *   [                │  ]                │  BC Masked, mastoid
 *   ↓                │  ↓                │  No Response
 *
 * Non-standard conditions (SF Aided, SF Unaided, ULL) are omitted here.
 * See open questions in docs/dev-docs/audiogram-dev-guide.md.
 */
var audiogramConfig = {
  plots: [
    // ── Plot 0: RIGHT EAR ────────────────────────────────────────────────────
    {
      uid: 'right_ear',
      plot_type: 'scatter',
      plotly: {
        config: {
          displaylogo: false,
          responsive: true,
          modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        },
        layout: {
          title: 'Right Ear',
          xaxis: {
            title: 'Frequency (Hz)',
            type: 'log',
            tickvals: [250, 500, 1000, 2000, 4000, 8000],
            ticktext: ['250', '500', '1000', '2000', '4000', '8000'],
            range: [Math.log10(200), Math.log10(9000)],
            showgrid: true,
            gridcolor: '#ccc',
          },
          yaxis: {
            title: 'Hearing Level (dB HL)',
            autorange: 'reversed',
            range: [-10, 120],
            showgrid: true,
            gridcolor: '#ccc',
            dtick: 10,
          },
          showlegend: false,
          height: 550,
          margin: { t: 50, b: 60, l: 60, r: 20 },
        },
      },
      config: {},
      user_controls: [],
      traces: [
        {
          // One trace config drives all audiogram conditions via parallel arrays.
          // The audiogram app reads traces[0] from each plot to build the legend.
          url_pattern: '/~ashafaei/plot-test-data/audiogram.json',
          response_format: 'json',

          legend: [
            'AC Unmasked',      // ○  circle-open
            'AC Masked',        // △  triangle-up-open
            'BC Unmasked',      // <  text
            'BC Masked',        // [  text
            'No Response',      // ↓  arrow-down
          ],

          x_col: [
            'Frequency_Right_Air_Unmasked',
            'Frequency_Right_Air_Masked',
            'Frequency_Right_Bone_Unmasked',
            'Frequency_Right_Bone_Masked',
            'Frequency_Right_No_Response',
          ],

          y_col: [
            'Level_Right_Air_Unmasked',
            'Level_Right_Air_Masked',
            'Level_Right_Bone_Unmasked',
            'Level_Right_Bone_Masked',
            'Level_Right_No_Response',
          ],

          mode: [
            'lines+markers', // AC Unmasked — ○ connected with line
            'markers',       // AC Masked   — △ open triangle
            'text',          // BC Unmasked — < character
            'text',          // BC Masked   — [ character
            'markers',       // No Response — ↓ arrow-down
          ],

          marker: [
            { symbol: 'circle-open',      color: 'red', size: 14, line: { color: 'red', width: 2 } },
            { symbol: 'triangle-up-open', color: 'red', size: 14, line: { color: 'red', width: 2 } },
            null, // text mode — no marker
            null, // text mode — no marker
            { symbol: 'arrow-down',       color: 'red', size: 14, line: { color: 'red', width: 2 } },
          ],

          textSymbol: [
            '',   // markers mode
            '',   // markers mode
            '<',  // BC Unmasked
            '[',  // BC Masked
            '',   // markers mode
          ],

          textfont: [
            null,
            null,
            { family: 'Arial Black', size: 18, color: 'red' },
            { family: 'Arial Black', size: 18, color: 'red' },
            null,
          ],
        },
      ],
    },

    // ── Plot 1: LEFT EAR ─────────────────────────────────────────────────────
    {
      uid: 'left_ear',
      plot_type: 'scatter',
      plotly: {
        config: {
          displaylogo: false,
          responsive: true,
          modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        },
        layout: {
          title: 'Left Ear',
          xaxis: {
            title: 'Frequency (Hz)',
            type: 'log',
            tickvals: [250, 500, 1000, 2000, 4000, 8000],
            ticktext: ['250', '500', '1000', '2000', '4000', '8000'],
            range: [Math.log10(200), Math.log10(9000)],
            showgrid: true,
            gridcolor: '#ccc',
          },
          yaxis: {
            title: 'Hearing Level (dB HL)',
            autorange: 'reversed',
            range: [-10, 120],
            showgrid: true,
            gridcolor: '#ccc',
            dtick: 10,
          },
          showlegend: false,
          height: 550,
          margin: { t: 50, b: 60, l: 60, r: 20 },
        },
      },
      config: {},
      user_controls: [],
      traces: [
        {
          url_pattern: '/~ashafaei/plot-test-data/audiogram.json',
          response_format: 'json',

          legend: [
            'AC Unmasked',      // ×  x-thin marker
            'AC Masked',        // □  square-open
            'BC Unmasked',      // >  text
            'BC Masked',        // ]  text
            'No Response',      // ↓  arrow-down
          ],

          x_col: [
            'Frequency_Left_Air_Unmasked',
            'Frequency_Left_Air_Masked',
            'Frequency_Left_Bone_Unmasked',
            'Frequency_Left_Bone_Masked',
            'Frequency_Left_No_Response',
          ],

          y_col: [
            'Level_Left_Air_Unmasked',
            'Level_Left_Air_Masked',
            'Level_Left_Bone_Unmasked',
            'Level_Left_Bone_Masked',
            'Level_Left_No_Response',
          ],

          mode: [
            'lines+markers', // AC Unmasked — × connected with line
            'markers',       // AC Masked   — □ open square
            'text',          // BC Unmasked — > character
            'text',          // BC Masked   — ] character
            'markers',       // No Response — ↓ arrow-down
          ],

          marker: [
            { symbol: 'x-thin',      color: 'blue', size: 14, line: { color: 'blue', width: 2 } },
            { symbol: 'square-open', color: 'blue', size: 14, line: { color: 'blue', width: 2 } },
            null, // text mode
            null, // text mode
            { symbol: 'arrow-down',  color: 'blue', size: 14, line: { color: 'blue', width: 2 } },
          ],

          textSymbol: [
            '',   // markers mode
            '',   // markers mode
            '>',  // BC Unmasked
            ']',  // BC Masked
            '',   // markers mode
          ],

          textfont: [
            null,
            null,
            { family: 'Arial Black', size: 18, color: 'blue' },
            { family: 'Arial Black', size: 18, color: 'blue' },
            null,
          ],
        },
      ],
    },
  ],

  // The audiogram app does not use user_controls or grid_layout_config.
  user_controls: [],
};
