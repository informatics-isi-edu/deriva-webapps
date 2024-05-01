# plot-app
## Note
This app uses Chaise assuming Chaise is at the same level as deriva-webapps folder.

## Configuration
The plot-config.js file has the following parameters which can be modified when using this app.
The config file specify the parameters for a particular key i.e. `rbk-config`

### Data parameters
1. page_title(optional): Title of the plot app. DEPRECATED, use `headTitle` instead
2. headTitle: Title of the plot app.
3. top_right_link_text: text to show for the link in top right corner to show plot with all controls. Only supported for violin plot currently
4. plots: An array of the plots to be shown.

Each object in the `plots` array can have the following parameters:

1. `plot_title`: Title to be displayed above the line plot. DEPRECATED, use `plotly.layout.title` instead
2. `x_axis_label`: Label to be displayed along the x-axis. DEPRECATED, use `plotly.layout.xaxis.title` instead
3. `y_axis_label`: Label to be displayed along the y-axis. DEPRECATED, use `plotly.layout.yaxis.title` instead
4. `plot_type`: The type of plot to be displayed i.e `bar`, `pie`, `scatter`, `histogram`, `violin`, and `heatmap`
5. `app_styles`: the styles to attach to different parts of the app page
    1. `width`: A decimal value between 0 and 1 for how much space the grid layout should fill on the plot page
    2. `max_width`: A string value representing the width in pixels of the plot container excluding the navbar (i.e. `1500px`)
    3. `max_height`: A string value representing the height in pixels of the plot container excluding the navbar (i.e. `1200px`)
6. `config`: the config for the plot
    1. `bargap`: Distance between the bins in the histogram - Only valid for plot type as histogram
    2. `showlegend`: To show the legend or not. DEPRECATED, define in `plotly.layout`
    3. `height`: Height of the plot - DEPRECATED, define in `plotly.layout.height` instead
    4. `width`: width of the plot - DEPRECATED, use `plotly.layout.width` instead
    5. `slice_label`: label to be shown on slice of a pie - only for pie chart // Default: "none", Available: "percent" or "value"
    6. `x_axis_type`: type to be used for x_axis - DEPRECATED, use `plotly.layout.xaxis.type` instead
    7. `y_axis_type`: type to be used for y_axis - DEPRECATED, use `plotly.layout.yaxis.type` instead
    8. `margin`: have l as an attribute which specifies left margin, similarly "r","t" and "b" for right, top and bottom - DEPRECATED, define in plotly.layout
    9. `x_axis_thousands_separator`: to separate number by , after 4 digits // bool : true or false
    11. `y_axis_thousands_separator`: to separate number by , after 4 digits // bool : true or false
    12. `format_data_x`: false // default : false: to use the formatting of string for data or not. (Currently on valid for a particular case)
    13. `format_data_y`: false // default : false: to use the hack for data or not (Currently on valid for a particular case)
    14. `format_data`: false // default : false: to use the hack for data or not for 1d plot (Currently on valid for a particular case)
    15. `xbins`: property used for `plot_type`: "histogram-vertical" to define how many bins to use for the xaxis
    16. `ybins`: property used for `plot_type`: "histogram-horizontal" to define how many bins to use for the yaxis
    17. `title_display_markdown_pattern`: markdown template string to be generated for use as plot title
        - overrides `plotly.layout.title`
    18. `xaxis`: object for options to override properties specific to the xaxis. The following attributes are currently supported:
        1. `title_display_markdown_pattern`: markdown template string to be generated for use as the xaxis title
            - overrides `plotly.layout.xaxis.title`
        2. `tick_display_markdown_pattern`: markdown template string to be generated for use as the tick label for the x-axis
    19. `yaxis`: object for options to override properties specific to the yaxis. The following attributes are currently supported:
        1. `title_display_markdown_pattern`: markdown template string to be generated for use as the yaxis title
            - overrides `plotly.layout.yaxis.title`
        2. `tick_display_markdown_pattern`: markdown template string to be generated for use as the tick label for the y-axis
    20. `disable_default_legend_click`: to suppress the default legend click event which toggles the corresponding trace in the chart display to show/hide. default value is false
    21. violin plot specific options:
        1. NOTE: options are not necessarily exclusive to other types, but only implemented for violin plots for now
        2. `xaxis.group_keys`: array of objects for "group by" dropdown to change how the data is grouped for each violin in the plot. Each object in the list consists of:
            - `column_name`: (required) the name of the column returned with the data
            - `title_display_pattern`: string for use in the "group by" dropdown
                - overrides `plotly.layout.xaxis.title`
            - `title_display_markdown_pattern`: markdown template string to be generated for the x-axis title
                - overrides `title_display_pattern` and `plotly.layout.xaxis.title`
            - `tick_display_markdown_pattern`: markdown template string to be generated for use as the tick label for each violin
            - `default`: set to true for whichever option should be selected by default
            - `graphic_link_pattern`: array of patterns to turn into links to use for clicking on the chart display
            - `legend_markdown_pattern`: array of patterns to turn into display values to use for display in the legend
        3. `xaxis.default_all_studies_group`: the `column_name` value from `xaxis.group_keys` array to use as a default when "all studies" is selected on page load
            - takes precedence over `default` property from the list of `group_keys` ONLY when "all studies" is selected
        4. `yaxis.group_key`: similar to x-axis, this matches the `column_name` returned with the data for measuring data on the yaxis
