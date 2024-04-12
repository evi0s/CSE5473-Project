FROM debian:bookworm


RUN apt update && \
    apt install curl iproute2 iputils-ping traceroute \
                firefox-esr -y

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT /entrypoint.sh
