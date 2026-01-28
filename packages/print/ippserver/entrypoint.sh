#!/usr/bin/env bash
set -euo pipefail

SPOOL_DIR="${PRINT_SPOOL_DIR:-/spool/incoming}"
PRINTER_NAME="${PRINTER_NAME:-OmnivorePDF}"

mkdir -p "$SPOOL_DIR"

# Configure cups-pdf output directory.
if [[ -f /etc/cups/cups-pdf.conf ]]; then
  # Default config ships with "#Out ...". Un-comment (or replace) it so output goes
  # into the shared spool volume.
  sed -i -E "s|^[[:space:]]*#?[[:space:]]*Out[[:space:]]+.*$|Out ${SPOOL_DIR}|" /etc/cups/cups-pdf.conf || true
fi

# Configure CUPS to listen on LAN + allow printing + advertise via DNS-SD.
if [[ -f /etc/cups/cupsd.conf ]]; then
  tmp="$(mktemp)"
  awk '
    BEGIN { in_root=0; found_printers=0 }
    $0 == "Listen localhost:631" { print "Port 631"; next }
    $0 == "<Location />" {
      print "<Location />"
      print "  Order allow,deny"
      print "  Allow all"
      print "</Location>"
      in_root=1
      next
    }
    in_root {
      if ($0 == "</Location>") in_root=0
      next
    }
    $0 == "<Location /printers>" { found_printers=1 }
    { print }
    END {
      if (!found_printers) {
        print ""
        print "<Location /printers>"
        print "  Order allow,deny"
        print "  Allow all"
        print "</Location>"
      }
    }
  ' /etc/cups/cupsd.conf > "$tmp"
  mv "$tmp" /etc/cups/cupsd.conf

  if ! grep -q '^ServerAlias \\*$' /etc/cups/cupsd.conf; then
    echo 'ServerAlias *' >> /etc/cups/cupsd.conf
  fi
  if ! grep -q '^DefaultShared Yes$' /etc/cups/cupsd.conf; then
    echo 'DefaultShared Yes' >> /etc/cups/cupsd.conf
  fi
  if ! grep -q '^Browsing On$' /etc/cups/cupsd.conf; then
    echo 'Browsing On' >> /etc/cups/cupsd.conf
  fi
  if ! grep -q '^BrowseLocalProtocols dnssd$' /etc/cups/cupsd.conf; then
    echo 'BrowseLocalProtocols dnssd' >> /etc/cups/cupsd.conf
  fi
fi

# Avahi requires a system dbus.
mkdir -p /run/dbus
dbus-daemon --system --fork

# Ensure avahi runs without chroot (common in containers).
mkdir -p /run/avahi-daemon
avahi-daemon --no-chroot --daemonize || true

# Start CUPS in the background to allow printer setup.
cupsd -f &
CUPSD_PID=$!

# Wait briefly for cupsd socket.
for _ in $(seq 1 20); do
  if lpstat -r >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

# Create the PDF printer if missing.
if ! lpstat -p "${PRINTER_NAME}" >/dev/null 2>&1; then
  PPD="$(find /usr/share -maxdepth 6 -type f -iname '*cups-pdf*.ppd' -print -quit 2>/dev/null || true)"
  if [[ -z "$PPD" ]]; then
    PPD="$(find /usr/share -maxdepth 6 -type f -iname '*CUPS-PDF*.ppd' -print -quit 2>/dev/null || true)"
  fi

  if [[ -n "$PPD" && -f "$PPD" ]]; then
    lpadmin -p "${PRINTER_NAME}" -E -v "cups-pdf:/" -P "$PPD" -o printer-is-shared=true || true
  else
    # If no PPD is found, we can still create the queue but driver selection may vary by client.
    lpadmin -p "${PRINTER_NAME}" -E -v "cups-pdf:/" -m raw -o printer-is-shared=true || true
  fi

  cupsenable "${PRINTER_NAME}" || true
  cupsaccept "${PRINTER_NAME}" || true
fi

echo "CUPS ready. Printer: ${PRINTER_NAME}. Spool: ${SPOOL_DIR}"

# Keep the container running.
wait "${CUPSD_PID}"
