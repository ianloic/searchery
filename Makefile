VERSION=0.1.0

XPIFILE=web/searchery-$(VERSION).xpi

XPIDL=/usr/lib/xulrunner-1.9b5/xpidl -I/usr/share/idl/xulrunner-1.9b5/stable/
FIREFOX=firefox

COMPONENTS=$(shell echo components/*.js)
CHROMEFILES=$(shell find chrome/)

all: $(XPIFILE)

run: all
	$(FIREFOX) -no-remote -P searchery -jsconsole

$(XPIFILE): $(COMPONENTS) $(CHROMEFILES) chrome.manifest install.rdf .gitignore xpi-ignore
	rm -rf .xpistage $(XPIFILE)
	mkdir -p .xpistage
	rsync -a --exclude-from .gitignore --exclude-from xpi-ignore . .xpistage
	cd .xpistage && zip -r ../$(XPIFILE) *
	rm -rf .xpistage

HTML=web/index.html web/welcome.html

tidy:
	tidy -indent -quiet -utf8 -modify --tidy-mark false $(HTML)

push: $(XPIFILE) $(shell find web/)
	rsync --delete -avz web/ yakk@ianloic.com:searchery.ianloic.com/
