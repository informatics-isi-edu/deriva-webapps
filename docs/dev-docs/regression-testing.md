## Regression Testing

### Plot App

#### Violin Plot
Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=study-violin) on gudmap-dev and do the following:
1. Use `violin-plot` configuration from `plot-test-config` file to test normal violin plot wihout any templating.
2. Use `violin-plot-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. Below given are the parameters that can be passed to use these markdown and templates. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/violin.csv`.  
- Test data files for `violin-plot` are `violin.csv` and `violin.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- In violin plot configuration, `legend_markdown_pattern` & `graphic_markdown_pattern` are defined individually inside `groups_keys` array for the `Experiment` case.
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links (This is for the default page load of violin plot):
    `title_markdown_pattern` (Action on click of plot title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    `xaxis`: {
        `title_markdown_pattern` (Action on click of x axis title):   'Experiment'
        `tick_markdown_pattern` (Action on click of x axis tick label):  https://dev.gudmap.org/chaise/record/#2/RNASeq:Experiment/RID=14-3PY4
    }
    `yaxis`: {
        `title_markdown_pattern`(Action on click of y axis title):  https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    }
    `legend_markdown_pattern` (Action on click of legend name):  https://dev.gudmap.org/chaise/record/#2/RNASeq:Experiment/RID=14-3PY4
    `graphic_markdown_pattern` (Action on click of plot graphics):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression/Experiment=14-3PY4
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Custom hover text: 14-3PY4`
- **NOTE**: The `hover_template_display_pattern` parameter for the violin plot exclusively customizes the hover text for the data points (Scatter plot) within the violin plot, excluding customization for other plots like the box plot within the same visualization.

##### Only a Study url parameter

Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=study-violin&Study=16-2CNW) on gudmap-dev and do the following:
 1. Plot title should have the Study RID in it.
 2. Change "Group By" to "Anatomical Source" and make sure the data in the plot changes.
 3. Click the "Gene" selector and select the "Ccna1" gene and make sure the plot updates.
 4. Click the link in the top right corner, this should bring you to a page with url "https://dev.gudmap.org/deriva-webapps/plot/?config=study-violin".

For the case of iframes, go to [this page](https://dev.gudmap.org/chaise/record/#2/RNASeq:Study/RID=16-2CNW) on gudmap-dev and redo steps 1-4 above.

##### Only a NCBI_GeneID url parameter

Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=study-violin&NCBI_GeneID=20472) on gudmap-dev and do the following:
 1. Plot title should have a Study RID in it.
 2. Change "Group By" to "Anatomical Source" and make sure the data in the plot changes.
 3. Click the "x" and remove the selected study. Plot should have no data shown and title "No Data".
 4. Click "Select Some" in the "Study" selector row and choose the first 2 rows ("16-2CNW" and "16-DMQA"), then hit "Save". Plot should show data with 2 RIDs in the title.
 5. Click the "x" and remove only 1 selected study. Make sure the plot updates the displayed data and the title changes.
 6. Click "Select Some" and remove the only selected row and hit "Save". Plot should have no data shown and title "No Data".
 7. Click "Select Some" in the "Study" selector row and choose the first row, then hit "Save". Plot should show data.
 8. Click "Clear All Studies". Plot should have no data shown and title "No Data".
 9. Click "Select All". Plot should show data with "All Studies" in the title.
 10. Click "Clear All Studies". Plot should have no data shown and title "No Data".
 11. Click the link in the top right corner, this should bring you to a page with url "https://dev.gudmap.org/deriva-webapps/plot/?config=study-violin".

For the case of iframes, go to [this page](https://dev.gudmap.org/chaise/record/#2/Common:Gene/RID=Q-4FTJ) on gudmap-dev and redo steps 1-11 above.

##### Both parameters

Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=study-violin&NCBI_GeneID=20472&Study=16-2CNW) on gudmap-dev and do the following:
 1. Plot title should have the Study RID in it.
 2. Change "Group By" to "Anatomical Source" and make sure the data in the plot changes.
 3. Click the "Gene" selector and select the "Ccna1" gene and make sure the plot updates.
 4. Click the "x" and remove the selected study. Plot should have no data shown and title "No Data".
 5. Click "Select Some" in the "Study" selector row and choose the first 2 rows ("16-2CNW" and "16-DMQA"), then hit "Save". Plot should show data with 2 RIDs in the title.
 6. Click the "x" and remove only 1 selected study. Make sure the plot updates the displayed data and the title changes.
 7. Click "Select Some" and remove the only selected row and hit "Save". Plot should have no data shown and title "No Data".
 8. Click "Select Some" in the "Study" selector row and choose the first row, then hit "Save". Plot should show data.
 9. Click "Clear All Studies". Plot should have no data shown and title "No Data".
 10. Click "Select All". Plot should show data with "All Studies" in the title.
 11. Click "Clear All Studies". Plot should have no data shown and title "No Data".
 12. Click the link in the top right corner, this should bring you to a page with url "https://dev.gudmap.org/deriva-webapps/plot/?config=study-violin".

