# Treeview

## Configuration
The treeview-config.js file has the following parameters which can be modiified when using this app.

1. nodeClickCallback: An object of callback functions to be called on clicking a node when treeview is used by another app.
    ```javascript
    {
        "parentAppName1": function(node){
            //callback function to be used on each node click when treeview is embedded in "parentAppName1" 
        },
        "parentAppName1": function(node){
            //callback function to be used on each node click when treeview is embedded in "parentAppName2"
        }
    }
    ```
    #### Note
    By default on node click the record page corresponding to that node opens in a new tab

## Using treeview in other apps
To hide the navbar in the treeview app, add the query parameter `hideNavbar=true`.

To give a custom feature on node click when using treeview in other apps follow these 2 steps:

1. Append a query parameter called "Parent_App" to the treeview url with its value being the calling apps name.

For Example : The url used to embed the treeview in the boolean-search app could be :
    https://dev.rebuildingakidney.org/treeview/index.html?Parent_App=booleanSearch&hideNavbar=true

2. Update the callback function for node click in the "nodeClickCallback" object of treeview-config.js.
   The key value in the "nodeClickCallback" object should be the same as the query parameter value for "Parent_App" in the treeview url.
   
For Example: 
If the url used to embed the treeview in the boolean-search app is :
    https://dev.rebuildingakidney.org/treeview/index.html?Parent_App=booleanSearch&hideNavbar=true
Then a sample treeview-config.js would be like :
```javascript
var treeviewConfig = {
    nodeClickCallback:{
        booleanSearch: function(node) {
            var sourceObject = '{ "id": "' + node.dbxref + '", "name": "' + node.base_text + '" }';
            return 'parent.setSourceForFilter(' + sourceObject + ');';
        }
    }
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = treeviewConfig;
}

```
