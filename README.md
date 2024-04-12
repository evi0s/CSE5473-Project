# CSE5473 Project

ARP Spoofing w/ SSL Striping

## Setup

### Prerequisites

A Linux host w/ desktop environment.

### Dependencies

Install Docker for deploying the project.
The host requires X11 (or Wayland) for redirecting Firefox window from container.

IP forwarding is also required. Enable through the command below.

```bash
# running as root
echo 1 > /proc/sys/net/ipv4/ip_forward
```

### Build images

Build the images via `docker compose`

```bash
docker compose build
```

### X11 permission fixup

Temporarily allow X11 connection from any clients.

```bash
xhost +
```

## Launch project

### Bring up all containers

Deploy all containers.

```bash
docker compose up -d
```

### Attach to the attacker's container

Attach to attacker's container to observe ARP spoofing, SSL Striping and other traffic.

```bash
docker attach attacker
```

### Browse OSU's websites using Firefox

Notice that the firefox window should be already popped up in the host machine.
If not, check the logs using:

```bash
docker logs victim
```

After that, browse any websites using 301/302 HTTPS redirection (e.g., OSU's many websites).
Notice that all traffic will be marked as insecure.

