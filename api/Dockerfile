FROM python:3.6

ENV PYTHONUNBUFFERED true
RUN pip install --upgrade pip

WORKDIR /app/

COPY Makefile Makefile
COPY requirements.pip requirements.pip
RUN make install-deps

COPY . ./

EXPOSE 8000

CMD ["make", "run"]
