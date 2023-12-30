FROM debian:bookworm

RUN apt-get update && apt-get install -y debootstrap

ADD script /script
ADD assets /assets

VOLUME [ "/output", "/rootfs", "/script", "/config" ]

CMD ["/script/init.sh"]