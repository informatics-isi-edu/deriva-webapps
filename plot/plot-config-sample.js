/**
 * Please Note
 * This is a sample configuration file. Copy the contents to `plot-config.js` and run `make install_w_configs` to use this configuration
 */
 var plotConfigs = {
     "study-violin": {
         // templateVariables: {
         //     $url_parameters: {
         //         Study: ""
         //     },
         //     $filters: {
         //         NCBI_GeneID: ""
         //     },
         //     // each row of data for graph added before templating each time
         //     $row: response.data[index]
         // }
         headTitle: "Study Violin Plot",
         top_right_link_text: "Enable gene, study selectors",
         plots: [
             {
                 plot_type: "violin",
                 // uri pattern with templating to fetch gene information
                 //  /ermrest/catalog/2/entity/RNASeq:Replicate_Expression/Study=xxxx/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID) + /NCBI_GeneID=xxxx
                 gene_uri_pattern: "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}{{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}}/{{/if}}(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)",
                 // sets up the study selector
                 // /ermrest/catalog/2/entity/RNASeq:Replicate_Expression/NCBI_GeneID=xxxx/(Study)=(RNASeq:Study:RID) + /RID=xxxx
                 study_uri_pattern: "/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}/(Study)=(RNASeq:Study:RID)",
                 // base configuration for plotly
                 plotly: {
                     // passed directly to plotly (plotly.config)
                     config: {
                         modeBarButtonsToRemove: ["select2d", "lasso2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "TPM Expression"
                     }
                 },
                 // configuration options used to override plotly definitions
                 config: {
                     title_display_markdown_pattern: "TPM Expression: {{#if (gt $url_parameters.Study.length 0)}}{{#if (lt $url_parameters.Study.length 6)}}{{#if (eq $url_parameters.Study.length 1)}}Study {{else}}Studies {{/if}}{{#each $url_parameters.Study}}[{{this.data.RID}}](/chaise/record/#{{$catalog.id}}/RNASeq:Study/RID={{this.data.RID}}){target=_blank}{{#unless @last}}, {{/unless}}{{/each}}{{else}}{{$url_parameters.Study.length}} Studies{{/if}}{{else}}All Studies{{/if}}",
                     xaxis: {
                         // list of column names for "RNASeq:Replicate_Expression" to group data by
                         //   - column_name              - name of column in model
                         //   - title_display_pattern    - x-axis title template pattern
                         //   - tick_display_pattern     - x-axis individual tick template pattern
                         //   - default                  - if set, this is the group to use as default
                         group_keys: [
                             {
                                 column_name: "Experiment",
                                 title_display_pattern: "Experiment",
                                 tick_display_markdown_pattern: "[{{{$row.Experiment}}}](/chaise/record/#2/RNASeq:Experiment/RID={{{$row.Experiment}}}): {{{$row.Experiment_Internal_ID}}}",  // NOTE: this templates the value based on $row (response.data[index]) being in template environment
                                 default: true
                             }, {
                                 column_name: "Experiment_Internal_ID",
                                 title_display_pattern: "Experiment Internal ID"
                             }, {
                                 column_name: "Replicate",
                                 title_display_pattern: "Replicate",
                                 tick_display_markdown_pattern: "[{{{$row.Replicate}}}](/chaise/record/#2/RNASeq:Replicate/RID={{{$row.Replicate}}})"
                             }, {
                                 column_name: "Specimen",
                                 title_display_pattern: "Specimen",
                                 tick_display_markdown_pattern: "[{{{$row.Specimen}}}](/chaise/record/#2/Gene_Expression:Specimen/RID={{{$row.Specimen}}})"
                             }, {
                                 column_name: "Anatomical_Source",
                                 title_display_pattern: "Anatomical Source",
                                 tick_display_markdown_pattern: "{{#if $row.Anatomical_Source}}{{{$row.Anatomical_Source}}}{{else}}N/A{{/if}}"
                             }, {
                                 column_name: "Sex",
                                 title_display_pattern: "Sex",
                                 tick_display_markdown_pattern: "{{#if $row.Sex}}[{{{$row.Sex}}}](/chaise/record/#2/Vocabulary:Sex/Name={{#encode $row.Sex}}{{/encode}}){{else}}N/A{{/if}}"
                             }, {
                                 column_name: "Species",
                                 title_display_pattern: "Species",
                                 tick_display_markdown_pattern: "[{{{$row.Species}}}](/chaise/record/#2/Vocabulary:Species/Name={{#encode $row.Species}}{{/encode}})"
                             }, {
                                 column_name: "Specimen_Type",
                                 title_display_pattern: "Specimen Type",
                                 tick_display_markdown_pattern: "[{{{$row.Specimen_Type}}}](/chaise/record/#2/Vocab:Specimen_Type/Name={{#encode $row.Specimen_Type}}{{/encode}})"
                             }, {
                                 column_name: "Stage",
                                 title_display_pattern: "Stage",
                                 tick_display_markdown_pattern: "{{#if $row.Stage}}[{{{$row.Stage}}}](/chaise/record/#2/Vocabulary:Developmental_Stage/Name={{#encode $row.Stage}}{{/encode}}){{else}}N/A{{/if}}"
                             }
                         ],
                         default_all_studies_group: "Anatomical_Source"
                     },
                     yaxis: {
                         title_display_markdown_pattern: "TPM",
                         group_key: "TPM",
                         tick_display_pattern: "{{add $row.TPM 1}}" // increment every TPM value by 1 to adjust for log scaling
                     }
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         // -- join Experiment to get the Experiment_Internal_ID
                         //queryPattern: "/ermrest/catalog/2/attributegroup/M:=RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}({{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}})&{{/if}}NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}/exp:=(Experiment)=(RNASeq:Experiment:RID)/$M/Anatomical_Source,Experiment,Experiment_Internal_ID:=exp:Internal_ID,NCBI_GeneID,Replicate,Sex,Species,Specimen,Specimen_Type,Stage,Age,Starts_At,Ends_At,TPM"
                         // -- use Experiment_Internal_ID from Replicate_Expression table. Should be faster
                         // queryPattern: "/ermrest/catalog/2/attributegroup/M:=RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}({{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}})&{{/if}}NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}/$M/Anatomical_Source,Experiment,Experiment_Internal_ID,NCBI_GeneID,Replicate,Sex,Species,Specimen,Specimen_Type,Stage,Age,Starts_At,Ends_At,TPM"
                         queryPattern: "/ermrest/catalog/2/attributegroup/M:=RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}({{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}})&{{/if}}NCBI_GeneID={{{$url_parameters.NCBI_GeneID}}}/$M/Anatomical_Source,Experiment,Experiment_Internal_ID,NCBI_GeneID,Replicate,Sex,Species,Specimen,Specimen_Type,Stage,TPM"
                     }
                 ]
             }
         ]
     },
     "gudmap-todate-pie": {
         headTitle: "GUDMAP Release Status Dashboard",
         // Array of object plots to be shown on the page
         plots: [
             {
                 // ValuesValues can be from : "line", "bar", "dot", "area", "dot-lines", "pie", "histogram-horizontal", "histogram-verical"
                 plot_type: "pie",
                 plotly: {
                     config: {
                         modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines", "hoverClosestPie"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "Number of GUDMAP resources released to-date",
                         showLegend: true
                     }
                 },
                 config: {
                     title_display_markdown_pattern: "[ Number of GUDMAP resources released to-date](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}",
                     slice_label: "value",       // what to show on the slice of pie chart - value or "percent
                     format_data: true,          // - to use hack or not for formatting
                     disable_default_legend_click: false
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
                         // legend: ["Browser All Events 1","Browser All Events 2"],   // name of traces in legend
                         data_col: "#_Released",     // name of the attribute of the data column
                         legend_col: "Data_Type",     // name of the attribute of the legend column
                         legend_markdown_pattern: "[{{$self.data.Data_Type}}](/chaise/recordset/#2/{{{$self.data.Schema_Table}}}/*::facets::{{#encodeFacet}}{{{$self.data.Data_Type_Filter}}}{{/encodeFacet}}){target=_blank}",
                         graphic_link_pattern: ["/chaise/recordset/#2/{{{$self.data.Schema_Table}}}/*::facets::{{#encodeFacet}}{{{$self.data.Data_Type_Filter}}}{{/encodeFacet}}"]
                     }
                 ]
             }
         ]
     },
     "gudmap-todate-bar": {
         headTitle: "GUDMAP Data Status Dashboard",
         // Array of object plots to be shown on the page
         plots: [
             {
                 plot_type: "bar",
                 plotly: {
                     config: {
                         modeBarButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "Number of GUDMAP resources released to date (log scale)",
                         height: 500,
                         width: 1200,
                         showlegend: true,
                         xaxis: {
                             title: "Number of Records",          // plot x_axis label
                             type: 'log',             // optional value: tickformat should compatible with type
                         },
                         yaxis: {
                             // title: "Data_Types",       // plot y_axis label
                         },
                         margin: {
                             t: 30,
                             l: 280
                         },
                         legend: {
                             traceorder: "reversed"    // order of the legend is reversed
                         }
                     }
                 },
                 config:{
                     title_display_markdown_pattern: "[Number of GUDMAP resources released to date (log scale)](https://dev.isrd.isi.edu/chaise/search){target=_blank}",
                     format_data_x: true,   // defualt : false - to use hack or not
                     xaxis: {
                         title_display_markdown_pattern: "[Number of Records](https://dev.isrd.isi.edu/chaise/search){target=_blank}",
                     },
                     yaxis: {
                         tick_display_markdown_pattern:"[{{$self.data.Data_Type}}](/chaise/recordset/#2/{{{$self.data.Schema_Table}}}){target=_blank}",
                     },
                     disable_default_legend_click: true
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
                         legend: ["#_Released"],   // name of traces in legend
                         legend_markdown_pattern: ["[#Released](/chaise/recordset/#2/Antibody:Antibody_Tests/){target=_blank}"],
                         x_col: ["#_Released"],    // column name to use for x values
                         y_col: ["Data_Type"],                   // array of column names to use for y values
                         orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
                         // hovertemplate: ',d',
                         graphic_link_pattern:"/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}",
                         textfont: {
                             size: 10                           // It will work till the bar size can accomodate the font size
                         },
                     },
                 ]
             }
         ]
     },
     "gudmap-todate-bar-swapped": {
         headTitle: "GUDMAP Data Status Dashboard",
         // Array of object plots to be shown on the page
         plots: [
             {
                 plot_type: "bar",
                 plotly: {
                     config: {
                         modeBarButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "Number of GUDMAP resources released to date (log scale)",
                         height: 1000,
                         width: 800,
                         showlegend: true,
                         xaxis: {
                             // title: "Data_Types",       // plot y_axis label
                         },
                         yaxis: {
                             title: "Number of Records",          // plot x_axis label
                             type: 'log',             // optional value: tickformat should compatible with type
                         },
                         margin: {
                             t: 30,
                             b: 280
                         },
                         legend: {
                             traceorder: "reversed"    // order of the legend is reversed
                         }
                     }
                 },
                 config:{
                     title_display_markdown_pattern: "[Number of GUDMAP resources released to date (log scale)](https://dev.isrd.isi.edu/chaise/search){target=_blank}",
                     format_data_x: true,   // defualt : false - to use hack or not
                     xaxis: {
                         tick_display_markdown_pattern:"[{{$self.data.Data_Type}}](/chaise/recordset/#2/{{{$self.data.Schema_Table}}}){target=_blank}",
                     },
                     yaxis: {
                         title_display_markdown_pattern: "[Number of Records](https://dev.isrd.isi.edu/chaise/search){target=_blank}",
                     },
                     disable_default_legend_click: false
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
                         legend: ["#_Released"],   // name of traces in legend
                         legend_markdown_pattern: ["[#Released](/chaise/recordset/#2/Antibody:Antibody_Tests/){target=_blank}"],
                         x_col: ["Data_Type"],    // column name to use for x values
                         y_col: ["#_Released"],                   // array of column names to use for y values
                         orientation: "v",                      // Optional parameter for displaying the bar chart horizontally
                         // hovertemplate: ',d',
                         graphic_link_pattern:"/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}",
                         textfont: {
                             size: 10                           // It will work till the bar size can accomodate the font size
                         },
                     },
                 ]
             }
         ]
     },
     // "gudmap-todate-bar-no-dimensions": {
     //     headTitle: "GUDMAP Data Summary Dashboard",
     //     // Array of object plots to be shown on the page
     //     plots: [
     //         {
     //             plot_type: "bar",
     //             plotly: {
     //                 config: {
     //                     modeBarButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
     //                     displaylogo: false,
     //                     responsive: true
     //                 },
     //                 layout: {
     //                     title: "Number of GUDMAP resources released to date (log scale)",
     //                     margin: {
     //                         t: 40,
     //                         r: 0,
     //                         b: 35,
     //                         l: 280  // left margin for lengthy data labels.
     //                     },
     //                     legend: {
     //                         traceorder: "reversed"    // order of the legend is reversed
     //                     },
     //                     xaxis: {
     //                         title: "Number of Records",          // plot x_axis label
     //                         // tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
     //                         type: 'log',              // optional value: tickformat should compatible with type
     //                         range: [0, 4.6]
     //                     },
     //                     yaxis: {
     //                         ticksuffix: "  "
     //                         // title: "Data_Types",       // plot y_axis label
     //                     }
     //                 }
     //             },
     //             config: {
     //                 format_data_x: true   // defualt : false - to use hack or not
     //             },
     //             traces: [
     //                 {
     //                     // The request url that has to be used to fetch the data.
     //                     uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
     //                     legend: ["#_Released"],   // name of traces in legend
     //                     x_col: ["#_Released"],    // column name to use for x values
     //                     y_col: ["Data_Type"],                   // array of column names to use for y values
     //                     orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
     //                     // hovertemplate: ',d',
     //                     textfont: {
     //                         size: 10                           // It will work till the bar size can accomodate the font size
     //                     }
     //                 }
     //             ]
     //         }
     //     ]
     // },
     "gudmap-data-summary-responsive": {
         page_title: "GUDMAP Data Summary Dashboard",
         // Array of object plots to be shown on the page
         plots: [
             {
                 plot_type: "bar",
                 config: {
                     format_data_x: true   // defualt : false - to use hack or not
                 },
                 plotly_config:{
                     title: "Number of GUDMAP resources released to date (log scale)",
                     margin: {
                         t: 40,
                         r: 0,
                         b: 35,
                         l: 280  // left margin for lengthy data labels.
                     },
                     legend:{
                         traceorder: "reversed"    // order of the legend is reversed
                     },
                     xaxis: {
                         title: "Number of Records",          // plot x_axis label
                         // tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
                         type: 'log',              // optional value: tickformat should compatible with type
                         range: [0, 4.6]
                     },
                     yaxis: {
                         ticksuffix: "  "
                         // title: "Data_Types",       // plot y_axis label
                     }
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
                         legend: ["#_Released"],   // name of traces in legend
                         x_col: ["#_Released"],    // column name to use for x values
                         y_col: ["Data_Type"],                   // array of column names to use for y values
                         orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
                         // hovertemplate: ',d',
                         textfont: {
                             size: 10                           // It will work till the bar size can accomodate the font size
                         },
                     },
                 ],
                 // Plotly defualt buttons/actions to be removed
                 plotlyDefaultButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"]
             }
         ]
     },

     "rbk-todate-bar": {
         headTitle: "GUDMAP Data Summary Dashboard",
         // Array of object plots to be shown on the page
         plots: [
             {
                 plot_type: "bar",
                 plotly: {
                     config: {
                         modeBarButtonsToRemove: ["scrollZoom", "zoom2d","sendDataToCloud","autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "Number of RBK resources released to date (log scale)",
                         height: 450,
                         width: 1200,
                         margin: {
                             l: 280,  // left margin for lengthy data labels.
                             //b :50   // bottom margin for lengthy data labels.
                         },
                         legend:{
                             traceorder: "reversed"    // order of the legend is reversed
                         },
                         xaxis: {
                             title: "Number of Records",          // plot x_axis label
                             // tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
                             type: 'log',             // optional value: tickformat should compatible with type

                         },
                         yaxis: {
                             // title: "Data_Types",       // plot y_axis label
                         }
                     }
                 },
                 config: {
                     format_data_x: true   // defualt : false - to use hack or not
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=RBK/!(%23_Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26",
                         legend: ["#_Released"],   // name of traces in legend
                         x_col: ["#_Released"],    // column name to use for x values
                         y_col: ["Data_Type"],                   // array of column names to use for y values
                         orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
                         // hovertemplate: ',d',
                         textfont: {
                             size: 10                           // It will work till the bar size can accomodate the font size
                         }
                     }
                 ]
             }
         ]
     },

     "gudmap-release-all": {
         headTitle: "GUDMAP Data Summary Dashboard",
         // Array of object plots to be shown on the page
         plots: [
             {
                 plot_type: "bar",
                 plotly: {
                     config: {
                         modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "Number of GUDMAP resources created and released to date (log scale)",
                         height: 800,
                         width: 1200,
                         margin: {
                             l: 280,  // left margin for lengthy data labels.
                             //b :50   // bottom margin for lengthy data labels.
                         },
                         legend: {
                             traceorder: "reversed"    // order of the legend is reversed
                         },
                         xaxis: {
                             title: "Number of Records",          // plot x_axis label
                             // tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
                             type: 'log'             // optional value: tickformat should compatible with type
                         },
                         yaxis: {
                             // title: "Data_Types",       // plot y_axis label
                         }
                     }
                 },
                 config: {
                     x_axis_thousands_separator: true,
                     format_data_x: true   // defualt : false - to use hack or not
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Records=0)/$M@sort(ID::desc::)?limit=26",
                         legend: ["# Released", "# Created"],   // name of traces in legend
                         x_col: ["#_Released", "#_Records"],    // column name to use for x values
                         y_col: ["Data_Type"],                   // array of column names to use for y values
                         orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
                         // legend_markdown_pattern: ["[#Released](/chaise/recordset/#2/Antibody:Antibody_Tests/){target=_blank}","[#Created](/chaise/recordset/#2/Antibody:Antibody_Tests/){target=_blank}"],
                         // graphic_link_pattern:"/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}",
                         // hovertemplate: ',d',
                         textfont: {
                             size: 10                           // It will work till the bar size can accomodate the font size
                         }
                     }
                 ]
             },
             {
                 plot_type: "bar",
                 plotly: {
                     config: {
                         modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "Number of GUDMAP resources created and released in 2020 (log scale)",
                         height: 800,
                         width: 1200,
                         margin: {
                             l: 280,  // left margin for lengthy data labels.
                             //b :50   // bottom margin for lengthy data labels.
                         },
                         legend: {
                             traceorder: "reversed"    // order of the legend is reversed
                         },
                         xaxis: {
                             title: "Number of Records",          // plot x_axis label
                             // tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
                             type: 'log'             // optional value: tickformat should compatible with type
                         },
                         yaxis: {
                             // title: "Data_Types",       // plot y_axis label
                         }
                     }
                 },
                 config: {
                     x_axis_thousands_separator: true,
                     format_data_x: true   // defualt : false - to use hack or not
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(%23_Records=0)/$M@sort(ID::desc::)?limit=26",
                         legend: ["# Released", "# Created"],   // name of traces in legend
                         x_col: ["#_Released_in_Latest_Year", "#_Created_in_Latest_Year"],    // column name to use for x values
                         y_col: ["Data_Type"],                   // array of column names to use for y values
                         orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
                         // hovertemplate: ',d',
                         textfont: {
                             size: 10                           // It will work till the bar size can accomodate the font size
                         }
                     }
                 ]
             }
         ]
     },
     // "gudmap-releae-all": "*", // doesn't work for either dimension
     "rbk-release-all": {
         headTitle: "RBK Data Summary Dashboard",
         // Array of object plots to be shown on the page
         plots: [
             {
                 plot_type: "bar",
                 plotly: {
                     config: {
                         modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "Number of RBK resources created and released to date (log scale)",
                         height: 850,
                         width: 1200,
                         margin: {
                             l: 280,  // left margin for lengthy data labels.
                             //b :50   // bottom margin for lengthy data labels.
                         },
                         legend: {
                             traceorder: "reversed"    // order of the legend is reversed
                         },
                         xaxis: {
                             title: "Number of Records",
                             // tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
                             type: 'log',             // optional value: tickformat should compatible with type

                         },
                         yaxis: {
                             // title: "Data_Types",
                         }
                     }
                 },
                 config: {
                     x_axis_thousands_separator: true,
                     format_data_x: true   // defualt : false - to use hack or not
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=RBK/!(%23_Records=0)/$M@sort(ID::desc::)?limit=26",
                         legend: ["# Released", "# Created"],   // name of traces in legend
                         x_col: ["#_Released", "#_Records"],    // column name to use for x values
                         y_col: ["Data_Type"],                   // array of column names to use for y values
                         orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
                         // hovertemplate: ',d',
                         textfont: {
                             size: 10                           // It will work till the bar size can accomodate the font size
                         }
                     }
                 ]
             },

             {
                 plot_type: "bar",
                 plotly: {
                     config: {
                         modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                         displaylogo: false,
                         responsive: true
                     },
                     layout: {
                         title: "Number of RBK resources created and released in 2020 (log scale)",
                         height: 900,
                         width: 1200,
                         margin: {
                             l: 280,  // left margin for lengthy data labels.
                             //b :50   // bottom margin for lengthy data labels.
                         },
                         legend: {
                             traceorder: "reversed"    // order of the legend is reversed
                         },
                         xaxis: {
                             title: "Number of Records",          // plot x_axis label
                             // tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
                             type: 'log',             // optional value: tickformat should compatible with type

                         },
                         yaxis: {
                             // title: "Data_Types",       // plot y_axis label
                         }
                     }
                 },
                 config: {
                     x_axis_thousands_separator: true,
                     format_data_x: true   // defualt : false - to use hack or not
                 },
                 traces: [
                     {
                         // The request url that has to be used to fetch the data.
                         uri: "/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=RBK/!(%23_Records=0)/$M@sort(ID::desc::)?limit=26",
                         legend: ["# Released", "# Created"],   // name of traces in legend
                         x_col: ["#_Released_in_Latest_Year", "#_Created_in_Latest_Year"],    // column name to use for x values
                         y_col: ["Data_Type"],                   // array of column names to use for y values
                         orientation: "h",                      // Optional parameter for displaying the bar chart horizontally
                         // hovertemplate: ',d',
                         textfont: {
                             size: 10                           // It will work till the bar size can accomodate the font size
                         }
                     }
                 ]
             }
         ]
     },
     "specimen-scatterplot": {
         plots: [{
             plot_type: "scatter",
             plotly: {
                 config: {
                     modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                     displaylogo: false,
                     responsive: true
                 },
                 layout: {
                     title: "Specimen Stage vs Assay Type",
                     height: 1100,
                     width: 1200,
                     showLegend: true,
                     margin: {
                         l: 100,  // left margin for lengthy data labels.
                         b: 300   // bottom margin for lengthy data labels.
                     },
                     xaxis: {
                         title: "Assay Type"
                     },
                     yaxis: {
                         title: "Stage"
                     }
                 }
             },
             config: {
                 title_display_markdown_pattern: "[Specimen Stage vs Assay Type](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}",
                 xaxis: {
                     title_display_markdown_pattern: "[Assay Type](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}",
                     tick_display_markdown_pattern:"[{{$self.data.Assay_Type}}](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}",
                 },
                 yaxis: {
                     title_display_markdown_pattern: "[Stage](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}",
                     tick_display_markdown_pattern:"[{{$self.data.Name}}](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}",
                 },
                 disable_default_legend_click: false
             },
             traces: [
                 {
                     uri: "/ermrest/catalog/2/attributegroup/M:=Gene_Expression:Specimen/stage:=left(Stage_ID)=(Vocabulary:Developmental_Stage:ID)/$M/Assay_Type,stage:Name",
                     x_col: ["Assay_Type"],
                     y_col: ["Name"],
                     // y_col: ["Name", "Name"], // to test legend changes
                     legend: ["Name 1", "Name 2"],
                 }
             ]
         }]
     },
     "specimen-histogram-vertical": {
         plots: [{
             plot_type: "histogram-vertical",
             plotly: {
                 config: {
                     modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                     displaylogo: false,
                     responsive: true
                 },
                 layout: {
                     title: "Specimen Creation Time",
                     height: 800,
                     width: 1100,
                     // showLegend: true,
                     xaxis: {
                         title: "Creation Date"
                     },
                     yaxis: {
                         type: 'log'
                     }
                 }
             },
             config: {
                 title_display_markdown_pattern: "[Specimen Creation Time](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}",
                 xaxis: {
                     title_display_markdown_pattern: "[Creation Date](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}"
                 },
                 // disable_default_legend_click: false,
                 xbins: 50
             },
             traces: [
                 // {
                 //     uri: "/ermrest/catalog/2/entity/Gene_Expression:Specimen@sort(RCT::desc::)?limit=10000",
                 //     data_col: "RCT"
                 // },
                 {
                     uri: "/ermrest/catalog/2/entity/Gene_Expression:Specimen@sort(RCT::desc::)?limit=10000",
                     data_col: "RCT"
                 }
             ]
         }]
     },
     "specimen-histogram-horizontal": {
         plots: [{
             plot_type: "histogram-horizontal",
             plotly: {
                 config: {
                     modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
                     displaylogo: false,
                     responsive: true
                 },
                 layout: {
                     title: "Specimen Creation Time",
                     height: 800,
                     width: 1100,
                     xaxis: {
                         type: 'log'
                     },
                     yaxis: {
                         title: "Creation Date"
                     }
                 }
             },
             config: {
                 title_display_markdown_pattern: "[Specimen Creation Time](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}",
                 yaxis: {
                     title_display_markdown_pattern: "[Creation Date](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}"
                 },
                 disable_default_legend_click: false,
                 ybins: 50
             },
             traces: [
                 {
                     uri: "/ermrest/catalog/2/entity/Gene_Expression:Specimen@sort(RCT::desc::)?limit=10000",
                     data_col: "RCT"
                 }
             ]
         }]
     }

 };


 if (typeof module === 'object' && module.exports && typeof require === 'function') {
     exports.config = plotConfigs;
 }
