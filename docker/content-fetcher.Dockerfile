FROM golang:1.25-alpine AS build
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

RUN apk add --no-cache git ca-certificates

WORKDIR /app

COPY src-go/go.mod src-go/go.sum ./
RUN go mod download

COPY src-go/ .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o omnivore .

# ─── Runtime image ────────────────────────────────────────────────────────────
FROM alpine:3.20

LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

# Add Chromium and required fonts/libs from Alpine edge
RUN echo "@edge https://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
 && echo "@edge https://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
 && echo "@edge https://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
 && apk -U upgrade \
 && apk add --no-cache \
      chromium@edge \
      freetype@edge \
      ttf-freefont@edge \
      nss@edge \
      libstdc++@edge \
      sqlite-libs@edge \
      ca-certificates@edge \
 && rm -rf /var/cache/apk/*

WORKDIR /app

ENV CHROMIUM_PATH=/usr/bin/chromium
ENV LAUNCH_HEADLESS=true
ENV PORT=8080

# Download ad/tracker block-list to a separate file; appended to /etc/hosts at startup
RUN wget -q -O /etc/hosts.blocklist https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts

COPY --from=build /app/omnivore .

# Entrypoint: append the blocklist to /etc/hosts (which is writable at runtime), then exec the binary
RUN printf '#!/bin/sh\ncat /etc/hosts.blocklist >> /etc/hosts\nexec "$@"\n' > /entrypoint.sh \
 && chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./omnivore", "server", "content-fetcher"]
