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
    list: [
      {
        serviceId: '00005FF0-0000-1000-8000-00805F9B34FB',
        characteristics: [
          {
            properties: {
              indicate: false,
              notify: false,
              read: true,
              write: true
            },
            uuid: '00005FF1-0000-1000-8000-00805F9B34FB'
          },
          {
            properties: {
              indicate: false,
              notify: false,
              read: true,
              write: true
            },
            uuid: '00005FF2-0000-1000-8000-00805F9B34FB'
          },
          {
            properties: {
              indicate: false,
              notify: false,
              read: true,
              write: true
            },
            uuid: '00005FF3-0000-1000-8000-00805F9B34FB'
          },
          {
            properties: {
              indicate: false,
              notify: false,
              read: true,
              write: true
            },
            uuid: '00005FF4-0000-1000-8000-00805F9B34FB'
          },
          {
            properties: {
              indicate: false,
              notify: true,
              read: false,
              write: false
            },
            uuid: '00005FF5-0000-1000-8000-00805F9B34FB'
          }
        ]
      },
      {
        serviceId: '0000FEE7-0000-1000-8000-00805F9B34FB',
        characteristics: [
          {
            properties: {
              indicate: false,
              notify: false,
              read: false,
              write: true
            },
            uuid: '0000FEC7-0000-1000-8000-00805F9B34FB'
          },
          {
            properties: {
              indicate: true,
              notify: false,
              read: false,
              write: false
            },
            uuid: '0000FEC8-0000-1000-8000-00805F9B34FB'
          },
          {
            properties: {
              indicate: false,
              notify: false,
              read: true,
              write: false
            },
            uuid: '0000FEC9-0000-1000-8000-00805F9B34FB'
          }
        ]
      }
    ]
  },
  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
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
        console.log(that.data.list)
        for (var i = 0; i < res.services.length; i++) {
          wx.getBLEDeviceCharacteristics({
            deviceId: connectedDeviceId,
            serviceId: res.services[i].uuid,
            success: function (res) {
              details.push({ serviceId: res.serviceId, characteristics: res.characteristics })
              console.log(details)
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