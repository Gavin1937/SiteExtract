var config = require("./config/config.json");
const express = require('express')
const cookieParser = require("cookie-parser");
const session = require('express-session');
var cors = require('cors')
var bodyParser = require('body-parser');
var logger = require('./logger.js')(config.log_filepath, config.log_level);
const fs = require('node:fs');
const path = require('node:path');
const Extractor = require('./extractor.js');
var extractor = new Extractor(config.extractor_config, logger);


const app = express()
app.use(cors({
	credentials: true,
	origin: config.cors_origin_whitelist
}))
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
	// express-session needs a secret for signing sessions with HMAC
	// we use a session_secret from config file to ensure its security
	secret: config.session_secret,
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false }
}));

function checkCredential(cookies) {
  for (let i of config.allowed_credentials) {
    if (cookies.siteextract_token && cookies.siteextract_token == i) {
      return true;
    }
  }
  return false;
}

app.get('/api/runners', async (req, res) => {
  try {
    if (!checkCredential(req.cookies)) {
      logger.warn(`Unauthorized Login`);
      return res.status(401).json({
        ok: false,
        message: "Unauthorized Credential"
      });
    }
    
    let output = {
      default: [
        {name:'no_img',type:'binary'},
        {name:'no_link',type:'binary'},
      ]
    }
    Object.keys(config.extractor_config.runners).forEach(k => {
      let tmp_options = config.extractor_config.runners[k].options;
      tmp_options = tmp_options ? tmp_options : []
      output[k] = tmp_options;
    });
    return res.status(200).json({
      ok: true,
      runners: output
    });
  } catch (error) {
    logger.error(`Error: ${error}`);
    return res.status(500).json({
      ok: false,
      message: 'Internal Server Error'
    })
  }
});

app.post('/api/extract', async (req, res) => {
  try {
    logger.debug(`req.body: ${JSON.stringify(req.body)}`);
    if (!checkCredential(req.cookies)) {
      logger.warn(`Unauthorized Login`);
      return res.status(401).json({
        ok: false,
        message: "Unauthorized Credential"
      });
    }
    
    if (!(req.body.url)) {
      return res.status(400).json({
        ok: false,
        message: 'Missing url'
      });
    }
    
    let url = req.body.url;
    let runner = (req.body.runner) ? req.body.runner : null;
    let request_options = (req.body.request_options) ? req.body.request_options : {};
    let runner_options = (req.body.runner_options) ? req.body.runner_options : {};
    
    let result = null;
    try {
      result = await extractor.extract(request_options, runner, url, runner_options);
    } catch (extract_error) {
      logger.error(`Error: ${extract_error}`);
      return res.status(400).json({
        ok: false,
        message: `Failed to request input url. ${extract_error}`
      });
    }
    
    return res.status(200).json({
      ok: true,
      content: result
    });
    
  } catch (error) {
    logger.error(`Error: ${error}`);
    return res.status(500).json({
      ok: false,
      message: 'Internal Server Error'
    })
  }
});

if (config.root_save_path && config.root_save_path !== null) {
  var forbidden_characters = [
    '..', '...', '....',
    '$', '|', '~', '!',
    '\\', '\'', '\"', ';', '^',
    '`', '*', '?', '<', '>', ':',
    '#', '@', '%', '&'
  ];
  app.post('/api/savetoserver', async (req, res) => {
    try {
      logger.debug(`req.body: ${JSON.stringify(req.body)}`);
      if (!checkCredential(req.cookies)) {
        logger.warn(`Unauthorized Login`);
        return res.status(401).json({
          ok: false,
          message: "Unauthorized Credential"
        });
      }
      
      if (!(req.body.path) || !(req.body.content)) {
        return res.status(400).json({
          ok: false,
          message: 'Missing Server Path or Content'
        });
      }
      let target_path = req.body.path;
      for (fc of forbidden_characters) {
        if (target_path.includes(fc)) {
          return res.status(400).json({
            ok: false,
            message: 'Input path contains forbidden character',
            forbidden_characters: forbidden_characters
          });
        }
      }
      let root_path = path.normalize(config.root_save_path);
      target_path = path.normalize(path.join(root_path, target_path));
      let relative = path.relative(root_path, target_path);
      let is_subdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
      if (!is_subdir) {
        return res.status(400).json({
          ok: false,
          message: 'Input path isn\'t under the root save path'
        });
      }
      let content = req.body.content;
      
      fs.writeFile(target_path, content, (err) => {
        if (err) {
          logger.error(err);
          return res.status(400).json({
            ok: false,
            message: 'Failed to save to server'
          });
        }
        return res.status(200).json({
          ok: true
        });
      });
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        ok: false,
        message: 'Internal Server Error'
      })
    }
  })
}


app.listen(config.port, config.host, () => {
  logger.info(`SiteExtract Backend listening on: ${config.host}:${config.port}`)
})
