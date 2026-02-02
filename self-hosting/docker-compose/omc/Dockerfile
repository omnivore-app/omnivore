FROM node:18-bookworm-slim

ARG TARGETARCH

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV OMC_DIR=/opt/omc

WORKDIR /opt/omc

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

# pnpm (Corepack-managed, pinned to the OMC repo's packageManager)
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

# Codex CLI (OMC's default analyzer shells out to `codex exec`)
RUN pnpm add -g @openai/codex@0.93.0

# supercronic (cron runner that inherits container env)
RUN curl -fsSL -o /usr/local/bin/supercronic "https://github.com/aptible/supercronic/releases/download/v0.2.29/supercronic-linux-${TARGETARCH}" \
  && chmod +x /usr/local/bin/supercronic

# Install/build OMC (vendored into this repo under self-hosting/omc/)
COPY self-hosting/omc/package.json self-hosting/omc/pnpm-lock.yaml self-hosting/omc/.npmrc ./
RUN pnpm install --frozen-lockfile
COPY self-hosting/omc/ ./
RUN pnpm run build

RUN mkdir -p /etc/omc /var/log/omc /var/lock/omc /opt/omc/data /opt/omc/content /opt/omc/temp

COPY self-hosting/docker-compose/omc/omc.crontab /etc/omc/omc.crontab
COPY self-hosting/docker-compose/omc/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

