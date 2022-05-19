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
.PHONY: deps
deps:
	npm clean-install

.PHONY: lint
lint: $(SOURCE)
	@npx eslint src --ext .ts,.tsx --quiet

.PHONY: lint-w-warn
lint-w-warn: $(SOURCE)
	@npx eslint src --ext .ts,.tsx

#exclude <app>-config.js to not override one on deployment
.PHONY: install
install: dont_install_in_root print-variables run-webpack rsync-react install-boolean-search install-heatmap install-lineplot install-plot install-treeview

.PHONY: install-w-config
install-w-config:dont_install_in_root print-variables install-boolean-search-w-config install-heatmap-w-config install-lineplot-w-config install-plot-w-config install-treeview-w-config

.PHONY: install-boolean-search
install-boolean-search: dont_install_in_root print-variables
	$(info - deploying boolean-search)
	@rsync -avz --exclude='/boolean-search/booleansearch-config*' boolean-search $(WEBAPPSDIR)

.PHONY: install-boolean-search-w-config
install-boolean-search-w-config: dont_install_in_root print-variables
	$(info - deploying boolean-search with the existing config file(s))
	@rsync -avz boolean-search $(WEBAPPSDIR)

.PHONY: install-heatmap
install-heatmap: dont_install_in_root print-variables
	$(info - deploying heatmap)
	@rsync -avz --exclude='/heatmap/heatmap-config*' heatmap $(WEBAPPSDIR)

.PHONY: install-heatmap-w-config
install-heatmap-w-config: dont_install_in_root print-variables
	$(info - deploying heatmap with the existing config file(s))
	@rsync -avz heatmap $(WEBAPPSDIR)

.PHONY: install-lineplot
install-lineplot: dont_install_in_root print-variables
	$(info - deploying lineplot)
	@rsync -avz --exclude='/lineplot/lineplot-config*' lineplot $(WEBAPPSDIR)

.PHONY: install-lineplot-w-config
install-lineplot-w-config: dont_install_in_root print-variables
	$(info - deploying lineplot with the existing config file(s))
	@rsync -avz lineplot $(WEBAPPSDIR)

.PHONY: install-plot
install-plot: dont_install_in_root print-variables
	$(info - deploying plot)
	@rsync -avz --exclude='/plot/plot-config*' plot $(WEBAPPSDIR)

.PHONY: install-plot-w-config
install-plot-w-config: dont_install_in_root print-variables
	$(info - deploying plot with the existing config file(s))
	@rsync -avz plot $(WEBAPPSDIR)

.PHONY: install-treeview
install-treeview: dont_install_in_root print-variables
	$(info - deploying treeview)
	@rsync -avz --exclude='/treeview/treeview-config*' treeview $(WEBAPPSDIR)

.PHONY: install-treeview-w-config
install-treeview-w-config: dont_install_in_root print-variables
	$(info - deploying treeview with the existing config file(s))
	@rsync -avz treeview $(WEBAPPSDIR)

.PHONY: install-matrix
install-matrix: deps install-matrix-wo-deps

.PHONY: install-matrix-wo-deps
install-matrix-wo-deps: dont_install_in_root print-variables run-webpack rsync-react

# rsync the built react apps
.PHONY: rsync-react
rsync-react:
	@rsync -avz $(DIST)/react/ $(CONFIG) $(WEBAPPSDIR)

# run webpack to build react-based bundles
.PHONY: run-webpack $(BUILD_VERSION)
run-webpack:
	@npx webpack --config ./webpack/main.config.js --env BUILD_VARIABLES.BUILD_VERSION=$(BUILD_VERSION) --env BUILD_VARIABLES.WEBAPPS_BASE_PATH=$(WEBAPPS_BASE_PATH) --env BUILD_VARIABLES.CHAISE_BASE_PATH=$(CHAISE_BASE_PATH) --env BUILD_VARIABLES.ERMRESTJS_BASE_PATH=$(ERMRESTJS_BASE_PATH)

# check the webapps to ensure it's not the root
.PHONY: dont_install_in_root
dont_install_in_root:
	@echo "$(WEBAPPSDIR)" | egrep -vq "^/$$|.*:/$$"

print-variables:
	$(info building and deploying to: $(WEBAPPSDIR))

#Rules for help/usage
.PHONY: help usage
help: usage
usage:
	@echo "Usage: make [target]"
	@echo "Available targets:"
	@echo "  clean                             remove the files and folders created during installation"
	@echo "  deps                              install npm dependencies (honors NODE_ENV)"
	@echo "  install                           install all the apps"
	@echo "  install-w-config                  install all the apps with the existing configs"
	@echo "  install-boolean-search            install boolean search app"
	@echo "  install-boolean-search-w-config   install boolean search app with the existing config file(s)"
	@echo "  install-heatmap                   install heatmap app"
	@echo "  install-heatmap-w-config          install heatmap app with the existing config file(s)"
	@echo "  install-lineplot                  install lineplot app"
	@echo "  install-lineplot-w-config         install lineplot app with the existing config file(s)"
	@echo "  install-matrix                    install matrix app"
	@echo "  install-plot                      install plot app"
	@echo "  install-plot-w-config             install plot with the existing config file(s)"
	@echo "  install-treeview                  install treeview app"
	@echo "  install-treeview-w-config         install treeview app with the existing config file(s)"
