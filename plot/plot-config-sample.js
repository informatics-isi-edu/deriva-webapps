/**
 * Please Note
 * This is a sample configuration file. Copy the contents to `plot-config.js` and run `make install_w_configs` to use this configuration
 */

var plotConfigs = {
    "study-violin": {
        plots: [
            {
                plot_type: "violin",
                geneUriPattern: "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/Study={{{$url_parameters.Study}}}/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)",
                defaultGene: {
                    data: {
                        NCBI_GeneID: "18231"
                    },
                    displayname: {
                        value: "Nxph1"
                    }
                },
                config: {
                    modeBarButtonsToRemove: ["select2d", "lasso2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                    displaylogo: false
                },
                groupKeys: ["Anatomical_Source", "Experiment", "Replicate", "Species", "Specimen", "Specimen_Type", "Stage"],
                defaultGroup: "Experiment", //xaxis
                yAxis: "TPM",
                plotTitlePattern: "Study {{{$url_parameters.Study}}}: TPM Expression",
                traces: [
                    {
                        // The request url that has to be used to fetch the data.
                        queryPattern: "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/Study={{{$url_parameters.Study}}}&NCBI_GeneID={{{$filters.NCBI_GeneID}}}"
                    }
                ]
            }
        ]
    },
  "rbk-config": {                                                                   // Array of object plots to be shown on the page
        page_title: "GUDMAP Release Status Dashboard",                                                     // Title of the page
        plots: [
          {                                                                   // Array of object plots to be shown on the page
            plot_title: "Number of Released",                                               // plot title
            plot_type: "pie",                                                 // ValuesValues can be from : "line", "bar", "dot", "area", "dot-lines", "pie", "histogram-horizontal", "histogram-verical"
            config: {
              showlegend: true,                                                 // to show the legend or not
              slice_label: "value",                                              // what to show on the slice of pie chart - value or "percent
              format_data: true,                                                  // - to use hack or not for formatting
            },
            traces: [

                {
                    uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Released=0)/$M@sort(Resource,ID)?limit=26",            // The request url that has to be used to fetch the data.
                    // legend: ["Browser All Events 1","Browser All Events 2","Browser Read Events 3", "Browser All Events 4","Browser All Events 5" ,"Browser Read Events 6", "Browser All Events 7","Browser All Events 8" ,"Browser Read Events 9", "Browser All Events 10","Browser All Events 11" ,"Browser Read Events 12"],            // name of traces in legend
                    data_col: "# Released",                           // name of the attribute of the data column
                    legend_col: "Resource",                     // name of the attribute of the legend column
                    show_percentage: false,                           // to show the percentage or not on slices
                    show_percentage: true
                },
            ],
            plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines", "hoverClosestPie"]
            // Plotly defualt buttons/actions to be removed
          }
        ]
  },
  "gudmap-config": "rbk-config",
  "*": {
    page_title: "GUDMAP Release Status Dashboard",                                                     // Title of the page
    plots: [{                                                                   // Array of object plots to be shown on the page
          plot_title: "Plot",                                               // plot title
          x_axis_label: "value",                                                    // plot x axis label
          y_axis_label: "Resource",                                                    // plot y axis label
          plot_type: "bar",
          config: {
            height: 1000,
            width: 1200,
            x_axis_type: 'log',                                                 // optional value
            margin: {                                                          // optional value
              l: 400,
              b :400                                                        // left margin for lengthy data labels.
            },
            x_axis_thousands_separator: true,               // to separte number by , after 4 digits
            format_data_x: true                                            // defualt : false - to use hack or not
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
                  uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Released=0)/$M@sort(Resource,ID)?limit=26",            // The request url that has to be used to fetch the data.
                  legend: ["# Released", "# Records"],            // name of traces in legend
                  x_col: ["# Released", "# Records"],                                                // column name to use for x values
                  y_col: ["Resource"],                          // array of column names to use for y values
                  orientation: "h",                            // Optional parameter for displaying the bar chart horizontally
                  // hovertemplate: ',d',
                  textfont: {
                    size: 10                                    // It will work till the bar size can accomodate the font size
                  },


              },
          ],
          plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
          // Plotly defualt buttons/actions to be removed
        }]
  },
};

