FROM debian:bookworm

# Tells systemd we're in a virtualized environment
ENV container docker

# Install systemd
RUN apt-get update && \
    apt-get install -y \
    dbus systemd && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN systemctl set-default multi-user.target

# Mask services which do not make sense to run in a service container
RUN systemctl mask \
    dev-hugepages.mount \
    sys-fs-fuse-connections.mount \
    sys-kernel-config.mount \
    display-manager.service \
    getty@.service \
    systemd-logind.service \
    systemd-remount-fs.service \
    getty.target \
    graphical.target

STOPSIGNAL SIGRTMIN+3

RUN passwd -d root

# 3>&1 redirects the first file descriptor opened by systemd to stdout
CMD ["/bin/bash", "-c", "SYSTEMD_COLORS=false exec /lib/systemd/systemd --log-target=journal 3>&1"]