# Matrix app

Matrix captures the available `datasets` for a combination of `x`, `y`, and `z` attributes. `x` and `z` are presented as rows and columns of the matrix, and different `z`s are displayed using colors in each cell of the matrix. Other than just showing the available datasets, clicking on labels and cells will take the users to the recordset app with appropriate facets (depending on where the user clicked).

## Configuration

To ensure the matrix app works properly, you must provide a `matrix-config.js` file. You can find an example of this file in [here](../../config/matrix-config-sample.js). You can also find the TypeScript definitions [here](../../src/models/matrix-config.ts).

The matrix configuration file should be added to the `config` folder in the deployed folder. So assuming the deriva webapps are deployed under `/var/www/deriva-webapps/` location, the config file should be present at `/var/www/deriva-webapps/config/matrix-config.js`.

### Overal structure
The following is the overall structure expected structure of its content:

```js
var matrixConfigs = {
  "<config_key>": config_value
}
```

`config_key` is a string that can be used to name a configuration. This value should be used as the `config` query parameter to point the matrix app to the config. For example, you can have the following:

```js
var matrixConfigs = {
  "mouse": config1,
  "human": config2
}
```
And navigating to the matrix app with `?config=mouse` will ensure using "config1" and `?config=human` will use the other config.

You could also use the special `*` configuration key to be used when `config` query parameter is not defined. The [`matrix-config-sample.js`](../../config/matrix-config-sample.js) is using this key, so you don't need to provide any query parameters when using this config file.

### Required properties
The following are the properties that you must have:

- `x_url`: Used for fetching the possible values of the `x` label. The URL should return `id` and `title` columns, where `title` is displayed to the users, and `id` is used for creating the facet.
- `y_url`: The same as above but for the `y` label.
- `z_url`: The same as above but for the `z` label (displayed at the bottom of the matrix).
- `x_source`:  Used for generating the facet blobs. The source path from the `dataset` table to the `xid` column.
- `x_facet_column`: Used for generating facet blobs. The column that the facet filter should be applied to (for `x` table).
- `y_source`:  Used for generating the facet blobs. The source path from the `dataset` table to the `yid` column.
- `y_facet_column`: Used for generating facet blobs. The column that the facet filter should be applied to (for `y` table).
- `z_source`:  Used for generating the facet blobs. The source path from the `dataset` table to the `zid` column.
- `z_facet_column`: Used for generating facet blobs. The column that the facet filter should be applied to (for `z` table).
- `xys_url`: Used for creating the cell data. The URL must return an array of `zid`s for each combination of `xid` and `yid`s. In other words, group by `xid` and `yid` and return array aggregate of `zid`s.
- `catalog_id`: The `dataset` table catalog (used for creating the recordset links).
- `schema_name`: The `dataset` table schema (used for creating the recordset links).
- `table_name`: The `dataset` table name (used for creating the recordset links)

### Optional data properties

The following are optional properties that if defined will change how we're displaying the data:

- `x_tree_url`: If you want to display the `x` labels in a tree structure, use this property. The URL should return rows with `child_id` and `parent_id` that summarize the relationship between different `id`s that are returned by the `x_url`.
- `y_tree_url`: If you want to display the `y` labels in a tree structure, use this property. The URL should return rows with `child_id` and `parent_id` that summarize the relationship between different `id`s that are returned by the `y_url`.

### Optional display properties
The following properties can be used to customize the display settings:

- `title_markdown`: The title that will be displayed above the matrix.
- `subtitle_markdown`: The subtitle that will be displayed above the matrix.
- `hide_search_box`: Set this to true to hide the displayed search-box.
- `color_pallete`: Properties related to the color pallete. The following are available properties of it:
  - `default_option`: Changed the default color pallete that is used.
  - `options`: An array of color pallete options. Acceptable values are `"rainbow"`, `"parula"`, and `"viridis"`.
    - Setting this to an empty array (`[]`) will completely hide the color pallete selector.
    - If the default option is missing from this array, we will add it to the begining of the list.
- `styles`: This property allows customization of the UI. The following are available properties of it:

  - `max_displayed_columns`: Restricts the grid size to the maximum number of columns. If not specified, we will fit as many columns as the viewport/window size allows.
  - `max_displayed_rows`: Restricts the grid size to the maximum number of rows. If not specified, we will fit as many rows as the viewport/window size allows.
  - `cell_width`: Width of each cell within the grid (default: 25).
  - `cell_height`: Height of each cell within the grid (default: 25).
  - `row_header`: Properties related to column headers
    - `width`: The width that should be used for column headers (default: 250)
    - `scrollable`: A boolean to indicate whether you want the headers to have a horizontal scrollbar (default: false).
    - `scrollable_max_width`: Allows you to customize the maximum allowed width of the scrollable container. Only applicable if `scrollable` is set to `true`.
  - `column_header`: Properties related to row headers
    - `height`: The height that should be used for column headers (default: 50)
    - `scrollable`: A boolean to indicate whether you want the headers to have a vertical scrollbar (default: false).
    - `scrollable_max_height`: Allows you to customize the maximum allowed height of the scrollable container. Only applicable if `scrollable` is set to `true`.
  - `legend`: Properties related to legend
    - `height`: Height of the legend (default: 200).
    - `bar_width`: Width of the legend bar (default: 55).
    - `bar_height`: Height of the legend bar (default: 15).
    - `line_clamp`: Max number of lines showing the legend content (default: 1).

