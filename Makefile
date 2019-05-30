E2Espec = test/e2e/specs/protractor.conf.js
WEBAPPSDIR?=/var/www/html/deriva-webapps

.PHONY : install
install:
	# rsync -avz --exclude='.*' --exclude='Makefile' . $(WEBAPPSDIR)
	@echo "Installing protractor and webdriver-manager"
	npm install -g protractor
	webdriver-manager update
	@echo "Installing Jasmine-spec-reporter"
	npm install jasmine-spec-reporter --save-dev
	
.PHONY : test
test:
	@echo "E2E Test Started"
	protractor $(E2Espec) --params.exeEnv=$(env) --params.app=$(app)

#Rules for help/usage
.PHONY: help usage
help: usage
usage:
	@echo "Available 'make' targets:"
	@echo "    test      		- runs e2e tests"
