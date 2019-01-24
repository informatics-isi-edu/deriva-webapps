(function() {
    $(document).ready(function() {
        // jstree, jquery, ermrestJS, q (promise library) each expose a module that's available in the execution environment
        // console.log(jstree);
        // console.log($);
        // console.log(ERMrest);
        // console.log(Q);

        ERMrest.configure(null, Q);

        ERMrest.onload().then(function () {
            var showAnnotation, filter_prefix, id_parameter, filterUrl, filterValue, columnName;
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

            // NOTE: refactor into 2 sections:
            //  - parameter extraction and data setup
            //  - component setup using selectors

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

            // console.log("url param names: ", urlParamNames);
            // console.log("url param values: ", urlParams);
            // console.log("required param names: ", requiredParams);
            // console.log("query param names: ", queryParamNames);
            // console.log("query param values: ", queryParams);

            templateParams.$url_parameters = queryParams;

            console.log(templateParams);

            // NOTE: should this always be the last param in treeviewConfig.filters[last].selected_filter.required_url_parameters?
            var idParamName = requiredParams[requiredParams.length-1];
            if (urlParams[idParamName]) {
                id_parameter = queryParams[idParamName];
                showAnnotation = true;
                document.getElementById('left').style.visibility = "visible";
                document.getElementById('look-up').style.height = "100%";
                document.getElementById('anatomyHeading').style.display = "none";
            } else {
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

            // determine if a parent app exists and change state of treeview to accomodate for it
            var appName = urlParams["Parent_App"] || null;
            parentAppExists = appName !== null;

            document.getElementById('loadIcon').style.visibility = "visible";
            $("#number").selectmenu({
                appendTo: "#filterDropDown"
            }).selectmenu("menuWidget").addClass("overflow");
            document.getElementById('filterDropDown').style.visibility = "visible";
            document.getElementById('mainDiv').style.visibility = "visible";
            document.getElementById('expand-collapse').style.visibility = "visible";

            var offset = 250;
            var duration = 300;
            var location = window.location.href;
            // TODO: is this still necessary
            if (location.indexOf("prefix_filter=") !== -1) {
                var prefix_filter_value = findGetParameter('prefix_filter')
                filter_prefix = prefix_filter_value;
            } else {
                filter_prefix = "";
            }

            $(".tree-panel").scroll(function() {
                $( "#number" ).selectmenu( "close" );
                if ($(this).scrollTop() > offset) {
                    $(".back-to-top").fadeIn(duration);
                } else {
                    $(".back-to-top").fadeOut(duration);
                }
            });
            $(".back-to-top").click(function(event) {
                event.preventDefault();
                $("html, .tree-panel").animate({
                    scrollTop: 0
                }, duration);
                // is this needed?
                return false;
            })
            // 'X' in warning message
            $(".close").click(function(event) {
                event.preventDefault();
                $("#warning-message")[0].style.display = "none";
            });
            // if selected_filter in config and said identifier is present in url
            if(showAnnotation == true) {
                treeviewConfig.filters.forEach(function (filter, idx) {
                    // need to account for filter data
                    var queryPattern = filter.selected_filter.selected_query_pattern || filter.query_pattern
                    filterUrl = 'https://' + window.location.hostname + ERMrest._renderHandlebarsTemplate(queryPattern, templateParams);
                    var $el = $("#number");
                    $el.empty();
                    // ERMrest._http.get(filterUrl)
                    $.getJSON(filterUrl, function(filterData) {
                        // TODO: remove if statement when we want to support multiple filters
                        if (idx == treeviewConfig.filters.length-1) {
                            // TODO: error handling because only Mouse is supported
                            if (!filterData[0] || filterData[0]['Species'] !== "Mus musculus") {
                                document.getElementsByClassName('loader')[0].style.display = "none";
                                document.getElementsByClassName('error')[0].style.visibility = "visible";
                                document.getElementsByTagName("p")[0].innerHTML="Error: Only specimens of species, 'Mus musculus', are supported.<br />Specimen RID: "+id_parameter+", Species: "+(filterData[0] ? filterData[0]['Species'] : "null");
                            } else {
                                var selected_option = ERMrest._renderHandlebarsTemplate(filter.display_text, filterData[0]);
                                // only add selected option to the list
                                $el.append($("<option></option>")
                                .attr("value", selected_option).text(selected_option));
                                $('#number').val(selected_option);
                                $("#number").selectmenu("refresh");
                                $("#number").prop("disabled", true);
                                $("#number").selectmenu("refresh");
                                // We have a mouse, but there is no filter data for this specimen (stage data)
                                if (filterData === undefined || filterData.length == 0) {
                                    $(".loader")[0].style.display = "none";
                                    $("#warning-message").css("display", "");
                                    $("#alert-warning-text")[0].innerHTML="Developmental Stage does not exist for Specimen RID : "+id_parameter;
                                }

                                // filter_column_name should be the column name you want for filtering data
                                columnName = filter.filter_column_name;
                                filterValue = filterData[0][columnName];

                                templateParams.$filters[columnName] = filterValue;
                                queryParams[columnName] = filterValue;
                                buildPresentationData(showAnnotation, filter_prefix, filterValue, id_parameter)
                            }
                        }
                    }); // end getJSON
                }); // end forEach
            } else {
                /**
                 * Vocabulary:Developmental_Stage:Species is a foreign key to Vocabulary:Species:ID which have the following values
                 * the below is in the format of (Vocabulary:Species:ID = Vocabulary:Species:Name)
                 * "NCBITaxon:9606"   = "Homo sapiens"
                 * "NCBITaxon:10090"  = "Mus musculus"
                 * "NCBITaxon:7955"   = "Danio rerio"
                 * "NCBITaxon:9598"   = "Pan troglodytes"
                 **/
                // Change Species to be a join on Vocab:Species
                // filterUrl = 'https://'+window.location.hostname+'/ermrest/catalog/2/attributegroup/M:=Vocabulary:Developmental_Stage/species:=(Species)=(Vocabulary:Species:ID)/species:Name=Mus%20musculus/id:=M:Name,M:Ordinal,M:Name,M:Approximate_Equivalent_Age@sort(Ordinal)';

                function getValAndBuildData() {
                    filterValue = $("#number").val();
                    columnName = filter.filter_column_name;

                    templateParams.$filters[columnName] = filterValue;
                    // filter_column_name should be the column name you want for filtering data
                    queryParams[columnName] = filterValue;
                    buildPresentationData(showAnnotation, filter_prefix, filterValue, id_parameter);
                }

                // TODO: this shouldn't be hardcoded to filters[1]
                treeviewConfig.filters.forEach(function (filter, idx) {
                    filterUrl = 'https://' + window.location.hostname + ERMrest._renderHandlebarsTemplate(filter.query_pattern, templateParams);
                    var $el = $("#number");
                    $el.empty(); // remove old options
                    $.getJSON(filterUrl, function(filterData) {
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
                            $('#number').val(filter.default_id);
                            $("#number").selectmenu("refresh");
                            // TODO: register event for dropdown menu. could go somewhere else?
                            $("#number").on('selectmenuchange', function() {
                                document.getElementsByClassName('loader')[0].style.display = "block";
                                document.getElementById('jstree').style.visibility = "hidden";
                                $("#number").prop("disabled", true);
                                $('#plugins4_q').prop("disabled", true);
                                $("#search_btn").prop("disabled", true);
                                $("#expand_all_btn").prop("disabled", true);
                                $("#collapse_all_btn").prop("disabled", true);
                                $("#reset_text").prop("disabled", true);

                                getValAndBuildData();
                            });

                            getValAndBuildData();
                        }
                    });
                });
            }

            function setupDomElements() {
                
            }
            $("#reset_text").click(function() {
                document.getElementById('plugins4_q').value = "";
                $("#jstree").jstree('clear_search');
            })

            $("#search_btn").click(function() {
                var v = $('#plugins4_q').val();
                $('#jstree').jstree(true).search(v);
            })
            $("#expand_all_btn").click(function() {
                document.getElementsByClassName('loader')[0].style.display = "visible";
                document.getElementById('jstree').style.visibility = "none";
                $("#number").prop("disabled", true);
                $('#plugins4_q').prop("disabled", true);
                $("#search_btn").prop("disabled", true);
                $("#expand_all_btn").prop("disabled", true);
                $("#collapse_all_btn").prop("disabled", true);
                $("#reset_text").prop("disabled", true);
                $("#jstree").jstree('open_all');
            })
            $("#collapse_all_btn").click(function() {
                document.getElementsByClassName('loader')[0].style.display = "visible";
                document.getElementById('jstree').style.visibility = "none";
                $("#number").prop("disabled", true);
                $('#plugins4_q').prop("disabled", true);
                $("#search_btn").prop("disabled", true);
                $("#expand_all_btn").prop("disabled", true);
                $("#collapse_all_btn").prop("disabled", true);
                $("#reset_text").prop("disabled", true);
                $("#jstree").jstree('close_all');
            })

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

            // there are currently 4 facet panels for the legend
            $('#look-up .panel-default').toArray().forEach(function(panel, index) {
                var panelBodySelector = "#facets-" + (index+1);
                $(panelBodySelector+'-heading').click(function() {
                    $(panelBodySelector).toggleClass('hide-panel');
                    toggleIcon($(panelBodySelector+'-heading > span'));
                });
            });

            function checkIfSearchItemExists() {
                if ($('#plugins4_q').val() !== '') {
                    var v = $('#plugins4_q').val();
                    $('#jstree').jstree(true).search(v);
                }
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
                        var a_text = this.get_node(a).original.base_text.toLowerCase();
                        var b_text = this.get_node(b).original.base_text.toLowerCase();

                        return a_text > b_text ? 1 : -1;
                    }
                })
                .on('search.jstree', function(e, data) {
                    // after search, if nodes were found, scroll to the first node in the list (may not be the first to appear in the tree. check this?)
                    if (data.nodes.length) {
                        e.preventDefault()
                        setTimeout(function() {
                            $('#jstree').jstree(true).get_node(data.nodes[0].id, true).children('.jstree-anchor').get(0).scrollIntoView();
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
                    function showImageModal(image_path, text, event) {
                        // stops propagating the click event to the onclick function defined
                        event.stopPropagation();
                        // stops triggering the event the <a href="..."> tag
                        event.preventDefault();

                        $(".modal-body > img")[0].src = image_path;
                        $("#schematic-title")[0].innerHTML = text;
                        $("#schematic-modal").modal('show');
                    }

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
                            // stops propagating the click event to the onclick function defined
                            event.stopPropagation();
                            // stops triggering the event the <a href="..."> tag
                            event.preventDefault();
                            self.tooltip('show');
                            setTimeout(function () {
                                self.tooltip('hide');
                            }, 5000)
                        });
                    }
                })
                .on('open_all.jstree', function() {
                    setTimeout(function() {
                        $("#number").prop("disabled", false);
                        $('#plugins4_q').prop("disabled", false);
                        $("#search_btn").prop("disabled", false);
                        $("#expand_all_btn").prop("disabled", false);
                        $("#collapse_all_btn").prop("disabled", false);
                        $("#reset_text").prop("disabled", false);
                        document.getElementsByClassName('loader')[0].style.display = "none";
                        document.getElementById('jstree').style.visibility = "visible";
                    }, 100);
                })
                .on('close_all.jstree', function() {
                    setTimeout(function() {
                        $("#number").prop("disabled", false);
                        $('#plugins4_q').prop("disabled", false);
                        $("#search_btn").prop("disabled", false);
                        $("#expand_all_btn").prop("disabled", false);
                        $("#collapse_all_btn").prop("disabled", false);
                        $("#reset_text").prop("disabled", false);
                        document.getElementsByClassName('loader')[0].style.display = "none";
                        document.getElementById('jstree').style.visibility = "visible";
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
                    } else if (id_parameter) {
                        // no annotated terms and a specimen ID, show warning
                        $(".loader")[0].style.display = "none";
                        $("#warning-message").css("display", "");
                        $("#alert-warning-text")[0].innerHTML="No annotated terms for the given specimen.";
                    }
                })
                document.getElementsByClassName('loader')[0].style.display = "none";
                document.getElementById('jstree').style.visibility = "visible";
                $("#number").prop("disabled", false);
                $('#plugins4_q').prop("disabled", false);
                $("#search_btn").prop("disabled", false);
                $("#expand_all_btn").prop("disabled", false);
                $("#collapse_all_btn").prop("disabled", false);
                $("#reset_text").prop("disabled", false);
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
            function buildPresentationData(showAnnotation, prefixVal, filterOrderVal, id_parameter) {
                var treeURL, isolatedURL, extraAttributesURL;
                var json, isolatedNodes, extraAttributes,
                    presentationData = [];

                // defined inline because of scoped variables
                function getTreeData(treeDataURL, isolatedNodesURL) {
                    $.getJSON(treeDataURL, function(data) {
                        json = data
                    }).done(function() {
                        $.getJSON(isolatedNodesURL, function(data) {
                            isolatedNodes = data
                        }).done(function() {
                            if(id_parameter != '') {
                                // use variable template replacement to fill in the URI pattern
                                extraAttributesURL = 'https://' + window.location.hostname + ERMrest._renderHandlebarsTemplate(treeviewConfig.annotation.annotation_query_pattern, templateParams);
                                $.getJSON(extraAttributesURL, function(data) {
                                    extraAttributes = data
                                }).done(function() {
                                    refreshOrBuildTree(json, extraAttributes, showAnnotation, isolatedNodes, prefixVal, filterOrderVal)
                                })
                            }
                            else {
                                refreshOrBuildTree(json, [], showAnnotation, isolatedNodes, prefixVal, filterOrderVal)
                            }
                        })
                    });
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

                // Returns json - Query 1 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/M:=Vocabulary:Anatomy_Part_Of/F1:=left(subject_dbxref)=(Anatomy_terms:dbxref)/$M/F2:=left(object_dbxref)=(Anatomy_terms:dbxref)/$M/subject_dbxref:=M:subject_dbxref,object_dbxref,subject:=F1:name,object:=F2:name
                // Returns extraAttributes - Query 2 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/M:=Gene_Expression:Specimen_Expression/RID=Q-PQ16/$M/RID:=M:RID,Region:=M:Region,strength:=M:Strength,pattern:=M:Pattern,density:=M:Density,densityChange:=M:Density_Direction,densityNote:=M:Density_Note
                // Returns isolated nodes - Query 3 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/t:=Vocabulary:Anatomy_terms/s:=left(dbxref)=(Vocabulary:Anatomy_Part_Of:subject_dbxref)/subject_dbxref::null::/$t/o:=left(dbxref)=(Vocabulary:Anatomy_Part_Of:object_dbxref)/object_dbxref::null::/$t/dbxref:=t:dbxref,name:=t:name

                // iterate over filter sets to figure out which filter set to use
                // last filter set should be generic (aka ["*", "*"])
                for (var j=0; j<treeviewConfig.tree.queries.length; j++){
                    var queryConfig = treeviewConfig.tree.queries[j];
                    if (compareFilters(queryConfig.filter_set)) {
                        treeURL = ERMrest._renderHandlebarsTemplate(queryConfig.tree_query, templateParams);
                        isolatedURL = ERMrest._renderHandlebarsTemplate(queryConfig.isolated_nodes_query, templateParams);
                        getTreeData(treeURL, isolatedURL);
                        break; // can't break out of forEach loop, hence use of for loop instead
                    }
                }
            }

            function refreshOrBuildTree(json, extraAttributes, showAnnotation, isolatedNodes, prefixVal, filterOrderVal) {
                if (showAnnotation == false) {
                    forest = processData(json, [], showAnnotation, isolatedNodes, prefixVal);
                } else {
                    forest = processData(json, extraAttributes, showAnnotation, isolatedNodes, prefixVal);
                }
                var presentationData = [];
                for (var g = 0; g < forest.trees.length; g++) {
                    presentationData.push(forest.trees[g].node);
                }
                var finalData = buildTree(presentationData);
                console.log("**END**");
                if (filterOrderVal != "" && ($('#jstree').jstree(true) != false)) {
                    $('#jstree').jstree(true).settings.core.data = finalData;
                    $('#jstree').jstree(true).refresh();
                    document.getElementsByClassName('loader')[0].style.display = "none";
                    document.getElementById('jstree').style.visibility = "visible";
                    $("#number").prop("disabled", false);
                    $('#plugins4_q').prop("disabled", false);
                    $("#search_btn").prop("disabled", false);
                    $("#expand_all_btn").prop("disabled", false);
                    $("#collapse_all_btn").prop("disabled", false);
                    $("#reset_text").prop("disabled", false);
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

            function processData(data, extraAttributes, showAnnotation, isolatedNodes, prefixVal) {
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
                        beforeIcons.forEach(function (icon) {
                            beforeIconsHTML += icon;
                        });

                        // generate HTML that should appear after node text
                        var afterIconsHTML = "";
                        afterIcons.forEach(function (icon) {
                            afterIconsHTML += icon;
                        });
                        obj.annotated = true;
                        obj.text = "<span>"+beforeIconsHTML+"<span class='annotated display-text'>"+text+" ("+id+") </span>"+afterIconsHTML+cameraIcon+"</span>";
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
                if ((prefixVal != "" && parent.dbxref.startsWith("UBERON") == false) || prefixVal == "") {
                    var tree = new Tree(parent);
                    if (child.dbxref.startsWith("UBERON") == false) {
                        var tree1 = new Tree(child);
                        parent.children.push(child);
                        child.parent.push(parent);
                    }
                    forest.trees.push(tree);
                }
                // Get all isolated nodes as parent nodes

                for (var j = 0; j < isolatedNodes.length; j++) {
                    var isolatedNodeImage = isolatedNodes[j].image ? createCameraElement(isolatedNodes[j].image) : "" ;
                    templateParams.$node_id = ERMrest._fixedEncodeURIComponent(isolatedNodes[j].dbxref);
                    var isolatedNode = {
                        text: "<span>" + isolatedNodes[j].name + " (" + isolatedNodes[j].dbxref + ") " + isolatedNodeImage + "</span>",
                        parent: [],
                        children: [],
                        dbxref: isolatedNodes[j].dbxref,
                        base_text: isolatedNodes[j].name,
                        image_path: isolatedNodes[j].image,
                        a_attr: {
                            'href': ERMrest._renderHandlebarsTemplate(treeviewConfig.tree.click_event_callback, templateParams),
                            'style': 'display:inline;'
                        },
                        li_attr: {
                            "class": "jstree-leaf"
                        }
                    };
                    if ((prefixVal != "" && isolatedNode.dbxref.startsWith("UBERON") == false) || prefixVal == "") {
                        var tree = new Tree(isolatedNode);
                        forest.trees.push(tree);
                    }
                }

                for (var i = 1; i < data.length; i++) {
                    // create column data for the ith extra attributes parent
                    var parent = createColumnData(data[i].parent_id, data[i].parent, data[i].parent_image);

                    // create column data for the ith extra attributes child
                    var child = createColumnData(data[i].child_id, data[i].child, data[i].child_image);

                    if ((prefixVal != "" && parent.dbxref.startsWith("UBERON") == false) || prefixVal == "") {
                        var tree = new Tree(parent);
                        if ((prefixVal != "" && child.dbxref.startsWith("UBERON") == false) || prefixVal == "") {
                            var tree1 = new Tree(child);
                            parent.children.push(child);
                            child.parent.push(parent);
                        }
                    }
                    var parentNode = false;
                    var childNode = false;
                    var childIndex = -1;
                    var parentIndex = -1;
                    for (var f = 0; f < forest.trees.length; f++) {
                        var tree = forest.trees[f];

                        // find if a node relationship exists (multiple can but we care about one because the rest will be trimmed)
                        if (!parentNode) {
                            parentNode = tree.contains(tree, parent.dbxref);
                            if (parentNode) parentIndex = f;
                        }
                        // find if a node relationship exists (multiple can but we care about one because the rest will be trimmed)
                        if (!childNode) {
                            childNode = tree.contains(tree, child.dbxref);
                            if (childNode) childIndex = f;
                        }
                    }

                    if (!parentNode && !childNode) {
                        if ((prefixVal != "" && parent.dbxref.startsWith("UBERON") == false) || prefixVal == "") {
                            var tree = new Tree(parent);
                            forest.trees.push(tree);
                        }
                    }
                    //parent node exist, add child to parent node
                    else if (parentNode && !childNode) {
                        if ((prefixVal != "" && child.dbxref.startsWith("UBERON") == false) || prefixVal == "") {
                            parentNode.children.push(child);
                        }
                    }
                    //child node exist, add parent to child node
                    //delete child from the forest as child is no longer root
                    else if (!parentNode && childNode) {
                        if ((prefixVal != "" && parent.dbxref.startsWith("UBERON") == false) || prefixVal == "") {
                            parent.children.pop();
                            parent.children.push(childNode);
                            childNode.parent.push(parent);
                            tree = new Tree(parent);
                            jloop:
                            for (var t = 0; t < forest.trees.length; t++) {
                                if (forest.trees[t].node.dbxref == childNode.dbxref) {
                                    forest.trees.splice(t, 1);
                                    break jloop;
                                }
                            }
                            forest.trees.push(tree);
                        }
                    }
                    //child and parent node, both are present then add child to parent
                    //and remove the child form the forest
                    else if (parentNode && childNode) {
                        parentNode.children.push(childNode);
                        ploop:
                        for (var q = 0; q < forest.trees.length; q++) {
                            if (forest.trees[q].node.dbxref == childNode.dbxref) {
                                forest.trees.splice(q, 1);
                                break ploop;
                            }
                        }
                    }
                }  // end for loop over data

                return (forest);

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

            // Tree object/class constructor
            function Tree(node) {
                var s = node.a_attr;
                if (parentAppExists) {
                    // assuming Parent_App is booleanSearch
                    s["onClick"] = nodeClickCallback(node);
                // } else if (treeviewConfig.tree.click_event === "redirect") {
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
            var tress = [];

            function Forest(node) {
                var tree = new Tree(node);
                this.trees = [];
            }

            // generic function to generate annotated icons based on config
            function generateIcon(iconConfig, key, values) {
                var value = values[key];
                // if the labels set is a string, return that string (should be a path to an icon)
                if (typeof iconConfig.labels == "string") return generateIconHTML(iconConfig.labels, iconConfig.has_tooltip, key, value);

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
                if (!path) return null;
                var html = "<img src='" + path + "'";
                // attach tooltip is available, value will be the tooltip
                if (hasTooltip) html += " class='contains-note' title='"+key+": "+value+"'";
                return html + "></img>";
            }

            function createCameraElement(imageUrl) {
                // image_hash
                // preloads the image
                (new Image()).src = imageUrl;
                return '<span class="schematic-popup-icon"><img src="resources/images/camera-icon.png"></img></span>'
            }

            function nodeClickCallback(node) {
                var sourceObject = '{ "id": "' + node.dbxref + '", "name": "' + node.base_text + '" }';
                return 'parent.setSourceForFilter(' + sourceObject + ');';
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

            // TODO: what is this doing? Should it be moved to other "setup functions"?
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

            function findGetParameter(parameterName) {
                return urlParams[parameterName];
            }
        }); // end of ERMrest.onload
    }); // end of document ready
})()
