// pages/homepage/homepage.js
const app=getApp()
Page({
  data: {
    motto: '北大外院欢迎您',
    userInfo: {},
    hasUserInfo: false,
  },
  //事件处理函数
  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      hasUserInfo: true
    })
  }
})

