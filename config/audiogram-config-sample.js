/**
 * Audiogram app config. Display (axes, ISO/ASHA symbols, colors, legend) is
 * owned by the app code, since it is fixed by the standard. The per-instance
 * settings are where to fetch the audiogram from:
 *
 * - url_pattern: the measurement rows (one per ear/conduction/frequency cell,
 *   long model). Supports {{$url_parameters.X}} Handlebars substitution;
 *   standalone webapp pages have no catalog context, so ?catalog= in the page
 *   URL wins and $catalog.id is the fallback.
 * - summary_url_pattern (optional): the audiogram itself (an
 *   earbase:diagnostic_test row of type Audiometric Test), for the stored
 *   per-ear summary values (SRT/UCL/word identification/tympanogram). If the
 *   row carries `case` and `case_number`, a link to the case shows under the
 *   summary card, built from case_url_pattern.
 * - case_url_pattern (optional): target of that link; sees $row (the summary
 *   row) besides $url_parameters and $catalog.
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
            '/entity/earbase:pure_tone_threshold/diagnostic_test={{$url_parameters.audiogram}}',
          // Attribute query so the row also carries the case's number (as
          // `case_number`) for the link under the summary card.
          summary_url_pattern:
            '/ermrest/catalog/{{#if $url_parameters.catalog}}{{$url_parameters.catalog}}{{else}}{{$catalog.id}}{{/if}}' +
            '/attribute/M:=earbase:diagnostic_test/RID={{$url_parameters.audiogram}}' +
            '/C:=left(case)=(earbase:case:RID)/$M/*,case_number:=C:Case%20Number',
          // Where "Case: <number>" under the summary card points. Rendered with
          // $url_parameters, $catalog and $row (the summary row above).
          case_url_pattern:
            '/chaise/record/#{{#if $url_parameters.catalog}}{{$url_parameters.catalog}}{{else}}{{$catalog.id}}{{/if}}' +
            '/earbase:case/RID={{$row.case}}',
          response_format: 'json',
        },
      ],
    },
  ],
  user_controls: [],
};
