// 获取用户代理字符串
var userAgent = navigator.userAgent

// 判断浏览器类型和版本
var browserName, browserVersion

if (userAgent.indexOf('Firefox') > -1) {
  // 如果是 Firefox 浏览器
  browserName = 'Firefox'
  browserVersion = userAgent.match(/Firefox\/(\d+)/)[1]
} else if (userAgent.indexOf('Chrome') > -1) {
  // 如果是 Chrome 浏览器
  browserName = 'Chrome'
  browserVersion = userAgent.match(/Chrome\/(\d+)/)[1]
} else if (userAgent.indexOf('Safari') > -1) {
  // 如果是 Safari 浏览器
  browserName = 'Safari'
  browserVersion = userAgent.match(/Version\/(\d+)/)[1]
} else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) {
  // 如果是 IE 浏览器
  browserName = 'Internet Explorer'
  browserVersion = userAgent.match(/(?:MSIE |rv:)(\d+)/)[1]
} else {
  // 其他浏览器
  browserName = 'Unknown'
  browserVersion = 'Unknown'
}

// 输出浏览器名称和版本
console.log('Browser Name: ' + browserName)
console.log('Browser Version: ' + browserVersion)

// // 只允许 Chrome 浏览器访问
// if (!(browserName === 'Chrome' || browserName === 'Edge')) {
//   window.stop()
//   alert(`当前浏览器为 ${browserName}，建议使用 Chrome 浏览器访问`)
//   // 在低版本浏览器中停止加载，显示提示信息
//   document.dispatchEvent(new CustomEvent('loaded'))
//   window.location.href = 'about:blank'
// }
// if ((browserName === 'Chrome' || browserName === 'Edge') && parseInt(browserVersion) < 100) {
//   window.stop()
//   alert(`当前浏览器版本过低，建议使用 Chrome 100+ 版本访问`)
//   document.dispatchEvent(new CustomEvent('loaded'))
//   window.location.href = 'about:blank'
// }
