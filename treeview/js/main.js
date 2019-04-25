(function() {
    $(document).ready(function() {
        // jstree, jquery, ermrestJS, q (promise library) each expose a module that's available in the execution environment
        // console.log(jstree);
        // console.log($);
        // console.log(ERMrest);
        // console.log(Q);

        function uuid() {
            // gets a string of a deterministic length of 4
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(36);
            }
            return s4() + s4() + s4() + s4() + s4() + s4();
        }

        function getHeader(action, schemaTable, params) {
            return ERMrest._certifyContextHeader({
                wid: window.name,
                pid: uuid(),
                cid: "treeview",
                action: action,
                schema_table: schemaTable,
                params: params
            });
        }

        if (!window.name) {
            window.name = uuid();
        }

        ERMrest.configure(null, Q);

        ERMrest.onload().then(function () {
            var showAnnotation, id_parameter, filterUrl, filterValue, columnName, parentAppExists, selected_option;
            var annotated_term  = "";
            var annotated_terms = [],
                urlParams       = {}, // key/values from uri
                urlParamNames   = [], // keys defined in url
                queryParams     = {}, // key/values from uri and defaults in config
                queryParamNames = [], // keys defined in templating
                requiredParams  = []; // params that are required and are used for identification purposes

            var templateParams = {
                $filters: {},
                $url_parameters: {}
            }

            // collect url params that appear in url in urlParams object
            window.location.search.substr(1).split("&").forEach(function(param) {
                if (!param) return;
                // part[0] is the param key
                // part[1] is the param value
                var parts = param.split("=");
                urlParams[parts[0]] = parts[1];
                urlParamNames.push(parts[0]);
            });

            // collect query params based on configuration
            treeviewConfig.filters.forEach(function(filter, idx) {
                filter.selected_filter.required_url_parameters.forEach(function (param) {
                    // if param is not in url, get it's default value
                    queryParams[param] = urlParams[param] ?  urlParams[param] : filter.default_id;
                    requiredParams.push(param);
                });
                // no values will exist yet until they are selected below
                queryParams[filter.filter_column_name] = null;
                queryParamNames.push(filter.filter_column_name);
            });

            templateParams.$url_parameters = queryParams;
            showAnnotation = queryParams[requiredParams[requiredParams.length-1]] ? true : false;
/* ===== End parameter extraction ===== */

            // function to reduce duplicated logic for collecting filter value from dropdown and re-fetching tree data
            function getValAndBuildData(name, value) {
                templateParams.$filters[name] = value;
                // filter_column_name (in config document) should be the column name you want for filtering data
                queryParams[name] = value;
                buildPresentationData(showAnnotation, value, id_parameter);
            }

            // if selected_filter in config and said identifier is present in url
            if(showAnnotation == true) {
                treeviewConfig.filters.forEach(function (filter, idx) {
                    // need to account for filter data
                    var queryPattern = filter.selected_filter.selected_query_pattern || filter.query_pattern
                    filterUrl = 'https://' + window.location.hostname + ERMrest._renderHandlebarsTemplate(queryPattern, templateParams);
                    var $el = $("#number");
                    $el.empty();

                    var headers = {};
                    var params = {};
                    params[requiredParams[idx]] = queryParams[requiredParams[idx]];
                    headers[ERMrest.contextHeaderName] = getHeader("facet/selected", filter.schema_table, params);
                    $.ajax({
                        headers: headers,
                        dataType: "json",
                        url: filterUrl,
                        success: function(filterData) {
                            // TODO: remove if statement when we want to support multiple filters
                            if (idx == treeviewConfig.filters.length-1) {
                                if (filterData === undefined || filterData.length == 0) {
                                    // TODO: error handling for no specimen
                                    document.getElementsByClassName('loader')[0].style.display = "none";
                                    $("#error-message").css("display", "");
                                    $("#alert-error-text")[0].innerHTML="There is no specimen with Specimen RID: " + id_parameter;
                                } else if (filterData[0]['Species'] !== "Mus musculus") {
                                    // TODO: error handling because only Mouse is supported
                                    document.getElementsByClassName('loader')[0].style.display = "none";
                                    $("#error-message").css("display", "");
                                    $("#alert-error-text")[0].innerHTML="Only specimens of species 'Mus musculus' are supported.<br />Specimen RID: "+id_parameter+", Species: "+(filterData[0] ? filterData[0]['Species'] : "null");
                                } else {
                                    selected_option = ERMrest._renderHandlebarsTemplate(filter.display_text, filterData[0]);
                                    // only add selected option to the list
                                    $el.append($("<option></option>")
                                    .attr("value", selected_option).text(selected_option));
                                    $('#number').val(selected_option);
                                    $("#number").selectmenu("refresh");
                                    $("#number").prop("disabled", true);
                                    $("#number").selectmenu("refresh");

                                    // filter_column_name should be the column name you want for filtering data
                                    columnName = filter.filter_column_name;
                                    // We have a mouse, but there is no filter data for this specimen (stage data)
                                    if (!filterData[0].Ordinal) {
                                        $("#warning-message").css("display", "");
                                        $("#alert-warning-text")[0].innerHTML="Developmental Stage does not exist for Specimen RID : "+id_parameter+". Terms for all stages will be shown instead.";
                                        if (filter.selected_filter.if_empty_id) {
                                            $el.append($("<option></option>")
                                            .attr("value", filter.extra_filter_options[0].values.id)
                                            .text(ERMrest._renderHandlebarsTemplate(filter.display_text, filter.extra_filter_options[0].values)));
                                            $('#number').val(filter.extra_filter_options[0].values.id);
                                            $("#number").selectmenu("refresh");
                                            $("#number").prop("disabled", true);
                                            $("#number").selectmenu("refresh");
                                            filterValue = filter.extra_filter_options[0].values.id;
                                        }
                                    } else {
                                        filterValue = filterData[0][columnName];
                                    }

                                    getValAndBuildData(columnName, filterValue);
                                }
                            }
                        } // end success
                    }); // end ajax
                }); // end forEach
            } else {
                treeviewConfig.filters.forEach(function (filter, idx) {
                    filterUrl = 'https://' + window.location.hostname + ERMrest._renderHandlebarsTemplate(filter.query_pattern, templateParams);
                    var $el = $("#number");
                    $el.empty(); // remove old options

                    var headers = {};
                    headers[ERMrest.contextHeaderName] = getHeader("facet", filter.schema_table);
                    $.ajax({
                        headers: headers,
                        dataType: "json",
                        url: filterUrl,
                        success: function(filterData) {
                            // TODO: remove if statement when we want to support multiple filters
                            if (idx == treeviewConfig.filters.length-1) {
                                // add all options from filter data to list
                                filterData.forEach(function(data, index) {
                                    $el.append($("<option></option>")
                                    .attr("value", data['Ordinal'])
                                    .text(ERMrest._renderHandlebarsTemplate(filter.display_text, data)));
                                });
                                // append extra filter options
                                if (filter.extra_filter_options) {
                                    filter.extra_filter_options.forEach(function (option) {
                                        $el.append($("<option></option>")
                                        .attr("value", option.values.id)
                                        .text(ERMrest._renderHandlebarsTemplate(filter.display_text, option.values)));
                                    });
                                }
                                // select default
                                $('#number').val(filter.selected_filter.default);
                                $("#number").selectmenu("refresh");
                                $("#number").on('selectmenuchange', function() {
                                    $("#warning-message").css("display", "none");
                                    document.getElementsByClassName('loader')[0].style.display = "block";
                                    document.getElementById('jstree').style.visibility = "hidden";
                                    $("#number").prop("disabled", true);
                                    $('#plugins4_q').prop("disabled", true);
                                    $("#search_btn").prop("disabled", true);
                                    $("#expand_all_btn").prop("disabled", true);
                                    $("#collapse_all_btn").prop("disabled", true);
                                    $("#reset_text").prop("disabled", true);

                                    selected_option = $(".ui-selectmenu-text").text();
                                    filterValue = $("#number").val();
                                    columnName = filter.filter_column_name;
                                    getValAndBuildData(columnName, filterValue);
                                });

                                selected_option = $(".ui-selectmenu-text").text();
                                filterValue = $("#number").val();
                                columnName = filter.filter_column_name;
                                getValAndBuildData(columnName, filterValue);
                            }
                        }
                    });
                });
            }

/* ===== End Data Setup ===== */
            setupDomElements();
            // the end of script execution
/* ===== End DOM Setup  ===== */
            // functions defined below assist in data setup and DOM setup

            function setupDomElements() {
                // NOTE: should this always be the last param in treeviewConfig.filters[last].selected_filter.required_url_parameters?
                var idParamName = requiredParams[requiredParams.length-1];
                if (urlParams[idParamName]) {
                    // we have an id param, so make sure the left panel is visible and title is hidden
                    id_parameter = queryParams[idParamName];
                    showAnnotation = true;
                    document.getElementById('left').style.visibility = "visible";
                    document.getElementById('look-up').style.height = "100%";
                    document.getElementById('anatomyHeading').style.display = "none";
                } else {
                    // no id so change the UX to hide the left panel
                    id_parameter = ''
                    showAnnotation = false;
                    document.getElementById('look-up').style.height = "0";
                    $("#right").css('margin-left', '10px');
                    $(".tree-panel").css('width', '99.5%');
                    $("#left").removeClass("col-md-2 col-lg-2 col-sm-2 col-2");
                    $("#right").removeClass("col-md-10 col-lg-10 col-sm-10 col-10");
                    $("#right").addClass("col-md-12 col-lg-12 col-sm-12 col-12");
                    var headingEl = document.getElementById('anatomyHeading');
                    headingEl.style.visibility = "visible";
                    $(headingEl).children("h3")[0].innerHTML = ERMrest._renderHandlebarsTemplate(treeviewConfig.title_markdown_pattern, templateParams);
                }

                // create and configure dropdown menu
                $("#number").selectmenu({
                    appendTo: "#filterDropDown"
                }).selectmenu("menuWidget").addClass("overflow");
                document.getElementById('filterDropDown').style.visibility = "visible";

                // determine if a parent app exists and change state of treeview to accomodate for it
                var appName = urlParams["Parent_App"] || null;
                parentAppExists = appName !== null;

                // make sure search div, expand/collapse, and load icon are visible
                // hide load icon later when data comes back
                document.getElementById('loadIcon').style.visibility = "visible";
                document.getElementById('searchDiv').style.visibility = "visible";
                document.getElementById('expandCollapse').style.visibility = "visible";

                // as tree scrolls, calculate if the back to top button should show
                $(".tree-panel").scroll(function() {
                    $( "#number" ).selectmenu( "close" );
                    if ($(this).scrollTop() > 250) {
                        $(".back-to-top").fadeIn(300);
                    } else {
                        $(".back-to-top").fadeOut(300);
                    }
                });

                // button that apears on bottom right to quickly jump back to the top
                $(".back-to-top").click(function(event) {
                    event.preventDefault();
                    $("html, .tree-panel").animate({
                        scrollTop: 0
                    }, 300);
                });

                // 'X' in warning message
                $(".close").click(function(event) {
                    event.preventDefault();
                    $("#warning-message")[0].style.display = "none";
                });

                // clear search box text
                $("#reset_text").click(function() {
                    document.getElementById('plugins4_q').value = "";
                    $("#jstree").jstree('clear_search');
                });

                $("#search_btn").click(function() {
                    var v = $('#plugins4_q').val();
                    $('#jstree').jstree(true).search(v);
                });

                // expand all nodes, disable other DOM elements while the nodes are being opened
                $("#expand_all_btn").click(function() {
                    disableControls();
                    $("#jstree").jstree('open_all');
                });

                // close all nodes, disable other DOM elements while the nodes are being closed
                $("#collapse_all_btn").click(function() {
                    disableControls();
                    $("#jstree").jstree('close_all');
                });

                // there are currently 4 facet panels for the legend
                $('#look-up .panel-default').toArray().forEach(function(panel, index) {
                    var panelBodySelector = "#facets-" + (index+1);
                    $(panelBodySelector+'-heading').click(function() {
                        $(panelBodySelector).toggleClass('hide-panel');
                        toggleIcon($(panelBodySelector+'-heading > span'));
                    });
                });

                // NOTE: not sure why this is wrapped in a jquery function
                $(function() {
                    $("#plugins4").jstree({
                        "plugins": ["search"]
                    });
                    var to = false;
                    $('#plugins4_q').keyup(function() {
                        if (to) {
                            clearTimeout(to);
                        }
                        to = setTimeout(function() {
                            var v = $('#plugins4_q').val();
                            $('#jstree').jstree(true).search(v);
                        }, 1400);
                    });
                });
            }

            function checkIfSearchItemExists() {
                if ($('#plugins4_q').val() !== '') {
                    var v = $('#plugins4_q').val();
                    $('#jstree').jstree(true).search(v);
                }
            }

            // legend panel setup
            function toggleIcon (el) {
                var innerClass = el[0].className;
                if (innerClass.includes("glyphicon-chevron-down")) {
                    el.removeClass("glyphicon-chevron-down");
                    el.addClass("glyphicon-chevron-right");
                } else if (innerClass.includes("glyphicon-chevron-right")) {
                    el.removeClass("glyphicon-chevron-right");
                    el.addClass("glyphicon-chevron-down");
                }
            }

            // show the loading spinner and hide the tree, disable the rest of the controls
            function disableControls() {
                document.getElementsByClassName('loader')[0].style.display = "visible";
                document.getElementById('jstree').style.visibility = "none";
                $("#number").prop("disabled", true);
                $('#plugins4_q').prop("disabled", true);
                $("#search_btn").prop("disabled", true);
                $("#expand_all_btn").prop("disabled", true);
                $("#collapse_all_btn").prop("disabled", true);
                $("#reset_text").prop("disabled", true);
            }

            // hide loading spinner and show the tree, enable the rest of the controls
            function enableControls() {
                $("#number").prop("disabled", false);
                $('#plugins4_q').prop("disabled", false);
                $("#search_btn").prop("disabled", false);
                $("#expand_all_btn").prop("disabled", false);
                $("#collapse_all_btn").prop("disabled", false);
                $("#reset_text").prop("disabled", false);
                document.getElementsByClassName('loader')[0].style.display = "none";
                document.getElementById('jstree').style.visibility = "visible";
            }

            function showImageModal(image_path, text, event) {
                // stops propagating the click event to the onclick function defined
                event.stopPropagation();
                // stops triggering the event the <a href="..."> tag
                event.preventDefault();

                $(".modal-body > img")[0].src = image_path;
                $("#schematic-title")[0].innerHTML = text;
                $("#schematic-modal").modal('show');
            }

            function buildTreeAndAssignEvents(presentationData) {
                tree = $("div#jstree").jstree({
                    plugins: ["themes", "json", "grid", "search", "sort"],
                    core: {
                        data: presentationData,
                        "themes": {
                            "icons": false
                        }
                    },
                    grid: {
                        columns: [{
                            width: 1000
                        }]
                    },
                    search: {
                        show_only_matches: false,
                        show_only_matches_children: false,
                        close_opened_onclear: true
                    },
                    sort: function(a, b) {
                        // sort based on the base text (attached to nodes before given to jstree)
                        var a_text = this.get_node(a).original.base_text.toLowerCase().trim();
                        var b_text = this.get_node(b).original.base_text.toLowerCase().trim();

                        return a_text > b_text ? 1 : -1;
                    }
                })
                .on('search.jstree', function(e, data) {
                    // after search, if nodes were found, scroll to the first node in the list (may not be the first to appear in the tree. check this?)
                    if (data.nodes.length) {
                        e.preventDefault()
                        setTimeout(function() {
                            var nodeToScrollTo = $('#jstree').jstree(true).get_node(data.nodes[0].id, true).children('.jstree-anchor').get(0);
                            $(".tree-panel")[0].scrollTop = nodeToScrollTo.offsetTop;
                        }, 100);
                    }
                })
                .on('refresh.jstree', function() {
                    checkIfSearchItemExists()
                })
                .on('open_node.jstree', function () {
                    // add the annotated class to all parent nodes of current node that was just opened
                    var tree = $("div#jstree").jstree();

                    // defined here because nodes are destroyed when closed, so need to be reattached on each node being opened
                    // show image preview only on click
                    $(".schematic-popup-icon").click(function(event) {
                        // n_id of the parent node
                        var node = tree.get_node($(this).closest("li")[0].id);
                        showImageModal(node.original.image_path, node.original.base_text, event);
                    });

                    if (annotated_term != "") {
                        // applies the annotated class to ancestors of an annotated descendant that were opened
                        annotated_terms.forEach(function (id) {
                            // get the node
                            var node = tree.get_node(id);

                            // highlight parents
                            // TODO: this might be redundent. Check if function triggers when each aprent is opened too but make sure it doesn't annotate other opened nodes like siblings
                            node.parents.forEach(function (parentId) {
                                if (parentId != '#') {
                                    var parentSelector = "#" + parentId + " > a .display-text";
                                    document.querySelectorAll(parentSelector).forEach(function (el) {
                                        $(el).addClass("annotated");
                                    });
                                }
                            });
                        });

                        /* TOOLTIPS */
                        // once tree has loaded, create tooltips instead of relying on title and hover
                        // tooltips ONLY trigger on click when they are 'disabled', if enabled hover activates them too
                        $(".contains-note").tooltip({
                            trigger: 'click',
                            placement: 'bottom'
                        });

                        $(".contains-note").click(function(event) {
                            var self = $(this);
                            // triggers the toggle functionality
                            self.tooltip();
                        });

                        $(".stop-propagation").click(function(event) {
                            // stops propagating the click event to the onclick function defined
                            event.stopPropagation();
                            // stops triggering the event the <a href="..."> tag
                            event.preventDefault();
                        });
                    }
                })
                .on('open_all.jstree', function() {
                    setTimeout(function() {
                        enableControls();
                    }, 100);
                })
                .on('close_all.jstree', function() {
                    setTimeout(function() {
                        enableControls();
                    }, 100);
                })
                .on('loaded.jstree', function(e, data) {
                    var tree = $("div#jstree").jstree();

                    if(annotated_term != "") {
                        function openNodeAndParents() {
                            annotated_terms.forEach(function (id) {
                                // get the node
                                var node = tree.get_node(id);
                                // open the node
                                if (!node.state.opened) tree.open_node(node);

                                // loop through and open parents
                                node.parents.forEach(function (parentId) {
                                    if (parentId != '#') {
                                        // get parent
                                        var parent = tree.get_node(parentId);
                                        //open parent
                                        if (!parent.state.opened) tree.open_node(parent);
                                    }
                                });
                            });
                        }

                        /* open all annotated terms and their parents (depth first) */
                        /* highlight opened nodes */
                        // highlighting parents is callback on "open_node"
                        openNodeAndParents();

                        /* Scroll to Term */
                        // scroll content to first annotated term
                        var firstTermId = annotated_terms[0];
                        // calculate which term is the highest up in the tree to scroll to
                        // TODO: a similar calculation should be used for search.jstree function wrapper
                        annotated_terms.forEach(function (id) {
                            var currTerm = $("#"+id);
                            var firstTerm = $("#"+firstTermId);
                            if (currTerm[0].offsetTop < firstTerm[0].offsetTop){
                                firstTermId = id;
                            }
                        });
                        setTimeout(function () {
                            // need to know the height of search content area because offsetTop is relative to it's offsetParent (#jstree and it's parent .jstree-grid-wrapper which is sibling of #parent)
                            var searchAreaHeight = $("#parent")[0].offsetHeight;
                            // .tree-panel is the scrollable parent content area
                            $(".tree-panel")[0].scrollTop = tree.get_node(firstTermId, true).children('.jstree-anchor').get(0).offsetTop + searchAreaHeight;
                        }, 0)
                    }
                }); // end registering event listeners for jstree

                enableControls();
                $("a#change").click(function() {
                    var tree = $("div#jstree").jstree(),
                        nodename = tree.get_node("#").children[0],
                        node = tree.get_node(nodename),
                        val = parseInt(node.data.size);

                    node.data.size = node.data.size * 2;
                    tree.trigger("change_node.jstree", nodename);

                    return (false);
                });
            }

            // filterOrderVal is currently the ordinal associated with the stage data. It's used in tree data requests for leq/geq clauses
            function buildPresentationData(showAnnotation, filterOrderVal, id_parameter) {
                var treeURL, isolatedURL, extraAttributesURL;
                var json, isolatedNodes, extraAttributes,
                    presentationData = [];

                // defined inline because of scoped variables
                function getTreeData(queryConfig) {
                    var treeHeaders = {};
                    treeHeaders[ERMrest.contextHeaderName] = getHeader("main", queryConfig.tree_schema_table);
                    $.ajax({
                        headers: treeHeaders,
                        dataType: "json",
                        url: ERMrest._renderHandlebarsTemplate(queryConfig.tree_query, templateParams),
                        success: function(data) {
                            json = data
                        }
                    }).done(function() {
                        var isolatedHeaders = {};
                        isolatedHeaders[ERMrest.contextHeaderName] = getHeader("isolated", queryConfig.isolated_schema_table);
                        $.ajax({
                            headers: isolatedHeaders,
                            dataType: "json",
                            url: ERMrest._renderHandlebarsTemplate(queryConfig.isolated_nodes_query, templateParams),
                            success: function(data) {
                                isolatedNodes = data
                            }
                        }).done(function() {
                            if(id_parameter != '') {
                                extraAttributesURL = 'https://' + window.location.hostname + ERMrest._renderHandlebarsTemplate(treeviewConfig.annotation.annotation_query_pattern, templateParams);
                                var annotationHeaders = {};
                                var params = {}
                                var idx = requiredParams.length-1;
                                params[requiredParams[idx]] = queryParams[requiredParams[idx]];
                                annotationHeaders[ERMrest.contextHeaderName] = getHeader("annotation", treeviewConfig.annotation.schema_table, params);
                                $.ajax({
                                    headers: annotationHeaders,
                                    dataType: "json",
                                    url: extraAttributesURL,
                                    success: function(data) {
                                        extraAttributes = data
                                    }
                                }).done(function() {
                                    refreshOrBuildTree(json, extraAttributes, showAnnotation, isolatedNodes, filterOrderVal)
                                });
                            } else {
                                refreshOrBuildTree(json, [], showAnnotation, isolatedNodes, filterOrderVal)
                            }
                        }); // end isolated nodes query done
                    }); // end tree query done
                }

                // used to compare the current selected filter values to the filter sets defined in the config to determine which queries to use (also defined in the config with each filter set)
                function compareFilters(filterSet) {
                    var matchedFilters = 0;
                    filterSet.forEach(function (filter, index) {
                        var paramName = queryParamNames[index];
                        var paramValue = queryParams[paramName];
                        if (filter == paramValue || filter == "*") matchedFilters++;
                    });

                    return matchedFilters == filterSet.length;
                }

                // iterate over filter sets to figure out which filter set to use
                // last filter set should be generic (aka ["*", "*"])
                for (var j=0; j<treeviewConfig.tree.queries.length; j++){
                    var queryConfig = treeviewConfig.tree.queries[j];
                    if (compareFilters(queryConfig.filter_set)) {
                        getTreeData(queryConfig);
                        break; // can't break out of forEach loop, hence use of for loop instead
                    }
                }
            }

            function refreshOrBuildTree(json, extraAttributes, showAnnotation, isolatedNodes, filterOrderVal) {
                // there's no tree data
                if (!json || json.length == 0) {
                    $(".loader")[0].style.display = "none";
                    $("#warning-message").css("display", "");
                    $("#alert-warning-text")[0].innerHTML="No tree data for the current Developmental Stage : "+selected_option+".";
                    return;
                }

                if (showAnnotation == false) {
                    forest = processData(json, [], showAnnotation, isolatedNodes);
                } else {
                    forest = processData(json, extraAttributes, showAnnotation, isolatedNodes);
                }
                var presentationData = [];
                forest.trees.forEach(function (tree) {
                    presentationData.push(tree.node);
                });
                var finalData = buildTree(presentationData);
                console.log("**END**");
                if (filterOrderVal != "" && ($('#jstree').jstree(true) != false)) {
                    $('#jstree').jstree(true).settings.core.data = finalData;
                    $('#jstree').jstree(true).refresh();
                    enableControls();
                } else {
                    buildTreeAndAssignEvents(finalData)
                }
            }

            var nid = 0;
            function removeParent(presentationData) {

                if (presentationData.children.length == 0) {
                    presentationData['type'] = 'file';
                }
                for (var c = 0; c < presentationData.children.length; c++) {
                    presentationData['type'] = 'folder';
                    // id is already set, so we encountered this child already
                    // deep copy child and replace so id instances are separate
                    if (presentationData.children[c].li_attr && presentationData.children[c].li_attr.id) {
                        presentationData.children[c] = jQuery.extend(true, {}, presentationData.children[c]);
                    }
                    removeParent(presentationData.children[c]);
                }
                presentationData.li_attr = {
                    id: "nid_" + nid++
                }

                // keep track of the ids of annotated terms for expansion later
                if (presentationData.annotated) annotated_terms.push(presentationData.li_attr.id);
                delete presentationData.parent;
            }

            function buildTree(presentationData) {
                for (var z = 0; z < presentationData.length; z++) {
                    removeParent(presentationData[z]);
                }
                return presentationData;
            }

            function processData(data, extraAttributes, showAnnotation, isolatedNodes) {
                var extraAttributesConfig = treeviewConfig.annotation.extra_attributes_icons;
                // creates the column data from the supplied id and text and attaches that data to the obj provided
                function createColumnData(id, text, image) {
                    var beforeIcons = [],
                        afterIcons  = [];

                    templateParams.$node_id = ERMrest._fixedEncodeURIComponent(id);
                    var obj = {
                        parent: [],
                        children: [],
                        dbxref: id,
                        base_text: text,
                        image_path: image,
                        a_attr: {
                            'href': ERMrest._renderHandlebarsTemplate(treeviewConfig.tree.click_event_callback, templateParams),
                            'style': 'display:inline;'
                        }
                    };
                    var specimen_expression_annotations = extraAttributes.find(function(attrs) {
                            return attrs.Region == id
                        });

                    var cameraIcon = image ? createCameraElement(image) : "";
                    if (showAnnotation && typeof specimen_expression_annotations != 'undefined') {
                        if (annotated_term == "") annotated_term = text;
                        // create icons and assign them to before or after arrays
                        Object.keys(extraAttributesConfig).forEach(function (key) {
                            var icon = generateIcon(extraAttributesConfig[key], key, specimen_expression_annotations);

                            if (icon) extraAttributesConfig[key].before_text ? beforeIcons.push(icon) : afterIcons.push(icon);
                        });

                        // generate HTML that should appear in front of ndoe text
                        var beforeIconsHTML = "";
                        beforeIcons.forEach(function (icon, index) {
                            beforeIconsHTML += (index == 0 ? "" : " ") + icon;
                        });

                        // generate HTML that should appear after node text
                        var afterIconsHTML = "";
                        afterIcons.forEach(function (icon) {
                            afterIconsHTML += " " + icon;
                        });
                        obj.annotated = true;
                        obj.text = "<span><span class='stop-propagation'>"+beforeIconsHTML+"</span><span class='annotated display-text'>"+text+" ("+id+") </span> <span class='stop-propagation'>"+afterIconsHTML+cameraIcon+"</span></span>";
                    } else {
                        obj.annotated = false;
                        obj.text = "<span><span class='display-text'>"+text+" ("+id+") </span> "+cameraIcon+"</span>"
                    }

                    return obj;
                }

                // create column data for first extra attributes parent
                var parent = createColumnData(data[0].parent_id, data[0].parent, data[0].parent_image);

                // create column data for first extra attributes child
                var child = createColumnData(data[0].child_id, data[0].child, data[0].child_image);

                var forest = new Forest(parent);
                var tree1 = new Tree(child); // NOTE: tree1 is not used, but the Tree constructor registers the onclick event
                parent.children.push(child);
                child.parent.push(parent);
                forest.trees.push(new Tree(parent));

                // Get all isolated nodes as parent nodes
                isolatedNodes.forEach(function (node) {
                    var isolatedNode = createColumnData(node.dbxref, node.name, node.image);
                    isolatedNode.li_attr = {
                        "class": "jstree-leaf"
                    }

                    forest.trees.push(new Tree(isolatedNode));
                });

                data.forEach(function (datum, index) {
                    if (index == 0) return;

                    // create column data for the ith extra attributes parent
                    var parent = createColumnData(datum.parent_id, datum.parent, datum.parent_image);

                    // create column data for the ith extra attributes child
                    var child = createColumnData(datum.child_id, datum.child, datum.child_image);

                    var tree1 = new Tree(child); // NOTE: tree1 is not used, but the Tree constructor registers the onclick event
                    parent.children.push(child);
                    child.parent.push(parent);
                    var parentNode = false;
                    var childNode = false;
                    var childIndex = -1;
                    var parentIndex = -1;

                    // search through the whole tree and determine if a parent or child node can be found
                    forest.trees.forEach(function (tree, idx) {
                        // find if a node relationship exists (multiple can but we care about one because the rest will be trimmed)
                        if (!parentNode) {
                            parentNode = tree.contains(tree, parent.dbxref);
                            if (parentNode) parentIndex = idx;
                        }
                        // find if a node relationship exists (multiple can but we care about one because the rest will be trimmed)
                        if (!childNode) {
                            childNode = tree.contains(tree, child.dbxref);
                            if (childNode) childIndex = idx;
                        }
                    });

                    // determine if the node exists yet
                    if (!parentNode && !childNode) {
                        forest.trees.push(new Tree(parent));
                    } else if (parentNode && !childNode) {
                        // parent node exist, add child to parent node
                        parentNode.children.push(child);
                    } else if (!parentNode && childNode) {
                        // child node exist, add parent to child node
                        // delete child from the forest as child is no longer root
                        parent.children.pop();
                        parent.children.push(childNode);
                        childNode.parent.push(parent);
                        jloop:
                        for (var t = 0; t < forest.trees.length; t++) {
                            if (forest.trees[t].node.dbxref == childNode.dbxref) {
                                forest.trees.splice(t, 1);
                                break jloop;
                            }
                        }
                        forest.trees.push(new Tree(parent));
                    } else if (parentNode && childNode) {
                        // child and parent node, both are present then add child to parent
                        // and remove the child from the forest
                        parentNode.children.push(childNode);
                        ploop:
                        for (var q = 0; q < forest.trees.length; q++) {
                            if (forest.trees[q].node.dbxref == childNode.dbxref) {
                                forest.trees.splice(q, 1);
                                break ploop;
                            }
                        }
                    }
                });

                // there are no annotated terms but there is a specimen
                if (annotated_term == "" && id_parameter) {
                   // no annotated terms and a specimen ID, show warning
                   $(".loader")[0].style.display = "none";
                   $("#warning-message").css("display", "");
                   $("#alert-warning-text")[0].innerHTML="No annotated terms for the given specimen.";
               } else {
                   return (forest);
               }

            }

            // generic function to generate annotated icons based on config
            function generateIcon(iconConfig, key, values) {
                var value = values[key];
                // if the labels set is a string, return that string (should be a path to an icon)
                if (typeof iconConfig.labels == "string") return generateIconHTML(iconConfig.labels, iconConfig.has_tooltip, key, value);

                // if no value from the data, use "default" as the value
                if (!value && iconConfig.labels.default) value = "default";
                var iconPath = iconConfig.labels[value];
                // if we get a string, return, else recurse (it should be an object again)
                if (typeof iconPath == "string" || !iconPath) {

                    return generateIconHTML(iconPath, iconConfig.has_tooltip, key, value);
                }

                var nestedKey = Object.keys(iconPath)[0];
                return generateIcon(iconPath[nestedKey], nestedKey, values);
            }

            // after an icon path has been chosen, create the html element
            function generateIconHTML(path, hasTooltip, key, value) {
                if (!path || !value) return null;
                var html = "<img src='" + path + "'";
                if (hasTooltip) {
                    // tooltip is available, value will be the tooltip
                    html += " class='contains-note' title='"+key+": "+value+"'";
                } else {
                    // there's no click event
                    html += " class='no-click-events'";
                }
                return html + "></img>";
            }

            function createCameraElement(imageUrl) {
                // preloads the image
                (new Image()).src = imageUrl;
                return '<span class="schematic-popup-icon"><img src="resources/images/camera-icon.png"></img></span>'
            }

            function nodeClickCallback(node) {
                var sourceObject = '{ "id": "' + node.dbxref + '", "name": "' + node.base_text + '" }';
                return 'parent.setSourceForFilter(' + sourceObject + ');';
            }

            // Queue object/class constructor
            function Queue() {
                var a = [],
                b = 0;
                this.getLength = function() {
                    return a.length - b
                };
                this.isEmpty = function() {
                    return 0 == a.length
                };
                this.enqueue = function(b) {
                    a.push(b)
                };
                this.dequeue = function() {
                    // as long as not empty
                    if (a.length != 0) {
                        var c = a[b];
                        2 * ++b >= a.length && (a = a.slice(b), b = 0);
                        return c
                    }
                };
                this.peek = function() {
                    return 0 < a.length ? a[b] : void 0
                }
            };

            function Forest(node) {
                var tree = new Tree(node);
                this.trees = [];
            }

            // Tree object/class constructor
            function Tree(node) {
                var s = node.a_attr;
                if (parentAppExists) {
                    // assuming Parent_App is booleanSearch
                    s["onClick"] = nodeClickCallback(node);
                } else {
                    // TODO: this function should be exposed as public in ermrestJS
                    templateParams.$node_id = ERMrest._fixedEncodeURIComponent(node.dbxref);
                    var l = "'" + ERMrest._renderHandlebarsTemplate(treeviewConfig.tree.click_event_callback, templateParams) + "','_blank'";
                    s["onClick"] = "window.open(" + l + ");";
                }
                // properties stored under "original" property on jstree_node object
                var newNode = {
                    text: node.text,
                    dbxref: node.dbxref,
                    annotated: node.annotated,
                    base_text: node.base_text,
                    image_path: node.image_path,
                    children: node.children,
                    parent: node.parent,
                    a_attr: s,
                    li_attr: node.li_attr
                };
                this.node = newNode;
            }

            // functions for the tree object/class
            // returns FIRST matching node
            Tree.prototype.traverseBF = function(dbxref) {
                var queue = new Queue();
                queue.enqueue(this.node);
                currentNode = queue.dequeue();

                while (currentNode) {
                    for (var i = 0; i < currentNode.children.length; i++) {
                        queue.enqueue(currentNode.children[i]);
                    }
                    if (currentNode.dbxref == dbxref) return currentNode;
                    currentNode = queue.dequeue();
                }
            };

            Tree.prototype.contains = function(tree, dbxref) {
                return tree.traverseBF(dbxref);
            };

            Tree.prototype.add = function(data, toData, traversal) {
                var child = {
                    text: data,
                    children: [],
                    parent: [],
                    callback: function(node) {
                        if (node.text === toData.text) {
                            parent = node;
                        }
                    }
                };
                this.contains(child.callback, traversal);
                if (parent) {
                    parent.children.push(child);
                    child.parent = parent;
                } else {
                    throw new Error('Cannot add node to a non-existent parent.');
                }
            };
        }); // end of ERMrest.onload
    }); // end of document ready
})()
