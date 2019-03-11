Following are the steps to perform custom filtering on the Gene_Expression:Specimen table.

1.  Enter the parameters for the search. This can be done in 2 ways:
    *   Using the Treeview:

    1.  Select an **Anatomical Source by clicking on a node in the Treeview** displayed in the left pane. Clicking a node in the Treeview would change the Anatomical Source of the current (highlighted) row.
    2.  Select the appropriate values for **Strength, From and To Developmental Stage, Pattern**(Optional) and **Pattern Location**(Optional) from the respective dropdowns.
    3.  You could add multiple filter rows by clicking the plus symbol on the top right corner.

    *   Entering the formatted query in the textbox:

    1.  Write each filter in the following format: **strength{in "anatomical source" FromStage..ToStage pt=pattern lc=location}** For Example: p{in "bladder" TS17..TS28 pt=regional lc=dorsal}
    2.  Separate multiple filters with the keyword "AND". For Example: p{in "artery" TS17..TS28} AND nd{in "arteriole" TS17..TS28}

2.  _Optional_ Click the **Validate** button to check the validity of all values before submitting the query. This would also populate the table with any filters that were added directly in the textbox.
3.  Click on **Search Specimen** button to submit the query. If the query contains any invalid values then they will be highlighted in the table.
4.  If all the values are valid, the resulting Specimen recordset page will open in a new tab.
5.  Use the **Save** button to store the query in a text file. This could later be pasted in the textbox to get the same results again.

**Error Handling:**

The following errors could occur when using the app:

1.  **Incorrect formatting** of the query in the textbox. Please refer to the examples above.
2.  The **Anatomical Source** entered in the textbox **does not exist**. This can be resolved by searching for the term in the treeview in the left pane.
3.  Invalid values of Strength, Developmental Stages, Pattern or Pattern location. These can be resolved by selecting the proper values from the respective dropdowns for each row.