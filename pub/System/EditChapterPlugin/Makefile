FOSWIKI_ROOT?=~/foswiki/trunk/core
TARGET=build/editChapter.js build/editChapter.css

-include $(FOSWIKI_ROOT)/pub/System/JQueryPlugin/Makefile.include

clean:
	rm -f build/*

build/%.css: src/%.css
	@echo generating $@; $(CAT) $^ | $(CSSMIN) $(CSSMIN_ARGS) > $@

build/%.js: src/%.js
	@echo generating $@; $(JSMIN) $^ > $@


