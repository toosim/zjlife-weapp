var config = require('../../config.js');
var tolife = require("../../utils/request.js")

var object_toilet = {
  address: '',
  adname: '',
  biz_ext: [],
  biz_type: [],
  cityname: '',
  distance: '',
  id: '',
  importance: [],
  location: '',
  name: '',
  pname: '',
  poiweight: [],
  shopid: [],
  shopinfo: '',
  tel: [],
  type: '',
  typecode: ''
}

var __hasReady = false;

// toilet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    center_latitude: 31.068912,
    center_longitude: 121.390621,
    old_center: {},
    markers: [{
      id: 999,
      latitude: 31.068912,
      longitude: 121.390621,
      iconPath: '/image/toilet/location_toilet.png',
      height: 42,
      width: 36
    }],
    include_points: [],
    controls: [{
      id: 1,
      iconPath: '/image/toilet/location_control.png',
      position: {
        left: 10,
        top: 420,
        width: 40,
        height: 40
      },
      clickable: true
    }],
    userLocateState: false,
    userLocationInfo: {},
    dataArray: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.refreshControls()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('bikeMap')

    var that = this

    that.startLocate(function (res) {
      that.setData({
        center_latitude: res.latitude,
        center_longitude: res.longitude
      })

      that.requestAroundToilet(res, function (result) {
        that.setData({
          dataArray: result
        })

        that.createMarkers();
      })
    })

    __hasReady = true
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 用户点击右上角分享
   */
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

  // 定位按钮点击
  controltap: function (e) {
    console.log(e)

    if (e.controlId == 1) {
      this.moveToLocation()
    }
    else if (e.controlId == 3) {
      var that = this

      that.mapCtx.getCenterLocation({
        success: function (res) {
          console.log(res)

          that.requestAroundToilet(res, function (result) {
            that.setData({
              dataArray: result
            })

            that.createMarkers()
          })
        }
      })
    }
  },

  // 拖动地图区域变化
  bindregionchange: function (e) {
    console.log(e)
    
    if (!__hasReady) {
      return
    }
    
    if (e.type == 'end') {
      var that = this

      that.mapCtx.getCenterLocation({
        success: function (res) {
          console.log(res)

          // 判断旧中心点和新中心点的距离
          var old_center = that.data.old_center
          if (Math.abs(old_center.latitude - res.latitude) < 0.005 || 
              Math.abs(old_center.longitude - res.longitude) < 0.005) {
            return
          }

          that.setData({
            old_center: res
          })

          that.requestAroundToilet(res, function (result) {
            that.setData({
              dataArray: result
            })

            that.createMarkers()
          })
        }
      })
    }
  },

  bindmarkertap: function (e) {
    var toilet = this.data.dataArray[e.markerId]
    var data = this.data.markers[e.markerId]

    var latitude = new Number(data.latitude)
    var longitude = new Number(data.longitude)

    // this.setData({
    //   center_latitude: latitude.toFixed(6),
    //   center_longitude: longitude.toFixed(6)
    // })

    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: toilet.name,
      address: toilet.address
    })
  },

  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },

  // 创建地图上的标注
  createMarkers: function () {
    var markers = []
    for (var i = 0; i < this.data.dataArray.length; i++) {
      var result = {
        id: 999,
        latitude: 0,
        longitude: 0,
        iconPath: '/image/toilet/location_toilet.png',
        height: 43,
        width: 36
      }

      var toilet = this.data.dataArray[i]
      result.id = i;
      result.latitude = toilet.location.split(",")[1]
      result.longitude = toilet.location.split(",")[0]

      if (result.latitude && result.longitude) {
        markers.push(result)
      }
    }

    this.setData({
      markers: markers,
      // include_points: markers
    })
  },

  // 请求附近厕所数据
  requestAroundToilet: function (location, callback) {
    tolife.request({
      url: config.urls.toiletUrl,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      data: {
        location: location.longitude + ',' + location.latitude
      },
      success: function (res) {
        if (res.statusCode != 200) {
          wx.showModal({
            title: '提示',
            content: '服务器错误',
            showCancel: false,
            confirmText: '我知道了'
          })
          return;
        }

        if (res.data.infocode == 10000) {
          if (callback) {
            var result = []
            for (var i = 0; i < res.data.pois.length; i++) {
              var poi = res.data.pois[i]
              var toilet = Object.create(object_toilet)
              toilet = poi
              result.push(toilet)
            }

            callback(result)
          }

          wx.showToast({
            title: '附近有' + res.data.count + '家厕所',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: res.data.desc,
          })
        }
      },
      fail: function (error) {

      }
    })
  },

  // 开始定位用户信息
  startLocate: function (callback) {
    var that = this

    wx.getLocation({
      type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        // success
        console.log(res)
        that.setData({
          userLocateState: true,
          userLocationInfo: res
        })

        callback(res)
      },
      fail: function (error) {
        // fail
        console.log(error)

        that.setData({
          userLocateState: false,
          userLocationInfo: {}
        })
      }
    })
  },

  // 刷新 controls
  refreshControls: function () {
    var res = wx.getSystemInfoSync()

    var pinControl = {
      id: 2,
      iconPath: '/image/toilet/location_pin.png',
      position: { left: (res.windowWidth - 20) / 2.0, top: (res.windowHeight - 20*372/171.0) / 2.0 - 25, width: 20, height: 20*372/171.0 },
      clickable: false
    }

    var locateControl = {
      id: 1,
      iconPath: '/image/toilet/location_control.png',
      position: {
        left: 10,
        top: res.windowHeight - 120,
        width: 40,
        height: 40
      },
      clickable: true
    }

    var refreshControl = {
      id: 3,
      iconPath: '/image/toilet/location_refresh.png',
      position: {
        left: 10,
        top: res.windowHeight - 180,
        width: 40,
        height: 40
      },
      clickable: true
    }

    this.setData({
      controls: [
        pinControl,
        locateControl,
        refreshControl
      ]
    })
  },
})