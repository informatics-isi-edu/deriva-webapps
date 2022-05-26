WEB_INSTALL_ROOT?=/var/www/html/
WEBAPPS_REL_PATH?=deriva-webapps/

WEBAPPSDIR:=$(WEB_INSTALL_ROOT)$(WEBAPPS_REL_PATH)

# TODO while we're not doing anything to "build" we should eventually do
#      so we created this placeholder that in the future will be implemented
.PHONY: dist
dist: ;

#exclude <app>-config.js to not override one on deployment
.PHONY: deploy
deploy: dont_deploy_in_root print-variables deploy-boolean-search deploy-heatmap deploy-lineplot deploy-plot deploy-treeview

.PHONY: deploy-w-config
deploy-w-config:dont_deploy_in_root print-variables deploy-boolean-search-w-config deploy-heatmap-w-config deploy-lineplot-w-config deploy-plot-w-config deploy-treeview-w-config

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

dont_deploy_in_root:
	@echo "$(WEBAPPSDIR)" | egrep -vq "^/$$|.*:/$$"

print-variables:
	$(info deploying to: $(WEBAPPSDIR))

#Rules for help/usage
.PHONY: help usage
help: usage
usage:
	@echo "Usage: make [target]"
	@echo "Available targets:"
	@echo "  deploy                           deploy all the apps"
	@echo "  deploy-w-config                  deploy all the apps with the existing configs"
	@echo "  deploy-boolean-search            deploy boolean search app"
	@echo "  deploy-boolean-search-w-config   deploy boolean search app with the existing config file(s)"
	@echo "  deploy-heatmap                   deploy heatmap app"
	@echo "  deploy-heatmap-w-config          deploy heatmap app with the existing config file(s)"
	@echo "  deploy-lineplot                  deploy lineplot app"
	@echo "  deploy-lineplot-w-config         deploy lineplot app with the existing config file(s)"
	@echo "  deploy-plot                      deploy plot app"
	@echo "  deploy-plot-w-config             deploy plot with the existing config file(s)"
	@echo "  deploy-treeview                  deploy treeview app"
	@echo "  deploy-treeview-w-config         deploy treeview app with the existing config file(s)"
