var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: null,
    avatar: null,
    time: null,
    plans: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    var name = options.name;
    var plans = app.globalData.plans;

    this.setData({name: name, plans: plans});

    wx.setNavigationBarTitle({
      title: name + " -- 学习计划合集",
    })

    var avatar = null;
    var time = null;
    for (var i = 0; i < plans.length; i++) {
      if (avatar == null && plans[i].name == name) {
        avatar = plans[i].avatar;
        time = plans[i].time;
        that.setData({ avatar: avatar, time: time });
      }
    }
  },

  showContent: function (e) {
    var num = e.currentTarget.id;
    var name = this.data.name;
    var time = e.currentTarget.dataset.time;
    // console.log(name);
    // console.log(time);
      wx.navigateTo({
        url: '../articles/article?num=' + num + '&name=' + name + '&time=' + time
      });
  },
})