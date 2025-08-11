# FleetOps Server - Production Runbook

This doc covers two ways to run the server in production:

- **A. ncc tarball**: unpack a single-file JS bundle and run with Node 22+
- **B. SEA binary**: run a true single-file executable (no Node installed)

Both artifacts are attached to each GitHub Release.

---

## Prerequisites

- Linux host with `systemd`
- Non-root service user (we’ll create `fleetops`)
- If using the ncc tarball: Node.js 22.x LTS runtime (`/usr/bin/node`)

> Why these artifacts:
> - **ncc** compiles a Node project plus deps into one JS file - minimal deployment, fast boot.  
> - **SEA** (Single Executable Application) is an official Node feature that embeds your app into a Node binary so you don’t need Node on the target host.  
> See Node’s SEA docs and ncc docs for details.
>
> References: Node SEA, ncc. 

## Ports and env

- `PORT` - listen port (default 3000)
- `HOST` - bind address (default 0.0.0.0)

Create an environment file:

```bash
sudo mkdir -p /etc/default
printf "PORT=3000\nHOST=0.0.0.0\nNODE_ENV=production\n" | sudo tee /etc/default/fleetops-server >/dev/null
```

## Create service user and directories

Open bash terminal and run: 
```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin fleetops || true
sudo mkdir -p /opt/fleetops-server
sudo chown -R fleetops:fleetops /opt/fleetops-server
```


A) **Run from ncc tarball (requires Node on host)**

1. Place the tarball and unpack:
    ```bash
    # Example: server-ncc-v0.2.1.tar.gz
    sudo tar -xzf server-ncc-<TAG>.tar.gz -C /opt/fleetops-server
    sudo chown -R fleetops:fleetops /opt/fleetops-server
    ```
2. One-off test run:
    sudo -u fleetops NODE_ENV=production PORT=3000 HOST=0.0.0.0 node /opt/fleetops-server/index.js
    Install systemd service:

3. Install systemd service: /etc/systemd/system/fleetops-server.service

    ```ini file
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
    # sensible limits
    LimitNOFILE=65535
    # basic hardening
    NoNewPrivileges=yes
    PrivateTmp=yes
    ProtectSystem=full
    ProtectHome=read-only

    [Install]
    WantedBy=multi-user.target
    ```

4. Enable and start:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable --now fleetops-server
    sudo systemctl status fleetops-server
    ```

B) **Run from SEA binary (no Node required)**

1. Place the fleetops-server binary:
    ```bash
    sudo mv fleetops-server /opt/fleetops-server/fleetops-server
    sudo chown fleetops:fleetops /opt/fleetops-server/fleetops-server
    sudo chmod 0755 /opt/fleetops-server/fleetops-server
    ```

2. One-off test run:
    ```bash
    sudo -u fleetops PORT=3000 HOST=0.0.0.0 /opt/fleetops-server/fleetops-server
    ```
3. Install systemd service: /etc/systemd/system/fleetops-server-sea.service
    ```ini
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
    # basic hardening
    NoNewPrivileges=yes
    PrivateTmp=yes
    ProtectSystem=full
    ProtectHome=read-only

    [Install]
    WantedBy=multi-user.target
    ```

4. Enable and start:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable --now fleetops-server-sea
    sudo systemctl status fleetops-server-sea
    ```

-----

## Ops - common commands

- logs:
    journalctl -u fleetops-server -f
    journalctl -u fleetops-server-sea -f

- restart after updating files (either one of the following)
    sudo systemctl restart fleetops-server
    sudo systemctl restart fleetops-server-sea


## makefile usage examples
- ** ncc **
make -C server print-unit-ncc | sudo tee /etc/systemd/system/fleetops-server.service
sudo systemctl daemon-reload && sudo systemctl enable --now fleetops-server

- ** SEA **
make -C server print-unit-sea | sudo tee /etc/systemd/system/fleetops-server-sea.service
sudo systemctl daemon-reload && sudo systemctl enable --now fleetops-server-sea


## Security hardening tips
The examples include a practical baseline.
For stricter isolation consider: (Add under [Service])
    ```ini
    ProtectSystem=strict
    ReadWritePaths=/var/lib/fleetops /var/log/fleetops
    RestrictSUIDSGID=yes
    RestrictNamespaces=yes
    LockPersonality=yes
    MemoryDenyWriteExecute=yes
    ```
- Use a dedicated non-root user and keep writable paths explicit.
- PrivateTmp=yes ensures your service gets its own /tmp.
- ProtectSystem=full|strict remounts most of the FS read-only; add ReadWritePaths= for required write locations.
- Test hardening gradually and watch logs.





