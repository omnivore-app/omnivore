FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    cups \
    cups-pdf \
    avahi-daemon \
    avahi-utils \
    libnss-mdns \
    dbus \
    ghostscript \
    procps \
  && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PRINT_SPOOL_DIR=/spool/incoming
ENV PRINTER_NAME=OmnivorePDF

VOLUME ["/spool"]

EXPOSE 631/tcp 5353/udp

CMD ["/entrypoint.sh"]
