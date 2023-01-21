# Disable built-in rules
.SUFFIXES:

# set the default target to install
.DEFAULT_GOAL:=install

# make sure NOD_ENV is defined (use production if not defined or invalid)
ifneq ($(NODE_ENV),development)
NODE_ENV:=production
endif

# env variables needed for installation
WEB_URL_ROOT?=/
WEB_INSTALL_ROOT?=/var/www/html/
ERMRESTJS_REL_PATH?=ermrestjs/
CHAISE_REL_PATH?=chaise/
WEBAPPS_REL_PATH?=deriva-webapps/

WEBAPPSDIR:=$(WEB_INSTALL_ROOT)$(WEBAPPS_REL_PATH)

#base paths
CHAISE_BASE_PATH:=$(WEB_URL_ROOT)$(CHAISE_REL_PATH)
ERMRESTJS_BASE_PATH:=$(WEB_URL_ROOT)$(ERMRESTJS_REL_PATH)
WEBAPPS_BASE_PATH:=$(WEB_URL_ROOT)$(WEBAPPS_REL_PATH)

# the source code
SOURCE=src

# where created bundles will reside
DIST=dist

# react bundle location
DIST_REACT=$(DIST)/react
REACT_BUNDLES_FOLDERNAME=bundles
REACT_BUNDLES=$(DIST_REACT)/$(REACT_BUNDLES_FOLDERNAME)

# where config files are defined
CONFIG=config

# version number added to all the assets
BUILD_VERSION:=$(shell date -u +%Y%m%d%H%M%S)
# build version will change everytime make all or install is called
$(BUILD_VERSION):

.PHONY: clean
clean:
	@rm -rf $(DIST) || true

# install packages (honors NOD_ENV)
# using clean-install instead of install to ensure usage of pacakge-lock.json
.PHONY: npm-install-modules
npm-install-modules:
	@npm clean-install

# install packages needed for production and development (including testing)
# --production=false makes sure to ignore NODE_ENV and install everything
.PHONY: npm-install-all-modules
npm-install-all-modules:
	@npm clean-install --production=false

# install packages (honors NOD_ENV)
# using clean-install instead of install to ensure usage of pacakge-lock.json
.PHONY: deps
deps: npm-install-modules

.PHONY: lint
lint: $(SOURCE)
	@npx eslint src --ext .ts,.tsx --quiet

.PHONY: lint-w-warn
lint-w-warn: $(SOURCE)
	@npx eslint src --ext .ts,.tsx

# Rule to create the package.
.PHONY: dist-wo-deps
dist-wo-deps: print-variables run-webpack

# Rule to install the dependencies and create the pacakge
$(DIST): deps dist-wo-deps

# run webpack to build react-based bundles
run-webpack: $(BUILD_VERSION)
	$(info - creating webpack bundles)
	@npx webpack --config ./webpack/main.config.js --env BUILD_VARIABLES.BUILD_VERSION=$(BUILD_VERSION) --env BUILD_VARIABLES.WEBAPPS_BASE_PATH=$(WEBAPPS_BASE_PATH) --env BUILD_VARIABLES.CHAISE_BASE_PATH=$(CHAISE_BASE_PATH) --env BUILD_VARIABLES.ERMRESTJS_BASE_PATH=$(ERMRESTJS_BASE_PATH)

#exclude <app>-config.js to not override one on deployment
.PHONY: deploy
deploy: dont_deploy_in_root print-variables deploy-boolean-search deploy-heatmap deploy-lineplot deploy-plot deploy-treeview deploy-matrix

.PHONY: deploy-w-config
deploy-w-config:dont_deploy_in_root print-variables deploy-boolean-search-w-config deploy-heatmap-w-config deploy-lineplot-w-config deploy-plot-w-config deploy-treeview-w-config deploy-matrix-w-config

.PHONY: deploy-boolean-search
deploy-boolean-search: dont_deploy_in_root print-variables
	$(info - deploying boolean-search)
	@rsync -avz --exclude='/boolean-search/booleansearch-config*' boolean-search $(WEBAPPSDIR)

.PHONY: deploy-boolean-search-w-config
deploy-boolean-search-w-config: dont_deploy_in_root print-variables
	$(info - deploying boolean-search with the existing config file(s))
	@rsync -avz boolean-search $(WEBAPPSDIR)

.PHONY: deploy-heatmap
deploy-heatmap: dont_deploy_in_root print-variables
	$(info - deploying heatmap)
	@rsync -avz --exclude='/heatmap/heatmap-config*' heatmap $(WEBAPPSDIR)

