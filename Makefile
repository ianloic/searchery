all:
	@echo '"make run" to test'
	@echo '"make xpi" to make the xpi'
run:
	firefox -no-remote -P awesomesearch -jsconsole

xpi:
	rm -rf .xpistage web/awesomesearch.xpi
	mkdir -p .xpistage
	rsync -a --exclude-from .gitignore --exclude-from xpi-ignore . .xpistage
	cd .xpistage && zip -r ../web/awesomesearch.xpi *
	rm -rf .xpistage

HTML=web/index.html web/configure.html

tidy:
	tidy -indent -quiet -utf8 -modify --tidy-mark false $(HTML)
