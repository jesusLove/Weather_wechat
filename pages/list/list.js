// pages/list/list.js
const dayMap = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
  ]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    weakWeather: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },
  onPullDownRefresh: function () {
    this.getData(() => {
      wx.stopPullDownRefresh()
    })
  },
  // 获取网络数据
  getData(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: '青岛市',
        time: new Date() .getTime()
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        let result = res.data.result
        this.setWeakWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  // 刷新数据
  setWeakWeather(result) {
    console.log(result)

    let weakWeather = []
    for (let i = 0; i < 7; i += 1) {
      let weather = result[i]
      let date = new Date()
      date.setDate(date.getDate() + i)
      weakWeather.push({
        day: dayMap[date.getDay()],
        date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
        temp: weather.minTemp + '°~' + weather.maxTemp + '°',
        iconPath: '/asserts/' + weather.weather + '-icon.png'
      })
    }
    weakWeather[0].day = '今天'
    this.setData({
      weakWeather: weakWeather
    })
  }
})