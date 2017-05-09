/**
 * 配置文件 
 */

var host = "https://tolife.yuhanle.com"
// var host = "http://127.0.0.1:8082"

var config = {

  service: {
    host,

    requestUrl: `${host}/v1`,
  },

  app: {
    appid: `wx9610498a65ffedca`,
  }
};

module.exports = config