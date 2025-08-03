FROM node:22.12

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile --network-timeout=300000

COPY . .

ENV PORT=8080
EXPOSE 8080

ENV NODE_ENV production

CMD yarn start
