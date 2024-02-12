# Release Notes

This document is a summary of code changes in Deriva Webapps. This is the vocabulary used to introduce the changes:
  - `[Added]`: newly added features.
  - `[Improved]`: additions made to an existence feature.
  - `[Changed]`: modifications to existing features.
  - `[Fixed]`: bug fixes.

# 2/1/24
  - [Added] Plot: Global plot layouts added. User controls and plots can be arranged in a grid layout
  - [Added] Plot: Foreign key modal popup user control added
  - [Improved] Matrix: add link and caption to cells
  - [Changed] Treeview: migrated to a hybrid solution with ReactJS navbar from chaise and the jquery UI library

# 11/27/23
  - [Fixed] Matrix: Minor bugs fixed for legend display 
  - [Improved] Matrix: Added treeview support for matrix axes

# 10/5/23
  - [Added] Plot: Linplot support added
  - [Added] Plot: Local user control layouts added. Custom dropdown user controls can be arranged in a grid layout above each plot

# 8/15/23
  - [Fixed] Matrix: Bug fixed for search input
  - [Added] Plot: Data can be fetched from a file instead of only ermrest
  - [Added] Plot: Custom Hovertemplate support for heatmap plot type

# 6/13/23
  - [Changed] Boolean Search app migrated to ReactJS. AngularJS version removed.
  - [Added] Plot: Heatmap plot type
  - [Changed] Heatmap app migrated to ReactJS. AngularJS version removed.

# 5/3/23
  - [Changed] Plot app migrated to ReactJS. AngularJS version removed.

# 2/23/23
  - [Added] Matrix app moved from chaise repo and migrated to ReactJS.

# 05/26/22
  - [Changed] Makefile uses deploy instead of install

# 11/19/21
  - [Improved] Plot: responsiveness when in iframe and on standalone page
  - [Changed] Plot: always choose first study instead of all studies
  - [Improved] Plot: studies show rowname instead of RID
  - [Added] Plot: Ability to change to log scale

# 09/22/21
 - [Improved] Plot: allow for text links in title and axis labels [PR #117](https://github.com/informatics-isi-edu/deriva-webapps/pull/117)
 - [Changed] Plot: configuration language updated to version 1.3. Deprecated properties and improved the configuration language for more consistency. See "plot/README.md" for more details. Most notably, deprecated plotly_config in favor of plotly.config.

# 06/21/21
 - [Added] Plot: basic logging support

# 06/02/21
 - [Added] General: headTitle support added to webapp configurations

# 12/01/20
 - [Improved] Plot: responsiveness of all plot types
 - [Fixed] Plot: pie chart comma separated values not showing properly, page title flashing.

# 11/05/20
 - [Changed] Plot: configuration language updated to version 1.2
 - [Added] Plot: study multi picker support

# 10/08/20
 - [Changed] Plot: configuration language updated to version 1.1.1. Templating for axis labels
 - [Added] Plot: faceting in gene picker
 - [Fixed] Treeview: print display problems

# 08/28/20
 - [Added] Plot: initial violin plot support

// end of history
