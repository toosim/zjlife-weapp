/**
 * 配置文件 
 */

var host = "https://tolife.yuhanle.com/v1"
// var host = "http://127.0.0.1:8082/v1"

var config = {
  urls: {
    weatherUrl: `${host}` + '/weather/weatherInfo',
    toiletUrl: `${host}` + '/toilet/around',
    expressUrl: `${host}` + '/express/ebusinessOrderHandle',
    loginUrl: `${host}` + '/user/login',
    updateUrl: `${host}` + '/user/update',
    userinfoUrl: `${host}` + '/user/info',
  },
  notis: {
    swicthCity: 'citySelectedNotificatione',
    loginSuccess: 'loginSuccessNotificatione'
  }
};

module.exports = config