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
            .factory('PlotUtils', ['AlertsService', 'ConfigUtils', 'dataFormats', 'Session', 'UriUtils', '$rootScope', function (AlertsService, ConfigUtils, dataFormats, Session, UriUtils, $rootScope) {
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
                          fill: type == 'area' ? 'tozeroy':'',
                          mode: getMode(type),
                          orientation: orientation
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
                function formatData(data) {
                  try {
                    var formated_data = parseInt(data.split(' ')[0], 10);
                    if (isNaN(formated_data)) {
                      return data;
                    }
                    return formated_data;
                  } catch (e) {
                    return data;
                  }
                }

                return {
                    getData: function () {
                        var plots = [];
                        var count = 0;
                        plotConfig.plots.forEach(function () {
                            plots.push({id: count, loaded: false});
                            count+=1
                        });
                        var tracesComplete = 0;
                        var first_plot = plotConfig.plots[0]; // TODO: Currently picking  only the first plot config, make it more multiple plots
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
                                        values.values.push(formatData(row[trace.data_col]));
                                      });
                                      plot_values.data.push(values);
                                      plot_values.layout = layout;
                                      plot_values.config = config;
                                      break;
                                    case "histogram-horizontal":
                                      var values = getValues(plot.plot_type, trace.legend);
                                      data.forEach(function (row) {
                                        values.x.push(formatData(row[trace.data_col]));
                                      });
                                      plot_values.data.push(values);
                                      plot_values.layout = layout;
                                      plot_values.config = config;
                                      break;
                                    case "histogram-vertical":
                                      var values = getValues(plot.plot_type, trace.legend);
                                      data.forEach(function (row) {
                                        values.y.push(formatData(row[trace.data_col]));
                                      });
                                      plot_values.data.push(values);
                                      plot_values.layout = layout;
                                      plot_values.config = config;
                                      break;

                                    case "bar":
                                      if(trace.orientation == "h") {
                                        for(var i = 0; i < trace.x_col.length;i++) {
                                          var values = getValues(plot.plot_type, trace.legend ? trace.legend[i]: '',  trace.orientation);
                                          data.forEach(function (row) {
                                              values.x.push(formatData(row[trace.x_col[i]]));
                                              values.y.push(formatData(row[trace.y_col]));
                                              values.text.push(formatData(row[trace.x_col[i]]))
                                          });
                                          plot_values.data.push(values);
                                          plot_values.layout = layout;
                                          plot_values.config = config;
                                        }
                                      } else {
                                        for(var i = 0; i < trace.y_col.length;i++) {
                                          var values = getValues(plot.plot_type, trace.legend ? trace.legend[i]: '',  trace.orientation);
                                          data.forEach(function (row) {
                                              values.x.push(formatData(row[trace.x_col]));
                                              values.y.push(formatData(row[trace.y_col[i]]));
                                              values.text.push(formatData(row[trace.y_col[i]]))
                                          });
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
                                            values.x.push(formatData(row[trace.x_col]));
                                            values.y.push(formatData(row[trace.y_col[i]]));
                                          });
                                          plot_values.data.push(values);
                                          plot_values.layout = layout;
                                          plot_values.config = config;
                                        }
                                        break;
                                  }



                                  tracesComplete++;
                                  if (tracesComplete == plot.traces.length) {
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
                                      console.log("plots: ", plots);
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
                vm.x_label = plotConfig.x_axis_label;
                vm.types = ["line", "bar", "dot", "area"];
                vm.model = {
                  title: plotConfig.page_title,
                  type : {
                    name: plotConfig.plot_type,
                  }
                }
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
                              console.log(plots);
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
            .run(['ERMrest', 'PlotUtils', 'messageMap', 'Session', '$rootScope',
             function runApp(ERMrest, PlotUtils, messageMap, Session, $rootScope) {
               try {
                 $rootScope.loginShown = false;
                 var subId = Session.subscribeOnChange(function () {
                   Session.unsubscribeOnChange(subId);
                   var session = Session.getSessionValue();
                   if (!session) {
                       var notAuthorizedError = new ERMrest.UnauthorizedError(messageMap.unauthorizedErrorCode, (messageMap.unauthorizedMessage + messageMap.reportErrorToAdmin));
                       throw notAuthorizedError;
                   }
                   PlotUtils.getData();
                 });
               } catch (exception) {
                   throw exception;
               }
             }
         ]);
})();
