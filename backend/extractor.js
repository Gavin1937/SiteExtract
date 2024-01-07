const axios = require('axios');
const { JSDOM } = require("jsdom");
var TurndownService = require('turndown')
const keepDetails = require('./keep-details.js')


class Extractor
{
  
  constructor(config, logger) {
    this.config = config;
    if ('runner-map' in this.config) {
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
    if ('runners' in this.config) {
      for (const runner_name in this.config.runners) {
        this.runners[runner_name] = require(`./plugin/${runner_name}`);
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
          headers: (('headers' in request_option) ? request_option.headers : null),
          cookies: (('cookies' in request_option) ? request_option.cookies : null),
        };
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
      if (runner in this.runners) {
        // run parent runner
        if (runner !== 'default' && 'after' in this.config.runners[runner]) {
          doc = await this.run_preprocess(this.config.runners[runner]['after'], doc, options);
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
      if (runner in this.runners) {
        // run parent runner
        if (runner !== 'default' && 'after' in this.config.runners[runner]) {
          markdown = await this.run_postprocess(this.config.runners[runner]['after'], markdown, options);
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