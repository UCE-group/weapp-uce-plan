const Towxml = require('./towxml/main') // 引入Towxml库

App({
  towxml: new Towxml(), // 创建towxml对象
  globalData: {
    plans: null
  }
})
