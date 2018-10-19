# Heatmaps-app
## Note
This app uses Chaise assuming Chaise is at the same level as this folder.

## Configuration
The lineplot-config.js file has the following parameters which can be modified when using this app.

### Data parameters
1. subject_id: Id of the subject to fetch data for.
2. start_time: Timestamp value to begin fetching the set of data from.
3. limit: The number of rows to fetch for all sets.
4. duration: The range from the start time that data will be collected from.
5. traces: The query information for each line to display in the plot.

### Presentation parameters
1. plot_title: Title to be displayed above the line plot.
2. x_axis_label: Label to be displayed along the x-axis.
3. y_axis_label: Label to be displayed along the y-axis.

#### Note
If any of the above (Presentation or data) values is not mentioned, the app will throw an error. If you don't want to set a value, set it to `null`.

### Sample lineplot-config.js (also included in the repo)
```javascript
var lineplotConfig = {
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
    exports.config = lineplotConfig;
}
```

### Query Paramaters
The following Query Parameters can be appended to the url after a `?` character to override the configuration values:
1. subject_id
2. start_time
3. limit
4. duration

## Installation

### Installation Path
Change the installation path by changing the value of INSDIR in Makefile and then execute the "make install" command.