.PHONY: deploy-heatmap-w-config
deploy-heatmap-w-config: dont_deploy_in_root print-variables
	$(info - deploying heatmap with the existing config file(s))
	@rsync -avz heatmap $(WEBAPPSDIR)

.PHONY: deploy-lineplot
deploy-lineplot: dont_deploy_in_root print-variables
	$(info - deploying lineplot)
	@rsync -avz --exclude='/lineplot/lineplot-config*' lineplot $(WEBAPPSDIR)

.PHONY: deploy-lineplot-w-config
deploy-lineplot-w-config: dont_deploy_in_root print-variables
	$(info - deploying lineplot with the existing config file(s))
	@rsync -avz lineplot $(WEBAPPSDIR)

.PHONY: deploy-plot
deploy-plot: dont_deploy_in_root print-variables
	$(info - deploying plot)
	@rsync -avz --exclude='/plot/plot-config*' plot $(WEBAPPSDIR)

.PHONY: deploy-plot-w-config
deploy-plot-w-config: dont_deploy_in_root print-variables
	$(info - deploying plot with the existing config file(s))
	@rsync -avz plot $(WEBAPPSDIR)

.PHONY: deploy-treeview
deploy-treeview: dont_deploy_in_root print-variables
	$(info - deploying treeview)
	@rsync -avz --exclude='/treeview/treeview-config*' treeview $(WEBAPPSDIR)

.PHONY: deploy-treeview-w-config
deploy-treeview-w-config: dont_deploy_in_root print-variables
	$(info - deploying treeview with the existing config file(s))
	@rsync -avz treeview $(WEBAPPSDIR)

.PHONY: deploy-matrix
deploy-matrix: dont_deploy_in_root print-variables deploy-bundles
	$(info - deploying matrix)
	@rsync -avz $(DIST_REACT)/matrix/ $(WEBAPPSDIR)/matrix/

.PHONY: deploy-matrix-w-config
deploy-matrix-w-config: dont_deploy_in_root print-variables deploy-matrix deploy-config-folder

# rsync the config files used by react apps.
.PHONY: deploy-config-folder
deploy-config-folder: dont_deploy_in_root
	$(info - deploying the config folder)
	@rsync -avz $(CONFIG) $(WEBAPPSDIR)

# deploy the react bundles folder
# the --delete falg will make sure the old bundles are removed from the destination.
deploy-bundles: dont_deploy_in_root
	$(info - deploying the react bundles)
	@rsync -avz --delete $(REACT_BUNDLES) $(WEBAPPSDIR)

# check the webapps to ensure it's not the root
.PHONY: dont_deploy_in_root
dont_deploy_in_root:
	@echo "$(WEBAPPSDIR)" | egrep -vq "^/$$|.*:/$$"

print-variables:
	$(info =================)
	$(info NODE_ENV:=$(NODE_ENV))
	$(info BUILD_VERSION=$(BUILD_VERSION))
	$(info building and deploying to: $(WEBAPPSDIR))
	$(info web apps will be accessed using: $(WEBAPPS_BASE_PATH))
	$(info Chaise must already be deployed and accesible using: $(CHAISE_BASE_PATH))
	$(info ERMrestJS must already be deployed and accesible using: $(ERMRESTJS_BASE_PATH))
	$(info =================)

#Rules for help/usage
.PHONY: help usage
help: usage
usage:
	@echo "Usage: make [target]"
	@echo "Available targets:"
	@echo "  clean                            remove the files and folders created during installation"
	@echo "  deps                             install npm dependencies (honors NODE_ENV)"
	@echo "  dist                             build all the apps"
	@echo "  deploy                           deploy all the apps"
	@echo "  deploy-w-config                  deploy all the apps with the existing configs"
	@echo "  deploy-boolean-search            deploy boolean search app"
	@echo "  deploy-boolean-search-w-config   deploy boolean search app with the existing config file(s)"
	@echo "  deploy-heatmap                   deploy heatmap app"
	@echo "  deploy-heatmap-w-config          deploy heatmap app with the existing config file(s)"
	@echo "  deploy-lineplot                  deploy lineplot app"
	@echo "  deploy-lineplot-w-config         deploy lineplot app with the existing config file(s)"
	@echo "  deploy-matrix                    deploy matrix app"
	@echo "  deploy-matrix-w-config           deploy matrix with the existing config file(s)"
	@echo "  deploy-plot                      deploy plot app"
	@echo "  deploy-plot-w-config             deploy plot with the existing config file(s)"
	@echo "  deploy-treeview                  deploy treeview app"
	@echo "  deploy-treeview-w-config         deploy treeview app with the existing config file(s)"
