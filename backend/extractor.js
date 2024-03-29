const axios = require('axios');
const { JSDOM } = require("jsdom");
var TurndownService = require('turndown');
const keepDetails = require('./keep-details.js');
const loadPlugin = require('./plugin/loader.js');


class Extractor
{
  
  constructor(config, logger) {
    this.config = config;
    if (this.config['runner-map']) {
      this.runner_map = require(this.config['runner-map']);
    }
    this.logger = logger;
    this.logger.debug(`${JSON.stringify(this.config)}`)
    
    this.turndownService = new TurndownService();
    this.turndownService.use(keepDetails);
    
    // load runners
    this.runners = {
      default: require('./plugin/default-runner.js')
    };
    if (this.config.runners) {
      for (const runner_name in this.config.runners) {
        loadPlugin(runner_name).then((mod) => {
          this.runners[runner_name] = mod;
        }).catch((error) => {
          this.logger.error('loadPlugin:', error);
        });
      }
    }
  }
  
  async extract(request_option, runner, url, options) {
    return new Promise(async (resolve, reject) => {
      try {
        // try find runner
        if (runner === null) {
          runner = this.find_runner(url);
        }
        this.logger.debug(`runner: ${runner}`);
        
        // make request
        let axios_option = {
          method: (('method' in request_option) ? request_option.method : 'GET'),
          url: url,
          headers: (('headers' in request_option) ? request_option.headers : {}),
          cookies: (('cookies' in request_option) ? request_option.cookies : null),
        };
        axios_option.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        let resp = await axios(axios_option);
        
        // sanitize html
        let html = resp.data;
        let doc = await new JSDOM(html, {contentType: "text/html"}).window.document;
        
        // preprocessing
        let new_doc = await this.run_preprocess(runner, doc, options);
        
        // html to markdown
        let htmlstr = new_doc;
        let markdown = await this.turndownService.turndown(htmlstr);
        
        // postprocessing
        markdown = await this.run_postprocess(runner, markdown, options);
        
        resolve(markdown);
        
      } catch (error) {
        this.logger.error(`Exception: ${error}`);
        reject(error);
      }
    });
  }
  
  async run_preprocess(runner, doc, options) {
    return new Promise(async (resolve, reject) => {
      if (this.runners[runner]) {
        // run parent runner
        if (runner !== 'default' && this.config.runners[runner].after) {
          doc = await this.run_preprocess(this.config.runners[runner].after, doc, options);
        }
        // run current runner
        await this.runners[runner].preprocess(doc, options).then((result) => {
          resolve(result);
        }).catch((error) => {
          reject(error);
        })
      } else {
        reject(`Cannot find input runner: ${runner}`);
      }
    });
  }
  
  async run_postprocess(runner, markdown, options) {
    return new Promise(async (resolve, reject) => {
      if (this.runners[runner]) {
        // run parent runner
        if (runner !== 'default' && this.config.runners[runner].after) {
          markdown = await this.run_postprocess(this.config.runners[runner].after, markdown, options);
        }
        // run current runner
        await this.runners[runner].postprocess(markdown, options).then((result) => {
          resolve(result);
        }).catch((error) => {
          reject(error);
        })
      } else {
        reject(`Cannot find input runner: ${runner}`);
      }
    });
  }
  
  find_runner(url) {
    for (const key in this.runner_map) {
      if (url.match(new RegExp(key))) {
        return this.runner_map[key];
      }
    }
    return 'default';
  }
}

module.exports = Extractor;