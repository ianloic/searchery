all:
	@echo '"make run" to test'
	@echo '"make xpi" to make the xpi'
run:
	firefox -no-remote -P awesomesearch -jsconsole

xpi:
	rm -rf .xpistage awesomesearch.xpi
	mkdir -p .xpistage
	rsync -a --exclude-from .gitignore --exclude-from xpi-ignore . .xpistage
	cd .xpistage && zip -r ../awesomesearch.xpi *