// var plotConfig = {
//     page_title: "GUDMAP Release Status Dashboard",                                                     // Title of the page
//     plots: [
//       // {                                                                   // Array of object plots to be shown on the page
//       //   plot_title: "Subject Plot",                                               // plot title
//       //   plot_type: "histogram-horizontal",                                        // Values can be from : "line", "bar", "dot", "area", "dot-lines", "pie", "histogram-horizontal", "histogram-verical"
//       //   config: {
//       //     bargap: 0,                                                              // the distance between the bins in the histogram
//       //     showlegend: false,                                                      // to show the legend or not
//       //   },
//       //   traces: [
//       //       {
//       //           uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(%23%20Records,ID)?limit=26",            // The request url that has to be used to fetch the data.
//       //           data_col: "viewer",                                                // name of the attribute of the data column
//       //           legend: "legend_col",                                                // name of the attribute of the legend column
//       //       },
//       //   ],
//       //   plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines", "hoverClosestPie"] // Plotly defualt buttons/actions to be removed
//       // },
//       {                                                                   // Array of object plots to be shown on the page
//         plot_title: "Number of Released",                                               // plot title
//         plot_type: "pie",                                                 // ValuesValues can be from : "line", "bar", "dot", "area", "dot-lines", "pie", "histogram-horizontal", "histogram-verical"
//         config: {
//           showlegend: true,                                                 // to show the legend or not
//           slice_label: "value",                                              // what to show on the slice of pie chart - value or "percent
//           format_data: true,                                                  // - to use hack or not for formatting
//         },
//         traces: [
//
//             {
//                 uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Released=0)/$M@sort(Resource,ID)?limit=26",            // The request url that has to be used to fetch the data.
//                 // legend: ["Browser All Events 1","Browser All Events 2","Browser Read Events 3", "Browser All Events 4","Browser All Events 5" ,"Browser Read Events 6", "Browser All Events 7","Browser All Events 8" ,"Browser Read Events 9", "Browser All Events 10","Browser All Events 11" ,"Browser Read Events 12"],            // name of traces in legend
//                 data_col: "# Released",                           // name of the attribute of the data column
//                 legend_col: "Resource",                     // name of the attribute of the legend column
//                 show_percentage: false,                           // to show the percentage or not on slices
//                 show_percentage: true
//             },
//         ],
//         plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines", "hoverClosestPie"]
//         // Plotly defualt buttons/actions to be removed
//       },
//       {                                                                   // Array of object plots to be shown on the page
//         plot_title: "Number of Record",                                               // plot title
//         plot_type: "pie",                                                 // ValuesValues can be from : "line", "bar", "dot", "area", "dot-lines", "pie", "histogram-horizontal", "histogram-verical"
//         config: {
//           showlegend: true,                                                 // to show the legend or not
//         },
//         traces: [
//
//             {
//                 uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(Resource,ID)?limit=26",            // The request url that has to be used to fetch the data.
//                 // legend: ["Browser All Events 1","Browser All Events 2","Browser Read Events 3", "Browser All Events 4","Browser All Events 5" ,"Browser Read Events 6", "Browser All Events 7","Browser All Events 8" ,"Browser Read Events 9", "Browser All Events 10","Browser All Events 11" ,"Browser Read Events 12"],            // name of traces in legend
//                 data_col: "# Records",                           // name of the attribute of the data column
//                 legend_col: "Resource",                     // name of the attribute of the legend column
//                 show_percentage: false                           // to show the percentage or not on slices
//                 // appy_regex: true
//             },
//         ],
//         plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines", "hoverClosestPie"]
//         // Plotly defualt buttons/actions to be removed
//       },
//     //
//     //   {                                                                   // Array of object plots to be shown on the page
//     //   plot_title: "Subject Plot",                                               // plot title
//     //   x_axis_label: "month",                                                    // plot x axis label
//     //   y_axis_label: "value",                                                    // plot y axis label
//     //   plot_type: "line",                                                        // Values can be from : "line", "bar", "dot", "area", "dot+lines"
//     //   traces: [
//     //       {
//     //           uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(%23%20Records,ID)?limit=26",            // The request url that has to be used to fetch the data.
//     //           legend: ["# Released", "# Records"],            // name of traces in legend
//     //           y_col: ["# Released", "# Records"],                                                // column name to use for x values
//     //           x_col: ["Resource"],                          // array of column names to use for y values
//     //                                // array of column names to use for y values
//     //       },
//     //       {
//     //           uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(%23%20Records,ID)?limit=26",            // The request url that has to be used to fetch the data.
//     //           legend: ["# Released", "# Records"],            // name of traces in legend
//     //           y_col: ["# Released", "# Records"],                                                // column name to use for x values
//     //           x_col: ["Resource"],                          // array of column names to use for y values
//     //       },
//     //
//     //   ],
//     //   plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
//     //   // Plotly defualt buttons/actions to be removed
//     // },
//     {                                                                   // Array of object plots to be shown on the page
//       plot_title: "Plot",                                               // plot title
//       x_axis_label: "value",                                                    // plot x axis label
//       y_axis_label: "Resource",                                                    // plot y axis label
//       plot_type: "bar",                                                        // Values can be from : "line", "bar", "dot", "area", "dot+lines", "pie"
//       config: {
//         height: 1000,
//         width: 1200,
//         // x_axis_type: 'log',                                                 // Optional value
//         y_axis_type: 'log',                                                 // optional value
//         margin: {
//           l: 400,                                                               // 'l' means left margin for lengthy data labels.
//           b: 300,
//           t: 100                                                                // 'b' to spicify the bottom margin
//         },
//         y_axis_thousands_separator: true,
//         format_data_y: true                                                // defualt : false - to use hack or not
//       },
//       traces: [
//           {
//               uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Released=0)/$M@sort(Resource,ID)?limit=26",            // The request url that has to be used to fetch the data.
//               legend: ["# Released", "# Records"],            // name of traces in legend
//               y_col: ["# Released", "# Records"],                                                // column name to use for x values
//               x_col: ["Resource"],                          // array of column names to use for y values
//               orientation: "v"                            // Optional parameter for displaying the bar chart horizontally
//
//           },
//           // {
//           //     uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(%23%20Records,ID)?limit=26",            // The request url that has to be used to fetch the data.
//           //     legend: ["# Records"],            // name of traces in legend
//           //     x_col: ["# Records"],                                                // column name to use for x values
//           //     y_col: ["Resource"],                          // array of column names to use for y values
//           //     orientation: "h"                            // Optional parameter for displaying the bar chart horizontally
//           //
//           // },
//       ],
//       plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
//       // Plotly defualt buttons/actions to be removed
//     },
//     {                                                                   // Array of object plots to be shown on the page
//       plot_title: "Plot",                                               // plot title
//       x_axis_label: "value",                                                    // plot x axis label
//       y_axis_label: "Resource",                                                    // plot y axis label
//       plot_type: "bar",                                                        // Values can be from : "line", "bar", "dot", "area", "dot+lines", "pie"
//       config: {
//         height: 1000,
//         width: 1200,
//         x_axis_type: 'log',                                                 // optional value
//         margin: {                                                          // optional value
//           l: 400,
//           b :400                                                        // left margin for lengthy data labels.
//         },
//         x_axis_thousands_separator: true,               // to separte number by , after 4 digits
//         format_data_x: false                                            // defualt : false - to use hack or not
//       },
//       plotly_config:{                                                 // config is ignored if plotly_config is provided
//         title: "Plot",                                               // plot title
//         height: 1000,
//         width: 1200,
//         legend:{
//           traceorder: "reversed"                                      // order of the legend is reversed
//         },
//         xaxis: {
//           title: "value",                                            // plot x_axis label
//           tickformat: ',d',                                         // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
//           type: 'log',
//         },
//         yaxis: {
//           title: "Resource",                                            // plot y_axis label
//         }
//       },
//       traces: [
//           {
//               uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Released=0)/$M@sort(Resource,ID)?limit=26",            // The request url that has to be used to fetch the data.
//               legend: ["# Released", "# Records"],            // name of traces in legend
//               x_col: ["# Released", "# Records"],                                                // column name to use for x values
//               y_col: ["Resource"],                          // array of column names to use for y values
//               orientation: "h",                            // Optional parameter for displaying the bar chart horizontally
//               hovertemplate: ',d'
//
//
//           },
//           // {
//           //     uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(%23%20Records,ID)?limit=26",            // The request url that has to be used to fetch the data.
//           //     legend: ["# Records"],            // name of traces in legend
//           //     x_col: ["# Records"],                                                // column name to use for x values
//           //     y_col: ["Resource"],                          // array of column names to use for y values
//           //     orientation: "h"                            // Optional parameter for displaying the bar chart horizontally
//           //
//           // },
//       ],
//       plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
//       // Plotly defualt buttons/actions to be removed
//     },
//
//     // {                                                                   // Array of object plots to be shown on the page
//     //   plot_title: "Subject Plot",                                               // plot title
//     //   x_axis_label: "month",                                                    // plot x axis label
//     //   y_axis_label: "value",                                                    // plot y axis label
//     //   plot_type: "dot",                                                        // Values can be from : "line", "bar", "dot", "area", "dot+lines", "pie"
//     //   traces: [
//     //       {
//     //           uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(%23%20Records,ID)?limit=26",            // The request url that has to be used to fetch the data.
//     //           legend: ["# Released", "# Records"],            // name of traces in legend
//     //           y_col: ["# Released", "# Records"],                                                // column name to use for x values
//     //           x_col: ["Resource"],                          // array of column names to use for y values
//     //       },
//     //       {
//     //           uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(%23%20Records,ID)?limit=26",
//     //           legend: ["# Released", "# Records"],            // name of traces in legend
//     //           y_col: ["# Released", "# Records"],                                                // column name to use for x values
//     //           x_col: ["Resource"],                          // array of column names to use for y values
//     //       },
//     //
//     //   ],
//     //   plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
//     //   // Plotly defualt buttons/actions to be removed
//     // },
//     // {                                                                   // Array of object plots to be shown on the page
//     //   plot_title: "Subject Plot",                                               // plot title
//     //   x_axis_label: "month",                                                    // plot x axis label
//     //   y_axis_label: "value",                                                    // plot y axis label
//     //   plot_type: "dot-lines",                                                        // Values can be from : "line", "bar", "dot", "area", "dot-lines", "pie"
//     //   traces: [
//     //       {
//     //           uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/$M@sort(%23%20Records,ID)?limit=26",            // The request url that has to be used to fetch the data.
//     //           legend: ["# Released", "# Records"],            // name of traces in legend
//     //           y_col: ["# Released", "# Records"],                                                // column name to use for x values
//     //           x_col: ["Resource"],                          // array of column names to use for y values
//     //       },
//     //
//     //   ],
//     //   plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
//     //   // Plotly defualt buttons/actions to be removed
//     // }
//   ],
// };

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = plotConfigs;
}
