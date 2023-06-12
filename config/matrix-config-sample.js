/**
 * The base URI for the data API endpoint
 */
var baseUri =
  '/ermrest/catalog/1/attributegroup/M:=isa:dataset/isa:dataset_species/vocab:species/name=Mus%20musculus/$M/isa:dataset_anatomy/Y:=vocab:anatomy/$M/isa:dataset_stage/X:=vocab:stage/sort_key::geq::0/sort_key::lt::10000/$M/isa:dataset_experiment_type/Z:=vocab:experiment_type';

var matrixConfigs = {
  '*': {
    /**
     * API for the x axis data (must return id and title. other projected columns will be ignored.)
     */
    xURL: baseUri + '/sort_key:=X:sort_key,id:=X:id,title:=X:name@sort(sort_key)',
    /**
     * API for the y axis data (must return id and title. other projected columns will be ignored.)
     */
    yURL: baseUri + '/id:=Y:id,title:=Y:name@sort(title)',
    /**
     * API for the z axis data (color axis) (must return id and title. other projected columns will be ignored.)
     */
    zURL: baseUri + '/id:=Z:id,title:=Z:name@sort(title)',
    /**
     * API for xyz axis (must return xid, yid, and zid. other projected columns will be ignored.)
     */
    xysURL: baseUri + '/xid:=X:id,yid:=Y:id;zid:=array(Z:name)',
    /**
     * The source path of x. used for generating the facet blob
     */
    xSource: [{'inbound':['isa','dataset_stage_dataset_id_fkey']},{'outbound':['isa','dataset_stage_stage_fkey']},'id'],
    /**
     * key name of data from the x axis API response
     */
    xFacetColumn: 'id',
    /**
     * The source path of y. used for generating the facet blob
     */
    ySource: [{'inbound':['isa','dataset_anatomy_dataset_id_fkey']},{'outbound':['isa','dataset_anatomy_anatomy_fkey']},'id'],
    /**
     * key name of data from the y axis API response
     */
    yFacetColumn: 'id',
    /**
     * The source path of z. used for generating the facet blob
     */
    zSource: [{'inbound':['isa','dataset_experiment_type_dataset_id_fkey']},{'outbound':['isa','dataset_experiment_type_experiment_type_fkey']},'id'],
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
       * Width of the row headers
       */
      rowHeaderWidth: 250,
      /**
       * Height of the column headers
       */
      colHeaderHeight: 50,
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
