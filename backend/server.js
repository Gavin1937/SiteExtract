var config = require("./config/config.json");
const express = require('express')
var bodyParser = require('body-parser');
var logger = require('./logger.js')(config.log_filepath, config.log_level);
const fs = require('node:fs');
const path = require('node:path');
const Extractor = require('./extractor.js');
var extractor = new Extractor(config.extractor_config, logger);


const app = express()
app.use(bodyParser.json());


app.post('/api/extract', async (req, res) => {
  try {
    logger.debug(`req.body: ${JSON.stringify(req.body)}`);
    
    if (!('url' in req.body)) {
      res.status(400).json({
        ok: false,
        message: 'Missing url'
      });
      return;
    }
    let url = req.body.url;
    let runner = ('runner' in req.body) ? req.body.runner : 'default';
    let request_options = ('request_options' in req.body) ? req.body.request_options : {};
    let runner_options = ('runner_options' in req.body) ? req.body.runner_options : {};
    
    let result = await extractor.extract(request_options, runner, url, runner_options);
    res.status(200).json({
      ok: true,
      content: result
    });
    
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Internal Server Error'
    })
    return;
  }
});

if ('root_save_path' in config && config.root_save_path !== null) {
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
      
      if (!('path' in req.body) || !('content' in req.body)) {
        res.status(400).json({
          ok: false,
          message: 'Missing json parameter'
        });
      }
      let target_path = req.body.path;
      for (fc of forbidden_characters) {
        if (target_path.includes(fc)) {
          res.status(400).json({
            ok: false,
            message: 'Input path contains forbidden character',
            forbidden_characters: forbidden_characters
          });
          return;
        }
      }
      let root_path = path.normalize(config.root_save_path);
      target_path = path.normalize(path.join(root_path, target_path));
      let relative = path.relative(root_path, target_path);
      let is_subdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
      if (!is_subdir) {
        res.status(400).json({
          ok: false,
          message: 'Input path isn\'t under the root save path'
        });
        return;
      }
      let content = req.body.content;
      
      fs.writeFile(target_path, content, (err) => {
        if (err) {
          this.logger.error(err);
          res.status(400).json({
            ok: false,
            message: 'Failed to save to server'
          });
          return;
        }
        res.status(200).json({
          ok: true
        });
      });
    } catch (error) {
      this.logger.error(error);
      res.status(500).json({
        ok: false,
        message: 'Internal Server Error'
      })
      return;
    }
  })
}


app.listen(config.port, config.host, () => {
  logger.info(`SiteExtract Backend listening on: ${config.host}:${config.port}`)
})
