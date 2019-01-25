// url paramters (accessed by $url_parameters)
// - Species
// - Specimen_RID

// query patterns will be appended to the relative path of the current server (ie. "https://dev.rebuildingakidney.org")
// patterns can have markdown in it that will be rendered using handlebars
var treeviewConfig = {
    title_markdown_pattern: "{{$url_parameters.Species}} Anatomy Tree",
    // user-input/filter configuration
    filters: [
        //species
        {
            filter_column_name: "Name", // column value stored for filter info in $filters[0], should match a column name in the projections list
            display_mode: "drop-down", // or false (not show)
            display_text: "{{{Name}}}",
            query_pattern: "/ermrest/catalog/2/attributegroup/M:=Vocabulary:Species/id:=M:Name,M:ID,M:Name@sort(Name)",
            default_id: 'Mus musculus', // note: might not be required?
            selected_filter: {
                required_url_parameters: ["Species"], // if url param is present, false or null if not
                selected_id: "{{{$url_parameters.Species}}}",
                if_empty: false // if the selected_id is not in the list (e.g. null/empty array/1+), use this stage.. If this is not defined or false, just throw an error
            }
        },
        // stage
        {
            filter_column_name: "Ordinal", // column value stored for filter info in $filters["Ordinal"]
            display_mode: "drop-down",
            display_text: "{{{Name}}}{{#if Approximate_Equivalent_Age}}: {{Approximate_Equivalent_Age}}{{/if}}",
            query_pattern: "/ermrest/catalog/2/attributegroup/M:=Vocabulary:Developmental_Stage/species:=(Species)=(Vocabulary:Species:ID)/Name={{{$url_parameters.Species}}}/$M/id:=M:Name,Ordinal,Name,Approximate_Equivalent_Age@sort(Ordinal)",
            // default_id: 'TS23',
            default_id: '23',
            // pre-selected through url parameter: either run the query to get the same row or choose existing value
            selected_filter: {
                required_url_parameters: ["Specimen_RID"],
                selected_query_pattern: "/ermrest/catalog/2/attributegroup/M:=Gene_Expression:Specimen/RID={{{$url_parameters.Specimen_RID}}}/stage:=(Stage_ID)=(Vocabulary:Developmental_Stage:ID)/id:=stage:Name,stage:Name,stage:Ordinal,stage:Approximate_Equivalent_Age,Species:=M:Species",
                selected_id: "{{{$url_parameters.Specimen_RID}}}", // either query_pattern or selected_id for specific value
                if_empty: "All_Stages" // if the selected_id is not in the list (e.g. null/empty array/1+), use this stage.. If this is not defined, just throw an error
            },

            // extra-filter option
            extra_filter_options : [
                {
                    // define the object required to be a selector option
                    values: {
                        id: 'All_Stages',
                        Name: 'All Stages',
                        Approximate_Equivalent_Age: ''
                    }
                }
            ]
        }
    ],

    // main tree
    tree: {
        // required in projection list: parent_id, parent_name, child_id, child_name
        queries: [
            {
                filter_set: ["*", "All_Stages"],
                tree_query: "/ermrest/catalog/2/attribute/M:=Vocabulary:Anatomy_Part_Of_Relationship/F1:=left(Subject)=(Vocabulary:Anatomy:ID)/F1I:=left(Schematic)=(Schematics:Schematic:RID)/$M/F2:=left(Object)=(Vocabulary:Anatomy:ID)/F2I:=left(Schematic)=(Schematics:Schematic:RID)/$M/child_id:=M:Subject,parent_id:=M:Object,child:=F1:Name,parent:=F2:Name,child_image:=F1I:Search_Thumbnail,parent_image:=F2I:Search_Thumbnail",
                isolated_nodes_query: "/ermrest/catalog/2/attribute/t:=Vocabulary:Anatomy/s:=left(ID)=(Vocabulary:Anatomy_Part_Of_Relationship:Subject)/Subject::null::/$t/o:=left(ID)=(Vocabulary:Anatomy_Part_Of_Relationship:Object)/Object::null::/$t/I:=left(Schematic)=(Schematics:Schematic:RID)/$t/id:=t:ID,dbxref:=t:ID,name:=t:Name,image:=I:Search_Thumbnail"
            },
            {
                filter_set: ["*", "*"],
                tree_query: "/ermrest/catalog/2/attribute/M:=Vocabulary:Anatomy_Part_Of_Relationship/F1:=(Subject)=(Vocabulary:Anatomy:ID)/Subject_Starts_at_Ordinal:=(Starts_At)=(Vocabulary:Developmental_Stage:Name)/Ordinal::leq::{{{$filters.Ordinal}}}/$F1/Subject_Ends_At_Ordinal:=(Ends_At)=(Vocabulary:Developmental_Stage:Name)/Ordinal::geq::{{{$filters.Ordinal}}}/$M/F2:=(Object)=(Vocabulary:Anatomy:ID)/Object_Starts_at_Ordinal:=(Starts_At)=(Vocabulary:Developmental_Stage:Name)/Ordinal::leq::{{{$filters.Ordinal}}}/$F2/Object_Ends_At_Ordinal:=(Ends_At)=(Vocabulary:Developmental_Stage:Name)/Ordinal::geq::{{{$filters.Ordinal}}}/$F1/F1I:=left(Schematic)=(Schematics:Schematic:RID)/$F2/F2I:=left(Schematic)=(Schematics:Schematic:RID)/$M/child_id:=M:Subject,parent_id:=M:Object,child:=F1:Name,parent:=F2:Name,child_image:=F1I:Search_Thumbnail,parent_image:=F2I:Search_Thumbnail",
                isolated_nodes_query: "/ermrest/catalog/2/attribute/t:=Vocabulary:Anatomy/start:=(Starts_At)=(Vocabulary:Developmental_Stage:Name)/start:Ordinal::leq::{{{$filters.Ordinal}}}/$t/end:=(Ends_At)=(Vocabulary:Developmental_Stage:Name)/end:Ordinal::geq::{{{$filters.Ordinal}}}/$t/s:=left(ID)=(Vocabulary:Anatomy_Part_Of_Relationship:Subject)/Subject::null::/$t/o:=left(ID)=(Vocabulary:Anatomy_Part_Of_Relationship:Object)/Object::null::/$t/I:=left(Schematic)=(Schematics:Schematic:RID)/$t/id:=t:ID,dbxref:=t:ID,name:=t:Name,t:Starts_At,t:Ends_At,image:=I:Search_Thumbnail"
            }
        ],

        hide_id: false, // default is false

        // click_event: "booleanSearch", // booleanSearch callback is in the js file. doesn't seem like the function should be configurable
        click_event: "redirect", // "redirect", "booleanSearch", false (no event)
        click_event_callback: "/chaise/record/#2/Vocabulary:Anatomy/ID={{{$node_id}}}", // only define if "redirect" above?

        /* -- sql query
        select a."Name", a."Starts_At", a."Ends_At"
        from "Vocabulary"."Anatomy" a
        JOIN "Vocabulary"."Developmental_Stage" st ON (a."Starts_At" = st."Name")
        JOIN "Vocabulary"."Developmental_Stage" e ON (a."Ends_At" = e."Name")
        -- where st."Ordinal"<=23 and e."Ordinal">=23;
        left join "Vocabulary"."Anatomy_Part_Of_Relationship" s ON (a."ID" = s."Subject") left join "Vocabulary"."Anatomy_Part_Of_Relationship" o ON (a."ID" = o."Object")
        where st."Ordinal"<=23 and e."Ordinal">=23
        and  s."Subject" IS NULL and o."Object" is null;
        */

    },

    // extra attributes to annotate nodes with icons
    annotation: {
        annotation_query_pattern: "/ermrest/catalog/2/attributegroup/M:=Gene_Expression:Specimen/RID={{{$url_parameters.Specimen_RID}}}/N:=left(RID)=(Gene_Expression:Specimen_Expression:Specimen)/$M/id:=N:Region,M:RID,Region:=N:Region,strength:=N:Strength,strengthModifier:=N:Strength_Modifier,pattern:=N:Pattern,density:=N:Density,densityChange:=N:Density_Direction,densityMagnitude:=N:Density_Magnitude,densityNote:=N:Density_Note,note:=N:Notes",
        // keys should map to the columns listed in extra_attributes_columns
        // inner keys should be the value of that column with icon location as the value
        extra_attributes_icons: {
            strength: {
                hide_label_display: false, // if null or not there, show label
                before_text: true,
                // mapping of label name and icon
                labels: {
                    "not detected": "resources/images/ExpressionMapping/ExpressionStrengthsKey/notDetected.gif",
                    uncertain: "resources/images/ExpressionMapping/ExpressionStrengthsKey/Uncertain.gif",
                    present: {
                        strengthModifier: {
                            labels: {
                                strong: "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(strong).gif",
                                moderate: "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(moderate).gif",
                                weak: "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(weak).gif",
                                default: "resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(unspecifiedStrength).gif"
                            }
                        },
                    }
                }
            },
            density: {
                hide_label_display: false,
                before_text: false,
                labels: {
                    High: "resources/images/NerveDensity/RelativeToTotal/high.png",
                    Low: "resources/images/NerveDensity/RelativeToTotal/low.png",
                    Medium: "resources/images/NerveDensity/RelativeToTotal/medium.png"
                }
            },
            pattern: {
                hide_label_display: false,
                before_text: false,
                labels: {
                    graded: "resources/images/ExpressionMapping/ExpressionPatternKey/Graded.png",
                    homogeneous: "resources/images/ExpressionMapping/ExpressionPatternKey/Homogeneous.png",
                    regional: "resources/images/ExpressionMapping/ExpressionPatternKey/Regional.png",
                    restricted: "resources/images/ExpressionMapping/ExpressionPatternKey/Restricted.png",
                    "single cell": "resources/images/ExpressionMapping/ExpressionPatternKey/SingleCell.png",
                    spotted: "resources/images/ExpressionMapping/ExpressionPatternKey/Spotted.png",
                    ubiquitous: "resources/images/ExpressionMapping/ExpressionPatternKey/Ubiquitous.png"
                }
            },
            densityChange: {
                hide_label_display: false,
                before_text: false,
                labels: {
                    Decreased: {
                        densityMagnitude: {
                            labels: {
                                Large: "resources/images/NerveDensity/RelativeToP0/dec_large.png",
                                Small: "resources/images/NerveDensity/RelativeToP0/dec_small.png",
                                default: "resources/images/NerveDensity/RelativeToP0/dec_small.png"  // else case (including null)
                            }
                        }
                    },
                    Increased: {
                        densityMagnitude: {
                            labels: {
                                Large: "resources/images/NerveDensity/RelativeToP0/inc_large.png",
                                Small: "resources/images/NerveDensity/RelativeToP0/inc_small.png",
                                default: "resources/images/NerveDensity/RelativeToP0/inc_small.png"
                            }
                        }
                    }
                }
            },
            densityNote: {
                hide_label_display: false,
                before_text: false,
                has_tooltip: true,
                labels: "resources/images/NerveDensity/note.gif"
            },
            note: {
                hide_label_display: false,
                before_text: false,
                has_tooltip: true,
                labels: "resources/images/NerveDensity/note.gif"
            }
        }
    }
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = treeviewConfig;
}
