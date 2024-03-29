# Configure Frontend

You need to supply an url to the backend with one of following ways:

1. If you want to deploy the app with Docker, you need to provide a `--build-arg` for Docker container as environment variable

```
--build-arg='BASENAME=/'
--build-arg='BACKEND_URL=http://backend_url'
```

1. If you want to deploy the app manually, you need to provide either environment variables. Or, you can create a `.env` file under `frontend` folder. The required variables are:

```sh
REACT_APP_BASENAME="/"
REACT_APP_BACKEND_URL="http://backend_url"
```

> You can use [.env.template](./.env.template) file as your start.

# Deploy Frontend

## Deploy with Docker (Recommanded)

Under `frontend` folder, you can build Docker image with:

```sh
docker build \
    --build-arg='BACKEND_URL=/' \
    --build-arg='BACKEND_URL=http://backend_url' \
    -t siteextract-frontend .
```

And then, you can run Docker container with:

```sh
docker run -d --rm \
    --name siteextract-frontend \
    -p 3001:3001 \
    siteextract-frontend
```

## Deploy Manually

Under `frontend` folder, to deploy the app for development:

```sh
# you may need to handle dependency error via "--force"
npm install
npm run dev
```

To deploy the app for production:

```sh
npm install
npm run build
npm install serve -g
serve -p port_number ./build/
```

> Note: using `serve` may cause issue on path routing, consider use nginx with [nginx.conf](./nginx.conf) file under `frontend` folder

> Note: deploying the frontend with **HTTP** will causing some of the JavaScript features been disabled.
> In our case, `window.showSaveFilePicker` will be disabled, and "Save Editor Content To File" feature may
> trigger browser warning about insecure file.