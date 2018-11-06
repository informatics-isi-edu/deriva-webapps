(function () {
    'use strict';
    class filterModel {
        constructor(defaultOptions) {
            this.strength = defaultOptions.strengthOptions[0];
            this.source = null;
            this.stageFrom = "TS17";
            this.stageTo = "TS28";
            this.pattern = defaultOptions.patternOptions[0];
            this.location = defaultOptions.locationOptions[0];
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
        .value('defaultOptions',{
            strengthOptions: [],
            stageOptions:[],
            patternOptions:[],
            locationOptions:[]
        })
        .factory('filterOptions', ['$http','$window', '$log', function($http, $window, $log){
            var baseUrl = $window.location.origin;
            var specExprUrl = baseUrl+"/ermrest/catalog/2/attributegroup/Gene_Expression:Specimen_Expression";
            var devStageUrl = baseUrl+"/ermrest/catalog/2/attribute/Common:Developmental_Stage";
            var getStrengthOptions = function(){
                return $http.get(specExprUrl+"/Strength").then(function(response){
                    return response.data;
                }).catch(function(err){
                    $log.warn(err);
                    return null;
                })
            };
            var getPatternOptions = function(){
                return $http.get(specExprUrl+"/Pattern").then(function(response){
                    return response.data;
                }).catch(function(err){
                    $log.warn(err);
                    return null;
                })
            };
            var getLocationOptions = function(){
                return $http.get(specExprUrl+"/Pattern_Location").then(function(response){
                    return response.data;
                }).catch(function(err){
                    $log.warn(err);
                    return null;
                })
            };
            var getStageOptions = function(){
                return $http.get(devStageUrl+"/Name,Order").then(function(response){
                    return response.data;
                }).catch(function(err){
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
        .controller('BooleanSearchController', ['$scope', 'booleanSearchModel', 'AlertsService', 'defaultOptions', function BooleanSearchController($scope, booleanSearchModel, AlertsService, defaultOptions) {
            
            $scope.options = defaultOptions;
            //$scope.strengthOptions = defaultOptions.strengthOptions;//["present", "not detected", "uncertain"];
            $scope.sourceOptions = ["nephric cord", "nephric duct", "pronephros", "mesonphros"];
            //$scope.stageOptions = ["TS17", "TS18", "TS19", "TS20", "TS21", "TS22", "TS23", "TS24", "TS25", "TS26", "TS27", "TS28"];
            //$scope.patternOptions = defaultOptions.patternOptions;//["graded", "regional", "restricted", "single cell", "spotted", "ubiquitous"];
            //$scope.locationOptions = defaultOptions.locationOptions;//["caudal", "deep", "distal", "dorsal", "lateral", "medial", "proximal", "radial", "rostral", "surface", "ventral"];
            $scope.treeviewOpen = true;
            $scope.togglePanel = togglePanel;
            $scope.setClass = setClass;
            $scope.filterRowLimit = 10;
            var vm = this;
            vm.booleanSearchModel = booleanSearchModel;
            let firstRow = new filterModel(defaultOptions);
            vm.booleanSearchModel.rows[0] = firstRow;
            vm.currentRow = 0;
            vm.copyFilterRow = copyFilterRow;
            vm.removeFilterRow = removeFilterRow;
            vm.clearFilterRow = clearFilterRow;
            vm.changeActiveRow = changeActiveRow;
            vm.submit = submit;

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
            function submit() {
                var form = vm.formContainer;
                if (form.$invalid) {
                    vm.readyToSubmit = false;
                    AlertsService.addAlert('Sorry, the data could not be submitted because there are errors on the form. Please check all fields and try again.', 'error');
                    form.$setSubmitted();
                    return;
                }
                console.log(vm.booleanSearchModel.rows);
            }

            function togglePanel() {
                $scope.treeviewOpen = !$scope.treeviewOpen;
            }

            function setClass() {
                return { 'glyphicon glyphicon-triangle-left': $scope.treeviewOpen, 'glyphicon glyphicon-triangle-right': !$scope.treeviewOpen };
            }

        }])
        .run(['ERMrest', 'UriUtils', 'filterOptions', 'defaultOptions' ,
            function runBooleanSearchApp(ERMrest, UriUtils, filterOptions, defaultOptions) {
                filterOptions.getStrengthOptions().then(function(data){
                    data.forEach(function(el){
                        defaultOptions.strengthOptions.push(el.Strength);
                    });
                });
                filterOptions.getPatternOptions().then(function(data){
                    data.forEach(function(el){
                        defaultOptions.patternOptions.push(el.Pattern);
                    });
                });
                filterOptions.getLocationOptions().then(function(data){
                    data.forEach(function(el){
                        defaultOptions.locationOptions.push(el.Pattern_Location);
                    });
                });
                filterOptions.getStageOptions().then(function(data){
                    data.forEach(function(el){
                        defaultOptions.stageOptions.push({
                            "Name": el.Name,
                            "Order": el.Order
                        });
                    });
                });
            }
        ]);
})();