##### no parameters

Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=study-violin) on gudmap-dev and do the following:
 1. Plot title should have a Study RID in it.
 2. Change "Group By" to "Anatomical Source" and make sure the data in the plot changes.
 3. Click the "x" and remove the selected study. Plot should have no data shown and title "No Data".
 4. Click the "Gene" selector and search for the "Six2" gene. Click the row with "Gene ID" "20472". The plot should still show "No Data" since no study is selected.
 5. Click "Select Some" in the "Study" selector row and choose the first 2 rows ("16-2CNW" and "16-DMQA"), then hit "Save". Plot should show data with 2 RIDs in the title.
 6. Click the "x" and remove only 1 selected study. Make sure the plot updates the displayed data and the title changes.
 7. Click "Select Some" and remove the only selected row and hit "Save". Plot should have no data shown and title "No Data".
 8. Click "Select Some" in the "Study" selector row and choose the first row, then hit "Save". Plot should show data.
 9. Click "Clear All Studies". Plot should have no data shown and title "No Data".
 10. Click "Select All". Plot should show data with "All Studies" in the title.
 11. Click "Clear All Studies". Plot should have no data shown and title "No Data".
 12. Verify there is no link in the top right corner.


#### Bar Plot
### gudmap-todate-bar
A Horizontal bar plot - Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=gudmap-todate-bar) 
1. Use `bar-plot` configuration from `plot-test-config` file to test normal bar plot wihout any templating.
2. Use `bar-plot-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/gudmap.csv`.  
- Test data files for `gudmap-todate-bar-swapped` are `gudmap.csv` and `gudmap.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links:
    `title_markdown_pattern` (Action on click of plot title):   https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
    `xaxis`: {
        `title_markdown_pattern` (Action on click of x axis title):   https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
    }
    `yaxis`: {
        `title_markdown_pattern`(Action on click of y axis title):  https://dev.gudmap.org/chaise/recordset/#2/Gene_Expression:Specimen
        `tick_markdown_pattern` (Action on click of y axis tick label):  (As per the tick label clicked) https://dev.gudmap.org/chaise/recordset/#2/Gene_Expression:Specimen
    }
    `legend_markdown_pattern` (Action on click of legend name):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests@sort(RID)
    `graphic_markdown_pattern` (Action on click of plot graphics):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests/*::facets::
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Released Horizontal: 41`


#### gudmap-todate-bar-swapped
A vertical bar plot - Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=gudmap-todate-bar-swapped)
1. Use `bar-swapped-plot` configuration from `plot-test-config` file to test normal bar plot wihout any templating.
2. Use `bar-swapped-plot-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. Below given are the parameters that can be passed to use these markdown templates. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/gudmap.csv`.  
- Test data files for `gudmap-todate-bar-swapped` are `gudmap.csv` and `gudmap.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links:
    `title_markdown_pattern` (Action on click of plot title):   https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
    `xaxis`: {
        `title_markdown_pattern` (Action on click of x axis title):   https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
        `tick_markdown_pattern` (Action on click of x axis tick label):  (As per the tick label clicked) https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Study@sort(RMT::desc::,RID)
    }
    `yaxis`: {
        `title_markdown_pattern`(Action on click of y axis title):  https://dev.gudmap.org/chaise/recordset/#2/Gene_Expression:Specimen
    }
    `legend_markdown_pattern` (Action on click of legend name):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests@sort(RID)
    `graphic_markdown_pattern` (Action on click of plot graphics):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests/*::facets::
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Released Vertical: 49`


#### gudmap-data-summary-responsive
Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=gudmap-data-summary-responsive)
1. Use `bar-gudmap-data-summary-responsive` configuration from `plot-test-config` file to test normal bar plot wihout any templating.
2. Use `bar-gudmap-data-summary-responsive-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. Below given are the parameters that can be passed to use these markdown and templates. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/gudmap.csv`.  
- Test data files for `gudmap-data-summary-responsive` are `gudmap.csv` and `gudmap.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links:
    `title_markdown_pattern` (Action on click of plot title):   https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
    `xaxis`: {
        `title_markdown_pattern` (Action on click of x axis title):   https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
    }
    `yaxis`: {
        `title_markdown_pattern`(Action on click of y axis title):  https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
        `tick_markdown_pattern` (Action on click of y axis tick label):  (As per the tick label clicked) https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Study@sort(RMT::desc::,RID)
    }
    `legend_markdown_pattern` (Action on click of legend name):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests@sort(RID)
    `graphic_markdown_pattern` (Action on click of plot graphics):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests/*::facets::
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Released Horizontal Summary: 60`

