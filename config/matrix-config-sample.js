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
// let speciesDataTypeUri = getAtlasURL('Released::gt::0/xid:=Species,yid:=Data_Type;num:=Released,Data_Type_Filter,Schema_Table')

/**
 * The base URI for the data API endpoint for the facebase example
 */
const fasebaseBaseURI = [
  '/ermrest/catalog/1/attributegroup/M:=isa:dataset/isa:dataset_species/vocab:species/name=Mus%20musculus/$M/isa:dataset_anatomy/',
  'Y:=vocab:anatomy/$M/isa:dataset_stage/X:=vocab:stage/sort_key::geq::0/sort_key::lt::10000/$M/isa:dataset_experiment_type/Z:=vocab:experiment_type'
].join(',')

var matrixConfigs = {
  '*': 'atlas',
  'atlas': {
    /**
     * API for the x axis data
     * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
     * - can contain other projected columns
     */
    xURL: speciesUri,

    /**
     * the pattern for x axis links
     */
    x_link_pattern: '{{{$location.chaise_path}}}record/#2/Vocabulary:Species/Name={{{title}}}',

    /**
     * API for the y axis data
     * - must at least `id` and `title`. `id` must be unique and `title is displayed to the users.
     * - can contain other projected columns
     */
    yURL: dataTypeUri,

    /**
     * the pattern for y axis links
     */
    y_link_pattern: '{{{$location.chaise_path}}}recordset/#2/{{{Schema_Table}}}/*::facets::{{#encodeFacet}}{{#jsonStringify}}{{{Data_Type_Filter.Released}}}{{/jsonStringify}}{{/encodeFacet}}',

    /**
     * this is added for coloring
     */
    zURL: speciesUri,

    /**
     * API for fetching the values of the cell
     */
    xysURL: speciesDataTypeUri,

    /**
     * the value that should be displayed on cell
     */
    xys_markdown_pattern: '{{{num}}}',

    /**
     * the pattern for cell links
     */
    xys_link_pattern: '{{{$location.chaise_path}}}recordset/#2/{{{Schema_Table}}}/*::facets::{{#encodeFacet}}{{#jsonStringify}}{{{Data_Type_Filter.Released}}}{{/jsonStringify}}{{/encodeFacet}}',

    /**
     * Defining the title shown for the matrix
     */
    title_markdown: 'Available data types by species',
    /**
     * Defines the subtitle shown for the matrix
     */
    subtitle_markdown: ' Click a cell or labels along the axes to navigate to the corresponding datasets.',
    /**
     * Optional properties to override the default parameters for displaying the matrix.
     */
    styles: {
      /**
       * Restricts the grid size to the given number of max columns. If not specified the grid grows infinitely
       * until it hits the viewport / window size that is defined by the iframe.
       */
      // maxCols: 30,
      /**
       * Restricts the grid size to the given number of max rows, If not specified the grid grows infinitely
       * until it hits the viewport / window size that is defined by the iframe.
       */
      // maxRows: 5,
      /**
       * Width of each cell within the grid
       */
      cellWidth: 75,
      /**
       * Height of each cell within the grid
       */
      cellHeight: 25,
      /**
       * Width of the row headers
       */
      rowHeader: {
        width: 300,
      },
      columnHeader: {
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
    xURL: fasebaseBaseURI + '/sort_key:=X:sort_key,id:=X:id,title:=X:name@sort(sort_key)',
    /**
     * API for the y axis data (must return id and title. other projected columns will be ignored.)
     */
    yURL: fasebaseBaseURI + '/id:=Y:id,title:=Y:name@sort(title)',
    /**
     * API for the z axis data (color axis) (must return id and title. other projected columns will be ignored.)
     */
    zURL: fasebaseBaseURI + '/id:=Z:id,title:=Z:name@sort(title)',
    /**
     * API for xyz axis (must return xid, yid, and zid. other projected columns will be ignored.)
     */
    xysURL: fasebaseBaseURI + '/xid:=X:id,yid:=Y:id;zid:=array(Z:name)',
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
        /**
         * Width of the row headers
         */
        width: 250
      },
      /**
       * Properties of the column headers
       */
      columnHeader: {
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
        height: 100,
        /**
         * Width of the legend bar
         */
        barWidth: 55,
        /**
         * Height of the legend bar
         */
        barHeight: 15,
        /**
         * Max number of lines showing the legend content
         */
        lineClamp: 2,
      }
    },
  },
};
