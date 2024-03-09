/**
 * The base URI for the data API endpoint
 */
var baseUri = './../../../local-test/';

var matrixConfigs = {
  '*': {
    x_url: baseUri + 'x_values.json',
    x_tree_url: baseUri + 'x_values_tree.json',
    y_url: baseUri + 'y_values.json',
    y_tree_url: baseUri + 'y_values_tree.json',
    z_url: baseUri + 'z_values.json',
    xys_url: baseUri + 'x_y_z_values.json',

    x_source: [{ 'inbound': ['isa', 'dataset_stage_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_stage_stage_fkey'] }, 'id'],
    x_facet_column: 'id',
    y_source: [{ 'inbound': ['isa', 'dataset_anatomy_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_anatomy_anatomy_fkey'] }, 'id'],
    y_facet_column: 'id',
    z_source: [{ 'inbound': ['isa', 'dataset_experiment_type_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_experiment_type_experiment_type_fkey'] }, 'id'],
    z_facet_column: 'id',

    catalog_id: '1',
    schema_name: 'isa',
    table_name: 'dataset',

    title_markdown: 'Mouse Data Matrix',
    subtitle_markdown: [
      'See at a glance all experiment types for our mouse data by anatomy and age stage. ',
      'Click a cell or label to see the related datasets at a particular age stage and anatomical region ',
      '(you can find the legend for the colors at the bottom of the matrix).'
    ].join(''),

    styles: {
      max_cols: 30,
      max_rows: 100,

      cell_width: 25,
      cell_height: 25,

      row_header: {
        width: 250,
        scrollable: true,
        scrollable_max_width: 300
      },

      column_header: {
        height: 80,
        scrollable: true,
        scrollable_max_width: 300
      },

      legend: {
        height: 350,
        barWidth: 55,
        barHeight: 15,
        lineClamp: 2
      }
    },
  },
};
