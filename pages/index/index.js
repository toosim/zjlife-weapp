//index.js
//获取应用实例
var app = getApp()
var amapKey = '356499998b0159a49c7468a6301a5efc'
var amapFile = require('../../utils/amap-wx.js')

Page({
  data: {
    Loadinghidden: true
  },
  onLoad: function () {
    var that = this;
    that.loadWeather();
  },
  refresh: function () {
    this.loadWeather();
  },
  loadWeather: function () {
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
      "冰雹": "bingbao.png",
      "小雪": "xiaoxue.png",
      "小雨": "xiaoyu.png",
      "阴": "yin.png",
      "雨夹雪": "yujiaxue.png",
      "阵雨": "zhenyu.png",
      "中雨": "zhongyu.png"
    };
    var background = {
      "大雨": "background-dayu",
      "中雨": "background-dayu",
      "小雨": "background-xiaoyu",
      "暴雨": "background-dayu",
      "雷阵雨": "background-leizhenyu",
      "晴": "background-qing"
    };

    var that = this
    var myAmapFun = new amapFile.AMapWX({ key: amapKey })
    myAmapFun.getRegeo({
      success: function (data) {
        //成功回调
        var addressComponent = data[0].regeocodeData.addressComponent;
        var city = addressComponent.district;
        weather.city = city;

        wx.request({
          url: 'https://json.foxser.me/weather_mini.php',
          method: 'POST',
          data: {
            'city': city
            },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            var data = res.data;
            if (data.status === 1000) {
              var today = {};
              today.wendu = data.data.wendu;          //温度
              var forecast = data.data.forecast;      //天气特征与未来天气
              var todayWeather = forecast[0];         //今天的天气
              today.low = todayWeather.low.split(' ')[1];    //最低温
              today.high = todayWeather.high.split(' ')[1];  //最高温
              var typeText = todayWeather.type;
              today.typeText = typeText;                     //天气类型说明
              today.week = todayWeather.date.slice(3);       //星期几
              today.typeIcon = typeIcon[typeText];           //天气类型图片
              if (background[typeText]) {
                today.typeBackgorund = background[typeText];
              } else {
                today.typeBackgorund = "background-default";
              }
              weather.today = today;

              //下周天气、未来天气
              var temp, futureList = [];
              for (var i = 1; i < forecast.length; i++) {
                temp = forecast[i];
                var future = {};
                future.week = temp.date.slice(3);
                future.type = typeIcon[temp.type];
                var wendurange = temp.low.split(' ')[1] + "-" + temp.high.split(' ')[1];
                future.wendu = wendurange;
                future.typeTetx = temp.type;
                futureList.push(future);
              }

              weather.futureList = futureList;
              console.info(weather);
              that.setData({
                addressComponent: addressComponent,
                weather: weather,
                Loadinghidden: true
              });
            }
          },
          fail: function (err) {
            console.error(err);

            wx.showModal({
              title: '错误提示',
              content: err.desc,
              showCancel: false,
              confirmText: '我知道了'
            })
          }
        });
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
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '至简生活+',
      desc: '让你的生活，像呼吸一样简单！',
      path: '/pages/index/index',
      success: function(res) {
        // 分享成功
        wx.showModal({
          title: '分享成功',
          content: '感谢您的支持',
          showCancel: false,
          confirmText: '我知道了'
        })
      },
      fail: function(res) {
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
