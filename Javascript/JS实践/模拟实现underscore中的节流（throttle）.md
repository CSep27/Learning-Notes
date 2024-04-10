函数节流（throttle）：当持续触发事件时，保证一定时间段内只调用一次事件处理函数。
滚动一次窗口
1、第三个参数未传，滚动时触发一次，等待 1500ms 后再触发一次
2、第三个参数对象 leading 传 false，滚动时不立即触发，1500ms 后触发一次
3、第三个参数对象 trailing 传 false，滚动时立即触发，1500ms 后不触发
注：leading 和 trailing 不能同时设置为 false
应用场景：拖拽触发事件；指定时间后调用
举例：

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
<script src="./throttle.js"></script>
<!-- <script src="https://cdn.jsdelivr.net/npm/underscore@1.10.2/underscore.min.js"></script> -->
<script>
  var throttle = _.throttle(function() {
    console.log('hello throttle')
  }, 1500/* , {
    trailing: false
  } */)
  window.onscroll = throttle
</script>
</html>
```

实现：

```
var _ = {}
_.now = Date.now
/*
  @method: throttle节流函数，避免频繁触发操作
  @params: 1. func（Function） 需要节流的函数
           2. wait（Number）   间隔时间（ms）
           3. options（Object）没有传值 表示默认会执行两次，一次立即执行，一次等待wait毫秒后执行
              3.1 leading （Boolean）设置为false 表示阻止第一次执行
              3.2 trailing （Boolean）设置为false 表示阻止最后一次执行
  @return: 返回传入函数参数的节流版本
*/
_.throttle = function (func, wait, options) {
  var args, result, lastTime = 0 // 初始值
  var timeOut = null
  if (!options) {
    options = {}
  }
  var later = function () {
    // 执行一次之后，如果设置了leading为false，需要把lastTime设为0，为了能够执行lastTime = now
    // 没有设置则lastTime为当前设置为当前时间
     lastTime = options.leading === false ? 0 : _.now()
     console.log("later-lasttime: ", lastTime)
     timeOut = null // 一次执行后清除定时器，为了下次能够执行
     result = func.apply(null, args) // 执行回调
     return result
  }
  return function () {
    // 当前执行节流函数的时间
    var now = _.now()
    args = arguments
    // lastTime为0表示是首次执行
    if (!lastTime && options.leading === false) { // 设置了leading为false
      lastTime = now // 执行此步后remaining为wait
    }
    // 配置了Leading 首次执行remaining 为wait
    // now - lastTime为两次触发节流函数之间的间隔
    // 两次之间间隔小于wait时，remaining为正值
    // 配置了trailing 直接执行下面代码，第一次lastTime为0，remaining会是负数
    // 只有当now - lastTime间隔大于wait时，remaining才为负数
    console.log("lasttime: ", lastTime)
    console.log("now: ",now)
    var remaining = wait - (now - lastTime)
    console.log(timeOut)
    console.log(remaining)
    if (remaining <= 0) {
      // 设置trailing为false
      if (timeOut) {
        clearTimeout(timeOut)
        timeOut = null
      }
      lastTime = now // 第一次执行后，把now赋值给lastTime
      result = func.apply(null, args) // 立即执行
    } else if (!timeOut && options.trailing !== false) { // 设置了leading为false同时没有设置trailing为false
      // timeOut不为空 这时说明已经有定时函数，这时就不能再触发执行，如此实现了限流，即隔指定时间再执行，中间触发时都不执行
      // timeOut为空 没有定时函数，并且options.trailing !== false 说明没有传入trailing
      // 没有传入配置项时，会先立即执行过一次后，还没有定时器，会进这里
      // 在remaining时间段后会再执行一次，即没有配置会执行两次，一次立即执行，一次是wait时间后执行
      // 由于此时已经过了now - lastTime 所以是remaining时间后再执行，总体来看就是 一次立即执行，一次是wait时间后执行
      timeOut = setTimeout(later, remaining) // 由于leading为false要实现隔wait时间调用，那么remaing值等于wait 那么now与lastTime就要相等
    }
    return result
  }
}
```
