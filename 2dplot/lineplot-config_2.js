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
    catalogId: 1,
    baseUri: 'https://prisms.isrd.isi.edu/ermrest/catalog/{{catalogId}}/attribute/',
    trace: {
      schema: ["prisms"],
      path:["breathe_platform_airbeam_view_dev_ft","breathe_platform_airbeam_view_dev_ft","breathe_platform_airbeam_view_dev_ft", "breathe_platform_heartrate_view_dev_ft", "breathe_platform_spirometer_trigger_view_dev_ft"],
      x: ["recorded_time"], //One to one mapping with y-axis
      y: ["pm_value", "rh_value", "f_value", "v_value", "value"],
      label: ["pm_value", "rh_value", "f_value", "v_value", "value"]
    },
    filters: [
      //subject
      subject_id: "159",
      query_pattern: "/subject_id={{subject_id}}&recorded_time::geq::",
      limit: 10000,                                                   // how many data rows do you want
      start_time: lineplot_start_time,                              // the value to begin querying data from
      duration: 5,                                                    // value to use to express the range of data, assumed as hours

    ],
    types: ["Line Plot", "Bar Plot", "Pie Chart", "Dot Plot", "Area Plot", "Histogram"],
    modeBarButtonsToRemove: ["scrollZoom", "zoom2d"]
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = lineplotConfig;
}
