// const access_token = require('./config').access_token

App({

  getIssuesInfo: function (url, func) {
    var globalData = this.globalData;
    wx.request({
      url: url,
      data: {
        // 配置access_token，以突破api的访问次数限制
        // access_token: access_token
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        func(res.data);
      }
    });
  },

  globalData: {
    plans: null
  }
})
