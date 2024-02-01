# Plot App Functionality
This document aims to describe the functionality available for each plot type in the plot webapp.

## Table of Contents:
 * [General Configuration](#general-configuration)
   * [Markdown Links](#markdown-links)
   * [Legend](#legend)
   * [Graph Click](#graph-click)
 * [Configurable User Controls](#configurable-user-controls)
   * [User Control Types](#user-control-types)
     * [Dropdown](#dropdown)
     * [Facet Search Popup](#facet-search-popup)
   * [Grid Layout Configuration](#grid-layout-configuration)
     * [Breakpoints](#breakpoints)
   * [Layout](#layout)
 * [Violin Plot](#violin-plot)
   * [Url Parameters](#url-parameters)
   * [Selectors](#selectors)
     * [Gene](#gene)
     * [Study](#gene)
     * [Group By](#group-by)
 * [Other Plot Features](#other-plot-features)
   * [Plot Responsiveness](#plot-responsiveness)
   * [Plot data from a file](#plot-data-from-a-file)
   * [Plot data from path in response](#plot-data-from-path-in-response)


### General Configuration
For all plot types, there are some behaviors that are included as part of plotly and others that we have extended the functionality of plotly to use.

#### Markdown Links
Plotly allows for "html" like display values for the plot title, x/y axis titles, and the x/y tick labels. To support this, plot-config.js has `title_display_pattern` and `tick_display_markdown_pattern`. These properties use templating and markdown pattern expansion in ermrestJS similar to the markdown patterns in our model annotations. Other markdown templates are allowed but untested, so results may vary.

#### Legend
Plotly includes showing a legend for graphs that have multiple types of data shown, each pie in a pie chart or each violin. The legend can be configured in a few different ways. The position of the legend can be moved by setting the `x` and `y` value in `plotly.layout.legend`. These two properties are defined as a decimal number between -2 and 3 to adjust the legend a relative amount away from the origin of the graph. In case of a pie chart, the bottom left is treated as the origin. An example can be found in [plot-config-sample.js](/config/plot-config-sample.js). More properties that can be defined in `plotly.layout.legend` can be found in the [Plotly layout reference documentation](https://plotly.com/javascript/reference/layout/#layout-legend).

By default, when clicking on an option in the legend, a single click will hide that clicked trace from the plot and a double click will isolate that clicked trace and only show that one.

We have also extended the functionality of the legend, `legend_markdown_pattern`, to allow for "html" like displays similar to the plot title and x/y axis titles and tick labels. If this styling creates a link, this doesn't replace the on click events that plotly includes. To disable the default click events from plotly, we added a property called `disable_default_legend_click`.

#### Graph Click
By default, clicking on a part of the graph will not do anything. We extended the functionality of the plot to allow for clickable links on the graph itself. For instance, clicking a pie slice or a bar can be used to navigate to the defined url in `graphic_link_pattern`.

#### Graph Hover Events
By default, hovering on a part of the graph will show the x/y axis values. For instance, when no hover template is defined for a heatmap plot, plotly will show `x: E15.5_UreticTip_7092, y: 1442082_at, z: 4.18616` by default. We extended the functionality of the plot to allow customizable hover text on the graph. For instance, hovering on a block of heatmap can show the hover text as defined by the template `hovertemplate_display_pattern`.
  - NOTE: 
    - For the `violin` plot, the hover_template_displaypattern will only get applied to the scatter plot inside the violin plot(i.e. on hovering the datapoints) and not on the violin plot and the box plot. 
    - If one value or all values mentioned in the  `hovertemplate_display_pattern` is missing then also it will show the custom hover text the values that are available. For instance, if the `hovertemplate_display_pattern` is `Gene ID: {{{$url_parameters.Gene.data.NCBI_Ge}}}` where `NCBI_Ge` is not a valid key then it will just display `Gene ID` on hover.
`

### Configurable User Controls
User Controls can be configured and added in a grid like layout above each plot. To use this feature, 3 properties need to be defined in the `plot` object (more details in [Plot App Readme](/docs/user-docs/plot-app.md)). These 3 properties are `user_controls`, `grid_layout_config`, and `layout`. For an example of these properties defined, see `gudmap-todate-bar-selector` configuration in the [plot config sample](/config/plot-config-sample.js) document.

#### User Control Types
The different user control types we support are as follows:

##### Dropdown
Simple dropdown control that lists the data defined in the configuration (`request_info.data`) or fetched from the server (`request_info.url_pattern`). If both `request_info.url_pattern` and `request_info.data` are defined, data from the query is used if the response is non empty.

Example used in atlas-d2k deployment for filtering data based on consortium value:
```js
{
  uid: 'consortium',
  label: 'Consortium',
  request_info: {
    data: [{
      Name: 'ALL',
      Display: 'All'
    }, {
      Name: 'GUDMAP',
      Display: 'Gudmap'
    }, {
      Name: 'RBK',
      Display: 'RBK'
    }],
    default_value: 'ALL',
    value_key: 'Name',
    selected_value_pattern: '{{{$self.values.Display}}}'
  }
}
```

##### Facet Search Popup
This control "looks" like a dropdown but clicking on the input (or button) opens a recordset single select modal (similar functionality to the foreignkey input in recordedit app in Chaise).

Example using data in atlas-d2k deployment for filtering data based on the selected Gene:
```js
{
  uid: 'gene',
  label: 'Gene',
  type: 'facet-search-popup',
  request_info: {
    url_pattern: '/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)',
    default_value: '11669',
    value_key: 'NCBI_GeneID',
    selected_value_pattern: '{{{$self.values.NCBI_Symbol}}}'
  }
}
```

#### Grid Layout Configuration
The grid layout component uses [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout) library for positioning the user controls. This library supports 2 grid layouts, a set grid and a responsive grid. In our case, we are always using the responsive gridwith the following defaults defined. Most properties use the same name as the property from React Grid Layout, just in a different format to match our configuration language.

Default grid layout configuration properties:
```js
{
  auto_size: true,
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4 },
  margin: { lg: [10, 10], md: [10, 10], sm: [5, 5], xs: [5, 5] },
  container_padding: { lg: [12, 12], md: [10, 10], sm: [0, 0], xs: [0, 0] },
  row_height: 30,
}
```

##### Breakpoints
Breakpoints are a property used directly from React Grid Layout. This allows for different configuration properties to be defined for different screen sizes. The `breakpoints` property is an object where each `key` becomes the key in each of the subsequent propeties, `cols`, `margin`, and `container_padding`. These `key` names are also used in the `layout` property (more info in the next section).

From the default grid properties above, there are 4 `breakpoint` keys defined, `lg`, `md`, `sm`, and `xs`. In the subsequent properties, those same keys are used to define the number of `cols` in the grid, the `margin` size in pixels, and `container_padding` size in pixels.

#### Layout
With `user_controls` and `grid_layout_config` defined, `layout` can be set by defining an array of layout objects. The `layout` is for arranging the user controls in the actual grid based on the defined `breakpoints` and `cols` from `grid_layout_config`.

When defining one layout object, the total number of `grid units` is the number of `cols` for the current breakpoint. For example, if we are using the default configuration properties and looking at the app fullscreen (1920 x 1080), we are using the `lg` breakpoint key. This means there are 12 columns in the grid. For the layout object properties `x` and `y`, we would have indices 0-11. For the `w` property, the values would be 1-12 for how many "column" the control should span. In the case of height, the `row_height` property is used for the "height" of 1 `grid unit`. A control with `h = 2` with the default `row_height` value would have a height of 60 pixels.


### Violin plot
The following behaviors are currently only available when using plot_type "violin".

#### url parameters
The current use case gets its data based on a "Gene" and a set of "Studies". To initialize the plot, add `Study=<RID>` to set the chosen Study and add `NCBI_GeneID=<NCBI_GeneID>` to set the chosen Gene on load.

#### Selectors
There are 4 selectors available to change the presentation of data. 3 selectors are configuration based, setup in `plot-config.js` and the other selector adjusts the display of the chart content. The `Scale` selector defaults to showing the content with a `linear` scale. This can be changed to `log` which will increment all values by 1 (since log(0) is undefined) and redraw the chart.

##### Gene
The Gene selector allows for the user to select one gene to filter the Replicate Expression data by. Clicking on the input will open a modal dialog with a search interface. The search interface will be automatically filtered to only genes matching the selected study, if one is selected. This selector is setup by defining a `gene_uri_pattern` that the gene data is fetched from.

##### Study
The Gene selector allows for the user to select one or more studies to filter the Replicate Expression data by. Clicking on the "Select Some" button will open a search interface that allows for multiple studies to be selected. This popup also allows for studies to be unselected too. Once done with selections, clicking save will fetch new data for the plot based on the gene and selected studies. The "Select All" button will select all studies associated with the current gene and refetch data for the plot.

With selections made, individual studies can also be removed by clicking the "x" next to their name or by clicking "Clear All Studies". When there are no selected studies, no data will be shown in the plot and the title will say "No Data". This selector is setup by defining a `study_uri_pattern` that the study data is fetched from.

##### Group By
The Group By selector allows for the user to change how the data is grouped in the graph for the current gene and selected studies. Clicking on the input will open a dropdown menu with a list of options. This selector is setup by defining `config.xaxis.group_keys` that the dropdown is populated with.

### Other Plot Features

#### Plot Responsiveness
When the screen size is below 1000px( i.e the screen width threshold) the plots that have the legend array being passed into layout object will be displayed horizontally and at the bottom of the plot.  
- The legend text will be wrapped based on the screen size, ensuring that the width of the legends is limited to a certain value relative to the plot area. This prevents the legends from occupying excessive space and affecting the visibility of the plot along with resizing window handling. 
- The following is the step function responsible for determining the width of the legend and the wrapping limit: 
  - If screen is less than 1000px and legend is 50% of plot area then wrap the text upto 30 characters 
  which will make the legend of minimum possible width
  - If the number of violins is less than or equal to 7 and the width-to-plot-width ratio is greater than 0.40, 
  the legendNames array is modified similarly to the previous step, but using the character limit (i.e 80)
  - If the number of violins is between 7 and 30 (inclusive) and the width-to-plot-width ratio is greater than 0.30, 
  the legendNames array is modified similarly to the previous step, but using the character limit (i.e 65)
  - If the number of violins is greater than 30 and the width-to-plot-width ratio is greater than 0.3,
   the legendNames array is modified similarly to the previous step, but using the character limit (i.e 30)

#### Plot data from a file
This functionality enables to fetch data for the plot app from a specified file, which can be either in 'csv' or 'json' format. The data will be parsed and presented as a plot based on the content type of the file. To utilize this feature, two parameters can be configured in the config file:
 - `url_pattern`: The URL from which the data will be fetched.
 - `response_format`(optional): It specifies the file type to be used with the url_pattern parameter.
   -  The file type is expected to be formatted in proper `csv` or `json` format
   -  For `csv`, there should be a header row of column names first that labels what each value in a row is for
   -  For `json`, each value should be keyed by the column name

##### Error cases with fetching plot data from files
If the `response_format` doesn't match with the type of file provided by `url_pattern` then following alert warnings can be shown on top of the plot:
 - `Format of response data from “url_pattern” does not match configuration property “response_format” while trying to parse data as “csv”`
 - `Format of response data from “url_pattern” does not match configuration property “response_format” while trying to parse data as “json”`

If no `response_format` is provided and the file type in `url_pattern` is other than `json` or `csv` then following alert warning will be shown:
 - `Invalid format of response data from “url_pattern” while trying to parse data as “json”`

If any values other than `csv` or `json` is configured for `response_format` then following will be shown:
 - Alert warning saying that `Invalid value for “response_format”, expected “csv” or “json”`
 - Plot should have no data shown and title "No Data".

#### Plot data from path in response
In some cases the data to load for the plot app comes from a file defined in hatrac, and this file information is linked to the record by having it's path stored in a column in the database. An example of this is in the Cell Viability table on smite-dev, where the Processed File URL is a path that points to the file location with the data for the plot.

If `url_pattern` returns 1 row of data, that row has 1 key/value pair, and the value is a `path`, the plot app will make another `http.get` request assuming this `path` will return the data for the plot.

[Example](https://smite-dev.eitm.org/~jchudy/deriva-webapps/plot/?config=cv_heatmap_query) of fetching data from a path returned in the url_pattern response on smite-dev server (requires login).