# Builder
FROM node:lts-alpine as builder

WORKDIR /root

COPY sslstrip.ts /root/sslstrip.ts

RUN npm install typescript @types/node && \
    npx tsc --lib "ES2021.String" sslstrip.ts


# Runner
FROM debian:bookworm

ARG DEBIAN_FRONTEND=noninteractive
ARG NODEJS_RELEASE=v20.12.0
ARG NODEJS_PREFIX=/usr/local/node


# Setup base tools and dsniff for arpspoof
RUN apt update && \
    apt install dsniff wget tcpdump git xz-utils tmux curl iproute2 iptables -y

# Setup node environment for ssl
RUN cd /tmp && \
    wget https://nodejs.org/dist/$NODEJS_RELEASE/node-$NODEJS_RELEASE-linux-arm64.tar.xz && \
    tar xvf node-$NODEJS_RELEASE-linux-arm64.tar.xz && \
    mv /tmp/node-$NODEJS_RELEASE-linux-arm64 $NODEJS_PREFIX && \
    rm -rf /tmp/node-$NODEJS_RELEASE-linux-arm64.tar.xz

# Copy scripts
COPY entrypoint.sh /entrypoint.sh
COPY --from=builder /root/sslstrip.js /root/sslstrip.js

# Fix entrypoint permission
RUN chmod +x /entrypoint.sh

ENTRYPOINT /entrypoint.sh
