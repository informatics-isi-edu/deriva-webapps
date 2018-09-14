# Heatmaps-app
## Note
This app uses Chaise assuming Chaise is at the same level as this folder.

## Configuration
The heatmap-config.js file has the following parameters which can be modiified when using this app.

### Data parameters
1. titleColumn: Column whose value will be used the title of the heatmap
2. idColumn: Column whose value will be used as an ID of the heatmap
3. xColumn: Column whose value will be used as the X-axis of the heatmap
4. yColumn: Column whose value will be used as the Y-axis of the heatmap
6. zColumn: Column whose value will be used as the Z-axis of the heatmap
7. sortBy: Array of column name and sort order to be used for sorting while reading the records. It should be an array of the follwing objects:
    ```javascript
    {"column": "column_name", "descending": boolean}
    ```
    It can also be empty array [] to skip sorting.

#### Note
If any of the above values is not mentioned, the app will throw an error.

### Presentation parameters
1. width {Number} : Width of the heatmap. Default is 1200.
2. xTickAngle {Number} : Inclination of x-axis labels. Give 90 for vertical labels. Default is 50.
3. tickFontFamily {String} : Font of the axis labels. Default is "Courier".
4. tickFontSize {Number} : Font size of the axis labels. Default is 12.

### Sample heatmap-config.js
```javascript
var heatmapConfig = {
    data:{
        titleColumn: "Section",
        idColumn: "ID",
        xColumn: "Label",
        yColumn: "Probe_Set_Name",
        zColumn: "Value",
        sortBy:[
            {"column": "Section_Ordinal", "descending": false},
			{"column": "Probe_Set_Name", "descending": false},
			{"column": "Ordinal", "descending": false}
        ]
    },
    presentation:{
        width: 1200,
        xTickAngle: 50,
        tickFontFamily: "Courier",
        tickFontSize: 12
    }
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = heatmapConfig;
}

```
