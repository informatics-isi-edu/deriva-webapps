/**
 * Audiogram app config. Display (axes, ISO/ASHA symbols, colors, legend) is
 * owned by the app code, since it is fixed by the standard. The per-instance
 * settings are where to fetch the audiogram from:
 *
 * - url_pattern: the measurement rows (one per ear/test type/frequency cell,
 *   long model). Supports {{$url_parameters.X}} Handlebars substitution;
 *   standalone webapp pages have no catalog context, so ?catalog= in the page
 *   URL wins and $catalog.id is the fallback.
 * - summary_url_pattern (optional): the audiogram record itself, for the
 *   stored per-ear summary values (PTA/SRT/UCL/word recognition/tympanogram).
 */
var audiogramConfig = {
  plots: [
    {
      uid: 'audiogram',
      plot_type: 'scatter',
      traces: [
        {
          // Long-model source, selected by ?catalog=<id>&audiogram=<RID> in
          // the page URL. A static JSON file in the semi-wide sample shape
          // also works, e.g. url_pattern: '/path/to/audiogram.json'.
          url_pattern:
            '/ermrest/catalog/{{#if $url_parameters.catalog}}{{$url_parameters.catalog}}{{else}}{{$catalog.id}}{{/if}}' +
            '/entity/earbase:measurement/audiogram={{$url_parameters.audiogram}}',
          summary_url_pattern:
            '/ermrest/catalog/{{#if $url_parameters.catalog}}{{$url_parameters.catalog}}{{else}}{{$catalog.id}}{{/if}}' +
            '/entity/earbase:audiogram/RID={{$url_parameters.audiogram}}',
          response_format: 'json',
        },
      ],
    },
  ],
  user_controls: [],
};
