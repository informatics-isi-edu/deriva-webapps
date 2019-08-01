(function () {
    'use strict';

    angular.module('chaise.configure-2dplotApp', ['chaise.config'])

        .constant('appName', '2dplotApp')

        .run(['$rootScope', function ($rootScope) {
            // When the configuration module's run block emits the `configuration-done` event, attach the app to the DOM
            $rootScope.$on("configuration-done", function () {

                angular.element(document).ready(function () {
                    angular.bootstrap(document.getElementById("2dplotApp"), ["2dplotApp"]);
                });
            });
        }]);

        angular.module('2dplotApp', [
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
            .factory('PlotUtils', ['AlertsService', 'dataFormats', 'Session', 'UriUtils', '$http', '$rootScope', function (AlertsService, dataFormats, Session, UriUtils, $http, $rootScope) {
                return {
                    getData: function (timestamp) {
                        var plots = {
                          data: []
                        };
                        var tracesComplete = 0;
                        plotConfig.traces.forEach(function (trace) {
                            $http.get(trace.uri).then(function(response) {
                                console.log(response, response.headers('content-type'));
                                var layout = {
                                    title: plotConfig.plot_title,
                                    xaxis: {
                                        title: plotConfig.x_axis_label
                                    },
                                    yaxis: {
                                        title: plotConfig.y_axis_label
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
                                if (tracesComplete == plotConfig.traces.length) {
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
            .controller('PlotController', ['AlertsService', 'dataFormats', 'PlotUtils', 'UriUtils', '$http', '$window', '$rootScope', '$scope', '$timeout', function PlotController(AlertsService, dataFormats, PlotUtils, UriUtils, $http, $window, $rootScope, $scope, $timeout) {
                var vm = this;
                vm.alerts = AlertsService.alerts;
                vm.dataFormats = dataFormats;
                vm.x_label = plotConfig.x_axis_label;
                vm.model = {
                    user: $rootScope.user,
                    subject: $rootScope.subject_id,
                    duration: $rootScope.duration,
                    date: moment($rootScope.start_time).format(dataFormats.date),
                    time: moment($rootScope.start_time).format(dataFormats.time24),
                    meridiem: 'AM',
                    type: 'Line Plot',
                };

                vm.applyDatetime = function () {
                    var timestamp = moment(vm.model.date + vm.model.time, dataFormats.date + dataFormats.time12).format(dataFormats.datetime.submission);
                    if (vm.model.duration != null && vm.model.duration.length > 0) {
                    	$rootScope.duration = vm.model.duration;
                    }
                    PlotUtils.getData(timestamp);
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
            .directive('2dplot', ['$rootScope', function ($rootScope) {
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
            .run(['AlertsService', 'ERMrest', 'PlotUtils', 'messageMap', 'Session', 'UriUtils', '$http', '$rootScope', '$window',
            function runApp(AlertsService, ERMrest, PlotUtils, messageMap, Session, UriUtils, $http, $rootScope, $window) {
              try {
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

                $rootScope.subject_id = $rootScope.params.subject_id ? $rootScope.params.subject_id : plotConfig.subject_id;
                $rootScope.start_time = $rootScope.params.start_time ? $rootScope.params.start_time : plotConfig.start_time;
                $rootScope.limit = $rootScope.params.limit ? $rootScope.params.limit : plotConfig.limit;
                $rootScope.duration = $rootScope.params.duration ? $rootScope.params.duration : plotConfig.duration;

                var subId = Session.subscribeOnChange(function () {
                  Session.unsubscribeOnChange(subId);
                  var session = Session.getSessionValue();

                  if (!session) {
                      var notAuthorizedError = new ERMrest.UnauthorizedError(messageMap.unauthorizedErrorCode, (messageMap.unauthorizedMessage + messageMap.reportErrorToAdmin));
                      throw notAuthorizedError;
                  }

                  PlotUtils.getData($rootScope.start_time);
                });
              } catch (exception) {
                  throw exception;
              }
              // var ermrestURI1 = "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_airbeam_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00/recorded_time,pm_value,rh_value,f_value@sort(recorded_time)?limit=7200",
            }
        ]);
})();
