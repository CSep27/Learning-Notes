注：记录 JS 中不需要单独成篇的知识点

# 事件传播的两种形式

浏览器如何处理针对嵌套元素的事件。

## 事件冒泡

事件默认是冒泡（从内往外，或者说从下往上）的形式，如果不希望冒泡，用`event.stopPropagation`阻止冒泡。

## 事件捕获

事件捕获的顺序是相反的，从外往内，默认是禁用的。

通过配置 addEventListener 的第三个参数对象`{capture: true}`，事件就会以捕获的形式传递。

## 事件委托

利用事件冒泡特性，解决问题：当父元素有大量子元素时，只需要在父元素上绑定事件。子元素上发生的事件会冒泡到父元素上，而不需要给每个子元素绑定事件。

使用 `event.target` 来获取事件的目标元素（也就是最里面的子元素）。如果我们想访问处理这个事件的父元素（在这个例子中是容器），我们可以使用 `event.currentTarget`。

# new.target

new.target 属性用于检测函数或构造方法是否是通过 new 运算符被调用的。

在通过 new 运算符被初始化的函数或构造方法中，new.target 返回一个指向构造方法或函数的引用。

在普通的函数调用中，new.target 的值是 undefined。

```js
function Foo() {
  if (!new.target) throw "Foo() must be called with new";
  console.log("Foo instantiated with new");
}

Foo(); // throws "Foo() must be called with new"
new Foo(); // logs "Foo instantiated with new"
```

# JavaScript 模块

[ESModule-JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules)

# [按位非（~）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_NOT)

按位非运算符（~）将操作数的位反转。如同其他位运算符一样，它将操作数转化为 32 位的有符号整型。

使用~~，有取整数部分的效果。

```js
const a = 5.1;
const b = -3.9;
const c = -3.1;
const d = 5.9;

console.log(~~a); // 5
console.log(~~b); // -3
console.log(~~c); // -3
console.log(~~d); // 5
```

# Element.getBoundingClientRect()

Element.getBoundingClientRect() 方法返回一个 DOMRect 对象，其提供了元素的大小及其相对于视口的位置。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      #box {
        height: 100px;
        width: 200px;
        background-color: gold;
        padding: 10px;
      }

      #child {
        height: 50px;
        width: 50px;
        background-color: rgb(213, 230, 247);
      }
    </style>
  </head>

  <body>
    <div id="box">
      <div id="child"></div>
    </div>
  </body>
  <script>
    const box = document.getElementById("box");
    const child = document.getElementById("child");
    console.log(JSON.stringify(box.getBoundingClientRect()));
    console.log(JSON.stringify(child.getBoundingClientRect()));
    const boxRect = {
      x: 8,
      y: 8,
      width: 200,
      height: 100,
      top: 8,
      right: 208,
      bottom: 108,
      left: 8,
    };
    const childRect = {
      x: 18,
      y: 18,
      width: 50,
      height: 50,
      top: 18,
      right: 68,
      bottom: 68,
      left: 18,
    };
  </script>
</html>
```

- 这里的视口就可以看做是 body，左上角为原点坐标为(0,0)
- [x,y]=[8,8]就是 box 的坐标，以盒子左上角的点算
- "width"、"height"就是盒子宽高
- top 同 y 值，如果 height 是负值，就是 y+height
- right 同 x+width，如果 width 是负值，就是 x
- bottom 同 y+height 值，如果 height 是负值，就是 y
- left 同 x 值，如果 width 是负值，就是 x+width
- 所以 left、top 可以看做盒子左上角点的坐标，right、bottom 可以看做盒子右下角点的坐标

# Object.isExtensible

- 判断对象是否可扩展
