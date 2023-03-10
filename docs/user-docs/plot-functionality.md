# Plot App Functionality
This document aims to describe the functionality available for each plot type in the plot webapp.

## Table of Contents:
 * [General Configuration:](#general-configuration)
   * [Markdown Links](#markdown-links)
   * [Legend](#legend)
   * [Graph Click](#graph-click)
 * [Violin Plot](#violin-plot)
   * [Url Parameters](#url-parameters)
   * [Selectors](#selectors)
     * [Gene](#gene)
     * [Study](#gene)
     * [Group By](#group-by)


### General Configuration
For all plot types, there are some behaviors that are included as part of plotly and others that we have extended the functionality of plotly to use.

#### Markdown Links
Plotly allows for "html" like display values for the plot title, x/y axis titles, and the x/y tick labels. To support this, plot-config.js has `title_display_pattern` and `tick_display_markdown_pattern`. These properties use templating and markdown pattern expansion in ermrestJS similar to the markdown patterns in our model annotations. Other markdown templates are allowed but untested, so results may vary. See [README.md](/plot/README.md) for more information.

#### Legend
Plotly includes showing a legend for graphs that have multiple types of data shown, each pie in a pie chart or each violin. The legend can be configured in a few different ways. The position of the legend can be moved by setting the `x` and `y` value in `plotly.layout.legend`. These two properties are defined as a decimal number between -2 and 3 to adjust the legend a relative amount away from the origin of the graph. In case of a pie chart, the bottom left is treated as the origin. An example can be found in [plot-config-sample.js](/plot/plot-config-sample.js). More properties that can be defined in `plotly.layout.legend` can be found in the [Plotly layout reference documentation](https://plotly.com/javascript/reference/layout/#layout-legend).

By default, when clicking on an option in the legend, a single click will hide that clicked trace from the plot and a double click will isolate that clicked trace and only show that one.

We have also extended the functionality of the legend to allow for "html" like displays similar to the plot title and x/y axis titles and tick labels. If this styling creates a link, this doesn't replace the on click events that plotly includes. To disable the default click events from plotly, we added a property called `disable_default_legend_click`. See [README.md](/plot/README.md) for more information.

#### Graph Click
By default, clicking on a part of the graph will not do anything. We extended the functionality of the plot to allow for clickable links on the graph itself. For instance, clicking a pie slice or a bar can be used to navigate to the defined url in `graphic_clickable_links`. See [README.md](/plot/README.md) for more information.

### Violin plot
The following behaviors are currently only available when using plot_type "violin".

#### url parameters
The current use case gets its data based on a "Gene" and a set of "Studies". To initialize the plot, add `Study=<RID>` to set the chosen Study and add `NCBI_GeneID=<NCBI_GeneID>` to set the chosen Gene on load.

#### Selectors
There are 4 selectors available to change the presentation of data. 3 selectors are configuration based, setup in `plot-config.js` and the other selector adjusts the display of the chart content. The `Scale` selector defaults to showing the content with a `linear` scale. This can be changed to `log` which will increment all values by 1 (since log(0) is undefined) and redraw the chart.

##### Gene
The Gene selector allows for the user to select one gene to filter the Replicate Expression data by. Clicking on the input will open a modal dialog with a search interface. The search interface will be automatically filtered to only genes matching the selected study, if one is selected. This selector is setup by defining a `gene_uri_pattern` that the gene data is fetched from. See [README.md](/plot/README.md) for more information.

##### Study
The Gene selector allows for the user to select one or more studies to filter the Replicate Expression data by. Clicking on the "Select Some" button will open a search interface that allows for multiple studies to be selected. This popup also allows for studies to be unselected too. Once done with selections, clicking save will fetch new data for the plot based on the gene and selected studies. The "Select All" button will select all studies associated with the current gene and refetch data for the plot.

With selections made, individual studies can also be removed by clicking the "x" next to their name or by clicking "Clear All Studies". When there are no selected studies, no data will be shown in the plot and the title will say "No Data". This selector is setup by defining a `study_uri_pattern` that the study data is fetched from. See [README.md](/plot/README.md) for more information.

##### Group By
The Group By selector allows for the user to change how the data is grouped in the graph for the current gene and selected studies. Clicking on the input will open a dropdown menu with a list of options. This selector is setup by defining `config.xaxis.group_keys` that the dropdown is populated with. See [README.md](/plot/README.md) for more information.
