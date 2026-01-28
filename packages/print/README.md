# Omnivore Print-to-PDF (macOS)

This adds a local IPP “virtual printer” (running in Docker) that writes PDFs to a shared spool volume, then uploads each PDF into your Omnivore library as a File/PDF item via the normal GraphQL signed-upload flow.

## Requirements

- Self-hosting stack running via docker compose
- A dedicated watcher env file:
  - `self-hosting/docker-compose/print-watcher/.env` (copy from `.env.example`)
- `print-server` runs on its own LAN IP (macvlan) for Bonjour/mDNS. You must set:
  - `PRINT_MACVLAN_PARENT` (host interface name, e.g. `eth0`)
  - `PRINT_SERVER_IP` (an unused LAN IP, e.g. `10.0.1.250`)
  - Optional: `PRINT_MACVLAN_SUBNET`, `PRINT_MACVLAN_GATEWAY`

## Start services

From `self-hosting/docker-compose/` (canonical) or `self-hosting/docker-compose/self-build/`:

```sh
COMPOSE_PROFILES=print docker compose up -d --build
```

This exposes IPP on:

- `PRINT_SERVER_IP:631` (CUPS on the print server container’s LAN IP)
- Bonjour/mDNS advertisement (should appear automatically in macOS “Add Printer…”)

## Add the printer in macOS

Option A (preferred): use Bonjour discovery

1. System Settings → Printers & Scanners → Add Printer…
2. Default tab → select `OmnivorePDF` (or similar) when it appears.

Option B: manual IPP URL

1. System Settings → Printers & Scanners → Add Printer…
2. IP tab
3. Address: `PRINT_SERVER_IP`
4. Protocol: `Internet Printing Protocol - IPP`
5. Queue: `printers/OmnivorePDF`

When you print to this printer, PDFs should appear in Omnivore automatically.

## Troubleshooting

- Verify the services:
  - `docker compose logs -f print-server`
  - `docker compose logs -f print-watcher`
- If uploads fail, confirm:
  - `OMNIVORE_API_KEY` is present in your compose `.env`.
  - `OMNIVORE_GRAPHQL_ENDPOINT` is reachable from the watcher container (defaults to `http://api:8080/api/graphql`).
