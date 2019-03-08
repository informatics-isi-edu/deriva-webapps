var booleanSearchConfig = {
    data: {
    },
    presentation: {
        rowLimit: 10
    },
    info: 'Following are the steps to perform custom filtering on the Gene_Expression:Specimen table. \
    \
    1.  Enter the parameters for the search. This can be done in 2 ways: \
        *   Using the Treeview: \
    \
        1.  Select an **Anatomical Source by clicking on a node in the Treeview** displayed in the left pane. Clicking a node in the Treeview would change the Anatomical Source of the current (highlighted) row. \
        2.  Select the appropriate values for **Strength, To and From Developmental Stage, Pattern**(Optional) and **Pattern Location**(Optional) from the respective dropdowns. \
        3.  You could add multiple filter rows by clicking the plus symbol on the top right corner. \
        \
        *   Entering the formatted query in the textbox: \
        \
        1.  Write each filter in the following format: **strength{in "anatomical source" FromStage..ToStage pt=pattern lc=location}** For Example: p{in "bladder" TS17..TS28 pt=regional lc=dorsal} \
        2.  Separate multiple filters with the keyword "AND". For Example: p{in "artery" TS17..TS28} AND nd{in "arteriole" TS17..TS28} \
    \
    2.  _Optional_ Click the **Validate** button to check the validity of all values before submitting the query. This would also populate the table with any filters that were added directly in the textbox. \
    3.  Click on **Search Specimen** button to submit the query. If the query contains any invalid values then they will be highlighted in the table. \
    4.  If all the values are valid, the resulting Specimen recordset page will open in a new tab. \
    5.  Use the **Save** button to store the query in a text file. This could later be pasted in the textbox to get the same results again. \
    \
    **Error Handling:** \
    \
    The following errors could occur when using the app: \
    \
    1.  **Incorrect formatting** of the query in the textbox. Please refer to the examples above. \
    2.  Invalid Anatomical source can occur in 2 cases: \
        *   The Anatomical Source entered in the textbox does not exist. \
        *   **Multiple Anatomical Sources** exist with the name you entered in the textbox. In this case, you will have to enter the ID along with the name. For Example: There are 2 Sources with the name "genitourinary system" so write either "genitourinary system (EMAPA:16367)" or "genitourinary system (UBERON:0004122)" in the text box. So the entire query will look like: **p{in "genitourinary system (EMAPA:16367)" TS17..TS28}**'
};

if (typeof module === 'object' && module.exports && typeof require === 'function') {
    exports.config = booleanSearchConfig;
}
