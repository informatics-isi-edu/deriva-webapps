var heatmapApp =
    angular.module('heatmaptestApp', [
        'ngSanitize',
        'ngCookies',
        'chaise.utils',
        'ermrestjs',
        'ui.bootstrap'])
        .factory('constants', [function () {
            return {
                defaultPageSize: 25,
            };
        }])

        .config(['$cookiesProvider', function ($cookiesProvider) {
            $cookiesProvider.defaults.path = '/';
        }])

        // Configure all tooltips to be attached to the body by default. To attach a
        // tooltip on the element instead, set the `tooltip-append-to-body` attribute
        // to `false` on the element.
        .config(['$uibTooltipProvider', function ($uibTooltipProvider) {
            $uibTooltipProvider.options({ appendToBody: true });
        }])
        .config(['ConfigUtilsProvider', function (ConfigUtilsProvider) {
            ConfigUtilsProvider.$get().setConfigJSON();
        }])

        .factory('CreateData', function () {
            function createHeatmap(id) {
                var cur = {};
                cur.id = id;
                cur.title = "Developing Kidney " + id;
                return cur;
            }

            function createRows(id, xLen, yLen, maxXLabelLength) {
                var rows = {};
                rows.type = 'heatmap';
                rows.x = [];
                rows.y = [];
                rows.z = [];
                var xValues = ["E11_Meta_2", "E11_Meta", "E11_1", "E11_Met_W"];
                var zValues = [5, 6, 7, 8];

                for (var i = 0; i < yLen; i++) {
                    var yValue = id + '_at_' + (i + 1);
                    rows.y.push(yValue);
                    rows.z.push([]);
                    for (var j = 0; j < xLen; j++) {
                        rows.z[i].push(zValues[j % 4] + i * 0.7);
                    }
                }

                for (var i = 0; i < xLen; i++) {
                    var suffix = "";
                    var startChar = String.fromCharCode('A'.charCodeAt() + i);
                    var n = yLen > 1 ? maxXLabelLength - 10 : id - 10;
                    for (var j = 0; j < n; j++) {
                        // var c = String.fromCharCode(startChar.charCodeAt() + j);
                        suffix = suffix + startChar;
                    }
                    rows.x.push(xValues[i % 4] + suffix);
                }

                return rows;
            }

            return {
                createHeatmap: createHeatmap,
                createRows: createRows
            };
        })

        .run(['constants', 'DataUtils', 'ERMrest', 'ErrorService', 'headInjector', 'Session', 'UiUtils', 'UriUtils', '$log', '$rootScope', '$window', 'CreateData',
            function runApp(constants, DataUtils, ERMrest, ErrorService, headInjector, Session, UiUtils, UriUtils, $log, $rootScope, $window, CreateData) {
                var context = {};
                context = $rootScope.context = UriUtils.parseURLFragment($window.location, context);
                console.log(context);
                ERMrest.appLinkFn(UriUtils.appTagToURL);
                var ermrestURI = UriUtils.chaiseURItoErmrestURI($window.location);
                console.log("uri: ", ermrestURI);
                var heatmaps = [];
                var id = 11;
                var curHeatmap;
                while (id < 36) {
                    curHeatmap = CreateData.createHeatmap(id);
                    curHeatmap.rows = CreateData.createRows(id, 20, 1);
                    heatmaps.push(curHeatmap);
                    id++;
                    curHeatmap = CreateData.createHeatmap(id);
                    curHeatmap.rows = CreateData.createRows(id, 40, 1);
                    heatmaps.push(curHeatmap);
                    id++;
                    curHeatmap = CreateData.createHeatmap(id);
                    curHeatmap.rows = CreateData.createRows(id, 30, 1);
                    heatmaps.push(curHeatmap);
                    id++;
                    curHeatmap = CreateData.createHeatmap(id);
                    curHeatmap.rows = CreateData.createRows(id, 50, 1);
                    heatmaps.push(curHeatmap);
                    id++;
                }
                curHeatmap = CreateData.createHeatmap(id);
                curHeatmap.rows = CreateData.createRows(id, 40, 2, 39);
                heatmaps.push(curHeatmap);
                id++;
                curHeatmap = CreateData.createHeatmap(id);
                curHeatmap.rows = CreateData.createRows(id, 40, 3, 40);
                heatmaps.push(curHeatmap);
                id++;
                curHeatmap = CreateData.createHeatmap(id);
                curHeatmap.rows = CreateData.createRows(id, 40, 3, 20);
                heatmaps.push(curHeatmap);
                id++;
                curHeatmap = CreateData.createHeatmap(id);
                curHeatmap.rows = CreateData.createRows(id, 40, 3, 15);
                heatmaps.push(curHeatmap);

                console.log("heatmaps: ", heatmaps);
                $rootScope.heatmaps = heatmaps;
                $rootScope.heatmapRows = heatmaps[0].rows;
            }
        ]);

heatmapApp.controller('HeatmapController', function HeatmapController($scope, $http, $q) {
    heatmapApp.run();

});

