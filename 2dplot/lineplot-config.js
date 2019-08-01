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
    catalogId: 1,
    baseUri: 'https://prisms.isrd.isi.edu/ermrest/catalog/{{catalogId}}/attribute/',
    trace: [
        //subject
        {
          path: "prisms:breathe_platform_airbeam_view_dev_ft",
          x: "recorded_time",
        }
        x: [{
          path: "prisms:breathe_platform_airbeam_view_dev_ft",    // schema:table and then anything else
          label: "pm_value",                                      // name of trace in legend
          x_col: "recorded_time",                                 // column name to use for x values
          y_col: "pm_value",                                     // column name to use for y values
        }]
        y: [{
          path: "prisms:breathe_platform_airbeam_view_dev_ft",    // schema:table and then anything else
          label: "pm_value",                                      // name of trace in legend
          x_col: "recorded_time",                                 // column name to use for x values
          y_col: "pm_value",                                     // column name to use for y values
        }]
        {
            filter_column_name: "Name", // column value stored for filter info in $filters[0], should match a column name in the projections list
            display_mode: "drop-down", // or false (not show)
            display_text: "{{{Name}}}",
            query_pattern: "/ermrest/catalog/2/attributegroup/M:=Vocabulary:Species/id:=M:Name,M:ID,M:Name@sort(Name)",
            schema_table: "Vocabulary:Species", // for logging purposes
            default_id: 'Mus musculus', // note: might not be required?
            selected_filter: {
                required_url_parameters: ["Species"], // if url param is present, false or null if not
                default: 'Mus musculus',
                selected_id: "{{{$url_parameters.Species}}}",
                if_empty_id: false // if the selected_id is not in the list (e.g. null/empty array/1+), use this stage.. If this is not defined or false, just throw an error
            }
        }
      ]

    var uriWithFilters = baseUri + trace.path + "/subject_id=" + $rootScope.subject_id + "&recorded_time::geq::" + UriUtils.fixedEncodeURIComponent(timestamp);
    var uriWithFilters = baseUri + trace.path + "/subject_id=" + $rootScope.subject_id + "&recorded_time::geq::" + UriUtils.fixedEncodeURIComponent(timestamp);
    if ($rootScope.duration) {
        var end_x = moment(timestamp).add($rootScope.duration, 'h').format(dataFormats.datetime.submission);
        uriWithFilters += "&recorded_time::leq::" + UriUtils.fixedEncodeURIComponent(end_x);
    }
    var uri = uriWithFilters + "/" + trace.x_col + "," + trace.y_col + "@sort(recorded_time)?limit=" + $rootScope.limit;
    // var ermrestURI1 = "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_airbeam_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00/recorded_time,pm_value,rh_value,f_value@sort(recorded_time)?limit=7200",

    trace: {
      x: [],
      y: []
    },
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