#### Pie Plot
Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=gudmap-todate-pie)
1. Use `pie-plot` configuration from `plot-test-config` file to test normal bar plot wihout any templating.
2. Use `pie-plot-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. Below given are the parameters that can be passed to use these markdown and templates. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/gudmap.csv`.  
- Test data files for `pie-plot` are `gudmap.csv` and `gudmap.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links:
    `title_markdown_pattern` (Action on click of plot title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    `legend_markdown_pattern` (Action on click of legend name):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests@sort(RID)
    `graphic_markdown_pattern` (Action on click of plot graphics):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests/*::facets::
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Released: 11232<br>Data Type: Imaging: In-situ hybridization (ISH)`

#### Scatter Plot
Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=specimen-scatterplot)
1. Use `scatter-plot` configuration from `plot-test-config` file to test normal bar plot wihout any templating.
2. Use `scatter-plot-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. Below given are the parameters that can be passed to use these markdown and templates. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/scatter.csv`.  
- Test data files for `scatter-plot` are `scatter.csv` and `scatter.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links:
    `title_markdown_pattern` (Action on click of plot title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    `xaxis`: {
        `title_markdown_pattern` (Action on click of x axis title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression?pcid=app/plot&ppid=1s7y1mhy24sj2i1p1tpu2o4r
        `tick_markdown_pattern` (Action on click of x axis tick label):  https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression?pcid=app/plot&ppid=1s7y1mhy24sj2i1p1tpu2o4r
    }
    `yaxis`: {
        `title_markdown_pattern`(Action on click of y axis title):  https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression?pcid=app/plot&ppid=1s7y1mhy24sj2i1p1tpu2o4r
        `tick_markdown_pattern` (Action on click of y axis tick label):  https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression?pcid=app/plot&ppid=1s7y1mhy24sj2i1p1tpu2o4r
    }
    `graphic_markdown_pattern` (Action on click of plot graphics):  https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Assay Type: TG, Name: TS22`

#### Histogram
#### specimen-histogram-vertical
Vertical histogram plot - Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=specimen-histogram-vertical)
1. Use `vertical-histogram-plot` configuration from `plot-test-config` file to test normal bar plot wihout any templating.
2. Use `vertical-histogram-plot-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. Below given are the parameters that can be passed to use these markdown and templates. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/histogram.csv`.  
- Test data files for `vertical-histogram-plot` are `histogram.csv` and `histogram.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links:
    `title_markdown_pattern` (Action on click of plot title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    `xaxis`: {
        `title_markdown_pattern` (Action on click of x axis title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    }
    `yaxis`: {
        `title_markdown_pattern`(Action on click of y axis title):  https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    }
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Creation Date: Aug 13,2020<br>Vertical`

#### specimen-histogram-horizontal
Horizontal histogram plot - Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=specimen-histogram-horizontal)
1. Use `horizontal-histogram-plot` configuration from `plot-test-config` file to test normal bar plot wihout any templating.
2. Use `horizontal-histogram-plot-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. Below given are the parameters that can be passed to use these markdown and templates. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/histogram.csv`.  
- Test data files for `horizontal-histogram-plot` are `histogram.csv` and `histogram.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links:
    `title_markdown_pattern` (Action on click of plot title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    `xaxis`: {
        `title_markdown_pattern` (Action on click of x axis title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    }
    `yaxis`: {
        `title_markdown_pattern`(Action on click of y axis title):  https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    }
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Creation Date: Aug 13,2020<br>Horizontal`

