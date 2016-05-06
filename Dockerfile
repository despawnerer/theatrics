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

RUN pip install --upgrade pip

# build the app

WORKDIR /www/theatrics/

COPY api/Makefile api/Makefile
COPY api/requirements.pip api/requirements.pip
RUN cd api && make install-deps

COPY importer/Makefile importer/Makefile
COPY importer/requirements.pip importer/requirements.pip
RUN cd importer && make install-deps

COPY web/Makefile web/Makefile
COPY web/package.json web/package.json
RUN cd web && make install-deps

COPY web web/
RUN cd web && make build-min && make clean && rm -rf web/src

COPY api api/
COPY importer importer/

# run

RUN pip install honcho
COPY deploy deploy/

EXPOSE 80

CMD ["honcho", "start", "-f", "deploy/Procfile"]
