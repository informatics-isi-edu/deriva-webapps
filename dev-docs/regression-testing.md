## Regression Testing

### Plot App

#### Violin Plot

##### Only a Study url parameter

Go to [this page](https://staging.gudmap.org/deriva-webapps/plot/?config=study-violin&Study=16-2CNW) on gudmap-staging and do the following:
 1. Plot title should have the Study RID in it.
 2. Change "Group By" to "Anatomical Source" and make sure the data in the plot changes.
 3. Click the "Gene" selector and select the "Ccna1" gene and make sure the plot updates.
 4. Click the link in the top right corner, this should bring you to a page with url "https://staging.gudmap.org/deriva-webapps/plot/?config=study-violin".

##### Only a NCBI_GeneID url parameter

Go to [this page](https://staging.gudmap.org/deriva-webapps/plot/?config=study-violin&NCBI_GeneID=20472) on gudmap-staging and do the following:
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
 11. Click the link in the top right corner, this should bring you to a page with url "https://staging.gudmap.org/deriva-webapps/plot/?config=study-violin".

##### Both parameters

Go to [this page](https://staging.gudmap.org/deriva-webapps/plot/?config=study-violin&NCBI_GeneID=20472&Study=16-2CNW) on gudmap-staging and do the following:
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
 12. Click the link in the top right corner, this should bring you to a page with url "https://staging.gudmap.org/deriva-webapps/plot/?config=study-violin".

##### no parameters

Go to [this page](https://staging.gudmap.org/deriva-webapps/plot/?config=study-violin) on gudmap-staging and do the following:
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
