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
                    case "scatter":
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
                        // An array which will hold all the links required for legends
                        legend_clickable_links: [],
                        text:[],
                        hoverinfo: 'text+value+percent',
                        // An array which will hold all the links required for on click event of graph
                        graphic_clickable_links: []
                      };
                      break;
                    case "bar":
                      values = {
                          x: [],
                          y: [],
                          text:[],
                          textposition: 'outside',
                          type: getType(type),
                          name: legend,
                          // An array which will hold all the links required for legends
                          legend_clickable_links: [],
                          // fill: type == 'area' ? 'tozeroy':'',
                          // mode: getMode(type),
                          orientation: orientation,
                          hoverinfo: 'text',
                          // An array which will hold all the links required for on click event of graph
                          graphic_clickable_links: []
                      }
                      break;
                    case "histogram-horizontal":
                      values = {
                          y: [],
                          name: legend || '',
                          type: "histogram",
                          orientation: orientation
                      }
                      break;
                    case "histogram-vertical":
                        values = {
                            x: [],
                            name: legend || '',
                            type: "histogram",
                            orientation: orientation
                        }
                        break;
                    case "violin":
                        values = {
                          x: [],
                          y: [],
                          name: legend
                        }
                        break;
                    case "scatter":
                        values = {
                            x: [],
                            y: [],
                            text: [],
                            labels: [],
                            legend_clickable_links: [],
                            type: getType(type),
                            // name of the trace
                            // name: legend || '',
                            mode: getMode(type)
                        }
                        break;
                    default:
                      values = {
                          x: [],
                          y: [],
                          text: [],
                          type: getType(type),
                          name: legend,
                          fill: type == 'area' ? 'tozeroy':'',
                          mode: getMode(type)
                      }
                  }
                  return values;
                }

                function getPlotlyConfig(plot) {
                    var config = {};
                    // use config from plot.plotly.config if exists
                    if (plot.plotly && plot.plotly.config) {
                        config = plot.plotly.config;
                    }

                    if (config.displaylogo == undefined) config.displaylogo = false;
                    if (config.responsive == undefined) config.responsive = true;
                    return config;
                }

                /**
                 * Get or set the plotly.layout
                 * NOTE: plot.config holds configurable values to add to layout
                 */
                function getPlotlyLayout(plot) {
                    var configLayout = {},
                        layout = {};

                    // layout object from plot.plotly.layout or plot.config
                    // NOTE: plotly_config will be deprecated eventually
                    if (plot.plotly && plot.plotly.layout) {
                        configLayout = plot.plotly.layout;
                    } else if (plot.plotly_config) {
                        configLayout = plot.plotly_config;
                    } else if (plot.config) {
                        configLayout = plot.config;
                    }

                    // configuration overrides
                    var tempConfig = plot.config;
                    switch (plot.plot_type) {
                        case "pie":
                            break;
                        case "histogram-horizontal":
                        case "histogram-vertical":
                            if (tempConfig.bargap != undefined) layout.bargap = tempConfig.bargap;
                            break;
                        case "violin":
                            layout.xaxis = {};
                            layout.yaxis = {};
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
                    // NOTE: applies plotly_config as well but will be deprecated in future
                    // NOTE: this does not recursively apply object key/value pairs, it will only go one level deep and override
                    Object.keys(configLayout).forEach(function (key) {
                        layout[key] = configLayout[key];
                    });

                    // plot.config object to override layout properties
                    // (not plot.plotly.config)
                    if (tempConfig.title_display_markdown_pattern || tempConfig.title_display_pattern) layout.title = configureTitleDisplayMarkdownPattern(tempConfig.title_display_markdown_pattern || tempConfig.title_display_pattern);
                    if (tempConfig.hasOwnProperty("xaxis") && tempConfig.xaxis.hasOwnProperty("title_display_markdown_pattern")) layout.xaxis.title = configureTitleDisplayMarkdownPattern(tempConfig.xaxis.title_display_markdown_pattern);
                    if (tempConfig.hasOwnProperty("yaxis") && tempConfig.yaxis.hasOwnProperty("title_display_markdown_pattern")) layout.yaxis.title = configureTitleDisplayMarkdownPattern(tempConfig.yaxis.title_display_markdown_pattern);
                    if (tempConfig.disable_default_legend_click != undefined) layout.disable_default_legend_click = tempConfig.disable_default_legend_click;

                    // check for set width, if set remove "fullscreen-width" class
                    if ($rootScope.inIframe || layout.width) $rootScope.fullscreenWidth = false;
                    if ($rootScope.inIframe || layout.height) $rootScope.fullscreenHeight = false;

                    return layout;
                };

                function addComma(data) {
                  // this regex is used to add a thousand separator in the number if possible
                  return data.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                }

                function getQueryParamCharacter(link) {
                    // Check if the link already has a "?" if yes append "&" else append "?" to add the parameters to the link
                    return link.indexOf("?") !== -1 ? "&" : "?"
                }

                function appendContextParameters(link) {
                    let contextUrlParams = ConfigUtils.getContextHeaderParams();
                    // Extracts the link and checks if ? is present in the link, if yes it adds "&" else it appends "?"
                    let qCharacter = getQueryParamCharacter(link);
                    //Return pcid and ppid to URL request
                    return qCharacter + "pcid=" + contextUrlParams.cid + "&ppid=" + contextUrlParams.pid;
                }

                function extractLink(pattern){
                    // Checking if the pattern contains link if yes then extract the link directly else
                    let extractedLink = false;
                    let match = null;
                    if (pattern.includes("(") && pattern.includes(")")) {
                        // Defined regex to extract url from the pattern defined in the configuration file
                        // Example: [{{{ Number of records }}}](/deriva-webapps/plot/?config=gudmap-todate-pie){target=_blank}
                        // extractedLink = /deriva-webapps/plot/?config=gudmap-todate-pie
                        // Extracts all the characters placed between "( )".
                        // "]/(" : find a ']' bracket followed by '('
                        // "." : matches any character and
                        // "*?" : matches the previous token between zero and unlimited times
                        // "i" modifier :  insensitive. Case insensitive match (ignores case of [a-zA-Z])
                        // "g" modifier :  global. All matches.
                        let markdownUrlRegex = /]\((.*?)\)/ig;
                        match = markdownUrlRegex.exec(pattern);
                        extractedLink = match ? match[1] : false;
                    } else if (pattern.includes("href")) {
                        // Defined regex to extract url from the generated html element with href attribute
                        // Example: <a href="(/deriva-webapps/plot/?config=gudmap-todate-pie" target="_blank">prostate gland</a>
                        // extractedLink = /deriva-webapps/plot/?config=gudmap-todate-pie
                        // Extracts a link from the anchor tag
                        // "\s" : matches a space character
                        // ^\n\r : matches a string that does not have new line or carriage return
                        let htmlUrlRegex = /<a\shref="([^\n\r]*?)"/ig;
                        match = htmlUrlRegex.exec(pattern);
                        extractedLink = match ? match[1] : false;
                    }

                    // return false if no extracted link
                    return extractedLink;
                }

                function configureTitleDisplayMarkdownPattern(pattern){
                    let link = extractLink(pattern);
                    // Replace the link in the pattern and append pcid and ppid
                    let patternWParams = link ? pattern.replace(link, link + appendContextParameters(link)) : pattern;
                    let title = ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(patternWParams, $rootScope.templateParams), true);
                    return title;
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
                    if (type == "pie" || typeof data != "number") {
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
                    $rootScope.noIdParams = !studyId && !geneId;

                    // templateParams created before this function is called
                    $rootScope.templateParams.$url_parameters = {
                            NCBI_GeneID: geneId || null,
                            Study: []
                    }

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
                    if ( $rootScope.inIframe || ((geneId && !studyId) || (!geneId && studyId)) ) {
                        $rootScope.disableGeneSelector = geneId ? true : false;
                        $rootScope.hideStudySelector = studyId ? true : false;
                    }

                    var geneUri = ERMrest.renderHandlebarsTemplate(plot.gene_uri_pattern, $rootScope.templateParams);
                    // relies on geneUri not passed as param
                    function generalOrSpecificGene(reference) {
                        var innerDefer = $q.defer();
                        // if we need a specific gene as default
                        if ($rootScope.templateParams.$url_parameters.NCBI_GeneID) {
                            var specificGeneUri = geneUri + "/NCBI_GeneID=" + $rootScope.templateParams.$url_parameters.NCBI_GeneID;
                            var headers = {};
                            var uriParams = specificGeneUri.split("/")
                            headers[ERMrest.contextHeaderName] = ConfigUtils.getContextHeaderParams();
                            // URI looks like "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)/NCBI_GeneID="
                            headers[ERMrest.contextHeaderName].schema_table = uriParams[uriParams.indexOf("entity") + 1];
                            headers[ERMrest.contextHeaderName].catalog = uriParams[uriParams.indexOf("catalog") + 1];
                            ERMrest.resolve(specificGeneUri, {headers: headers}).then(function (ref) {
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
                    var uriParams = geneUri.split("/")
                    headers[ERMrest.contextHeaderName] = ConfigUtils.getContextHeaderParams();
                    // URI looks like "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)"
                    headers[ERMrest.contextHeaderName].schema_table = uriParams[uriParams.indexOf("entity") + 1];
                    headers[ERMrest.contextHeaderName].catalog = uriParams[uriParams.indexOf("catalog") + 1]
                    // for gene popup
                    ERMrest.resolve(geneUri, {headers: headers}).then(function (ref) {
                        $rootScope.savedQuery = ConfigUtils.initializeSavingQueries(ref);
                        $rootScope.geneReference = ref.contextualize.compactSelect;

                        return generalOrSpecificGene($rootScope.geneReference);
                    }).then(function (page) {
                        $rootScope.gene = page.tuples[0];

                        if (!geneId) {
                            // use first returned from set if no default was defined
                            $rootScope.templateParams.$url_parameters.NCBI_GeneID = $rootScope.gene.data["NCBI_GeneID"];
                        }

                        var studyUri = ERMrest.renderHandlebarsTemplate(plot.study_uri_pattern, $rootScope.templateParams);
                        if ($rootScope.templateParams.$url_parameters.Study.length > 0) {
                            // get study information for study from url parameters
                            studyUri += "/RID=" + $rootScope.templateParams.$url_parameters.Study[0].uniqueId;
                        }

                        return ERMrest.resolve(studyUri, ConfigUtils.getContextHeaderParams());
                    }).then(function (singleStudyRef) {

                        return singleStudyRef.read(1);
                    }).then(function (page) {
                        $rootScope.studySet = page.tuples;

                        // attaching "Tuple" to the templating environment causes handlebars to complain about accessing prototypes
                        var resultsForTemplating = []
                        page.tuples.forEach(function (tuple) {
                            resultsForTemplating.push({
                                "uniqueId": tuple.uniqueId,
                                "data": tuple.data
                            });
                        });

                        $rootScope.templateParams.$url_parameters.Study = resultsForTemplating;

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
                        plot_values.layout.title = "No Data";
                        defer.resolve(plot_values);// TODO: figure out how to return an error to catch clause without breaking code
                        return defer.promise;
                    }

                    var headers = {};
                    headers[ERMrest.contextHeaderName] = ConfigUtils.getContextHeaderParams();
                    // URI looks like "/ermrest/catalog/2/attributegroup/M:=RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}({{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}})&{{/if}}NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}/exp:=(Experiment)=(RNASeq:Experiment:RID)/$M/Anatomical_Source,Experiment,Experiment_Internal_ID:=exp:Internal_ID,NCBI_GeneID,Replicate,Sex,Species,Specimen,Specimen_Type,Stage,TPM"
                    var schema_table = uriParams[uriParams.indexOf("attributegroup") + 1]
                    if (schema_table.includes(":=")) schema_table = schema_table.split(":=")[1]
                    headers[ERMrest.contextHeaderName].schema_table = schema_table;
                    headers[ERMrest.contextHeaderName].catalog = uriParams[uriParams.indexOf("catalog") + 1]
                    if (UriUtils.getQueryParams($window.location.href).pcid) headers[ERMrest.contextHeaderName].pcid = UriUtils.getQueryParams($window.location.href).pcid;
                    if (UriUtils.getQueryParams($window.location.href).ppid) headers[ERMrest.contextHeaderName].ppid = UriUtils.getQueryParams($window.location.href).ppid;
                    headers[ERMrest.contextHeaderName] = ERMrest._certifyContextHeader(headers[ERMrest.contextHeaderName]);

                    server.http.get(uri, {headers: headers}).then(function(response) {
                        var data = response.data;

                        // sort data by xGroupKey.column_name
                        data.sort(function(a, b) {
                            if (a[xGroupKey.column_name] && b[xGroupKey.column_name]) {
                                return a[xGroupKey.column_name].localeCompare(b[xGroupKey.column_name]);
                            } else if (a[xGroupKey.column_name] == null) {
                                return -1;
                            } else if (b[xGroupKey.column_name] == null) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });

                        // transform x data based on groupKey
                        // xData used for graph x data AND xaxis grouping
                        var xData = data.map(function (obj) {
                            var value = obj[xGroupKey.column_name];
                            // Check if the legends are defined in the configuration file
                            if (value !== null && value !== undefined) {
                                //Changes related to adding markdown templating pattern to legends in violin
                                if (xGroupKey.hasOwnProperty("legend_markdown_pattern") && xGroupKey.legend_markdown_pattern) {
                                    // Add the value extracted to the template variable as it can be used in the link provided by the configuration file
                                    $rootScope.templateParams.value = obj[xGroupKey.column_name];
                                    try {
                                        var pattern = ERMrest.renderHandlebarsTemplate(xGroupKey.legend_markdown_pattern[0], $rootScope.templateParams);
                                        value = ERMrest.renderMarkdown(pattern, true);
                                        var extractedLink = extractLink(pattern);
                                        var linkWithContextParams = extractedLink + appendContextParameters(extractLink(xGroupKey.legend_markdown_pattern[0]));
                                        // Add Context Parameters to link
                                        value = value.replace(extractedLink, linkWithContextParams)
                                    } catch(error) {
                                        value = obj[xGroupKey.column_name];
                                    }
                                    delete $rootScope.templateParams.value;
                                }
                            }
                            // TODO: if "", set value as 'Empty'
                            return (value !== null && value !== undefined) ? value : "N/A"
                        });

                        // transform x data based on groupKey
                        // xDataTicks used for xaxis grouping display values
                        var xDataTicks = data.map(function (obj) {
                            // add row of data to templating environment
                            $rootScope.templateParams.$row = obj;

                            // use markdown template/template if available/defined, else use value for column
                            var value = xGroupKey.tick_display_markdown_pattern ? ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(xGroupKey.tick_display_markdown_pattern, $rootScope.templateParams), true) : obj[xGroupKey.column_name];
                            // remove row after using it for templating
                            delete $rootScope.templateParams.$row;
                            return (value !== null && value !== undefined) ? value : "N/A"
                        });

                        // transform y data based on configuration option in plot-config
                        var yData = data.map(function (obj) {
                            // add row of data to templating environment
                            $rootScope.templateParams.$row = obj;

                            // use markdown template/template if available/defined, else use value for column
                            var value = config.yaxis.tick_display_markdown_pattern ? ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(config.yaxis.tick_display_markdown_pattern, $rootScope.templateParams), true) : obj[config.yaxis.group_key];
                            // remove row after using it for templating
                            delete $rootScope.templateParams.$row;
                            return value;
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
                                box: {
                                    visible: true
                                },
                                meanline: {
                                    visible: true
                                },
                                transforms: [{
                                    type: 'groupby',
                                    groups: xData
                                }],
                                // An array which will contain all the links that can be used in on click event of the violin chart
                                graphic_clickable_links: []
                            }],
                            // passed directly to plotly (plotly.layout)
                            layout: getPlotlyLayout(plot)
                        }

                        // attach configurable plotly values
                        // TODO: Do we set configuration based on whitelist or blacklist?
                        // plotly.data values that probably should NOT be overwritten:
                        //   - [type, x, y, transforms[].groups]

                        // xaxis
                        // set default xaxis values
                        if (plotlyConfig.layout.xaxis.automargin == undefined) plotlyConfig.layout.xaxis.automargin = true;
                        // could be defined as a value in configuration file, if not create as an object for title.standoff
                        if (plotlyConfig.layout.xaxis.title == undefined) plotlyConfig.layout.xaxis.title = {};
                        if (typeof plotlyConfig.layout.xaxis.title === "object" && plotlyConfig.layout.xaxis.title.standoff == undefined) plotlyConfig.layout.xaxis.title = { standoff: 20 };
                        // Checking if markdown template is available for title, if yes use that else use the column name for the current group key
                        plotlyConfig.layout.xaxis.title.text = (xGroupKey.title_display_markdown_pattern ? configureTitleDisplayMarkdownPattern(xGroupKey.title_display_markdown_pattern) : (xGroupKey.title_display_pattern ? xGroupKey.title_display_pattern : xGroupKey.column_name) );
                        plotlyConfig.layout.xaxis.tickvals = xData;
                        plotlyConfig.layout.xaxis.ticktext = xDataTicks;
                        // set the legend_clickable_links variable to true of the legends in the violin graph have links in them else set it undefined
                        plotlyConfig.data[0].legend_clickable_links = (xGroupKey.legend_markdown_pattern ? true : undefined);

                        // yaxis
                        // NOTE: if markdown template available, pattern set in getPlotlyLayout function
                        // if not available use the yaxis groupkey
                        if (!config.yaxis || !config.yaxis.title_display_markdown_pattern) plotlyConfig.layout.yaxis.title = config.yaxis.group_key;
                        // set default yaxis value
                        if (plotlyConfig.layout.yaxis.zeroline == undefined) plotlyConfig.layout.yaxis.zeroline = false;
                        plotlyConfig.layout.yaxis.type = $rootScope.yAxisScale;

                        // Add graphic links to the violin chart and append context parameters to the link
                        // Supports both graphic links as a string or as an array
                        if (xGroupKey.hasOwnProperty("graphic_link_pattern")) {
                            let graphic_link = Array.isArray(xGroupKey.graphic_link_pattern) ? xGroupKey.graphic_link_pattern[0] : xGroupKey.graphic_link_pattern;
                            graphic_link = graphic_link + appendContextParameters(graphic_link);
                            plotlyConfig.data[0].graphic_clickable_links.push(ERMrest.renderHandlebarsTemplate(graphic_link, $rootScope.templateParams));
                        }

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
                                data: []
                            };

                            var config = getPlotlyConfig(plot);
                            // TODO: this is for backwards compatibility. remove when deprecated
                            if (!config.modeBarButtonsToRemove && plot.plotlyDefaultButtonsToRemove) config.modeBarButtonsToRemove = plot.plotlyDefaultButtonsToRemove

                            var tracesComplete = 0;
                            $rootScope.templateParams = {
                                $url_parameters: {}
                            }

                            $rootScope.hideStudySelector = false;
                            $rootScope.disableGeneSelector = false;

                            // trick to verify if this config app is running inside of an iframe as part of another app
                            $rootScope.inIframe = $window.self !== $window.parent;

                            // violin plot has it's own case outside of the switch condition below since it relies on reference api for the gene selector
                            if (plot.plot_type == "violin") {
                                if (plotConfig.top_right_link_text) $rootScope.subnavbarLinkText = plotConfig.top_right_link_text;
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
                                    var uriParams = uri.split("/");
                                    headers[ERMrest.contextHeaderName] = ConfigUtils.getContextHeaderParams();
                                    //URI looks like "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26"
                                    var schema_table = uriParams[uriParams.indexOf("entity") + 1]
                                    if (schema_table.includes(":=")) schema_table = schema_table.split(":=")[1]
                                    headers[ERMrest.contextHeaderName].schema_table = schema_table;
                                    headers[ERMrest.contextHeaderName].catalog = uriParams[uriParams.indexOf("catalog") + 1]
                                    if (UriUtils.getQueryParams($window.location.href).pcid) headers[ERMrest.contextHeaderName].pcid = UriUtils.getQueryParams($window.location.href).pcid;
                                    if (UriUtils.getQueryParams($window.location.href).ppid) headers[ERMrest.contextHeaderName].ppid = UriUtils.getQueryParams($window.location.href).ppid;
                                    headers[ERMrest.contextHeaderName] = ERMrest._certifyContextHeader(headers[ERMrest.contextHeaderName]);
                                    server.http.get(uri, {headers: headers}).then(function(response) {
                                        try {
                                            var layout = getPlotlyLayout(plot);
                                            var data = response.data;
                                            $rootScope.templateParams.$traces = {
                                                data: data
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
                                                    if (trace.legend != undefined) {
                                                        values.labels = trace.legend;
                                                        label = false;
                                                    }

                                                    data.forEach(function (row) {
                                                        // $self object will point to the the current row from the data that is fetched from URI
                                                        $rootScope.templateParams.$self = {
                                                            data: row
                                                        }
                                                        // Check if the legends are defined in the configuration file
                                                        if (label) {
                                                            var traceLabel = row[trace.legend_col];
                                                            //Changes related to adding markdown templating pattern to legends in pie
                                                            if (trace.hasOwnProperty("legend_markdown_pattern") && trace.legend_markdown_pattern) {
                                                                try {
                                                                    var pattern = ERMrest.renderHandlebarsTemplate(trace.legend_markdown_pattern, $rootScope.templateParams);
                                                                    traceLabel = ERMrest.renderMarkdown(pattern,true);
                                                                    var extractedLink = extractLink(pattern);
                                                                    var linkWithContextParams = extractedLink + appendContextParameters(extractLink(trace.legend_markdown_pattern));
                                                                    values.legend_clickable_links.push(linkWithContextParams);
                                                                    // Add Context Parameters to link
                                                                    traceLabel = traceLabel.replace(extractedLink, linkWithContextParams)
                                                                } catch(error) {
                                                                    traceLabel = row[trace.legend_col];
                                                                }
                                                            }
                                                            values.labels.push(traceLabel);
                                                            // Added the legend column names to text variable so that the tooltip name does not contain a link if the legends contains a link
                                                            values.text.push(row[trace.legend_col]);
                                                            // Override the legend name displayed in the tooltip on traces by hovertemplate_display_pattern defined in configuration file
                                                            // var tooltip=trace.hovertemplate_display_pattern ? ERMrest.renderHandlebarsTemplate(trace.hovertemplate_display_pattern, $rootScope.templateParams) : row[trace.legend_col];
                                                            // values.text.push(tooltip)
                                                        }
                                                        values.values.push(formatData(row[trace.data_col], plot.config ? plot.config.format_data : false, "pie"));
                                                        // Configure links for individual traces
                                                        // For Configuring links we are only going to render the templating pattern as the link would not contain any of html content in it, it would be plain link like,
                                                        // graphic_link_pattern: "/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}"
                                                        if (trace.hasOwnProperty("graphic_link_pattern")) {
                                                            let graphic_link = Array.isArray(trace.graphic_link_pattern) ? trace.graphic_link_pattern[0] : trace.graphic_link_pattern;
                                                            // Added code to support graphic_link_pattern as a String or an array, if it is an array only pick up 0th element
                                                            graphic_link = graphic_link + appendContextParameters(graphic_link);
                                                            values.graphic_clickable_links.push(ERMrest.renderHandlebarsTemplate(graphic_link, $rootScope.templateParams));
                                                        }
                                                        delete $rootScope.templateParams.$self;
                                                    });

                                                    plot_values.data.push(values);
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;
                                                case "histogram-vertical":
                                                    var values = getValues(plot.plot_type, trace.legend);
                                                    data.forEach(function (row) {
                                                        values.x.push(formatData(row[trace.data_col], plot.config ? plot.config.format_data : false));
                                                    });
                                                    values.nbinsx = plot.config.xbins;

                                                    plot_values.data.push(values);
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;
                                                case "histogram-horizontal":
                                                    var values = getValues(plot.plot_type, trace.legend);
                                                    data.forEach(function (row) {
                                                        values.y.push(formatData(row[trace.data_col], plot.config ? plot.config.format_data : false));
                                                    });
                                                    values.nbinsy = plot.config.ybins;

                                                    plot_values.data.push(values);
                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;
                                                case "bar":
                                                    if (trace.orientation == "h") {
                                                        var suffix = "  ";
                                                        if (!layout.yaxis) {
                                                            layout.yaxis = {
                                                                ticksuffix: suffix
                                                            };
                                                        } else if (!layout.yaxis.ticksuffix) {
                                                            layout.yaxis.ticksuffix = suffix;
                                                        }
                                                        for (var i = 0; i < trace.x_col.length;i++) {
                                                            // $self object will point to the the current row from the data that is fetched from URI
                                                            var trace_legend = trace.legend ? trace.legend[i] : '';
                                                            // Add links to the legends
                                                            var trace_legend_link = trace.legend_markdown_pattern ? trace.legend_markdown_pattern[i] :'';
                                                            if (trace_legend_link != '') {
                                                                trace_legend_link = ERMrest.renderMarkdown(trace_legend_link, true);
                                                                var extractedLink = extractLink(trace.legend_markdown_pattern[i]);
                                                                var linkWithContextParams = extractedLink + appendContextParameters(extractLink(trace.legend_markdown_pattern[i]));
                                                                // Add Context Parameters to link
                                                                trace_legend = trace_legend_link.replace(extractedLink, linkWithContextParams)
                                                            }
                                                            var values = getValues(plot.plot_type, trace_legend, trace.orientation);
                                                            if (values.trace_legend != '') {
                                                                values.legend_clickable_links.push(linkWithContextParams);
                                                            }
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
                                                                var y_col = row[trace.y_col];
                                                                // Checking for yaxis because the orientation is horizontal and therefore y axis will have labels and x axis will have values
                                                                // Checking if tick_display_markdown_pattern is available in yaxis if yes, then make the y axis labels as hyperlinks.
                                                                if (plot.config.hasOwnProperty("yaxis") && plot.config.yaxis.hasOwnProperty("tick_display_markdown_pattern")) {
                                                                    var patternLink = ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(plot.config.yaxis.tick_display_markdown_pattern, $rootScope.templateParams), true);
                                                                    var extractedLink = extractLink(plot.config.yaxis.tick_display_markdown_pattern);
                                                                    var linkWithContextParams = extractedLink + appendContextParameters(extractLink(plot.config.yaxis.tick_display_markdown_pattern));
                                                                    y_col = patternLink.replace(extractedLink,linkWithContextParams);
                                                                }
                                                                values.x.push(formatData(row[trace.x_col[i]], plot.config ? plot.config.format_data_x : false));
                                                                values.y.push(formatData(y_col, plot.config ? plot.config.format_data_y : false));
                                                                // Override the legend name displayed in the tooltip on traces by hovertemplate_display_pattern defined in configuration file
                                                                // var tooltip=trace.hovertemplate_display_pattern ? ERMrest.renderHandlebarsTemplate(trace.hovertemplate_display_pattern, $rootScope.templateParams) :formatData(row[trace.x_col[i]], plot.config ? plot.config.format_data_x : false);
                                                                // values.text.push(tooltip)
                                                                values.text.push(formatData(row[trace.x_col[i]], plot.config ? plot.config.format_data_x : false))
                                                                // Configure links for individual traces
                                                                // For Configuring links we are only going to render the templating pattern as the link would not contain any of html content in it, it would be plain link like,
                                                                // graphic_link_pattern: "/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}"
                                                                if (trace.hasOwnProperty("graphic_link_pattern")) {
                                                                    // Added code to support graphic_link_pattern as a String or an array, if it is an array only pick up 0th element
                                                                    let graphic_link = Array.isArray(trace.graphic_link_pattern) ? trace.graphic_link_pattern[0] : trace.graphic_link_pattern;
                                                                    graphic_link = graphic_link + appendContextParameters(graphic_link);
                                                                    values.graphic_clickable_links.push(ERMrest.renderHandlebarsTemplate(graphic_link,$rootScope.templateParams));
                                                                }
                                                                delete $rootScope.templateParams.$self;
                                                            });
                                                            values.hoverinfo = 'text'
                                                            plot_values.data.push(values);
                                                        }
                                                    } else {
                                                        for(var i = 0; i < trace.y_col.length;i++) {
                                                            var values = getValues(plot.plot_type, trace.legend ? trace.legend[i] : '',  trace.orientation);
                                                            data.forEach(function (row) {
                                                                $rootScope.templateParams.$self = {
                                                                    data: row
                                                                }
                                                                var x_col = row[trace.x_col];
                                                                //Checking for xaxis because the orientation is vertical and therefore x axis will have labels and y axis will have values
                                                                //Checking if tick_display_markdown_pattern is available in yaxis if yes, then make the x axis labels as hyperlinks.
                                                                if (plot.config.hasOwnProperty("xaxis") && plot.config.xaxis.hasOwnProperty("tick_display_markdown_pattern")) {
                                                                    var patternLink = ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(plot.config.xaxis.tick_display_markdown_pattern, $rootScope.templateParams), true);
                                                                    var extractedLink = extractLink(plot.config.xaxis.tick_display_markdown_pattern);
                                                                    var linkWithContextParams = extractedLink + appendContextParameters(extractLink(plot.config.xaxis.tick_display_markdown_pattern));
                                                                    x_col = patternLink.replace(extractedLink,linkWithContextParams);
                                                                }
                                                                values.x.push(formatData(x_col, plot.config ? plot.config.format_data_x : false));
                                                                values.y.push(formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false));
                                                                // var tooltip=trace.hovertemplate_display_pattern ? ERMrest.renderHandlebarsTemplate(trace.hovertemplate_display_pattern, $rootScope.templateParams) : formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false);
                                                                // Added the legend column names to text variable so that the tooltip name does not contain a link if the legends contains a link
                                                                // values.text.push(tooltip)
                                                                values.text.push(formatData(row[trace.y_col[i]], plot.config ? plot.config.format_data_y : false))
                                                                // Configure links for individual traces
                                                                // For Configuring links we are only going to render the templating pattern as the link would not contain any of html content in it, it would be plain link like,
                                                                // graphic_link_pattern: "/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}"
                                                                if (trace.hasOwnProperty("graphic_link_pattern")) {
                                                                    // Added code to support graphic_link_pattern as a String or an array, if it is an array only pick up 0th element
                                                                    let graphic_link = Array.isArray(trace.graphic_link_pattern) ? trace.graphic_link_pattern[0] : trace.graphic_link_pattern;
                                                                    graphic_link = graphic_link + appendContextParameters(graphic_link);
                                                                    values.graphic_clickable_links.push(ERMrest.renderHandlebarsTemplate(graphic_link, $rootScope.templateParams));
                                                                }
                                                                delete $rootScope.templateParams.$self;
                                                            });
                                                            values.hoverinfo = 'text'
                                                            plot_values.data.push(values);
                                                        }
                                                    }

                                                    plot_values.layout = layout;
                                                    plot_values.config = config;
                                                    break;
                                                case "scatter":
                                                    for(var i = 0; i < trace.y_col.length; i++) {
                                                        var values = getValues(plot.plot_type, trace.legend ? trace.legend[i] : '', null);

                                                        data.forEach(function (row) {
                                                            $rootScope.templateParams.$self = {
                                                                data: row
                                                            }

                                                            var x_col = row[trace.x_col[0]];
                                                            if (plot.config.hasOwnProperty("xaxis") && plot.config.xaxis.hasOwnProperty("tick_display_markdown_pattern")) {
                                                                var patternLink = ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(plot.config.xaxis.tick_display_markdown_pattern, $rootScope.templateParams), true);
                                                                var extractedLink = extractLink(plot.config.xaxis.tick_display_markdown_pattern);
                                                                var linkWithContextParams = extractedLink + appendContextParameters(extractLink(plot.config.xaxis.tick_display_markdown_pattern));
                                                                x_col = patternLink.replace(extractedLink, linkWithContextParams);
                                                            }

                                                            var y_col = row[trace.y_col[i]];
                                                            if (plot.config.hasOwnProperty("yaxis") && plot.config.yaxis.hasOwnProperty("tick_display_markdown_pattern")) {
                                                                var patternLink = ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(plot.config.yaxis.tick_display_markdown_pattern, $rootScope.templateParams), true);
                                                                var extractedLink = extractLink(plot.config.yaxis.tick_display_markdown_pattern);
                                                                var linkWithContextParams = extractedLink + appendContextParameters(extractLink(plot.config.yaxis.tick_display_markdown_pattern));
                                                                y_col = patternLink.replace(extractedLink, linkWithContextParams);
                                                            }

                                                            if (x_col != null && y_col != null) {
                                                                values.x.push(formatData(x_col, plot.config ? plot.config.format_data_x : false));
                                                                values.y.push(formatData(y_col, plot.config ? plot.config.format_data_y : false));
                                                            }

                                                            delete $rootScope.templateParams.$self;
                                                        });

                                                        plot_values.data.push(values);
                                                        plot_values.layout = layout;
                                                        plot_values.config = config;
                                                    }
                                                    break;
                                                default:
                                                    // changes for the generic cases not handled above
                                                    for(var i = 0; i < trace.y_col.length; i++) {
                                                        var values = getValues(plot.plot_type, trace.legend, trace.orientation);
                                                        data.forEach(function (row) {
                                                            $rootScope.templateParams.$self = {
                                                                data: row
                                                            }

                                                            var x_col = row[trace.x_col[0]];
                                                            if (plot.config.hasOwnProperty("xaxis") && plot.config.xaxis.hasOwnProperty("tick_display_markdown_pattern")) {
                                                                var patternLink = ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(plot.config.xaxis.tick_display_markdown_pattern, $rootScope.templateParams), true);
                                                                var extractedLink = extractLink(plot.config.xaxis.tick_display_markdown_pattern);
                                                                var linkWithContextParams = extractedLink + appendContextParameters(extractLink(plot.config.xaxis.tick_display_markdown_pattern));
                                                                x_col = patternLink.replace(extractedLink, linkWithContextParams);
                                                            }

                                                            var y_col = row[trace.y_col[i]];
                                                            if (plot.config.hasOwnProperty("yaxis") && plot.config.yaxis.hasOwnProperty("tick_display_markdown_pattern")) {
                                                                var patternLink = ERMrest.renderMarkdown(ERMrest.renderHandlebarsTemplate(plot.config.yaxis.tick_display_markdown_pattern, $rootScope.templateParams), true);
                                                                var extractedLink = extractLink(plot.config.yaxis.tick_display_markdown_pattern);
                                                                var linkWithContextParams = extractedLink + appendContextParameters(extractLink(plot.config.yaxis.tick_display_markdown_pattern));
                                                                y_col = patternLink.replace(extractedLink, linkWithContextParams);
                                                            }

                                                            values.x.push(formatData(x_col, plot.config ? plot.config.format_data_x : false));
                                                            values.y.push(formatData(y_col, plot.config ? plot.config.format_data_y : false));

                                                            delete $rootScope.templateParams.$self;
                                                        });

                                                        plot_values.data.push(values);
                                                        plot_values.layout = layout;
                                                        plot_values.config = config;
                                                    }
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
                                            delete $rootScope.templateParams.$traces;
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
                    getViolinData: getViolinData,
                    extractLink: extractLink
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
                vm.studySet = [];
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
                    var uriParams = geneUri.split("/")
                    var headers = {}

                    headers[ERMrest.contextHeaderName] = ConfigUtils.getContextHeaderParams();
                    //URI looks like "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}{{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}}/{{/if}}(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)"
                    var schema_table = uriParams[uriParams.indexOf("entity") + 1]
                    if (schema_table.includes(":=")) schema_table = schema_table.split(":=")[1]
                    headers[ERMrest.contextHeaderName].schema_table = schema_table;
                    headers[ERMrest.contextHeaderName].catalog = uriParams[uriParams.indexOf("catalog") + 1]
                    ERMrest.resolve(geneUri, {headers: headers}).then(function (ref) {
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
                            templateUrl: UriUtils.chaiseDeploymentPath() + "common/templates/searchPopup.modal.html"
                        }, function (res) {
                            $rootScope.dataChanged = true;
                            $rootScope.gene = res;
                            $rootScope.geneId = $rootScope.templateParams.$url_parameters.NCBI_GeneID = $rootScope.gene.data["NCBI_GeneID"];

                            // the gene has changed, fetch new plot data for new gene
                            PlotUtils.getViolinData(vm.studySet.length == 0 && !vm.selectAll).then(function (values) {
                                $rootScope.dataChanged = false;
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
                    var headers = {}
                    headers[ERMrest.contextHeaderName] = ConfigUtils.getContextHeaderParams();
                    var uriParams = studyUri.split("/")
                    // URI looks like "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}/(Study)=(RNASeq:Study:RID)"
                    var schema_table = uriParams[uriParams.indexOf("entity") + 1]
                    if (schema_table.includes(":=")) schema_table = schema_table.split(":=")[1]
                    headers[ERMrest.contextHeaderName].schema_table = schema_table;
                    headers[ERMrest.contextHeaderName].catalog = uriParams[uriParams.indexOf("catalog") + 1]

                    ERMrest.resolve(studyUri, {headers: headers}).then(function (ref) {
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

                        params.selectedRows = $rootScope.studySet ? $rootScope.studySet : [];

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
                            $rootScope.dataChanged = true;
                            vm.selectAll = $rootScope.selectAll = false;

                            $rootScope.studySet = vm.studySet = res.rows;

                            // attaching "Tuple" to the templating environment causes handlebars to complain about accessing prototypes
                            var resultsForTemplating = []
                            res.rows.forEach(function (tuple) {
                              resultsForTemplating.push({
                                "uniqueId": tuple.uniqueId,
                                "data": tuple.data
                              });
                            });

                            $rootScope.templateParams.$url_parameters.Study = resultsForTemplating;

                            // the study has changed, fetch new plot data for new study info
                            // Can't close popup without returning study info
                            PlotUtils.getViolinData(vm.studySet.length == 0).then(function (values) {
                                $rootScope.dataChanged = false;
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
                    $rootScope.dataChanged = true;
                    // empty the studySet
                    $rootScope.studySet = $rootScope.templateParams.$url_parameters.Study = vm.studySet = [];
                    PlotUtils.getViolinData().then(function (values) {
                        vm.selectAll = $rootScope.selectAll = true;
                        $rootScope.dataChanged = false;
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
                    $rootScope.dataChanged = true;
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
                    $rootScope.templateParams.$url_parameters.Study.splice(index, 1)[0];
                    $rootScope.studySet = vm.studySet;

                    // the study has changed, fetch new plot data for new study info
                    PlotUtils.getViolinData(vm.studySet.length == 0).then(function (values) {
                        $rootScope.dataChanged = false;
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                vm.removeAllStudy = function () {
                    $rootScope.dataChanged = true;
                    vm.selectAll = $rootScope.selectAll = false;
                    $rootScope.studySet = vm.studySet = [];
                    $rootScope.templateParams.$url_parameters.Study = [];

                    // all studies removed, call getViolinData with true to call case when we want to remove data from plot
                    PlotUtils.getViolinData(true).then(function (values) {
                        $rootScope.dataChanged = false;
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                // callback for group by selector
                vm.setGroup = function (group) {
                    $rootScope.dataChanged = true;
                    $rootScope.groupKey = group;

                    // Request to fetch data doesn't need to be made, currently should return 304 not modified and make very little difference
                    // TODO: change settings for plotly and reapply to plot instead of trying to fetch data first
                    PlotUtils.getViolinData(vm.studySet.length == 0 && !vm.selectAll).then(function (values) {
                        $rootScope.dataChanged = false;
                    }).catch(function (err) {
                        console.log(err);
                    });
                }

                // set a height on the plot directive if in iframe and plot controls are visible
                vm.setPlotHeight = function () {
                    if (!$rootScope.inIframe) return;

                    var controls = document.getElementsByClassName('plot-controls-group');
                    if (controls.length == 0) return;

                    // calculate height
                    // -20 to add a "margin" for bototm of the iframe
                    return {'height': $window.self.innerHeight - controls[0].offsetHeight - 20 + "px"}
                }

                // callback for scale selector
                vm.toggleScale = function (scale) {
                    $rootScope.dataChanged = true;
                    $rootScope.yAxisScale = scale;

                    // Request to fetch data doesn't need to be made, currently should return 304 not modified and make very little difference
                    // TODO: change settings for plotly and reapply to plot instead of trying to fetch data first
                    PlotUtils.getViolinData(vm.studySet.length == 0 && !vm.selectAll).then(function (values) {
                        $rootScope.dataChanged = false;
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

                // NOTE: when studySet is changed, extract the template data for the templating environment here instead of in 4-5 different
                // NOTE: have a notion to differentiate ALL STUDIES and NO STUDIES

                // intialize vm.studySet based on the rows returned from the study url parameters
                var setUpStudy = $scope.$watch(function () {
                    return ($rootScope.templateParams ? $rootScope.templateParams.$url_parameters.Study : null)
                }, function (newValue, oldValue) {
                    // execute only once, when study parameter is digested (or setup from reference default when embedded on gene page.. in future)
                    if (newValue && newValue.length > 0) {
                        vm.studySet = $rootScope.studySet;
                        setUpStudy(); // remove this watch statement
                    }
                });

                $scope.$watch('groups', function (newValue, oldValue) {
                    if (newValue) vm.groups = newValue;
                });
            }])
            .directive('plot', ['$rootScope', '$timeout', 'ConfigUtils', 'PlotUtils', function ($rootScope, $timeout, ConfigUtils, PlotUtils) {

                return {
                    link: function (scope, element) {
                        scope.$watch('plots', function (plots) {
                            if (plots) {
                                $timeout(function() {

                                    for (var i = 0; i < plots.length; i++) {
                                        if (plots[i].id == element[0].attributes['plot-id'].nodeValue) {
                                            Plotly.newPlot(element[0], plots[i].plot_values.data, plots[i].plot_values.layout, plots[i].plot_values.config)
                                            /* Data recived for plotly_hover and plotly_unhover events:
                                             data: {
                                               event: {
                                                   isTrusted: true,
                                                   ..
                                               },
                                               points: {
                                                   0: {
                                                       data: {
                                                           type: "pie",
                                                           hoverinfo: "text+value+percent",
                                                           text: "Imaging:IHC",
                                                       }
                                                   }
                                               }
                                             }
                                            */
                                            .then(element[0].on('plotly_hover', function(data) {
                                                    // On hover of the individual traces(Slices) of the pie change the cursor to pointer
                                                    // Need to check the type of the plot as area occupied by the graph has different names based on graphs
                                                    switch(data.points[0].data.type) {
                                                        case "pie":
                                                             // For Pie chart, the area of the pie is pielayer
                                                            var dragLayer = document.getElementsByClassName('pielayer')[0];
                                                            break;
                                                        default:
                                                            // For bar,violin chart, the area of the chart is nsewdrag
                                                            var dragLayer = document.getElementsByClassName('nsewdrag')[0];
                                                    }
                                                    dragLayer.style.cursor = 'pointer';
                                                }), // end plotly_hover callback

                                                element[0].on('plotly_unhover', function(data) {
                                                    //on unhover change the cursor to default icon
                                                    switch(data.points[0].data.type) {
                                                        case "pie":
                                                             // For Pie chart, the area of the pie is pielayer
                                                            var dragLayer = document.getElementsByClassName('pielayer')[0];
                                                            break;
                                                        default:
                                                            // For bar,violin chart, the area of the chart is nsewdrag
                                                            var dragLayer = document.getElementsByClassName('nsewdrag')[0];
                                                            break;
                                                    }
                                                    dragLayer.style.cursor = '';
                                                }), // end pltoly_unhover

                                                element[0].on('plotly_click', function(data) {
                                                    // here data is the event object that is recieved on click of the plot
                                                    /* Data Recieved:
                                                    // For Pie
                                                    data:{
                                                        event: {..}
                                                        points: {
                                                            0: {
                                                                data: {
                                                                    labels: // array of labels in pie chart,
                                                                    graphic_clickable_links: // array of links which are used to make chart clickable
                                                                },
                                                                fullData: {
                                                                    // Data with default parameters used by plotly
                                                                    automargin: false,
                                                                    direction: "counterClockwise",
                                                                    labels: []
                                                                }
                                                                label: // label on which click event took place
                                                                text: ""
                                                            }
                                                        }
                                                    }
                                                    // For bar chart

                                                    data: {
                                                        event: {..}
                                                        points: {
                                                            0: {
                                                                data: {
                                                                    x: //array of labels in bar chart xaxis,
                                                                    y: //array of labels in bar chart yaxis,
                                                                    graphic_clickable_links: // array of links which are used to make chart clickable
                                                                },
                                                                fullData: {
                                                                    // Data with default parameters used by plotly
                                                                    alignmentgroup: "",
                                                                    cliponxaxis: true,
                                                                    x: [],
                                                                    y: []
                                                                }
                                                                label: //label on which click event took place
                                                                text: ""
                                                            }
                                                        }
                                                    }

                                                    // data for violin chart
                                                    data: {
                                                        event: {..},
                                                        points: {
                                                            0: {
                                                                data: {
                                                                    type: violin,
                                                                    graphic_clickable_links: ["/deriva-webapps/plot/?config=gudmap-todate-pie&pcid=plotApp&ppid=1rqa2mfb1lyn2lr82bow1fce"],
                                                                    legend_clickable_links: true
                                                                },
                                                                fullData: {
                                                                  ...
                                                                },
                                                                transform[0].groups: "<a href="/chaise/recordset/#2/RNASeq:Replicate_Expression?pcid=plotApp&ppid=1rqa2mfb1lyn2lr82bow1fce">prostate gland</a>"
                                                                x: "<a href="/chaise/recordset/#2/RNASeq:Replicate_Expression?pcid=plotApp&ppid=1rqa2mfb1lyn2lr82bow1fce">prostate gland</a>"
                                                            }
                                                        }
                                                    }

                                                    */
                                                    if (data.hasOwnProperty("points") && data.points[0].data.hasOwnProperty("graphic_clickable_links")) {
                                                        var idx = "";
                                                        // For Pie, data.point[0].label is the label of the slice on which click event took place and data.points[0].data.labels is a list of all the labels of the traces, so we are trying to find out on what index of the label, the click event took place.
                                                        // After we retrive the index we will fetch the link present at that label in graphic_clickable_links and redirect the page to that link
                                                        // For Bar chart, we are doing the same this, only difference is based on the orientation we need to check the label is present on xaxis or yaxis
                                                        //Note: length(data.points[0].data.labels) | length(data.points[0].data.y) | length(data.points[0].data.x)  == length(data.points[0].data.graphic_clickable_links)
                                                        switch(data.points[0].data.type) {
                                                            case "pie":
                                                                idx = data.points[0].data.labels.indexOf(data.points[0].label.toString());
                                                                break;
                                                            case "bar":
                                                                // if the orientation is horizontal then the labels will be present on y axis else the labels will be present of xaxis
                                                                // For a grouped bar chart, plotly does not have a separate property which can help detect which one of the multiple bar chart on one xaxis/yaxis label was clicked.
                                                                // Therefore, as of now, for grouped bar chart as well, the graphic_clickable link will correspond to the labels on the axis.
                                                                if (data.points[0].data.orientation=="h") {
                                                                    idx = data.points[0].data.y.indexOf(data.points[0].y.toString());
                                                                } else {
                                                                    idx = data.points[0].data.x.indexOf(data.points[0].x.toString());
                                                                }
                                                                break;
                                                            case "violin":
                                                                // The index is 0 because in violin chart the event capture the data of a specific xGroupKey and so it will have link on 0th index
                                                                idx = 0;
                                                        }
                                                        if (data.points[0].data.graphic_clickable_links[idx] != false && data.points[0].data.graphic_clickable_links[idx] != undefined) {
                                                            var url = data.points[0].data.graphic_clickable_links[idx];
                                                            window.open(url,'_blank');
                                                        }
                                                    }
                                                }), // end plotly_click
                                                element[0].on('plotly_legendclick', function(data) {

                                                    /*
                                                    Data recived on plotly legend click event
                                                    // For Pie Chart
                                                    data: {
                                                            config: {staticPlot: false, plotlyServerURL: "", editable: false, edits: {…}, autosizable: false, …}
                                                            curveNumber: 0
                                                            data: {
                                                              0: {type: "pie", labels: Array(8), values: Array(8), legend_clickable_links: Array(8), text: Array(8), …}
                                                            }
                                                            length: 1
                                                            event: MouseEvent {isTrusted: true, screenX: 597, screenY: 261, clientX: 597, clientY: 190, …}
                                                            expandedIndex: 0
                                                            frames: []
                                                            fullData: {
                                                              0: {type: "pie", _template: null, uid: "b7d954", visible: true, name: "trace 0", …}
                                                            }
                                                            length: 1
                                                            fullLayout: {_dfltTitle: {…}, _traceWord: "trace", _mapboxAccessToken: null, font: {…}, title: {…}, …}
                                                            label: "<a href=\"/chaise/recordset/#2/Gene_Expression:Specimen/*::facets::?pcid=plotApp&ppid=2pm62p3i1ffo1n7b1wzc2o7e\" target=\"_blank\">Imaging: ISH</a>"
                                                            layout: {title: {…}, showlegend: true, disable_default_legend_click: true}
                                                    }
                                                    // For violin chart
                                                    */
                                                    var idx = "";
                                                    var disableClickReturn = (data.layout.hasOwnProperty("disable_default_legend_click") && data.layout.disable_default_legend_click == true) ? false : true;
                                                    // This event occurs on click of legend
                                                    if (data.hasOwnProperty("data")) {
                                                        switch(data.data[0].type) {
                                                            case "violin":
                                                                if (data.data[0].legend_clickable_links == true) {
                                                                    // Checking if the regex matches, if yes extract the link
                                                                    window.open(PlotUtils.extractLink(data.group), '_blank');
                                                                }

                                                                return disableClickReturn;
                                                                break;
                                                            case "pie":
                                                                idx = data.data[0].labels.indexOf(data.label.toString());
                                                                break;
                                                            // case "scatter":
                                                            //     idx = data.data[0].legend_clickable_links.indexOf(PlotUtils.extractLink(data.data[0].));
                                                            //     break;
                                                            case "bar":
                                                                idx = data.data[0].legend_clickable_links.indexOf(PlotUtils.extractLink(data.data[0].name));
                                                                break;
                                                            default:
                                                                return disableClickReturn;
                                                                // idx = data.data[0].labels.indexOf(data.label.toString());
                                                        }
                                                        if (data.data[0].hasOwnProperty("legend_clickable_links") && idx != "") {
                                                            if (data.data[0].legend_clickable_links[idx] != false && data.data[0].legend_clickable_links[idx] != undefined){
                                                                window.open(data.data[0].legend_clickable_links[idx], '_blank');
                                                                return disableClickReturn;
                                                            }
                                                        }
                                                    }
                                                    return disableClickReturn;
                                                })
                                            ).then(function () {
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
                    $rootScope.fullscreenWidth = true;
                    $rootScope.fullscreenHeight = true;
                    $rootScope.config = UriUtils.getQueryParam($window.location.href, "config");
                    $rootScope.headTitle = $window.plotConfigs[$rootScope.config].headTitle;
                    FunctionUtils.registerErmrestCallbacks();
                    var subId = Session.subscribeOnChange(function () {
                        Session.unsubscribeOnChange(subId);
                        var session = Session.getSessionValue();
                        ERMrest.setClientSession(session);
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
