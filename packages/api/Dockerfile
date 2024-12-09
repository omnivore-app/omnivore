FROM node:18.16 AS builder

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Объединение RUN команд и очистка кеша apt-get
RUN apt-get update && apt-get install -y g++ make python3 && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock tsconfig.json .prettierrc .eslintrc ./

COPY /packages/api/package.json ./packages/api/package.json
COPY /packages/utils/package.json ./packages/utils/package.json

RUN yarn install --pure-lockfile

COPY /packages/api ./packages/api
COPY /packages/utils ./packages/utils

RUN yarn workspace @omnivore/utils build && \
    yarn workspace @omnivore/api build

# Установка только production зависимостей
RUN rm -rf /app/packages/api/node_modules /app/node_modules && \
    yarn install --pure-lockfile --production

FROM node:18.16 AS runner
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

RUN apt-get update && apt-get install -y netcat-openbsd && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV production
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV PORT=8080

COPY --from=builder /app/packages/api/dist /app/packages/api/dist
COPY --from=builder /app/packages/api/node_modules /app/packages/api/node_modules
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/utils/ /app/packages/utils/
EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/api", "start"]
