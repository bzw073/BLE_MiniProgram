// device.js
const app = getApp()
var connectedDeviceId, ServiceId
var characteristicId = []
Page({
  data: {
    isConnected: false,
    name: '',
    advertisData: '',
    details: [],
  },
  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
  onLoad: function (options) {
    var that = this
    connectedDeviceId = options.connectedDeviceId
    console.log('connectedDeviceId: ' + options.connectedDeviceId)
    console.log('name: ' + options.name)
    console.log('advertisData: ' + options.advertisData)
    this.setData({
      isConnected: true,
      connectedDeviceId: options.connectedDeviceId,
      name: options.name,
      advertisData: options.advertisData
    })
    wx.getBLEDeviceServices({
      deviceId: connectedDeviceId,
      success: function (res) {
        var details = []
        for (var i = 0; i < res.services.length; i++) {
          wx.getBLEDeviceCharacteristics({
            deviceId: connectedDeviceId,
            serviceId: res.services[i].uuid,
            success: function (res) {
              details.push({ serviceId: res.serviceId, characteristics: res.characteristics })
              //console.log(details)
            },
            fail: function (res) {
              console.log(res)
            }
          })
        }
      }
    })
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(res)
      if (!res.available) {
        wx.closeBLEConnection({
          deviceId: that.data.connectedDeviceId,
          success: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  onShow: function () {
    if (wx.setKeepScreenOn) {
      wx.setKeepScreenOn({
        keepScreenOn: true,
        success: function (res) {
          //console.log('保持屏幕常亮')
        }
      })
    }
  },
  onHide: function () {
    var that = this
    if (this.data.isConnected) {
      wx.closeBLEConnection({
        deviceId: this.data.connectedDeviceId,
        success: function (res) {
          console.log(res)
          that.setData({
            isConnected: false
          })
        }
      })
    }
  },
  onUnload: function () {
    var that = this
    if (this.data.isConnected) {
      wx.closeBLEConnection({
        deviceId: this.data.connectedDeviceId,
        success: function (res) {
          console.log(res)
          that.setData({
            isConnected: false
          })
        }
      })
    }
  }
})