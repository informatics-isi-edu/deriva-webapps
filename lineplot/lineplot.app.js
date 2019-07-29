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
                    getData: function (timestamp) {
                        var baseUri = "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/";

                        var plots = {
                          data: []
                        };
                        var tracesComplete = 0;
                        lineplotConfig.traces.forEach(function (trace) {
                            var uriWithFilters = baseUri + trace.path + "/subject_id=" + $rootScope.subject_id + "&recorded_time::geq::" + UriUtils.fixedEncodeURIComponent(timestamp);
                            if ($rootScope.duration) {
                                var end_x = moment(timestamp).add($rootScope.duration, 'h').format(dataFormats.datetime.submission);
                                uriWithFilters += "&recorded_time::leq::" + UriUtils.fixedEncodeURIComponent(end_x);
                            }
                            var uri = uriWithFilters + "/" + trace.x_col + "," + trace.y_col + "@sort(recorded_time)?limit=" + $rootScope.limit;
                            $http.get(uri).then(function(response) {
                                console.log(response, response.headers('content-type'));
                                var layout = {
                                    title: lineplotConfig.plot_title,
                                    xaxis: {
                                        title: lineplotConfig.x_axis_label
                                    },
                                    yaxis: {
                                        title: lineplotConfig.y_axis_label
                                    }
                                }

                                var config = {
                                  displaylogo: false,
                                }

                                var lineplot = {
                                    x: [],
                                    y: [],
                                    type: "scatter",
                                    name: trace.label,
                                    mode: 'lines'
                                }

                                var data = response.data;
                                // data points taken 1 per second, 60 per minute, 3600 per hour
                                data.forEach(function (row) {
                                    lineplot.x.push(row[trace.x_col]);
                                    lineplot.y.push(row[trace.y_col]);
                                });

                                plots.data.push(lineplot);
                                plots.layout = layout;
                                plots.config = config;

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
                vm.model = {
                    user: $rootScope.user,
                    subject: $rootScope.subject_id,
                    duration: $rootScope.duration,
                    date: moment($rootScope.start_time).format(dataFormats.date),
                    time: moment($rootScope.start_time).format(dataFormats.time24),
                    meridiem: 'AM',
                    type: 'Line Plot',
                };
                vm.types = lineplotConfig.types;

                vm.applyDatetime = function () {
                    var timestamp = moment(vm.model.date + vm.model.time, dataFormats.date + dataFormats.time12).format(dataFormats.datetime.submission);
                    if (vm.model.duration != null && vm.model.duration.length > 0) {
                    	$rootScope.duration = vm.model.duration;
                    }
                    LineplotUtils.getData(timestamp);
                }

                vm.toggleMeridiem = function () {
                    var meridiem = vm.model.meridiem;
                    if (meridiem.charAt(0).toLowerCase() === 'a') {
                        return meridiem = 'PM';
                    }
                    return meridiem = 'AM';
                }

                vm.applyCurrentDatetime = function () {
                    vm.model.date = moment().format(dataFormats.date);
                    vm.model.time = moment().format(dataFormats.time24);
                }

                vm.removeValue = function () {
                    vm.model.date = null;
                    vm.model.time = null;
                }

                vm.changeSelection = function(value) {
                  switch (vm.model.type) {
                    case 'Bar Plot':
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
                    case 'Line Plot':
                      var newPlotData = [];
                      var plotsData = $rootScope.plots.data;
                      var layout = $rootScope.plots.layout;
                      var config = $rootScope.plots.config;

                      plotsData.forEach(function (row) {
                          row.type="scatter";
                          row.mode="lines"
                          newPlotData.push(row);
                      });
                      $rootScope.plots = {
                        data: newPlotData,
                        layout: layout,
                        config: config
                      };
                      // vm.model.type.feature = feature;
                      break;
                    case "Dot Plot":
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
                    case "Area Plot":
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

                vm.logout = function () {
                    var logoutURL = '/';
                    var serviceURL = $window.location.origin;
                    var url = serviceURL + "/authn/session";

                    url += '?logout_url=' + UriUtils.fixedEncodeURIComponent(logoutURL);

                    $http.delete(url).then(function(response) {
                        $window.location = response.data.logout_url;
                    }, function(error) {
                        // if the logout fails for some reason, send the user to the logout url as defined above
                        $window.location = logoutURL;
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
            .run(['LineplotUtils', 'UriUtils', '$http', '$rootScope', '$window', function runApp(LineplotUtils, UriUtils, $http, $rootScope, $window) {
                $rootScope.loginShown = false;
                $rootScope.params = {};
                var query = $window.location.search;
                query = query.slice(query.indexOf("?")+1, query.length);
                var queryParams = query.split('&');
                for (var i=0; i<queryParams.length; i++){
                    queryParams[i] = queryParams[i].split('=');
                    var key = queryParams[i][0],
                        value = queryParams[i][1];

                    $rootScope.params[key] = value;
                }

                $rootScope.subject_id = $rootScope.params.subject_id ? $rootScope.params.subject_id : lineplotConfig.subject_id;
                $rootScope.start_time = $rootScope.params.start_time ? $rootScope.params.start_time : lineplotConfig.start_time;
                $rootScope.limit = $rootScope.params.limit ? $rootScope.params.limit : lineplotConfig.limit;
                $rootScope.duration = $rootScope.params.duration ? $rootScope.params.duration : lineplotConfig.duration;

                var serviceURL = $window.location.origin;
                $http.get(serviceURL + "/authn/session").then(function(response) {
                	$rootScope.user = response.data.client.display_name;
                    LineplotUtils.getData($rootScope.start_time);
                }).catch(function(err) {
                	$rootScope.user = '';
                	//console.log(JSON.stringify(err, null, 4));
                    var url = serviceURL + '/authn/preauth?referrer='+UriUtils.fixedEncodeURIComponent($window.location.href);
                    var config = {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'Accept': 'application/json'
                        }
                    };
                    $http.get(url, config).then(function(response) {
                        var data = response.data;
                        login_url = data['redirect_url'];
                        $window.location=login_url;

                    }, function(error) {
                    	alert(err.data);
                    });


                });

                // var ermrestURI1 = "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_airbeam_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00/recorded_time,pm_value,rh_value,f_value@sort(recorded_time)?limit=7200",
            }
        ]);
})();
