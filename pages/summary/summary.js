const access_token = require('../../config').access_token;
const git_url = require('../../config').git_url;

var app = getApp();
Page({

  data: {
    plans: [],
    cnt: 0,
    loadonce: 0,
    cnt_page: 10
  },

  showData: {
    titles: null,
    names: null
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '加载FP中...'
    });
    // console.log(new Date());
    // 启动导航条加载动画
    wx.showNavigationBarLoading();
    // 获取数据
    this.getPlans();
  },

  /**
   * 从网络加载plans原始数据
   */
  getPlans: function() {
    var that = this;
    var plans = this.data.plans;
    var cnt_page = this.data.cnt_page; // 每次并行数
    var cnt = this.data.cnt; // getplans执行次数
    var cnt_data = 0; // 判断这次10个并行有多少数据
    var cnt_finish = 0; // 判断10个并行结束了几个
    for (var i = 0; i < cnt_page; i++) {
      var url = git_url + '?page=' + (cnt * cnt_page + i + 1);
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
          if (res.data.length != 0) {
            cnt_data++;
            // console.log("save第" + cnt_data);
            that.saveData(res.data);
            wx.setNavigationBarTitle({
              title: '加载FP中...' + plans.length + "条"
            });
          }
          cnt_finish++;
          if (cnt_finish == cnt_page)
            if (cnt_data == cnt_page) {
              that.setData({cnt: cnt+1});
              that.getPlans();
            } else
              that.loadFinish();
        }
      });
    }
  },

  /**
   * 加载数据完成后的操作
   */
  loadFinish: function() {
    var loadonce = this.data.loadonce;
    if (loadonce != 1) {
      this.setData({loadonce: 1});
      var plans = this.data.plans;
      wx.setNavigationBarTitle({
        title: 'FP排序中...'
      });
      // console.log(new Date());
      this.sortPlan();
      wx.hideNavigationBarLoading();
      wx.setNavigationBarTitle({
        title: '加载完成，共' + plans.length + '条FP',
      });
      // console.log(new Date());
      this.setPlansList();
      app.globalData.plans = plans;
        // console.log(app.globalData.plans);
    }
  },

  sortPlan: function() {
    var plans = this.data.plans;
    for (var i = 0; i < plans.length - 1; i++) {
      for (var j = 0; j < plans.length - i - 1; j++) {
        if (plans[j].num < plans[j+1].num) {
          var temp = plans[j];
          plans[j] = plans[j+1];
          plans[j+1] = temp;
        }
      }
    }
    this.setData({plans: plans});
  },

  /**
   * 处理原始数据格式，存入plans
   */
  saveData: function(data) {
    var plans = this.data.plans;
    for (var i = 0; i < data.length; i++) {
      // 数据格式处理
      var num = data[i].number;
      var title = data[i].title;
      var avatar = data[i].user.avatar_url;
      var name = title.substr(title.lastIndexOf('-') + 1).trim();
      var time = " -- (" + data[i].created_at.substr(0, 10) + "更新)";

      if (name.length == 2) {
        name = name.substr(0, 1) + " " + name.substr(1, 2);
      }
      title = title.substring(0, title.lastIndexOf('-'));

      plans.push({ num: num, title: title, avatar: avatar, name: name, time: time });
    }
  },

  /**
   * 从plans渲染列表数据
   */
  setPlansList: function() {
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
          // 大于5的话就不往title列表里加了
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

  /**
   * 点击展开或关闭列表
   */
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

  /**
   * 点击子项跳转其他页面
   */
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
  }
})