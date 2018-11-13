requirejs.config({
    "baseURL": "../jstree",
    "paths": {
        "jquery": "../util/jquery",
        "jquery-ui": "../util/jquery-ui",
        "jstree": "../util/jstree",
        "jstreegrid": "../util/jstreegrid"
    },
    "waitSeconds": 200,
    shim: {
        "jquery-ui": {
            exports: "$",
            deps: ['jquery']
        }
    }
});
require(["main"]);