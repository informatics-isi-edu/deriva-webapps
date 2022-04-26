WEBAPPSDIR?=/var/www/html/deriva-webapps

#exclude <app>-config.js to not override one on deployment
.PHONY: install
install:
	@rsync -avz --exclude='.*' --exclude='Makefile' --exclude='docs' --exclude='test' --exclude='/boolean-search/booleansearch-config*' --exclude='/heatmap/heatmap-config*' --exclude='/lineplot/lineplot-config*' --exclude='/plot/plot-config*' --exclude='/treeview/treeview-config*' . $(WEBAPPSDIR)

.PHONY: install_w_configs
install_w_configs:
	@rsync -avz --exclude='.*' --exclude='Makefile' --exclude='docs' --exclude='test' . $(WEBAPPSDIR)


#Rules for help/usage
.PHONY: help usage
help: usage
usage:
	@echo "Usage: make [target]"
	@echo "Available targets:"
	@echo "  install                    install all the apps"
	@echo "  install_w_configs          install all the apps with their existing configs"
