FROM node:alpine3.17

# setup working dir & copy source code
WORKDIR /src/
COPY . .

# build
RUN npm install && \
    mkdir /src/log/ && \
    mkdir /src/data/

# production deploy
ENV NODE_ENV="production"
ENTRYPOINT ["node", "server.js"]

EXPOSE 3000