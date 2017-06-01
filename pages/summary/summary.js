const git_url = require('../../config').git_url;
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    titleInfo: [],
    page: 1
  },

  /**
   * 备份数据，用于异步加载数据
   */
  dataSlave: {
    titleInfoSlave: []
  },

  showData: {
    issuesTitle: null,
    issuesWeek: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 启动导航条加载动画
    wx.showNavigationBarLoading();
    // 读取缓存
    var value = wx.getStorageSync('titleInfo') || [];
    // 有无缓存分类处理，有缓存则直接加载，无缓存从网络获取
    if (value.length) {
      this.setData({ titleInfo: value });
      this.setIssuesData();
      wx.hideNavigationBarLoading();
      // 异步请求网络并更新数据
      this.getIssuesTitle(true);
    } else {
      this.getIssuesTitle(false);
    }

  },

  getIssuesTitle: function (isStore) {
    var thisPage = this;
    var pageData = isStore ? this.dataSlave.titleInfoSlave : this.data.titleInfo;
    var url = git_url + '?page=' + this.data.page;
    this.setData({ page: this.data.page + 1 });
    app.getIssuesInfo(url, function (data) {
      if (data.length != 0) {
        for (var i = 0; i < data.length; i++) {
          pageData.push({ num: data[i].number, title: data[i].title, avatar: data[i].user.avatar_url });
        }
        // 递归获取Issues的标题
        thisPage.getIssuesTitle(isStore);
      } else {
        wx.setStorage({
          key: 'titleInfo',
          data: pageData,
        });
        wx.hideNavigationBarLoading();
        // console.log(pageData);
      }
    });
    if (!isStore)
      this.setIssuesData();
  },

  setIssuesData() {
    // 对标题进行字符串处理
    var titleArray = [];
    var weekArray = [];
    var titleInfo = this.data.titleInfo;
    for (var i = 0; i < titleInfo.length; i++) {
      var title = titleInfo[i].title;
      // 修改用户笔误
      title = title.replace('季', '期');
      // 获取用户姓名以及周数
      var name = title.substr(title.lastIndexOf('-') + 1).trim();
      var hasName = false;
      for (var j = 0; j < titleArray.length; j++) {
        if (titleArray[j].name.match(name))
          hasName = true;
      }
      weekArray.push({ num: titleInfo[i].num, key: name, value: title.substring(4, title.lastIndexOf('-')).replace('期-第', '期 -- 第') });
      if (!hasName) {
        titleArray.push({ name: name, open: false, avatar: titleInfo[i].avatar });
      }
    }
    this.setData({ issuesTitle: titleArray });
    this.setData({ issuesWeek: weekArray });
  },

  kindToggle: function (e) {
    var issuesTitle = e.currentTarget.dataset.list;
    // console.log(issuesTitle);
    var title = e.currentTarget.id;
    // 展开列表
    for (var i = 0, len = issuesTitle.length; i < len; ++i) {
      if (issuesTitle[i].name == title) {
        issuesTitle[i].open = !issuesTitle[i].open
      } else {
        issuesTitle[i].open = false
      }
    }
    this.setData({ issuesTitle: issuesTitle });
  },

  showContent: function (e) {
    // console.log("e+" + e.currentTarget.id)
    wx.navigateTo({
      url: '../articles/article?num=' + e.currentTarget.id
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getIssuesTitle(true);
  }
})