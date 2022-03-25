# Using deriva web tools

## Chaise apps

### Navbar

To ensure static sites are displaying the same navbar as Chaise, we allow injection of Chaise's `navbar` app. For more information please refer to [this document](https://github.com/informatics-isi-edu/chaise/blob/master/docs/user-docs/navbar-app.md).

### Login

If you don't want the full functionality of navbar and only want the authentication module of Chaise, you can use the login app directly. For more information please refer to [this document](https://github.com/informatics-isi-edu/chaise/blob/master/docs/user-docs/login-app.md).

## Deriva webapps

Small web applications that use other components of Deriva. 

The applications are:

- [boolean-search](/boolean-search/): Allows users to construct structured filter and navigate to recordset. For more information please refer to [this issue](https://github.com/informatics-isi-edu/deriva-webapps/issues/5) (specific to RBK deployment.)
- [heatmap](/heatmap/): Display a heatmap based on the given `heatmap-config.js` (specific to RBK deployment.)
- [lineplot](/lineplot/): Display a line plot for the given columns in the `lineplot-config.js` (specific to RBK deployment.)
- [plot](/plot/): A general plot drawing app that can work on different tables and deployments based on the given `plot-config.js` file.
- [treeview](/treview/): Display the parent-child relationship between vocabularies in a tree-like view for RBK deployment.


## Miscellaneous extensions

### Search box

To mimic the same behavior as the search box present in the recordset app, you need to create a URL that points to the recordset app with proper facets.

To make this process easier, ERMrestJS offers a `ERMrest.createSearchPath` API that returns the path that can be used for consturcting a URL to recordset page. The following is an example of using this API:

```js
/**
 * Given a search text, open a new url to recordset
 * Make sure the following variables have the proper values:
 * 
 * - catalogID: the ID of catalog, e.g. "1"
 * - schemaName: the name of schema, e.g. "isa"
 * - tableName: the name of table, e.g. "dataset"
 * 
 * The following are optional variables that you can change:
 * - chaiseLocation: Where chaise is installed.
 * - pcid: the query parameter used for log purposes.
 */
function search (searchText) {
  var catalogID = "<CATALOG_ID>";
  var schemaName = "<SCHEMA_NAME>";
  var tableName = "<TABLE_NAME>";
  var chaiseLocation = "/chaise/";
  var pcid = "?pcid=static/home/search";

  // create a path that chaise understands
  var path = ERMrest.createSearchPath(catalogID, schemaName, tableName, searchText);

  // open the url
  window.open(window.location.origin + chaiseLocation + "/recordset/" + path + pcid);
}
```

#### Custom column searchs

> Doing this is highly discouraged. You should instead customize the `search-box` definition, and let ERMrestJS/Chaise handle this. This way, you have more options (you can search based on columns in a path, and also can customize the display) and Chaise can also provide a better UI/UX to the users.

In some cases the columns that you want to search are different from the `search-box` definition on the recordset. In this case you just need to provide the column names that you want to search using the `ERMrest.createSearchPath` API. For example:

```js
var columnNames = ["term", "synonyms"];
// create a path that chaise understands
var path = ERMrest.createSearchPath(catalogID, schemaName, tableName, searchText, searchColumns);
```

To support this, the API wil generate the path using ERMrest `ciregexp` filter predicate. While recordset can properly show the values when this filter is used, it cannot provide a good UI and will show the raw filter predicate to the users.

#### Example using jQuery

It's up to you how you want to implement the actual search box and HTML structure, but in the following we've included an example of a search box using jQuery:

```html
<form class="search search-form" id="main-search">
  <div class="input-group">
    <input 
      type="text" class="form-control" name="search_term" 
      placeholder="Search genitourinary data in GUDMAP" 
    />
    <span class="input-group-btn">
      <button class="btn btn-default" type="submit">
        <i class="fa fa-search" aria-hidden="true"></i>
      </button>
    </span>
  </div>
  <div class="search-panel">
    <input type="radio" id="gene" name="search_param" value="gene" checked />
    <label for="gene">GENE</label>
    <input type="radio" id="anatomy" name="search_param" value="anatomy" />
    <label for="anatomy">ANATOMY</label>
    <input type="radio" id="species" name="search_param" value="species" />
    <label for="species">SPECIES</label>
    <input type="radio" id="proteins" name="search_param" value="proteins" />
    <label for="proteins">PROTEIN</label>
  </div>
</form>
```

```js
function search(searchParam, searchText) {
  searchParam = typeof searchParam === "string" ? searchParam : "";
  var schemaName, tableName;
  var pcid = "?pcid=static/home/search";
  switch(searchParam){
    case 'anatomy':
      schemaName = 'Vocabulary';
      tableName = 'Anatomy';
      break;
    case "species":
      schemaName = 'Vocabulary';
      tableName = 'Species';
      break;
    case 'proteins':
      schemaName = 'Common';
      tableName = 'Protein';
      break;
    case "gene":
    default: // all
      schemaName = 'Common';
      tableName = 'Gene';
      break;
  }

  // create a path that chaise understands
  var path = ERMrest.createSearchPath("2", schemaName, tableName, searchText);

  // open the url
  window.open(window.location.origin + chaiseLocation + "/recordset/" + path + pcid);
}

$(document).ready(function(){
  $("#main-search").submit(function (e) {
    e.preventDefault();
    var $inputs = {};
    $.each($(this).serializeArray(), function(i, field) {
        $inputs[field.name] = field.value;
    });
    // call the search
    search($inputs.search_param, $inputs.search_term);
  });
});
```

