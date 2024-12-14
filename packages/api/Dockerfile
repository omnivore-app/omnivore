FROM node:22.12 AS builder

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apt-get update && apt-get install -y g++ make python3 && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock tsconfig.json .prettierrc .eslintrc ./
COPY packages ./packages

# Remove all except needed packages
RUN find packages -mindepth 1 -type d \
    ! -regex '^packages/\(api\|readabilityjs\|text-to-speech\|content-handler\|liqe\|utils\)\(/.*\)?' \
    -exec rm -rf {} +

RUN yarn install --pure-lockfile && \
    yarn workspace @omnivore/utils build && \
    yarn workspace @omnivore/text-to-speech-handler build && \
    yarn workspace @omnivore/content-handler build && \
    yarn workspace @omnivore/liqe build && \
    yarn workspace @omnivore/api build && \
    rm -rf /app/packages/api/node_modules /app/node_modules && \
    yarn install --pure-lockfile --production

FROM node:22.12-alpine AS runner
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

RUN apk update && apk add netcat-openbsd && rm -rf /var/cache/apk/*

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV PORT=8080

COPY --from=builder /app/packages/api/dist /app/packages/api/dist
COPY --from=builder /app/packages/readabilityjs/ /app/packages/readabilityjs/
COPY --from=builder /app/packages/api/package.json /app/packages/api/package.json
COPY --from=builder /app/packages/api/node_modules /app/packages/api/node_modules
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/packages/text-to-speech/ /app/packages/text-to-speech/
COPY --from=builder /app/packages/content-handler/ /app/packages/content-handler/
COPY --from=builder /app/packages/liqe/ /app/packages/liqe/
COPY --from=builder /app/packages/utils/ /app/packages/utils/

EXPOSE 8080

CMD ["yarn", "workspace", "@omnivore/api", "start"]
