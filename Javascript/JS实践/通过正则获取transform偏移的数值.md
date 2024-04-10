offsetWidth 获取元素宽
offsetLeft 获取元素定位偏移值
当元素使用 CSS3 中的 transform(translateX:100px)偏移时，无法用 offsetLeft 获取偏移值
解决办法：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Title</title>
    <style>
      .box {
        width: 200px;
        height: 200px;
        background-color: red;
      }
    </style>
  </head>
  <body>
    <div class="box"></div>
    <button class="btn">按钮</button>
    <button class="btn2">按钮2</button>
    <script>
      var box = document.querySelector(".box");
      var boxwidth = box.offsetWidth;
      console.log(boxwidth); // 盒子的宽度 200
      var btn = document.querySelector(".btn");
      var btn2 = document.querySelector(".btn2");
      // 点击按钮让盒子移动 负值表示左移 移动的量为100
      btn.onclick = function () {
        box.style.transform = "translateX(-100px)";
        box.style.webkitTransform = "translateX(-100px)";
      };
      // 点击按钮2打印出移动的值
      btn2.onclick = function () {
        console.log(box.offsetLeft); // 默认的偏移量 8
        var x = box.style.transform || box.style.webkitTransform;
        console.log(x); // translateX(-100px)
        var reg = /(translateX\(-)(\d+)(px\))/; // 左移和右移的正则相差一个 -
        var result = reg.exec(x)[2];
        console.log(result); // 通过正则获取到移动的值 100
      };
    </script>
  </body>
</html>
```
