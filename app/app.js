var config = require('./config.js')
var WxNotificationCenter = require("./utils/WxNotificationCenter.js")
var tolife = require("./utils/request.js")

App({
  onLaunch: function () {
    var token = wx.getStorageSync("token")
    if (token.length) {
      return
    }

    var that = this
    this.getUserInfo(function (userinfo) {
      var data = { wuAuth: { code: userinfo.code } }
      tolife.request({
        url: config.urls.loginUrl,
        data: data,
        success: function (res) {
          that.globalData.token = res.data.data.token
          wx.setStorageSync("token", that.globalData.token)

          // 更新用户信息
          wx.request({
            url: config.urls.updateUrl,
            method: 'POST',
            data: {
              token: res.data.data.token,
              userinfo: {
                avatar: userinfo.avatarUrl,
                nick_name: userinfo.nickName
              }
            },
            success: function (res) {
              that.globalData.userInfo = res.data.data.userInfo
              WxNotificationCenter.postNotificationName(config.notis.loginSuccess)
            }
          })
        }
      })
    })
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (info) {
          typeof cb == "function" && cb(info)
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    token: null
  },

  // APP 全局数据
  appData: {
    selectedCity: '',
    selectedCityCode: ''
  }
})