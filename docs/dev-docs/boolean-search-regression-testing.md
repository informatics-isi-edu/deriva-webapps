## Regression Test Cases for Boolean Search

1. Querying using the Treeview:

Click on a node in the Treeview. This should populate the Anatomical source in the active row on the right and also the text in the input box on the top.
Select the Strength, Developmental Stages, Pattern and Pattern Location from the respective drop downs.
Click the plus symbol to add another filter.
Click the validate button to check the validity of all the values.
Click the Search Specimen button to open the recordset page with the applied filters in a new tab.
On the recordset page check if the Custom facet and its tooltip are in proper format as follows: strength{in "anatomical source1" FromStage..ToStage pt=pattern lc=location} AND strength{in "anatomical source2" FromStage..ToStage pt=pattern lc=location}
Clicking on the Download button should save the current query in a text file which can be pasted in the input box to get the same search results again.
You should be able to collapse/expand the treeview.
The clear button on each filter row should reset the properties for that row.
The delete button on each filter row should delete that row from the table as well as remove its corresponding filter from the textbox on top.

2. Querying using the textbox:

a) Write the query in the following format in the textbox: strength{in "anatomical source" FromStage..ToStage pt=pattern lc=location} AND strength{in "anatomical source" FromStage..ToStage pt=pattern lc=location} .
Write invalid values for each of strength, anatomical source, FromStage, ToStage, Pattern, and Location and click on validate to check if these errors are pointed to in the table.
Click the Search Specimen button to open the recordset page with the applied filters in a new tab. Also, check if the table is populated with as many rows as there are filters separated by AND keyword.

b) Select empty Pattern, Strength, Location or Stage dropdowns and check if the input query box is refected with empty values for the corresponding selection. If you click on validate it should render Invalid for the selection in the table

c) removing the Strength option from the search box and clicking validate should do validation properly and the value shown in the Strength dropdown should match the displayed value

3. Duplicate anatomical source:

If a name corresponds to multiple anatomical sources, the records pertaining to all of them should appear on the recordset page.
Example: The Anatomical Source = genitourinary system has multiple ids and the records corresponding to all of them should appear when we write the following query in the textbox: p{in "genitourinary system" TS17..TS28}

4. Anatomical source with parenthesis:

Renal Vesicle (Stage I Nephron) anatomical source has a parenthesis in its name. Querying using this in the textbox should give proper results.

5. Changing Stage dropdowns

From stage and To stage dropdowns should be in sync. If we select From stage as TS18, then check if To Stage dropdown should start from TS18.

6. Initial Load

when the page loads, the first row in boolean search should be "active" so the user can add a term from treeview without clicking a row first
