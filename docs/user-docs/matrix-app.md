# Matrix app

Matrix captures the available `datasets` for a combination of `x`, `y`, and `z` attributes. `x` and `z` are presented as rows and columns of the matrix, and different `z`s are displayed using colors in each cell of the matrix. Other than just showing the available datasets, clicking on labels and cells will take the users to the recordset app with appropriate facets (depending on where the user clicked).

## Configuration

To ensure the matrix app works properly, you must provide a `matrix-config.js` file. You can find an example of this file in [here](../../config/matrix-config-sample.js).

The matrix configuration file should be added to the `config` folder in the deployed folder. So assuming the deriva webapps are deployed under `/var/www/deriva-webapps/` location, the config file should be present at `/var/www/deriva-webapps/config/matrix-config.js`.

#### Overal structure
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

- `xURL`: Used for fetching the possible values of the `x` label. The URL should return `id` and `title` columns, where `title` is displayed to the users, and `id` is used for creating the facet.
- `yURL`: The same as above but for the `y` label.
- `zURL`: The same as above but for the `z` label (displayed at the bottom of the matrix).
- `xSource`:  Used for generating the facet blobs. The source path from the `dataset` table to the `xid` column.
- `xFacetColumn`: Used for generating facet blobs. The column that the facet filter should be applied to (for `x` table).
- `ySource`:  Used for generating the facet blobs. The source path from the `dataset` table to the `yid` column.
- `yFacetColumn`: Used for generating facet blobs. The column that the facet filter should be applied to (for `y` table).
- `zSource`:  Used for generating the facet blobs. The source path from the `dataset` table to the `zid` column.
- `zFacetColumn`: Used for generating facet blobs. The column that the facet filter should be applied to (for `z` table).
- `xyzsURL`: Used for creating the cell data. The URL must return an array of `zid`s for each combination of `xid` and `yid`s. In other words, group by `xid` and `yid` and return array aggregate of `zid`s.
- `catalogId`: The `dataset` table catalog (used for creating the recordset links).
- `schemaName`: The `dataset` table schema (used for creating the recordset links).
- `tableName`: The `dataset` table name (used for creating the recordset links)

### Optional properties
The following properties can be used to customize the display settings:

- `title_markdown`: The title that will be displayed above the matrix.
- `subtitle_markdown`: The subtitle that will be displayed above the matrix.
- `styles`: This property allows customization of the UI. The following are available properties of it:

  - `maxCols`: Restricts the grid size to the maximum number of columns. If not specified, we will fit as many columns as the viewport/window size allows.
  - `maxRows`: Restricts the grid size to the maximum number of rows. If not specified, we will fit as many rows as the viewport/window size allows.
  - `cellWidth`: Width of each cell within the grid (default: 25).
  - `cellHeight`: Height of each cell within the grid (default: 25).
  - `rowHeaderWidth`: Width of the row headers (default: 250).
  - `colHeaderHeight`: Height of the column headers (default: 50).
  - `legendHeight`: Height of the legend (default: 200).
  - `legendBarWidth`: Width of the legend bar (default: 55).
  - `legendBarHeight`: Height of the legend bar (default: 15).

### Example

Please refer to the [`matrix-config-sample.js`](../../config/matrix-config-sample.js) file for a proper example. But to convey the concept, assume the simple case that we have a table `dataset` that has `x`, `y`, and `z` columns. The configuration would be like the following:

```js
var matrixConfigs = {
  "*": {
    "catalogId": "1",
    "schemaName": "schema",
    "tableName": "dataset",
    "xURL": "/ermrest/catalog/1/attribute/schema:dataset/id:=x,title:=x",
    "yURL": "/ermrest/catalog/1/attribute/schema:dataset/id:=y,title:=y",
    "zURL": "/ermrest/catalog/1/attribute/schema:dataset/id:=z,title:=z",
    "xyzsURL": "/ermrest/catalog/1/attributegroup/schema:dataset/xid:=x,yid:=y;zid:=array(z)",
    "xSource": ["x"],
    "xFacetColumn": "x",
    "ySource": ["y"],
    "yFacetColumn": "y",
    "zSource": ["z"],
    "zFacetColumn": "z"
  }
}

```


## Example of using this app in an iframe

Given that you have a lot of flexibility on how to configure this app, the following is an example of an iframe that can be used in combination with the default `styles` that are included in the `matrix-config-sample.js`:

```html
<iframe src="/deriva-webapps/matrix/" height="100%" width="100%"
  frameBorder="0" style="height: 98vh; margin-top: 0.5em; margin-bottom: 0.5em;"></iframe>
```

The defined `height`, `width`, and `styles` will make sure the matrix takes as much space as it needs and fit the page content.
