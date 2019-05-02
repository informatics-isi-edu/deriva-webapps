"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var setSourceForFilter;
(function () {
    'use strict';

    var filterModel = function filterModel(defaultOptions) {
        _classCallCheck(this, filterModel);

        this.toStageOptions = defaultOptions.fromStageOptions.slice(17);;
        this.strength = "present";
        this.source = {
            "name": ""
        };
        this.stageFrom = defaultOptions.fromStageOptions[17];
        this.stageTo = defaultOptions.fromStageOptions[defaultOptions.fromStageOptions.length - 1];
        this.pattern = "";
        this.location = "";

        //Setting validity for all fields
        this.strengthInvalid = false;
        this.sourceInvalid = false;
        this.stageFromInvalid = false;
        this.stageToInvalid = false;
        this.patternInvalid = false;
        this.locationInvalid = false;
    };
    angular.module('booleansearchApp', [
        'ngSanitize',
        'ngCookies',
        'chaise.utils',
        'chaise.filters',
        'chaise.errors',
        'chaise.resizable',
        'ermrestjs',
        'ui.bootstrap',
        'chaise.navbar'
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
        .value('headerInfo', {
            pid: "",
            cid: ""
        })
        .factory('filterOptions', ['$http', '$window', 'ERMrest', 'headInjector', 'MathUtils', 'UriUtils', 'headerInfo', function ($http, $window, ERMrest, headInjector, MathUtils, UriUtils, headerInfo) {
            var baseUrl = $window.location.origin;
            var specExprUrl = baseUrl + "/ermrest/catalog/2/attributegroup/Gene_Expression:Specimen_Expression";
            var devStageUrl = baseUrl + "/ermrest/catalog/2/attribute/Vocabulary:Developmental_Stage";
            var sourceUrl = baseUrl + "/ermrest/catalog/2/entity/Vocabulary:Anatomy";

            // Configuring ERMrestjs service object and http module
            var contextHeaderParams = { "cid": "boolean-search" };
            var server = ERMrest.ermrestFactory.getServer(baseUrl + "/ermrest", contextHeaderParams);
            headerInfo.pid = MathUtils.uuid();
            headerInfo.cid = "boolean-search";
            headInjector.setWindowName();
            var getHeader = function () {
                return {
                    wid: $window.name,
                    cid: headerInfo.cid,
                    pid: headerInfo.pid,
                    action: "facet"
                };
            };

            var getStrengthOptions = function () {
                var headers = {};
                headers[ERMrest.contextHeaderName] = getHeader();
                headers[ERMrest.contextHeaderName].schema_table = "Gene_Expression:Specimen_Expression";
                headers[ERMrest.contextHeaderName].column = "Strength";
                headers[ERMrest.contextHeaderName].referrer = { schema_table: "Gene_Expression:Specimen" };
                headers[ERMrest.contextHeaderName].source = [{ "inbound": ["Gene_Expression", "Specimen_Expression_Specimen_fkey"] }, "Strength"];
                return server.http.get(specExprUrl + "/Strength", { headers: headers }).then(function success(response) {
                    return response.data;
                }).catch(function (err) {
                    throw ERMrest.responseToError(err);
                });
            };

            var getPatternOptions = function () {
                var headers = {};
                headers[ERMrest.contextHeaderName] = getHeader();
                headers[ERMrest.contextHeaderName].schema_table = "Gene_Expression:Specimen_Expression";
                headers[ERMrest.contextHeaderName].column = "Pattern";
                headers[ERMrest.contextHeaderName].referrer = { schema_table: "Gene_Expression:Specimen" };
                return server.http.get(specExprUrl + "/Pattern", { headers: headers }).then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    throw ERMrest.responseToError(err);
                });
            };
            var getLocationOptions = function () {
                var headers = {};
                headers[ERMrest.contextHeaderName] = getHeader();
                headers[ERMrest.contextHeaderName].schema_table = "Gene_Expression:Specimen_Expression";
                headers[ERMrest.contextHeaderName].column = "Pattern_Location";
                headers[ERMrest.contextHeaderName].referrer = { schema_table: "Gene_Expression:Specimen" };
                return server.http.get(specExprUrl + "/Pattern_Location", { headers: headers }).then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    throw ERMrest.responseToError(err);
                });
            };
            var getStageOptions = function (species) {
                var headers = {};
                headers[ERMrest.contextHeaderName] = getHeader();
                headers[ERMrest.contextHeaderName].schema_table = "Vocabulary:Developmental_Stage";
                headers[ERMrest.contextHeaderName].referrer = { "schema_table": "Gene_Expression:Specimen" };
                headers[ERMrest.contextHeaderName].source = [{ "outbound": ["Gene_Expression", "Specimen_Developmental_Stage_fkey"] }, "RID"];
                return server.http.get(devStageUrl + "/Species=" + encodeURIComponent(species) + "/Name,Ordinal@Sort(Ordinal)", { headers: headers }).then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    throw ERMrest.responseToError(err);
                });
            };
            var getSourceOptions = function (sources) {
                var headers = {};
                headers[ERMrest.contextHeaderName] = getHeader();
                headers[ERMrest.contextHeaderName].schema_table = "Vocabulary:Anatomy";
                headers[ERMrest.contextHeaderName].referrer = { schema_table: "Gene_Expression:Specimen" };
                headers[ERMrest.contextHeaderName].source = [{ "inbound": ["Gene_Expression", "Specimen_Expression_Specimen_fkey"] }, { "inbound": ["Gene_Expression", "Specimen_Expression_Rollup_Specimen_Expression_RID1"] }, { "outbound": ["Gene_Expression", "Specimen_Expression_Rollup_Rollup_Region1"] }, "RID"];
                var columnName = "Name=";
                var queryParam = "/" + columnName + UriUtils.fixedEncodeURIComponent(sources[0]);
                for (var i = 1; i < sources.length; i++) {
                    queryParam += (";" + columnName + UriUtils.fixedEncodeURIComponent(sources[i]));
                }
                return server.http.get(sourceUrl + queryParam, { headers: headers }).then(function (response) {
                    return response.data;
                }).catch(function (err) {
                    throw ERMrest.responseToError(err);
                });
            };
            return {
                getStrengthOptions: getStrengthOptions,
                getPatternOptions: getPatternOptions,
                getLocationOptions: getLocationOptions,
                getStageOptions: getStageOptions,
                getSourceOptions: getSourceOptions
            };
        }])
        .controller('BooleanSearchController', ['$scope', 'booleanSearchModel', 'defaultOptions', '$rootScope', 'ERMrest', '$window', 'filterOptions', 'Errors', 'ErrorService', 'modalUtils', 'UriUtils', 'headerInfo', function BooleanSearchController($scope, booleanSearchModel, defaultOptions, $rootScope, ERMrest, $window, filterOptions, Errors, ErrorService, modalUtils, UriUtils, headerInfo) {
            var config = Object.assign({}, booleanSearchConfig);
            $scope.options = defaultOptions;
            $scope.treeviewOpen = true;
            $scope.togglePanel = togglePanel;
            $scope.setClass = setClass;
            var vm = this;

            vm.initialized = false;
            vm.booleanSearchModel = booleanSearchModel;
            vm.currentRow = 0;
            vm.filters = 'p{in "" TS17..TS28}';
            vm.copyFilterRow = copyFilterRow;
            vm.removeFilterRow = removeFilterRow;
            vm.removeAll = removeAll;
            vm.clearFilterRow = clearFilterRow;
            vm.changeActiveRow = changeActiveRow;
            vm.setToStageOptions = setToStageOptions;
            vm.changeSelection = changeSelection;
            vm.submit = submit;
            vm.validateQuery = validateQuery;
            vm.saveFilters = saveFilters;
            vm.showInfo = showInfo;
            $rootScope.$watch("dataLoaded.count", function (newValue, oldValue) {
                if (newValue == 4) {
                    initialize();
                }
            });

            function initialize() {
                vm.initialized = true;
                var firstRow = new filterModel(defaultOptions);
                vm.booleanSearchModel.rows[0] = firstRow;
            }

            function copyFilterRow() {
                var rowset = vm.booleanSearchModel.rows;
                var row = new filterModel(defaultOptions);
                rowset.push(row);
                vm.currentRow = rowset.length - 1;
                changeFiltersDisplayText();
            }
            function removeFilterRow(index, event) {
                vm.booleanSearchModel.rows.splice(index, 1);
                if (vm.currentRow >= index) {
                    if (!(vm.currentRow == 0 && index == 0)) {
                        vm.currentRow--;
                    }
                }
                event.stopPropagation();
                changeFiltersDisplayText();
            }
            function removeAll(event) {
                vm.booleanSearchModel.rows = [];
                vm.booleanSearchModel.rows[0] = new filterModel(defaultOptions);
                vm.currentRow = 0;
                vm.filters = 'p{in "" TS17..TS28}';
                event.stopPropagation();
            }
            function clearFilterRow(index) {
                vm.booleanSearchModel.rows[index] = new filterModel(defaultOptions);
                changeFiltersDisplayText();
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
                vm.booleanSearchModel.rows[vm.currentRow].sourceInvalid = false;
                changeFiltersDisplayText();
                $scope.$apply();
            };

            function changeSelection(index, field) {
                if (vm.booleanSearchModel.rows[index].source != null) {
                    var param = field + "Invalid";
                    vm.booleanSearchModel.rows[index][param] = false;
                    changeFiltersDisplayText();
                }
            }
            function changeFiltersDisplayText() {
                var displayname = "";
                vm.booleanSearchModel.rows.forEach(function (row, index) {
                    var pattern = row.pattern == "" || row.pattern == null ? "" : "&Pattern=" + row.pattern;
                    var location = row.location == "" || row.location == null ? "" : "&Pattern_Location=" + row.location;
                    if (index != 0) {
                        displayname += " AND ";
                    }
                    switch (row.strength) {
                        case "present":
                            displayname += "p";
                            break;
                        case "not detected":
                            displayname += "nd";
                            break;
                        case "uncertain":
                            displayname += "u";
                            break;
                    }
                    displayname += ("{in \"" + row.source.name + "\" " + row.stageFrom.Name + ".." + row.stageTo.Name);
                    if (pattern != "") {
                        displayname += (" pt=" + row.pattern);
                    }
                    if (location != "") {
                        displayname += (" lc=" + row.location);
                    }
                    displayname += "}";
                });
                vm.filters = displayname;
            }
            function validateSourceParam(submitQuery) {
                var sources = [];
                vm.booleanSearchModel.rows.forEach(function (row) {
                    sources.push(row.source.name);
                });
                var invalidSource = [];
                filterOptions.getSourceOptions(sources).then(function (data) {
                    vm.booleanSearchModel.rows.forEach(function (row, index) {
                        var match = data.filter(function (source) {
                            return source.Name === row.source.name;
                        });

                        if (match.length == 0) {
                            invalidSource.push(row.source.name);
                            row.sourceInvalid = true;
                        } else {
                            row.source.id = match[0].ID;
                            row.sourceInvalid = false;
                        }
                        if (index == vm.booleanSearchModel.rows.length - 1) {
                            validateOtherParams(invalidSource, submitQuery);
                        }
                    });
                });

            }
            function validateOtherParams(invalidSource, submitQuery) {
                var valid = true;
                if (invalidSource.length > 0) {
                    valid = false;
                }
                var invalid = {
                    strength: [],
                    source: invalidSource,
                    fromStage: [],
                    toStage: [],
                    pattern: [],
                    location: []
                };
                vm.booleanSearchModel.rows.forEach(function (row, index) {
                    if (defaultOptions.strengthOptions.indexOf(row.strength) < 0) {
                        valid = false;
                        invalid.strength.push(row.strength);
                        row.strengthInvalid = true;
                    } else {
                        row.strengthInvalid = false;
                    }

                    if (defaultOptions.fromStageOptions.filter(function (fromStage) {
                        return fromStage.Name === row.stageFrom.Name && fromStage.Ordinal === row.stageFrom.Ordinal;
                    }).length == 0) {
                        valid = false;
                        invalid.fromStage.push(row.stageFrom.Name);
                        row.stageFromInvalid = true;
                    } else {
                        row.stageFromInvalid = false;
                    }

                    if (defaultOptions.fromStageOptions.filter(function (toStage) {
                        return toStage.Name === row.stageTo.Name && toStage.Ordinal === row.stageTo.Ordinal;
                    }).length == 0) {
                        valid = false;
                        invalid.toStage.push(row.stageTo.Name);
                        row.stageToInvalid = true;
                    } else {
                        row.stageToInvalid = false;
                    }
                    if (!defaultOptions.patternOptions.includes(row.pattern)) {
                        valid = false;
                        invalid.pattern.push(row.pattern);
                        row.patternInvalid = true;
                    } else {
                        row.patternInvalid = false;
                    }
                    if (!defaultOptions.locationOptions.includes(row.location)) {
                        valid = false;
                        invalid.location.push(row.location);
                        row.locationInvalid = true;
                    } else {
                        row.locationInvalid = false;
                    }
                    if (index == vm.booleanSearchModel.rows.length - 1) {
                        if (valid) {
                            if (submitQuery) {
                                formQuery();
                            } else {
                                alert("All parameters are valid");
                            }

                        } else {
                            var form = vm.formContainer;
                            if (form.$invalid) {
                                vm.readyToSubmit = false;
                                form.$setSubmitted();
                                return;
                            }
                            var message = "Following errors exist in the query:<ul>";
                            var err = formErrorMessage(invalid);
                            message += err;
                            message += "</ul>";
                            var okActionMessage = "Click OK to <b>go back</b> to the page.";
                            var error = new Errors.CustomError("Invalid Query", message, $window.location.href, okActionMessage, true);
                            ErrorService.handleException(error, true);
                        }
                    }
                });
            }
            function formErrorMessage(invalid) {
                var message = "";
                if (invalid.strength.length > 0) {
                    message += errorMessageHelper(invalid.strength, "Strength");
                }
                if (invalid.source.length > 0) {
                    message += errorMessageHelper(invalid.source, "Anatomical Source");
                }
                if (invalid.fromStage.length > 0) {
                    message += errorMessageHelper(invalid.fromStage, "From Stage");
                }
                if (invalid.toStage.length > 0) {
                    message += errorMessageHelper(invalid.toStage, "To Stage");
                }
                if (invalid.pattern.length > 0) {
                    message += errorMessageHelper(invalid.pattern, "Pattern");
                }
                if (invalid.location.length > 0) {
                    message += errorMessageHelper(invalid.location, "Location");
                }
                return message;
            }
            function errorMessageHelper(param, name) {
                var message = "<li>Invalid \"" + name;
                if (param.length > 1) {
                    message += "\" values : ";
                } else {
                    message += "\" value : ";
                }

                message += "<b>";
                message += (param.join(", "));
                message += "</b></li>";
                return message;
            }
            function formQuery() {
                var query = "";
                vm.booleanSearchModel.rows.forEach(function (row, index) {
                    var pattern = row.pattern == "" || row.pattern == null ? "" : "&Pattern=" + row.pattern;
                    var location = row.location == "" || row.location == null ? "" : "&Pattern_Location=" + row.location;
                    query = query + "/(Stage_ID)=(Vocabulary:Developmental_Stage:ID)/Ordinal::geq::" + row.stageFrom.Ordinal + "&Ordinal::leq::" + row.stageTo.Ordinal + "/$M/(RID)=(Specimen_Expression:Specimen)/Strength=" + encodeURIComponent(row.strength) + pattern + location + "/(Region)=(Vocabulary:Anatomy:ID)/Name=" + UriUtils.fixedEncodeURIComponent(row.source.name) + "/$M";
                });
                var customFacet = {
                    "displayname": vm.filters,
                    "ermrest_path": query
                };
                var checkLocation = ERMrest.createLocation(window.origin + "/ermrest", "2", "Gene_Expression", "Specimen", null, customFacet);
                var offset = 1200;
                if (checkLocation.ermrestCompactPath.length + offset > ERMrest.URL_PATH_LENGTH_LIMIT) {
                    var okActionMessage = "Click OK to <b>go back</b> to the page.";
                    var errorMessage = "Filter Query is too long. Reduce the number of filters and try again.";
                    var error = new Errors.CustomError("URL length exceeded", errorMessage, $window.location.href, okActionMessage, true);
                    ErrorService.handleException(error, true);
                } else {
                    var url = window.location.origin + "/chaise/recordset/" + ERMrest.createPath("2", "Gene_Expression", "Specimen", null, customFacet) + "?pcid=" + headerInfo.cid + "&ppid=" + headerInfo.pid;
                    window.open(url, "_blank");
                }
            }

            function parseQueryText(submitQuery) {
                var inputQuery = vm.filters;
                var filters = inputQuery.split("AND");
                vm.booleanSearchModel.rows.length = filters.length;
                filters.forEach(function (filter, index) {
                    filter = filter.trim();
                    var strength;
                    switch (filter.substring(0, filter.indexOf("{"))) {
                        case "p":
                            strength = "present";
                            break;
                        case "u":
                            strength = "uncertain";
                            break;
                        case "nd":
                            strength = "not detected";
                            break;
                        default:
                            strength = filter.substring(0, filter.indexOf("{"));
                    }
                    if (vm.booleanSearchModel.rows[index] == undefined) {
                        var row = new filterModel(defaultOptions);
                        vm.booleanSearchModel.rows[index] = row;
                    }
                    vm.booleanSearchModel.rows[index].strength = strength;

                    if (vm.booleanSearchModel.rows[index].source == null) {
                        vm.booleanSearchModel.rows[index].source = {};
                    }
                    var sourceStart = filter.indexOf("\"");
                    var sourceEnd = filter.lastIndexOf("\"");
                    var sourceName = filter.substring(sourceStart + 1, sourceEnd);
                    if (sourceName.indexOf(":") >= 0) {
                        var idStart = sourceName.lastIndexOf("(");
                        var idEnd = sourceName.lastIndexOf(")");
                        var id = sourceName.substring(idStart + 1, idEnd);
                        sourceName = sourceName.substring(0, idStart - 1);
                        vm.booleanSearchModel.rows[index].source.id = id;
                    }
                    vm.booleanSearchModel.rows[index].source.name = sourceName;
                    var stageCompStart = sourceEnd + 2;
                    var stageCompEnd;
                    if (filter.indexOf("pt=") != -1) {
                        stageCompEnd = filter.indexOf("pt=") - 1;
                    } else if (filter.indexOf("lc=") != -1) {
                        stageCompEnd = filter.indexOf("lc=") - 1;
                    } else {
                        stageCompEnd = filter.indexOf("}");
                    }
                    var stageComp = filter.substring(stageCompStart, stageCompEnd);
                    var stages = stageComp.split("..");                    
                    var stageFromName = stages.length == 2 ? stages[0] : "unknown";
                    var stageFrom;
                    for (var i = 0; i < defaultOptions.fromStageOptions.length; i++) {
                        if (defaultOptions.fromStageOptions[i].Name == stageFromName) {
                            stageFrom = defaultOptions.fromStageOptions[i];
                            break;
                        }
                    }
                    if (stageFrom === undefined) {
                        vm.booleanSearchModel.rows[index].stageFrom = {
                            "Name": stageFromName,
                            "Ordinal": -1
                        };
                    } else {
                        vm.booleanSearchModel.rows[index].stageFrom = stageFrom;
                    }

                    var stageToName = stages.length == 2 ? stages[1].replace("}", "") : "unknown";
                    var stageTo;
                    for (var i = 0; i < defaultOptions.fromStageOptions.length; i++) {
                        if (defaultOptions.fromStageOptions[i].Name == stageToName) {
                            stageTo = defaultOptions.fromStageOptions[i];
                            break;
                        }
                    }
                    if (stageTo === undefined) {
                        vm.booleanSearchModel.rows[index].stageTo = {
                            "Name": stageToName,
                            "Ordinal": -1
                        };
                    } else {
                        vm.booleanSearchModel.rows[index].stageTo = stageTo;
                    }
                    var pattern = "";
                    if (filter.indexOf("pt=") != -1) {
                        var endPt;
                        if (filter.indexOf("lc=") != -1) {
                            endPt = filter.indexOf("lc=") - 1;
                        } else {
                            endPt = filter.indexOf("}");
                        }
                        pattern = filter.substring(filter.indexOf("pt=") + 3, endPt);
                    }
                    vm.booleanSearchModel.rows[index].pattern = pattern;
                    var location = "";
                    if (filter.indexOf("lc=") != -1) {
                        location = filter.substring(filter.indexOf("lc=") + 3, filter.indexOf("}"));
                    }
                    vm.booleanSearchModel.rows[index].location = location;
                    if (index == (filters.length - 1)) {
                        validateSourceParam(submitQuery);
                    }
                });
            }

            function validateQuery() {
                parseQueryText(false);
            }
            function submit() {
                parseQueryText(true);
            }

            function saveFilters() {
                var filterBlob = new Blob([vm.filters], { type: 'text/plain' });
                vm.downloadFilters = $window.URL.createObjectURL(filterBlob);
                var fileName = "booleanQuery.txt";
                if ($window.navigator.msSaveOrOpenBlob) {
                    $window.navigator.msSaveBlob(filterBlob, fileName);
                } else {
                    var element = $window.document.createElement('a');
                    element.href = $window.URL.createObjectURL(filterBlob);
                    element.download = fileName;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
            }

            function showInfo() {
                modalUtils.showModal({
                    templateUrl: "info.modal.html",
                    controller: "InfoModalController",
                    controllerAs: "ctrl",
                    size: "lg"
                }, false, false, false);
            };

            function togglePanel() {
                $scope.treeviewOpen = !$scope.treeviewOpen;
            }

            function setClass() {
                return { 'glyphicon glyphicon-triangle-left': $scope.treeviewOpen, 'glyphicon glyphicon-triangle-right': !$scope.treeviewOpen };
            }

        }])
        .controller('InfoModalController', ['$uibModalInstance', function InfoModalController($uibModalInstance) {
            var vm = this;
            vm.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }])
        .directive('treeView', ['$window', function ($window) {
            return {
                restrict: 'E',
                link: function (scope, element, attrs) {
                    var baseUrl = $window.location.href.substring(0, $window.location.href.indexOf("boolean-search"));
                    var treeviewUrl = baseUrl + "treeview/index.html?Parent_App=booleanSearch";
                    element.replaceWith('<object type="text/html" data="' + treeviewUrl + '" style="height:100%; width:100%"></object>');
                }
            };
        }])
        .run(['ERMrest', 'filterOptions', 'defaultOptions', '$rootScope',
            function runBooleanSearchApp(ERMrest, filterOptions, defaultOptions, $rootScope) {
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
                    defaultOptions.patternOptions.push("");
                    data.forEach(function (el) {
                        if (el.Pattern == null || el.Pattern == "") {
                            return;
                        }
                        defaultOptions.patternOptions.push(el.Pattern);
                    });
                    $rootScope.dataLoaded.count++;
                });
                filterOptions.getLocationOptions().then(function (data) {
                    defaultOptions.locationOptions.push("");
                    data.forEach(function (el) {
                        if (el.Pattern_Location == null || el.Pattern_Location == "") {
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
