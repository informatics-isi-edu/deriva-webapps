INSDIR=/var/www/html/microarray_heatmaps

install: heatmap.js index.html
	mkdir -p $(INSDIR)
	cp heatmap.js index.html heatmap-config.js $(INSDIR)/
	mkdir -p $(INSDIR)/styles
	cp styles/*.css $(INSDIR)/styles/
	mkdir -p $(INSDIR)/styles/images
	cp styles/images/*.gif $(INSDIR)/styles/images/
	mkdir -p $(INSDIR)/vendor
	cp vendor/*.js $(INSDIR)/vendor/
