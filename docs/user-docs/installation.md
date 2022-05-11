# Installation

## Dependencies

Deriva webapps use [ERMrestJS](https://github.com/informatics-isi-edu/ermrestjs) and [Chaise](https://github.com/informatics-isi-edu/chaise). So before installation, make sure the dependencies are properly installed.

The current implementation of each app makes different assumption about the location of Chaise/ERMrestJS. The assumptions are:

- boolean-search, lineplot, treeview: Chaise and ERMrestJS are installed in the same level as deriva-webapps.
- heatmap, plot: Chaise and ERMrestJS are installed at the root (`/chaise/` and `/ermrestjs/`)

## Deploying

1. First you need to setup some environment variables to tell Chaise where it should install the package. The following are the variables and their default values:

    ```
    WEB_INSTALL_ROOT=/var/www/html/
    WEBAPPS_REL_PATH=deriva-webapps/
    ```
    Which means the deriva web apps will be copied to `/var/www/html/deriva-webapps/` location by default. If that is not the case in your deployment, you should modify the variables accordingly.

    Notes:
      - All the variables MUST have a trailing `/`.

      - If you're installing remotely, since we're using this location in `rsync` command, you can use a remote location `username@host:public_html/deriva-webapps` for this variable.

2. After making sure the variable is propertly set, you can run the install commands. To install all the deriva web apps you can use the `install` target:

    ```
    $ make install
    ```

    Notes:
      - The following are alternative make targets that can be used for installation:
        - `install-w-config`: The same as `install` and will aslo copy all the configuration files.
        - `install-boolean-search`: Only install boolean-search.
        - `install-boolean-search-w-config`: Only install boolean-search and copy its configuration files.
        - `install-heatmap`: Only install boolean-search and copy its configuration files.
        - `install-heatmap-w-config`: Only install boolean-search and copy its configuration files.
        - `install-lineplot`: Only install lineplot and copy its configuration files.
        - `install-lineplot-w-config`: Only install lineplot and copy its configuration files.
        - `install-plot`: Only install plot and copy its configuration files.
        - `install-plot-w-config`: Only install plot and copy its configuration files.
        - `install-treeview`: Only install treeview and copy its configuration files.
        - `install-treeview-w-config`: Only install treeview and copy its configuration files.

      - If the given directory does not exist, it will first create it. So you may need to run `make install` with _super user_ privileges depending on the installation directory you choose.


## Running
  Once deployed the apps can be found at `http://<hostname>/<webapps-folder>/<app>`, where
    - `<webapps-folder>` is based on the environment variables (by default it's `deriva-webapps`)
    - `<app>` must be replaced with one of the app names (i.e., boolean-search, treeview).
