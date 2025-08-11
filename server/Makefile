
---

# קובץ: `server/Makefile`
```make
.PHONY: print-unit-ncc print-unit-sea

print-unit-ncc:
	@cat <<'UNIT'
[Unit]
Description=FleetOps server (ncc bundle)
After=network.target

[Service]
User=fleetops
Group=fleetops
WorkingDirectory=/opt/fleetops-server
EnvironmentFile=-/etc/default/fleetops-server
ExecStart=/usr/bin/node /opt/fleetops-server/index.js
Restart=on-failure
RestartSec=5
LimitNOFILE=65535
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=full
ProtectHome=read-only

[Install]
WantedBy=multi-user.target
UNIT

print-unit-sea:
	@cat <<'UNIT'
[Unit]
Description=FleetOps server (SEA binary)
After=network.target

[Service]
User=fleetops
Group=fleetops
WorkingDirectory=/opt/fleetops-server
EnvironmentFile=-/etc/default/fleetops-server
ExecStart=/opt/fleetops-server/fleetops-server
Restart=on-failure
RestartSec=5
LimitNOFILE=65535
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=full
ProtectHome=read-only

[Install]
WantedBy=multi-user.target
UNIT
