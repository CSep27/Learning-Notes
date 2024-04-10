# 浏览器的 Event Loop

## 异步实现

1. 宏观：浏览器多线程
2. 微观：Event Loop 事件循环，实现异步的一种机制

资料：
[Event Loops 标准](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops)
[消息队列和事件循环](https://mp.weixin.qq.com/s/qb4zhbawVMroHRjScycEdg)（写得很清晰）

## 宏任务和微任务

### 宏任务（macro task）

- JavaScript 脚本执行事件
- setTimeout/setInterval 定时器
- [setImmediate](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/setImmediate)
- I/O 操作
- UI rendering

### 微任务（micro task）

- Promise
- [Object.observe](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/observe)
- [MutationObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver)
- postMessage

资料：[宏任务和微任务](https://mp.weixin.qq.com/s/GbjUALE1VnjgUFZT7fmywg)（分析的很详细）

## Event Loop 运行过程

![截屏2020-07-18 14.23.51.png](/img/bVbJRuN)
紫色部分即 Event Loop 的过程

[JS 中的栈内存堆内存](https://juejin.im/post/5d116a9df265da1bb47d717b)
栈是一个先进后出的数据结构

[调用栈](https://developer.mozilla.org/zh-CN/docs/Glossary/Call_stack)

- 每调用一个函数，解释器就会把该函数添加进调用栈并开始执行。
- 正在调用栈中执行的函数还调用了其它函数，那么新函数也将会被添加进调用栈，一旦这个函数被调用，便会立即执行。
- 当前函数执行完毕后，解释器将其清出调用栈，继续执行当前执行环境下的剩余的代码。

函数调用时会调用一些异步函数（定时器，Promise，Ajax 等），相应的异步处理模块对应的线程就会往任务队列里添加事件。

从任务队列中取出一个宏任务，该宏任务执行完，调用栈为空时，会执行所有的微任务（一个需要异步执行的函数，执行时机是在主函数执行结束之后、当前宏任务结束之前）。
继续事件循环，再取任务队列中的一个宏任务执行。

### Event Loop 处理模型

![截屏2020-07-18 14.31.41.png](/img/bVbJRvS)

代码分析 1：

```
console.log("1");
setTimeout(function() {
  console.log("2");
}, 0);
Promise.resolve().then(function() {
  console.log("3");
});
console.log("4");
// 输出：1 4 3 2
```

执行过程：

1. 当前是一个宏任务，依次执行，打印 1 4 后，宏任务队列空
2. 查看微任务队列，执行 Promise.resolve().then()，打印 3，微任务队列空
3. 重新渲染，任务队列里有定时器任务，执行，打印 2

一个 Event Loop 有一个或多个任务队列，每个 Event Loop 有一个微任务队列。
[requestAnimatinFrame](https://www.zhangxinxu.com/wordpress/2013/09/css3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95/)不在任务队列，处于渲染阶段。（待学习）

代码示例 2：
new Promise()传入的函数参数，在进行 new Promise()时会同步执行

```
console.log("start");

setTimeout(() => {
  console.log("setTimeout");
  new Promise(resolve => {
    console.log("promise inner1");
    resolve();
  }).then(() => {
    console.log("promise then1");
  });
}, 0);

new Promise(resolve => {
  console.log("promise inner2");
  resolve();
}).then(() => {
  console.log("promise then2");
});
// start
// promise inner2 这一步是同步执行的
// promise then2  这里是异步，微任务
// setTimeout
// promise inner1
// promise then1
```

1. 打印 start
2. new Promise()传入的函数参数，在进行 new Promise()操作时会同步执行，打印 promise inner2
3. 执行微任务，打印 promise then2
4. 事件循环，执行宏任务 setTimeout，打印 setTimeout
5. 执行 new Promise()，打印 promise inner1
6. 执行微任务，打印 promise then1

代码示例 3：

```
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  return Promise.resolve().then(_ => {
    console.log("async2 promise");
  });
}

console.log("start");
setTimeout(function() {
  console.log("setTimeout");
}, 0);
async1();
new Promise(function(resolve) {
  console.log("promise1");
  resolve();
}).then(function() {
  console.log("promise2");
});
/*
start
async1 start
promise1
async2 promise
promise2
async1 end
setTimeout
*/
```

1. 打印"start"
2. 执行 async 函数 async1，打印"async1 start"
3. 执行 await async2(); async2 也是一个 async 函数，返回一个 Promise 对象，这里是一个微任务，放入微任务队列。await 是等待后面函数的执行结果，因此暂停在这里。
4. 执行 new Promise()，打印"promise1"，这里也有一个微任务，也放进微任务队列。
5. 宏任务执行完，现在检查微任务队列，按顺序执行，先打印"async2 promise"，再打印"promise2"。当前任务结束。
6. 进入下一个事件循环，setTimeout 的时间设置为 0，肯定已达到，setTimeout 已在任务队列中，执行，打印"setTimeout"。

# Node.js 的 Event Loop

## Node.js 架构图

![截屏2020-07-18 14.59.11.png](/img/bVbJRyU)

- node-core API 核心 JS 库
- 绑定 负责包装和暴露 libuv 和 JS 的其他低级功能
- V8 引擎 JS 引擎，是 JS 可以运行在服务端的基础
- libuv Node 底层的 I/O 引擎，负责 Node API 的执行，将不同任务分配给不同的线程，以异步的方式将任务的执行结果返回给 V8 引擎，是 Node 异步编程的基础。

## Node.js 的 Event Loop 的六个阶段

![截屏2020-07-18 15.17.15.png](/img/bVbJRBj)
[Node.js 官方文档](https://nodejs.org/zh-cn/docs/guides/event-loop-timers-and-nexttick/#what-is-the-event-loop)

1. timers（定时器） 执行定时器的回调
2. pending callbacks（待定回调） 系统操作的回调
3. idle,prepare 内部使用
4. poll（轮询） 等待新 I/O 事件
5. check（检测） 执行 setImmeidate 回调
6. close callbacks（关闭的回调函数） 内部使用
   主要需要关注 1、4、5 阶段
   每一个阶段都有一个 callbacks 的先进先出的队列需要执行。当 event loop 运行到一个指定阶段时，该阶段的 FIFO 队列将会被执行，当队列的 callback 执行完或者执行的 callbacks 数量超过该阶段的上限时，event loop 会转入下一阶段。

## poll 阶段

主要功能：

1. 计算应该被 block 多久（需要等待 I/O 操作）
2. 处理 poll 队列的事件
   ![截屏2020-07-18 15.24.02.png](/img/bVbJRBO)

代码分析 1：

```
const fs = require('fs');

function someAsyncOperation(callback) {
  fs.readFile(__dirname, callback); // 异步读文件
}

const timeoutScheduled = Date.now(); // 当前时间

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;
  console.log(`${delay}ms have passed since I was scheduled`); // 多少ms后执行
}, 100);

someAsyncOperation(() => {
  const startCallback = Date.now();
  // 延时200ms
  while (Date.now() - startCallback < 200) {
    // do nothing
  }
});

/*
输出：204ms have passed since I was scheduled
someAsyncOperation读文件后（4ms），进入poll阶段
执行回调，睡眠200ms，
poll空，检查是否有到时间的定时器，执行setTimeout
*/
```

代码分析 2：

```
const fs = require('fs');
fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log("setTimeout");
      }, 0);
      setImmediate(() => {
          console.log("setImmediate");
      });
});
/*
输出：setImmediate setTimeout
读文件后，执行回调
有setImmediate的回调进入check阶段
没有才会等待回调加入poll队列
所以先输出setImmediate
*/
```

## process.nextTick()

是一个异步的 node API，但不属于 event loop 的阶段
调用 nextTick 时，会将 event loop 停下来，执行完 nextTick 的 callback 后再继续执行 event loop

```
const fs = require("fs");
fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log("setTimeout");
  }, 0);
  setImmediate(() => {
    console.log("setImmediate");
    process.nextTick(() => {
        console.log("nextTick2");
      });
  });
  process.nextTick(() => {
    console.log("nextTick1");
  });
});
/*
nextTick1
setImmediate
nextTick2
setTimeout
*/
```
