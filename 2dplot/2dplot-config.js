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

var plotConfig = {
    plot_title: "Subject Plot",                                               // plot title
    x_axis_label: "recorded_time",                                  // plot x axis label
    y_axis_label: "value",                                             // plot y axis label
    plot_type: "line",                     // Values can be from : "Line Plot", "Bar Plot", "Pie Chart", "Dot Plot", "Area Plot"
    traces: [
        {
            path: "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_airbeam_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00&recorded_time::leq::2018-10-15T17%3A00%3A00.000-07%3A00/recorded_time,pm_value@sort(recorded_time)?limit=10000",    // schema:table and then anything else
            label: "pm_value",                                      // name of trace in legend
            x_col: "recorded_time",                                 // column name to use for x values
            y_col: "pm_value",                                     // column name to use for y values
        }, {
            path: "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_airbeam_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00&recorded_time::leq::2018-10-15T17%3A00%3A00.000-07%3A00/recorded_time,rh_value@sort(recorded_time)?limit=10000",
            label: "rh_value",
            x_col: "recorded_time",
            y_col: "rh_value"
        }, {
            path: "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_airbeam_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00&recorded_time::leq::2018-10-15T17%3A00%3A00.000-07%3A00/recorded_time,f_value@sort(recorded_time)?limit=10000",
            label: "f_value",
            x_col: "recorded_time",
            y_col: "f_value"
        }, {
            path: "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_heartrate_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00&recorded_time::leq::2018-10-15T17%3A00%3A00.000-07%3A00/recorded_time,v_value@sort(recorded_time)?limit=10000",
            label: "v_value",
            x_col: "recorded_time",
            y_col: "v_value"
        }, {
            path: "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_spirometer_trigger_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00&recorded_time::leq::2018-10-15T17%3A00%3A00.000-07%3A00/recorded_time,value@sort(recorded_time)?limit=10000",
            label: "value",
            x_col: "recorded_time",
            y_col: "value"
        }
    ],
    modeBarButtonsToRemove: ["scrollZoom", "zoom2d"] // Remove all the buttons
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = plotConfig;
}
