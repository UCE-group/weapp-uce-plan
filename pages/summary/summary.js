const git_url = require('../../config').git_url;
var app = getApp();
Page({

  data: {
    plans: [],
    page: 1 // 按页获取issues数据
  },

  showData: {
    titles: null,
    names: null
  },

  onLoad: function (options) {
    // 启动导航条加载动画
    wx.showNavigationBarLoading();
    // 获取数据
    this.getPlans();
  },

  getPlans: function () {
    var thisPage = this;
    var plans = this.data.plans;
    var page = this.data.page;
    var url = git_url + '?page=' + page;
    this.setData({ page: this.data.page + 1 }); // page++
    app.getIssuesInfo(url, function (data) {
      if (data.length != 0) {
        for (var i = 0; i < data.length; i++) {
          // 数据格式处理
          var num = data[i].number;
          var title = data[i].title;
          var avatar = data[i].user.avatar_url;
          var name = title.substr(title.lastIndexOf('-') + 1).trim();
          if (name.length == 2) {
            name = name.substr(0, 1) + " " + name.substr(1, 2);
          }
          var time = " -- (" + data[i].created_at.substr(0, 10) + "更新)";
          title = title.substring(0, title.lastIndexOf('-'));

          plans.push({ num: num, title: title, avatar: avatar, name:name, time: time});
        }
        // 递归获取Issues的标题
        thisPage.getPlans();
        wx.setNavigationBarTitle({
          title: '正在加载第'+ page +'页，稍等...',
        });
      }
      else {
        // 加载完成
        wx.hideNavigationBarLoading();
        wx.setNavigationBarTitle({
          title: '加载完成，共' + plans.length + '条FP',
        });
        thisPage.setPlansList();
        app.globalData.plans = plans;
        // console.log(app.globalData.plans);
      }
    });
  },

  setPlansList() {
    // 生成列表数据
    var names = [];
    var titles = [];
    var plans = this.data.plans;
    for (var i = 0; i < plans.length; i++) {
      var num = plans[i].num;
      var title = plans[i].title;
      var avatar = plans[i].avatar;
      var name = plans[i].name;
      var time = plans[i].time;

      var hasName = false;
      for (var j = 0; j < names.length; j++) {
        if (names[j].name.match(name)) {
          hasName = true;
          if (names[j].sum < 5)
            titles.push({ num: num, name: name, title: title, time: time });
          if (names[j].sum == 5)
            titles.push({ num: (-1) * num, name: name, title: '【FP】查看Ta更早的学习计划', time: time });
          names[j].sum += 1;
        }
      }
      if (!hasName) {
        titles.push({ num: num, name: name, title: title, time: time });
        names.push({ sum: 1, name: name, time: time, avatar: avatar, open: false });
      }
    }
    this.setData({ titles: titles });
    this.setData({ names: names });
  },

  kindToggle: function (e) {
    // console.log(e.currentTarget.dataset.list);
    var names = e.currentTarget.dataset.list;
    var name = e.currentTarget.id;
    // 展开列表
    for (var i = 0; i < names.length; ++i) {
      if (names[i].name == name) {
        // 点击的列表展开
        names[i].open = !names[i].open
      } else {
        // 其他关闭
        names[i].open = false
      }
    }
    this.setData({ names: names });
  },

  showContent: function (e) {
    var num = e.currentTarget.id;
    var name = e.currentTarget.dataset.name;
    var time = e.currentTarget.dataset.time;
    // console.log(name)
    if (num > 0)
      wx.navigateTo({
        url: '../articles/article?num=' + num + '&name=' + name + '&time=' + time
      });
    else {
      
      wx.navigateTo({
        url: '../plan_list/plans?name=' + name
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getPlans();
  },

  onShow: function() {
    wx.setNavigationBarTitle({
      title: 'UCE学习计划合集',
    })
  }
})