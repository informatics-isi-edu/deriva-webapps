/**
 * The base URI for the data API endpoint
 */
var baseUri =
  '/ermrest/catalog/1/attributegroup/M:=isa:dataset/isa:dataset_species/vocab:species/name=Mus%20musculus/$M/isa:dataset_anatomy/Y:=vocab:anatomy/$M/isa:dataset_stage/X:=vocab:stage/sort_key::geq::0/sort_key::lt::10000/$M/isa:dataset_experiment_type/Z:=vocab:experiment_type';

var matrixConfigs = {
  '*': {
    /**
     * API for the x axis data
     */
    xURL: baseUri + '/sort_key:=X:sort_key,id:=X:id,title:=X:name@sort(sort_key)',
    /**
     * API for the y axis data
     */
    yURL: baseUri + '/id:=Y:id,title:=Y:name@sort(title)',
    /**
     * API for the z axis data (color axis)
     */
    zURL: baseUri + '/id:=Z:id,title:=Z:name@sort(title)',
    /**
     * API for xyz axis
     */
    xysURL: baseUri + '/xid:=X:id,yid:=Y:id;zid:=array(Z:name)',
    /**
     * key name of data from the x axis API response
     */
    xFacetColumn: 'id',
    /**
     * key name of data from the y axis API response
     */
    yFacetColumn: 'id',
    /**
     * key name of data from the z axis API response
     */
    zFacetColumn: 'id',
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
      rowHeaderWidth: 300,
      /**
       * Height of the column headers
       */
      colHeaderHeight: 50,
      /**
       * Height of the legend
       */
      legendHeight: 170,
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
