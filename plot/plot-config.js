var plotConfigs = {
    "gudmap-todate-pie": {
	page_title: "GUDMAP Release Status Dashboard",
	// Array of object plots to be shown on the page
        plots: [
            {
		plot_title: "Number of GUDMAP resources released to-date",
		// ValuesValues can be from : "line", "bar", "dot", "area", "dot-lines", "pie", "histogram-horizontal", "histogram-verical"
		plot_type: "pie",
		config: {
		    showlegend: true,           // to show the legend or not
		    slice_label: "value",       // what to show on the slice of pie chart - value or "percent
		    format_data: true,          // - to use hack or not for formatting
		},
		traces: [
                    {
			// The request url that has to be used to fetch the data.
			uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Released=0)/!(Resource=Antibody)/!(Resource::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
			// legend: ["Browser All Events 1","Browser All Events 2"],   // name of traces in legend
			data_col: "# Released",     // name of the attribute of the data column
			legend_col: "Resource",     // name of the attribute of the legend column
			show_percentage: false,     // to show the percentage or not on slices
                    },
		],
		// Plotly defualt buttons/actions to be removed
		plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines", "hoverClosestPie"]
            }
        ]
    },
    "gudmap-todate-bar": {
	page_title: "GUDMAP Resource Status Dashboard",
        // Array of object plots to be shown on the page
	plots: [
	    {
		plot_type: "bar",
		config: {
		    format_data_x: true   // defualt : false - to use hack or not
		},
		plotly_config:{
		    title: "Number of GUDMAP resources released to date (log scale)",
		    height: 450,
		    width: 1200,
		    margin: {
			l: 280,  // left margin for lengthy data labels.
			//b :50   // bottom margin for lengthy data labels.
		    },
		    legend:{
			traceorder: "reversed"    // order of the legend is reversed
		    },
		    xaxis: {
			title: "Number of Records",          // plot x_axis label
			// tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
			type: 'log',             // optional value: tickformat should compatible with type

		    },
		    yaxis: {
			// title: "Resources",       // plot y_axis label
		    }
		},
		traces: [
		    {
			// The request url that has to be used to fetch the data.
			uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Released=0)/!(Resource=Antibody)/!(Resource::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
			legend: ["# Released"],   // name of traces in legend
			x_col: ["# Released"],    // column name to use for x values
			y_col: ["Resource"],                   // array of column names to use for y values
			orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
			// hovertemplate: ',d',
			textfont: {
			    size: 10                           // It will work till the bar size can accomodate the font size
			},
		    },
		],
		// Plotly defualt buttons/actions to be removed
		plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
            }
	]
    },

    "rbk-todate-bar": {
	page_title: "GUDMAP Resource Status Dashboard",
        // Array of object plots to be shown on the page
	plots: [
	    {
		plot_type: "bar",
		config: {
		    format_data_x: true   // defualt : false - to use hack or not
		},
		plotly_config:{
		    title: "Number of RBK resources released to date (log scale)",
		    height: 450,
		    width: 1200,
		    margin: {
			l: 280,  // left margin for lengthy data labels.
			//b :50   // bottom margin for lengthy data labels.
		    },
		    legend:{
			traceorder: "reversed"    // order of the legend is reversed
		    },
		    xaxis: {
			title: "Number of Records",          // plot x_axis label
			// tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
			type: 'log',             // optional value: tickformat should compatible with type

		    },
		    yaxis: {
			// title: "Resources",       // plot y_axis label
		    }
		},
		traces: [
		    {
			// The request url that has to be used to fetch the data.
			uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=RBK/!(%23%20Released=0)/!(Resource=Antibody)/!(Resource::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
			legend: ["# Released"],   // name of traces in legend
			x_col: ["# Released"],    // column name to use for x values
			y_col: ["Resource"],                   // array of column names to use for y values
			orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
			// hovertemplate: ',d',
			textfont: {
			    size: 10                           // It will work till the bar size can accomodate the font size
			},
		    },
		],
		// Plotly defualt buttons/actions to be removed
		plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
            }
	]
    },

    "gudmap-release-all": {
	page_title: "GUDMAP Resource Status Dashboard",
        // Array of object plots to be shown on the page
	plots: [
	    {
		plot_title: "Number of assets created and released",
		x_axis_label: "Number of Records",
		y_axis_label: "Resources",
		plot_type: "bar",
		config: {
		    height: 1000,
		    width: 1000,
		    x_axis_type: 'log',
		    margin: {
			l: 400,  // left margin for lengthy data labels.
			b :400   // bottom margin for lengthy data labels.
		    },
		    x_axis_thousands_separator: true,
		    format_data_x: true   // defualt : false - to use hack or not
		},
		// config is ignored if plotly_config is provided. Plotly_config follows plotly syntax.
		plotly_config:{
		    title: "Number of GUDMAP resources created and released to date (log scale)",
		    height: 800,
		    width: 1200,
		    margin: {
			l: 280,  // left margin for lengthy data labels.
			//b :50   // bottom margin for lengthy data labels.
		    },
		    legend:{
			traceorder: "reversed"    // order of the legend is reversed
		    },
		    xaxis: {
			title: "Number of Records",          // plot x_axis label
			// tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
			type: 'log',             // optional value: tickformat should compatible with type

		    },
		    yaxis: {
			// title: "Resources",       // plot y_axis label
		    }
		},
		traces: [
		    {
			// The request url that has to be used to fetch the data.
			uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Records=0)/$M@sort(ID::desc::)?limit=26",
			legend: ["# Released", "# Created"],   // name of traces in legend
			x_col: ["# Released", "# Records"],    // column name to use for x values
			y_col: ["Resource"],                   // array of column names to use for y values
			orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
			// hovertemplate: ',d',
			textfont: {
			    size: 10                           // It will work till the bar size can accomodate the font size
			},
		    },
		],
		// Plotly defualt buttons/actions to be removed
		plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
            },

	    {
		plot_title: "Number of assets created and released in 2020",
		x_axis_label: "Number of Records",
		y_axis_label: "Resources",
		plot_type: "bar",
		config: {
		    height: 1000,
		    width: 1200,
		    x_axis_type: 'log',
		    margin: {
			l: 400,  // left margin for lengthy data labels.
			b :400   // bottom margin for lengthy data labels.
		    },
		    x_axis_thousands_separator: true,
		    format_data_x: true   // defualt : false - to use hack or not
		},
		// config is ignored if plotly_config is provided. Plotly_config follows plotly syntax.
		plotly_config:{
		    title: "Number of GUDMAP resources created and released in 2020 (log scale)",
		    height: 800,
		    width: 1200,
		    margin: {
			l: 280,  // left margin for lengthy data labels.
			//b :50   // bottom margin for lengthy data labels.
		    },
		    legend:{
			traceorder: "reversed"    // order of the legend is reversed
		    },
		    xaxis: {
			title: "Number of Records",          // plot x_axis label
			// tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
			type: 'log',             // optional value: tickformat should compatible with type

		    },
		    yaxis: {
			// title: "Resources",       // plot y_axis label
		    }
		},
		traces: [
		    {
			// The request url that has to be used to fetch the data.
			uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23%20Records=0)/$M@sort(ID::desc::)?limit=26",
			legend: ["# Released", "# Created"],   // name of traces in legend
			x_col: ["Released in Latest Year", "Created in Latest Year"],    // column name to use for x values
			y_col: ["Resource"],                   // array of column names to use for y values
			orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
			// hovertemplate: ',d',
			textfont: {
			    size: 10                           // It will work till the bar size can accomodate the font size
			},
		    },
		],
		// Plotly defualt buttons/actions to be removed
		plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
            },
	]
    },
    // "gudmap-releae-all": "*", // doesn't work for either dimension
    "rbk-release-all": {
	page_title: "RBK Resource Status Dashboard",
        // Array of object plots to be shown on the page
	plots: [
	    {
		plot_title: "Number of assets created and released",
		x_axis_label: "Number of Records",
		y_axis_label: "Resources",
		plot_type: "bar",
		config: {
		    height: 1000,
		    width: 1200,
		    x_axis_type: 'log',
		    margin: {
			l: 400,  // left margin for lengthy data labels.
			b :400   // bottom margin for lengthy data labels.
		    },
		    x_axis_thousands_separator: true,
		    format_data_x: true   // defualt : false - to use hack or not
		},
		// config is ignored if plotly_config is provided. Plotly_config follows plotly syntax.
		plotly_config:{
		    title: "Number of RBK resources created and released to date (log scale)",
		    height: 850,
		    width: 1200,
		    margin: {
			l: 280,  // left margin for lengthy data labels.
			//b :50   // bottom margin for lengthy data labels.
		    },
		    legend:{
			traceorder: "reversed"    // order of the legend is reversed
		    },
		    xaxis: {
			title: "Number of Records",
			// tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
			type: 'log',             // optional value: tickformat should compatible with type

		    },
		    yaxis: {
			// title: "Resources",
		    }
		},
		traces: [
		    {
			// The request url that has to be used to fetch the data.
			uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=RBK/!(%23%20Records=0)/$M@sort(ID::desc::)?limit=26",
			legend: ["# Released", "# Created"],   // name of traces in legend
			x_col: ["# Released", "# Records"],    // column name to use for x values
			y_col: ["Resource"],                   // array of column names to use for y values
			orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
			// hovertemplate: ',d',
			textfont: {
			    size: 10                           // It will work till the bar size can accomodate the font size
			},
		    },
		],
		// Plotly defualt buttons/actions to be removed
		plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
            },

	    {
		plot_title: "Number of assets created and released in 2020",
		x_axis_label: "Number of Records",
		y_axis_label: "Resources",
		plot_type: "bar",
		config: {
		    height: 1000,
		    width: 1200,
		    x_axis_type: 'log',
		    margin: {
			l: 400,  // left margin for lengthy data labels.
			b :400   // bottom margin for lengthy data labels.
		    },
		    x_axis_thousands_separator: true,
		    format_data_x: true   // defualt : false - to use hack or not
		},
		// config is ignored if plotly_config is provided. Plotly_config follows plotly syntax.
		plotly_config:{
		    title: "Number of RBK resources created and released in 2020 (log scale)",
		    height: 900,
		    width: 1200,
		    margin: {
			l: 280,  // left margin for lengthy data labels.
			//b :50   // bottom margin for lengthy data labels.
		    },
		    legend:{
			traceorder: "reversed"    // order of the legend is reversed
		    },
		    xaxis: {
			title: "Number of Records",          // plot x_axis label
			// tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
			type: 'log',             // optional value: tickformat should compatible with type

		    },
		    yaxis: {
			// title: "Resources",       // plot y_axis label
		    }
		},
		traces: [
		    {
			// The request url that has to be used to fetch the data.
			uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=RBK/!(%23%20Records=0)/$M@sort(ID::desc::)?limit=26",
			legend: ["# Released", "# Created"],   // name of traces in legend
			x_col: ["Released in Latest Year", "Created in Latest Year"],    // column name to use for x values
			y_col: ["Resource"],                   // array of column names to use for y values
			orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
			// hovertemplate: ',d',
			textfont: {
			    size: 10                           // It will work till the bar size can accomodate the font size
			},
		    },
		],
		// Plotly defualt buttons/actions to be removed
		plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
            },
	]
    },

};


if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = plotConfigs;
}
