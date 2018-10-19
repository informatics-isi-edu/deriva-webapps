(function () {
    'use strict';
    class filterModel {
        constructor() {
            this.strength = "present";
            this.source = null;
            this.stageFrom = "TS17";
            this.stageTo = "TS28";
            this.pattern = null;
            this.location = null;
        }
    }
    angular.module('booleansearchApp', [
        'ngSanitize',
        'ngCookies',
        'chaise.utils',
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
        .controller('BooleanSearchController', ['$scope', 'booleanSearchModel', function BooleanSearchController($scope, booleanSearchModel) {
            $scope.strengthOptions = ["present", "not detected", "uncertain"];
            $scope.sourceOptions = ["nephric cord", "nephric duct", "pronephros", "mesonphros"];
            $scope.stageOptions = ["TS17", "TS18", "TS19", "TS20", "TS21", "TS22", "TS23", "TS24", "TS25", "TS26", "TS27", "TS28"];
            $scope.patternOptions = ["graded", "regional", "restricted", "single cell", "spotted", "ubiquitous"];
            $scope.locationOptions = ["caudal", "deep", "distal", "dorsal", "lateral", "medial", "proximal", "radial", "rostral", "surface", "ventral"];
            var vm = this;
            vm.booleanSearchModel = booleanSearchModel;
            let firstRow = new filterModel();
            vm.booleanSearchModel.rows[0] = firstRow;
            vm.currentRow = 0;
            vm.copyFilterRow = copyFilterRow;
            vm.removeFilterRow = removeFilterRow;
            vm.clearFilterRow = clearFilterRow;
            vm.changeActiveRow = changeActiveRow;
            vm.submit = submit;

            function copyFilterRow() {
                var rowset = vm.booleanSearchModel.rows;
                let row = new filterModel();
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
                vm.booleanSearchModel.rows[index] = new filterModel();
            }
            function changeActiveRow(index) {
                vm.currentRow = index;
            }
            function submit() {
                console.log(vm.booleanSearchModel.rows);
            }

        }])
        .run(['ERMrest', 'UriUtils', '$rootScope', '$window',
            function runBooleanSearchApp(ERMrest, UriUtils, $rootScope, $window) {
            }
        ]);
})();
