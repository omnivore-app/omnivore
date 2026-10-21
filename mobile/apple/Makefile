open:
	open Omnivore.xcworkspace

graphql_gen:
	scripts/graphql_gen.sh

extension_gen:
	pushd ../pkg/extension/ && yarn build-prod && popd
	cp -r ../pkg/extension/dist/* Sources/SafariExtension/Resources/.
	mv Sources/SafariExtension/Resources/images/extension-transparent/* Sources/SafariExtension/Resources/images/extension/.
	cat ../pkg/extension/dist/manifest.json | jq '.background.persistent = false' | jq '.permissions = ["activeTab", "storage", "nativeMessaging", "https://*/**", "http://*/**"]' > Sources/SafariExtension/Resources/manifest.json