open_ios:
	$(MAKE) -C apple open

apple_graphql_gen:
	$(MAKE) -C apple graphql_gen

apple_extension_gen:
	$(MAKE) -C apple extension_gen

droid:
	studio android/Omnivore

webview_gen:
	yarn workspace @omnivore/appreader build
	cp packages/appreader/build/bundle.js apple/OmnivoreKit/Sources/Views/Resources/bundle.js
	cp packages/appreader/build/bundle.js android/Omnivore/app/src/main/assets/bundle.js
