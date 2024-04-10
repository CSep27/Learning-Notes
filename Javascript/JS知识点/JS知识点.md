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
