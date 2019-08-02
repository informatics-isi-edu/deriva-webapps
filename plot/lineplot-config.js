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
    x_axis_label: "month",                                  // plot x axis label
    y_axis_label: "value",                                             // plot y axis label
    plot_type: "line",                     // Values can be from : "line", "bar", "dot", "area"
    traces: [
        {
            uri: "/ermrest/catalog/65360/entity/product:lineplot",
            label: ["Browser All Events", "Browser Read Events"],                                      // name of trace in legend
            x_col: "requests",                                 // column name to use for x values
            y_col: ["viewer", "browser_readevents"],                                     // column name to use for y values
        },
        {
            uri: "https://dev.isrd.isi.edu/ermrest/catalog/65360/entity/product:lineplot",
            label: ["#Pseudo_id"],                                      // name of trace in legend
            x_col: "requests",                                 // column name to use for x values
            y_col: ["pseudo_id"],                                     // column name to use for y values
        },

    ],
    modeBarButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"] // Remove all the buttons
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = lineplotConfig;
}
