INSDIR=/var/www/html/treeview

install: html/gridexample.html
	mkdir -p $(INSDIR)
	mkdir -p $(INSDIR)/html
	cp html/*.html $(INSDIR)/html/
	mkdir -p $(INSDIR)/cache
	cp cache/*.json $(INSDIR)/cache/
	mkdir -p $(INSDIR)/js
	cp js/*.js $(INSDIR)/js/
	mkdir -p $(INSDIR)/resources/images/ExpressionMapping/ExpressionPatternKey
	cp resources/images/ExpressionMapping/ExpressionPatternKey/*.png $(INSDIR)/resources/images/ExpressionMapping/ExpressionPatternKey/
	mkdir -p $(INSDIR)/resources/images/ExpressionMapping/ExpressionStrengthsKey
	cp resources/images/ExpressionMapping/ExpressionStrengthsKey/*.gif $(INSDIR)/resources/images/ExpressionMapping/ExpressionStrengthsKey/
	mkdir -p $(INSDIR)/resources/images/NerveDensity/RelativeToP0
	cp resources/images/NerveDensity/*.gif $(INSDIR)/resources/images/NerveDensity/
	cp resources/images/NerveDensity/RelativeToP0/*.png $(INSDIR)/resources/images/NerveDensity/RelativeToP0/
	mkdir -p $(INSDIR)/resources/images/NerveDensity/RelativeToTotal
	cp resources/images/NerveDensity/RelativeToTotal/*.png $(INSDIR)/resources/images/NerveDensity/RelativeToTotal/
	mkdir -p $(INSDIR)/themes/default/images
	cp themes/*.png $(INSDIR)/themes/default/images/
	cp themes/*.css $(INSDIR)/themes/default/images/
	cp themes/*.gif $(INSDIR)/themes/default/images/
	mkdir -p $(INSDIR)/util
	cp util/*.js $(INSDIR)/util/
