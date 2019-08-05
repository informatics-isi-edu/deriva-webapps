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
                    default:
                      return "line+markers";
                  }
                }

                return {
                    getData: function () {
                        var plots = []
                        var tracesComplete = 0;
                        var first_plot = plotConfig.plots[0]; // TODO: Currently picking  only the first plot config, make it more multiple plots
                        var plotComplete = 0;
                        plotConfig.plots.forEach(function(plot) {
                          var plot_values = {
                            data: [],
                          };
                          var tracesComplete = 0;
                          plot.traces.forEach(function (trace) {
                              server.http.get(trace.uri).then(function(response) {

                                  var layout = {
                                      title: plot.plot_title,
                                      xaxis: {
                                          title: plot.x_axis_label
                                      },
                                      yaxis: {
                                          title: plot.y_axis_label
                                      },
                                      responsive: true,
                                      autosize: true,
                                      width: 1000,
                                      height: 500,
                                      showlegend: true,
                                  };
                                  var config = {
                                    displaylogo: false,
                                    modeBarButtonsToRemove: plot.plotlyDefaultButtonsToRemove
                                  };
                                  var data = response.data;

                                  for(var i = 0; i < trace.y_col.length;i++) {
                                    var values = {
                                        x: [],
                                        y: [],
                                        type: getType(plot.plot_type),
                                        name: trace.legend[i] || '',
                                        fill: plot.plot_type == 'area' ? 'tozeroy':'',
                                        mode: getMode(plot.plot_type)
                                    }
                                    data.forEach(function (row) {
                                        values.x.push(row[trace.x_col]);
                                        values.y.push(row[trace.y_col[i]]);
                                    });

                                    plot_values.data.push(values);
                                    plot_values.layout = layout;
                                    plot_values.config = config;
                                  }

                                  tracesComplete++;
                                  if (tracesComplete == plot.traces.length) {
                                    var id = plots.length;
                                    plots.push({id:id, plot_values: plot_values});
                                    if (plots.length == plotConfig.plots.length) {
                                      // $rootScope.plots = plots;
                                      // Plotly.relayout();
                                      console.log("plots: ", plots);
                                      $rootScope.plots = plots;

                                    }

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
                  title: plotConfig.title,
                  type : {
                    name: plotConfig.plot_type,
                  }
                }
                // vm.changeSelection = function(value) { // Not yet used for the selection of plot type 
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
                    default:
                      break;
                  }
                }

                vm.plotsLoaded = false;
                $scope.showPlot = function () {
                	if (vm.model.user == null) {
                		vm.model.user = $rootScope.user;
                	}
                    $scope.$apply(function () {
                        vm.plotsLoaded = true;
                    });
                }
            }])
            .directive('plot', ['$rootScope', function ($rootScope) {

                return {
                    link: function (scope, element) {
                        scope.$watch('plots', function (plots) {
                            console.log(plots);
                            if (plots) {
                            		for (var i = 0; i < plots.length; i++) {
                            			if (plots[i].id == element[0].attributes['plot-id'].nodeValue) {
                                    Plotly.newPlot(element[0], plots[i].plot_values.data, plots[i].plot_values.layout, plots[i].plot_values.config).then(function () {
                        								scope.showPlot();
                        						}.bind(plots.length));
                                  }
                                }
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
