#!/bin/bash

export IMAGEPROXY_USERAGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"

export IMAGEPROXY_SIGNATUREKEY="${IMAGE_PROXY_SECRET}"

if [[ ! -z ${GCS_IMAGES_PATH} && ! -z ${MEM_CACHE_SIZE_MB} ]]; then
  # ImageProxy shall rely on the credentials of the default App Engine Service
  # Account. For the GCS bucket path access here to ImageProxy, we must grant
  # Storage object creator/view access on the bucket to the default app engine
  # service account in the project.
  /app/imageproxy -verbose -timeout 60s -cache memory:${MEM_CACHE_SIZE_MB} -cache ${GCS_IMAGES_PATH} -addr 0.0.0.0:8080
else
  # Running locally, use memory cache only
  /app/imageproxy -verbose -timeout 60s -cache memory:1000 -addr 0.0.0.0:8080
fi

