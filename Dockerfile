FROM node:18.3-buster
RUN apt-get update -y
RUN apt-get install -y python3
RUN npm install -g node-pre-gyp
COPY . /app
WORKDIR /app
RUN npm install
CMD node app.js