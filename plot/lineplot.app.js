(function () {
    'use strict';

    angular.module('chaise.configure-lineplotApp', ['chaise.config'])

        .constant('appName', 'lineplotApp')

        .run(['$rootScope', function ($rootScope) {
            // When the configuration module's run block emits the `configuration-done` event, attach the app to the DOM
            $rootScope.$on("configuration-done", function () {

                angular.element(document).ready(function () {
                    angular.bootstrap(document.getElementById("lineplot"), ["lineplotApp"]);
                });
            });
        }]);

        angular.module('lineplotApp', [
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
            .factory('LineplotUtils', ['AlertsService', 'dataFormats', 'Session', 'UriUtils', '$http', '$rootScope', function (AlertsService, dataFormats, Session, UriUtils, $http, $rootScope) {
                return {
                    getData: function () {
                        var plots = {
                          data: []
                        };
                        var tracesComplete = 0;
                        lineplotConfig.traces.forEach(function (trace) {
                            $http.get(trace.uri).then(function(response) {
                                var layout = {
                                    title: lineplotConfig.plot_title,
                                    xaxis: {
                                        title: lineplotConfig.x_axis_label
                                    },
                                    yaxis: {
                                        title: lineplotConfig.y_axis_label
                                    },
                                    responsive: true,
                                    autosize: true,
                                    width: 1200,
                                    height: 500,
                                    showlegend: true,
                                    legend: {
                                      x: 1,
                                      y: 0.5
                                    }
                                }

                                var config = {
                                  displaylogo: false,
                                  modeBarButtonsToRemove: lineplotConfig.modeBarButtonsToRemove
                                }
                                var data = response.data;

                                for(var i = 0; i < trace.y_col.length;i++) {
                                  var lineplot = {
                                      x: [],
                                      y: [],
                                      type: lineplotConfig.plot_type,
                                      name: trace.label[i] || '',
                                      // mode: 'lines'
                                  }
                                  data.forEach(function (row) {
                                      lineplot.x.push(row[trace.x_col]);
                                      lineplot.y.push(row[trace.y_col[i]]);
                                  });

                                  plots.data.push(lineplot);
                                  plots.layout = layout;
                                  plots.config = config;
                                }
                                tracesComplete++;
                                if (tracesComplete == lineplotConfig.traces.length) {
                                  console.log(plots);
                                    $rootScope.plots = plots;
                                    Plotly.relayout();
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
                                    }
                                }
                            });
                        });
                    }
                }
            }])
            .controller('LineplotController', ['AlertsService', 'dataFormats', 'LineplotUtils', 'UriUtils', '$http', '$window', '$rootScope', '$scope', '$timeout', function LineplotController(AlertsService, dataFormats, LineplotUtils, UriUtils, $http, $window, $rootScope, $scope, $timeout) {
                var vm = this;
                vm.alerts = AlertsService.alerts;
                vm.dataFormats = dataFormats;
                vm.x_label = lineplotConfig.x_axis_label;
                vm.types = ["line", "bar", "dot", "area"];
                vm.model = {
                  type : {
                    name: lineplotConfig.plot_type,
                  }
                }
                vm.changeSelection = function(value) {
                  switch (vm.model.type.name) {
                    case 'bar':
                      var newPlotData = [];
                      var plotsData = $rootScope.plots.data;
                      var layout = $rootScope.plots.layout;
                      var config = $rootScope.plots.config;
                      plotsData.forEach(function (row) {
                          row.type="bar";
                          newPlotData.push(row);
                      });
                      $rootScope.plots = {
                        data: newPlotData,
                        layout: layout,
                        config: config
                      };
                      // $rootScope.plots.layout = layout; // TODO: Layout for bar chart
                      break;
                    case 'line':
                      var newPlotData = [];
                      var plotsData = $rootScope.plots.data;
                      var layout = $rootScope.plots.layout;
                      var config = $rootScope.plots.config;

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
                      // vm.model.type.feature = feature;
                      break;
                    case "dot":
                      var newPlotData = [];
                      var plotsData = $rootScope.plots.data;
                      var layout = $rootScope.plots.layout;
                      var config = $rootScope.plots.config;

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
                      // vm.model.type.feature = feature;
                      break;
                    case "area":
                      var newPlotData = [];
                      var plotsData = $rootScope.plots.data;
                      var layout = $rootScope.plots.layout;
                      var config = $rootScope.plots.config;

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

                  }
                  console.log(vm.model.type);
                }

                vm.plotsLoaded = false;
                $scope.showLineplot = function () {
                	if (vm.model.user == null) {
                		vm.model.user = $rootScope.user;
                	}
                    $scope.$apply(function () {
                        vm.plotsLoaded = true;
                    });
                }
            }])
            .directive('lineplot', ['$rootScope', function ($rootScope) {
                return {
                    link: function (scope, element) {

                        scope.$watch('plots', function (plots) {
                            if (plots) {
                                Plotly.newPlot(element[0], plots.data, plots.layout, plots.config).then(function () {
                                    scope.showLineplot();
                                }.bind(1));
                            }
                        });
                    }
                };
            }])
            .run(['AlertsService', 'ERMrest', 'LineplotUtils', 'messageMap', 'Session', 'UriUtils', '$http', '$rootScope', '$window',
             function runApp(AlertsService, ERMrest, LineplotUtils, messageMap, Session, UriUtils, $http, $rootScope, $window) {
               try {
                 $rootScope.loginShown = false;
                 var subId = Session.subscribeOnChange(function () {
                   Session.unsubscribeOnChange(subId);
                   var session = Session.getSessionValue();

                   if (!session) {
                       var notAuthorizedError = new ERMrest.UnauthorizedError(messageMap.unauthorizedErrorCode, (messageMap.unauthorizedMessage + messageMap.reportErrorToAdmin));
                       throw notAuthorizedError;
                   }

                   LineplotUtils.getData();
                 });
               } catch (exception) {
                   throw exception;
               }
               // var ermrestURI1 = "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_airbeam_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00/recorded_time,pm_value,rh_value,f_value@sort(recorded_time)?limit=7200",
             }
         ]);
})();
