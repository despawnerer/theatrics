FROM node:6.0

RUN apt-get update && apt-get install -y \
    nginx-light \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /app/

COPY Makefile Makefile
COPY package.json package.json
RUN make install-deps

COPY . ./
RUN make build-min && make clean && rm -rf src

EXPOSE 8000

CMD ["nginx", "-c", "/app/nginx.conf"]
