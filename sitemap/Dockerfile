FROM python:3.5

RUN pip install --upgrade pip

WORKDIR /app/

COPY Makefile Makefile
COPY requirements.pip requirements.pip
RUN make install-deps

COPY . ./

EXPOSE 8000

CMD ["make", "run"]
