WEBAPPSDIR?=/var/www/html/deriva-webapps

install:
	rsync -avz --exclude='.*' --exclude='Makefile' . $(WEBAPPSDIR)
