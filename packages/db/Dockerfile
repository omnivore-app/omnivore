FROM node:24.19-alpine

WORKDIR /app

COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY /packages/db/package.json ./packages/db/package.json
COPY /packages/db/tsconfig.json ./packages/db/tsconfig.json


RUN apk add \
  postgresql \
  uuidgen \
  python3 \
  g++ \
  make

RUN yarn install

ADD /packages/db ./packages/db
ADD /packages/db/setup.sh ./packages/db/setup.sh
RUN yarn workspace @omnivore/db build

CMD ["yarn", "workspace", "@omnivore/db", "migrate"]
