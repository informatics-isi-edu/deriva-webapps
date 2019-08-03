# plot-app
## Note
This app uses Chaise assuming Chaise is at the same level as this folder.

## Configuration
The plot-config.js file has the following parameters which can be modified when using this app.

### Data parameters
1. title: Title of the plot app.
2. plots: An array of the plots.

Each plot will have the following parameters:

1. plot_title: Title to be displayed above the line plot.
2. x_axis_label: Label to be displayed along the x-axis.
3. y_axis_label: Label to be displayed along the y-axis.
4. plot_type: Label to be displayed along the y-axis.
5. traces: Label to be displayed along the y-axis.
  1.uri:
  2.legend:
  3.x_col:
  4.y_col:
6. PlotlyButtonsToRemove:

#### Note
If any of the above (Presentation or data) values is not mentioned, the app will throw an error. If you don't want to set a value, set it to `null`.

### Sample lineplot-config.js (also included in the repo)
```javascript
var lineplotConfig = {
    title: "2dPlot",
    plots: [{
      plot_title: "Subject Plot",                                               // plot title
      x_axis_label: "month",                                  // plot x axis label
      y_axis_label: "value",                                             // plot y axis label
      plot_type: "area",                     // Values can be from : "line", "bar", "dot", "area", dot+lines
      traces: [
          {
              uri: "/ermrest/catalog/65360/entity/product:lineplot",
              legend: ["Browser All Events", "Browser Read Events"],                                      // name of trace in legend
              x_col: "requests",                                 // column name to use for x values
              y_col: ["viewer", "browser_readevents"],                                     // column name to use for y values
          },
          {
              uri: "/ermrest/catalog/65360/entity/product:lineplot",
              legend: ["#Pseudo_id"],                                      // name of trace in legend
              x_col: "requests",                                 // column name to use for x values
              y_col: ["pseudo_id"],                                     // column name to use for y values
          },

      ],
      modeBarButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"] // Remove all the buttons

    },{
      plot_title: "Subject Plot",                                               // plot title
      x_axis_label: "month",                                  // plot x axis label
      y_axis_label: "value",                                             // plot y axis label
      plot_type: "line",                     // Values can be from : "line", "bar", "dot", "area", dot+lines
      traces: [
          {
              uri: "/ermrest/catalog/65360/entity/product:lineplot",
              legend: ["Browser All Events", "Browser Read Events"],                                      // name of trace in legend
              x_col: "requests",                                 // column name to use for x values
              y_col: ["viewer", "browser_readevents"],                                     // column name to use for y values
          },
          {
              uri: "/ermrest/catalog/65360/entity/product:lineplot",
              legend: ["#Pseudo_id"],                                      // name of trace in legend
              x_col: "requests",                                 // column name to use for x values
              y_col: ["pseudo_id"],                                     // column name to use for y values
          },

      ],
      modeBarButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"] // Remove all the buttons

    },

  ],
}
var plotConfig = {
    plot_title: null,                                               // plot title
    x_axis_label: "recorded_time",                                  // plot x axis label
    y_axis_label: null,                                             // plot y axis label
    subject_id: "159",                                              // identifier for the subject to get data from
    start_time: "2018-10-15T12:00:00",                              // the value to begin querying data from
    limit: 10000,                                                   // how many data rows you want
    duration: 5,                                                    // timeframe in hours after start_time to collect data from
    traces: [
        {
            path: "prisms:breathe_platform_airbeam_view_dev_ft",    // schema:table and then anything else
            label: "pm_value",                                      // name of trace in legend
            x_col: "recorded_time",                                 // column name to use for x values
            y_col: "pm_value"                                       // column name to use for y values
        }, {
            path: "prisms:breathe_platform_airbeam_view_dev_ft",
            label: "rh_value",
            x_col: "recorded_time",
            y_col: "rh_value"
        }, {
            path: "prisms:breathe_platform_airbeam_view_dev_ft",
            label: "f_value",
            x_col: "recorded_time",
            y_col: "f_value"
        }, {
            path: "prisms:breathe_platform_heartrate_view_dev_ft",
            label: "v_value",
            x_col: "recorded_time",
            y_col: "v_value"
        }, {
            path: "prisms:breathe_platform_spirometer_trigger_view_dev_ft",
            label: "value",
            x_col: "recorded_time",
            y_col: "value"
        }
    ]
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = plotConfig;
}
```

## Installation

### Installation Path
Change the installation path by changing the value of INSDIR in Makefile and then execute the "make install" command.
