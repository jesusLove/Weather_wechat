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

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')
var qqmapsdk;


const UNPROMPTED = 0 
const UNAUTHORIZED = 1
const AUTHORIZED = 2;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTemp: '14°',
    nowWeather: '晴天',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayDate: '',
    todayTemp: '',
    city: '北京市',
    loactionAuthType: UNPROMPTED
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
    
    qqmapsdk = new QQMapWX({
      key: '7GTBZ-3U2EV-3LFPY-UGJ6B-ZVZ5F-HAB6V'
    })
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth ? AUTHORIZED : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        })
        if (auth) {
          this.getCityAndWeather()
        } else {
          this.getNow()
        }
      }
    })
  },

  // 获取网络数据，callback是匿名函数做参数
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      header: {
        'content-type': 'application/json'
      },
      success: res => {
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  setToday(result){
    let date = new Date()
    let today = result.today
    this.setData({
      todayTemp: today.minTemp + '° - '  + today.maxTemp + '°',
      todayDate: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' 今天'
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
  },

  
  onTapDayWeather() {
    // wx.showToast({})
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },

  // 获取位置
  onTapLocation() {
    // 未授权，进入设置页面
    if (this.data.locationAuthType == UNAUTHORIZED) {
      
      wx.openSetting({
        success: res => {
          let auth = res.authSetting['scope.userLocation']
          if (auth) {
            this.getCityAndWeather()
          }
        }
      })

    } else {
      this.getCityAndWeather()
    }
  },
  // 获取逆地理编码
  getCityAndWeather () {
    // 在回调函数中使用this会出错
    var that = this;
    wx.getLocation({
      success: function (res) {

        let lat = res.latitude
        let long = res.longitude
        that.setData({
          locationAuthType: AUTHORIZED
        })
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: lat,
            longitude: long
          },
          success: res => {
            let city = res.result.address_component.city
            that.setData({
              city: city
            })
            that.getNow()
          }
        })
      },
      fail: () => {
        that.setData({
          locationAuthType: UNAUTHORIZED
        })
      }
    })
  }

})
