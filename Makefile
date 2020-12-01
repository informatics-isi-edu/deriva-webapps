E2Espec = test/e2e/specs/protractor.conf.js
WEBAPPSDIR?=/var/www/html/deriva-webapps
E2Espec = test/e2e/specs/protractor.conf.js

#exclude <app>-config.js to not override one on deployment
.PHONY: install
install:
	@rsync -avz --exclude='.*' --exclude='Makefile' --exclude='test' --exclude='/boolean-search/booleansearch-config*' --exclude='/heatmap/heatmap-config*' --exclude='/lineplot/lineplot-config*' --exclude='/plot/plot-config*' --exclude='/treeview/treeview-config*' . $(WEBAPPSDIR)

.PHONY: install_w_configs
install_w_configs:
	@rsync -avz --exclude='.*' --exclude='Makefile' --exclude='test' . $(WEBAPPSDIR)

#This make target for getting the test dependencies only needs to be run once
.PHONY: testsetup
testsetup:
	@echo "Installing protractor and webdriver-manager"
	npm install -g protractor
	webdriver-manager update
	@echo "Installing Jasmine-spec-reporter"
	npm install

.PHONY: test
test:
	@echo "E2E Test Started"
	protractor $(E2Espec) --params.exeEnv=$(env) --params.app=$(app)

#Rules for help/usage
.PHONY: help usage
help: usage
usage:
	@echo "Available 'make' targets:"
	@echo "    test      		- runs e2e tests"
