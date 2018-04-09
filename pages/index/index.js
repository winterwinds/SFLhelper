//index.js
//获取应用实例
const app=getApp()
Page({
  data:{
    alert: "Loading",
    sessionReady: false,
    userInfoReady: false,

    buttonClass:"hide",
  },
  //事件处理函数
  onLoad: function () {
    var that = this

    // 登录
    wx.checkSession({
      success: () => {
        console.log("登录处于有效期")
        if (!wx.getStorageSync("3rd_session")) {
          console.log("session丢失！")
          that.userLogin(that)
        }else{
          that.setData({
            sessionReady: true,
          })
        }
      },
      fail: () => {
        that.userLogin(that)
      }
    })
    // 发送 res.code 到后台换取 openId, sessionKey, unionId

    // 获取用户信息
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          console.log("没有权限")
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              console.log("userInfo授权成功")
            },
            fail() {
              console.log("userInfo授权失败")
              wx.showModal({
                title: "用户授权",
                content: "请允许访问用户信息",
                showCancel: true,
                success: res => {
                  if (res.confirm) {
                    wx.openSetting()
                  }
                }
              })
            }
          })
        } else {
          console.log("授权信息完整")
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo
              that.setData({
                userInfoReady: true,
              })
            }
          })
        }
      }
    })

    var redirectTimer = setTimeout(()=> {
      console.log("判断结果")
      console.log(this.data.sessionReady)
      console.log(this.data.userInfoReady)
      clearInterval(isReady)
      if (!this.data.sessionReady){
        this.setData({
          alert: "远程服务器登陆失败！",
        })
      }
       if (!this.data.userInfoReady) {
         this.setData({
           alert: "用户信息获取失败！",
           buttonClass:"show",
         })
       }
    }, 15000)

    var isReady = setInterval(()=>{
      console.log("循环判断")
      if (this.data.sessionReady && this.data.userInfoReady){
        clearTimeout(redirectTimer)
        wx.redirectTo({
          url: '../homepage/homepage',
        })
        clearInterval(isReady)
      }
    },2000)
  },

  retry:function(){
    wx.reLaunch({
      url:"./index",
    })
  },

  userLogin: function (that) {
    console.log("登录函数调用")
    wx.login({
      success: function (res) {
        console.log(res.code)

        var requestTimer = setTimeout(function () {
          loginReq.abort()
          console.log("远程服务器请求超时！")
        }, 10000)

        const loginReq = wx.request({
          url: 'http://127.0.0.1:8080/getCode',
          data: {
            userCode: res.code
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          },
          success: res => {
            var data = res.data
            if (data) {
              wx.setStorageSync("3rd_session", data)
              var storageData = wx.getStorageSync("3rd_session")
              console.log("秘钥上传成功，3rdsession已保存")
              console.log("3rd_session:" + storageData)
              that.setData({
                sessionReady: true,
              })
            } else {
              console.log("秘钥上传失败")
            }
          },
          fail: res => {
            console.log("远程服务器拒绝访问！")
          },
          complete: res => {
            clearTimeout(requestTimer)
          }
        })
      }
    })
  }
})