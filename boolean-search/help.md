## How to perform boolean search ##

There are 2 ways to perform boolean search of scored specimen expression:

### 1. Graphical User Interface (GUI) ###
  * Fill in the search form on the right pane by selecting appropriate values for **Strength**, **From and To Developmental Stage**, 
  **Pattern**(Optional), and **Pattern Location**(Optional) from the respective dropdown options.
  * For the <b>Anatomical Source</b>, select a term displayed in the Treeview (left pane). 
		Clicking a term in the Treeview will change the Anatomical Source of the current (highlighted) row. 
  * You can add multiple filter rows by clicking the plus symbol on the top right corner.
  * When ready, click on **Search Specimen** button to submit the query. If the query contains any invalid values then
    they will be highlighted in the table. If all the values are valid, the resulting Specimen recordset page will open in a new tab.
  * Use the <b>Save</b> button to store the query in a text file. This could later be pasted in the textbox to
    get the same results again.
   

### 2. Search String ### 
* Provide query string consisting of one or more filters. 
* Click the <b>Validate</b> button to check the validity of all values before submitting the query. 
This would also populate the table with any filters that were added directly in the textbox.
* When ready, click on **Search Specimen** button to submit the query. If the query contains any invalid values then
  they will be highlighted in the table. If all the values are valid, the resulting Specimen recordset page will open in a new tab.
* Use the <b>Save</b> button to store the query in a text file. This could later be pasted in the textbox to
    get the same results again.

#### Format ####

Each filter should conform to the following format: 

`<strength>{in <anatomical source> <from stage>..<to stage> pt=<pattern> lc=<location>}`

Multiple filters are combined using the keyword `AND`

* `<strength>` is one of the following symbols: `p` for present, `nd` for not detected, and `u` for uncertain.
* `<anatomical source>` is the anatomical name (e.g. gonad) shown in the Tree
* `<from stage>` and `<to stage>` identify the search range of specimens. Specimens without stage information will not be included. 
* `<pattern>` should be one of the symbols shown in the drop-down menu under **Pattern** in the GUI
* `<location>` should be one of the symbols shown in the drop-down menu under **Location** in the GUI

#### Examples #### 
* One filter: `p{in "bladder" TS17..TS28 pt=regional lc=dorsal}` or 
* More than one filter: `p{in "artery" TS17..TS28} AND nd{in "arteriole" TS17..TS28}`

## Error Handling ##
The following errors could occur when using the app:
* Incorrect formatting of the query in the textbox. Please refer to the examples above.
* The `Anatomical Source` entered in the textbox **does not exist**. This can be resolved by searching for the term in 
the Treeview in the left pane, and use the exact term in the textbox. 
* Invalid values of Strength, Developmental Stages, Pattern or Pattern location. These can be resolved by selecting the 
proper values from the respective dropdowns for each row.
