: ${APP_ENV?Please set APP_ENV}
: ${BASE_URL?Please set BASE_URL, i.e. your public webserver URL, e.g. 'https://omnivore.example.com'}
: ${SERVER_BASE_URL?Please set SERVER_BASE_URL, i.e. your public API URL, e.g. 'https://api.omnivore.example.com'}
: ${HIGHLIGHTS_BASE_URL?Please set HIGHLIGHTS_BASE_URL, i.e. your public webserver URL, e.g. 'https://omnivore.example.com'}

: ${DOCKER_HUB_USER?Please set DOCKER_HUB_USER}
: ${DOCKER_TAG?Please set DOCKER_TAG}


docker build -t ${DOCKER_HUB_USER}/omnivore-web:${DOCKER_TAG} --build-arg="APP_ENV=${APP_ENV}" --build-arg="BASE_URL=${BASE_URL}" --build-arg="SERVER_BASE_URL=${SERVER_BASE_URL}" --build-arg="HIGHLIGHTS_BASE_URL=${HIGHLIGHTS_BASE_URL}" -f ../packages/web/Dockerfile ..
docker build -t ${DOCKER_HUB_USER}/omnivore-content-fetch:${DOCKER_TAG} -f ../packages/content-fetch/Dockerfile ..
docker build -t ${DOCKER_HUB_USER}/omnivore-api:${DOCKER_TAG} -f Dockerfile ..
docker build -t ${DOCKER_HUB_USER}/omnivore-migrate:${DOCKER_TAG} -f ../packages/db/Dockerfile ..

docker push ${DOCKER_HUB_USER}/omnivore-web:${DOCKER_TAG}
docker push ${DOCKER_HUB_USER}/omnivore-content-fetch:${DOCKER_TAG}
docker push ${DOCKER_HUB_USER}/omnivore-api:${DOCKER_TAG}
docker push ${DOCKER_HUB_USER}/omnivore-migrate:${DOCKER_TAG}