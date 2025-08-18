# Deriva web applications

Deriva Web Apps are small, standalone web applications that use other components of Deriva for displaying and visualizing data in more complex ways.

## Overview

The applications are:
|Application|Functionality|Example|
|---|---|---|
|Matrix|Display a grid to summarize available data based on combination of three different properties (specific to facebase deployment).<br><ul><li>[Documentation](docs/user-docs/matrix-app.md)</li></ul>|<img width="1701" alt="facebase-matrix" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/4f89e560-2e9c-499a-8d5f-60d7dd80ff66">|
|Plot|A general plot drawing app that can work on different tables and deployments based on the given `plot-config.js` file. Examples of plot types listed below.<ul><li>[Documentation](docs/user-docs/plot-app.md)</li><li>More details can be found in the [plot functionality document](/docs/user-docs/plot-functionality.md)</li></ul>||
||Bar Plot [example](https://dev.derivacloud.org/deriva-webapps/plot/?config=all-data-summary) on gudmap/atlas website.|<img width="1190" alt="image" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/0b0db427-e070-4e8d-a26f-7ce881c2ca3c">
||Pie Chart [example](https://www.facebase.org/deriva-webapps/plot/?config=facebase-assays-pie) on facebase website.|<img width="1135" alt="image" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/475c5a7c-43e8-4bc4-bab7-b46b5e4a6499">
||Violin Plot can be configured to display in different modes based where the app is deployed.<br><ul><li>Standalone with [no url parameters](https://dev.derivacloud.org/deriva-webapps/plot/?config=study-violin) and with [both url parameters](https://dev.derivacloud.org/deriva-webapps/plot/?config=study-violin&Study=14-3PXT&NCBI_GeneID=1)</li><li>Embedded on [study page](https://dev.derivacloud.org/chaise/record/#2/RNASeq:Study/RID=14-3PXT) and standalone with [study url parameter](https://dev.derivacloud.org/deriva-webapps/plot/?config=study-violin&Study=14-3PXT)</li><li>Embedded on [gene page](https://dev.derivacloud.org/chaise/record/#2/Common:Gene/RID=Q-3KT2) and standalone with [gene url parameter](https://dev.derivacloud.org/deriva-webapps/plot/?config=study-violin&NCBI_GeneID=1)</li></ul>|No url parameters:<br><img width="1368" alt="gudmap-violin" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/775d9671-abbf-458b-a0e4-b7c5acaa7411"><br>Study:<br><img width="1365" alt="gudmap-violin-study" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/e1cc95d5-789e-4463-be0e-994d0f2f43e7"><br>Gene:<br><img width="1412" alt="gudmap-violin-gene" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/ccc7a661-da77-4253-af8d-69d16ebd19e3">|
|||<img width="1225" alt="gudmap-plot-heatmap" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/2d7c7c0c-de07-4ae2-a360-0160d2258a6c">|
|||<img width="1201" alt="gudmap-scatterplot" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/49525b9a-17de-4f22-821b-95490f5b4d58">|
|||<img width="1128" alt="gudmap-histogram" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/2ec2549d-de87-4500-be09-22ba8197c836">|
|Boolean Search|Allows users to construct a query from a defined set of filters and navigate to recordset to apply that search query (specific to gudmap/atlas deployments).<br><ul><li>[Documentation](/docs/user-docs/boolean-search-app.md)</li><li>More details can be found in the [user guide](https://www.gudmap.org/using-gudmap/boolean-anatomy-search/)</li><li>For more information please refer to [this issue](https://github.com/informatics-isi-edu/deriva-webapps/issues/5)</li><li>Example on [atlas-d2k website](https://dev.derivacloud.org/deriva-webapps/boolean-search/)</li></ul>|<img width="1715" alt="gudmap-boolean-search" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/569e64e5-5c96-44da-9bd9-56b2f0b1f337">|
|Heatmap|Display a heatmap based on the given `heatmap-config.js` (specific to gudmap/atlas deployments).<br><ul><li>[Documentation](/docs/user-docs/heatmap-app.md)</li><li>Embedded example on [atlas-d2k website](https://dev.derivacloud.org/chaise/record/#2/Common:Gene/RID=Q-472G) for a specific gene</li><li>Standalone example on [atlas-d2k website](https://dev.derivacloud.org/deriva-webapps/heatmap/#2/Gene_Expression:Array_Data_view/NCBI_GeneID=12267)</li></ul>|<img width="1201" alt="gudmap-heatmap-app" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/4ecc86cb-b4c5-4b26-b5a1-7ad8a7605469">|
|Treeview|Display the parent-child relationship between vocabularies in a tree-like view for gudmap/atlas website.<br><ul><li>[Documentation](/treeview/)</li><li>Embedded example on [atlas-d2k website](https://dev.derivacloud.org/chaise/record/#2/Gene_Expression:Specimen/RID=N-GXA4) for a specific specimen</li><li>Annotated example on [atlas-d2k website](https://dev.derivacloud.org/deriva-webapps/treeview/?Specimen_RID=N-GXA4) with specimen url parameter</li><li>Standalone example on [atlas-d2k website](https://dev.derivacloud.org/deriva-webapps/treeview/)</li></ul>|Annotated:<br><img width="1014" alt="gudmap-treeview-annotated" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/6ed3da7c-b152-489a-987f-baa631a936d0"><br>Standalone:<br><img width="803" alt="gudmap-treeview" src="https://github.com/informatics-isi-edu/deriva-webapps/assets/2932600/21797bcf-1bc3-489a-955f-3205459c1a60">|

## Installation

See [the installation guide](docs/user-docs/installation.md)

## Help and Contact

Please direct questions and comments to the [project issue tracker](https://github.com/informatics-isi-edu/deriva-webapps/issues) at GitHub.

## License

Chaise is made available as open source under the Apache License, Version 2.0. Please see the [LICENSE file](LICENSE) for more information.
