


all: firefox chrome edge

build: *
	rm -rf dist
	yarn build-prod

firefox:
	echo "building firefox package"
	rm -rf dist
	yarn build-firefox
	FIREFOX_PKG_NAME="firefox-$(shell cat dist/manifest.json| jq -j .version).zip" ; \
	FIREFOX_SRC_NAME="firefox-$(shell cat dist/manifest.json| jq -j .version)-src.zip" ; \
	pushd dist; zip -r ../$$FIREFOX_PKG_NAME *; popd; \
	zip -r $$FIREFOX_SRC_NAME src/* Makefile yarn.lock package.json .env.firefox webpack.js replace-with-process-env.js; \
	echo "done"

chrome: build
	echo "building chrome package"
	zip -r chrome-$(shell cat dist/manifest.json| jq -j .version).zip ./dist/*

edge: build
	echo "building edge package"
	EDGE_PKG_NAME="omnivore-extension-edge-$(shell cat dist/manifest.json| jq -j .version).zip" ; \
	pushd dist; zip -r $${EDGE_PKG_NAME} ./*; popd;


