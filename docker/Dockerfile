FROM ubuntu:16.04


# Install required packages
RUN apt-get update -y && \
    apt-get install -y \
        python3-dev \
        python3-pip \
        unzip


# Unpack the application code
COPY build/genetics-api.zip /tmp/genetics-api.zip
RUN unzip /tmp/genetics-api.zip -d /


RUN pip3 install -Ur /genetics-api/requirements.txt


# Container settings
WORKDIR /genetics-api
EXPOSE 8179
CMD gunicorn genetics_api.app -b 0.0.0.0:8179
