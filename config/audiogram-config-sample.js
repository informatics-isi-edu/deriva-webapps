/**
 * Audiogram app config. Display (axes, ISO/ASHA symbols, colors, legend) is
 * owned by the app code, since it is fixed by the standard. The only
 * per-instance setting is where to fetch the audiogram from: both ears are
 * derived from the single payload at plots[0].traces[0].url_pattern, which
 * supports {{$url_parameters.X}} Handlebars substitution (e.g. an audiogram
 * RID from the page URL).
 */
var audiogramConfig = {
  plots: [
    {
      uid: 'audiogram',
      plot_type: 'scatter',
      traces: [
        {
          url_pattern: '/~ashafaei/plot-test-data/audiogram.json',
          response_format: 'json',
        },
      ],
    },
  ],
  user_controls: [],
};
