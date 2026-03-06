# ── Configuration (override on the command line: make <target> REGISTRY=myrepo) ─
REGISTRY ?= korney4eg
IMAGE_TAG ?= latest

open_ios:
	$(MAKE) -C apple open

apple_graphql_gen:
	$(MAKE) -C apple graphql_gen

apple_extension_gen:
	$(MAKE) -C apple extension_gen

android_graphql_gen:
	cp packages/api/src/generated/schema.graphql android/Omnivore/app/src/main/graphql/schema.graphqls

droid:
	@if ! [ -e android/Omnivore/app/src/main/res/values/secrets.xml ]; then \
		cp android/Omnivore/secrets.xml android/Omnivore/app/src/main/res/values/secrets.xml; \
	fi
	studio android/Omnivore

webview_gen:
	yarn workspace @omnivore/appreader build
	cp packages/appreader/build/bundle.js apple/OmnivoreKit/Sources/Views/Resources/bundle.js
	cp packages/appreader/build/bundle.js android/Omnivore/app/src/main/assets/bundle.js

api:
	yarn workspace @omnivore/api dev

web:
	yarn workspace @omnivore/web dev

qp:
	yarn workspace @omnivore/api dev_qp

content_handler:
	yarn workspace @omnivore/content-handler build

puppeteer:
	yarn workspace @omnivore/puppeteer-parse build

content_fetch: content_handler puppeteer
	yarn workspace @omnivore/content-fetch build
	yarn workspace @omnivore/content-fetch start

# ── Go content-fetcher ──────────────────────────────────────────────────────

content_fetch_go:
	cd src-go && go run . server content-fetcher

content_fetch_go_build:
	cd src-go && go build -o ../bin/omnivore .

# ── Docker images ───────────────────────────────────────────────────────────

docker_build_content_fetcher:
	docker build -f docker/content-fetcher.Dockerfile \
		-t $(REGISTRY)/omnivore-content-fetcher:$(IMAGE_TAG) .

docker_push_content_fetcher: docker_build_content_fetcher
	docker push $(REGISTRY)/omnivore-content-fetcher:$(IMAGE_TAG)
