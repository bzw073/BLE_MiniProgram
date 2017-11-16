//index.js
const app = getApp()
var devices_list = [
  //{ name: 'QDJS', deviceId: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffff', advertisData: '', RSSI: ''}
]
var connectedDeviceId
Page({
  data: {
    searching: false,
    button_width: 0,
    list_width: 0,
    list_height: 0
  },
  buf2hex: function (buffer) {
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },
  versionCompare: function (ver1, ver2) {  //版本比较
    var version1pre = parseFloat(ver1)
    var version2pre = parseFloat(ver2)
    var version1next = parseInt(ver1.replace(version1pre + ".", ""))
    var version2next = parseInt(ver2.replace(version2pre + ".", ""))
    if (version1pre > version2pre)
      return true
    else if (version1pre < version2pre)
      return false
    else {
      if (version1next > version2next)
        return true
      else
        return false
    }
  },
  searchBluetooth: function () {
    var that = this
    if (!that.data.searching) {
      wx.closeBluetoothAdapter({
        complete: function (res) {
          console.log(res)
          wx.openBluetoothAdapter({
            success: function (res) {
              console.log(res)
              wx.getBluetoothAdapterState({
                success: function (res) {
                  console.log(res)
                }
              })
              wx.onBluetoothAdapterStateChange(function (res) {
                console.log(res)
                that.setData({
                  searching: res.discovering
                })
                if (!res.available) {
                  that.setData({
                    devices_list: [],
                    searching: false
                  })
                }
              })
              wx.onBluetoothDeviceFound(function (devices) {
                //剔除重复设备，兼容不同设备API的不同返回值
                var isnotexist = true
                if (devices.deviceId) {
                  var i = 0
                  devices.advertisData = that.buf2hex(devices.advertisData)
                  if (devices.advertisData == "") {
                    devices.advertisData = '空'
                  }
                  if (devices.name == "") {
                    devices.name = '空'
                  }
                  console.log(devices)
                  for (i = 0; i < devices_list.length; i++) {
                    if (devices.deviceId == devices_list[i].deviceId) {
                      isnotexist = false
                    }
                  }
                  if (isnotexist) {
                    devices_list.push(devices)
                  }
                  else {
                    devices_list[i - 1].RSSI = devices.RSSI
                  }
                }
                else if (devices.devices) {
                  var i
                  devices.devices[0].advertisData = that.buf2hex(devices.devices[0].advertisData)
                  if (devices.devices[0].advertisData == "") {
                    devices.devices[0].advertisData = '空'
                  }
                  if (devices.devices[0].name == "") {
                    devices.devices[0].name = '空'
                  }
                  console.log(devices.devices[0])
                  for (i = 0; i < devices_list.length; i++) {
                    if (devices.devices[0].deviceId == devices_list[i].deviceId) {
                      isnotexist = false
                    }
                  }
                  if (isnotexist) {
                    devices_list.push(devices.devices[0])
                  }
                  else {
                    devices_list[i - 1].RSSI = devices.devices[0].RSSI
                  }
                }
                else if (devices[0]) {
                  var i
                  devices[0].advertisData = that.buf2hex(devices[0].advertisData)
                  if (devices[0].advertisData == "") {
                    devices[0].advertisData = '空'
                  }
                  if (devices[0].name == "") {
                    devices[0].name = '空'
                  }
                  console.log(devices[0])
                  for (i = 0; i < devices_list.length; i++) {
                    if (devices[0].deviceId == devices_list[i].deviceId) {
                      isnotexist = false
                    }
                  }
                  if (isnotexist) {
                    devices_list.push(devices[0])
                  }
                  else {
                    devices_list[i - 1].RSSI = devices[0].RSSI
                  }
                }
                that.setData({
                  devices_list: devices_list
                })
              })
              wx.startBluetoothDevicesDiscovery({
                allowDuplicatesKey: false,
                success: function (res) {
                  console.log(res)
                  that.setData({
                    searching: true,
                    devices_list: []
                  })
                }
              })
            },
            fail: function (res) {
              console.log(res)
              wx.showModal({
                title: '提示',
                content: '请检查手机蓝牙是否打开',
                showCancel: false,
                success: function (res) {
                  that.setData({
                    searching: false,
                    devices_list: []
                  })
                }
              })
            }
          })
        }
      })
    }
    else {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log(res)
          that.setData({
            searching: false
          })
        }
      })
    }
  },
  ConnectTo: function (e) {
    var that = this
    var advertisData, name
    console.log(e.currentTarget.id)
    for (var i = 0; i < devices_list.length; i++) {
      if (e.currentTarget.id == devices_list[i].deviceId) {
        name = devices_list[i].name
        advertisData = devices_list[i].advertisData
      }
    }
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
        that.setData({
          searching: false
        })
      }
    })
    wx.showLoading({
      title: '连接蓝牙设备中...',
    })
    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
        connectedDeviceId = e.currentTarget.id
        wx.navigateTo({
          url: '../device/device?connectedDeviceId=' + connectedDeviceId + '&name=' + name + '&advertisData=' + advertisData
        })
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '连接失败',
          showCancel: false
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
  onLoad: function () {
    console.log('系统: ' + app.getPlatform())
    console.log('系统版本: ' + app.getSystem())
    console.log('机型: ' + app.getModel())
    console.log('微信版本: ' + app.getVersion())
    console.log('实际宽度: ' + app.getWindowWidth())
    console.log('实际高度: ' + app.getWindowHeight())
    this.setData({
      devices_list: [],
      button_width: app.getWindowWidth() - 32,
      list_width: app.getWindowWidth() - 32,
      list_height: app.getWindowHeight() - 82
    })
    if (app.getPlatform() == 'android' && this.versionCompare('6.5.7', app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    }
    else if (app.getPlatform() == 'ios' && this.versionCompare('6.5.6', app.getVersion())) {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请更新至最新版本',
        showCancel: false
      })
    }
  },
  onHide: function () {
    var that = this
    this.setData({
      devices_list: []
    })
    if (this.data.searching) {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log(res)
          that.setData({
            searching: false
          })
        }
      })
    }
  }
})
