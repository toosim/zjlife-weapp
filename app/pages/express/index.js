var Base64 = require('../../utils/base64.js').Base64;
var MD5 = require('../../utils/md5.min.js');
var util = require('../../utils/util.js');
var MockData = require('../../utils/mockdata.js');
var config = require('../../config.js');

Page({
  data: {
    result: {},
    focus: false,
    historySearch: []
  },

  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    });

  },

  onShow: function () {
    setTimeout(function () {
      wx.hideLoading()
    }, 100);
    this.showHistory();
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

  formSubmit: function (e) {
    let eorder = util.trim(e.detail.value.expressorder);

    if (!eorder) {
      let self = this;
      wx.showModal({
        title: '提示',
        content: '快递单号不能为空！',
        showCancel: false,
        confirmText: '我知道了',
        success: function (res) {
          if (res.confirm) {
            self.setData({
              focus: true
            })
          }
        }
      })
      return;
    }

    this.searchExpress(eorder);
  },

  deleteHistory: function (e) {
    var self = this;
    try {
      let historySearchList = wx.getStorageSync('historySearchList');

      let newList = historySearchList.filter(function (val) {
        return (val.order != e.currentTarget.dataset.order);
      });

      wx.setStorage({
        key: "historySearchList",
        data: newList,
        success: function () {
          self.showHistory();
        }
      })
    } catch (e) {
      console.log(e);
    }

  },

  showHistory: function () {
    var self = this;
    wx.getStorage({
      key: 'historySearchList',
      success: function (res) {
        self.setData({
          historySearch: res.data
        });
      }
    })
  },

  scanCode: function () {
    let self = this;
    wx.scanCode({
      success: (res) => {
        if (res.result) {
          self.searchExpress(util.trim(res.result));
        } else {
          wx.showModal({
            title: '提示',
            content: '快递单号不能为空！',
            showCancel: false,
            confirmText: '我知道了',
            success: function (res) {
              if (res.confirm) {
                self.setData({
                  focus: true
                })
              }
            }
          })
        }
      }
    })
  },

  searchExpress: function (eorder) {
    let self = this;

    if (MockData.env == "mock") {       //mock环境下使用假数据
      let res = MockData.getExpressName(eorder);
      let resData = res.data;
      let LogisticCode = resData.LogisticCode;
      let ShipperName = "";
      let ShipperCode = "";

      if (resData.Shippers.length == 1) {
        ShipperName = resData.Shippers[0].ShipperName;
        ShipperCode = resData.Shippers[0].ShipperCode;

        try {
          let historySearchList = wx.getStorageSync('historySearchList');
          if (!historySearchList) {
            historySearchList = [];
          };

          let newList = historySearchList.filter(function (val) {
            return (val.order != LogisticCode);
          });

          newList.push({
            "order": LogisticCode,
            "name": ShipperName,
            "code": ShipperCode,
          })

          wx.setStorage({
            key: "historySearchList",
            data: newList,
            success: function () {
              wx.navigateTo({
                url: '../express/detail?LogisticCode=' + LogisticCode + '&ShipperCode=' + ShipperCode + '&ShipperName=' + ShipperName
              })
            }
          })
        } catch (e) {
          console.log(e);
        }


      } else {

        let list = [];
        if (resData.Shippers.length >= 1 && resData.Shippers.length <= 6) {
          for (let i = 0; i < resData.Shippers.length; i++) {
            list.push(resData.Shippers[i].ShipperName)
          }

        } else if (resData.Shippers.length > 6) {
          for (let i = 0; i < 6; i++) {
            list.push(resData.Shippers[i].ShipperName)
          }

        } else {
          wx.showModal({
            title: '提示',
            content: '暂时没有查到该单号',
            success: function (res) {
            }
          })
        }

        wx.showActionSheet({
          itemList: list,
          success: function (res) {
            ShipperName = resData.Shippers[res.tapIndex].ShipperName;
            ShipperCode = resData.Shippers[res.tapIndex].ShipperCode;

            try {
              let historySearchList = wx.getStorageSync('historySearchList');
              if (!historySearchList) {
                historySearchList = [];
              };

              let newList = historySearchList.filter(function (val) {
                return (val.order != LogisticCode);
              });

              newList.push({
                "order": LogisticCode,
                "name": ShipperName,
                "code": ShipperCode,
              })

              wx.setStorage({
                key: "historySearchList",
                data: newList,
                success: function () {
                  wx.navigateTo({
                    url: '../express/detail?LogisticCode=' + LogisticCode + '&ShipperCode=' + ShipperCode + '&ShipperName=' + ShipperName
                  })
                }
              })
            } catch (e) {
              console.log(e);
            }

          },
          fail: function (res) {
            console.log(res.errMsg)
          }
        })

      }

    } else {    //正式环境下请求数据

      let requestData = "{\"LogisticCode\":\"" + eorder + "\"}";

      wx.request({
        url: config.service.requestUrl + '/express/ebusinessOrderHandle',
        data: {
          RequestData: requestData,
          RequestType: '2002'
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
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

          let resData = res.data;
          console.info(resData);
          let LogisticCode = resData.LogisticCode;
          let ShipperName = "";
          let ShipperCode = "";

          if (resData.Shippers.length == 1) {
            ShipperName = resData.Shippers[0].ShipperName;
            ShipperCode = resData.Shippers[0].ShipperCode;

            try {
              let historySearchList = wx.getStorageSync('historySearchList');
              if (!historySearchList) {
                historySearchList = [];
              };

              let newList = historySearchList.filter(function (val) {
                return (val.order != LogisticCode);
              });

              newList.push({
                "order": LogisticCode,
                "name": ShipperName,
                "code": ShipperCode,
              })

              wx.setStorage({
                key: "historySearchList",
                data: newList,
                success: function () {
                  wx.navigateTo({
                    url: '../express/detail?LogisticCode=' + LogisticCode + '&ShipperCode=' + ShipperCode + '&ShipperName=' + ShipperName
                  })
                }
              })
            } catch (e) {
              console.log(e);
            }

          } else {

            let list = [];
            if (resData.Shippers.length >= 1 && resData.Shippers.length <= 6) {
              for (let i = 0; i < resData.Shippers.length; i++) {
                list.push(resData.Shippers[i].ShipperName)
              }

            } else if (resData.Shippers.length > 6) {
              for (let i = 0; i < 6; i++) {
                list.push(resData.Shippers[i].ShipperName)
              }

            } else {
              wx.showModal({
                title: '提示',
                content: '暂时没有查到该单号',
                showCancel: false,
                confirmText: '我知道了'
              })

              return;
            }

            wx.showActionSheet({
              itemList: list,
              success: function (res) {
                ShipperName = resData.Shippers[res.tapIndex].ShipperName;
                ShipperCode = resData.Shippers[res.tapIndex].ShipperCode;

                try {
                  let historySearchList = wx.getStorageSync('historySearchList');
                  if (!historySearchList) {
                    historySearchList = [];
                  };

                  let newList = historySearchList.filter(function (val) {
                    return (val.order != LogisticCode);
                  });

                  newList.push({
                    "order": LogisticCode,
                    "name": ShipperName,
                    "code": ShipperCode,
                  })

                  wx.setStorage({
                    key: "historySearchList",
                    data: newList,
                    success: function () {
                      wx.navigateTo({
                        url: '../express/detail?LogisticCode=' + LogisticCode + '&ShipperCode=' + ShipperCode + '&ShipperName=' + ShipperName
                      })
                    }
                  })
                } catch (e) {
                  console.log(e);
                }

              },
              fail: function (res) {
                console.log(res.errMsg)
              }
            })

          }
        }
      })

    }
  },

  showDetail: function (event) {
    wx.navigateTo({
      url: '../express/detail?LogisticCode=' + event.currentTarget.dataset.order + '&ShipperCode=' + event.currentTarget.dataset.code + '&ShipperName=' + event.currentTarget.dataset.name
    })
  }
})
