/**
 * The base URI for the data API endpoint
 */
var baseUri = './../../../local-test/';

var matrixConfigs = {
  '*': {
    /**
     * API for the x axis data
     */
    xURL: baseUri + 'x_values.json',
    /**
     * API for the tree data of the x axis (must return child_id and parent_id. other columns will be ignored.)
     */
    xTreeURL: baseUri + 'x_values_tree.json',
    /**
     * API for the y axis data
     */
    yURL: baseUri + 'y_values.json',
    /**
     * API for the tree data of the y axis (must return child_id and parent_id. other columns will be ignored.)
     */
    yTreeURL: baseUri + 'y_values_tree.json',
    /**
     * API for the z axis data (color axis)
     */
    zURL: baseUri + 'z_values.json',
    /**
     * API for xyz axis
     */
    xysURL: baseUri + 'x_y_z_values.json',
    /**
     * The source path of x. used for generating the facet blob
     */
    xSource: [{ 'inbound': ['isa', 'dataset_stage_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_stage_stage_fkey'] }, 'id'],
    /**
     * key name of data from the x axis API response
     */
    xFacetColumn: 'id',
    /**
     * The source path of y. used for generating the facet blob
     */
    ySource: [{ 'inbound': ['isa', 'dataset_anatomy_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_anatomy_anatomy_fkey'] }, 'id'],
    /**
     * key name of data from the y axis API response
     */
    yFacetColumn: 'id',
    /**
     * The source path of z. used for generating the facet blob
     */
    zSource: [{ 'inbound': ['isa', 'dataset_experiment_type_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_experiment_type_experiment_type_fkey'] }, 'id'],
    /**
     * key name of data from the z axis API response
     */
    zFacetColumn: 'id',
    /**
     * the catalog, schema, and table information. used for generating the links
     */
    catalogId: '1',
    schemaName: 'isa',
    tableName: 'dataset',
    /**
     * Defining the title shown for the matrix
     */
    title_markdown: 'Mouse Data Matrix',
    /**
     * Defines the subtitle shown for the matrix
     */
    subtitle_markdown:
      'See at a glance all experiment types for our mouse data by anatomy and age stage. Click a cell or label to see the related datasets at a particular age stage and anatomical region (you can find the legend for the colors at the bottom of the matrix).',
    /**
     * Optional properties to override the default parameters for displaying the matrix.
     */
    styles: {
      /**
       * Restricts the grid size to the given number of max columns. If not specified the grid grows infinitely
       * until it hits the viewport / window size that is defined by the iframe.
       */
      maxCols: 30,
      /**
       * Restricts the grid size to the given number of max rows, If not specified the grid grows infinitely
       * until it hits the viewport / window size that is defined by the iframe.
       */
      maxRows: 100,
      /**
       * Width of each cell within the grid
       */
      cellWidth: 25,
      /**
       * Height of each cell within the grid
       */
      cellHeight: 25,
      /**
       * Properties of the row headers
       */
      rowHeader: {
        // Width of the row headers
        width: 250,
        // Whether allow scroll
        scrollable: true,
        // The max width of the scrollable content
        // scrollableMaxWidth: 300,
      },
      /**
       * Properties of the column headers
       */
      columnHeader: {
        // Height of the column headers
        height: 80,
        // Whether allow scroll
        scrollable: true,
        // The max height of the scrollable content
        // scrollableMaxHeight: 100,
      },
      /**
       * Height of the legend
       */
      legendHeight: 200,
      /**
       * Width of the legend bar
       */
      legendBarWidth: 55,
      /**
       * Height of the legend bar
       */
      legendBarHeight: 15,
    },
  },
};
