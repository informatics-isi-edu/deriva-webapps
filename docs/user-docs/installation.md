# Installation

## Dependencies

Deriva webapps use [ERMrestJS](https://github.com/informatics-isi-edu/ermrestjs) and [Chaise](https://github.com/informatics-isi-edu/chaise). So before installation, make sure the dependencies are properly installed.

The current implementation of each app makes different assumption about the location of Chaise/ERMrestJS. The assumptions are:

- boolean-search, lineplot, treeview: Chaise and ERMrestJS are installed in the same level as deriva-webapps.
- heatmap, plot: Chaise and ERMrestJS are installed at the root (`/chaise/` and `/ermrestjs/`)

## Deploying

1. First you need to setup some environment variables to tell Chaise where it should deploy the package. The following are the variables and their default values:

    ```
    WEB_INSTALL_ROOT=/var/www/html/
    WEBAPPS_REL_PATH=deriva-webapps/
    ```
    Which means the deriva web apps will be copied to `/var/www/html/deriva-webapps/` location by default. If that is not the case in your deployment, you should modify the variables accordingly.

    Notes:
      - All the variables MUST have a trailing `/`.

      - If you're deploying remotely, since we're using this location in `rsync` command, you can use a remote location `username@host:public_html/deriva-webapps` for this variable.

2. Build the webapps bundles by running the following command:
    ```sh
    make dist
    ```

    Notes:
    - Make sure to run this command with the owner of the current folder. If you attempt to run this with a different user, it will complain.
    - This command will also install the npm packages everytime that is called. You can skip installing npm pacakges by using `make dist-wo-deps` command instead. If you want to install npm modules in a separate command, the following make targets are available:
      - `deps`: Install the dependencies based on `NODE_ENV` environment variable (it will skip `devDependencies` if `NODE_ENV` is not defined or is "production").
      - `npm-install-all-modules`: Install all dependencies including `devDependencies` regardless of `NODE_ENV` value.

3. To deploy all the deriva web apps you can use the `deploy` target:

    ```
    $ make deploy
    ```

    Notes:
      - The following are alternative make targets that can be used for deployment:
        - `deploy-w-config`: The same as `deploy` and will aslo copy all the configuration files.
        - `deploy-boolean-search`: Only deploy boolean-search.
        - `deploy-boolean-search-w-config`: Only deploy boolean-search and copy its configuration files.
        - `deploy-heatmap`: Only deploy boolean-search and copy its configuration files.
        - `deploy-heatmap-w-config`: Only deploy boolean-search and copy its configuration files.
        - `deploy-lineplot`: Only deploy lineplot and copy its configuration files.
        - `deploy-lineplot-w-config`: Only deploy lineplot and copy its configuration files.
        - `deploy-plot`: Only deploy plot and copy its configuration files.
        - `deploy-plot-w-config`: Only deploy plot and copy its configuration files.
        - `deploy-treeview`: Only deploy treeview and copy its configuration files.
        - `deploy-treeview-w-config`: Only deploy treeview and copy its configuration files.

      - If the given directory does not exist, it will first create it. So you may need to run `make deploy` with _super user_ privileges depending on the deployment directory you choose.


## Running
  Once deployed the apps can be found at `http://<hostname>/<webapps-folder>/<app>`, where
    - `<webapps-folder>` is based on the environment variables (by default it's `deriva-webapps`)
    - `<app>` must be replaced with one of the app names (i.e., boolean-search, treeview).
