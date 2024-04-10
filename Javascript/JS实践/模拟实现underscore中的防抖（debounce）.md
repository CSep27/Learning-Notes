防抖（debounce）：当持续触发事件时，不希望频繁执行操作，而是希望过段时间再执行。
例如：滚动窗口，刚开始滚动时触发一次（第三个参数设置为 true），并且打印当前时间和'hello debounce'（第一个参数函数执行的结果），若持续滚动则不触发，若再次触发时间与上次触发间隔了 1500ms(第二个参数间隔时间)时则再次触发
应用：点击按钮发送请求时，不希望用户频繁点击触发请求

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div style="height: 3000px"></div>
</body>
<script src="./debounce.js"></script>
<!-- <script src="https://cdn.jsdelivr.net/npm/underscore@1.10.2/underscore.min.js"></script> -->
<script>
  // 防抖函数
  var debounce = _.debounce(function () {
    console.log((new Date()))
    console.log('hello debounce')
  }, 1500, true)
  window.onscroll = debounce
  // 第三个参数为true 立即调用  滑动时立即执行
  // 第三个参数为false 默认 等待1500时间后执行 两次触发间隔大于1500才执行
  // 核心在于上一次调用防抖函数与这一次调用之间是否大于间隔1500 只有大于时才会执行
</script>
</html>
```

实现：

```
// debounce.js
var _ = {}
_.now = Date.now

/*
  @method: debounce防抖函数，避免频繁触发操作
  @params: 1. Function 需要防抖的函数
           2. Number   防止抖动的间隔时间
           3. Boolean  是否立即调用
  @return: 返回传入函数参数的防抖版本
*/
_.debounce = function (func, wait, immediate) {
  var lastTime, timeOut, args, result
  // 防抖
  var later = function () {
    var last = _.now() - lastTime
    if (last < wait) {
      timeOut = setTimeout(later, wait - last)
    } else {
      timeOut = null
      if (!immediate) {
        result = func.apply(null, args)
      }
    }
  }
  return function () {
    args = arguments
    lastTime = _.now()
    var callNow = immediate && !timeOut
    if (!timeOut) {
      timeOut = setTimeout(later, wait)
    }
    if (callNow) {
      result = func.apply(null, args)
    }
    return result
  }
}
```