#### Heatmap Plot
##### NCBI_GeneID url parameter
Heatmap plot - Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=heatmap&NCBI_GeneID=12267) to see the heatmap for specified gene id.
1. Use `heatmap-plot` configuration from `plot-test-config` file to test normal bar plot wihout any templating.
2. Use `heatmap-plot-w-links` configuration from `plot-test-config` file to test the templates and markdown patterns. Below given are the parameters that can be passed to use these markdown and templates. 
- To test the url_pattern replace the `<user directory>` with testing user's directory. For instance, `/~jchudy/plot-test-data/heatmap.csv`.  
- Test data files for `heatmap-plot` are `heatmap.csv` and `heatmap.json` under `Plot` folder of `deriva-ui-test-data` repository (https://github.com/informatics-isi-edu/deriva-ui-test-data).
- The below given parameters outline the options for utilizing these markdown and templates, along with the corresponding redirection links:
    `title_markdown_pattern` (Action on click of plot title):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    `xaxis`: {
        `title_markdown_pattern` (Action on click of x axis title):   https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
        `tick_markdown_pattern` (Action on click of x axis tick label):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    }
    `yaxis`: {
        `title_markdown_pattern`(Action on click of y axis title):  https://dev.isrd.isi.edu/chaise/search?pcid=app/plot&ppid=2j3z23oc1vqv1rab1jax1mx1
        `tick_markdown_pattern` (Action on click of y axis tick label):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    }
    `legend_markdown_pattern` (Action on click of legend name):  https://dev.gudmap.org/chaise/recordset/#2/Antibody:Antibody_Tests@sort(RID)
    `graphic_markdown_pattern` (Action on click of plot graphics):   https://dev.gudmap.org/chaise/recordset/#2/RNASeq:Replicate_Expression@sort(ID)
    `hover_template_display_pattern` (Text to be displayed on hovering the plot):  `Label: E11.5_MetanephMes_7105<br>Probe Name: 1442082_at<br>Value: 7.24869<br>Gene ID: 12267`
- NOTE: legend_markdown_pattern isn't working as expected

##### no parameters

Go to [this page](https://dev.gudmap.org/deriva-webapps/plot/?config=heatmap) on gudmap-dev:
- Plot should have no data shown and title "No Data".


##### General Notes
- If `hover_template_display_pattern` will have any keys that are invalid then that value will not be shown. Other valid keys wil be shown with the generated values with a warning alert on top of the plot saying `Invalid key provided for hover template display pattern!`
- When specifying a file in the `url_pattern` parameter, you have the option to indicate the file type using the `response_format` field. However, it's important to note that this parameter is not mandatory. If the `response_format` is not specified, the code will still attempt to parse the file, assuming it's a valid `csv` or `json` file.
- Consider these error warnings to be prompted on top of the plot when:
    - When the `url_pattern` points to a file of type `csv`, and the `response_format` is specified as `json`, the following alert warning will be displayed: `The response data format from 'url_pattern' does not match the 'response_format' configuration property while attempting to parse the data as 'json'.`
    - When the `url_pattern` points to a file of type `json`, and the `response_format` is specified as `csv`, the following alert warning will be shown: `The response data format from 'url_pattern' does not match the 'response_format' configuration property while attempting to parse the data as 'csv'.`
    - If the `url_pattern` points to a file that is not a valid type (neither `csv` nor `json`), and no `response_format` is specified, an alert warning will be displayed: `Invalid format of response data from 'url_pattern' while attempting to parse data as 'json'. Additionally, no data is available for the plot.`
    - If the `response_format` contains a value other than the valid types [`csv`, `json`], an alert warning will be shown, stating: `Invalid value for 'response_format', expected 'csv' or 'json'.`
    - **NOTE**: In certain cases where the `url_pattern` does not match the specified `response_format`, the system currently displays two distinct errors: one specifically addressing the mismatch between `json` or `csv`, and the other indicating the general issue of an `invalid format of response data.` This needs to be fixed.

    ###### Plot Responsiveness
    When the screen size is below `1000px`( i.e the screen width threshold) the plots that have the legend array being passed into layout object will be displayed horizontally and at the bottom of the plot.  
    - The legend text will be wrapped based on the screen size, ensuring that the width of the legends is limited to a certain value relative to the plot area. This prevents the legends from occupying excessive space and affecting the visibility of the plot along with resizing window handling. 
    - The following is the step function responsible for determining the width of the legend and the wrapping limit: 
    - If screen is `less than 1000px` and legend is 50% of plot area then wrap the text upto `30` characters 
    which will make the legend of minimum possible width
    - If the number of violins is `less than or equal to 7 and the width-to-plot-width ratio is greater than 0.40`, 
    the legendNames array is modified similarly to the previous step, but using the character limit (i.e 80)
    - If the number of violins is `between 7 and 30 (inclusive) and the width-to-plot-width ratio is greater than 0.30`, 
    the legendNames array is modified similarly to the previous step, but using the character limit (i.e 65)
    - If the number of violins is `greater than 30 and the width-to-plot-width ratio is greater than 0.3`,
    the legendNames array is modified similarly to the previous step, but using the character limit (i.e 30)
