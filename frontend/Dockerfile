FROM node:alpine3.17 AS build

# setup working dir & copy source code
WORKDIR /src/
COPY . .

# build
ARG BASENAME
ARG BACKEND_URL
ENV REACT_APP_BACKEND_URL="${BACKEND_URL}" \
    REACT_APP_BASENAME="${BASENAME}"

RUN \
    npm install --force && npm run build


# serving built frontend with nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY --from=build /src/build .
COPY ./nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
EXPOSE 3001