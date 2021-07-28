(function () {
    'use strict';

    angular.module('chaise.configure-plotApp', ['chaise.config'])

        .constant('settings', {
            appName: "plotApp",
            appTitle: "Plot",
            overrideHeadTitle: true,
        })

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
            'ngAnimate',
            'duScroll',
            'chaise.alerts',
            'chaise.faceting',
            'chaise.filters',
            'chaise.inputs',
            'chaise.recordcreate',
            'chaise.record.table',
            'chaise.utils',
            'ermrestjs',
            'ui.bootstrap',
            'chaise.errors',
            'chaise.navbar'
          ])

            .config(['$compileProvider', '$cookiesProvider', '$logProvider', '$provide', '$uibTooltipProvider', 'ConfigUtilsProvider', function($compileProvider, $cookiesProvider, $logProvider, $provide, $uibTooltipProvider, ConfigUtilsProvider) {
                ConfigUtilsProvider.$get().configureAngular($compileProvider, $cookiesProvider, $logProvider, $uibTooltipProvider);

                $provide.decorator('$templateRequest', ['ConfigUtils', 'UriUtils', '$delegate', function (ConfigUtils, UriUtils, $delegate) {
                    return ConfigUtils.decorateTemplateRequest($delegate, UriUtils.chaiseDeploymentPath());
                }]);
            }])

            .constant('dataParams', {
                uri: "",
                plot: {},
                id: null
            })
            .factory('PlotUtils', ['AlertsService', 'ConfigUtils', 'dataFormats', 'dataParams', 'Errors', 'ErrorService', 'Session', 'UriUtils', '$q', '$rootScope', '$window', function (AlertsService, ConfigUtils, dataFormats, dataParams, Errors, ErrorService,  Session, UriUtils, $q, $rootScope, $window) {
                var ermrestServiceUrl = ConfigUtils.getConfigJSON().ermrestLocation;
                var server = ERMrest.ermrestFactory.getServer(ermrestServiceUrl, ConfigUtils.getContextHeaderParams());
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
                    case "pie":
                      return "pie";
                    case "histogram":
                      return "histogram";
                    case "violin":
                      return "violin";
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
                    case "pie":
                      return "";
                    case "histogram":
                      return "";
                    case "violin":
                      return "";
                    default:
                      return "line+markers";
                  }
                }

                function getValues(type, legend, orientation) {
                  var values = {};
                  switch (type) {
                    case "pie":
                      values = {
                        type: "pie",
                        labels: [],
                        values: [],
                        legend_clickable_links: [],
                        text:[],
                        hoverinfo: 'text+value+percent',
                        graphic_link_pattern: [],
                      };
                      return values;
                    case "bar":
                      values = {
                          x: [],
                          y: [],
                          text:[],
                          textposition: 'outside',
                          type: getType(type),
                          name: legend,
                          // fill: type == 'area' ? 'tozeroy':'',
                          // mode: getMode(type),
                          orientation: orientation,
                          hoverinfo: 'text',
                          graphic_link_pattern: [],
                      }
                      return values;
                    case "histogram-horizontal":
                      values = {
                          x: [],
                          name: legend || '',
                          type: "histogram",
                          orientation: orientation
                      }
                      return values;
                    case "histogram-vertical":
                        values = {
                            y: [],
                            name: legend || '',
                            type: "histogram",
                            orientation: orientation
                        }
                        return values;
                    case "violin":
                        values = {
                          x: [],
                          y: [],
                          name: legend
                        }
                        return values;
                    default:
                      values = {
                          x: [],
                          y: [],
                          type: getType(type),
                          name: legend,
                          fill: type == 'area' ? 'tozeroy':'',
                          mode: getMode(type)
                      }
                      return values;
                  }
                }

                function getPlotlyConfig(plot) {
                    // use config from plot.plotly.config if exists
                    if (plot.plotly && plot.plotly.config) return plot.plotly.config;

                    return { displaylogo: false, responsive: true }
                }

                /**
                 * Get or set the plotly.layout
                 * NOTE: plot.config holds configurable values to add to layout
                 */
                function getPlotlyLayout(plot) {
                    var configLayout = {},
                        layout = {};

                    // layout object from plot.plotly.layout or plot.config
                    // NOTE: config will be deprecated eventually so prefer plotly.layout
                    if (plot.plotly && plot.plotly.layout) {
                        configLayout = plot.plotly.layout;
                    } else if (plot.config) {
                        configLayout = plot.config;
                    }

                     // NOTE: does not support templating (violin overrides outside of function with templating)
                    layout.title = plot.plot_title;

                    // configuration overrides
                    var tempConfig = plot.config;
                    switch (plot.plot_type) {
                        case "pie":
                            break;
                        case "histogram-horizontal":
                        case "histogram-vertical":
                            layout.bargap = tempConfig.bargap;
                            break;
                        case "violin":
                            layout.xaxis = { automargin: true, title: { standoff: 20 } };
                            layout.yaxis = { zeroline: false };
                            layout.hovermode = "closest";
                            layout.dragmode = "pan";
                            break;
                        default:
                            layout.xaxis = {
                                title: plot.x_axis_label || '',
                                automargin: true,
                                type: tempConfig.x_axis_type || 'auto',
                                tickformat: tempConfig.x_axis_thousands_separator ? ',d' : ''
                            };

                            layout.yaxis = {
                                title: plot.y_axis_label || '',
                                automargin: true,
                                type: tempConfig.y_axis_type || 'auto',
                                tickformat: tempConfig.y_axis_thousands_separator ? ',d' : '',
                            };
                            break;
                    }

                    // apply plotly.layout properties one at a time
                    // NOTE: applies config as well but will be deprecated in future
                    // NOTE: this does not recursively apply object key/value pairs, it will only go one level deep and override
                    Object.keys(configLayout).forEach(function (key) {
                        layout[key] = configLayout[key];
                    });

                    return layout;
                };

                function addComma(data) {
                  // this regex is used to add a thousand separator in the number if possible
                  return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                }

                function checkQCharacter(link){
                    // Check if the link already has a "?" if yes append "&" else append "?" to add the parameters to the link
                    return link.indexOf("?") !== -1 ? "&" : "?"
                }

                function appendContextParameters(link){
                    let contextUrlParams=ConfigUtils.getContextHeaderParams();
                    // Extracts the link and checks if ? is present in the link, if yes it adds "&" else it appends "?"
                    let qCharacter = checkQCharacter(link);
                    //Return pcid and ppid to URL request
                    return qCharacter+"pcid="+contextUrlParams.cid+"&ppid="+contextUrlParams.pid;
                }

                function extractLink(pattern){
                    //Defined regex to extract url from the pattern defined in the configuration file
                    //Example: [{{{ $layout.title }}}](https://dev.isrd.isi.edu/chaise/search){target=_blank}
                    // extractedLink=https://dev.isrd.isi.edu/chaise/search
                    return /\((.*?)\)/ig.exec(pattern)[1]
                }

                function configureTitleDisplayMarkdownPattern(layout,pattern){
                    let link=extractLink(pattern);
                    //Creating layout object in template variable to extract the title property present in layout object
                    //Example: [{{{ $layout.title }}}](https://dev.isrd.isi.edu/chaise/search){target=_blank}
                    $rootScope.templateParams.$layout=layout
                    //Appending pcid and ppid to the URL request
                    let title_display_markdown_pattern=pattern.replace(link,link+appendContextParameters(extractLink(pattern)));
                    let new_title=ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(title_display_markdown_pattern,$rootScope.templateParams),true);
                    delete $rootScope.templateParams.$layout;
                    return new_title;
                }

                function formatData(data, format, type) {
                  if(format) {
                    try {
                      var formated_data = parseInt(data.split(' ')[0], 10);
                      if (isNaN(formated_data)) {
                        return data;
                      }
                      if (type == "pie") {
                        return formated_data.toString();
                      }
                      // this regex is used to add a thousand separator in the number if possible
                      return  addComma(formated_data)
                    } catch (e) {
                      return data;
                    }
                  } else {
                    if (type == "pie") {
                      return data;
                    }
                    return addComma(data)
                  }
                }

                /** NOTE: this is specific to the data used for RBK
                 * 3 cases:
                 *   standalone app
                 *     Nothing in url || both Study and NCBI_GeneID $url_parameter:
                 *       - both controls active
                 *       - Nothing in url:
                 *         - fetch gene selector with no constraints
                 *           - default to first gene in set returned
                 *         - fetch study selector info based on gene
                 *           - All Studies
                 *         - default group to Anatomical Source (plot-config)
                 *       - both Study and NCBI_GeneID $url_parameter:
                 *         - fetch gene selector info based on study
                 *           - modify gene URL to append NCBI_GeneID
                 *           - use gene from url as default
                 *         - fetch study selector info based on gene
                 *           - modify study URL to append RID
                 *           - fetch tuple for study from url for rowname info to display
                 *
                 *   embedded in study page with Study $url_parameter || fullscreen with Study $url_parameter
                 *     - fetch gene selector info based on study
                 *       - default to first gene in set returned
                 *     - remove study selector (don't fetch study set)
                 *       - fetch study info in case it's used in title or other parts of graph
                 *
                 *   embedded in gene page with NCBI_GeneID $url_parameter || fullscreen with NCBI_GeneID $url_parameter
                 *     - disable gene selector (don't fetch gene set)
                 *       - fetch rowname for gene that was selected and display in input
                 *     - fetch study selector info based on gene
                 *       - All Studies
                 *     - default group to Anatomical Source (plot-config)
                 **/
                function setupViolinPlotSelectors(plot) {
                    var defer = $q.defer();

                    // TODO: only fetches one study ID, support multiple
                    var studyId = UriUtils.getQueryParam($window.location.href, "Study");
                    var geneId = UriUtils.getQueryParam($window.location.href, "NCBI_GeneID");

                    $rootScope.hideStudySelector = false;
                    $rootScope.disableGeneSelector = false;
                    $rootScope.templateParams = {
                        $url_parameters: {
                            NCBI_GeneID: geneId || null,
                            Study: []
                        }
                    }

                    // trick to verify if this config app is running inside of an iframe as part of another app
                    var inIframe = $window.self !== $window.parent;

                    // TODO: generalize as part of version 1.3
                    if (studyId) {
                        $rootScope.templateParams.$url_parameters.Study.push({
                            "uniqueId": studyId,
                            "data": {
                                "RID": studyId
                            }
                        });
                    }

                    // in iframe and gene means embedded on gene page, disable gene selector
                    // in iframe and study means embedded on study page, hide study selector
                    // OR if only one of geneId or studyId, assume we fullscreened from iframe
                    // NOTE: this may change in future but is a requirement for now
                    if ( inIframe || ((geneId && !studyId) || (!geneId && studyId)) ) {
                        $rootScope.disableGeneSelector = geneId ? true : false;
                        $rootScope.hideStudySelector = studyId ? true : false;
                    }

                    // both booleans imply we are in an iframe
                    var skipStudy = $rootScope.hideStudySelector;
                    var skipGene = $rootScope.disableGeneSelector;

                    var geneUri = ERMrest.renderHandlebarsTemplate(plot.gene_uri_pattern, $rootScope.templateParams);
                    // relies on geneUri not passed as param
                    function generalOrSpecificGene(reference) {
                        var innerDefer = $q.defer();
                        // if we need a specific gene as default
                        if ($rootScope.templateParams.$url_parameters.NCBI_GeneID) {
                            var specificGeneUri = geneUri + "/NCBI_GeneID=" + $rootScope.templateParams.$url_parameters.NCBI_GeneID;
                            var headers = {};
                            var uriParams=specificGeneUri.split("/")
                            headers[ERMrest.contextHeaderName]=ConfigUtils.getContextHeaderParams();
                            // URI looks like "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)/NCBI_GeneID="
                            headers[ERMrest.contextHeaderName].schema_table=uriParams[uriParams.indexOf("entity")+1];
                            headers[ERMrest.contextHeaderName].catalog=uriParams[uriParams.indexOf("catalog")+1];
                            ERMrest.resolve(specificGeneUri, {headers : headers}).then(function (ref) {
                                return ref.contextualize.compactSelect.read(1);
                            }).then(function (page) {
                                return innerDefer.resolve(page);
                            }).catch(function (err) {
                                console.log(err);
                                innerDefer.reject(err);
                            });
                        } else {
                            // nothing set, read first gene from general reference
                            reference.read(1).then(function (page) {
                                return innerDefer.resolve(page);
                            }).catch(function (err) {
                                console.log(err);
                                innerDefer.reject(err);
                            });
                        }

                        return innerDefer.promise;
                    }

                    var headers = {};
                    var uriParams=geneUri.split("/")
                    headers[ERMrest.contextHeaderName]=ConfigUtils.getContextHeaderParams();
                    // URI looks like "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)"
                    headers[ERMrest.contextHeaderName].schema_table=uriParams[uriParams.indexOf("entity")+1];
                    headers[ERMrest.contextHeaderName].catalog=uriParams[uriParams.indexOf("catalog")+1]
                    // for gene popup
                    ERMrest.resolve(geneUri, {headers : headers}).then(function (ref) {
                        $rootScope.geneReference = ref.contextualize.compactSelect;

                        return generalOrSpecificGene($rootScope.geneReference);
                    }).then(function (page) {
                        $rootScope.gene = page.tuples[0];

                        if (!geneId) {
                            // use first returned from set if no default was defined
                            $rootScope.templateParams.$url_parameters.NCBI_GeneID = $rootScope.gene.data["NCBI_GeneID"];
                        }

                        if (!skipStudy && $rootScope.templateParams.$url_parameters.Study.length > 0) {
                            // get study information for 1 study
                            var singleStudyUri = ERMrest.renderHandlebarsTemplate(plot.study_uri_pattern, $rootScope.templateParams);
                            singleStudyUri += "/RID=" + $rootScope.templateParams.$url_parameters.Study[0].uniqueId;
                            ERMrest.resolve(singleStudyUri, ConfigUtils.getContextHeaderParams()).then(function (singleStudyRef) {

                                return singleStudyRef.read(1);
                            }).then(function (page) {
                                $rootScope.templateParams.$url_parameters.Study = $rootScope.studySet = [page.tuples[0]];
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }

                        return defer.resolve();
                    }).catch(function (err) {
                        console.log(err);
                        defer.reject();
                    });

                    return defer.promise;
                }

                // fetches the violin plot data and sets it up for plotly
                function getViolinData(removeData) {
                    var defer = $q.defer(),
                        uri = ERMrest.renderHandlebarsTemplate(dataParams.trace.queryPattern, $rootScope.templateParams),
                        plot = dataParams.plot,
                        plot_values = dataParams.plot_values,
                        config = plot.config,
                        xGroupKey = $rootScope.groupKey,
                        uriParams=uri.split("/");

                    // don't try to fetch data when no uri is defined or flag is set
                    if (!uri || removeData) {
                        // empty the plot of data but keep the configuration
                        plot_values.data = [];
                        defer.resolve(plot_values);// TODO: figure out how to return an error to catch clause without breaking code
                        return defer.promise;
                    }
                    var headers = {};
                    headers[ERMrest.contextHeaderName]=ConfigUtils.getContextHeaderParams();
                    // URI looks like "/ermrest/catalog/2/attributegroup/M:=RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}({{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}})&{{/if}}NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}/exp:=(Experiment)=(RNASeq:Experiment:RID)/$M/Anatomical_Source,Experiment,Experiment_Internal_ID:=exp:Internal_ID,NCBI_GeneID,Replicate,Sex,Species,Specimen,Specimen_Type,Stage,TPM"
                    var schema_table=uriParams[uriParams.indexOf("attributegroup")+1]
                    if(schema_table.includes(":="))
                        schema_table=schema_table.split(":=")[1]
                    headers[ERMrest.contextHeaderName].schema_table=schema_table;
                    headers[ERMrest.contextHeaderName].catalog=uriParams[uriParams.indexOf("catalog")+1]
                    if(UriUtils.getQueryParams($window.location.href).pcid)
                        headers[ERMrest.contextHeaderName].pcid=UriUtils.getQueryParams($window.location.href).pcid;
                    if(UriUtils.getQueryParams($window.location.href).ppid)
                        headers[ERMrest.contextHeaderName].ppid=UriUtils.getQueryParams($window.location.href).ppid;
                    headers[ERMrest.contextHeaderName]=ERMrest._certifyContextHeader(headers[ERMrest.contextHeaderName]); 
                    server.http.get(uri,{ headers: headers}).then(function(response) {
                        var data = response.data;

                        // transform x data based on groupKey
                        // xData used for graph x data AND xaxis grouping
                        var xData = data.map(function (obj) {
                            var value = obj[xGroupKey.column_name];
                            return (value !== null && value !== undefined) ? value : "N/A"
                        });

                        // transform x data based on groupKey
                        // xDataTicks used for xaxis grouping display values
                        var xDataTicks = data.map(function (obj) {
                            // add row of data to templating environment
                            $rootScope.templateParams.$row = obj;

                            // use template if available/defined, else use value for column
                            var value = xGroupKey.tick_display_pattern ? ERMrest.renderHandlebarsTemplate(xGroupKey.tick_display_pattern, $rootScope.templateParams) : obj[xGroupKey.column_name];

                            // remove row after using it for templating
                            delete $rootScope.templateParams.$row;
                            return (value !== null && value !== undefined) ? value : "N/A"
                        });

                        // transform y data based on configuration option in plot-config
                        var yData = data.map(function (obj) {
                            // add row of data to templating environment
                            $rootScope.templateParams.$row = obj;

                            // use template if available/defined, else use value for column
                            var value = config.yaxis.tick_display_pattern ? ERMrest.renderHandlebarsTemplate(config.yaxis.tick_display_pattern, $rootScope.templateParams) : obj[config.yaxis.group_key];

                            // remove row after using it for templating
                            delete $rootScope.templateParams.$row;
                            return value;
                        });

                        var groupStyles = [];
                        var colors = ["blue", "orange", "green", "red", "yellow"]; // note: samples I tested only had 5 differentiating values
                        // get unique x values and assign colors for each group key (x value)
                        var uniqueX = xData.filter(function (key, index, self) {
                            return self.indexOf(key) === index;
                        });

                        uniqueX.forEach(function (x, index) {
                            groupStyles.push({
                                target: x,
                                value: {line: {color: colors[index%colors.length]}}
                            });
                        });

                        // set base violin plot config
                        // NOTE: getPlotlyConfig and getViolinLayout (TODO: rename to getPlotlyLayout) fetch from plot-config.js plot object or use default
                        var plotlyConfig = {
                            // passed directly to plotly (plotly.config)
                            config: getPlotlyConfig(plot),
                            // passed directly to plotly (plotly.data)
                            data: [{
                                type: 'violin',
                                x: xData,
                                y: yData,
                                points: 'all',
                                showlegend: false,
                                box: {
                                    visible: true
                                },
                                meanline: {
                                    visible: true
                                },
                                transforms: [{
                                    type: 'groupby',
                                    groups: xData,
                                    styles: groupStyles
                                }],
                            }],
                            // passed directly to plotly (plotly.layout)
                            layout: getPlotlyLayout(plot)
                        }

                        // attach configurable plotly values
                        // TODO: Do we set configuration based on whitelist or blacklist?
                        // plotly.data values that probably should NOT be overwritten:
                        //   - [type, x, y, transforms[].groups]

                        // TODO: should plotTitlePattern be required? if no, should "TPM Expression" remain the default
                        plotlyConfig.layout.title = (config.title_display_pattern ? ERMrest.renderHandlebarsTemplate(config.title_display_pattern, $rootScope.templateParams) : "TPM Expression");

                        // xaxis
                        // use title pattern OR column_name if pattern doesn't exist
                        plotlyConfig.layout.xaxis.title.text = (xGroupKey.title_display_pattern ? ERMrest.renderHandlebarsTemplate(xGroupKey.title_display_pattern, $rootScope.templateParams) : xGroupKey.column_name);
                        plotlyConfig.layout.xaxis.tickvals = xData;
                        plotlyConfig.layout.xaxis.ticktext = xDataTicks;

                        // yaxis
                        // use title pattern OR group_key if pattern doesn't exist
                        plotlyConfig.layout.yaxis.title = config.yaxis.title_pattern ? ERMrest.renderHandlebarsTemplate(config.yaxis.title_pattern, $rootScope.templateParams) : config.yaxis.group_key;
                        plotlyConfig.layout.yaxis.type = $rootScope.yAxisScale;

                        // attach configuration and data for plot
                        plot_values.data = plotlyConfig.data;
                        plot_values.layout = plotlyConfig.layout;
                        plot_values.config = plotlyConfig.config;

                        defer.resolve(plot_values);
                    }).catch(function (err) {
                        console.log(err);
                        defer.reject();
                    });

                    return defer.promise;
                }

                return {
                    getData: function (config) {
                        var plots = [];
                        var count = 0;
                        var plotConfig = plotConfigs[config];
                        var message = "";
                        var error;
                        if (typeof plotConfig == "string") {
                            plotConfig = plotConfigs[plotConfig];
                        }
                        if (plotConfig == undefined) {
                            if (config) {
                                message = "Invalid config parameter in the url";
                                error = new Errors.CustomError("Invalid config", message);
                            } else {
                                plotConfig = plotConfigs["*"];
                            }
                        }

                        try {

                            plotConfig.plots.forEach(function () {
                                plots.push({id: count, loaded: false});
                                count+=1
                            });
                        } catch (err) {
                            var message = message || "Invalid config parameter in the url";
                            var error = error || new Errors.CustomError("Invalid config", message);
                            ErrorService.handleException(error);
                        }

                        var tracesComplete = 0;
                        var plotComplete = 0;
                        // checks if all plots have had .loaded set to true
                        function checkPlotsLoaded(plotValues, plot) {
                            tracesComplete++;
                            plots[plotValues.id].plot_values = plotValues;
                            plots[plotValues.id].loaded = true;
                            plots[plotValues.id].plot_type = plot.plot_type;
                            var allLoaded = true;
                            for (var j=0; j<plots.length; j++) {
                                if (plots[j].loaded == false) {
                                    allLoaded = false;
                                    break;
                                }
                            }
                            if (allLoaded) {
                                $rootScope.plots = plots;
                            }
                        }

                        var i = 0
                        plotConfig.plots.forEach(function(plot, index) {
                            var plot_values = {
                                id: index,
                                data: [],
                            };
                            var config = {
                                displaylogo: false,
                                modeBarButtonsToRemove: plot.plotlyDefaultButtonsToRemove,
                                responsive: true
                            };
                            var tracesComplete = 0;

                            // violin plot has it's own case outside of the switch condition below since it relies on reference api for the gene selector
                            if (plot.plot_type == "violin") {
                                // TODO: assumes only 1 plot
                                $rootScope.plot = plot;
                                plot.traces.forEach(function (trace) {
                                    setupViolinPlotSelectors(plot).then(function () {
                                        $rootScope.groups = plot.config.xaxis.group_keys;
                                        // set default groupKey
                                        // NOTE: should only ever be one. If multiple defaults are set, first one is used
                                        $rootScope.groupKey = $rootScope.groups.filter(function (obj) {
                                            return obj.default == true
                                        })[0];

                                        // no default was set, use first group
                                        if (!$rootScope.groupKey) $rootScope.groupKey = $rootScope.groups[0];

                                        // we have no study info at the start, default to group set for "all studies"
                                        if ($rootScope.templateParams.$url_parameters.Study.length == 0) {
                                            $rootScope.groupKey = $rootScope.groups.filter(function (obj) {
                                                return obj.column_name == plot.config.xaxis.default_all_studies_group;
                                            })[0];
                                        }

                                        // set dataParams to be used later for refetching violin data
                                        dataParams.trace = trace;
                                        dataParams.plot = plot;
                                        dataParams.id = plot_values.id;
                                        dataParams.plot_values = plot_values;

                                        return getViolinData();
                                    }).then(function (values) {
                                        checkPlotsLoaded(values, plot);
                                    }).catch(function (err) {
                                        console.log(err);
                                    });
                                });
                            } else {
                                plot.traces.forEach(function (trace) {
                                    var uri = trace.uri;
                                    var headers = {};
                                    var uriParams=uri.split("/");
                                    headers[ERMrest.contextHeaderName]=ConfigUtils.getContextHeaderParams();
                                    //URI looks like "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26"
                                    var schema_table=uriParams[uriParams.indexOf("entity")+1]
                                    if(schema_table.includes(":="))
                                        schema_table=schema_table.split(":=")[1]
                                    headers[ERMrest.contextHeaderName].schema_table=schema_table;
                                    headers[ERMrest.contextHeaderName].catalog=uriParams[uriParams.indexOf("catalog")+1]
                                    if(UriUtils.getQueryParams($window.location.href).pcid)
                                        headers[ERMrest.contextHeaderName].pcid=UriUtils.getQueryParams($window.location.href).pcid;
                                    if(UriUtils.getQueryParams($window.location.href).ppid)
                                        headers[ERMrest.contextHeaderName].ppid=UriUtils.getQueryParams($window.location.href).ppid;
                                    headers[ERMrest.contextHeaderName]=ERMrest._certifyContextHeader(headers[ERMrest.contextHeaderName]); 
                                    server.http.get(uri,{ headers: headers }).then(function(response) {
                                        try {
                                            var layout = getPlotlyLayout(plot);
                                            var data = response.data;
                                            $rootScope.templateParams = {
                                                $traces: {
                                                    data: data,
                                                },
                                            }
                                            switch (plot.plot_type) {
                                                case "pie":
                                                    var values = getValues(plot.plot_type, '',  '');
                                                    if (plot.config) {
                                                        values.textinfo = plot.config.slice_label ? plot.config.slice_label : "none";
                                                    } else {
                                                        values.textinfo = "none";
                                                    }

                                                    var label = true;
                                                    if(trace.legend != undefined) {
                                                        values.labels = trace.legend;
                                                        label = false;
                                                    }

                                                    data.forEach(function (row) {
                                                        // $self object will point to the the current row from the data that is fetched from URI
                                                        $rootScope.templateParams.$self = {
                                                            data: row
                                                        }
                                                        //Check if the legends are defined in the configuration file
                                                        if(label) {
                                                            var traceLabel=row[trace.legend_col];
                                                            //Changes related to adding markdown templating pattern to legends in pie
                                                            if(trace.hasOwnProperty("legend_markdown_pattern") && trace.legend_markdown_pattern){
                                                                try{
                                                                    var pattern=ERMrest.renderHandlebarsTemplate(trace.legend_markdown_pattern,$rootScope.templateParams);
                                                                    traceLabel=ERMrest.renderMarkdown(pattern,true);
                                                                    var extractedLink=extractLink(pattern);
                                                                    var linkWithContextParams =extractedLink+appendContextParameters(extractLink(trace.legend_markdown_pattern));
                                                                    values.legend_clickable_links.push(linkWithContextParams);
                                                                    // Add Context Parameters to link
                                                                    traceLabel=traceLabel.replace(extractedLink,linkWithContextParams)
                                                                }catch(error){
                                                                    traceLabel=row[trace.legend_col];
                                                                }
                                                            }
                                                            values.labels.push(traceLabel);
                                                            // // Override the legend name displayed in the tooltip on traces by hovertemplate_display_pattern defined in configuration file
                                                            // var tooltip=trace.hovertemplate_display_pattern ? ERMrest.renderHandlebarsTemplate(trace.hovertemplate_display_pattern, $rootScope.templateParams) : row[trace.legend_col];
                                                            //  //Added the legend column names to text variable so that the tooltip name does not contain a link if the legends contains a link
                                                            values.text.push(row[trace.legend_col]);
                                                        }
                                                        values.values.push(formatData(row[trace.data_col], plot.config ? plot.config.format_data : false, "pie"));
                                                        // Configure links for individual traces 
                                                        if(trace.hasOwnProperty("graphic_link_pattern")){
                                                            let graphic_link=trace.graphic_link_pattern+appendContextParameters(trace.graphic_link_pattern);
                                                            values.graphic_link_pattern.push(ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(graphic_link,$rootScope.templateParams),true));
                                                        }
                                                        delete $rootScope.templateParams.$self;
                                                    });
                                                    plot_values.data.push(values);
                                                    if(plot.config.hasOwnProperty("title_display_markdown_pattern")){
                                                        layout.title=configureTitleDisplayMarkdownPattern(layout,plot.config.title_display_markdown_pattern);
                                                    }
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    plot_values.layout.disable_default_legend_click=plot.config.disable_default_legend_click;
                                                    delete $rootScope.templateParams;
                                                    break;
                                                case "histogram-horizontal":
                                                    var values = getValues(plot.plot_type, trace.legend);
                                                    data.forEach(function (row) {
                                                        values.x.push(formatData(row[trace.data_col], plot.config ? plot.config.format_data : false));
                                                    });
                                                    plot_values.data.push(values);
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;
                                                case "histogram-vertical":
                                                    var values = getValues(plot.plot_type, trace.legend);
                                                    data.forEach(function (row) {
                                                        values.y.push(formatData(row[trace.data_col], plot.plotly.config ? plot.plotly.config.format_data : false));
                                                    });
                                                    plot_values.data.push(values);
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;

                                                case "bar":
                                                    if(trace.orientation == "h") {
                                                        var suffix = "  ";
                                                        if (!layout.yaxis) {
                                                            layout.yaxis = {
                                                                ticksuffix: suffix
                                                            };
                                                        } else if (!layout.yaxis.ticksuffix) {
                                                            layout.yaxis.ticksuffix = suffix;
                                                        }
                                                        for(var i = 0; i < trace.x_col.length;i++) {
                                                            // $self object will point to the the current row from the data that is fetched from URI
                                                            var trace_legend=trace.legend ? trace.legend[i]: '';
                                                            var values = getValues(plot.plot_type, trace_legend,  trace.orientation);

                                                            if (trace.textangle) {
                                                                values.textangle = trace.textangle;
                                                            }
                                                            if (trace.textfont) {
                                                                values.textfont = trace.textfont;
                                                            }
                                                            data.forEach(function (row) {
                                                                $rootScope.templateParams.$self = {
                                                                    data: row
                                                                }
                                                                var y_col=row[trace.y_col];
                                                                //Checking if tick_display_markdown_pattern is available in yaxis if yes, then make the y axis labels as hyperlinks.
                                                                if(plot.config.hasOwnProperty("yaxis") && plot.config.yaxis.hasOwnProperty("tick_display_markdown_pattern")){
                                                                    var patternLink=ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(plot.config.yaxis.tick_display_markdown_pattern,$rootScope.templateParams),true);
                                                                    var extractedLink=extractLink(plot.config.yaxis.tick_display_markdown_pattern);
                                                                    var linkWithContextParams =extractedLink+appendContextParameters(extractLink(plot.config.yaxis.tick_display_markdown_pattern));
                                                                    y_col=patternLink.replace(extractedLink,linkWithContextParams);
                                                                }
                                                                values.x.push(formatData(row[trace.x_col[i]], plot.config ? plot.config.format_data_x : false));
                                                                values.y.push(formatData(y_col, plot.config ? plot.config.format_data_y : false));
                                                                values.text.push(formatData(row[trace.x_col[i]], plot.config ? plot.config.format_data_x : false))
                                                                                                                                // Configure links for individual traces 
                                                                if(trace.hasOwnProperty("graphic_link_pattern")){
                                                                    let graphic_link=trace.graphic_link_pattern+appendContextParameters(trace.graphic_link_pattern);
                                                                    values.graphic_link_pattern.push(ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(graphic_link,$rootScope.templateParams),true));
                                                                }
                                                                delete $rootScope.templateParams.$self;
                                                            });
                                                            values.hoverinfo = 'text'
                                                            plot_values.data.push(values);
                                                        }
                                                    } else {
                                                        for(var i = 0; i < trace.y_col.length;i++) {
                                                            var values = getValues(plot.plot_type, trace.legend ? trace.legend[i]: '',  trace.orientation);
                                                            data.forEach(function (row) {
                                                                $rootScope.templateParams.$self = {
                                                                    data: row
                                                                }
                                                                var x_col=row[trace.x_col];
                                                                //Checking if tick_display_markdown_pattern is available in xaxis if yes, then make the y axis labels as hyperlinks.
                                                                if(plot.config.hasOwnProperty("xaxis") && plot.config.xaxis.hasOwnProperty("tick_display_markdown_pattern")){
                                                                    var patternLink=ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(plot.config.xaxis.tick_display_markdown_pattern,$rootScope.templateParams),true);
                                                                    var extractedLink=extractLink(plot.config.xaxis.tick_display_markdown_pattern);
                                                                    var linkWithContextParams =extractedLink+appendContextParameters(extractLink(plot.config.xaxis.tick_display_markdown_pattern));
                                                                    x_col=patternLink.replace(extractedLink,linkWithContextParams);
                                                                }
                                                                values.x.push(formatData(x_col, plot.config ? plot.config.format_data_x : false));
                                                                values.y.push(formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false));
                                                                var tooltip=trace.hovertemplate_display_pattern ? ERMrest.renderHandlebarsTemplate(trace.hovertemplate_display_pattern, $rootScope.templateParams) : formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false);
                                                                //Added the legend column names to text variable so that the tooltip name does not contain a link if the legends contains a link
                                                                values.text.push(tooltip)

                                                                // Configure links for individual traces 
                                                                if(trace.hasOwnProperty("graphic_link_pattern")){
                                                                    let graphic_link=trace.graphic_link_pattern+appendContextParameters(trace.graphic_link_pattern);
                                                                    values.graphic_link_pattern.push(ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(graphic_link,$rootScope.templateParams),true));
                                                                }
                                                            });
                                                            values.hoverinfo = 'text'
                                                            plot_values.data.push(values);
                                                        }
                                                    }
                                                    //If title_display_markdown_pattern is present in the config file in title or xaxis title, make them as hyperlinks as well
                                                    if(plot.config.hasOwnProperty("title_display_markdown_pattern")){
                                                        layout.title=configureTitleDisplayMarkdownPattern(layout,plot.config.title_display_markdown_pattern);
                                                    }
                                                    if(plot.config.hasOwnProperty("xaxis") &&  plot.config.xaxis.hasOwnProperty("title_display_markdown_pattern")){
                                                        layout.xaxis.title=configureTitleDisplayMarkdownPattern(layout,plot.config.xaxis.title_display_markdown_pattern);
                                                    }
                                                    if(plot.config.hasOwnProperty("yaxis") && plot.config.yaxis.hasOwnProperty("title_display_markdown_pattern")){
                                                        layout.yaxis.title=configureTitleDisplayMarkdownPattern(layout,plot.config.yaxis.title_display_markdown_pattern);
                                                    } 
                                                    // if(plot.config.hasOwnProperty("xaxis") &&  plot.config.xaxis.hasOwnProperty("tick_display_markdown_pattern")){                                                                // use template if available/defined, else use value for column
                                                    //     var value = xGroupKey.tick_display_pattern ? ERMrest.renderHandlebarsTemplate(xGroupKey.tick_display_pattern, $rootScope.templateParams) : obj[xGroupKey.column_name];
                                                    // }
                                                    // if(plot.config.hasOwnProperty("xaxis") &&  plot.config.xaxis.hasOwnProperty("tick_display_markdown_pattern")){                                                                // use template if available/defined, else use value for column
                                                    //     var value = xGroupKey.tick_display_pattern ? ERMrest.renderHandlebarsTemplate(xGroupKey.tick_display_pattern, $rootScope.templateParams) : obj[xGroupKey.column_name];
                                                    // }
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;  
                                                    plot_values.layout.disable_default_legend_click=plot.config.disable_default_legend_click;                                                 
                                                    delete $rootScope.templateParams;
                                                    break;
                                                default:
                                                    for(var i = 0; i < trace.y_col.length;i++) {
                                                        var values = getValues(plot.plot_type, trace.legend ? trace.legend[i]: '',  trace.orientation);

                                                        data.forEach(function (row) {
                                                            values.x.push(formatData(row[trace.x_col], plot.config ? plot.config.format_data_x : false));
                                                            values.y.push(formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false));
                                                        });
                                                        plot_values.data.push(values);
                                                        plot_values.layout = layout;
                                                        plot_values.config = config;
                                                    }
                                                    delete $rootScope.templateParams;
                                                    break;
                                            }

                                            tracesComplete++;
                                            plots[plot_values.id].plot_values = plot_values;
                                            plots[plot_values.id].loaded = true;
                                            plots[plot_values.id].plot_type = plot.plot_type;
                                            var allLoaded = true;
                                            for (var j=0; j<plots.length; j++) {
                                                if (plots[j].loaded == false) {
                                                    allLoaded = false;
                                                    break;
                                                }
                                            }
                                            if (allLoaded) {
                                                $rootScope.plots = plots;
                                            }

                                        } catch (error) {
                                            console.log(error);
                                        }

                                    }).catch(function (err) {
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
                                    });
                                });
                            }
                        });
                    },
                    getViolinData: getViolinData
                }
            }])
            .controller('plotController', ['AlertsService', 'ConfigUtils', 'dataFormats', 'dataParams', 'modalUtils', 'PlotUtils', 'UriUtils', '$rootScope', '$scope', '$timeout', '$window', function plotController(AlertsService, ConfigUtils, dataFormats, dataParams, modalUtils, PlotUtils, UriUtils, $rootScope, $scope, $timeout, $window) {
                var vm = this;
                vm.alerts = AlertsService.alerts;
                vm.dataFormats = dataFormats;
                // vm.x_label = plotConfig.x_axis_label;
                vm.types = ["line", "bar", "dot", "area"];
                vm.model = {};
                vm.scales = ["linear", "log"];
                vm.showMore = true;
                vm.selectAll = $rootScope.selectAll = false;
                $rootScope.yAxisScale = "linear";
                vm.changeSelection = function(value) { // Not yet used for the selection of plot type
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

                // conditional to show violin plot controls (gene selector, group selector, scale selector)
                vm.showViolinControls = function (plot_type) {
                    return $rootScope.geneReference && plot_type == "violin";
                }

                // opens search popup for gene table based on current study.
                // Callback for selected gene defined as the modal close callback
                vm.openGeneSelector = function () {
                    var params = {};

                    params.logStack = [{type: "set", s_t: "Common:Gene"}]
                    params.logStackPath = "set/gene-selector"

                    // TODO: configure title

                    var geneUri = ERMrest.renderHandlebarsTemplate($rootScope.plot.gene_uri_pattern, $rootScope.templateParams);
                    var uriParams=geneUri.split("/")
                    var headers={}

                    headers[ERMrest.contextHeaderName]=ConfigUtils.getContextHeaderParams();
                    //URI looks like "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}{{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}}/{{/if}}(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)"
                    var schema_table=uriParams[uriParams.indexOf("entity")+1]
                    if(schema_table.includes(":="))
                        schema_table=schema_table.split(":=")[1]
                    headers[ERMrest.contextHeaderName].schema_table=schema_table;
                    headers[ERMrest.contextHeaderName].catalog=uriParams[uriParams.indexOf("catalog")+1]
                    ERMrest.resolve(geneUri,{headers : headers}).then(function (ref) {
                        params.reference = ref.contextualize.compactSelect;
                        params.reference.session = $rootScope.session;
                        params.selectMode = "single-select";
                        params.faceting = true;
                        params.facetPanelOpen = false;

                        // to choose the correct directive
                        params.mode = "default";
                        params.showFaceting = true;

                        params.displayMode = "popup";
                        params.editable = false;

                        params.selectedRows = [];

                        // modal properties
                        var windowClass = "search-popup gene-selector-popup";

                        modalUtils.showModal({
                            animation: false,
                            controller: "SearchPopupController",
                            windowClass: windowClass,
                            controllerAs: "ctrl",
                            resolve: {
                                params: params
                            },
                            size: modalUtils.getSearchPopupSize(params),
                            templateUrl:  UriUtils.chaiseDeploymentPath() + "common/templates/searchPopup.modal.html"
                        }, function (res) {
                            $rootScope.gene = res;
                            $rootScope.geneId = $rootScope.templateParams.$url_parameters.NCBI_GeneID = $rootScope.gene.data["NCBI_GeneID"];

                            // the gene has changed, fetch new plot data for new gene
                            PlotUtils.getViolinData(vm.studySet.length == 0 && !vm.selectAll).then(function (values) {
                                // TODO: checkPlotsLoaded()
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }, null, false);
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                // opens search popup for study table based on current gene.
                // Callback for selected study defined as the modal close callback
                vm.openStudySelector = function () {
                    var params = {};

                    params.logStack = [{type: "set", s_t: "RNASeq:Study"}]
                    params.logStackPath = "set/study-selector"

                    // TODO: configure title?

                    var studyUri = ERMrest.renderHandlebarsTemplate($rootScope.plot.study_uri_pattern, $rootScope.templateParams);
                    var headers={}
                    headers[ERMrest.contextHeaderName]=ConfigUtils.getContextHeaderParams();
                    var uriParams=studyUri.split("/")
                    //URI looks like "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}/(Study)=(RNASeq:Study:RID)"
                    var schema_table=uriParams[uriParams.indexOf("entity")+1]
                    if(schema_table.includes(":="))
                        schema_table=schema_table.split(":=")[1]
                    headers[ERMrest.contextHeaderName].schema_table=schema_table;
                    headers[ERMrest.contextHeaderName].catalog=uriParams[uriParams.indexOf("catalog")+1]

                    ERMrest.resolve(studyUri, { headers : headers}).then(function (ref) {
                        params.reference = ref.contextualize.compactSelect;
                        params.reference.session = $rootScope.session;
                        params.selectMode = "multi-select";
                        params.showFaceting = true;
                        params.faceting = true;
                        params.facetPanelOpen = false;

                        // to choose the correct directive
                        params.mode = "default";
                        params.displayMode = "popup";
                        params.editable = false;

                        // should be triggered once to remove fake tuple objects from array used for default display
                        if (vm.studySelectorOpened == false) {
                            params.selectedRows = [];
                            vm.studySelectorOpened == true;
                        } else {
                            params.selectedRows = $rootScope.studySet ? $rootScope.studySet : [];
                        };

                        // TODO: preselect rows that are already selected

                        // modal properties
                        var windowClass = "search-popup study-selector-popup";

                        modalUtils.showModal({
                            animation: false,
                            controller: "SearchPopupController",
                            windowClass: windowClass,
                            controllerAs: "ctrl",
                            resolve: {
                                params: params
                            },
                            size: modalUtils.getSearchPopupSize(params),
                            templateUrl:  UriUtils.chaiseDeploymentPath() + "common/templates/searchPopup.modal.html"
                        }, function (res) {
                            vm.selectAll = $rootScope.selectAll = false;
                            $rootScope.studySet = $rootScope.templateParams.$url_parameters.Study = vm.studySet = res.rows;

                            // the study has changed, fetch new plot data for new study info
                            // Can't close popup without returning study info
                            PlotUtils.getViolinData().then(function (values) {
                                // TODO: checkPlotsLoaded()
                            }).catch(function (err) {
                                console.log(err);
                            });
                        }, null, false);
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                vm.studySetIsArray = function () {
                    return Array.isArray(vm.studySet);
                }

                vm.selectAllStudy = function () {
                    // empty the studySet
                    $rootScope.studySet = $rootScope.templateParams.$url_parameters.Study = vm.studySet = [];
                    PlotUtils.getViolinData().then(function (values) {
                        vm.selectAll = $rootScope.selectAll = true;
                        // TODO: checkPlotsLoaded()
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                vm.showMoreLessBtn = function (bool) {
                    // get height of chiclets
                    var ele = angular.element(document.getElementById('study-selections'));
                    return bool && ele[0].offsetHeight > 100;
                }

                vm.removeStudyPill = function (studyId, $event) {
                    vm.selectAll = $rootScope.selectAll = false;
                    var index = vm.studySet.findIndex(function (obj) {
                        return obj.uniqueId == studyId;
                    });

                    // this sanity check is not necessary since we're always calling
                    // this function with a valid key. but it doesn't harm to check
                    if (index === -1) {
                        $event.preventDefault();
                        return;
                    }

                    vm.studySet.splice(index, 1)[0];
                    $rootScope.studySet = vm.studySet;

                    // the study has changed, fetch new plot data for new study info
                    PlotUtils.getViolinData(vm.studySet.length == 0).then(function (values) {
                        // TODO: checkPlotsLoaded()
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                vm.removeAllStudy = function () {
                    vm.selectAll = $rootScope.selectAll = false;
                    $rootScope.studySet = vm.studySet = [];

                    // all studies removed, call getViolinData with true to call case when we want to remove data from plot
                    PlotUtils.getViolinData(true).then(function (values) {
                        // TODO: checkPlotsLoaded()
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                // callback for group by selector
                vm.setGroup = function (group) {
                    $rootScope.groupKey = group;

                    // Request to fetch data doesn't need to be made, currently should return 304 not modified and make very little difference
                    // TODO: change settings for plotly and reapply to plot instead of trying to fetch data first
                    PlotUtils.getViolinData(vm.studySet.length == 0 && !vm.selectAll).then(function (values) {
                        // TODO: checkPlotsLoaded()
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                // callback for scale selector
                vm.toggleScale = function (scale) {
                    $rootScope.yAxisScale = scale;

                    // Request to fetch data doesn't need to be made, currently should return 304 not modified and make very little difference
                    // TODO: change settings for plotly and reapply to plot instead of trying to fetch data first
                    PlotUtils.getViolinData(vm.studySet.length == 0 && !vm.selectAll).then(function (values) {
                        // TODO: checkPlotsLoaded()
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                $scope.plotsLoaded = false;
                $scope.showPlot = function () {
                    if (vm.model.user == null) {
                        vm.model.user = $rootScope.user;
                    }
                    try {
                        $scope.$apply(function () {
                            $scope.plotsLoaded = true;
                        });
                    } catch (e) {
                        throw e;
                    }

                }

                $scope.$watch(function () {
                    return ($rootScope.templateParams ? $rootScope.templateParams.$url_parameters.Study : null)
                }, function (newValue, oldValue) {
                    // execute once study parameter is digested (or setup from reference default when embedded on gene page.. in future)
                    if (newValue) {
                        // if no study set, select "All Studies" so we have graph data to show
                        vm.selectAll = $rootScope.selectAll = $rootScope.templateParams.$url_parameters.Study.length == 0
                        vm.studySelectorOpened = false;
                        $rootScope.studySet = vm.studySet = newValue;
                    }
                });

                $scope.$watch('groups', function (newValue, oldValue) {
                    if (newValue) vm.groups = newValue;
                });
            }])
            .directive('plot', ['$rootScope', '$timeout','ConfigUtils', function ($rootScope, $timeout,ConfigUtils) {
                
                return {
                    link: function (scope, element) {
                        scope.$watch('plots', function (plots) {
                            if (plots) {
                                $timeout(function() {

                                    for (var i = 0; i < plots.length; i++) {
                                        if (plots[i].id == element[0].attributes['plot-id'].nodeValue) {
                                            Plotly.newPlot(element[0], plots[i].plot_values.data, plots[i].plot_values.layout, plots[i].plot_values.config)
                                            .then(                                          
                                                element[0].on('plotly_hover', function(data){
                                                    //On hover of the individual traces(Slices) of the pie change the cursor to pointer
                                                    var dragLayer = document.getElementsByClassName('pielayer')[0];
                                                    dragLayer.style.cursor = 'pointer';
                                                }),

                                                element[0].on('plotly_unhover', function(data){
                                                    //on unhover change the cursor to default icon
                                                    var dragLayer = document.getElementsByClassName('pielayer')[0];
                                                    dragLayer.style.cursor = '';
                                                }),

                                                element[0].on('plotly_click',function(data){
                                                    //here data is the event object that is recieved on click of the plot
                                                    /*Data Recieved:
                                                    // For Pie
                                                    data:{
                                                        event:{..}
                                                        points:{
                                                            0:{
                                                                data:{
                                                                    labels:[ //array of labels in pie chart],
                                                                    graphic_link_pattern: // array of links which are used to make chart clickable
                                                                },
                                                                fullData:{
                                                                    // Data with default parameters used by plotly
                                                                    automargin:false,
                                                                    direction:"counterClockwise",
                                                                    labels:[]
                                                                }
                                                                label: //label on which click event took place
                                                                text:""
                                                            }
                                                        }
                                                    }
                                                    // For bar chart
                                                
                                                    data:{
                                                        event:{..}
                                                        points:{
                                                            0:{
                                                                data:{
                                                                    x:[ //array of labels in bar chart xaxis],
                                                                    y: [ //array of labels in bar chart yaxis ]
                                                                    graphic_link_pattern: // array of links which are used to make chart clickable
                                                                },
                                                                fullData:{
                                                                    // Data with default parameters used by plotly
                                                                    alignmentgroup:"",
                                                                    cliponxaxis: true,
                                                                    x:[],
                                                                    y:[]
                                                                }
                                                                label: //label on which click event took place
                                                                text:""
                                                            }
                                                        }
                                                    }
                                                    
                                                    
                                                    */

                                                    if(data.hasOwnProperty("points") && data.points[0].data.hasOwnProperty("graphic_link_pattern")){
                                                        var idx="";
                                                        switch(data.points[0].data.type){
                                                            case "pie":
                                                                idx=data.points[0].data.labels.indexOf(data.points[0].label.toString());
                                                                break;
                                                            case "bar":
                                                                if(data.points[0].data.orientation=="h")
                                                                    idx=data.points[0].data.y.indexOf(data.points[0].y.toString());
                                                                else
                                                                    idx=data.points[0].data.x.indexOf(data.points[0].x.toString());
                                                                break;
                                                        }
                                                        if( data.points[0].data.graphic_link_pattern[idx]!=false && data.points[0].data.graphic_link_pattern[idx]!=undefined){
                                                            var url=data.points[0].data.graphic_link_pattern[idx];
                                                            window.open(url,'_blank');
                                                        }
                                                    }
                                                }),
                                                element[0].on('plotly_legendclick', function(data){
                                                    //This event occurs on click of legend
                                                    if(data.hasOwnProperty("data")){
                                                            if(data.data[0].hasOwnProperty("legend_clickable_links") ){
                                                                var idx=data.data[0].labels.indexOf(data.label.toString());
                                                                if(data.data[0].legend_clickable_links[idx]!=false && data.data[0].legend_clickable_links[idx]!=undefined){
                                                                    window.open(data.data[0].legend_clickable_links[0],'_blank');
                                                                    return false;
                                                                }
                                                            }

                                                            // if(data.data[0].hasOwnProperty("data_legend_pattern")){

                                                            //     if(data.data[0].data_legend_pattern[0]!=false && data.data[0].data_legend_pattern[0]!=undefined){
                                                            //         //var qCharacter = data.data[0].legend_markdown_pattern[idx].indexOf("?") !== -1 ? "&" : "?";
                                                            //         var url=data.data[0].legend_markdown_pattern[idx];//+qCharacter+"pcid="+contextUrlParams.cid+"&ppid="+contextUrlParams.pid;
                                                            //         window.open(url,'_blank');
                                                            //         return false;
                                                            //     }
                                                            // }
                                                        if(data.layout.hasOwnProperty("disable_default_legend_click") && data.layout.disable_default_legend_click==true)
                                                            return false;

                                                    }
                
                                                  }
                                                )
                                            )
                                            .then(function () {
                                                scope.showPlot();
                                            }.bind(plots.length));
                                        }
                                    }
                                }, 0, false);
                            }
                        }, true);
                    }
                };
            }])
            .run(['ERMrest', 'FunctionUtils', 'PlotUtils', 'messageMap', 'Session', 'UriUtils', '$rootScope', '$window','headInjector',
            function runApp(ERMrest, FunctionUtils, PlotUtils, messageMap, Session, UriUtils, $rootScope, $window, headInjector) {
                try {
                    $rootScope.loginShown = false;
                    $rootScope.config = UriUtils.getQueryParam($window.location.href, "config");
                    $rootScope.headTitle=$window.plotConfigs[$rootScope.config].headTitle;
                    FunctionUtils.registerErmrestCallbacks();
                    var subId = Session.subscribeOnChange(function () {
                        Session.unsubscribeOnChange(subId);
                        var session = Session.getSessionValue();
                        if ($rootScope.headTitle)
                            headInjector.updateHeadTitle($rootScope.headTitle);
                        // if (!session) {
                        //     var notAuthorizedError = new ERMrest.UnauthorizedError(messageMap.unauthorizedErrorCode, (messageMap.unauthorizedMessage + messageMap.reportErrorToAdmin));
                        //     throw notAuthorizedError;
                        // }
                        PlotUtils.getData($rootScope.config);
                    });
                } catch (exception) {
                    throw exception;
                }
            }
        ]);
})();

// TODO: reenable dynamic loading of dependencies
// var chaisePath = "/chaise/";
// if (typeof chaiseConfig != 'undefined' && typeof chaiseConfig === "object" && chaiseConfig['chaiseBasePath'] !== undefined) {
//     chaisePath = chaiseConfig['chaiseBasePath'];
// }

// const JS_DEPS = [
//     'chaise-config.js',
//     'scripts/vendor/angular.js',
//     'scripts/vendor/jquery-1.11.1.min.js',
//     'scripts/vendor/bootstrap-3.3.7.min.js',
//     'scripts/vendor/plotly-latest.min.js',
//     'common/vendor/angular-cookies.min.js',
//     'scripts/vendor/angular-sanitize.js',
//     'scripts/vendor/ui-bootstrap-tpls-2.5.0.min.js',
//     '../ermrestjs/ermrest.js',
//     'common/alerts.js',
//     'common/authen.js',
//     'common/config.js',
//     'common/errors.js',
//     'common/filters.js',
//     'common/inputs.js',
//     'common/login.js',
//     'common/modal.js',
//     'common/navbar.js',
//     'common/recordCreate.js',
//     'common/storage.js',
//     'common/table.js',
//     'common/utils.js',
//     'common/validators.js'
// ];

// const JS_DEPS = [
//     'scripts/vendor/angular.js',
//     'chaise-config.js',
//     'scripts/vendor/jquery-3.4.1.min.js',
//     'scripts/vendor/plotly-latest.min.js',
//     'dist/chaise.vendor.min.js',
//     'dist/chaise.min.js',
//     '../ermrestjs/ermrest.min.js'
// ];
//
// const CSS_DEPS = [
//     'styles/vendor/bootstrap.min.css',
//     'common/styles/app.css',
//     'common/styles/appheader.css'
// ];
//
// var head = document.getElementsByTagName('head')[0];
// function loadStylesheets(url) {
//     var link = document.createElement('link');
//     link.rel = 'stylesheet';
//     link.type = 'text/css';
//     link.href = chaisePath + url;
//     head.appendChild(link);
// }
// function loadJSDeps(url, callback) {
//     var script = document.createElement('script');
//     script.type = 'text/javascript';
//     // if (url == 'scripts/vendor/plotly-latest.min.js') {
//     //     script.src = "../../" + chaisePath + url;
//     // } else {
//         script.src = "../.." + chaisePath + url;
//     // }
//     script.onload = callback;
//     head.appendChild(script);
// }
// var jsIndex = 0;
//
// function fileLoaded() {
//     jsIndex = jsIndex + 1;
//     if (jsIndex == JS_DEPS.length) {
//         loadModule();
//     } else {
//         loadJSDeps(JS_DEPS[jsIndex], fileLoaded);
//     }
// }
// CSS_DEPS.forEach(function (url) {
//     loadStylesheets(url);
// });
// loadJSDeps(JS_DEPS[0], fileLoaded);
// loadModule();