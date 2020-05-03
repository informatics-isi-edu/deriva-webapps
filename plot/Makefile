# Config file
JS_CONFIG=plot-config.js
HTML = index.html
INSDIR?=/var/www/html/plot

$(JS_CONFIG): plot-config-sample.js
	cp -n plot-config-sample.js $(JS_CONFIG) || true
	touch $(JS_CONFIG)


# Rule to make html
.PHONY: html
html: $(HTML)

# Rules to attach JavaScript
index.html: index.html.in .make-asset-block
	sed -e '/%ASSETS%/ {' -e 'r .make-asset-block' -e 'd' -e '}' \
	index.html.in common/templates/noscript.html > index.html

.make-asset-block: $(JS_CONFIG)
	> .make-asset-block
	for file in $(JS_CONFIG) $(JS_DEPS); do \
		echo "<script src='$$file'></script>" >> .make-asset-block ; \
	done

install: $(HTML)
	mkdir -p $(INSDIR)
	rsync -avz . $(INSDIR)
