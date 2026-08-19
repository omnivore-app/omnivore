: ${BASE_URL?Please set BASE_URL, i.e. your public webserver URL, e.g. 'https://omnivore.example.com'}
: ${SERVER_BASE_URL?Please set SERVER_BASE_URL, i.e. your public API URL, e.g. 'https://api.omnivore.example.com'}
: ${HIGHLIGHTS_BASE_URL?Please set HIGHLIGHTS_BASE_URL, i.e. your public webserver URL, e.g. 'https://omnivore.example.com'}
: ${DOCKER_HUB_USER?Please set DOCKER_HUB_USER}

: ${APP_ENV:=prod}
: ${DOCKER_TAG:=$(git rev-parse --short HEAD)}

# TODO: Feat: only build specific images

echo ""
echo Using the following variables for building and pushing:
echo "  To build Omnivore:"
echo "    APP_ENV=$APP_ENV"
echo "    BASE_URL=$BASE_URL"
echo "    SERVER_BASE_URL=$SERVER_BASE_URL"
echo "    HIGHLIGHTS_BASE_URL=$HIGHLIGHTS_BASE_URL"
echo ""
echo "  To push to Docker Hub "
echo "    DOCKER_HUB_USER=$DOCKER_HUB_USER"
echo "    DOCKER_TAG=$DOCKER_TAG"
echo ""

read -p "OK? Continue [Y, y]: " yn
case $yn in
    [Yy]* ) echo;;
    * ) exit;;
esac

docker build -t ${DOCKER_HUB_USER}/omnivore-web:${DOCKER_TAG} --build-arg="APP_ENV=${APP_ENV}" --build-arg="BASE_URL=${BASE_URL}" --build-arg="SERVER_BASE_URL=${SERVER_BASE_URL}" --build-arg="HIGHLIGHTS_BASE_URL=${HIGHLIGHTS_BASE_URL}" -f ../packages/web/Dockerfile ..
docker build -t ${DOCKER_HUB_USER}/omnivore-content-fetch:${DOCKER_TAG} -f ../packages/content-fetch/Dockerfile ..
docker build -t ${DOCKER_HUB_USER}/omnivore-api:${DOCKER_TAG} -f Dockerfile ..
docker build -t ${DOCKER_HUB_USER}/omnivore-migrate:${DOCKER_TAG} -f ../packages/db/Dockerfile ..

docker push ${DOCKER_HUB_USER}/omnivore-web:${DOCKER_TAG}
docker push ${DOCKER_HUB_USER}/omnivore-content-fetch:${DOCKER_TAG}
docker push ${DOCKER_HUB_USER}/omnivore-api:${DOCKER_TAG}
docker push ${DOCKER_HUB_USER}/omnivore-migrate:${DOCKER_TAG}
