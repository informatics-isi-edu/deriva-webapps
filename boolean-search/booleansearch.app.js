var setSourceForFilter;
(function () {
    'use strict';
    class filterModel {
        constructor(defaultOptions) {
            this.toStageOptions = defaultOptions.fromStageOptions;
            this.strength = defaultOptions.strengthOptions[1];
            this.source = null;
            this.stageFrom = defaultOptions.fromStageOptions[0];
            this.stageTo = defaultOptions.fromStageOptions[defaultOptions.fromStageOptions.length - 1];
            this.pattern = "";
            this.location = "";
        }
    }
    angular.module('booleansearchApp', [
        'ngSanitize',
        'ngCookies',
        'chaise.utils',
        'chaise.alerts',
        'chaise.resizable',
        'ermrestjs',
        'ui.bootstrap'
    ])
        .config(['$cookiesProvider', function ($cookiesProvider) {
            $cookiesProvider.defaults.path = '/';
        }])
        .config(['$uibTooltipProvider', function ($uibTooltipProvider) {
            $uibTooltipProvider.options({ appendToBody: true });
        }])
        .config(['ConfigUtilsProvider', function (ConfigUtilsProvider) {
            ConfigUtilsProvider.$get().setConfigJSON();
        }])
        .value('booleanSearchModel', {
            rows: [{}]
        })
        .value('defaultOptions', {
            strengthOptions: [],
            fromStageOptions: [],
            patternOptions: [],
            locationOptions: []
        })
        .factory('filterOptions', ['$http', '$window', '$log', function ($http, $window, $log) {
            var baseUrl = $window.location.origin;
            var specExprUrl = baseUrl + "/ermrest/catalog/2/attributegroup/Gene_Expression:Specimen_Expression";
            var devStageUrl = baseUrl + "/ermrest/catalog/2/attribute/Vocabulary:Developmental_Stage";
            var getStrengthOptions = function () {
                return $http.get(specExprUrl + "/Strength").then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    $log.warn(err);
                    return null;
                })
            };
            var getPatternOptions = function () {
                return $http.get(specExprUrl + "/Pattern").then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    $log.warn(err);
                    return null;
                })
            };
            var getLocationOptions = function () {
                return $http.get(specExprUrl + "/Pattern_Location").then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    $log.warn(err);
                    return null;
                })
            };
            var getStageOptions = function (species) {
                return $http.get(devStageUrl + "/Species=" + encodeURIComponent(species) + "/Name,Ordinal@Sort(Ordinal)").then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    $log.warn(err);
                    return null;
                })
            };
            return {
                getStrengthOptions: getStrengthOptions,
                getPatternOptions: getPatternOptions,
                getLocationOptions: getLocationOptions,
                getStageOptions: getStageOptions
            }
        }])
        .controller('BooleanSearchController', ['$scope', 'booleanSearchModel', 'AlertsService', 'defaultOptions', '$rootScope', 'ERMrest', function BooleanSearchController($scope, booleanSearchModel, AlertsService, defaultOptions, $rootScope, ERMrest) {
            var config = Object.assign({}, booleanSearchConfig);
            $scope.options = defaultOptions;
            $scope.treeviewOpen = true;
            $scope.togglePanel = togglePanel;
            $scope.setClass = setClass;
            $scope.filterRowLimit = config.presentation.rowLimit;
            var vm = this;

            vm.initialized = false;
            vm.booleanSearchModel = booleanSearchModel;
            vm.currentRow = 0;
            vm.copyFilterRow = copyFilterRow;
            vm.removeFilterRow = removeFilterRow;
            vm.clearFilterRow = clearFilterRow;
            vm.changeActiveRow = changeActiveRow;
            vm.setToStageOptions = setToStageOptions;
            vm.submit = submit;
            $rootScope.$watch("dataLoaded.count", function (newValue, oldValue) {
                if (newValue == 4) {
                    initialize();
                }
            });

            function initialize() {
                vm.initialized = true;
                let firstRow = new filterModel(defaultOptions);
                vm.booleanSearchModel.rows[0] = firstRow;
            }

            function copyFilterRow() {
                var rowset = vm.booleanSearchModel.rows;
                let row = new filterModel(defaultOptions);
                rowset.push(row);
                vm.currentRow = rowset.length - 1;
            }
            function removeFilterRow(index, event) {
                vm.booleanSearchModel.rows.splice(index, 1);
                if (vm.currentRow >= index) {
                    if (!(vm.currentRow == 0 && index == 0)) {
                        vm.currentRow--;
                    }
                }
                event.stopPropagation();
            }
            function clearFilterRow(index) {
                vm.booleanSearchModel.rows[index] = new filterModel(defaultOptions);
            }
            function changeActiveRow(index) {
                vm.currentRow = index;
            }
            function setToStageOptions(index) {
                var toStageOptions = defaultOptions.fromStageOptions;
                var pos = toStageOptions.indexOf(vm.booleanSearchModel.rows[index].stageFrom);
                vm.booleanSearchModel.rows[index].toStageOptions = toStageOptions.slice(pos);
                if (vm.booleanSearchModel.rows[index].stageTo.Ordinal < vm.booleanSearchModel.rows[index].stageFrom.Ordinal) {
                    vm.booleanSearchModel.rows[index].stageTo = vm.booleanSearchModel.rows[index].stageFrom;
                }
            }
            setSourceForFilter = function (value) {
                vm.booleanSearchModel.rows[vm.currentRow].source = {
                    name: value.name,
                    id: value.id
                };
                $scope.$apply();
            }
            function submit() {
                var form = vm.formContainer;
                if (form.$invalid) {
                    vm.readyToSubmit = false;
                    AlertsService.addAlert('Sorry, the data could not be submitted because there are errors on the form. Please check all fields and try again.', 'error');
                    form.$setSubmitted();
                    return;
                }
                var query = "";
                var displayname = "";
                vm.booleanSearchModel.rows.forEach(function (row, index) {
                    var pattern = row.pattern == "" || row.pattern == null ? "" : "&Pattern=" + row.pattern;
                    var location = row.location == "" || row.location == null ? "" : "&Pattern_Location=" + row.location;
                    query = query + "/(Stage_ID)=(Vocabulary:Developmental_Stage:ID)/Ordinal::geq::" + row.stageFrom.Ordinal + "&Ordinal::leq::" + row.stageTo.Ordinal + "/$M/(RID)=(Specimen_Expression:Specimen)/Strength=" + encodeURIComponent(row.strength) + "&Region=" + encodeURIComponent(row.source.id) + pattern + location + "/$M";
                    if (index != 0) {
                        displayname += " AND ";
                    }
                    displayname += ("p{in \"" + row.source.name + "\" " + row.stageFrom.Name + ".." + row.stageTo.Name);
                    if (pattern != "") {
                        displayname += (" pt=" + row.pattern);
                    }
                    if (location != "") {
                        displayname += (" lc=" + row.location);
                    }
                    displayname += "}";
                });
                var customFacet = {
                    "displayname": displayname,
                    "ermrest_path": query
                }
                var location = window.origin + "/chaise/recordset/" + ERMrest.createPath("2", "Gene_Expression", "Specimen", null, customFacet);
                window.open(location, "_blank");
                console.log(vm.booleanSearchModel.rows);
            }

            function togglePanel() {
                $scope.treeviewOpen = !$scope.treeviewOpen;
            }

            function setClass() {
                return { 'glyphicon glyphicon-triangle-left': $scope.treeviewOpen, 'glyphicon glyphicon-triangle-right': !$scope.treeviewOpen };
            }

        }])
        .directive('treeView', ['$window', function ($window) {
            return {
                restrict: 'E',
                link: function (scope, element, attrs) {
                    var baseUrl = $window.location.href.substring(0, $window.location.href.indexOf("boolean-search"));
                    var treeviewUrl = baseUrl + "treeview/index.html?Parent_App=booleanSearch";
                    element.replaceWith('<object type="text/html" data="' + treeviewUrl + '" width="100%" height="100%" style="overflow:auto;"></object>');
                }
            };
        }])
        .run(['ERMrest', 'UriUtils', 'filterOptions', 'defaultOptions', '$rootScope',
            function runBooleanSearchApp(ERMrest, UriUtils, filterOptions, defaultOptions, $rootScope) {
                $rootScope.dataLoaded = {
                    count: 0
                };
                filterOptions.getStrengthOptions().then(function (data) {
                    data.forEach(function (el) {
                        defaultOptions.strengthOptions.push(el.Strength);
                    });
                    $rootScope.dataLoaded.count++;
                });
                filterOptions.getPatternOptions().then(function (data) {
                    data.forEach(function (el) {
                        if (el.Pattern == null) {
                            return;
                        }
                        defaultOptions.patternOptions.push(el.Pattern);
                    });
                    $rootScope.dataLoaded.count++;
                });
                filterOptions.getLocationOptions().then(function (data) {
                    data.forEach(function (el) {
                        if (el.Pattern_Location == null) {
                            return;
                        }
                        defaultOptions.locationOptions.push(el.Pattern_Location);
                    });
                    $rootScope.dataLoaded.count++;
                });
                var mouseSpecies = "NCBITaxon:10090";
                var humanSpecies = "NCBITaxon:9606";
                filterOptions.getStageOptions(mouseSpecies).then(function (data) {
                    data.forEach(function (el) {
                        defaultOptions.fromStageOptions.push({
                            "Name": el.Name,
                            "Ordinal": el.Ordinal
                        });
                    });
                    $rootScope.dataLoaded.count++;
                });
            }
        ]);
})();
