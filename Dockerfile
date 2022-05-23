FROM node:17.9.0-alpine3.14

RUN mkdir -p /app

WORKDIR /app

COPY . /app


CMD ["node" , "index.js"]