7. `plotly.config`: the config is ignored if plotly.config is provided. For available options, see the documentation [here](https://plotly.com/javascript/configuration-options/)
    1. avoid using `plotly_config`, this property will be DEPRECATED in the future
8. `plotly.layout`: the `layout` object passed directly to plotly when provided. For available options, see the documentation [here](https://plotly.com/javascript/reference/layout/)
9. `plotly.data`: the `data` object passed directly to plotly when provided. For available options, see the documentation [here](https://plotly.com/javascript/reference/) for the plot type trying to be displayed.
10. `gene_uri_pattern`: For violin plot only. The url from which the gene data is fetched after applying handlebars templating. This parameter is required to fetch the data for the gene selector and initialize the plot.
11. `study_uri_pattern`: For violin plot only. The url from which the study data is fetched after applying handlebars templating. This parameter is required to fetch the data for the study selector and display and to initialize the plot.
12. `traces`: Contains the information about each dataset and how to map that data to plotly.
    1. Properties available to most plot types:
        1. `url_pattern`: The url from which the data has to be fetched
        2. `uri`: The url from which the data has to be fetched. DEPRECATED, use `traces.url_pattern` instead
        3. `legend`: An array of values to be shown in the legend
        4. `x_col`: An array of column names for the x values
        5. `y_col`: An array of column names for the y values
        6. `orientation`: Optional parameter for displaying the bar chart horizontally // default: 'h'
        7. `textfont`: It will work till the bar size can accommodate the font size
        8. `hovertemplate_display_pattern`: To show customized hover text on plots using given template pattern
        9. `response_format`: The type of file that is passed into url_pattern. It expects `csv` or `json`.
    2. Extra properties for pie and histogram charts:
        1. `data_col`: A column name as a string or array of column names for the data aggregation. used instead of x_col or y_xol
        2. `legend_col`: An array of column names for the legend
    3. Extra properties for pie and bar charts:
        1. `legend_markdown_pattern`: array of patterns to turn into display values to use for display in the legend.
        2. `graphic_link_pattern`: Link to use to navigate user when clicking on pie slice
    4. Extra properties for heatmap charts:
        1. `z_col`: An array of column names for the z values to use as the aggregated value for the `(x, y)` combination
    5. 1d plot has very similar properties. Keeping separate to preserve old documentation:
        1. `uri`: The url from which the data has to be fetched.
        2. `legend`: An array of values to be shown in the legend
        3. `data_col`: The column name for the values
        4. `legend_col`: An array of column names for the legend to be shown for the respective values
        5. `show_percentage`: To show the percentage or not on slices
13. `plotlyButtonsToRemove`: The button to be removed shown by plotly by defualt. DEPRECATED, use `plotly.config.modeBarButtonsToRemove` instead
14. `user_controls`: Contains information about each user control (data for the control, default value, etc) 
    1. `uid`: Key for referencing this user control; in other configuration properties
    2. `label`: Name to display next to this user control with given styles applied. Also note that label object can be used to generate a markdown user control
        1. `markdown_pattern`: markdown template string to be generated for the control label/markdown user control,
        2. `styles`: CSS styles that can be applied on the label
            1. `font_size`: Allows same values as property in CSS
            2. `max_width`: Allows same values as property in CSS
    3. `classes`: An array of chaise classes of styles that needs to be applied on the user control
    4. `type`:  The type of control to display, more info below about control types
    5. `url_param_key`(Optional): Parameter name or object of parameter names from url params that ire associated with this user control 
    6. `request_info`: Data for the user control
        1. `url_pattern`(Optional): String that allows for handlebars templating for fetching data for this user control
        2. `data`: Values to use in the user control if no query_pattern is provided 
        3. `default_values`: The initial value(s) to use for this user control on page load
        4. `value_key`: Column to use for templating in queries
        5. `selected_value_pattern`: A pattern string to show in the user control for each selected option
15. `grid_layout_config`: Properties for responsive grid
    1. `width`: Width in pixels, not needed if using responsive grid layout component
    2. `auto_size`: Whether the height and width grows/shrinks to fit content in it's parent container
    3. `breakpoints`: Map to identify when a different layout configuration should be used based on grid size. More details in the [Plot Funcitonality Document](/docs/user-docs/plot-functionality.md).
    4. `cols`: Number of columns to show, object used for breakpoints
    5. `margin`: Margin between grid components in pixels
    6. `container_padding`: Padding inside of each grid component in pixels
    7. `row_height`: Height of each row in pixels
    8. `is_draggable`: Controls ability to move all components
    9. `is_resizable`: Controls ability to resize all components
    10. `layouts`: Array of layout objects for each item that will be placed inside the grid. The number of `cols` defined in `grid_layout_config` is the total number of `grid units`.
        1. `source_uid`: Corresponds to the component key (`uid`) from user_controls (or plots if global layouts),
        2. `x`: Grid index in grid units for the x position, 
        3. `y`: Grid index in grid units for the y position,
        4. `w`: Number of grid units the width of the component spans, 
        5. `h`: Number of grid units the height of the component spans, 
        NOTE: In order for the grid to have consistent heights for components, when an item spans multiple grid units, it must also span margins. So you must add the height or width of the margin you are spanning for each unit. So actual pixel height is `(rowHeight * h) + (marginH * (h - 1)`
        6. `is_draggable`(Optional): Can the component be moved around, overrides `static`,
        7. `is_resizable`(Optional): Can the component be resized, overrides `static`,
        8. `static`(Optional): If true, implies `isDraggable: false` and `isResizeable: false`,
        9. `min_w`(Optional): Min width in grid units,
        10. `max_w`(Optional): Max width in grid units,
        11. `min_h`(Optional): Min height in grid units,
        12. `max_h`(Optional): Max height in grid units

#### Note
If any of the above (Presentation or data) values is not mentioned, the app will throw an error. If you don't want to set a value, set it to `null`.

`tick_display_markdown_pattern`, `legend_markdown_pattern`, and `graphic_link_pattern` can access data relative to `$row` or `$self`. All markdown patterns can access data relative to the `$trace` (not supported for violin plots).

### Template parameters

Below is the structure of the template parameters object that the `ermrestJS` templating environment uses.

For `violin` type plots, 2 url parameters can be provided to initialize the app's content, `Study` and `NCBI_GeneID`. Using these supplied parameters, Study and Gene information is fetched and added to the templating environment as `$url_parameters.Study` and `$url_parameters.Gene`. This is specific to the data in RBK/Gudmap. When setting the `tick_display_markdown_pattern`, `legend_markdown_pattern`, and `graphic_link_pattern`, the current row of data is added to the template environment as `$row`.

For all other plot types, the data for each user control is added into `$control_values` for each selected value. When setting the `tick_display_markdown_pattern`, `legend_markdown_pattern`, and `graphic_link_pattern`, the current row of data is added to the template environment as `$self`. Note, this is the same concept as violin plots but has a different name. Currently when templating per row from traces, `$self.data` is used. When templating for each row for a user control, `$self.values` is used. Avoid using `$self.data` since this will be deprecated in the near future.

violin template parameters:
```
{
    $url_parameters: {
        Study: [{data: Tuple.data}, ...],
        Gene: {data: Tuple.data}
    },
    // each row of data for graph added before templating each time
    $row: response.data[index]
}
```

default template parameters:
```
{
    $url_parameters: {
        config: '<config-name>',
        <param_name>: <value>
    },
    $control_values: {
        <userControl.uid>: {
            values: {...}
        },
        ...
    },
    // each row of data for graph added before templating each time
    // OR each row of data for a user control added
    $self: {
        data: response.data[index],
        values: response.data[index]
    }
}
```

### Sample plot-config.js (also included in the repo)
The file [plot-config-sample.js](/config/plot-config-sample.js) contains examples for different plot types, including `violin`, `pie`, `bar`, `histogram`, and `scatter`. More examples can be found in the division repo recipes for rbk dev/staging/production.

## Installation

Refer to [installation guide](/docs/user-docs/installation.md).
