# Configure Backend

You need to provide a `config.json` file under `backend/config` folder. Here is a template of `config.json`

```jsonc
{
    "host": "localhost",
    "port": 3000,
    "log_filepath": "/path/to/siteextract.log",
    "log_level": "debug",
    "root_save_path": "/path/to/SiteExtract/backend/data/",
    "session_secret": "expressjs session secret",
    "cors_origin_whitelist": [
        "http://localhost:3001" // frontend url
    ],
    "allowed_credentials": [
        "any string for user authentication token"
    ],
    "extractor_config": {
        "runner-map": "/path/to/runner-map.json",
        "runners": {
            "example-runner": {
                "before": "default",
                "options": [
                    {
                        "name": "option_1",
                        "type": "binary" // frontend will generate a checkbox
                    },
                    {
                        "name": "option_2",
                        "type": "input" // frontend will generate a text input
                    },
                    {
                        "name": "option_3",
                        "type": ["item_1", "item_2", "item_3"] // frontend will generate a dropdown menu
                    }
                ]
            }
        }
    }
}
```

* `log_level`: the backend uses [winston](https://github.com/winstonjs/winston) for logging, checkout [this doc for log_level](https://github.com/winstonjs/winston?tab=readme-ov-file#logging-levels)
* `root_save_path`: the backend can save Markdown content to a specified path, you can set the path here. If you don't want that feature, you can set it to `null`, the backend will disable this feature and its endpoint
* `session_secret`: a string expressjs session secret, can be any string
* `cors_origin_whitelist`: list of urls to the the frontend, they are whitelist for cors cross origin protection. This is because we need to send credentials (cookie) from the frontend to backend
* `allowed_credentials`: list of strings for user authentication credential, can be any string
* `extractor_config`: this field is reserve for plugins, checkout [Add Backend Plugin](#add-backend-plugin) for details. If you don't have any plugin, you can set it to empty object `{}`

> You can use [config.json.template](./config/config.json.template) to setup your `config.json`


# Deploy Backend

## Deploy with Docker (Recommanded)

Unser `backend` folder, to build Docker image with:

```sh
docker build -t siteextract-backend .
```

And then, you can run Docker container with:

```sh
docker run -d --rm \
    --name siteextract-backend \
    -v "$(pwd)/config:/src/config" \
    -v "$(pwd)/plugin:/src/plugin/plugin" \
    -v "$(pwd)/:/src/log" \
    -v "$(pwd)/data:/src/data" \
    -p 3000:3000 \
    siteextract-backend
```

> You can use [config.json.docker](./config/config.json.docker) to setup your backend container

## Deploy Manually

Under `backend` folder, to deploy the app for development:

```sh
npm install
npm run dev
```

To deploy for production:

```sh
npm install
node server.js
```


# Add Backend Plugin (Runner)

By default, the backend will send a `GET` request to user supplied url, and then convert the returned HTML to Markdown. (you can choose to remove image or links)

Plugin, is a `.js` file that allows you to process the HTML and Markdown by yourself. In here, we call them `runners`. [Checkout plugin/default-runner.js](./plugin/default-runner.js) for an example.

> Note, you MUST export two functions in your plugin: `preprocess` and `postprocess`.
> `preprocess` will take in a DOM object and some options pass in from the frontend, and it will return a processed DOM object.
> `postprocess` will take in a Markdown string and some options pass in from the frontend, and it will return a processed Markdown string.

## Configure Plugin

In your `config.json` file, the `extractor_config` field is for plugin configuration. Here is an example:

```jsonc
"extractor_config": {
    "runner-map": "/path/to/runner-map.json",
    "runners": {
        "example-runner": {
            "before": "default",
            "options": [
                {
                    "name": "option_1",
                    "type": "binary" // frontend will generate a checkbox
                },
                {
                    "name": "option_2",
                    "type": "input" // frontend will generate a text input
                },
                {
                    "name": "option_3",
                    "type": ["item_1", "item_2", "item_3"] // frontend will generate a dropdown menu
                }
            ]
        }
    }
}
```

* `runner-map`: path to a `runner-map.json` file to help the backend map url to your plugin. [More detail in here](#configure-runner-mapjson)
* `runners`: an object describe your plugin
  * `example-runner`: this is a string name of the runner, in this case `example-runner`. It can be any string.
    * `before`: name of another runner, default is `default` (default-runner). This field will tell the backend to run this plugin **before** the specified plugin. The backend will run plugins recursively until reaches `default`
    * `options`: list of objects, those objects describes different options that this plugin will take in as parameter. In [default-runner.js](./plugin/default-runner.js), options are `no_img` and `no_link`.
      * The individual option is an object that tells the frontend the name of object and its input type.
      * `name`: it can be any string, but I suggest to avoid using `-` as it is widely used in the frontend
      * `type`: describes the input type, can be one of following:
        * `"binary"`: true or false
        * `"input"`: string input
        * `Array`: a dropdown selection menu, the string inside will be the selection items.
      * The option of [default-runner.js](./plugin/default-runner.js) is hard coded, but its `options` will be:

```jsonc
"options": [
    {
        "name": "no_img",
        "type": "binary"
    },
    {
        "name": "no_link",
        "type": "binary"
    }
]
```

## Configure runner-map.json

`runner-map.json` is a file that describes how to map url to different plugins. Here is an example:

```jsonc
{
    ".*example\\.com.*": "example-runner"
}
```

* This file is made up with unique key:value pairs
  * `key`: the key part is a regex string that matches some url
    * Note that since this is a json file, so the regex string MUST be a valid json string. For example character `\` will be `\\`.
  * `value`: the value part is the plugin's name. It MUST be identical as the plugin's name in your `config.json`.

> Note, you can use [config/runner-map.json.template](./config/runner-map.json.template) to help you.


# Backend API

Backend API endpoints are start with `/api/...`

### **GET `/api/runners`**:

* **Cookies**:
  * `siteextract_token`: a string that matches any element in `config.json` file `allowed_credentials` list
* **Returns**:
  * all the runners defined in the config file with their options
  * Example Return:

```jsonc
{
    "ok": true, // boolean
    "runners": {
        "default": [
            {
                "name": "no_img",
                "type": "binary"
            },
            {
                "name": "no_link",
                "type": "binary"
            }
        ]
    }
}
```

### **POST `/api/extract`**:

* **Cookies**:
  * `siteextract_token`: a string that matches any element in `config.json` file `allowed_credentials` list
* **Request Body JSON**:
  * Example JSON:

```jsonc
{
    "url": "https://example.com",
    "runner": "default", // can be any plugin name defined in your config.json
    "request_options": { // request options for axios
        "method": "GET", // can be "GET", "POST", "PUT", or "DELETE"
        "headers": {}, // HTTP request headers
        "cookies": {} // HTTP request cookies
    },
    "runner_options": { // options that will be pass to all plugins
        "no_img": true,
        "no_link": true
    }
}
```

* **Returns**:
  * json with Markdown content
  * Example Return:

```jsonc
{
    "ok": true,
    "content": "Markdown string..."
}
```

### **POST `/api/savetoserver`**:

> This endpoint only enble if you provided a valid `root_save_path` field in `config.json`

* **Cookies**:
  * `siteextract_token`: a string that matches any element in `config.json` file `allowed_credentials` list
* **Request Body JSON**:
  * Example JSON:

```jsonc
{
    "path": "relative/path/with/filename.ext",
    "content": "Markdown string..."
}
```

> Note, the `path` will be sanitize and check, `path` MUST be a path **under** the `root_save_path`, and it cannot contain following characters:
> 
> ```js
> var forbidden_characters = [
> '..', '...', '....',
> '$', '|', '~', '!',
> '\\', '\'', '\"', ';', '^',
> '`', '*', '?', '<', '>', ':',
> '#', '@', '%', '&'
> ];
> ```
>
> Checkout [server.js](./server.js) for detail implementation

* **Returns**:
  * json
  * Example Return:

```jsonc
{
    "ok": true
}
```

## Request Failed

When request failed, the backend will return a json like following

```jsonc
{
    "ok": false,
    "message": "Error Message..."
}
```

> Note, check error message for error detail, some error json may contains more data. For example, when experiencing path issue while saving file to the backend, you will receive a json with `forbidden_characters`, a list of forbidden characters.

