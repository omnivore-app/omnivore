FROM alpine:3.19

RUN apk add --no-cache bash curl jq inotify-tools coreutils ca-certificates

COPY omnivore-print-upload.sh /usr/local/bin/omnivore-print-upload
COPY omnivore-print-watch.sh /usr/local/bin/omnivore-print-watch

RUN chmod +x /usr/local/bin/omnivore-print-upload /usr/local/bin/omnivore-print-watch

ENV OMNIVORE_GRAPHQL_ENDPOINT=http://api:8080/api/graphql
ENV PRINT_SPOOL_DIR=/spool/incoming
ENV PRINT_PROCESSING_DIR=/spool/processing
ENV PRINT_DONE_DIR=/spool/done
ENV PRINT_FAILED_DIR=/spool/failed

CMD ["/usr/local/bin/omnivore-print-watch"]

