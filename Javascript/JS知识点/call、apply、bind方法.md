# call、apply、bind 方法区别

- call 方法以给定的 this 值和**逐个提供的参数**调用该函数。
- 以给定的 this 值和作为数组（或类数组对象）提供的 arguments 调用该函数。
- bind()方法创建一个新函数，它会调用原始函数并将其 this 关键字设置为给定的值，同时，还可以传入一系列指定的参数，这些参数会插入到调用新函数时传入的参数的前面。

# [bind](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)

bind() 函数创建一个新的绑定函数（bound function）。调用绑定函数通常会执行其所包装的函数，也称为目标函数（target function）。绑定函数将绑定时传入的参数（包括 this 的值和前几个参数）提前存储为其内部状态。而不是在实际调用时传入。

> 在以下示例中，boundLog 为绑定函数，log 为目标函数。`const boundLog = log.bind("this value", 1, 2);`这行代码中，bind 的参数会被存储为内部状态。

绑定函数可以通过调用 boundFn.bind(thisArg, /_ more args _/) 进一步进行绑定，从而创建另一个绑定函数 boundFn2。新绑定的 thisArg 值会被忽略，因为 boundFn2 的目标函数是 boundFn，而 boundFn 已经有一个绑定的 this 值了。当调用 boundFn2 时，它会调用 boundFn，而 boundFn 又会调用 fn。fn 最终接收到的参数按顺序为：boundFn 绑定的参数、boundFn2 绑定的参数，以及 boundFn2 接收到的参数。

> `const boundLog2 = boundLog.bind("new this value", 3, 4);`中传入的"new this value"会被忽略

```js
// 加上这一行 可以防止 this 被封装到包装对象中
// 打印 this value 1 2 3 4 5 6
"use strict";

function log(...args) {
  console.log(this, ...args);
}
// 调用call会以"this value"为this执行log函数
log.call("this value", 1, 2); // this value 1 2
// 调用bind返回了一个函数，并不会执行
log.bind("this value", 1, 2);
// 返回的函数记为boundLog
const boundLog = log.bind("this value", 1, 2);
// 调用boundLog 此时才会执行log函数
boundLog();
// boundLog可以继续调用bind，但是新传入的"new this value"不会作为this值，this值仍然是第一次传入的"this value"
const boundLog2 = boundLog.bind("new this value", 3, 4);
boundLog2(5, 6);
// 没有添加"use strict"时
// this 为 "this value"，并且被封装到了String对象中，"new this value"会被忽略
// 打印一个length为10的String包装对象，并且传入的参数会按顺序依次打印
// String 1 2 3 4 5 6
```

# 题目：用 call 或 apply 实现 bind

1. bind 函数返回一个函数
2. 参数的顺序

```js
// 添加到Function原型上，这样每个函数都可以使用该方法
Function.prototype.myBind = function (self, ...restArgs) {
  const that = this;
  console.log(this); // 这个this，就是调用myBind的log函数
  return function (...args) {
    // 用call实现
    return that.call(self, ...restArgs, ...args);
    // 用apply实现
    // return that.apply(self, [...restArgs, ...args]);
  };
};

const myBoundLog = log.myBind("my this value", 11, 22);
// my this value 11 22 13 14
// myBoundLog(13, 14);
const myBoundLog2 = myBoundLog.bind("new my this value", 33, 44);
// my this value 11 22 33 44 55 66
// myBoundLog2(55, 66);
```

待学习：bind 的其他内容
