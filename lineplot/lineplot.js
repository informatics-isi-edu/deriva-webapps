var lineplotApp = angular.module('lineplotApp', [
    'ngSanitize',
    'ngCookies',
    'chaise.alerts',
    'chaise.filters',
    'chaise.utils',
    'ermrestjs',
    'ui.bootstrap'])

    .config(['$cookiesProvider', function ($cookiesProvider) {
        $cookiesProvider.defaults.path = '/';
    }])

    .run(['LineplotUtils', 'UriUtils', '$rootScope', '$window', function runApp(LineplotUtils, UriUtils, $rootScope, $window) {
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

        LineplotUtils.getData($rootScope.start_time);
        // var ermrestURI1 = "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/prisms:breathe_platform_airbeam_view_dev_ft/subject_id=159&recorded_time::geq::2018-10-15T12%3A00%3A00/recorded_time,pm_value,rh_value,f_value@sort(recorded_time)?limit=7200",
    }
]);

lineplotApp.factory('LineplotUtils', ['AlertsService', 'dataFormats', 'Session', 'UriUtils', '$http', '$rootScope', function (AlertsService, dataFormats, Session, UriUtils, $http, $rootScope) {
    return {
        getData: function (timestamp) {
            var baseUri = "https://prisms.isrd.isi.edu/ermrest/catalog/1/attribute/";

            var lineplots = [];
            var tracesComplete = 0;
            lineplotConfig.traces.forEach(function (trace) {
                var uriWithFilters = baseUri + trace.path + "/subject_id=" + $rootScope.subject_id + "&recorded_time::geq::" + UriUtils.fixedEncodeURIComponent(timestamp);
                if ($rootScope.duration) {
                    var end_x = moment(timestamp).add($rootScope.duration, 'h').format(dataFormats.datetime.submission);
                    uriWithFilters += "&recorded_time::leq::" + UriUtils.fixedEncodeURIComponent(end_x);
                }
                var uri = uriWithFilters + "/" + trace.x_col + "," + trace.y_col + "@sort(recorded_time)?limit=" + $rootScope.limit;
                $http.get(uri).then(function(response) {
                    var lineplot = {
                        x: [],
                        y: [],
                        type: "scatter",
                        name: trace.label
                    }

                    var data = response.data;
                    // data points taken 1 per second, 60 per minute, 3600 per hour
                    data.forEach(function (row) {
                        lineplot.x.push(row[trace.x_col]);
                        lineplot.y.push(row[trace.y_col]);
                    });

                    lineplots.push(lineplot);

                    tracesComplete++;
                    if (tracesComplete == lineplotConfig.traces.length) {
                        $rootScope.lineplots = lineplots;
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
}]);

lineplotApp.controller('LineplotController', ['AlertsService', 'dataFormats', 'LineplotUtils', 'UriUtils', '$rootScope', '$scope', '$timeout', function LineplotController(AlertsService, dataFormats, LineplotUtils, UriUtils, $rootScope, $scope, $timeout) {
    var vm = this;
    vm.alerts = AlertsService.alerts;
    vm.dataFormats = dataFormats;
    vm.x_label = lineplotConfig.x_axis_label;
    vm.model = {
        date: null,
        time: null,
        meridiem: 'AM'
    }

    vm.applyDatetime = function () {
        var timestamp = moment(vm.model.date + vm.model.time, dataFormats.date + dataFormats.time12).format(dataFormats.datetime.submission);
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
        vm.model = {
            date: moment().format(dataFormats.date),
            time: moment().format(dataFormats.time24)
        }
    }

    vm.removeValue = function () {
        vm.model = {date: null, time: null};
    }

    vm.lineplotsLoaded = false;
    $scope.showLineplot = function () {
        $scope.$apply(function () {
            vm.lineplotsLoaded = true;
        });
    }
}]);

lineplotApp.directive('lineplot', ['$rootScope', function ($rootScope) {
    return {
        link: function (scope, element) {
            var layout = {
                title: lineplotConfig.plot_title,
                xaxis: {
                    title: lineplotConfig.x_axis_label
                },
                yaxis: {
                    title: lineplotConfig.y_axis_label
                }
            }

            scope.$watch('lineplots', function (plots) {
                if (plots) {
                    Plotly.newPlot(element[0], plots, layout).then(function () {
                        scope.showLineplot();
                    }.bind(1));
                }
            });
        }
    };
}]);
