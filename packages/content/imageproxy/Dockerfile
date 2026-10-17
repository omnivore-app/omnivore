FROM ghcr.io/willnorris/imageproxy:main as build

# Above imageproxy image is built from scratch image and is barebones
# Switching over to ubuntu base image to allow us to debug better.
FROM ubuntu:bionic

WORKDIR /app

RUN apt update && apt install -y ca-certificates

COPY --from=build /app/imageproxy .

COPY start_imageproxy.sh .

# Using a custom script to customize imageproxy startup and to pass
# signatureKey through env variable
ENTRYPOINT ["/app/start_imageproxy.sh"]

EXPOSE 8080

