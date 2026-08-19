all: firefox chrome edge

build: *
	rm -rf extension
	yarn build

firefox:
	echo "building firefox package"
	rm -rf extension
	yarn build
	FIREFOX_PKG_NAME="firefox-$(shell cat extension/manifest.json| jq -j .version).zip" ; \
	FIREFOX_SRC_NAME="firefox-$(shell cat extension/manifest.json| jq -j .version)-src.zip" ; \
	cd extension; zip -r  ../$$FIREFOX_PKG_NAME *; cd ..;\
	zip -r $$FIREFOX_SRC_NAME src/* Makefile yarn.lock package.json; \
	echo "done"

chrome: build
	echo "building chrome package"
	zip -r chrome-$(shell cat dist/manifest.json| jq -j .version).zip ./dist/*

edge: build
	echo "building edge package"
	EDGE_PKG_NAME="omnivore-extension-edge-$(shell cat dist/manifest.json| jq -j .version).zip" ; \
	pushd dist; zip -r $${EDGE_PKG_NAME} ./*; popd;


