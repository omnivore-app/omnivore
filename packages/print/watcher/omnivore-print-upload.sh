#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: omnivore-print-upload <pdf-path>" >&2
  exit 2
fi

PDF_PATH="$1"

if [[ ! -f "$PDF_PATH" ]]; then
  echo "file not found: $PDF_PATH" >&2
  exit 2
fi

if [[ "${PDF_PATH,,}" != *.pdf ]]; then
  echo "not a pdf: $PDF_PATH" >&2
  exit 2
fi

if [[ -z "${OMNIVORE_API_KEY:-}" ]]; then
  echo "Missing OMNIVORE_API_KEY" >&2
  exit 2
fi

GRAPHQL_ENDPOINT="${OMNIVORE_GRAPHQL_ENDPOINT:-http://api:8080/api/graphql}"

base="$(basename "$PDF_PATH")"
encoded_base="$(printf '%s' "$base" | jq -sRr @uri)"
file_url="file:///omnivore-print/${encoded_base}"

UPLOAD_MUTATION='mutation UploadFileRequest($input: UploadFileRequestInput!) { uploadFileRequest(input:$input) { __typename ... on UploadFileRequestSuccess { id uploadSignedUrl createdPageId } ... on UploadFileRequestError { errorCodes } } }'
SAVE_MUTATION='mutation SaveFile($input: SaveFileInput!) { saveFile(input:$input) { __typename ... on SaveSuccess { url clientRequestId } ... on SaveError { errorCodes message } } }'

graphql() {
  local payload="$1"
  curl -sS \
    -H "Content-Type: application/json" \
    -H "Omnivore-Authorization: ${OMNIVORE_API_KEY}" \
    -H "User-Agent: omnivore-print-watcher/1.0" \
    --data "$payload" \
    "$GRAPHQL_ENDPOINT"
}

upload_payload="$(
  jq -nc \
    --arg query "$UPLOAD_MUTATION" \
    --arg url "$file_url" \
    --arg contentType "application/pdf" \
    '{query:$query, variables:{input:{url:$url, contentType:$contentType, createPageEntry:true}}}'
)"

upload_resp="$(graphql "$upload_payload")"

if [[ "$(jq -r '.errors | length // 0' <<<"$upload_resp")" != "0" ]]; then
  echo "uploadFileRequest graphql errors: $(jq -c '.errors' <<<"$upload_resp")" >&2
  exit 1
fi

upload_typename="$(jq -r '.data.uploadFileRequest.__typename // empty' <<<"$upload_resp")"
if [[ "$upload_typename" != "UploadFileRequestSuccess" ]]; then
  echo "uploadFileRequest failed: $(jq -c '.data.uploadFileRequest' <<<"$upload_resp")" >&2
  exit 1
fi

upload_file_id="$(jq -r '.data.uploadFileRequest.id' <<<"$upload_resp")"
upload_signed_url="$(jq -r '.data.uploadFileRequest.uploadSignedUrl' <<<"$upload_resp")"
created_page_id="$(jq -r '.data.uploadFileRequest.createdPageId' <<<"$upload_resp")"

curl -sS --fail \
  -X PUT \
  -H "Content-Type: application/pdf" \
  --data-binary @"$PDF_PATH" \
  "$upload_signed_url" >/dev/null

save_payload="$(
  jq -nc \
    --arg query "$SAVE_MUTATION" \
    --arg url "$file_url" \
    --arg source "print" \
    --arg clientRequestId "$created_page_id" \
    --arg uploadFileId "$upload_file_id" \
    '{query:$query, variables:{input:{url:$url, source:$source, clientRequestId:$clientRequestId, uploadFileId:$uploadFileId}}}'
)"

save_resp="$(graphql "$save_payload")"

if [[ "$(jq -r '.errors | length // 0' <<<"$save_resp")" != "0" ]]; then
  echo "saveFile graphql errors: $(jq -c '.errors' <<<"$save_resp")" >&2
  exit 1
fi

save_typename="$(jq -r '.data.saveFile.__typename // empty' <<<"$save_resp")"
if [[ "$save_typename" != "SaveSuccess" ]]; then
  echo "saveFile failed: $(jq -c '.data.saveFile' <<<"$save_resp")" >&2
  exit 1
fi

echo "uploaded ${base} -> pageId=${created_page_id}"

