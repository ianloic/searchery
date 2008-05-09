XPIDL=/usr/lib/xulrunner-1.9b5/xpidl -I/usr/share/idl/xulrunner-1.9b5/stable/

COMPONENTS=$(shell echo components/*.js)

all: web/awesomesearch.xpi

run: web/awesomesearch.xpi
	firefox -no-remote -P awesomesearch -jsconsole

components/ilISearchBase.xpt: public/ilISearchBase.idl
	cd components && $(XPIDL) -m typelib -w ../public/ilISearchBase.idl

web/awesomesearch.xpi: components/ilISearchBase.xpt $(COMPONENTS)
	rm -rf .xpistage web/awesomesearch.xpi
	mkdir -p .xpistage
	rsync -a --exclude-from .gitignore --exclude-from xpi-ignore . .xpistage
	cd .xpistage && zip -r ../web/awesomesearch.xpi *
	rm -rf .xpistage

HTML=web/index.html web/configure.html

tidy:
	tidy -indent -quiet -utf8 -modify --tidy-mark false $(HTML)
