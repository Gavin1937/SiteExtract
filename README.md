# SiteExtract

A simple HTML to Markdown converter + Markdown Editor

# Configure

[Configure Backend](./backend/README.md#configure-backend)

[Configure Frontend](./frontend/README.md#configure-frontend)

# Deploy

## Deploy with Docker Compose (Recommanded)

To deploy with docker compose, you need to

1. [Configure the backend](./backend/README.md#configure-backend). I suggest you to put all the config files and plugins in one folder
2. Create & configure a `.env` file, checkout [.env.template](./.env.template) as an example

And then, in the repository root, build the app with:

```sh
docker-compose build
```

Deploy app with:

```sh
docker-compose up -d
```

Stop app with:

```sh
docker-compose down
```

## Deploy Individually

[Deploy Backend](./backend/README.md#deploy-backend)

[Deploy Frontend](./frontend/README.md#deploy-frontend)

# Special Thanks

1. [json-editor/json-editor](https://github.com/json-editor/json-editor) and [techfreaque/json-editor-react](https://github.com/techfreaque/json-editor-react) for JSON editor
2. [nhn/tui.editor](https://github.com/nhn/tui.editor) for Markdown editor
3. [mixmark-io/turndown](https://github.com/mixmark-io/turndown) for HTML to Markdown converter
