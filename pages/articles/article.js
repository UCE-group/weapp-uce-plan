const git_url = require('../../config').git_url;
const access_token = require('../../config').access_token;
var app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    num: 34,
    name: null,
    time: null,
    article: {} //article将用来存储towxml数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ num: options.num, name: options.name, time: options.time });
    // 启动导航条加载动画
    wx.showNavigationBarLoading();
    wx.setNavigationBarTitle({
      title: '加载中...',
    })
    this.getIssuesContent();
  },

  getIssuesContent: function () {
    var that = this;
    var url = git_url + '/' + this.data.num;

    wx.request({
      url: url,
      data: {
        // 配置access_token，以突破api的访问次数限制
        access_token: access_token
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var md = res.data.body;
        //将markdown内容转换为towxml数据
        var mddata = app.towxml.toJson(
          md,             // `markdown`或`html`文本内容
          'markdown'      // `markdown`或`html`
        );
        that.setData({ article: mddata });
        wx.hideNavigationBarLoading();
        wx.setNavigationBarTitle({
          title: that.data.name + that.data.time,
        });
      }
    });
  }
})