var currentDate = Date.now();
var start = currentDate - (5*60*60*1000);
var startDate = new Date(start);

var month = startDate.getMonth() + 1;
if (month < 10) month = '0' + month;
var day = startDate.getDate();
if (day < 10) day = '0' + day;
var hour = startDate.getHours();
if (hour < 10) hour = '0' + hour;
var minutes = startDate.getMinutes();
if (minutes < 10) minutes = '0' + minutes;
var seconds = startDate.getSeconds();
if (seconds < 10) seconds = '0' + seconds;

var lineplot_start_time = startDate.getFullYear() + '-' + month + '-' + day + 'T' + hour + ':' + minutes + ':' + seconds;

var lineplotConfig = {
    plot_title: "Subject Plot",                                               // plot title
    x_axis_label: "recorded_time",                                  // plot x axis label
    y_axis_label: "value",                                             // plot y axis label
    subject_id: "159",                                              // identifier for the subject to get data from
    start_time: lineplot_start_time,                              // the value to begin querying data from
    limit: 10000,                                                   // how many data rows do you want
    duration: 5,                                                    // value to use to express the range of data, assumed as hours
    traces: [
        {
            path: "prisms:breathe_platform_airbeam_view_dev_ft",    // schema:table and then anything else
            label: "pm_value",                                      // name of trace in legend
            x_col: "recorded_time",                                 // column name to use for x values
            y_col: "pm_value",                                     // column name to use for y values
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
    ],
    types: ["Line Plot", "Bar Plot", "Pie Chart", "Dot Plot", "Area Plot", "Histogram"],
    modeBarButtonsToRemove: ["scrollZoom", "zoom2d"]
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = lineplotConfig;
}
