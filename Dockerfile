FROM node

RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
 && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927 \
 && echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list \
 && apt-get update \
 && apt-get install -y mongodb-org

RUN useradd --user-group --create-home --shell /bin/false app &&\
  npm install --global npm

ENV HOME=/home/app

COPY package.json $HOME/library/
RUN chown -R app:app $HOME/*

USER root
WORKDIR $HOME/library
RUN npm install --silent --progress=false
COPY . $HOME/library
RUN chown -R app:app $HOME/*
RUN npm install --build-from-source bcrypt

CMD ["npm", "start"]
