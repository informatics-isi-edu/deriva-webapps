/**
 * Audiogram app config. Like the other deriva-webapps apps, this file defines named configs,
 * picked with ?config=<name>. '*' is the default, and a string value is an alias.
 *
 * A config names the tables, columns and vocabulary values of the model, and the app builds
 * its requests from them. Display (axes, ISO/ASHA symbols, colors, the PTA rule) is fixed by
 * the standard and lives in the app.
 *
 * The catalog is ?catalog= from the page URL, or chaise's default catalog. Patterns are
 * Handlebars, rendered with $url_parameters, $catalog and $location ($row too, for
 * case.link_pattern). A url_pattern on thresholds or audiogram reads from that URL instead
 * of the table, for example a static JSON file, and makes the app read-only.
 */
var audiogramConfigs = {
  '*': 'earbase',

  earbase: {
    rid_pattern: '{{{$url_parameters.audiogram}}}',
    default_frequencies: [125, 250, 500, 1000, 2000, 4000, 8000],

    thresholds: {
      schema_name: 'earbase',
      table_name: 'pure_tone_threshold',
      audiogram_column: 'diagnostic_test',
      columns: {
        ear: 'ear',
        conduction: 'conduction_type',
        frequency: 'frequency',
        level: 'level_db',
        masked: 'masked',
        no_response: 'no_response',
      },
      values: {
        ear: { right: 'Right', left: 'Left' },
        conduction: { air: 'Air', bone: 'Bone' },
      },
      frequency_vocab: {
        schema_name: 'earbase',
        table_name: 'audiometric_frequency',
        name_column: 'Name',
        hz_column: 'hz',
      },
    },

    audiogram: {
      schema_name: 'earbase',
      table_name: 'diagnostic_test',
      summary: {
        pta: { value: { right: 'pta_right', left: 'pta_left' } },
        srt: {
          value: { right: 'srt_right', left: 'srt_left' },
          no_response: { right: 'srt_right_no_response', left: 'srt_left_no_response' },
        },
        word_id: {
          value: { right: 'word_id_right', left: 'word_id_left' },
          no_response: { right: 'word_id_right_no_response', left: 'word_id_left_no_response' },
        },
        word_id_level: { value: { right: 'word_id_level_right', left: 'word_id_level_left' } },
        ucl: {
          value: { right: 'ucl_right', left: 'ucl_left' },
          no_response: { right: 'ucl_right_no_response', left: 'ucl_left_no_response' },
        },
        tympanogram: { value: { right: 'tympanogram_type_right', left: 'tympanogram_type_left' } },
      },
      case: {
        column: 'case',
        schema_name: 'earbase',
        table_name: 'case',
        key_column: 'RID',
        display_column: 'Case Number',
        link_pattern: '{{{$location.chaise_path}}}record/#{{{$catalog.id}}}/earbase:case/RID={{{$row.case}}}',
      },
    },
  },

  /*
   * Read-only demo from a static file, with its own names and values. Serve
   * docs/dev-docs/audiogram/sample-thresholds.json somewhere and point url_pattern at it.
   */
  'static-demo': {
    rid_pattern: 'demo',
    thresholds: {
      url_pattern: '/path/to/sample-thresholds.json',
      columns: {
        ear: 'ear',
        conduction: 'conduction',
        frequency: 'frequency',
        level: 'level',
        masked: 'masked',
        no_response: 'no_response',
      },
      values: {
        ear: { right: 'Right', left: 'Left' },
        conduction: { air: 'Air', bone: 'Bone' },
      },
    },
  },
};
