(function () {
    'use strict';

    angular.module('chaise.configure-plotApp', ['chaise.config'])

        .constant('appName', 'plotApp')

        .run(['$rootScope', function ($rootScope) {
            // When the configuration module's run block emits the `configuration-done` event, attach the app to the DOM
            $rootScope.$on("configuration-done", function () {
                angular.element(document).ready(function () {
                    angular.bootstrap(document.getElementById("plot"), ["plotApp"]);
                });
            });
        }]);

        angular.module('plotApp', [
            'ngSanitize',
            'ngCookies',
            'ngAnimate',
            'duScroll',
            'chaise.alerts',
            'chaise.faceting',
            'chaise.filters',
            'chaise.inputs',
            'chaise.recordcreate',
            'chaise.record.table',
            'chaise.utils',
            'ermrestjs',
            'ui.bootstrap',
            'chaise.errors',
            'chaise.navbar'
          ])

            .config(['$compileProvider', '$cookiesProvider', '$logProvider', '$provide', '$uibTooltipProvider', 'ConfigUtilsProvider', function($compileProvider, $cookiesProvider, $logProvider, $provide, $uibTooltipProvider, ConfigUtilsProvider) {
                ConfigUtilsProvider.$get().configureAngular($compileProvider, $cookiesProvider, $logProvider, $uibTooltipProvider);

                $provide.decorator('$templateRequest', ['ConfigUtils', 'UriUtils', '$delegate', function (ConfigUtils, UriUtils, $delegate) {
                    return ConfigUtils.decorateTemplateRequest($delegate, UriUtils.chaiseDeploymentPath());
                }]);
            }])

            .constant('dataParams', {
                uri: "",
                plot: {},
                id: null
            })
            .factory('PlotUtils', ['AlertsService', 'ConfigUtils', 'dataFormats', 'dataParams', 'Errors', 'ErrorService', 'Session', 'UriUtils', '$q', '$rootScope', '$window', function (AlertsService, ConfigUtils, dataFormats, dataParams, Errors, ErrorService,  Session, UriUtils, $q, $rootScope, $window) {
                var ermrestServiceUrl = ConfigUtils.getConfigJSON().ermrestLocation;
                var contextHeaderParams = {"cid": "2d-plot"};
                var server = ERMrest.ermrestFactory.getServer(ermrestServiceUrl, contextHeaderParams);

                function getType(type) {
                  switch (type) {
                    case "line":
                      return "scatter";
                    case "bar":
                      return "bar";
                    case "dot":
                      return "scatter";
                    case "dot-lines":
                      return "scatter";
                    case "area":
                      return "area";
                    case "pie":
                      return "pie";
                    case "histogram":
                      return "histogram";
                    case "violin":
                      return "violin";
                    default:
                      return "scatter";
                  }
                }

                function getMode(type) {
                  switch (type) {
                    case "line":
                      return "lines";
                    case "bar":
                      return "";
                    case "dot":
                      return "markers";
                    case "dot-lines":
                      return "lines+markers";
                    case "area":
                      return "";
                    case "pie":
                      return "";
                    case "histogram":
                      return "";
                    case "violin":
                      return "";
                    default:
                      return "line+markers";
                  }
                }

                function getValues(type, legend, orientation) {
                  var values = {};
                  switch (type) {
                    case "pie":
                      values = {
                        type: "pie",
                        labels: [],
                        values: []
                      };
                      return values;
                    case "bar":
                      values = {
                          x: [],
                          y: [],
                          text:[],
                          textposition: 'outside',
                          type: getType(type),
                          name: legend,
                          // fill: type == 'area' ? 'tozeroy':'',
                          // mode: getMode(type),
                          orientation: orientation,
                          hoverinfo: 'text'
                      }
                      return values;
                    case "histogram-horizontal":
                      values = {
                          x: [],
                          name: legend || '',
                          type: "histogram",
                          orientation: orientation
                      }
                      return values;
                    case "histogram-vertical":
                        values = {
                            y: [],
                            name: legend || '',
                            type: "histogram",
                            orientation: orientation
                        }
                        return values;
                    case "violin":
                        values = {
                          x: [],
                          y: [],
                          name: legend
                        }
                        return values;
                    default:
                      values = {
                          x: [],
                          y: [],
                          type: getType(type),
                          name: legend,
                          fill: type == 'area' ? 'tozeroy':'',
                          mode: getMode(type)
                      }
                      return values;
                  }
                }

                function getPlotlyConfig(plot) {
                    // use config from plot.plotly.config if exists
                    if (plot.plotly && plot.plotly.config) return plot.plotly.config;

                    return { displaylogo: false, responsive: true }
                }

                /**
                 * Get or set the plotly.layout
                 *
                 * defaults for layout:
                 *     height: 500,
                 *     width: 1200,
                 *     showlegend: true,
                 *     legend: { x:1, y:1 },
                 *     margin: {},
                 *
                 * NOTE: plot.config holds configurable vaules to add to layout
                 */
                function getPlotlyLayout(plot) {
                    // use layout from plot.plotly.layout if exists
                    if (plot.plotly && plot.plotly.layout) {
                        return plot.plotly.layout;
                    } else if (plot.plotly_config) {
                        return plot.plotly_config;
                    }

                    // default values for plot used as defaults if nothing else is defined
                    // grab whole object or define object with base values
                    var tempConfig = plot.config || {
                        height: 500,
                        width: 1200,
                        showlegend: true,
                        legend: { x:1, y:1 },
                        margin: {}
                    }

                    var layout = {
                        title: plot.plot_title, // NOTE: does not support templating (violin overrides outside of function with templating)
                        height: tempConfig.height || 500,
                        width: tempConfig.width || 1200,
                        showlegend: tempConfig.showlegend != undefined ? tempConfig.showlegend : true,
                        legend: tempConfig.legend,
                        margin: tempConfig.margin || {}
                    };

                    switch (plot.plot_type) {
                        case "pie":
                            break;
                        case "histogram-horizontal":
                        case "histogram-vertical":
                            layout.bargap = tempConfig.bargap;
                            break;
                        case "violin":
                            layout.xaxis = { automargin: true, title: { standoff: 20 } };
                            layout.yaxis = { zeroline: false };
                            layout.hovermode = "closest";
                            layout.dragmode = "pan";

                            // delete layout.legend;
                            // delete layout.margin;

                            break;
                        default:
                            layout.xaxis = {
                                title: plot.x_axis_label ? plot.x_axis_label : '',
                                automargin: true,
                                type: tempConfig.x_axis_type ? tempConfig.x_axis_type : 'auto',
                                tickformat: config.x_axis_thousands_separator ? ',d' : '',
                            };
                            layout.yaxis = {
                                title: plot.y_axis_label ? plot.y_axis_label : '',
                                automargin: true,
                                type: tempConfig.y_axis_type ? tempConfig.y_axis_type : 'auto',
                                tickformat: tempConfig.y_axis_thousands_separator ? ',d' : '',
                            };
                            break;
                    }

                    return layout;
                };

                function formatData(data, format) {
                  if(format) {
                    try {
                      var formated_data = parseInt(data.split(' ')[0], 10);
                      if (isNaN(formated_data)) {
                        return data;
                      }
                      // this regex is used to add a thousand separator in the number if possible
                      return  formated_data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                    } catch (e) {
                      return data;
                    }
                  }
                  else {
                    // this regex is used to add a thousand separator in the number if possible
                    return data.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
                  }
                }

                // updates the geneID used for templating and generate the templated uri
                function setViolinUri() {
                    var studyInfo = $rootScope.studySet,
                        uri;

                    // array of Tuple objects
                    if (Array.isArray(studyInfo)) {
                        if (studyInfo.length == 0) {
                            // throw error, or hide graph
                            return
                        }
                        // query: "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/",
                        // studyPattern: "Study=",
                        // genePattern: "&NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}"
                        uri = dataParams.trace.multiStudy.query;
                        for (var j=0; j<studyInfo.length; j++){
                            var rid = studyInfo[j].data.RID;
                            uri += dataParams.trace.multiStudy.studyPattern + rid;
                            if (j != studyInfo.length-1) uri += ";"
                        }
                        uri += ERMrest._renderHandlebarsTemplate(dataParams.trace.multiStudy.genePattern, $rootScope.templateParams);
                    } else {
                        uri = ERMrest._renderHandlebarsTemplate(dataParams.trace.queryPattern, $rootScope.templateParams);
                    }
                    return uri;
                }

                // fetches the violin plot data and sets it up for plotly
                function getViolinData() {
                    var defer = $q.defer(),
                        uri = setViolinUri(),
                        plot = dataParams.plot,
                        plot_values = dataParams.plot_values,
                        config = plot.config,
                        xGroupKey = $rootScope.groupKey;

                    console.log(uri);
                    if (!uri) return; // don't try to fetch data when no uri is defined
                    server.http.get(uri).then(function(response) {
                        console.log(response);
                        var data = response.data;

                        // transform x data based on groupKey
                        // xData used for graph x data AND xaxis grouping
                        var xData = data.map(function (obj) {
                            var value = obj[xGroupKey.column_name];
                            return (value !== null && value !== undefined) ? value : "N/A"
                        });

                        // transform x data based on groupKey
                        // xDataTicks used for xaxis grouping display values
                        var xDataTicks = data.map(function (obj) {
                            // add row of data to templating environment
                            $rootScope.templateParams.$row = obj;

                            // use template if available/defined, else use value for column
                            var value = xGroupKey.tick_display_pattern ? ERMrest._renderHandlebarsTemplate(xGroupKey.tick_display_pattern, $rootScope.templateParams) : obj[xGroupKey.column_name];

                            // remove row after using it for templating
                            delete $rootScope.templateParams.$row;
                            return (value !== null && value !== undefined) ? value : "N/A"
                        });

                        // transform y data based on configuration option in plot-config
                        var yData = data.map(function (obj) {
                            // add row of data to templating environment
                            $rootScope.templateParams.$row = obj;

                            // use template if available/defined, else use value for column
                            var value = config.yaxis.tick_display_pattern ? ERMrest._renderHandlebarsTemplate(config.yaxis.tick_display_pattern, $rootScope.templateParams) : obj[config.yaxis.group_key];

                            // remove row after using it for templating
                            delete $rootScope.templateParams.$row;
                            return value;
                        });

                        var groupStyles = [];
                        var colors = ["blue", "orange", "green", "red", "yellow"]; // note: samples I tested only had 5 differentiating values (I think)?
                        // get unique x values and assign colors for each group key (x value)
                        var uniqueX = xData.filter(function (key, index, self) {
                            return self.indexOf(key) === index;
                        });

                        uniqueX.forEach(function (x, index) {
                            groupStyles.push({
                                target: x,
                                value: {line: {color: colors[index%colors.length]}}
                            });
                        });

                        // set base violin plot config
                        // NOTE: getPlotlyConfig and getViolinLayout (TODO: rename to getPlotlyLayout) fetch from plot-config.js plot object or use default
                        var plotlyConfig = {
                            // passed directly to plotly (plotly.config)
                            config: getPlotlyConfig(plot),
                            // passed directly to plotly (plotly.data)
                            data: [{
                                type: 'violin',
                                x: xData,
                                y: yData,
                                points: 'all',
                                showlegend: false,
                                box: {
                                    visible: true
                                },
                                meanline: {
                                    visible: true
                                },
                                transforms: [{
                                    type: 'groupby',
                                    groups: xData,
                                    styles: groupStyles
                                }],
                            }],
                            // passed directly to plotly (plotly.layout)
                            layout: getPlotlyLayout(plot)
                        }

                        // attach configurable plotly values
                        // TODO: Do we set configuration based on whitelist or blacklist?
                        // plotly.data values that probably should NOT be overwritten:
                        //   - [type, x, y, transforms[].groups]

                        // TODO: should plotTitlePattern be required? if no, should "TPM Expression" remain the default
                        plotlyConfig.layout.title = (config.title_display_pattern ? ERMrest._renderHandlebarsTemplate(config.title_display_pattern, $rootScope.templateParams) : "TPM Expression");

                        // xaxis
                        // use title pattern OR column_name if pattern doesn't exist
                        plotlyConfig.layout.xaxis.title.text = (xGroupKey.title_display_pattern ? ERMrest._renderHandlebarsTemplate(xGroupKey.title_display_pattern, $rootScope.templateParams) : xGroupKey.column_name);
                        plotlyConfig.layout.xaxis.tickvals = xData;
                        plotlyConfig.layout.xaxis.ticktext = xDataTicks;

                        // yaxis
                        // use title pattern OR group_key if pattern doesn't exist
                        plotlyConfig.layout.yaxis.title = config.yaxis.title_pattern ? ERMrest._renderHandlebarsTemplate(config.yaxis.title_pattern, $rootScope.templateParams) : config.yaxis.group_key;
                        plotlyConfig.layout.yaxis.type = $rootScope.yAxisScale;

                        // attach configuration and data for plot
                        plot_values.data = plotlyConfig.data;
                        plot_values.layout = plotlyConfig.layout;
                        plot_values.config = plotlyConfig.config;


                        defer.resolve(plot_values);
                    }).catch(function (err) {
                        console.log(err);
                        defer.reject();
                    });

                    return defer.promise;
                }

                return {
                    getData: function (config) {
                        var plots = [];
                        var count = 0;
                        var plotConfig = plotConfigs[config];
                        var message = "";
                        var error;
                        if (typeof plotConfig == "string") {
                            plotConfig = plotConfigs[plotConfig];
                        }
                        if (plotConfig == undefined) {
                            if (config) {
                                message = "Invalid config parameter in the url";
                                error = new Errors.CustomError("Invalid config", message);
                            } else {
                                plotConfig = plotConfigs["*"];
                            }
                        }

                        try {

                            plotConfig.plots.forEach(function () {
                                plots.push({id: count, loaded: false});
                                count+=1
                            });
                        } catch (err) {
                            var message = message || "Invalid config parameter in the url";
                            var error = error || new Errors.CustomError("Invalid config", message);
                            ErrorService.handleException(error);
                        }

                        var tracesComplete = 0;
                        var plotComplete = 0;
                        // checks if all plots have had .loaded set to true
                        function checkPlotsLoaded(plotValues, plot) {
                            tracesComplete++;
                            plots[plotValues.id].plot_values = plotValues;
                            plots[plotValues.id].loaded = true;
                            plots[plotValues.id].plot_type = plot.plot_type;
                            var allLoaded = true;
                            for (var j=0; j<plots.length; j++) {
                                if (plots[j].loaded == false) {
                                    allLoaded = false;
                                    break;
                                }
                            }
                            if (allLoaded) {
                                $rootScope.plots = plots;
                            }
                        }

                        var i = 0
                        plotConfig.plots.forEach(function(plot, index) {
                            var plot_values = {
                                id: index,
                                data: [],
                            };
                            var config = {
                                displaylogo: false,
                                modeBarButtonsToRemove: plot.plotlyDefaultButtonsToRemove,
                                responsive: true
                            };
                            var tracesComplete = 0;

                            // violin plot has it's own case outside of the switch condition below since it relies on reference api for the gene selector
                            if (plot.plot_type == "violin") {
                                plot.traces.forEach(function (trace) {
                                    var studyIds = $rootScope.templateParams.$url_parameters.Study,
                                        geneUri;

                                    // array of strings from url
                                    if (typeof studyIds == "Object" && studyIds.length > 1) {
                                        // query: "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/",
                                        // studyPattern: "Study=",
                                        // genePattern: "/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)"
                                        geneUri = plot.geneMultiStudy.query;
                                        for (var j=0; j<studyIds.length; j++){
                                            var rid = studyIds[j];
                                            geneUri += plot.geneMultiStudy.studyPattern + rid;
                                            if (j != studyIds.length-1) geneUri += ";"
                                        }
                                        geneUri += plot.geneMultiStudy.genePattern;
                                    } else {
                                        geneUri = ERMrest._renderHandlebarsTemplate(plot.geneUriPattern, $rootScope.templateParams);
                                    }
                                    ERMrest.resolve(geneUri, ConfigUtils.getContextHeaderParams()).then(function (ref) {
                                        $rootScope.geneReference = ref.contextualize.compactSelect;

                                        // get the first gene to use as a default
                                        return $rootScope.geneReference.read(1);
                                    }).then(function (page) {
                                        if (!$rootScope.gene) {
                                            $rootScope.gene = page.tuples[0];
                                            $rootScope.templateParams.$url_parameters.NCBI_GeneID = $rootScope.gene.data["NCBI_GeneID"];
                                        }

                                        var studyUri = ERMrest._renderHandlebarsTemplate(plot.studyUriPattern, $rootScope.templateParams);
                                        return ERMrest.resolve(studyUri, ConfigUtils.getContextHeaderParams())
                                    }).then(function (ref) {
                                        $rootScope.studyReference = ref.contextualize.compactSelect;

                                        $rootScope.groups = plot.config.xaxis.groupKeys;
                                        // set default groupKey
                                        // NOTE: should only ever be one. If multiple defaults are set, first one is used
                                        $rootScope.groupKey = plot.config.xaxis.groupKeys.filter(function (obj) {
                                            return obj.default == true
                                        })[0];

                                        // set dataParams to be used later for refetching violin data
                                        dataParams.trace = trace;
                                        dataParams.plot = plot;
                                        dataParams.id = plot_values.id;
                                        dataParams.plot_values = plot_values;

                                        getViolinData().then(function (values) {
                                            checkPlotsLoaded(values, plot);
                                        });
                                    });
                                });
                            } else {
                                plot.traces.forEach(function (trace) {
                                    var uri = trace.uri;
                                    server.http.get(uri).then(function(response) {
                                        try {
                                            var layout = getPlotlyLayout(plot);
                                            var data = response.data;
                                            switch (plot.plot_type) {
                                                case "pie":
                                                    var values = getValues(plot.plot_type, '',  '');
                                                    if (plot.config) {
                                                        values.textinfo = plot.config.slice_label ? plot.config.slice_label : "none";
                                                    } else {
                                                        values.textinfo = "none";
                                                    }

                                                    var label = true;
                                                    if(trace.legend != undefined) {
                                                        values.labels = trace.legend;
                                                        label = false;
                                                    }

                                                    data.forEach(function (row) {
                                                        if(label) {
                                                            values.labels.push(row[trace.legend_col]);
                                                        }
                                                        values.values.push(formatData(row[trace.data_col], plot.config ? plot.config.format_data : false));
                                                    });
                                                    plot_values.data.push(values);
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;
                                                case "histogram-horizontal":
                                                    var values = getValues(plot.plot_type, trace.legend);
                                                    data.forEach(function (row) {
                                                        values.x.push(formatData(row[trace.data_col], plot.config ? plot.config.format_data : false));
                                                    });
                                                    plot_values.data.push(values);
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;
                                                case "histogram-vertical":
                                                    var values = getValues(plot.plot_type, trace.legend);
                                                    data.forEach(function (row) {
                                                        values.y.push(formatData(row[trace.data_col], plot.config ? plot.config.format_data : false));
                                                    });
                                                    plot_values.data.push(values);
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;

                                                case "bar":
                                                    if(trace.orientation == "h") {
                                                        for(var i = 0; i < trace.x_col.length;i++) {
                                                            var values = getValues(plot.plot_type, trace.legend ? trace.legend[i]: '',  trace.orientation);
                                                            if (trace.textangle) {
                                                                values.textangle = trace.textangle;
                                                            }
                                                            if (trace.textfont) {
                                                                values.textfont = trace.textfont;
                                                            }
                                                            data.forEach(function (row) {
                                                                values.x.push(formatData(row[trace.x_col[i]], plot.config ? plot.config.format_data_x : false));
                                                                values.y.push(formatData(row[trace.y_col], plot.config ? plot.config.format_data_y : false));
                                                                values.text.push(formatData(row[trace.x_col[i]], plot.config ? plot.config.format_data_x : false))
                                                            });
                                                            values.hoverinfo = 'text'
                                                            plot_values.data.push(values);
                                                            plot_values.layout = layout;
                                                            plot_values.config = config;
                                                        }
                                                    } else {
                                                        for(var i = 0; i < trace.y_col.length;i++) {
                                                            var values = getValues(plot.plot_type, trace.legend ? trace.legend[i]: '',  trace.orientation);
                                                            data.forEach(function (row) {
                                                                values.x.push(formatData(row[trace.x_col], plot.config ? plot.config.format_data_x : false));
                                                                values.y.push(formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false));
                                                                values.text.push(formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false));
                                                            });
                                                            values.hoverinfo = 'text'
                                                            plot_values.data.push(values);
                                                            plot_values.layout = layout;
                                                            plot_values.config = config;
                                                        }
                                                    }
                                                    break;
                                                default:
                                                    for(var i = 0; i < trace.y_col.length;i++) {
                                                        var values = getValues(plot.plot_type, trace.legend ? trace.legend[i]: '',  trace.orientation);

                                                        data.forEach(function (row) {
                                                            values.x.push(formatData(row[trace.x_col], plot.config ? plot.config.format_data_x : false));
                                                            values.y.push(formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false));
                                                        });
                                                        plot_values.data.push(values);
                                                        plot_values.layout = layout;
                                                        plot_values.config = config;
                                                    }
                                                    break;
                                            }

                                            tracesComplete++;
                                            plots[plot_values.id].plot_values = plot_values;
                                            plots[plot_values.id].loaded = true;
                                            plots[plot_values.id].plot_type = plot.plot_type;
                                            var allLoaded = true;
                                            for (var j=0; j<plots.length; j++) {
                                                if (plots[j].loaded == false) {
                                                    allLoaded = false;
                                                    break;
                                                }
                                            }
                                            if (allLoaded) {
                                                $rootScope.plots = plots;
                                            }

                                        } catch (error) {
                                            console.log(error);
                                        }

                                    }).catch(function (err) {
                                        if (err.data) {
                                            if (err.status == 401) {
                                                if (!$rootScope.loginShown) {
                                                    $rootScope.loginShown = true;
                                                    Session.loginInAModal(function () {
                                                        // set to false in case a request fails after with 401
                                                        $rootScope.loginShown = false;
                                                        window.location.reload();
                                                    });
                                                }
                                            } else {
                                                // else add warning alert
                                                AlertsService.addAlert(err.data, 'warning');
                                                throw ERMrest.responseToError(err);
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    },
                    getViolinData: getViolinData
                }
            }])
            .controller('plotController', ['AlertsService', 'dataFormats', 'dataParams', 'modalUtils', 'PlotUtils', 'UriUtils', '$rootScope', '$scope', '$timeout', '$window', function plotController(AlertsService, dataFormats, dataParams, modalUtils, PlotUtils, UriUtils, $rootScope, $scope, $timeout, $window) {
                var vm = this;
                vm.alerts = AlertsService.alerts;
                vm.dataFormats = dataFormats;
                // vm.x_label = plotConfig.x_axis_label;
                vm.types = ["line", "bar", "dot", "area"];
                vm.model = {};
                vm.scales = ["linear", "log"];
                $rootScope.yAxisScale = "linear";

                vm.changeSelection = function(value) { // Not yet used for the selection of plot type
                  var plotsData = $rootScope.plots.data;
                  var layout = $rootScope.plots.layout;
                  var config = $rootScope.plots.config;
                  switch (vm.model.type.name) {
                    case 'bar':
                      var newPlotData = [];
                      plotsData.forEach(function (row) {
                          row.type="bar";
                          newPlotData.push(row);
                      });
                      $rootScope.plots = {
                        data: newPlotData,
                        layout: layout,
                        config: config
                      };
                      break;
                    case 'line':
                      var newPlotData = [];
                      plotsData.forEach(function (row) {
                          row.type="scatter";
                          row.mode="lines+markers";
                          row.fill = "";
                          newPlotData.push(row);
                      });
                      $rootScope.plots = {
                        data: newPlotData,
                        layout: layout,
                        config: config
                      };
                      break;
                    case "dot":
                      var newPlotData = [];
                      plotsData.forEach(function (row) {
                          row.type="scatter";
                          row.mode="markers"
                          newPlotData.push(row);
                      });
                      $rootScope.plots = {
                        data: newPlotData,
                        layout: layout,
                        config: config
                      };
                      break;
                    case "area":
                      var newPlotData = [];
                      plotsData.forEach(function (row) {
                          row.type="scatter";
                          row.fill = "tozeroy";
                          newPlotData.push(row);
                      });
                      $rootScope.plots = {
                        data: newPlotData,
                        layout: layout,
                        config: config,
                      };
                      break;
                    case "area":
                      var newPlotData = [];
                      plotsData.forEach(function (row) {
                          row.type="scatter";
                          row.fill = "tozeroy";
                          newPlotData.push(row);
                      });
                      $rootScope.plots = {
                        data: newPlotData,
                        layout: layout,
                        config: config,
                      };
                      break;
                    default:
                      break;
                  }
                }

                // conditional to show violin plot controls (gene selector, group selector, scale selector)
                vm.showViolinControls = function (plot_type) {
                    return $rootScope.geneReference && plot_type == "violin";
                }

                // opens search popup for gene table based on current study.
                // Callback for selected gene defined as the modal close callback
                vm.openGeneSelector = function () {
                    var params = {};

                    // TODO: logging
                    params.logStack = [{type: "set", s_t: "Common:Gene"}]
                    params.logStackPath = "set/gene-selector"

                    // for the title
                    // params.parentReference = scope.facetColumn.reference; // Maybe should be study reference?
                    // params.displayname = scope.facetColumn.displayname;
                    // disable comment for facet, since it might be confusing
                    // params.comment = scope.facetColumn.comment;

                    params.reference = $rootScope.geneReference;
                    params.reference.session = $rootScope.session;
                    params.selectMode = "single-select";
                    params.faceting = true;
                    params.facetPanelOpen = false;

                    // to choose the correct directive
                    params.mode = "default";
                    params.showFaceting = true;

                    params.displayMode = "popup";
                    // params.displayMode = "popup/facet";
                    // params.displayMode = recordsetDisplayModes.facetPopup;
                    params.editable = false;

                    params.selectedRows = [];

                    // TODO: grey out row that is already selected
                    // // generate list of rows needed for modal
                    // scope.checkboxRows.forEach(function (row) {
                    //     if (!row.selected) return;
                    //     var newRow = {};
                    //
                    //     // - row.uniqueId will return the filter's uniqueId and not
                    //     //    the tuple's. We need tuple's uniqueId in here
                    //     //    (it will be used in the logic of isSelected in modal).
                    //     // - data is needed for the post process that we do on the data.
                    //     if (row.tuple && row.tuple.data && scope.facetColumn.isEntityMode) {
                    //         newRow.uniqueId = row.tuple.uniqueId;
                    //         newRow.data = row.tuple.data;
                    //     } else {
                    //         newRow.uniqueId = row.uniqueId;
                    //     }
                    //
                    //     newRow.displayname = (newRow.uniqueId === null) ? {value: null, isHTML: false} : row.displayname;
                    //     newRow.tooltip = newRow.displayname;
                    //     newRow.isNotNull = row.notNull;
                    //     params.selectedRows.push(newRow);
                    // });

                    // modal properties
                    var windowClass = "search-popup gene-selector-popup";

                    modalUtils.showModal({
                        animation: false,
                        controller: "SearchPopupController",
                        windowClass: windowClass,
                        controllerAs: "ctrl",
                        resolve: {
                            params: params
                        },
                        size: modalUtils.getSearchPopupSize(params),
                        templateUrl:  UriUtils.chaiseDeploymentPath() + "common/templates/searchPopup.modal.html"
                    }, function (res) {
                        $rootScope.gene = res;
                        $rootScope.geneId = $rootScope.templateParams.$url_parameters.NCBI_GeneID = $rootScope.gene.data["NCBI_GeneID"];

                        // the gene has changed, fetch new plot data for new gene
                        PlotUtils.getViolinData();
                    }, null, false);
                }

                // opens search popup for study table based on current gene.
                // Callback for selected study defined as the modal close callback
                vm.openStudySelector = function () {
                    var params = {};

                    // TODO: logging
                    params.logStack = [{type: "set", s_t: "RNASeq:Study"}]
                    params.logStackPath = "set/study-selector"

                    // for the title
                    // params.parentReference = scope.facetColumn.reference; // Maybe should be study reference?
                    // params.displayname = scope.facetColumn.displayname;
                    // disable comment for facet, since it might be confusing
                    // params.comment = scope.facetColumn.comment;

                    params.reference = $rootScope.studyReference;
                    params.reference.session = $rootScope.session;
                    params.selectMode = "multi-select";
                    params.showFaceting = true;
                    params.faceting = true;
                    params.facetPanelOpen = false;

                    // to choose the correct directive
                    params.mode = "default";
                    params.displayMode = "popup";
                    // params.displayMode = "popup/facet";
                    // params.displayMode = recordsetDisplayModes.facetPopup;
                    params.editable = false;

                    params.selectedRows = $rootScope.studySet ? $rootScope.studySet : [];

                    // TODO: grey out row that is already selected
                    // // generate list of rows needed for modal
                    // scope.checkboxRows.forEach(function (row) {
                    //     if (!row.selected) return;
                    //     var newRow = {};
                    //
                    //     // - row.uniqueId will return the filter's uniqueId and not
                    //     //    the tuple's. We need tuple's uniqueId in here
                    //     //    (it will be used in the logic of isSelected in modal).
                    //     // - data is needed for the post process that we do on the data.
                    //     if (row.tuple && row.tuple.data && scope.facetColumn.isEntityMode) {
                    //         newRow.uniqueId = row.tuple.uniqueId;
                    //         newRow.data = row.tuple.data;
                    //     } else {
                    //         newRow.uniqueId = row.uniqueId;
                    //     }
                    //
                    //     newRow.displayname = (newRow.uniqueId === null) ? {value: null, isHTML: false} : row.displayname;
                    //     newRow.tooltip = newRow.displayname;
                    //     newRow.isNotNull = row.notNull;
                    //     params.selectedRows.push(newRow);
                    // });

                    // modal properties
                    var windowClass = "search-popup study-selector-popup";

                    modalUtils.showModal({
                        animation: false,
                        controller: "SearchPopupController",
                        windowClass: windowClass,
                        controllerAs: "ctrl",
                        resolve: {
                            params: params
                        },
                        size: modalUtils.getSearchPopupSize(params),
                        templateUrl:  UriUtils.chaiseDeploymentPath() + "common/templates/searchPopup.modal.html"
                    }, function (res) {
                        console.log(res);
                        $rootScope.studySet = $rootScope.templateParams.$url_parameters.Study = vm.studySet = res.rows;
                        console.log(typeof $rootScope.studySet)
                        console.log($rootScope.studySet.length)
                        // $rootScope.studyId = $rootScope.study.data["RID"];

                        // the study has changed, fetch new plot data for new study info
                        PlotUtils.getViolinData();
                    }, null, false);
                }

                vm.studySetIsArray = function () {
                    return Array.isArray(vm.studySet);
                }

                vm.removeStudyPill = function (studyId, $event) {
                    var index = vm.studySet.findIndex(function (obj) {
                        return obj.uniqueId == studyId;
                    });

                    // this sanity check is not necessary since we're always calling
                    // this function with a valid key. but it doesn't harm to check
                    if (index === -1) {
                        $event.preventDefault();
                        return;
                    }

                    vm.studySet.splice(index, 1)[0];

                    // the study has changed, fetch new plot data for new study info
                    PlotUtils.getViolinData();
                }

                // callback for group by selector
                vm.setGroup = function (group) {
                    $rootScope.groupKey = group;

                    PlotUtils.getViolinData();
                }

                // callback for scale selector
                vm.toggleScale = function (scale) {
                    $rootScope.yAxisScale = scale;

                    PlotUtils.getViolinData();
                }

                $scope.plotsLoaded = false;
                $scope.showPlot = function () {
                    if (vm.model.user == null) {
                        vm.model.user = $rootScope.user;
                    }
                    try {
                        $scope.$apply(function () {
                            $scope.plotsLoaded = true;
                        });
                    } catch (e) {
                        throw e;
                    }

                }

                $scope.$watch('groups', function (newValue, oldValue) {
                    if (newValue) vm.groups = newValue;
                });
            }])
            .directive('plot', ['$rootScope', '$timeout', function ($rootScope, $timeout) {

                return {
                    link: function (scope, element) {
                        scope.$watch('plots', function (plots) {
                            if (plots) {
                                $timeout(function() {
                                    for (var i = 0; i < plots.length; i++) {
                                        if (plots[i].id == element[0].attributes['plot-id'].nodeValue) {
                                            Plotly.newPlot(element[0], plots[i].plot_values.data, plots[i].plot_values.layout, plots[i].plot_values.config).then(function () {
                                                scope.showPlot();
                                            }.bind(plots.length));
                                        }
                                    }
                                }, 0, false);
                            }
                        }, true);
                    }
                };
            }])
            .run(['ERMrest', 'FunctionUtils', 'PlotUtils', 'messageMap', 'Session', 'UriUtils', '$rootScope', '$window',
            function runApp(ERMrest, FunctionUtils, PlotUtils, messageMap, Session, UriUtils, $rootScope, $window) {
                try {
                    $rootScope.loginShown = false;
                    $rootScope.config = UriUtils.getQueryParam($window.location.href, "config");
                    FunctionUtils.registerErmrestCallbacks();
                    var subId = Session.subscribeOnChange(function () {
                        Session.unsubscribeOnChange(subId);
                        var session = Session.getSessionValue();
                        // if (!session) {
                        //     var notAuthorizedError = new ERMrest.UnauthorizedError(messageMap.unauthorizedErrorCode, (messageMap.unauthorizedMessage + messageMap.reportErrorToAdmin));
                        //     throw notAuthorizedError;
                        // }
                        var studyId = UriUtils.getQueryParam($window.location.href, "Study");
                        var geneId = UriUtils.getQueryParam($window.location.href, "NCBI_GeneID");

                        $rootScope.hideStudySelector = false;
                        $rootScope.hideGeneSelector = false;
                        $rootScope.templateParams = {
                            $url_parameters: {}
                        }

                        // trick to verify if this config app is running inside of an iframe as part of another app
                        var inIframe = $window.self !== $window.parent;

                        if (studyId) {
                            $rootScope.templateParams.$url_parameters.Study = studyId;
                            // in iframe and study means embedded on study page, hide study selector
                            if (inIframe) $rootScope.hideStudySelector = true;
                        }
                        if (geneId) {
                            $rootScope.templateParams.$url_parameters.NCBI_GeneID = geneId;
                            // in iframe and gene means embedded on gene page, hide gene selector
                            if (inIframe) $rootScope.hideGeneSelector = true;
                        }
                        PlotUtils.getData($rootScope.config);
                    });
                } catch (exception) {
                    throw exception;
                }
            }
        ]);
})();

// TODO: reenable dynamic loading of dependencies
// var chaisePath = "/chaise/";
// if (typeof chaiseConfig != 'undefined' && typeof chaiseConfig === "object" && chaiseConfig['chaiseBasePath'] !== undefined) {
//     chaisePath = chaiseConfig['chaiseBasePath'];
// }

// const JS_DEPS = [
//     'chaise-config.js',
//     'scripts/vendor/angular.js',
//     'scripts/vendor/jquery-1.11.1.min.js',
//     'scripts/vendor/bootstrap-3.3.7.min.js',
//     'scripts/vendor/plotly-latest.min.js',
//     'common/vendor/angular-cookies.min.js',
//     'scripts/vendor/angular-sanitize.js',
//     'scripts/vendor/ui-bootstrap-tpls-2.5.0.min.js',
//     '../ermrestjs/ermrest.js',
//     'common/alerts.js',
//     'common/authen.js',
//     'common/config.js',
//     'common/errors.js',
//     'common/filters.js',
//     'common/inputs.js',
//     'common/login.js',
//     'common/modal.js',
//     'common/navbar.js',
//     'common/recordCreate.js',
//     'common/storage.js',
//     'common/table.js',
//     'common/utils.js',
//     'common/validators.js'
// ];

// const JS_DEPS = [
//     'scripts/vendor/angular.js',
//     'chaise-config.js',
//     'scripts/vendor/jquery-3.4.1.min.js',
//     'scripts/vendor/plotly-latest.min.js',
//     'dist/chaise.vendor.min.js',
//     'dist/chaise.min.js',
//     '../ermrestjs/ermrest.min.js'
// ];
//
// const CSS_DEPS = [
//     'styles/vendor/bootstrap.min.css',
//     'common/styles/app.css',
//     'common/styles/appheader.css'
// ];
//
// var head = document.getElementsByTagName('head')[0];
// function loadStylesheets(url) {
//     var link = document.createElement('link');
//     link.rel = 'stylesheet';
//     link.type = 'text/css';
//     link.href = chaisePath + url;
//     head.appendChild(link);
// }
// function loadJSDeps(url, callback) {
//     var script = document.createElement('script');
//     script.type = 'text/javascript';
//     // if (url == 'scripts/vendor/plotly-latest.min.js') {
//     //     script.src = "../../" + chaisePath + url;
//     // } else {
//         script.src = "../.." + chaisePath + url;
//     // }
//     script.onload = callback;
//     head.appendChild(script);
// }
// var jsIndex = 0;
//
// function fileLoaded() {
//     jsIndex = jsIndex + 1;
//     if (jsIndex == JS_DEPS.length) {
//         loadModule();
//     } else {
//         loadJSDeps(JS_DEPS[jsIndex], fileLoaded);
//     }
// }
// CSS_DEPS.forEach(function (url) {
//     loadStylesheets(url);
// });
// loadJSDeps(JS_DEPS[0], fileLoaded);
// loadModule();
