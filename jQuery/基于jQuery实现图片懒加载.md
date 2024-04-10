图片懒加载即先加载一张较模糊的，体积较小的图片，等到滚动显示到该图片时替换为高清图片。
简易版本：

```
/*
  @method: lazyload图片懒加载
  @params: 1. String 图片类名
           2. String 自定义标签名（值为待替换图片地址）
  @return: 懒加载执行函数
*/
(function(global, factory) {
  return factory.call(global, global.jQuery)
})(this, function($) {
  $.extend({
    lazyload: function (imgClass, userAttr) {
      return function () {
        if (!imgClass || !userAttr) {
          console.error('请传入图片类名和自定义标签名')
          return
        }
        var $imgs = $('.' + imgClass)
        var height = $(window).height() + $(window).scrollTop()
        for (var i = 0; i < $imgs.length; i++) {
          var $img = $($imgs[i])
          var top = $img.offset().top
          if (top <= height) {
            var newurl =$img.attr(userAttr)
            if (newurl) {
              $img.attr('src', newurl)
            } else {
              console.error('请在自定义标签上绑定新的图片url')
            }
          }
        }
      }
    }
  })
})
```

使用：timg1.jpeg 为清晰度低的图片，img_url 为自定义标签，值为清晰度高的图片地址

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<style>
  #box {
    width: 500px;
    height: 1000px;
    border: 1px solid #ddd;
  }
  #box1 {
    width: 500px;
    height: 100px;
    border: 1px solid #ddd;
  }
</style>
<body>
  <div id="box"></div>
  <img src="./timg1.jpeg" class="img" img_url="./timg2.jpeg">
  <div id="box1"></div>
  <img src="./timg1.jpeg" class="img" img_url="./timg2.jpeg">
</body>
<script src="https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js"></script>
<script src="./lazyload.js"></script>
<script>
  $(document).ready(function () {
    $(window).on('scroll', $.lazyload('img', 'img_url'))
  })
</script>
</html>
```
