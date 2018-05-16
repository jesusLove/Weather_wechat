const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTemp: '14°',
    nowWeather: '晴天',
    nowWeatherBackground: '',
    hourlyWeather: []
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getNow(() => {
      wx.stopPullDownRefresh() // 停止刷新
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNow()
  },

  // 获取网络数据，callback是匿名函数做参数
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '青岛市'
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        console.log(res.data)
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  // 设置当前天气
  setNow(result) {
    let temp = result.now.temp
    let weather = result.now.weather

    // 使用this.setData异步
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/asserts/' + weather + '-bg.png',
    })
    // 动态设置导航栏颜色
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  // 未来几个小时天气
  setHourlyWeather(result) {
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    var hourlyWeather = []
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/asserts/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  }
})
