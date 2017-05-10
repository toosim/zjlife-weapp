var config = require('../../config.js');

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

// toilet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    center_latitude: 31.068912,
    center_longitude: 121.390621,
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
    var that = this

    that.refreshControls()

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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.mapCtx = wx.createMapContext('bikeMap')
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

  },

  // 定位按钮点击
  controltap: function (e) {
    this.moveToLocation()
  },

  bindmarkertap: function (e) {
    var toilet = this.data.dataArray[e.markerId]
    var data = this.data.markers[e.markerId]

    var latitude = new Number(data.latitude)
    var longitude = new Number(data.longitude)

    this.setData({
      center_latitude: latitude.toFixed(6),
      center_longitude: longitude.toFixed(6)
    })

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
        height: 42,
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
    wx.request({
      url: config.service.requestUrl + '/toilet/around',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      data: {
        location: location.longitude + ',' + location.latitude
      },
      success: function (res) {
        if (res.statusCode != 200) {
          return;
        }

        console.log(res)

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
        } else {
          wx.showToast({
            title: res.data.info,
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

    this.setData({
      controls: [
        locateControl
      ]
    })
  },
})