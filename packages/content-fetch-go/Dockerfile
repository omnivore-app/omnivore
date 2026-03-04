FROM golang:1.24-alpine AS build
LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

RUN apk add --no-cache git ca-certificates

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o content-fetch-go .

# ─── Runtime image ────────────────────────────────────────────────────────────
FROM alpine:3.20

LABEL org.opencontainers.image.source="https://github.com/omnivore-app/omnivore"

# Add Chromium and required fonts/libs from Alpine edge (mirrors the original Dockerfile)
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

# Download ad/tracker block-list for the hosts file (matches original start.sh)
RUN wget -q https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts \
 && cat hosts >> /etc/hosts \
 && rm hosts

COPY --from=build /app/content-fetch-go .

EXPOSE 8080

CMD ["./content-fetch-go"]
