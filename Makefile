run:
	firefox -no-remote -P awesomesearch -jsconsole

xpi:
	rm -rf .xpistage
	mkdir -p .xpistage
	rsync -a --exclude-from .gitignore --exclude-from xpi-ignore . .xpistage
	cd .xpistage && zip -r ../awesomesearch.xpi *
