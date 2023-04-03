


all: firefox chrome edge

build: *
	rm -rf dist
	yarn build-prod

firefox: build
	echo "building firefox package"
	FIREFOX_PKG_NAME="firefox-$(shell cat dist/manifest.json| jq -j .version).zip" ; \
	FIREFOX_SRC_NAME="firefox-$(shell cat dist/manifest.json| jq -j .version)-src.zip" ; \
	pushd dist; zip -r ../$$FIREFOX_PKG_NAME *; popd; \
	pushd src; zip -r ../$$FIREFOX_SRC_NAME *; popd; \
	echo "done"

chrome: build
	echo "building chrome package"
	zip -r chrome-$(shell cat dist/manifest.json| jq -j .version).zip ./dist/*

edge: build
	echo "building edge package"
	EDGE_PKG_NAME="omnivore-extension-edge-$(shell cat dist/manifest.json| jq -j .version).zip" ; \
	pushd dist; zip -r $${EDGE_PKG_NAME} ./*; popd;


