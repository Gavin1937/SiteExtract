const axios = require('axios');
const { JSDOM } = require("jsdom");
var TurndownService = require('turndown')
const keepDetails = require('./keep-details.js')


class Extractor
{
  
  constructor(config, logger) {
    this.logger = logger;
    
    this.turndownService = new TurndownService();
    this.turndownService.use(keepDetails);
    
    // load runners
    this.runners = {
      default: require('./plugin/default-runner.js')
    };
    if ('runners' in config) {
      for (const runner_name in config.runners) {
        this.runners[runner_name] = require(`./plugin/${runner_name}`);
      }
    }
  }
  
  async extract(request_option, runner, url, options) {
    return new Promise(async (resolve, reject) => {
      try {
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
    return new Promise((resolve, reject) => {
      if (runner in this.runners) {
        this.runners[runner].preprocess(doc, options).then((result) => {
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
    return new Promise((resolve, reject) => {
      if (runner in this.runners) {
        this.runners[runner].postprocess(markdown, options).then((result) => {
          resolve(result);
        }).catch((error) => {
          reject(error);
        })
      } else {
        reject(`Cannot find input runner: ${runner}`);
      }
    });
  }
  
}

module.exports = Extractor;