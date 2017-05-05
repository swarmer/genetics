FROM ubuntu:16.04


# Install required packages
RUN apt-get update -y && \
    apt-get install -y \
        python3-dev \
        python3-pip \
        unzip \
        bzip2 \
        wget \
        curl \
        pkg-config \
        libgraphviz-dev \
        graphviz

# install clustalo
RUN wget -O /clustalo http://www.clustal.org/omega/clustalo-1.2.4-Ubuntu-x86_64
RUN chmod +x /clustalo

# Install anaconda with required packages
RUN wget -O /tmp/anaconda3_install https://repo.continuum.io/archive/Anaconda3-4.3.1-Linux-x86_64.sh
RUN bash /tmp/anaconda3_install -b -p /anaconda3
RUN rm /tmp/anaconda3_install
RUN /anaconda3/bin/conda upgrade --all -y
RUN /anaconda3/bin/conda install -y biopython gunicorn
RUN /anaconda3/bin/pip install pygraphviz

# Unpack the application code
COPY build/genetics-api.zip /tmp/genetics-api.zip
RUN unzip /tmp/genetics-api.zip -d /


RUN /anaconda3/bin/pip install -Ur /genetics-api/requirements.txt


# Container settings
WORKDIR /genetics-api
EXPOSE 8179
CMD /anaconda3/bin/gunicorn genetics_api.app -b 0.0.0.0:8179 -w 10
