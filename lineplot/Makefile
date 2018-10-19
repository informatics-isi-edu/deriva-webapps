INSDIR=/var/www/html/lineplot

install: lineplot.js index.html
	mkdir -p $(INSDIR)
	cp lineplot.js index.html lineplot-config.js $(INSDIR)/
	mkdir -p $(INSDIR)/styles
	cp styles/*.css $(INSDIR)/styles/
	mkdir -p $(INSDIR)/styles/images
	cp styles/images/*.gif $(INSDIR)/styles/images/
	mkdir -p $(INSDIR)/vendor
	cp vendor/*.js $(INSDIR)/vendor/
