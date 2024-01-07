var config = require("./config/config.json");
const express = require('express')
var bodyParser = require('body-parser');
var logger = require('./logger.js')(config.log_filepath, config.log_level);
const Extractor = require('./extractor.js');
var extractor = new Extractor(config.extractor_config, logger);


const app = express()
app.use(bodyParser.json());


app.post('/api/extract', async (req, res) => {
  try {
    logger.debug(`req.body: ${JSON.stringify(req.body)}`);
    
    if (!('url' in req.body)) {
      res.status(400).json({
        ok:false,
        message: 'Missing url'
      });
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
  }
});


app.listen(config.port, config.host, () => {
  logger.info(`SiteExtract Backend listening on: ${config.host}:${config.port}`)
})
