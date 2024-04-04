/**
 * Please refer to the following for document for more information:
 * https://github.com/informatics-isi-edu/deriva-webapps/blob/master/docs/user-docs/matrix-app.md#overal-structure
 *
 * You can also find the TypeScript definitions here:
 * https://github.com/informatics-isi-edu/deriva-webapps/blob/master/src/models/matrix-config.ts
 */

// the data types that we don't want to show
const excludedDataTypes = [
  'Collection', 'Functional Assay Handbook', 'Protocol', 'Publication'
].map((v) => encodeURIComponent(v)).join(',');

/**
 * The base URI for the data API endpoint
 */
const getAtlasURL = (projection) => {
  return `/ermrest/catalog/2/attributegroup/M:=Dashboard:Release_Status/Consortium=ALL/!Data_Type=any(${excludedDataTypes})/${projection}`;
}

let speciesUri = getAtlasURL('!(Species=ALL)/id:=Species,title:=Species@sort(id)');
let dataTypeUri = getAtlasURL('Species=ALL/ID,id:=Data_Type,title:=Data_Type;Data_Type_Filter,Schema_Table@sort(ID)');

let speciesDataTypeUri = getAtlasURL('Released::gt::0/xid:=Species,yid:=Data_Type;zid:=array(Species),num:=Released,Data_Type_Filter,Schema_Table')

/**
 * The base URI for the data API endpoint for the facebase example
 */
const fasebaseBaseURI = [
  '/ermrest/catalog/1/attributegroup/M:=isa:dataset/isa:dataset_species/vocab:species/name=Mus%20musculus/$M/isa:dataset_anatomy/',
  'Y:=vocab:anatomy/$M/isa:dataset_stage/X:=vocab:stage/sort_key::geq::0/sort_key::lt::10000/$M/isa:dataset_experiment_type/Z:=vocab:experiment_type'
].join('')

var matrixConfigs = {
  '*': 'atlas',
  'atlas': {
    /**
     * API for the x axis data
     * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
     * - can contain other projected columns
     */
    x_url: speciesUri,

    /**
     * the pattern for x axis links
     */
    x_link_pattern: '{{{$location.chaise_path}}}record/#2/Vocabulary:Species/Name={{{title}}}',

    /**
     * API for the y axis data
     * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
     * - can contain other projected columns
     */
    y_url: dataTypeUri,

    /**
     * the pattern for y axis links
     */
    y_link_pattern: '{{#if Data_Type_Filter.Released}}{{{$location.chaise_path}}}recordset/#2/{{{Schema_Table}}}/*::facets::{{#encodeFacet}}{{#jsonStringify}}{{{Data_Type_Filter.Released}}}{{/jsonStringify}}{{/encodeFacet}}{{/if}}',

    /**
     * this is added for coloring
     */
    z_url: speciesUri,

    /**
     * API for fetching the values of the cell
     */
    xys_url: speciesDataTypeUri,

    /**
     * the value that should be displayed on cell
     */
    xys_markdown_pattern: '{{{num}}}',

    /**
     * the pattern for cell links
     */
    xys_link_pattern: '{{#if Data_Type_Filter.Released}}{{{$location.chaise_path}}}recordset/#2/{{{Schema_Table}}}/*::facets::{{#encodeFacet}}{{#jsonStringify}}{{{Data_Type_Filter.Released}}}{{/jsonStringify}}{{/encodeFacet}}{{/if}}',

    /**
     * Defining the title shown for the matrix
     */
    title_markdown: '',
    /**
     * Defines the subtitle shown for the matrix
     */
    subtitle_markdown: ' Click a cell or labels along the axes to navigate to the corresponding datasets.',

    hide_search_box: true,

    color_palette: {
      default_option: 'viridis'
    },

    /**
     * Optional properties to override the default parameters for displaying the matrix.
     */
    styles: {
      /**
       * Width of each cell within the grid
       */
      cell_width: 75,
      /**
       * Height of each cell within the grid
       */
      cell_height: 25,
      /**
       * Width of the row headers
       */
      row_header: {
        width: 300,
      },
      column_header: {
        height: 110
      },
      legend: {
        height: 0
      }
    },
  },
  'facebase': {
    /**
     * API for the x axis data (must return id and title. other projected columns will be ignored.)
     */
    x_url: fasebaseBaseURI + '/sort_key:=X:sort_key,id:=X:id,title:=X:name@sort(sort_key)',
    /**
     * API for the y axis data (must return id and title. other projected columns will be ignored.)
     */
    y_url: fasebaseBaseURI + '/id:=Y:id,title:=Y:name@sort(title)',
    /**
     * API for the z axis data (color axis) (must return id and title. other projected columns will be ignored.)
     */
    z_url: fasebaseBaseURI + '/id:=Z:id,title:=Z:name@sort(title)',
    /**
     * API for xyz axis (must return xid, yid, and zid. other projected columns will be ignored.)
     */
    xys_url: fasebaseBaseURI + '/xid:=X:id,yid:=Y:id;zid:=array(Z:name)',
    /**
     * The source path of x. used for generating the facet blob
     */
    x_source: [{ 'inbound': ['isa', 'dataset_stage_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_stage_stage_fkey'] }, 'id'],
    /**
     * key name of data from the x axis API response
     */
    x_facet_column: 'id',
    /**
     * The source path of y. used for generating the facet blob
     */
    y_source: [{ 'inbound': ['isa', 'dataset_anatomy_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_anatomy_anatomy_fkey'] }, 'id'],
    /**
     * key name of data from the y axis API response
     */
    y_facet_column: 'id',
    /**
     * The source path of z. used for generating the facet blob
     */
    z_source: [{ 'inbound': ['isa', 'dataset_experiment_type_dataset_id_fkey'] }, { 'outbound': ['isa', 'dataset_experiment_type_experiment_type_fkey'] }, 'id'],
    /**
     * key name of data from the z axis API response
     */
    z_facet_column: 'id',
    /**
     * the catalog, schema, and table information. used for generating the links
     */
    catalog_id: '1',
    schema_name: 'isa',
    table_name: 'dataset',
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
      max_cols: 30,
      /**
       * Restricts the grid size to the given number of max rows, If not specified the grid grows infinitely
       * until it hits the viewport / window size that is defined by the iframe.
       */
      max_rows: 100,
      /**
       * Width of each cell within the grid
       */
      cell_width: 25,
      /**
       * Height of each cell within the grid
       */
      cell_height: 25,
      /**
       * Properties of the row headers
       */
      row_header: {
        /**
         * Width of the row headers
         */
        width: 250
      },
      /**
       * Properties of the column headers
       */
      column_header: {
        /**
         * Height of the column headers
         */
        height: 80
      },
      /**
       * Properties of the legend
       */
      legend: {
        /**
         * Height of the legend
         */
        height: 250,
        /**
         * Width of the legend bar
         */
        bar_width: 55,
        /**
         * Height of the legend bar
         */
        bar_height: 15,
        /**
         * Max number of lines showing the legend content
         */
        line_clamp: 2,
      }
    },
  },
};
