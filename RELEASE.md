# Release Notes

This document is a summary of code changes in Deriva Webapps. This is the vocabulary used to introduce the changes:
  - `[Added]`: newly added features.
  - `[Improved]`: additions made to an existence feature.
  - `[Changed]`: modifications to existing features.
  - `[Fixed]`: bug fixes.

# 11/02/21
  - [Improved] Plot: responsiveness when in iframe and on standalone page
  - [Changed] Plot: always choose first study instead of all studies

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
