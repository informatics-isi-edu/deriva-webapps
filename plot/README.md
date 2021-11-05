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

1. `plot_title`: Title to be displayed above the line plot. DEPRECATED, use `plotly.layout.title` instead
2. `x_axis_label`: Label to be displayed along the x-axis. DEPRECATED, use `plotly.layout.xaxis.title` instead
3. `y_axis_label`: Label to be displayed along the y-axis. DEPRECATED, use `plotly.layout.yaxis.title` instead
4. `plot_type`: The type of plot to be displayed i.e `line`, `bar`, `dot`, `area`, `dot-lines`, `pie`,  `histogram-horizontal`, `histogram-vertical`, `violin`.
5. `config`: the config for the plot
    1. `bargap`: Distance between the bins in the histogram - Only valid for plot type as histogram
    2. `showlegend`: To show the legend or not. DEPRECATED, define in `plotly.layout`
    3. `height`: Height of the plot - DEPRECATED, define in `plotly.layout.height` instead
    4. `width`: width of the plot - DEPRECATED, use `plotly.layout.width` instead
    5. `slice_label`: label to be shown on slice of a pie - only for pie chart // Default: "none", Available: "percent" or "value"
    6. `x_axis_type`: type to be used for x_axis - DEPRECATED, use `plotly.layout.xaxis.type` instead
    7. `y_axis_type`: type to be used for y_axis - DEPRECATED, use `plotly.layout.yaxis.type` instead
    8. `margin`: have l as an attribute which specifies left margin, similarly "r","t" and "b" for right, top and bottom - DEPRECATED, define in plotly.layout
    9. `x_axis_thousands_separator`: to separate number by , after 4 digits // bool : true or false
    11. `y_axis_thousands_separator`: to separate number by , after 4 digits // bool : true or false
    12. `format_data_x`: false // default : false: to use the formatting of string for data or not. (Currently on valid for a particular case)
    13. `format_data_y`: false // default : false: to use the hack for data or not (Currently on valid for a particular case)
    14. `format_data`: false // default : false: to use the hack for data or not for 1d plot (Currently on valid for a particular case)
    15. `xbins`: property used for `plot_type`: "histogram-vertical" to define how many bins to use for the xaxis
    16. `ybins`: property used for `plot_type`: "histogram-horizontal" to define how many bins to use for the yaxis
    17. `title_display_markdown_pattern`: markdown template string to be generated for use as plot title
        - overrides `plotly.layout.title`
    18. `xaxis`: object for options to override properties specific to the xaxis. The following attributes are currently supported:
        1. `title_display_markdown_pattern`: markdown template string to be generated for use as the xaxis title
            - overrides `plotly.layout.xaxis.title`
        2. `tick_display_markdown_pattern`: markdown template string to be generated for use as the tick label for the x-axis
    19. `yaxis`: object for options to override properties specific to the yaxis. The following attributes are currently supported:
        1. `title_display_markdown_pattern`: markdown template string to be generated for use as the yaxis title
            - overrides `plotly.layout.yaxis.title`
        2. `tick_display_markdown_pattern`: markdown template string to be generated for use as the tick label for the y-axis
    20. `disable_default_legend_click`: to suppress the default legend click event which toggles the corresponding trace in the chart display to show/hide. default value is false
    21. violin plot specific options:
        1. NOTE: options are not necessarily exclusive to other types, but only implemented for violin plots for now
        2. `xaxis.group_keys`: array of objects for "group by" dropdown to change how the data is grouped for each violin in the plot. Each object in the list consists of:
            - `column_name`: (required) the name of the column returned with the data
            - `title_display_pattern`: string for use in the "group by" dropdown
                - overrides `plotly.layout.xaxis.title`
            - `title_display_markdown_pattern`: markdown template string to be generated for the x-axis title
                - overrides `title_display_pattern` and `plotly.layout.xaxis.title`
            - `tick_display_markdown_pattern`: markdown template string to be generated for use as the tick label for each violin
            - `default`: set to true for whichever option should be selected by default
            - `graphic_link_pattern`: array of patterns to turn into links to use for clicking on the chart display
            - `legend_markdown_pattern`: array of patterns to turn into display values to use for display in the legend
        3. `xaxis.default_all_studies_group`: the `column_name` value from `xaxis.group_keys` array to use as a default when "all studies" is selected on page load
            - takes precedence over `default` property from the list of `group_keys` ONLY when "all studies" is selected
        4. `yaxis.group_key`: similar to x-axis, this matches the `column_name` returned with the data for measuring data on the yaxis
6. `plotly.config`: the config is ignored if plotly.config is provided. For available options, see the documentation [here](https://plotly.com/javascript/configuration-options/)
    1. avoid using `plotly_config`, this property will be DEPRECATED in the future
7. `plotly.layout`: the `layout` object passed directly to plotly when provided. For available options, see the documentation [here](https://plotly.com/javascript/configuration-options/)
8. traces: Contains the information about each each trace.
    1. Properties available to most plot types:
        1. uri : The url from which the data has to be fetched.
        2. legend: The value of legend to be shown for this trace.
        3. x_col: The column name for the x values
        4. y_col: An array of column name for the y values
        5. orientation: Optional parameter for displaying the bar chart horizontally // default: 'h'
        6. textfont: It will work till the bar size can accommodate the font size
    2. Extra properties for pie and histogram charts:
        1. data_col: The column name for the data aggregation. used instead of x_col or y_xol
        2. legend_col: The column name to use for display in the legend column
    3. Extra properties for pie and bar charts:
        1. legend_markdown_pattern: Display value to be used instead of legend_col.name.
        2. graphic_link_pattern: Link to use to navigate user when clicking on pie slice
    4. For violin plot:
        1. queryPattern: The url from which the data has to be fetched after applying handlebars templating
    5. 1d plot has very similar properties. Keeping separate to preserve old documentation:
        1. uri : The url from which the data has to be fetched.
        2. legend: The value of legend to be shown for this trace.
        3. data_col: The column name for the values
        4. legend_col: An array of column name for the legend to be shown for the respective values
        5. show_percentage: To show the percentage or not on slices
9. plotlyButtonsToRemove: The button to be removed shown by plotly by defualt. DEPRECATED, use `plotly.config.modeBarButtonsToRemove` instead

#### Note
If any of the above (Presentation or data) values is not mentioned, the app will throw an error. If you don't want to set a value, set it to `null`.

`legend_markdown_pattern`, `graphic_link_pattern`, `tick_display_markdown_pattern` can access data relative to `$self`. All markdown pattern can access data relative to the `$trace`.

TODO: Explain templateParams object.

violin template parameters:
```
templateParams: {
    $url_parameters: {
        Study: ""
    },
    $filters: {
        NCBI_GeneID: ""
    },
    // each row of data for graph added before templating each time
    $row: response.data[index]
}
```

default template parameters:
```
templateParams: {
    $traces: [data], // array of data returned from trace.uri fetch (response.data)
    // each row of data for graph added before templating each time
    $self: response.data[index]
}
```

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
