# plot-app
## Note
This app uses Chaise assuming Chaise is at the same level as deriva-webapps folder.

## Configuration
The plot-config.js file has the following parameters which can be modified when using this app.
The config file specify the parameters for a particular key i.e. `rbk-config`

### Data parameters
1. page_title(optional): Title of the plot app.
2. plots: An array of the plots to be shown.

Each plot will have the following parameters:

1. plot_title: Title to be displayed above the line plot.
2. x_axis_label: Label to be displayed along the x-axis.
3. y_axis_label: Label to be displayed along the y-axis.
4. plot_type: The type of plot to be displayed i.e `line`, `bar`, `dot`, `area`, `dot-lines`, `pie`,  `histogram-horizontal`, `histogram-verical`.
5. config:  the config for the plot
      1. bargap: Distance between the bins in the histogram - Only valid for plot type as histogram
      2. showlegend: To show the legend or not
      3. height: Height of the plot // Default: 500
      4. width: width of the plot // Default: 1000
      5. slice_label: label to be shown on slice of a pie - only for pie chart // Default: "none", Available: "percent" or "value"
      6. x_axis_type: type to be used for x_axis // Values: "log"
      7. y_axis_type: type to be used for y_axis // Values: "log"
      8. margin: have l as an attribute which specifies left margin, similarly "r","t" and "b" for right, top and bottom
      9. x_axis_thousands_separator: to separate number by , after 4 digits // bool : true or false
      10. y_axis_thousands_separator: to separate number by , after 4 digits // bool : true or false
      10. format_data_x: false // defualt : false: to use the formatting of string for data or not. (Currently on valid for a particular case)
      10. format_data_y: false // defualt : false: to use the hack for data or not (Currently on valid for a particular case)
      10. format_data: false // defualt : false: to use the hack for data or not for 1d plot (Currently on valid for a particular case)
6. plotly_config: the config is ignored if plot_config is provided. For all plotly_config, see [here](https://plotly.com/javascript/configuration-options/)
7. traces: Contains the information about each each trace.
      1. uri : The url from which the data has to be fetched.
      2. legend: The value of legend to be shown for this trace.
      3. x_col: The column name for the x values
      4. y_col: An array of column name for the y values
      5. orientation: Optional parameter for displaying the bar chart horizontally // default: 'h'
      6. textfont: It will work till the bar size can accomodate the font size


For 1d plot,
7. traces: Contains the information about each each trace.
      1. uri : The url from which the data has to be fetched.
      2. legend: The value of legend to be shown for this trace.
      3. data_col: The column name for the values
      4. legend_col: An array of column name for the legend to be shown for the respective values
      5. show_percentage: To show the percentage or not on slices


8. plotlyButtonsToRemove: The button to be removed shown by plotly by defualt.

#### Note
If any of the above (Presentation or data) values is not mentioned, the app will throw an error. If you don't want to set a value, set it to `null`.

### Sample plot-config.js (also included in the repo)

#### 2-D Plot config
```javascript
var plotConfig = {
    title: "2dPlot",                                                            // Title of the page
    plots: [{                                                                   // Array of object plots to be shown on the page
      plot_title: "Subject Plot",                                               // plot title
      x_axis_label: "month",                                                    // plot x axis label
      y_axis_label: "value",                                                    // plot y axis label
      plot_type: "line",                                                        // Values can be from : "line", "bar", "dot", "area", "dot+lines"
      config: {
        bargap: 0,                                                              // the distance between the bins in the histogram - only for histogram
        showlegend: false,                                                      // to show the legend or not
      },
      plotly_config:{                                                 // config is ignored if plotly_config is provided
        title: "Plot",                                               // plot title
        height: 700,
        width: 1200,
        legend:{
          traceorder: "reversed"                                      // order of the legend is reversed
        },
        xaxis: {
          title: "value",                                            // plot x_axis label
          // tickformat: ',d',                                         // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
          type: 'log',                                                 // optional value: tickformat should compatible with type
        },
        yaxis: {
          title: "Resource",                                          // plot y_axis label
        }
      },
      traces: [
          {
              uri: "/ermrest/catalog/65361/entity/product:lineplot",            // The request url that has to be used to fetch the data.
              legend: ["Browser All Events", "Browser Read Events"],            // name of traces in legend
              x_col: "requests",                                                // column name to use for x values
              y_col: ["viewer", "browser_readevents"],                          // array of column names to use for y values
          },
          {
              uri: "/ermrest/catalog/65361/entity/product:lineplot",
              legend: ["#Pseudo_id"],
              x_col: "requests",
              y_col: ["pseudo_id"],
          },

      ],
      plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
      // Plotly defualt buttons/actions to be removed
    }],
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = plotConfig;
}
```

#### 1-D Plot
```javascript
var plotConfig = {
    title: "1dPlot",                                                            // Title of the page
    plots: [{                                                                   // Array of object plots to be shown on the page
      plot_title: "Subject Plot",                                               // plot title
      x_axis_label: "month",                                                    // plot x axis label
      y_axis_label: "value",                                                    // plot y axis label
      plot_type: "line",                                                        // Values can be from :"pie",  "histogram-horizontal", "histogram-verical"
      config: {
        bargap: 0,                                                              // the distance between the bins in the histogram - only for histogram
        showlegend: false,                                                      // to show the legend or not
      },
      traces: [
          {
              uri: "/ermrest/catalog/65361/entity/product:lineplot",            // The request url that has to be used to fetch the data.
              legend: ["Browser All Events", "Browser Read Events"],            // OPTIONAL: custom name of legend in the traces
              data_col: "requests",                                                // name of the attribute of the data column
              legend_col: "viewer",                                              // name of the attribute of the legend column

          },
      ],
      plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
      // Plotly defualt buttons/actions to be removed
    }],
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = plotConfig;
}
```

## Installation

### Installation Path
Change the installation path by changing the value of INSDIR in Makefile and then execute the `make install` command.
