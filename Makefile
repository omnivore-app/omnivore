open_ios:
	$(MAKE) -C apple open

apple_graphql_gen:
	$(MAKE) -C apple graphql_gen

apple_extension_gen:
	$(MAKE) -C apple extension_gen

droid:
	@if ! [ -e android/Omnivore/app/src/main/res/values/secrets.xml ]; then \
		cp android/Omnivore/secrets.xml android/Omnivore/app/src/main/res/values/secrets.xml; \
	fi
	studio android/Omnivore

webview_gen:
	yarn workspace @omnivore/appreader build
	cp packages/appreader/build/bundle.js apple/OmnivoreKit/Sources/Views/Resources/bundle.js
	cp packages/appreader/build/bundle.js android/Omnivore/app/src/main/assets/bundle.js
