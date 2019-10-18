function loadModule() {
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
            'chaise.alerts',
            'chaise.filters',
            'chaise.inputs',
            'chaise.utils',
            'ermrestjs',
            'ui.bootstrap',
            'chaise.errors',
            'chaise.navbar'
          ])

            .config(['$cookiesProvider', function ($cookiesProvider) {
                $cookiesProvider.defaults.path = '/';
            }])
            .factory('PlotUtils', ['AlertsService', 'ConfigUtils', 'dataFormats', 'Errors', 'ErrorService', 'Session', 'UriUtils', '$rootScope', function (AlertsService, ConfigUtils, dataFormats, Errors, ErrorService,  Session, UriUtils, $rootScope) {
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

                function getLayout(plot) {
                  var config = plot.config ? plot.config :
                  { width: 1200,
                    height: 500,
                    showlegend: true,
                    legend: { x:1, y:1 }
                  };

                  var margin = {}

                  var layout = {
                      title: plot.plot_title,
                      width: config.width || 1200,
                      height: config.height || 500,
                      showlegend: config.showlegend != undefined ? config.showlegend : true,
                      legend: config.legend,
                      margin: margin,

                  };
                  if (plot.plotly_config) {
                    return plot.plotly_config
                  }

                  switch (plot.plot_type) {
                    case "pie":
                      return layout;
                    case "histogram-horizontal":
                      layout.bargap = plot.config.bargap;
                    case "histogram-vertical":
                      layout.bargap = plot.config.bargap;
                      return layout;
                    default:
                      layout.margin = config.margin ? config.margin : '';
                      layout.xaxis = {
                          title: plot.x_axis_label ? plot.x_axis_label : '',
                          automargin: true,
                          type: config.x_axis_type ? config.x_axis_type : 'auto',
                          tickformat: config.x_axis_thousands_separator ? ',d' : '',

                      };
                      layout.yaxis = {
                          title: plot.y_axis_label ? plot.y_axis_label : '',
                          automargin: true,
                          type: config.y_axis_type ? config.y_axis_type : 'auto',
                          tickformat: config.y_axis_thousands_separator ? ',d' : '',
                      };
                      return layout;
                  }
                }
                function formatData(data, format) {
                  if(format) {
                    try {
                      var formated_data = parseInt(data.split(' ')[0], 10);
                      if (isNaN(formated_data)) {
                        return data;
                      }
                      return  formated_data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                    } catch (e) {
                      return data;
                    }
                  }
                  else {
                    return data.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
                  }
                }

                return {
                    getData: function (config) {
                        var plots = [];
                        var count = 0;
                        var plotConfig = plotConfigs[config];
                        var message = "";
                        var error;
                        console.log(config, plotConfig);
                        if (typeof plotConfig == "string") {
                            plotConfig = plotConfigs[plotConfig];
                        }
                        console.log(plotConfig);
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
                        var i = 0
                        plotConfig.plots.forEach(function(plot) {
                          var plot_values = {
                            id: i,
                            data: [],
                          };
                          i += 1;
                          var tracesComplete = 0;
                          plot.traces.forEach(function (trace) {
                              server.http.get(trace.uri).then(function(response) {
                                try {
                                  var layout = getLayout(plot);
                                  var config = {
                                    displaylogo: false,
                                    modeBarButtonsToRemove: plot.plotlyDefaultButtonsToRemove,
                                    responsive: true
                                  };
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
                                  if (tracesComplete == plot.traces.length) {
                                    console.log(
                                      plots
                                    );
                                    plots[plot_values.id].plot_values = plot_values;
                                    plots[plot_values.id].loaded = true;
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
                        });

                    }
                }
            }])
            .controller('plotController', ['AlertsService', 'dataFormats', 'PlotUtils', 'UriUtils', '$window', '$rootScope', '$scope', '$timeout', function plotController(AlertsService, dataFormats, PlotUtils, UriUtils, $window, $rootScope, $scope, $timeout) {
                var vm = this;
                vm.alerts = AlertsService.alerts;
                vm.dataFormats = dataFormats;
                // vm.x_label = plotConfig.x_axis_label;
                vm.types = ["line", "bar", "dot", "area"];
                vm.model = {};
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
            .run(['ERMrest', 'PlotUtils', 'messageMap', 'Session', 'UriUtils', '$rootScope', '$window',
             function runApp(ERMrest, PlotUtils, messageMap, Session, UriUtils, $rootScope, $window) {
               try {
                 $rootScope.loginShown = false;
                 var config = UriUtils.getQueryParam($window.location.href, "config");
                 var subId = Session.subscribeOnChange(function () {
                   Session.unsubscribeOnChange(subId);
                   var session = Session.getSessionValue();
                   // if (!session) {
                   //     var notAuthorizedError = new ERMrest.UnauthorizedError(messageMap.unauthorizedErrorCode, (messageMap.unauthorizedMessage + messageMap.reportErrorToAdmin));
                   //     throw notAuthorizedError;
                   // }
                   PlotUtils.getData(config);
                 });
               } catch (exception) {
                   throw exception;
               }
             }
         ]);
})();
}

var chaisePath = "/chaise/";
if (typeof chaiseConfig != 'undefined' && typeof chaiseConfig === "object" && chaiseConfig['chaiseBasePath'] !== undefined) {
    chaisePath = chaiseConfig['chaiseBasePath'];
}

const JS_DEPS = [
    'chaise-config.js',
    'scripts/vendor/angular.js',
    'scripts/vendor/jquery-1.11.1.min.js',
    'scripts/vendor/bootstrap-3.3.7.min.js',
    'scripts/vendor/plotly-latest.min.js',
    'common/vendor/angular-cookies.min.js',
    'scripts/vendor/angular-sanitize.js',
    'scripts/vendor/ui-bootstrap-tpls-2.5.0.min.js',
    'common/config.js',
    'common/errors.js',
    '../ermrestjs/ermrest.js',
    'common/utils.js',
    'common/validators.js',
    'common/inputs.js',
    'common/authen.js',
    'common/filters.js',
    'common/modal.js',
    'common/navbar.js',
    'common/storage.js',
    'common/alerts.js',
    'common/login.js',
];

const CSS_DEPS = [
    'styles/vendor/bootstrap.min.css',
    'common/styles/app.css',
    'common/styles/appheader.css'
];

var head = document.getElementsByTagName('head')[0];
function loadStylesheets(url) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chaisePath + url;
    head.appendChild(link);
}
function loadJSDeps(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chaisePath + url;
    script.onload = callback;
    head.appendChild(script);
}
var jsIndex = 0;

function fileLoaded() {
    jsIndex = jsIndex + 1;
    if (jsIndex == JS_DEPS.length) {
        loadModule();
    } else {
        loadJSDeps(JS_DEPS[jsIndex], fileLoaded);
    }
}
CSS_DEPS.forEach(function (url) {
    loadStylesheets(url);
});
loadJSDeps(JS_DEPS[0], fileLoaded);
