/**
 * Please Note
 * This is a sample configuration file.
 * Even more examples can be found in division repo recipes for rbk dev/staging/production
 */
var plotConfigs = {
  'study-violin': {
    // templateVariables: {
    //     $url_parameters: {
    //         Study: [{data: {}}],
    //         Gene: {data: {}}
    //     },
    //     // each row of data for graph added before templating each time
    //     // only available for the tick_display_markdown_pattern
    //     $row: response.data[index]
    // }
    headTitle: 'Study Violin Plot',
    top_right_link_text: 'Enable gene, study selectors',
    plots: [
      {
        plot_type: 'violin',
        // uri pattern with templating to fetch gene information
        //  /ermrest/catalog/2/entity/RNASeq:Replicate_Expression/Study=xxxx/(NCBI_GeneID)=(Common:Gene:NCBI_GeneID) + /NCBI_GeneID=xxxx
        gene_uri_pattern:
          '/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}{{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}}/{{/if}}(NCBI_GeneID)=(Common:Gene:NCBI_GeneID)',
        // sets up the study selector
        // /ermrest/catalog/2/entity/RNASeq:Replicate_Expression/NCBI_GeneID=xxxx/(Study)=(RNASeq:Study:RID) + /RID=xxxx
        study_uri_pattern:
          '/ermrest/catalog/2/entity/RNASeq:Replicate_Expression/NCBI_GeneID={{{$url_parameters.Gene.data.NCBI_GeneID}}}/(Study)=(RNASeq:Study:RID)',
        // base configuration for plotly
        plotly: {
          // passed directly to plotly (plotly.config)
          config: {
            modeBarButtonsToRemove: [
              'select2d',
              'lasso2d',
              'hoverClosestCartesian',
              'hoverCompareCartesian',
              'toggleSpikelines',
            ],
            displaylogo: false,
            responsive: true,
          },
          layout: {
            title: 'TPM Expression',
          },
        },
        // configuration options used to override plotly definitions
        config: {
          title_display_markdown_pattern:
            '[{{{$url_parameters.Gene.data.NCBI_Symbol}}}](/chaise/record/#{{$catalog.id}}/Common:Gene/NCBI_GeneID={{$url_parameters.Gene.data.NCBI_GeneID}}) Expression: {{#if (gt $url_parameters.Study.length 0)}}{{#if (lt $url_parameters.Study.length 6)}}{{#if (eq $url_parameters.Study.length 1)}}Study {{else}}Studies {{/if}}{{#each $url_parameters.Study}}[{{this.data.RID}}](/chaise/record/#{{$catalog.id}}/RNASeq:Study/RID={{this.data.RID}}){target=_blank}{{#unless @last}}, {{/unless}}{{/each}}{{else}}{{$url_parameters.Study.length}} Studies{{/if}}{{else}}All Studies{{/if}}',
          xaxis: {
            // list of column names for "RNASeq:Replicate_Expression" to group data by
            //   - column_name              - name of column in model
            //   - title_display_pattern    - x-axis title template pattern
            //   - tick_display_pattern     - x-axis individual tick template pattern
            //   - default                  - if set, this is the group to use as default
            group_keys: [
              {
                column_name: 'Experiment',
                title_display_pattern: 'Experiment',
                title: 'Experiment',
                tick_display_markdown_pattern:
                  '[{{{$row.Experiment}}}](/chaise/record/#2/RNASeq:Experiment/RID={{{$row.Experiment}}}): {{{$row.Experiment_Internal_ID}}}', // NOTE: this templates the value based on $row (response.data[index]) being in template environment
                legend_markdown_pattern: [
                  '[{{{$row.Experiment}}}](/chaise/record/#2/RNASeq:Experiment/RID={{{$row.Experiment}}}): {{{$row.Experiment_Internal_ID}}}',
                ],
                graphic_link_pattern: [
                  '/chaise/recordset/#2/RNASeq:Replicate_Expression/Experiment={{{$row.Experiment}}}',
                ],
                default: true,
              },
              {
                column_name: 'Experiment_Internal_ID',
                title: 'Experiment Internal ID',
                title_display_pattern: 'Experiment Internal ID',
              },
              {
                column_name: 'Replicate',
                title: 'Replicate',
                title_display_pattern: 'Replicate',
                tick_display_markdown_pattern:
                  '[{{{$row.Replicate}}}](/chaise/record/#2/RNASeq:Replicate/RID={{{$row.Replicate}}})',
              },
              {
                column_name: 'Specimen',
                title: 'Specimen',
                title_display_pattern: 'Specimen',
                tick_display_markdown_pattern:
                  '[{{{$row.Specimen}}}](/chaise/record/#2/Gene_Expression:Specimen/RID={{{$row.Specimen}}})',
              },
              {
                column_name: 'Anatomical_Source',
                title: 'Anatomical_Source',
                title_display_pattern: 'Anatomical Source',
                tick_display_markdown_pattern:
                  '{{#if $row.Anatomical_Source}}{{{$row.Anatomical_Source}}}{{else}}N/A{{/if}}',
              },
              {
                column_name: 'Sex',
                title: 'Sex',
                title_display_pattern: 'Sex',
                tick_display_markdown_pattern:
                  '{{#if $row.Sex}}[{{{$row.Sex}}}](/chaise/record/#2/Vocabulary:Sex/Name={{#encode $row.Sex}}{{/encode}}){{else}}N/A{{/if}}',
              },
              {
                column_name: 'Species',
                title: 'Species',
                title_display_pattern: 'Species',
                tick_display_markdown_pattern:
                  '[{{{$row.Species}}}](/chaise/record/#2/Vocabulary:Species/Name={{#encode $row.Species}}{{/encode}})',
              },
              {
                column_name: 'Specimen_Type',
                title: 'Specimen_Type',
                title_display_pattern: 'Specimen Type',
                tick_display_markdown_pattern:
                  '[{{{$row.Specimen_Type}}}](/chaise/record/#2/Vocab:Specimen_Type/Name={{#encode $row.Specimen_Type}}{{/encode}})',
              },
              {
                column_name: 'Stage',
                title: 'Stage',
                title_display_pattern: 'Stage',
                tick_display_markdown_pattern:
                  '{{#if $row.Stage}}[{{{$row.Stage}}}](/chaise/record/#2/Vocabulary:Developmental_Stage/Name={{#encode $row.Stage}}{{/encode}}){{else}}N/A{{/if}}',
              },
            ],
            default_all_studies_group: 'Anatomical_Source',
          },
          yaxis: {
            title_display_markdown_pattern: 'TPM (transcripts per kilobase million)',
            group_key: 'TPM',
          },
        },
        traces: [
          {
            //defining hovertemplate_display_pattern will override the tooltip display for each individual data point and remove the default tooltips that show statistical data	
            // hovertemplate_display_pattern: "Custom hover text: {{{$row.Experiment}}}",

            // The request url that has to be used to fetch the data.
            // assumes $url_parameters.Study is a set of Tuples
            // -- join Experiment to get the Experiment_Internal_ID
            //url_pattern: "/ermrest/catalog/2/attributegroup/M:=RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}({{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}})&{{/if}}NCBI_GeneID={{{$url_parameters.Gene.data.NCBI_GeneID}}}/exp:=(Experiment)=(RNASeq:Experiment:RID)/$M/Anatomical_Source,Experiment,Experiment_Internal_ID:=exp:Internal_ID,NCBI_GeneID,Replicate,Sex,Species,Specimen,Specimen_Type,Stage,Age,Starts_At,Ends_At,TPM"
            // -- use Experiment_Internal_ID from Replicate_Expression table. Should be faster

            // url_pattern:
            // '/dev.gudmap.org/~kenyshah/violin-json.json',
            // response_format: 'json',
            url_pattern:
              '/ermrest/catalog/2/attributegroup/M:=RNASeq:Replicate_Expression/{{#if (gt $url_parameters.Study.length 0)}}({{#each $url_parameters.Study}}Study={{{this.data.RID}}}{{#unless @last}};{{/unless}}{{/each}})&{{/if}}NCBI_GeneID={{{$url_parameters.Gene.data.NCBI_GeneID}}}/$M/Anatomical_Source,Experiment,Experiment_Internal_ID,NCBI_GeneID,Replicate,Sex,Species,Specimen,Specimen_Type,Stage,Age,Starts_At,Ends_At,TPM',
          },
        ],
      },
    ],
  },
  'gudmap-todate-pie': {
    headTitle: 'GUDMAP Release Status Dashboard',
    // Array of object plots to be shown on the page
    plots: [
      {
        // Values can be from :  "bar", "pie", "histogram",
        plot_type: 'pie',
        plotly: {
          config: {
            modeBarButtonsToRemove: [
              'scrollZoom',
              'zoom2d',
              'sendDataToCloud',
              'autoScale2d',
              'lasso2d',
              'select2d',
              'hoverClosestCartesian',
              'hoverCompareCartesian',
              'toggleSpikelines',
              'hoverClosestPie',
            ],
            displaylogo: false,
            responsive: true,
          },
          layout: {
            title: 'Number of GUDMAP resources released to-date',
            showLegend: true,
            legend: {
              x: 0.2,
              y: -0.6,
            },
          },
        },
        config: {
          // title_display_markdown_pattern:
          //   '[ Number of GUDMAP resources released to-date ](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          slice_label: 'value', // what to show on the slice of pie chart - value or "percent
          format_data: true, // - to use hack or not for formatting
          // disable_default_legend_click: false,
        },
        traces: [
          {
            // hovertemplate_display_pattern: "Released: {{#if true}}{{{$row.[#_Released]}}}{{/if}}<br>Data Type: {{{$row.Data_Type}}}",
            // The request url that has to be used to fetch the data.
            url_pattern: '/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26',
            // url_pattern: '/~kenyshah/gudmap-json.json',
            // response_format: 'json',
            // legend: ["Browser All Events 1","Browser All Events 2"],   // name of traces in legend
            data_col: 'Released', // name of the attribute of the data column
            legend_col: 'Data_Type', // name of the attribute of the legend column
            // legend_markdown_pattern:
            //   '[{{$self.data.Data_Type}}](/chaise/recordset/#2/{{{$self.data.Schema_Table}}}/*::facets::{{#encodeFacet}}{{{$self.data.Data_Type_Filter}}}{{/encodeFacet}}){target=_blank}',
            // graphic_link_pattern: [
            //   '/chaise/recordset/#2/{{{$self.data.Schema_Table}}}/*::facets::{{#encodeFacet}}{{{$self.data.Data_Type_Filter}}}{{/encodeFacet}}',
            // ],
          },
        ],
      },
    ],
  },
  'gudmap-todate-bar': {
    headTitle: 'GUDMAP Data Status Dashboard',
    // Array of object plots to be shown on the page
    plots: [
      {
        plot_type: 'bar',
        plotly: {
          config: {
            modeBarButtonsToRemove: [
              'scrollZoom',
              'zoom2d',
              'sendDataToCloud',
              'autoScale2d',
              'lasso2d',
              'select2d',
              'hoverClosestCartesian',
              'hoverCompareCartesian',
              'toggleSpikelines',
            ],
            displaylogo: false,
            responsive: true,
          },
          layout: {
            title: 'Number of GUDMAP resources released to date (log scale)',
            height: 500,
            width: 1200,
            showlegend: true,
            xaxis: {
              title: 'Number of Records', // plot x_axis label
              type: 'log', // optional value: tickformat should compatible with type
            },
            margin: {
              t: 30,
              l: 280,
            },
            legend: {
              traceorder: 'reversed', // order of the legend is reversed
            },
          },
        },
        config: {
          // title_display_markdown_pattern:
          //   '[Number of GUDMAP resources released to date (log scale)](https://dev.isrd.isi.edu/chaise/search){target=_blank}',
          format_data_x: true, // defualt : false - to use hack or not
          // xaxis: {
          //   title_display_markdown_pattern:
          //     '[Number of Records](https://dev.isrd.isi.edu/chaise/search){target=_blank}',
          // },
          // yaxis: {
          //   tick_display_markdown_pattern:
          //     '[{{$self.data.Data_Type}}](/chaise/recordset/#2/{{{$self.data.Schema_Table}}}){target=_blank}',
          // },
          // disable_default_legend_click: true,
        },
        traces: [
          {
            // hovertemplate_display_pattern: "Released Horizontal: {{#if true}}{{{$row.Released}}}{{/if}}",
            // The request url that has to be used to fetch the data.
            url_pattern: '/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26',
            // url_pattern: '/~kenyshah/gudmap-json.json',
            // response_format: 'json',
            legend: ['Released'], // name of traces in legend
            // legend_markdown_pattern: [
            //   '[#Released](/chaise/recordset/#2/Antibody:Antibody_Tests/){target=_blank}',
            // ],
            // graphic_link_pattern:
            //   '/chaise/recordset/#2/{{{ $self.data.Schema_Table }}}/*::facets::{{#encodeFacet}}{{{ $self.data.Data_Type_Filter }}}{{/encodeFacet}}',
            x_col: ['Released'], // column name to use for x values
            y_col: ['Data_Type'], // array of column names to use for y values
            orientation: 'h', // Optional parameter for displaying the bar chart horizontally
            textfont: {
              size: 10, // It will work till the bar size can accomodate the font size
            },
          },
        ],
      },
    ],
  },
  'gudmap-todate-bar-swapped': {
    headTitle: 'GUDMAP Data Status Dashboard',
    // Array of object plots to be shown on the page
    plots: [
      {
        plot_type: 'bar',
        plotly: {
          config: {
            modeBarButtonsToRemove: [
              'scrollZoom',
              'zoom2d',
              'sendDataToCloud',
              'autoScale2d',
              'lasso2d',
              'select2d',
              'hoverClosestCartesian',
              'hoverCompareCartesian',
              'toggleSpikelines',
            ],
            displaylogo: false,
            responsive: true,
          },
          layout: {
            title: 'Number of GUDMAP resources released to date (log scale)',
            height: 1000,
            width: 800,
            showlegend: true,
            xaxis: {
              title: 'Data_Types', // plot y_axis label
            },
            yaxis: {
              title: 'Number of Records', // plot x_axis label
              type: 'log', // optional value: tickformat should compatible with type
            },
            margin: {
              t: 30,
              b: 280,
            },
            legend: {
              traceorder: 'reversed', // order of the legend is reversed
            },
          },
        },
        config: {
          title_display_markdown_pattern: 'Number of GUDMAP resources released to date (log scale)',
          format_data_x: true, // defualt : false - to use hack or not
        },
        traces: [
          {
            hovertemplate_display_pattern: "Released Vertical: {{#if true}}{{{$row.Released}}}{{/if}}",
            // The request url that has to be used to fetch the data.
            url_pattern: '/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26',
            // url_pattern: '/~kenyshah/gudmap-csv.csv',
            // response_format: 'csv',
            legend: ['Released'], // name of traces in legend
            x_col: ['Data_Type'], // column name to use for x values
            y_col: ['Released'], // array of column names to use for y values
            orientation: 'v', // Optional parameter for displaying the bar chart horizontally
            textfont: {
              size: 10, // It will work till the bar size can accomodate the font size
            },
          },
        ],
      },
    ],
  },
  'gudmap-data-summary-responsive': {
    headTitle: 'GUDMAP Data Summary Dashboard',
    // Array of object plots to be shown on the page
    plots: [
      {
        plot_type: 'bar',
        config: {
          format_data_x: true, // defualt : false - to use hack or not
        },
        plotly: {
          layout: {
            title: 'Number of GUDMAP resources released to date (log scale)',
            margin: {
              t: 40,
              r: 0,
              b: 35,
              l: 280, // left margin for lengthy data labels.
            },
            legend: {
              traceorder: 'reversed', // order of the legend is reversed
            },
            xaxis: {
              title: 'Number of Records', // plot x_axis label
              // tickformat: ',d',     // format for the ticks. For more formatting types, see: https://github.com/d3/d3-format/blob/master/README.md#locale_format
              type: 'log', // optional value: tickformat should compatible with type
              range: [0, 4.6],
            },
            yaxis: {
              ticksuffix: '  ',
              title: 'Data_Types', // plot y_axis label
            },
          },
        },
          traces: [
            {
              // hovertemplate_display_pattern: "Released Horizontal Summary: {{#if true}}{{{$row.Released}}}{{/if}}",
              // The request url that has to be used to fetch the data.
              url_pattern: '/ermrest/catalog/2/entity/M:=Dashboard:Release_Status/Consortium=GUDMAP/!(Released=0)/!(Data_Type=Antibody)/!(Data_Type::regexp::Study%7CExperiment%7CFile)/$M@sort(ID::desc::)?limit=26',
              // url_pattern: '/~kenyshah/gudmap-json.json',
              // response_format: 'json',
              legend: ['Released'], // name of traces in legend
              x_col: ['Released'], // column name to use for x values
              y_col: ['Data_Type'], // array of column names to use for y values
              orientation: 'h', // Optional parameter for displaying the bar chart horizontally
              textfont: {
                size: 10, // It will work till the bar size can accomodate the font size
              },
            },
          ],
          // Plotly defualt buttons/actions to be removed
          plotlyDefaultButtonsToRemove: [
            'scrollZoom',
            'zoom2d',
            'sendDataToCloud',
            'autoScale2d',
            'lasso2d',
            'select2d',
            'hoverClosestCartesian',
            'hoverCompareCartesian',
            'toggleSpikelines',
          ],
        },
    ],
  },
  'specimen-scatterplot': {
    plots: [
      {
        plot_type: 'scatter',
        plotly: {
          config: {
            modeBarButtonsToRemove: [
              'scrollZoom',
              'zoom2d',
              'sendDataToCloud',
              'autoScale2d',
              'lasso2d',
              'select2d',
              'hoverClosestCartesian',
              'hoverCompareCartesian',
              'toggleSpikelines',
            ],
            displaylogo: false,
            responsive: true,
          },
          layout: {
            title: 'Specimen Stage vs Assay Type',
            height: 1100,
            width: 1200,
            showLegend: true,
            margin: {
              l: 100, // left margin for lengthy data labels.
              b: 300, // bottom margin for lengthy data labels.
            },
            xaxis: {
              title: 'Assay Type',
            },
            yaxis: {
              title: 'Stage',
            },
          },
        },
        config: {
          title_display_markdown_pattern:
            '[Specimen Stage vs Assay Type](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          xaxis: {
            title_display_markdown_pattern:
              '[Assay Type](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
            tick_display_markdown_pattern:
              '[{{$self.data.Assay_Type}}](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          },
          yaxis: {
            title_display_markdown_pattern:
              '[Stage](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
            tick_display_markdown_pattern:
              '[{{$self.data.Name}}](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          },
          disable_default_legend_click: false,
        },
        traces: [
          {
            hovertemplate_display_pattern: "Released Horizontal Summary: {{#if true}}{{{$row.[#_Released]}}}{{/if}}",
            url_pattern: '/ermrest/catalog/2/attributegroup/M:=Gene_Expression:Specimen/stage:=left(Stage_ID)=(Vocabulary:Developmental_Stage:ID)/$M/Assay_Type,stage:Name',
            // url_pattern: '/~kenyshah/scatter-json.json',
            // response_format: 'csv',
            x_col: ['Assay_Type'],
            y_col: ['Name'],
            legend: ['Name 1', 'Name 2'],
          },
        ],
      },
    ],
  },
  'specimen-histogram-vertical': {
    plots: [
      {
        plot_type: 'histogram',
        plotly: {
          config: {
            modeBarButtonsToRemove: [
              'scrollZoom',
              'zoom2d',
              'sendDataToCloud',
              'autoScale2d',
              'lasso2d',
              'select2d',
              'hoverClosestCartesian',
              'hoverCompareCartesian',
              'toggleSpikelines',
            ],
            displaylogo: false,
            responsive: true,
          },
          layout: {
            title: 'Specimen Creation Time',
            height: 800,
            width: 1100,
            // showLegend: true,
            xaxis: {
              title: 'Creation Date',
            },
            yaxis: {
              type: 'log',
            },
          },
        },
        config: {
          title_display_markdown_pattern:
            '[Specimen Creation Time](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          xaxis: {
            title_display_markdown_pattern:
              '[Creation Date](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          },
        },
        traces: [
          {
            hovertemplate_display_pattern: "Creation Date: {{{$row.RCT}}}<br>Trace1",
            url_pattern: '/ermrest/catalog/2/entity/Gene_Expression:Specimen@sort(RCT::desc::)?limit=10000',
            // url_pattern: 'https://dev.gudmap.org/~kenyshah/histogram-json.json',
            // response_format: 'json',
            data_col: 'RCT',
            orientation: 'v',
            nbinsx: 50,
          },
          {
            hovertemplate_display_pattern: "Creation Date: {{{$row.RCT}}}<br>Trace2",
            url_pattern: '/ermrest/catalog/2/entity/Gene_Expression:Specimen@sort(RCT::desc::)?limit=10000',
            // url_pattern: 'https://dev.gudmap.org/~kenyshah/histogram-csv.csv',
            // response_format: 'csv',
            data_col: 'RCT',
            orientation: 'v',
            nbinsx: 50,
          },
        ],
      },
    ],
  },
  'specimen-histogram-horizontal': {
    plots: [
      {
        plot_type: 'histogram',
        plotly: {
          config: {
            modeBarButtonsToRemove: [
              'scrollZoom',
              'zoom2d',
              'sendDataToCloud',
              'autoScale2d',
              'lasso2d',
              'select2d',
              'hoverClosestCartesian',
              'hoverCompareCartesian',
              'toggleSpikelines',
            ],
            displaylogo: false,
            responsive: true,
          },
          layout: {
            title: 'Specimen Creation Time',
            height: 800,
            width: 1100,
            xaxis: {
              type: 'log',
            },
            yaxis: {
              title: 'Creation Date',
            },
          },
        },
        config: {
          title_display_markdown_pattern:
            '[Specimen Creation Time](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          yaxis: {
            title_display_markdown_pattern:
              '[Creation Date](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          },
          disable_default_legend_click: false,
        },
        traces: [
          {
            hovertemplate_display_pattern: "Creation Date: {{{$row.RCT}}}<br>Horizontal",
            url_pattern: '/ermrest/catalog/2/entity/Gene_Expression:Specimen@sort(RCT::desc::)?limit=10000',
            // url_pattern: '/~kenyshah/histogram-csv.csv',
            // response_format: 'csv',
            data_col: 'RCT',
            orientation: 'h',
            nbinsy: 50,
          },
        ],
      },
    ],
  },
  "heatmap": {
    plots: [{
      plot_type: "heatmap",
      plotly: {
        config: {
          modeBarButtonsToRemove: ["scrollZoom", "zoom2d", "sendDataToCloud", "autoScale2d", "lasso2d", "select2d", "hoverClosestCartesian", "hoverCompareCartesian", "toggleSpikelines"],
          displaylogo: false,
          responsive: true
        },
        layout: {
          title: "Plot Heatmap",
          height: 1100,
          width: 1200,
          showLegend: true,
          margin: {
            l: 100,  // left margin for lengthy data labels.
            b: 300   // bottom margin for lengthy data labels.
          },
          xaxis: {
            tickangle: 90,
            tickfont: {
              size: 12,
              family: "Lucida Console"
            }
          },
          yaxis: {
            tickfont: {
              size: 12,
              family: "Lucida Console"
            }
          }
        }
      },
      config: {
        /**
         * Heatmap plot has the support for following features:
         * title_display_markdown_pattern : Custom Heatmap title, xaxis and yaxis title(clickable)
         * tick_display_markdown_pattern : Custom tick text(clickable) for x axis and y axis
         * */
        // title_display_markdown_pattern: '[ title ](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
        xaxis: {
          // tick_display_markdown_pattern:
          //   '[{{$self.data.Label}}](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          // title_display_markdown_pattern: '[ title x ](https://dev.isrd.isi.edu/chaise/search){target=_blank}',
        },
        yaxis: {
          // tick_display_markdown_pattern:
          //   '[{{$self.data.Probe_Set_Name}}](/chaise/recordset/#2/RNASeq:Replicate_Expression){target=_blank}',
          // title_display_markdown_pattern: '[ title y ](https://dev.isrd.isi.edu/chaise/search){target=_blank}',
        },
      },
      traces: [
        {
          graphic_link_pattern:
            ['/chaise/recordset/#2/RNASeq:Replicate_Expression'],
          hovertemplate_display_pattern: "Label: {{{$row.Label}}}<br>Probe Name: {{{$row.Probe_Set_Name}}}<br>Value: {{{$row.Value}}}<br>Gene ID: {{{$url_parameters.Gene.data.NCBI_GeneID}}}",
          url_pattern: '/ermrest/catalog/2/entity/Gene_Expression:Array_Data_view/NCBI_GeneID={{{$url_parameters.Gene.data.NCBI_GeneID}}}&Section_Ordinal=3',
          // url_pattern: '/~kenyshah/heatmap-csv.csv',
          // response_format: 'csv',
          x_col: ["Label"],
          y_col: ["Probe_Set_Name"],
          z_col: ["Value"]
        }
      ]
    }]
  },
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
  exports.config = plotConfigs;
}
