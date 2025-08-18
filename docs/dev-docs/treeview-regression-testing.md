## Treeview Regression Testing

### Standalone Treeview

Go to this [page](https://dev.derivacloud.org/deriva-webapps/treeview/) on dev-atlas and do the following:
 1. Wait for the tree to load and check that the tree shows in alphabetical order
 2. Open the first dropdown and select "TS04", the tree should update with only 5 top level nodes
 3. Open that dropdown again and change it to "All Stages", wait for the tree to update
 4. In the search box, search for "metanephros"
   - The tree should auto scroll to an opened tree node named "metanephros" that is highlighted
   - There should be a camera icon. When clicked on, a modal will open with an image displayed
   - a few other nodes should be opened that are decendants of "metanephros" with "metanephros" as part of the term
 5. Click on the "metanephros" tree node and [this record page](https://dev.derivacloud.org/chaise/record/#2/Vocabulary:Anatomy/RID=14-4RVY) should load with more info about that anatomy term


### Treeview with Specimen RID

Go to this [page](https://dev.derivacloud.org/deriva-webapps/treeview/?Specimen_RID=N-GXA4) on dev-atlas and do the following:
 1. Wait for the tree to load and check that the tree autoscrolls to an opened portion of the tree
   - Some tree nodes should be annotated with images from the left panel
   - there should be multiple annotated nodes under "nerve of bladder"
 2. One of those nodes should be "nerve of detrusor muscle of bladder" with the following annotation icons
   - Strength - Present (strong)
   - Density - High
   - Pattern - Graded
   - Density Change - Decrease, large
   - Contains note - when clicked should show a tooltip with more information
 3. Verify the headings in the side panel can be collapsed and open again
 4. In the search box, search for "metanephros"
   - The tree should auto scroll to an opened tree node named "metanephros" that is highlighted
   - There should be a camera icon. When clicked on, a modal will open with an image displayed
   - a few other nodes should be opened that are decendants of "metanephros" with "metanephros" as part of the term
 5. Click on the "metanephros" tree node and [this record page](https://dev.derivacloud.org/chaise/record/#2/Vocabulary:Anatomy/RID=14-4RVY) should load with more info about that anatomy term
