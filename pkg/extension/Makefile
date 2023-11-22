


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
	cd dist; zip -r  ../$$FIREFOX_PKG_NAME *; cd ..;\
	zip -r $$FIREFOX_SRC_NAME src/* Makefile yarn.lock package.json .env.firefox webpack.js replace-with-process-env.js; \
	echo "done"

firefox-verify:
		mkdir "firefox-$(shell cat dist/manifest.json| jq -j .version)-build"; \
		mkdir "firefox-$(shell cat dist/manifest.json| jq -j .version)-build/build"; \
		cp "firefox-$(shell cat dist/manifest.json| jq -j .version).zip" "firefox-$(shell cat dist/manifest.json| jq -j .version)-build/uploaded.zip"; \
		cp "firefox-$(shell cat dist/manifest.json| jq -j .version)-src.zip" "firefox-$(shell cat dist/manifest.json| jq -j .version)-build/build/."; \
		cd "firefox-$(shell cat dist/manifest.json| jq -j .version)-build/uploaded/"; \
		unzip "firefox-$(shell cat dist/manifest.json| jq -j .version).zip"; \
		rm "firefox-$(shell cat dist/manifest.json| jq -j .version).zip"; \
		cd ../build/; \
		unzip "firefox-$(shell cat dist/manifest.json| jq -j .version)-src.zip"; \
		yarn && yarn build-firefox; \
		diff -r dist/ ../uploaded/


chrome: build
	echo "building chrome package"
	zip -r chrome-$(shell cat dist/manifest.json| jq -j .version).zip ./dist/*

edge: build
	echo "building edge package"
	EDGE_PKG_NAME="omnivore-extension-edge-$(shell cat dist/manifest.json| jq -j .version).zip" ; \
	pushd dist; zip -r $${EDGE_PKG_NAME} ./*; popd;


