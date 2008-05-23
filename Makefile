VERSION=0.0.2

XPIFILE=web/awesomesearch-$(VERSION).xpi

XPIDL=/usr/lib/xulrunner-1.9b5/xpidl -I/usr/share/idl/xulrunner-1.9b5/stable/

COMPONENTS=$(shell echo components/*.js)
CHROMEFILES=$(shell find chrome/)

all: $(XPIFILE)

run: all
	firefox -no-remote -P awesomesearch -jsconsole

$(XPIFILE): $(COMPONENTS) $(CHROMEFILES) chrome.manifest install.rdf .gitignore xpi-ignore
	rm -rf .xpistage $(XPIFILE)
	mkdir -p .xpistage
	rsync -a --exclude-from .gitignore --exclude-from xpi-ignore . .xpistage
	cd .xpistage && zip -r ../$(XPIFILE) *
	rm -rf .xpistage

HTML=web/index.html web/configure.html

tidy:
	tidy -indent -quiet -utf8 -modify --tidy-mark false $(HTML)

push: $(XPIFILE)
	s3cmd -P --mime-type=application/x-xpinstall put $(XPIFILE) s3://static.ianloic.com/awesomesearch/`basename $(XPIFILE)`
	s3cmd -P --mime-type=application/xml+rdf put update.rdf s3://static.ianloic.com/awesomesearch/update.rdf
