FROM python:3.5-slim

# prerequisites

RUN apt-get update && apt-get install -y \
    make \
    wget \
    nginx-light

RUN wget -qO- https://deb.nodesource.com/setup_5.x | bash -

RUN apt-get install -y \
    nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# build the app

WORKDIR /www/theatrics/
COPY Makefile Makefile

COPY server/requirements.pip server/requirements.pip
RUN make install-server-deps

COPY importer/requirements.pip importer/requirements.pip
RUN make install-importer-deps

COPY client/package.json client/package.json
RUN make install-client-deps

COPY client client/
RUN make build-min clean-deps && rm -rf client/src

COPY server server/
COPY importer importer/

# run

RUN pip install honcho
COPY deploy deploy/

EXPOSE 80

CMD ["make", "run"]
