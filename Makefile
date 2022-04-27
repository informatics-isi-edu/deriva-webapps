WEB_INSTALL_ROOT?=/var/www/html/
WEBAPPS_REL_PATH?=deriva-webapps/

WEBAPPSDIR:=$(WEB_INSTALL_ROOT)$(WEBAPPS_REL_PATH)

#exclude <app>-config.js to not override one on deployment
.PHONY: install
install: dont_install_in_root print-variables install-boolean-search install-heatmap install-lineplot install-plot install-treeview

.PHONY: install-w-config
install-w-config:dont_install_in_root print-variables install-boolean-search-w-config install-heatmap-w-config install-lineplot-w-config install-plot-w-config install-treeview-w-config

.PHONY: install-boolean-search
install-boolean-search: dont_install_in_root print-variables
	$(info - deploying boolean-search)
	@rsync -avz --exclude='/boolean-search/booleansearch-config*' boolean-search $(WEBAPPSDIR)

.PHONY: install-boolean-search-w-config
install-boolean-search-w-config: dont_install_in_root print-variables
	$(info - deploying boolean-search with existing config file(s))
	@rsync -avz boolean-search $(WEBAPPSDIR)

.PHONY: install-heatmap
install-heatmap: dont_install_in_root print-variables
	$(info - deploying heatmap)
	@rsync -avz --exclude='/heatmap/heatmap-config*' heatmap $(WEBAPPSDIR)

.PHONY: install-heatmap-w-config
install-heatmap-w-config: dont_install_in_root print-variables
	$(info - deploying heatmap with existing config file(s))
	@rsync -avz heatmap $(WEBAPPSDIR)

.PHONY: install-lineplot
install-lineplot: dont_install_in_root print-variables
	$(info - deploying lineplot)
	@rsync -avz --exclude='/lineplot/lineplot-config*' lineplot $(WEBAPPSDIR)

.PHONY: install-lineplot-w-config
install-lineplot-w-config: dont_install_in_root print-variables
	$(info - deploying lineplot with existing config file(s))
	@rsync -avz lineplot $(WEBAPPSDIR)

.PHONY: install-plot
install-plot: dont_install_in_root print-variables
	$(info - deploying plot)
	@rsync -avz --exclude='/plot/plot-config*' plot $(WEBAPPSDIR)

.PHONY: install-plot-w-config
install-plot-w-config: dont_install_in_root print-variables
	$(info - deploying plot with existing config file(s))
	@rsync -avz plot $(WEBAPPSDIR)

.PHONY: install-treeview
install-treeview: dont_install_in_root print-variables
	$(info - deploying treeview)
	@rsync -avz --exclude='/treeview/treeview-config*' treeview $(WEBAPPSDIR)

.PHONY: install-treeview-w-config
install-treeview-w-config: dont_install_in_root print-variables
	$(info - deploying treeview with existing config file(s))
	@rsync -avz treeview $(WEBAPPSDIR)

dont_install_in_root:
	@echo "$(WEBAPPSDIR)" | egrep -vq "^/$$|.*:/$$"

print-variables:
	$(info building and deploying to: $(WEBAPPSDIR))

#Rules for help/usage
.PHONY: help usage
help: usage
usage:
	echo "Usage: make [target]"
	echo "Available targets:"
	echo "  install                    install all the apps"
	echo "  install-w-config          install all the apps with their existing configs"
