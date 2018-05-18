/**
 * 网络请求模块
 * 
 * method  请求方式: 默认 `POST`
 */

function request(data) {
  console.log(data);
  wx.request({
    url: data.url,
    method: data.method || "POST",
    data: data.data,
    header: data.header || { "content-type": "application/json" },
    success: function (res) {
      console.log(res);
      data.success ? data.success(res) : null;
    },
    fail: function (error) {
      console.log(error);
      data.fail ? data.fail(error) : null;
      wx.showModal({
        title: '提示',
        content: error.errMsg,
        showCancel: false
      })
    },
    complete: function (res) {
      data.complete ? data.complete(res) : null;
    }
  })
}

module.exports = {
  request: request
}