### Examples

#### 1. Using ermrest queries

Please refer to the [`matrix-config-sample.js`](../../config/matrix-config-sample.js) file for a proper example. But to convey the concept, assume the simple case that we have a table `dataset` that has `x`, `y`, and `z` columns. The configuration would be like the following:

```js
var matrixConfigs = {
  "*": {
    "catalog_id": "1",
    "schema_name": "schema",
    "table_name": "dataset",
    "x_url": "/ermrest/catalog/1/attribute/schema:dataset/id:=x,title:=x",
    "y_url": "/ermrest/catalog/1/attribute/schema:dataset/id:=y,title:=y",
    "z_url": "/ermrest/catalog/1/attribute/schema:dataset/id:=z,title:=z",
    "xyzsURL": "/ermrest/catalog/1/attributegroup/schema:dataset/xid:=x,yid:=y;zid:=array(z)",
    "x_source": ["x"],
    "x_facet_column": "x",
    "y_source": ["y"],
    "y_facet_column": "y",
    "z_source": ["z"],
    "z_facet_column": "z"
  }
}
```

#### 2. Using local files and tree headers

The URLs that are defined can also refer to a JSON file. In the following you can see an example of using local files and showing trees for both column and row headers:

```js
const baseUri = 'https://example.com/path/to/files/';

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
    title_markdown: 'Sample Data',
    styles: {
      maxCols: 30,
      maxRows: 100,
      cellWidth: 25,
      cellHeight: 25,
      rowHeader: {
        width: 250,
        scrollable: true,
      },
      columnHeader: {
        height: 80,
        scrollable: true,
      },
    },
  },
};
```

The following is a sample of some rows in each file:

- `x_values.json`:
```json
[
  {"id":"FACEBASE:1-4GHW","title":"E8.5"},
  {"id":"FACEBASE:1-4GHY","title":"E9.5"},
  {"id":"FACEBASE:1-4GJ0","title":"E10.5"},
]
```

- `x_values_tree.json`:
```json
[
  {"child_id":"FACEBASE:3-RXBE","parent_id":null},
  {"child_id":"FACEBASE:3-RXQR","parent_id":"FACEBASE:3-RXBE"},
  {"child_id":"FACEBASE:3-RXE0","parent_id":"FACEBASE:3-RXQR"},
  {"child_id":"FACEBASE:3-RXAC","parent_id":"FACEBASE:3-RXE0"},
  {"child_id":"FACEBASE:1-4GHY","parent_id":"FACEBASE:3-RXAC"},
]
```

- `y_values.json`:
```json
[
  {"id":"UBERON:0007237","title":"1st arch mandibular component"},
  {"id":"UBERON:0013155","title":"1st arch mandibular ectoderm"},
  {"id":"UBERON:0013156","title":"1st arch mandibular endoderm"},
  {"id":"UBERON:0009584","title":"1st arch mandibular mesenchyme"},
]
```
- `y_values_trees.json`:
```json
[
  {"child_id":"UBERON:0001049","parent_id":null},
  {"child_id":"UBERON:0002490","parent_id":"UBERON:0001049"},
  {"child_id":"UBERON:0011594","parent_id":"UBERON:0002490"},
  {"child_id":"FACEBASE:1-4FGT","parent_id":"UBERON:0011594"},
  {"child_id":"UBERON:0002342","parent_id":"FACEBASE:1-4FGT"},
]
```

- `z_values.json`:
```json
[
  {"id":"ERO:0001653","title":"atom probe tomography"},
  {"id":"OBI:0000695","title":"chain termination sequencing assay"},
  {"id":"OBI:0000716","title":"ChIP-seq assay"},
]
```

- `x_y_z_values.json`:
```json
[
  {"xid":"FACEBASE:1-4GHP","yid":"FACEBASE:1-4FEY","zid":["ChIP-seq assay", "RNA-seq assay"]},
  {"xid":"FACEBASE:1-4GHP","yid":"FACEBASE:1-4FF0","zid":["ChIP-seq assay", "RNA-seq assay"]},
  {"xid":"FACEBASE:1-4GHP","yid":"FACEBASE:1-4FG0","zid":["RNA-seq assay", "transcription profiling by array assay", "ChIP-seq assay"]},
]
```


## Example of using this app in an iframe

Given that you have a lot of flexibility on how to configure this app, the following is an example of an iframe that can be used in combination with the default `styles` that are included in the `matrix-config-sample.js`:

```html
<iframe src="/deriva-webapps/matrix/" height="100%" width="100%"
  frameBorder="0" style="height: 98vh; margin-top: 0.5em; margin-bottom: 0.5em;"></iframe>
```

The defined `height`, `width`, and `styles` will make sure the matrix takes as much space as it needs and fit the page content.
