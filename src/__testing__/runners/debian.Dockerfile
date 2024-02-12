FROM debian:bookworm

RUN apt-get update && \
    apt-get install -y \
    ca-certificates \
    wget \
    curl \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN update-ca-certificates