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
      PlotlyButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"] // Remove all the buttons

    },

  ],
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = lineplotConfig;
}
