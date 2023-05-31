# Deriva web applications

Deriva Web Apps are small, standalone web applications that use other components of Deriva for displaying and visualizing data in more complex ways.

## Overview

The applications are:

- [boolean-search](/docs/user-docs/boolean-search-app.md): Allows users to construct a query from a defined set of filters and navigate to recordset to apply that search query (specific to gudmap/atlas deployments).
  - Example on [atlas-d2k website](https://www.atlas-d2k.org/deriva-webapps/boolean-search/).
  - More details can be found in the [user guide](https://www.gudmap.org/using-gudmap/boolean-anatomy-search/).
  - For more information please refer to [this issue](https://github.com/informatics-isi-edu/deriva-webapps/issues/5)
- [heatmap](/docs/user-docs/heatmap-app.md): Display a heatmap based on the given `heatmap-config.js` (specific to gudmap/atlas deployments).
  - [Embedded example](https://www.atlas-d2k.org/chaise/record/#2/Common:Gene/RID=Q-472G) on atlas-d2k website for a specific gene.
  - [Standalone example](https://www.atlas-d2k.org/deriva-webapps/heatmap/#2/Gene_Expression:Array_Data_view/NCBI_GeneID=12267) on atlas-d2k website.
- [matrix](docs/user-docs/matrix-app.md): Display a grid to summarize available data based on combination of three different properties (specific to facebase deployment).
  - Example on [facebase website](https://dev.facebase.org/~jchudy/deriva-webapps/matrix/).
- [plot](/docs/user-docs/plot-app.md): A general plot drawing app that can work on different tables and deployments based on the given `plot-config.js` file.
  - Examples for each plot type:
    - [Bar plot](https://www.atlas-d2k.org/deriva-webapps/plot/?config=gudmap-todate-bar) on gudmap/atlas website.
    - [Pie chart](https://www.atlas-d2k.org/deriva-webapps/plot/?config=gudmap-todate-pie) on gudmap/atlas website.
    - Sample [scatterplot](https://dev.gudmap.org/~jchudy/deriva-webapps/plot/?config=specimen-scatterplot) (not in production).
    - Sample [histogram](https://dev.gudmap.org/~jchudy/deriva-webapps/plot/?config=specimen-histogram-horizontal) (not in production).
    - Violin plot has different modes based on where the app is deployed:
      - Standalone with [no url parameters](https://www.atlas-d2k.org/deriva-webapps/plot/?config=study-violin) and with [both url parameters](https://www.atlas-d2k.org/deriva-webapps/plot/?config=study-violin&Study=14-3PXT&NCBI_GeneID=1).
      - Embedded on [study page](https://www.atlas-d2k.org/chaise/record/#2/RNASeq:Study/RID=14-3PXT) and standalone with [study url parameter](https://www.atlas-d2k.org/deriva-webapps/plot/?config=study-violin&Study=14-3PXT).
      - Embedded on [gene page](https://www.atlas-d2k.org/chaise/record/#2/Common:Gene/RID=Q-3KT2) and standalone with [gene url parameter](https://www.atlas-d2k.org/deriva-webapps/plot/?config=study-violin&NCBI_GeneID=1).
  - More details can be found in the [plot functionality document](/docs/user-docs/plot-functionality.md).
- [treeview](/treview/): Display the parent-child relationship between vocabularies in a tree-like view for gudmap/atlas website.
  - [Embedded example](https://www.atlas-d2k.org/chaise/record/#2/Gene_Expression:Specimen/RID=N-GXA4) on atlas-d2k website for a specific specimen.
  - [Annotated example](https://www.atlas-d2k.org/deriva-webapps/treeview/?Specimen_RID=N-GXA4) on atlas-d2k website with specimen url parameter.
  - [Standalone example](https://www.atlas-d2k.org/deriva-webapps/treeview/) on atlas-d2k website.

## Installation

See [the installation guide](docs/user-docs/installation.md)

## Help and Contact

Please direct questions and comments to the [project issue tracker](https://github.com/informatics-isi-edu/deriva-webapps/issues) at GitHub.

## License

Chaise is made available as open source under the Apache License, Version 2.0. Please see the [LICENSE file](LICENSE) for more information.
