//index.js
//获取应用实例
var app = getApp()
var amapKey = '356499998b0159a49c7468a6301a5efc'
var amapFile = require('../../utils/amap-wx.js')
var WxNotificationCenter = require("../../utils/WxNotificationCenter.js")

Page({
  data: {
    Loadinghidden: false,
    currentCity: '上海市'
  },
  onLoad: function () {
    var that = this
    that.loadWeather()

    WxNotificationCenter.addNotification("citySelectedNotificatione", that.loadWeather, that)
  },
  refresh: function () {
    this.loadWeather()
  },
  loadWeather: function () {
    var that = this

    var selectedCity = app.appData.selectedCity
    if (selectedCity.length) {
      that.updateCurrentWeather(selectedCity, selectedCity)
      return
    }

    that.setData({
      Loadinghidden: false
    })

    var myAmapFun = new amapFile.AMapWX({ key: amapKey })
    myAmapFun.getRegeo({
      success: function (data) {
        var addressComponent = data[0].regeocodeData.addressComponent;

        var country = addressComponent.country
        var province = addressComponent.province
        var city = addressComponent.city.length ? addressComponent.city : addressComponent.province
        var district = addressComponent.district

        that.updateCurrentWeather(city, district + ' ' + city)
      },
      fail: function (info) {
        //失败回调
        console.log(info)

        wx.showModal({
          title: '错误提示',
          content: err.errMsg,
          showCancel: false,
          confirmText: '我知道了'
        })
      },
      complete: function () {
        that.setData({
          Loadinghidden: true
        });
      }
    })
  },

  // 请求当前城市数据
  updateCurrentWeather: function (city, locationText) {
    var that = this;
    that.setData({
      Loadinghidden: false
    });
    var weather = {};
    var typeIcon = {
      "多云": "duoyun.png",
      "霾": "mai.png",
      "晴": "qing.png",
      "雾": "wu.png",
      "雷阵雨": "leizhenyu.png",
      "大雪": "daxue.png",
      "大雨": "dayu.png",
      "暴雪": "baoxue.png",
      "暴雨": "baoyu.png",
      "大到暴雨": "baoyu.png",
      "冰雹": "bingbao.png",
      "小雪": "xiaoxue.png",
      "小雨": "xiaoyu.png",
      "阴": "yin.png",
      "雨夹雪": "yujiaxue.png",
      "阵雨": "zhenyu.png",
      "中雨": "zhongyu.png",
      "小到中雨": "zhongyu.png"
    };
    var background = {
      "大雨": "background-dayu",
      "中雨": "background-dayu",
      "小雨": "background-xiaoyu",
      "阵雨": "background-xiaoyu",
      "暴雨": "background-dayu",
      "雷阵雨": "background-leizhenyu",
      "晴": "background-qing",
      "阴": "background-yin",
      "多云": "background-duoyun",
      "雾": "background-wu",
      "雾": "background-wu",
      "小雪": "background-xue",
      "大雪": "background-xue",
      "暴雪": "background-xue"
    };

    weather.city = city
    weather.location = locationText

    wx.request({
      url: 'https://tolife.yuhanle.com/v1/weather/weatherInfo',
      method: 'GET',
      data: {
        'city': city
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var data = res.data
        if (data.code == 10000) {
          var today = {}
          today.wendu = data.data.live.temperature          //温度
          var forecast = data.data.forecasts      //天气特征与未来天气
          var todayLive = data.data.live  // 今天的实时天气
          var todayWeather = forecast[0]         //今天的天气
          today.low = todayWeather.nighttemp + "℃"    //最低温
          today.high = todayWeather.daytemp + "℃"  //最高温
          var typeText = todayLive.weather
          today.typeText = typeText                     //天气类型说明
          today.week = todayWeather.week       //星期几
          today.typeIcon = typeIcon[typeText]           //天气类型图片
          if (background[typeText]) {
            today.typeBackgorund = background[typeText]
          } else {
            today.typeBackgorund = "background-default"
          }
          weather.today = today

          //下周天气、未来天气
          var temp, futureList = []
          for (var i = 1; i < forecast.length; i++) {
            temp = forecast[i]
            var future = {}
            future.week = temp.week
            future.type = typeIcon[temp.dayweather]
            var wendurange = temp.nighttemp + "℃" + "-" + temp.daytemp + "℃"
            future.wendu = wendurange
            future.typeTetx = temp.dayweather
            futureList.push(future)
          }

          weather.futureList = futureList
          that.setData({
            weather: weather,
            Loadinghidden: true,
            currentCity: city
          })
        } else {
          that.setData({
            Loadinghidden: true
          })

          wx.showModal({
            title: '错误提示',
            content: '暂不支持该城市',
            showCancel: false,
            confirmText: '我知道了'
          })

          // 出现错误 则清空当前城市
          app.appData.selectedCity = ''
          app.appData.selectedCityCode = ''
        }
      },
      fail: function (err) {
        console.error(err)

        that.setData({
          Loadinghidden: true
        })

        wx.showModal({
          title: '错误提示',
          content: err.desc,
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    })
  },

  switchCity: function () {
    wx.navigateTo({
      url: '/pages/switchcity/switchcity?city=' + this.data.currentCity,
      success: function (res) {
        // success
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '致简生活',
      desc: '让你的生活，像呼吸一样简单！',
      path: '/pages/index/index',
      success: function (res) {
        // 分享成功
        wx.showModal({
          title: '分享成功',
          content: '感谢您的支持',
          showCancel: false,
          confirmText: '我知道了'
        })
      },
      fail: function (res) {
        // 分享失败
        wx.showModal({
          title: '温馨提示',
          content: '分享失败',
          showCancel: false,
          confirmText: '我知道了'
        })
      }
    }
  },
})
