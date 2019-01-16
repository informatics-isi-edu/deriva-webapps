var annotated_term  = "";
var annotated_terms = [];
var image_hash = {};
(function() {
    $(document).ready(function() {
        // jstree, jquery, ermrestJS, q (promise library) each expose a module that's available in the execution environment
        // console.log(jstree);
        // console.log($);
        // console.log(ERMrest);
        // console.log(Q);

        ERMrest.configure(null, Q);

        ERMrest.onload().then(function () {
            var JSONData, showAnnotation, filter_prefix, isCacheEnabled, cacheData, id_parameter, filterUrl, filterValue;

            /*** For Handlebars templating ***/
            // Example of how it works, actually super simple
            // console.log(ERMrest._renderHandlebarsTemplate("John says {{{John}}}", {John: "hello"}));

            // NOTE: refactor into 2 sections:
            //  - parameter extraction and data setup
            //  - component setup using selectors

            // TODO: refactor into get all URL params
            // var queryParams = stripQueryParams();
            if (window.location.href.indexOf("Specimen_RID=") !== -1) {
                id_parameter = findGetParameter('Specimen_RID')
                showAnnotation = true;
                document.getElementById('left').style.visibility = "visible";
                document.getElementById('look-up').style.height = "100%";
                document.getElementById('mouseAnatomyHeading').style.display = "none";
            } else {
                id_parameter = ''
                showAnnotation = false;
                document.getElementById('look-up').style.height = "0";
                $("#right").css('margin-left', '10px');
                $(".tree-panel").css('width', '99.5%');
                $("#left").removeClass("col-md-2 col-lg-2 col-sm-2 col-2");
                $("#right").removeClass("col-md-10 col-lg-10 col-sm-10 col-10");
                $("#right").addClass("col-md-12 col-lg-12 col-sm-12 col-12");
                document.getElementById('mouseAnatomyHeading').style.visibility = "visible";

            }
            var parentAppExists = false;
            // TODO: refactor with above stripQueryParams function
            // nodeClickCallback should be function in code here. Repalce function in config with string to match against
            var nodeClickCallback;
            if (window.location.href.indexOf("Parent_App=") !== -1) {
                var appName = findGetParameter('Parent_App');
                if (appName !== null) {
                    if (typeof treeviewConfig.nodeClickCallback[appName] !== "undefined") {
                        parentAppExists = true;
                        nodeClickCallback = treeviewConfig.nodeClickCallback[appName];
                    }
                }
            }
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
            if (location.indexOf("prefix_filter=") !== -1) {
                var prefix_filter_value = findGetParameter('prefix_filter')
                filter_prefix = prefix_filter_value;
            } else {
                filter_prefix = "";
            }

            if (location.indexOf("Specimen_RID=") !== -1) {
                id_parameter = findGetParameter('Specimen_RID')
                showAnnotation = true;
            } else {
                id_parameter = ''
                showAnnotation = false;
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
                filterUrl = 'https://'+window.location.hostname+'/ermrest/catalog/2/attributegroup/M:=Gene_Expression:Specimen/RID='+id_parameter+'/stage:=left(Stage_ID)=(Vocabulary:Developmental_Stage:ID)/id:=stage:Name,stage:Name,stage:Ordinal,stage:Approximate_Equivalent_Age,Species:=M:Species'
                var $el = $("#number");
                $el.empty();
                // ERMrest._http.get(filterUrl)
                $.getJSON(filterUrl, function(filterData) {
                    // TODO: error handling because only Mouse is supported
                    if (!filterData[0] || filterData[0]['Species'] !== "Mus musculus") {
                        document.getElementsByClassName('loader')[0].style.display = "none";
                        document.getElementsByClassName('error')[0].style.visibility = "visible";
                        document.getElementsByTagName("p")[0].innerHTML="Error: Only specimens of species, 'Mus musculus', are supported.<br />Specimen RID: "+id_parameter+", Species: "+(filterData[0] ? filterData[0]['Species'] : "null");
                    } else {
                        var selected_option = filterData[0]['Name'] + ": " + filterData[0]['Approximate_Equivalent_Age']
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
                        filterValue = filterData[0]['Ordinal'];
                        buildPresentationData(showAnnotation, filter_prefix, filterValue, id_parameter)
                    }
                });
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
                filterUrl = 'https://'+window.location.hostname+'/ermrest/catalog/2/attributegroup/M:=Vocabulary:Developmental_Stage/species:=(Species)=(Vocabulary:Species:ID)/species:Name=Mus%20musculus/id:=M:Name,M:Ordinal,M:Name,M:Approximate_Equivalent_Age@sort(Ordinal)';
                var $el = $("#number");
                $el.empty(); // remove old options
                $.getJSON(filterUrl, function(filterData) {
                    // add all options from filter data to list
                    $.each(filterData, function(index, data) {
                        $el.append($("<option></option>")
                        .attr("value", data['Ordinal']).text(data['Name'] + ": " + data['Approximate_Equivalent_Age']));
                    });
                    $el.append($("<option></option>")
                    .attr("value", "All").text("All TS"));
                    $('#number').val('28');
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

                        filterValue = $("#number").val()
                        buildPresentationData(showAnnotation, filter_prefix, filterValue, id_parameter)
                    })
                    filterValue = $("#number").val()
                    buildPresentationData(showAnnotation, filter_prefix, filterValue, id_parameter)
                })
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

            // filter_order_val is currently the ordinal associated with the stage data. It's used in tree data requests for leq/geq clauses
            function buildPresentationData(showAnnotation, prefixVal, filter_order_val, id_parameter) {
                var treeDataURL, isolatedNodesURL, extraAttributesURL;
                var json, isolatedNodes, extraAttributes,
                    presentationData = [];
                // Returns json - Query 1 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/M:=Vocabulary:Anatomy_Part_Of/F1:=left(subject_dbxref)=(Anatomy_terms:dbxref)/$M/F2:=left(object_dbxref)=(Anatomy_terms:dbxref)/$M/subject_dbxref:=M:subject_dbxref,object_dbxref,subject:=F1:name,object:=F2:name
                // Returns extraAttributes - Query 2 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/M:=Gene_Expression:Specimen_Expression/RID=Q-PQ16/$M/RID:=M:RID,Region:=M:Region,strength:=M:Strength,pattern:=M:Pattern,density:=M:Density,densityChange:=M:Density_Direction,densityNote:=M:Density_Note
                // Returns isolated nodes - Query 3 : https://dev.rebuildingakidney.org/ermrest/catalog/2/attribute/t:=Vocabulary:Anatomy_terms/s:=left(dbxref)=(Vocabulary:Anatomy_Part_Of:subject_dbxref)/subject_dbxref::null::/$t/o:=left(dbxref)=(Vocabulary:Anatomy_Part_Of:object_dbxref)/object_dbxref::null::/$t/dbxref:=t:dbxref,name:=t:name
                if (filter_order_val != "" && filter_order_val != "All") {
                    treeDataURL = 'https://'+window.location.hostname+'/ermrest/catalog/2/attribute/M:=Vocabulary:Anatomy_Part_Of_Relationship/F1:=(Subject)=(Vocabulary:Anatomy:ID)/Subject_Starts_at_Ordinal:=(Starts_At)=(Vocabulary:Developmental_Stage:Name)/Ordinal::leq::' + filter_order_val + '/$F1/Subject_Ends_At_Ordinal:=(Ends_At)=(Vocabulary:Developmental_Stage:Name)/Ordinal::geq::' + filter_order_val + '/$M/F2:=(Object)=(Vocabulary:Anatomy:ID)/Object_Starts_at_Ordinal:=(Starts_At)=(Vocabulary:Developmental_Stage:Name)/Ordinal::leq::' + filter_order_val + '/$F2/Object_Ends_At_Ordinal:=(Ends_At)=(Vocabulary:Developmental_Stage:Name)/Ordinal::geq::' + filter_order_val + '/$F1/F1I:=left(Schematic)=(Schematics:Schematic:RID)/$F2/F2I:=left(Schematic)=(Schematics:Schematic:RID)/$M/child_id:=M:Subject,parent_id:=M:Object,child:=F1:Name,parent:=F2:Name,child_image:=F1I:Search_Thumbnail,parent_image:=F2I:Search_Thumbnail'
                    isolatedNodesURL = 'https://'+window.location.hostname+"/ermrest/catalog/2/attribute/t:=Vocabulary:Anatomy/start:=(Starts_At)=(Vocabulary:Developmental_Stage:Name)/start:Ordinal::leq::" + filter_order_val + "/$t/end:=(Ends_At)=(Vocabulary:Developmental_Stage:Name)/end:Ordinal::geq::" + filter_order_val + "/$t/s:=left(ID)=(Vocabulary:Anatomy_Part_Of_Relationship:Subject)/Subject::null::/$t/o:=left(ID)=(Vocabulary:Anatomy_Part_Of_Relationship:Object)/Object::null::/$t/I:=left(Schematic)=(Schematics:Schematic:RID)/$t/id:=t:ID,dbxref:=t:ID,name:=t:Name,t:Starts_At,t:Ends_At,image:=I:Search_Thumbnail";
                    $.getJSON(treeDataURL, function(data) {
                        json = data
                    }).done(function() {
                        $.getJSON(isolatedNodesURL, function(data) {
                            isolatedNodes = data
                        }).done(function() {
                            if(id_parameter != '') {
                                extraAttributesURL = 'https://'+window.location.hostname+'/ermrest/catalog/2/attributegroup/M:=Gene_Expression:Specimen/RID='+id_parameter+'/N:=left(RID)=(Gene_Expression:Specimen_Expression:Specimen)/$M/id:=N:Region,M:RID,Region:=N:Region,strength:=N:Strength,strengthModifier:=N:Strength_Modifier,pattern:=N:Pattern,density:=N:Density,densityChange:=N:Density_Direction,densityMagnitude:=N:Density_Magnitude,densityNote:=N:Density_Note,note:=N:Notes';
                                $.getJSON(extraAttributesURL, function(data) {
                                    extraAttributes = data
                                }).done(function() {
                                    refreshOrBuildTree(json, extraAttributes, showAnnotation, isolatedNodes, prefixVal, filter_order_val)
                                })
                            }
                            else {
                                refreshOrBuildTree(json, [], showAnnotation, isolatedNodes, prefixVal, filter_order_val)
                            }
                        })
                    });
                } else {
                    treeDataURL = 'https://'+window.location.hostname+'/ermrest/catalog/2/attribute/M:=Vocabulary:Anatomy_Part_Of_Relationship/F1:=left(Subject)=(Vocabulary:Anatomy:ID)/$M/F2:=left(Object)=(Vocabulary:Anatomy:ID)/F1:Species=Mus%20musculus/F2:Species=Mus%20musculus/$F1/F1I:=left(Schematic)=(Schematics:Schematic:RID)/$F2/F2I:=left(Schematic)=(Schematics:Schematic:RID)/$M/child_id:=M:Subject,parent_id:=M:Object,child:=F1:Name,parent:=F2:Name,child_image:=F1I:Search_Thumbnail,parent_image:=F2I:Search_Thumbnail';
                    isolatedNodesURL = 'https://'+window.location.hostname+'/ermrest/catalog/2/attribute/t:=Vocabulary:Anatomy/Species=Mus%20musculus/s:=left(ID)=(Vocabulary:Anatomy_Part_Of_Relationship:Subject)/Subject::null::/$t/o:=left(ID)=(Vocabulary:Anatomy_Part_Of_Relationship:Object)/Object::null::/$t/I:=left(Schematic)=(Schematics:Schematic:RID)/$t/id=t:ID,dbxref:=t:ID,name:=t:Name,image:=I:Search_Thumbnail';
                    $.getJSON(treeDataURL, function(data) {
                        json = data
                    }).done(function() {
                        $.getJSON(isolatedNodesURL, function(data) {
                            isolatedNodes = data
                        }).done(function() {
                            if(id_parameter != '') {
                                extraAttributesURL = 'https://'+window.location.hostname+'/ermrest/catalog/2/attributegroup/M:=Gene_Expression:Specimen/RID='+id_parameter+'/N:=left(RID)=(Gene_Expression:Specimen_Expression:Specimen)/$M/id:=N:Region,M:RID,Region:=N:Region,strength:=N:Strength,strengthModifier:=N:Strength_Modifier,pattern:=N:Pattern,density:=N:Density,densityChange:=N:Density_Direction,densityMagnitude:=N:Density_Magnitude,densityNote:=N:Density_Note,note:=N:Notes';
                                $.getJSON(extraAttributesURL, function(data) {
                                    extraAttributes = data
                                }).done(function() {
                                    refreshOrBuildTree(json, extraAttributes, showAnnotation, isolatedNodes, prefixVal, filter_order_val)
                                })
                            }
                            else {
                                refreshOrBuildTree(json, [], showAnnotation, isolatedNodes, prefixVal, filter_order_val)
                            }
                        })
                    });
                }
            }

            function refreshOrBuildTree(json, extraAttributes, showAnnotation, isolatedNodes, prefixVal, filter_order_val) {
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
                if (filter_order_val != "" && ($('#jstree').jstree(true) != false)) {
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
                var isParentAnnotated, isChildAnnotated, parentColumnData, childColumnData, parentImage, childImage;

                // TODO: move part of or all of below into a reuseable function
                var parentText = data[0].parent,
                    childText = data[0].child;

                var specimen_expression_annotations = extraAttributes.find(function(obj) {
                        return obj.Region == data[0].parent_id
                    });

                var cameraIcon = data[0].parent_image ? createCameraElement(data[0].parent_image) : "" ;
                if (showAnnotation && typeof specimen_expression_annotations != 'undefined') {
                    if(annotated_term == "") {
                        annotated_term = parentText
                    }
                    var densityIcon = getDensityIcon(specimen_expression_annotations.density),
                        densityChangeIcon = getDensityChangeIcon(specimen_expression_annotations.densityChange, specimen_expression_annotations.densityMagnitude),
                        densityNoteIcon = getDensityNoteIcon(specimen_expression_annotations.densityNote),
                        densityNote = specimen_expression_annotations.densityNote,
                        noteIcon = getDensityNoteIcon(specimen_expression_annotations.note),
                        note = specimen_expression_annotations.note,
                        patternIcon = getPatternIcon(specimen_expression_annotations.pattern),
                        strengthIcon = getStrengthIcon(specimen_expression_annotations.strength, specimen_expression_annotations.strengthModifier),
                        densityImgSrc = densityIcon != '' ? "<img src=" + densityIcon + "></img>" : "",
                        patternImgSrc = patternIcon != '' ? "<img src=" + patternIcon + "></img>" : "",
                        strengthImgSrc = strengthIcon != '' ? "<img src=" + strengthIcon + "></img>" : "",
                        densityChangeImgSrc = densityChangeIcon != '' ? "<img src=" + densityChangeIcon + "></img>" : "",
                        densityNoteImgSrc = densityNote != '' && densityNote != null ? "<img class='contains-note' src=" + densityNoteIcon + " title='Density Note: " + densityNote + "'></img>" : "",
                        noteImgSrc = note != '' && note != null ? "<img class='contains-note' src=" + noteIcon + " title='Note: " + note + "'></img>" : "";

                    isParentAnnotated = true;
                    parentImage = data[0].parent_image;
                    parentColumnData = "<span>" + strengthImgSrc + "<span class='annotated display-text'>" + parentText + " (" + data[0].parent_id + ") " + "</span>" + densityImgSrc + patternImgSrc + densityChangeImgSrc + densityNoteImgSrc + noteImgSrc + cameraIcon + "</span>"
                } else {
                    isParentAnnotated = false;
                    parentImage = data[0].parent_image;
                    parentColumnData = "<span><span class='display-text'>" + parentText + " (" + data[0].parent_id + ")" + "</span> " + cameraIcon + "</span>"
                }

                // TODO: move part of or all of below into a reuseable function
                specimen_expression_annotations = extraAttributes.find(function(obj) {
                    return obj.Region == data[0].child_id
                })

                var cameraIcon = data[0].child_image ? createCameraElement(data[0].child_image) : "" ;
                if (showAnnotation && typeof specimen_expression_annotations != 'undefined') {
                    if(annotated_term == "") {
                        annotated_term = childText
                    }
                    var densityIcon = getDensityIcon(specimen_expression_annotations.density),
                        densityChangeIcon = getDensityChangeIcon(specimen_expression_annotations.densityChange, specimen_expression_annotations.densityMagnitude),
                        densityNoteIcon = getDensityNoteIcon(specimen_expression_annotations.densityNote),
                        densityNote = specimen_expression_annotations.densityNote,
                        noteIcon = getDensityNoteIcon(specimen_expression_annotations.note),
                        note = specimen_expression_annotations.note,
                        patternIcon = getPatternIcon(specimen_expression_annotations.pattern),
                        strengthIcon = getStrengthIcon(specimen_expression_annotations.strength, specimen_expression_annotations.strengthModifier),
                        densityImgSrc = densityIcon != '' ? "<img src=" + densityIcon + "></img>" : "",
                        patternImgSrc = patternIcon != '' ? "<img src=" + patternIcon + "></img>" : "",
                        strengthImgSrc = strengthIcon != '' ? "<img src=" + strengthIcon + "></img>" : "",
                        densityChangeImgSrc = densityChangeIcon != '' ? "<img src=" + densityChangeIcon + "></img>" : "",
                        densityNoteImgSrc = densityNote != '' && densityNote != null ? "<img class='contains-note' src=" + densityNoteIcon + " title='Density Note: " + densityNote + "'></img>" : "",
                        noteImgSrc = note != '' && note != null ? "<img class='contains-note' src=" + noteIcon + " title='Note: " + note + "'></img>" : "";

                    isChildAnnotated = true;
                    childImage = data[0].child_image;
                    childColumnData = "<span>" + strengthImgSrc + "<span class='annotated display-text'>" + childText + " (" + data[0].child_id + ") " + "</span>" + densityImgSrc + patternImgSrc + densityChangeImgSrc + densityNoteImgSrc + noteImgSrc + cameraIcon + "</span>"
                } else {
                    isChildAnnotated = false;
                    childImage = data[0].child_image;
                    childColumnData = "<span><span class='display-text'>" + childText + " (" + data[0].child_id + ")" + "</span> " + cameraIcon + "</span>"
                }

                var id = 0
                var parent = {
                    text: parentColumnData,
                    parent: [],
                    children: [],
                    dbxref: data[0].parent_id,
                    annotated: isParentAnnotated,
                    base_text: parentText,
                    image_path: parentImage,
                    a_attr: {
                        'href': '/chaise/record/#2/Vocabulary:Anatomy/ID=' + data[0].parent_id.replace(/:/g, '%3A'),
                        'style': 'display:inline;'
                    }
                };
                var child = {
                    text: childColumnData,
                    parent: [],
                    children: [],
                    dbxref: data[0].child_id,
                    annotated: isChildAnnotated,
                    base_text: childText,
                    image_path: childImage,
                    a_attr: {
                        'href': '/chaise/record/#2/Vocabulary:Anatomy/ID=' + data[0].child_id.replace(/:/g, '%3A'),
                        'style': 'display:inline;'
                    }
                };
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
                    var parent = {
                        text: "<span>" + isolatedNodes[j].name + " (" + isolatedNodes[j].dbxref + ") " + isolatedNodeImage + "</span>",
                        parent: [],
                        children: [],
                        dbxref: isolatedNodes[j].dbxref,
                        base_text: isolatedNodes[j].name,
                        a_attr: {
                            'href': '/chaise/record/#2/Vocabulary:Anatomy/ID=' + isolatedNodes[j].dbxref.replace(/:/g, '%3A'),
                            'style': 'display:inline;'
                        },
                        li_attr: {
                            "class": "jstree-leaf"
                        }
                    };
                    if ((prefixVal != "" && parent.dbxref.startsWith("UBERON") == false) || prefixVal == "") {
                        var tree = new Tree(parent);
                        forest.trees.push(tree);
                    }
                }

                for (var i = 1; i < data.length; i++) {
                    var childText = data[i].child,
                        parentText = data[i].parent;

                    var specimen_expression_annotations = extraAttributes.find(function(obj) {
                        return obj.Region == data[i].parent_id
                    });

                    // TODO: move part of or all of below into a reuseable function
                    var cameraIcon = data[i].parent_image ? createCameraElement(data[i].parent_image) : "" ;
                    if (showAnnotation && typeof specimen_expression_annotations != 'undefined') {
                        if(annotated_term == "") {
                            annotated_term = parentText
                        }
                        var densityIcon = getDensityIcon(specimen_expression_annotations.density),
                            densityChangeIcon = getDensityChangeIcon(specimen_expression_annotations.densityChange, specimen_expression_annotations.densityMagnitude),
                            densityNoteIcon = getDensityNoteIcon(specimen_expression_annotations.densityNote),
                            densityNote = specimen_expression_annotations.densityNote,
                            noteIcon = getDensityNoteIcon(specimen_expression_annotations.note),
                            note = specimen_expression_annotations.note,
                            patternIcon = getPatternIcon(specimen_expression_annotations.pattern),
                            strengthIcon = getStrengthIcon(specimen_expression_annotations.strength, specimen_expression_annotations.strengthModifier),
                            densityImgSrc = densityIcon != '' ? "<img src=" + densityIcon + "></img>" : "",
                            patternImgSrc = patternIcon != '' ? "<img src=" + patternIcon + "></img>" : "",
                            strengthImgSrc = strengthIcon != '' ? "<img src=" + strengthIcon + "></img>" : "",
                            densityChangeImgSrc = densityChangeIcon != '' ? "<img src=" + densityChangeIcon + "></img>" : "",
                            densityNoteImgSrc = densityNote != '' && densityNote != null ? "<img class='contains-note' src=" + densityNoteIcon + " title='Density Note: " + densityNote + "'></img>" : "",
                            noteImgSrc = note != '' && note != null ? "<img class='contains-note' src=" + noteIcon + " title='Note: " + note + "'></img>" : "";

                        isParentAnnotated = true;
                        parentImage = data[i].parent_image;
                        parentColumnData = "<span>" + strengthImgSrc + "<span class='annotated display-text'>" + parentText + " (" + data[i].parent_id + ") " + "</span>" + densityImgSrc + patternImgSrc + densityChangeImgSrc + densityNoteImgSrc + noteImgSrc + cameraIcon + "</span>";
                    } else {
                        isParentAnnotated = false;
                        parentImage = data[i].parent_image;
                        parentColumnData = "<span><span class='display-text'>" + parentText + " (" + data[i].parent_id + ")" + "</span> " + cameraIcon + "</span>";
                    }

                    // TODO: move part of or all of below into a reuseable function
                    specimen_expression_annotations = extraAttributes.find(function(obj) {
                        return obj.Region == data[i].child_id
                    })
                    var cameraIcon = data[i].child_image ? createCameraElement(data[i].child_image) : "" ;
                    if (showAnnotation && typeof specimen_expression_annotations != 'undefined') {
                        if(annotated_term == "") {
                            annotated_term = childText
                        }
                        var densityIcon = getDensityIcon(specimen_expression_annotations.density),
                            densityChangeIcon = getDensityChangeIcon(specimen_expression_annotations.densityChange, specimen_expression_annotations.densityMagnitude),
                            densityNoteIcon = getDensityNoteIcon(specimen_expression_annotations.densityNote),
                            densityNote = specimen_expression_annotations.densityNote,
                            noteIcon = getDensityNoteIcon(specimen_expression_annotations.note),
                            note = specimen_expression_annotations.note,
                            patternIcon = getPatternIcon(specimen_expression_annotations.pattern),
                            strengthIcon = getStrengthIcon(specimen_expression_annotations.strength, specimen_expression_annotations.strengthModifier),
                            densityImgSrc = densityIcon != '' ? "<img src=" + densityIcon + "></img>" : "",
                            patternImgSrc = patternIcon != '' ? "<img src=" + patternIcon + "></img>" : "",
                            strengthImgSrc = strengthIcon != '' ? "<img src=" + strengthIcon + "></img>" : "",
                            densityChangeImgSrc = densityChangeIcon != '' ? "<img src=" + densityChangeIcon + "></img>" : "",
                            densityNoteImgSrc = densityNote != '' && densityNote != null ? "<img class='contains-note' src=" + densityNoteIcon + " title='Density Note: " + densityNote + "'></img>" : "",
                            noteImgSrc = note != '' && note != null ? "<img class='contains-note' src=" + noteIcon + " title='Note: " + note + "'></img>" : "";

                        isChildAnnotated = true;
                        childImage = data[i].child_image;
                        childColumnData = "<span>" + strengthImgSrc + "<span class='annotated display-text'>" + childText + " (" + data[i].child_id + ") " + "</span>" + densityImgSrc + patternImgSrc + densityChangeImgSrc + densityNoteImgSrc + noteImgSrc + cameraIcon + "</span>"
                    } else {
                        isChildAnnotated = false;
                        childImage = data[i].child_image;
                        childColumnData = "<span><span class='display-text'>" + childText + " (" + data[i].child_id + ")"  + "</span> " + cameraIcon + "</span>";
                    }

                    var parent = {
                        text: parentColumnData,
                        parent: [],
                        children: [],
                        dbxref: data[i].parent_id,
                        annotated: isParentAnnotated,
                        base_text: parentText,
                        image_path: parentImage,
                        a_attr: {
                            'href': '/chaise/record/#2/Vocabulary:Anatomy/ID=' + data[i].parent_id.replace(/:/g, '%3A'),
                            'style': 'display:inline;'
                        }
                    };
                    var child = {
                        text: childColumnData,
                        parent: [],
                        children: [],
                        dbxref: data[i].child_id,
                        annotated: isChildAnnotated,
                        base_text: childText,
                        image_path: childImage,
                        a_attr: {
                            'href': '/chaise/record/#2/Vocabulary:Anatomy/ID=' + data[i].child_id.replace(/:/g, '%3A'),
                            'style': 'display:inline;'
                        }
                    };
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
                            parentNode = tree.contains(tree, data[i].parent_id);
                            if (parentNode) parentIndex = f;
                        }
                        // find if a node relationship exists (multiple can but we care about one because the rest will be trimmed)
                        if (!childNode) {
                            childNode = tree.contains(tree, data[i].child_id);
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
                }

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
                    s["onClick"] = nodeClickCallback(node);
                } else {
                    var linkId = node.dbxref.replace(/:/g, '%3A');
                    var l = "'/chaise/record/#2/Vocabulary:Anatomy/ID=" + linkId + "','_blank'";
                    s["onClick"] = "window.open(" + l + ");";
                }
                // properties stored under "original" property on jstree_node object
                var node = {
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
                this.node = node;
            }
            var tress = [];

            function Forest(node) {
                var tree = new Tree(node);
                this.trees = [];
            }

            // TODO: functions to vcreate icons need to be generalized
            function getDensityIcon(density) {
                switch (density) {
                    case 'High':
                        return "resources/images/NerveDensity/RelativeToTotal/high.png";
                    case 'Low':
                        return "resources/images/NerveDensity/RelativeToTotal/low.png";
                    case 'Medium':
                        return "resources/images/NerveDensity/RelativeToTotal/medium.png";
                    default:
                        return "";
                }
            }

            function getDensityChangeIcon(change, magnitude) {
                switch (change) {
                    case 'Decreased':
                        switch (magnitude) {
                            case 'Large':
                                return "resources/images/NerveDensity/RelativeToP0/dec_large.png";
                            default:
                                return "resources/images/NerveDensity/RelativeToP0/dec_small.png";
                            }
                    case 'Increased':
                        switch (magnitude) {
                            case 'Large':
                                return "resources/images/NerveDensity/RelativeToP0/inc_large.png";
                            default:
                                return "resources/images/NerveDensity/RelativeToP0/inc_small.png";
                        }
                    default:
                        return "";
                }
            }

            function getDensityNoteIcon(densityNote) {
                return (densityNote != null) ? "resources/images/NerveDensity/note.gif" : "";
            }

            function getPatternIcon(pattern) {
                switch (pattern) {
                    case 'graded':
                        return "resources/images/ExpressionMapping/ExpressionPatternKey/Graded.png";
                    case 'homogeneous':
                        return "resources/images/ExpressionMapping/ExpressionPatternKey/Homogeneous.png";
                    case 'regional':
                        return "resources/images/ExpressionMapping/ExpressionPatternKey/Regional.png";
                    case 'restricted':
                        return "resources/images/ExpressionMapping/ExpressionPatternKey/Restricted.png";
                    case 'single cell':
                        return "resources/images/ExpressionMapping/ExpressionPatternKey/SingleCell.png";
                    case 'spotted':
                        return "resources/images/ExpressionMapping/ExpressionPatternKey/Spotted.png";
                    case 'ubiquitous':
                        return "resources/images/ExpressionMapping/ExpressionPatternKey/Ubiquitous.png";
                    default:
                        return "";
                }
            }

            function getStrengthIcon(strength, strengthModifier) {
                switch (strength) {
                    case 'not detected':
                        return "resources/images/ExpressionMapping/ExpressionStrengthsKey/notDetected.gif";
                    case 'uncertain':
                        return "resources/images/ExpressionMapping/ExpressionStrengthsKey/Uncertain.gif";
                    case 'present':
                        switch (strengthModifier) {
                            case 'strong':
                                return "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(strong).gif";
                            case 'moderate':
                                return "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(moderate).gif";
                            case 'weak':
                                return "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(weak).gif";
                            default:
                                return "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(unspecifiedStrength).gif";
                        }
                    default:
                        return "";
                }
            }

            function createCameraElement(imageUrl) {
                // image_hash
                // preloads the image
                (new Image()).src = imageUrl;
                return '<span class="schematic-popup-icon"><img src="resources/images/camera-icon.png"></img></span>'
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


            // refactor to just be a getter
            // add another function to strip params
            function findGetParameter(parameterName) {
                var result = null,
                tmp = [];
                // search is denoted by '?', it is everything including the '?' and after it
                var items = window.location.search.substr(1).split("&");
                for (var index = 0; index < items.length; index++) {
                    tmp = items[index].split("=");
                    if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
                }
                return result;
            }
        }); // end of ERMrest.onload
    }); // end of document ready
})()
