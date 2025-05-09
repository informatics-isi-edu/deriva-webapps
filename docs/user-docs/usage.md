# Using deriva web tools

This document will go over the tools and best practices on how you can include Chaise-like UI elements to your page.

## Table of contents

- [Chaise apps](#chaise-apps)
  * [Navbar](#navbar)
  * [Login](#login)
- [Deriva webapps](#deriva-webapps)
- [Miscellaneous extensions](#miscellaneous-extensions)
  * [Search box on landing pages](#search-box-on-landing-pages)
    + [Option 1: Simple regex search](#option-1-simple-regex-search)
    + [Option2: Regex search on custom column set](#option2-regex-search-on-custom-column-set)
    + [Option 3: Exact match search on a column](#option-3-exact-match-search-on-a-column)
    + [Example using jQuery](#example-using-jquery)
  * [Customized ERMrest queries](#customized-ermrest-queries)
    + [Sending the request](#sending-the-request)
      - [Option 1: Using ERMrestJS HTTP module (recommended)](#option-1-using-ermrestjs-http-module-recommended)
      - [Option 2: Direct Ajax call](#option-2-direct-ajax-call)
    + [UI](#ui)
    + [Query example](#query-example)

## Chaise apps

To ensure consistent UI between Chaise and other clients, we provide the following Chaise apps that can be included in other places:

### Navbar

To ensure static sites are displaying the same navbar as Chaise, we allow injection of Chaise's `navbar` app. For more information please refer to [this document](https://github.com/informatics-isi-edu/chaise/blob/master/docs/user-docs/navbar-app.md).

### Login

If you don't want the full functionality of navbar and only want the authentication module of Chaise, you can use the login app directly. For more information please refer to [this document](https://github.com/informatics-isi-edu/chaise/blob/master/docs/user-docs/login-app.md).

## Deriva webapps

Small web applications that use other components of Deriva. You can use `iframe` to include these web applications in other web pages.

The applications are:

- [boolean-search](/boolean-search/): Allows users to construct structured filter and navigate to recordset. For more information please refer to [this issue](https://github.com/informatics-isi-edu/deriva-webapps/issues/5) (specific to RBK deployment.)
- [heatmap](/heatmap/): Display a heatmap based on the given `heatmap-config.js` (specific to RBK deployment.)
- [lineplot](/lineplot/): Display a line plot for the given columns in the `lineplot-config.js` (specific to RBK deployment.)
- [matrix](matrix-app.md): Summarize the available data based on combination of three different attributes.
- [plot](/plot/): A general plot drawing app that can work on different tables and deployments based on the given `plot-config.js` file.
- [treeview](/treview/): Display the parent-child relationship between vocabularies in a tree-like view for RBK deployment.


## Miscellaneous extensions

In this section we're going to focus on some extensions that we found useful in multiple projects.

### Search box on landing pages

Often, there is a need to provide a general search box on a landing page that automatically direct to corresponding search result of a recordset page. For example, user type in a gene name to get a list of genes. Here are the following options to achieve this:

#### Option 1: Simple regex search
To mimic the same behavior as the main search box in the recordset app, you need to create a URL that points to the recordset app with proper facets. Unless configured in the annotation to restrict the text search on a set of columns (e.g. Name, Synonyms), the main search box will do the regular expression search on all columns in the table.

ERMrestJS offers an `ERMrest.createSearchPath` API that returns the path used for constructing a URL to the recordset page.
```
String ERMrest.createSearchPath(catalogID, schemaName, tableName, searchText)
```
The following is an example of using this API:

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
 * - chaiseLocation: Where Chaise is installed.
 * - pcid: the query parameter used for log purposes.
 */
function search (searchText) {
  var catalogID = "<CATALOG_ID>";
  var schemaName = "<SCHEMA_NAME>";
  var tableName = "<TABLE_NAME>";
  var chaiseLocation = "/chaise/";
  var pcid = "?pcid=static/home/search";

  // create a path that Chaise understands using regex
  var path = ERMrest.createSearchPath(catalogID, schemaName, tableName, searchText);

  // open the url
  window.open(window.location.origin + chaiseLocation + "/recordset/" + path + pcid);
}
```

#### Option2: Regex search on custom column set

In some cases, the columns you want to search are different from the `search-box` definition on the recordset page. In this case, you need to provide the column names you wish to search using the `ERMrest.createSearchPath` API.

> Doing this is highly discouraged. Instead, you should [customize the `search-box` definition](https://github.com/informatics-isi-edu/ermrestjs/blob/master/docs/user-docs/annotation.md#tag-2019-source-definitions) and let ERMrestJS/Chaise handle this. This way, you have more options (you can search based on columns in a path and customize the display), and Chaise can also provide a better UI/UX to the users.


```js
var searchColumns = ["term", "synonyms"];
// create a path that Chaise understands
var path = ERMrest.createSearchPath(catalogID, schemaName, tableName, searchText, searchColumns);
```

The API will generate the path using ERMrest `ciregexp` filter predicate. While the recordset can properly show the values when this filter is used, it cannot provide a good UI and will show the raw filter predicate to the users. That's why we highly discourage providing column names.

#### Option 3: Exact match search on a column

The `ERMrest.createSearchPath` API mentioned above will trigger a regular expression search under the hood. If you would like an exact match instead, you should use the `ERMrest.createPath` API, which allows you to pass a facet object. To do the exact match, you need to ensure you're creating a proper facet object with the `searchText` as one of its `choices`. For example, in the following, we're doing an exact match on a column in the table:


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
 * - chaiseLocation: Where Chaise is installed.
 * - pcid: the query parameter used for log purposes.
 */
function exactMatch (searchText) {
  var catalogID = "<CATALOG_ID>";
  var schemaName = "<SCHEMA_NAME>";
  var tableName = "<TABLE_NAME>";
  var columnName = "<COLUMN_NAME>";  // e.g. Name
  var chaiseLocation = "/chaise/";
  var pcid = "?pcid=static/home/search";

  var facets;
  if (typeof searchText === "string" && searchText.length > 0) {
    facets = {
      "and": [
        {"source": columnName, "choices": [searchText]}
      ]
    };
  }

  // create a path that Chaise understands
  var path = ERMrest.createPath(catalogID, schemaName, tableName, facets);

  // open the url
  window.open(window.location.origin + chaiseLocation + "/recordset/" + path + pcid);
}
```

Since you're defining a `facets` object here, you can also do the exact match based on columns on any foreign key paths. You can also use `sourcekey` instead of `source` to refer to any of the sources defined in [the `source-definitions` annotation](https://github.com/informatics-isi-edu/ermrestjs/blob/master/docs/user-docs/annotation.md#tag-2019-source-definitions).

> For better UX, please make sure the `source`/`sourcekey` that you're defining here is part of the table's [`visible-columns`](https://github.com/informatics-isi-edu/ermrestjs/blob/master/docs/user-docs/annotation.md#tag-2016-visible-columns) annotation in the `filter` context.

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

  // create a path that Chaise understands
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


### Customized ERMrest queries

In some cases, you might want to display statistical numbers. Please refer to the [Query example](#query-example) section if you're looking for a quick example. We explain the recommended ways to send the request and show the numbers in the following.

In this section, we're focused mainly on ERMrest queries. If you want to send a request outside ERMrest, you can do so with the [Direct Ajax call method](#direct-ajax-call).

#### Sending the request
While you can use the object-oriented APIs that ERMrestJS provides, they are mainly tailored around Chaise UI elements and are not very flexible. Therefore we recommend sending direct HTTP requests to ERMrest. We provide the following options for making ERMrest requests:


##### Option 1: Using ERMrestJS HTTP module (recommended)

This method is recommended since internally will take care of retrying failed requests and other useful features built into the HTTP module. The following are steps to using ERMrestJS's HTTP module:

1. **Creating server object**: During configuration, ERMrestJS will add extra features to the HTTP module. To access the HTTP module, you must first create a `Server` using `ERMrest.ermrestFactory.getServer` API. This function accepts two parameters:
    - `ermrestServiceURI`: URI of the ERMrest service.
    - `contextHeaderParams`: An optional server header parameter for context logging appended to all the requests to the server.

    If you're relying on Chaise to do the ERMrestJS configuration in the previous step, you shouldn't provide the `contextHeaderParams`. In Chaise, we're defining this object with the following properties, and we recommend doing the same in other clients as well:

      - `cid`: The app name. It should be a unique value describing the app that this code is part of.
      - `wid`: A randomly generated unique id given to the window (shared between tabs). Chaise will attach this value to `window.name`. So if any of the Chaise apps are open, you should be able to use the same value. Otherwise, you would need to generate your own id.
      - `pid`: A unique id randomly generated for each running instance.

    The following is an example of calling this API:

    ```js
    // assuming EMrestJS is already configured (either manually or by included Chaise libraries)

    // the location of ermrest:
    var ermrestServiceURI = "https://example.com/ermrest";

    // if manually configured define this, otherwise set it to null
    var contextHeaderParams = { ... };

    // create a server object:
    var server = ERMrest.ermrestFactory.getServer(ermrestServiceURI, contextHeaderParams);
    ```

2. **Sending request**: Now that the setup is done and you have the `server` object, you can use it to send HTTP requests. For log purposes, we recommend passing a specific header (stored in the `ERMrest.contextHeaderName` property) with each request that captures what the request is trying to do. For example:

    ```js
    // the header that can be send with the request (used for log purposes)
    // more info here: https://github.com/informatics-isi-edu/chaise/blob/master/docs/user-docs/logging.md
    var headers = {};
    headers[ERMrest.contextHeaderName] = {
      "cid": "<name of the app or page>",
      "catalog": "<catalog-number>",
      "schema_table": "<schema-name>:<table-name>",
      "action": "<what-the-request-is-doing>"
    };

    // send the request:
    server.http.get(ermrestServiceURI + "/path-to-a-resource", {headers: headers}).then(function (response) {
      // handle the success
      var data = response.data;
      console.log(data);
    }).catch(function (err) {
      // handle the error
      console.error("failed to send the request");
      console.error(err);
    });

    ```

   In the example above, we're sending a header that deriva applications understand and log alongside the request. The logged object is following the minimum recommended attributes that we summarized [here](https://github.com/informatics-isi-edu/chaise/blob/master/docs/user-docs/logging.md#attributes).

##### Option 2: Direct Ajax call

As we mentioned, the previous method is recommended, but in case ERMrestJS is not available on your page, or you would rather handle the requests yourself, you can simply use the browser API:

```js
var url = "https://example.com/ermrest/...";
var el = document.querySelector("#item-1");
var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.onreadystatechange = function() {
  if(xhr.readyState == 4 && xhr.status == 200) {
    let data = JSON.parse(xhr.responseText);
    el.innerHTML = data;
  }
}
```

Or alternatrively, this can be achieved like the following with jQuery:

```js
var url = "https://example.com/ermrest/...";
var el = document.querySelector("#item-1");
$.getJSON(url, function (data) {
  // use the data
  el.innerHTML = data;
}).fail(function (error) {
  console.log(error);
  // show the error;
});
```
#### UI

In this section, we will include some guidelines that we think are important in this use case:

1. Since the data will be fetched using a secondary request, we recommend showing a spinner in place of numbers while the request is loading.
2. You should properly handle the cases where the server is not valid. Either by hiding the statistical data or showing a danger/error icon in place of the number.
3. If you want to send multiple requests, we recommend deploying a queuing or flow-control mechanism to ensure the server is not getting bombarded with multiple requests simultaneously. But if you're going to only send 2-3 requests on load, you don't necessarily need to complicate your code, and sending the requests together should not be an issue.

#### Query example

Let's assume we want to add the following statistics to https://dev.facebase.org homepage:

- number of `dataset` records
- number of `image` records

 Since navbar is already included, we don't need to worry about configuration or providing `contextHeaderParams`. Therefore the following is how the HTML and JavaScript code would look like:

 > In this example, we're showing individual spinners for each number. If you want one spinner for the whole container, please change the code accordingly.

```HTML
<html>
  ...

  <!-- ermrestjs and navbar.app.js are included somewhere in the document -->

  <body>
    ...

    <div class="stat-container">
      <div class="stat-content">
        <span class="stat-header">Datasets:</span>
        <span class="stat-number" id="stat-dataset-number">
          <!-- spinner: -->
          <i class="fas fa-sync-alt fa-spin"></i>
        </span>
      </div>
      <div class="stat-content">
        <span class="stat-header">Images:</span>
        <span class="stat-number" id="stat-imaging-number">
          <!-- spinner: -->
          <i class="fas fa-sync-alt fa-spin"></i>
        </span>
      </div>
    </div>

  </body>
</html>
```

```js
// must be included after ermrestjs
// this is needed and will ensure both ermrestjs and jquery are loaded
$(document).ready(function(){
  /**
   * NOTE: CALL THIS ONLY WHEN ERMRESTJS AND JQUERY ARE FULLY LOADED
   * Send a request and chagne the element's innerHTML with the response.
   * @param {string} selector the selector of HTML element where the data should go
   * @param {string} path the ERMrest request path
   * @param {string} action the log action (https://github.com/informatics-isi-edu/chaise/blob/master/docs/user-docs/logging.md#attributes)
   * @param {string} schemaTable the <schema>:<table> used for log purposes
   */
  function getERMrestStats (selector, path, action, schemaTable) {
    var ermrestServiceURI = "https://dev.facebase.org/ermrest";
    var server = ERMrest.ermrestFactory.getServer(ermrestServiceURI);
    var el = $(selector);

    // show spinner in place of the number:
    el.html('<i class="fas fa-sync-alt fa-spin"></i>');

    // create the header for log
    var headers = {};
    headers[ERMrest.contextHeaderName] = {
      "cid": "static/home",
      "catalog": "1",
      "schema_table": schemaTable,
      "action": action
    };

    // send the request
    server.http.get(ermrestServiceURI + path, {headers: headers}).then(function (response) {
      var cnt = 0;
      // NOTE this should be aligned with the expected result of the ermrest path
      if (Array.isArray(response.data) && response.data.length > 0 && response.data[0].cnt) {
        // remove `.toLocaleString()` if you don't want thousand separators
        cnt = response.data[0].cnt.toLocaleString();
      }

      // show the count
      el.html('<span>' + cnt + '</span>');

    }).catch(function (err) {
      console.error("failed to send the request");
      console.error(err);

      // in the following we've incldued three ways of handling errors:

      // show the universal Chaise error:
      // throw err;

      // silently fail and hide the stat-container:
      // $('.stat-container').css('display', 'none');

      // silently fail and show a danger/error icon in place of the number:
      el.html('<i title="Could not fetch the data" class="fas fa-exclamation-triangle"></i>');
    });

  }

  // dataset
  getERMrestStats(
    "#stat-dataset-number",
    "/catalog/1/aggregate/isa:dataset/cnt:=cnt_d(RID)",
    ":,stat/dataset:load",
    "isa:dataset"
  );

  // imaging
  getERMrestStats(
    "#stat-imaging-number",
    "/catalog/1/aggregate/isa:imaging_data/cnt:=cnt_d(RID)",
    ":,stat/imaging:load",
    "isa:imaging"
  );
});

```
While you can use any arbitary string for action, we recommend following the same pattern that we described [here](https://github.com/informatics-isi-edu/chaise/blob/master/docs/user-docs/logging.md#action-definition). 
  - In the example above we're not using any special `app-mode` or `stack-path`, that's why the action string starts with `:,`.
  - These result of these requests are displayed in the statistics section, that's why we're using `stat/imaging` and `stat/dataset` as the `ui-context`.
  - `load` is the common verb that we recommend using when you cannot think of a more specific one. `count` would be another good verb for this action string as both of them are just counting the number of rows in the database.



