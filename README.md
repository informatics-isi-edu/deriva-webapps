# Deriva web applications

Small web applications that use other components of Deriva. 

# Overview

The applications are:

- [boolean-search](/boolean-search/): Allows users to construct structured filter and navigate to recordset. For more information please refer to [this issue](https://github.com/informatics-isi-edu/deriva-webapps/issues/5) (specific to RBK deployment.)
- [heatmap](/heatmap/): Display a heatmap based on the given `heatmap-config.js` (specific to RBK deployment.)
- [lineplot](/lineplot/): Display a line plot for the given columns in the `lineplot-config.js` (specific to RBK deployment.)
- [plot](/plot/): A general plot drawing app that can work on different tables and deployments based on the given `plot-config.js` file.
- [treeview](/treview/): Display the parent-child relationship between vocabularies in a tree-like view for RBK deployment.

# Installation

## Depdencencies

Deriva webapps use [ERMrestJS](https://github.com/informatics-isi-edu/ermrestjs) and [Chaise](https://github.com/informatics-isi-edu/chaise). So before installation, make sure the dependencies are properly installed.

The current implementation of each app makes different assumption about the location of Chaise/ERMrestJS. The assumptions are:

- boolean-search, lineplot, treeview: Chaise and ERMrestJS are installed in the same level as deriva-webapps.
- heatmap, plot: Chaise and ERMrestJS are installed at the root (`/chaise/` and `/ermrestjs/`)

## Deploying

1. First you need to setup an environment variables that tells us where we should install the package.

    ```
    WEBAPPSDIR=/var/www/html/deriva-webapps
    ```
    Notes: 
      - If you're installing remotely, since we're using this location in `rsync` command, you can use a remote location `username@host:public_html/deriva-webapps` for this variable.
    
2. After making sure the variable is propertly set, run teh following command:
    
    ```
    $ make install
    ```
  
    Notes:
      - If the given directory does not exist, it will first create it. So you may need to run `make install` with _super user_ privileges depending on the installation directory you choose.
  

## Running
  Once deployed the apps can be found at `http://<hostname>/deriva-webapps/<app>`, where `<app>` must be replaced with one of the app names (i.e., boolean-search, treeview).


# Testing

1. Make sure the test dependencies are installed by running the following command:

    ```
    $ make testsetup
    ```
  
2. Run the tests:
  
    ```
    $ make test
    ```
