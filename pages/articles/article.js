const git_url = require('../../config').git_url;
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 34,
    name: null,
    time: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ num: options.num, name: options.name, time: options.time });
    // 启动导航条加载动画
    wx.showNavigationBarLoading();
    this.getIssuesContent();
  },

  getIssuesContent: function () {
    var that = this;
    var url = git_url + '/' + this.data.num;
    app.getIssuesInfo(url, function (data) {
      var article = data.body;
      WxParse.wxParse('article', 'md', article, that, 10);
      // console.log(article);
      wx.hideNavigationBarLoading();
    });
    wx.setNavigationBarTitle({
      title: that.data.name + that.data.time,
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  }
})