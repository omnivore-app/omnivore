FROM node:22.12

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY /packages/db/package.json ./packages/db/package.json

RUN apt-get update && apt-get install -y \
  postgresql \
  uuid-runtime

RUN yarn install

ADD /packages/db ./packages/db
ADD /packages/db/setup.sh ./packages/db/setup.sh

CMD ["yarn", "workspace", "@omnivore/db", "migrate"]
