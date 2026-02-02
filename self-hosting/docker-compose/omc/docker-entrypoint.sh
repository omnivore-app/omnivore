#!/usr/bin/env bash
set -euo pipefail

mkdir -p /var/log/omc /var/lock/omc /opt/omc/data /opt/omc/content /opt/omc/temp /opt/omc/content/corpus-reports

exec /usr/local/bin/supercronic -passthrough-logs /etc/omc/omc.crontab

