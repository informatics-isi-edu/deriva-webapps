var plotConfig = {
    page_title: "2-D Plot",                                                     // Title of the page
    plots: [
      {                                                                   // Array of object plots to be shown on the page
        plot_title: "Subject Plot",                                               // plot title
        plot_type: "pie",                                                        // Values can be from : "line", "bar", "dot", "area", "dot-lines", "pie"
        traces: [
            {
                uri: "/ermrest/catalog/65885/entity/product:lineplot",            // The request url that has to be used to fetch the data.
                legend: ["Browser All Events 1","Browser All Events 2","Browser Read Events 3", "Browser All Events 4","Browser All Events 5" ,"Browser Read Events 6", "Browser All Events 7","Browser All Events 8" ,"Browser Read Events 9", "Browser All Events 10","Browser All Events 11" ,"Browser Read Events 12"],            // name of traces in legend
                y_col: ["viewer"],                          // array of column names to use for y values

            },
        ],
        plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
        // Plotly defualt buttons/actions to be removed
      },
      {                                                                   // Array of object plots to be shown on the page
      plot_title: "Subject Plot",                                               // plot title
      x_axis_label: "month",                                                    // plot x axis label
      y_axis_label: "value",                                                    // plot y axis label
      plot_type: "line",                                                        // Values can be from : "line", "bar", "dot", "area", "dot+lines"
      traces: [
          {
              uri: "/ermrest/catalog/65885/entity/product:lineplot",            // The request url that has to be used to fetch the data.
              legend: ["Browser All Events", "Browser Read Events"],            // name of traces in legend
              x_col: "requests",                                                // column name to use for x values
              y_col: ["viewer", "browser_readevents"],                          // array of column names to use for y values
          },
          {
              uri: "/ermrest/catalog/65885/entity/product:lineplot",
              legend: ["#Pseudo_id"],
              x_col: "requests",
              y_col: ["pseudo_id"],
          },

      ],
      plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
      // Plotly defualt buttons/actions to be removed
    },
    {                                                                   // Array of object plots to be shown on the page
      plot_title: "Subject Plot",                                               // plot title
      x_axis_label: "month",                                                    // plot x axis label
      y_axis_label: "value",                                                    // plot y axis label
      plot_type: "bar",                                                        // Values can be from : "line", "bar", "dot", "area", "dot+lines", "pie"
      traces: [
          {
              uri: "/ermrest/catalog/65885/entity/product:lineplot",            // The request url that has to be used to fetch the data.
              legend: ["Browser All Events"],            // name of traces in legend
              x_col: "requests",                                                // column name to use for x values
              y_col: ["viewer"],                          // array of column names to use for y values
              orientation: "h"                            // Optional parameter for displaying the bar chart horizontally

          },
      ],
      plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
      // Plotly defualt buttons/actions to be removed
    },
    {                                                                   // Array of object plots to be shown on the page
      plot_title: "Subject Plot",                                               // plot title
      x_axis_label: "month",                                                    // plot x axis label
      y_axis_label: "value",                                                    // plot y axis label
      plot_type: "dot",                                                        // Values can be from : "line", "bar", "dot", "area", "dot+lines", "pie"
      traces: [
          {
              uri: "/ermrest/catalog/65885/entity/product:lineplot",            // The request url that has to be used to fetch the data.
              legend: ["Browser All Events", "Browser Read Events"],            // name of traces in legend
              x_col: "requests",                                                // column name to use for x values
              y_col: ["viewer", "browser_readevents"],                          // array of column names to use for y values
          },
          {
              uri: "/ermrest/catalog/65885/entity/product:lineplot",
              legend: ["#Pseudo_id"],
              x_col: "requests",
              y_col: ["pseudo_id"],
          },

      ],
      plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
      // Plotly defualt buttons/actions to be removed
    },
    {                                                                   // Array of object plots to be shown on the page
      plot_title: "Subject Plot",                                               // plot title
      x_axis_label: "month",                                                    // plot x axis label
      y_axis_label: "value",                                                    // plot y axis label
      plot_type: "dot-lines",                                                        // Values can be from : "line", "bar", "dot", "area", "dot-lines", "pie"
      traces: [
          {
              uri: "/ermrest/catalog/65885/entity/product:lineplot",            // The request url that has to be used to fetch the data.
              legend: ["Browser All Events", "Browser Read Events"],            // name of traces in legend
              x_col: "requests",                                                // column name to use for x values
              y_col: ["viewer", "browser_readevents"],                          // array of column names to use for y values
          },
          {
              uri: "/ermrest/catalog/65885/entity/product:lineplot",
              legend: ["#Pseudo_id"],
              x_col: "requests",
              y_col: ["pseudo_id"],
          },

      ],
      plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
      // Plotly defualt buttons/actions to be removed
    }
  ],
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = plotConfig;
}
