# vitessce-app
## Configuration
The vitessce-config.js file has the following parameters which can be modified when using this app.
The config file specifies the parameters for a particular key i.e. `single-cell`

### Data parameters
1. `vitessce`: An object containing properties for configuring the vitessce component
    1. `uid`: Key for referencing the vitessce component in `grid_layout_config.layouts`
    2. `height`: Integer value to be used as the height of the vitessce component
    3. `theme`: Setting this property changes the default background ccolor used by the vitessce app. `light` will use a light grey background. `dark` will use a black background. If this is not defined, the background will be white. 
    4. `config`: The properties expected in vitessce JSON configuration. More details in [Vitessce's documentation](http://vitessce.io/docs/view-config-json/).
        1. `datasets[0].files[0].url_pattern`: Define this to have a url generated using ermrestjs templating. This property is added to the `file` object in Vitessce's configuration language.
2. `user_controls`: Contains information about each user control (data for the control, default value, etc) 
    1. `uid`: Key for referencing this user control in other configuration properties
    2. `label`: Name to display next to this user control
    3. `type`:  The type of control to display, more info below about control types (NOTE: For now, only type `dropdown` is supported)
    4. `url_param_key`(Optional): Parameter name or object of parameter names from url params that ire associated with this user control 
    6. `request_info`: Data for the user control
        1. `url_pattern`(Optional): String that allows for handlebars templating for fetching data for this user control
        2. `data`: Values to use in the user control if no query_pattern is provided 
        3. `default_values`: The initial value(s) to use for this user control on page load
        4. `value_key`: Column to use for templating in queries
        5. `selected_value_pattern`: A pattern string to show in the user control for each selected option
3. `grid_layout_config`: Properties for responsive grid that the user controls and vitessce component are placed in
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

### Template parameters (for url_pattern)

Below is the structure of the template parameters object that the `ermrestJS` templating environment uses.

For all other plot types, the data for each user control is added into `$control_values` for each selected value. 

vitessce template parameters:
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
    }
}
```

### Sample vitessce-config.js (also included in the repo)
The file [vitessce-config-sample.js](/config/vitessce-config-sample.js) contains an example for using hosted data from hubmap and another using generated data from atlas-d2k.

## Installation

Refer to [installation guide](/docs/user-docs/installation.md).
