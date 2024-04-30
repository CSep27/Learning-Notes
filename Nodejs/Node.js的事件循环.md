# 资料

1. [Node 定时器详解](https://www.ruanyifeng.com/blog/2018/02/node-event-loop.html) —— 大概说了下，不够详细
2. [「Nodejs 万字进阶」一文吃透异步 I/O 和事件循环](https://juejin.cn/post/7002106372200333319) —— 非常详细，包括异步操作实际的处理过程，和事件循环 c 语言底层实现

注：学习后的笔记总结，并且举一些更详细的例子帮助理解

# Node.js 中的同步和异步 I/O 模式

具体见资料 2

## 同步模式

例如：发出读文件请求，必须等文件读取完成之后，才能执行后续的代码。

同步模式会阻塞后续代码执行，file 文件没有读取完成，就不会打印 1。

```js
const fs = require("fs");
const data = fs.readFileSync("./file.js");
console.log(1);
```

## 异步模式

例如：发出读文件请求后，就可以直接执行后续的代码，不会阻塞。真正处理读文件的操作由其他线程来处理，等读到文件了再通知主线程去处理读到的内容，也就是执行回调函数。

读文件操作开始后，其他线程处理读操作，打印 1。等文件读取完成，再执行回调函数。

```js
const fs = require("fs");
fs.readFile("./file.js", (err, data) => {
  console.log(err, data); // null  <Buffer 63 6f 6e 73 6f 6c 65 2e 6c 6f 67 28 27 68 65 6c 6c 6f 2c 77 6f 72 6c 64 27 29>
});
console.log(1); // 1
```

那么在什么时机去处理回调函数，Node.js 就需要定义一套规则，来保证代码的有序执行。

注：异步操作交给线程池处理，多个读文件的操作，就会有多个 I/O 线程来处理每个操作。线程池大小默认为 4。

## 观察者

读文件完成了，需要执行回调了，那么就有一个观察者的角色来接收回调。

事件循环到处理读文件回调的阶段，就会去拿回调出来执行。

## 请求对象和线程池

请求对象：调用`fs.readFile`，本质上调用 libuv 上的方法创建一个请求对象。

## libuv 中间层作用

如何感知异步 I/O 任务执行完毕的？以及如何获取完成的任务的呢？

不同平台下的实际处理不同，libuv 中间层，向下在不同平台上采取不同的做法，向上就提供统一的接口实现，抹平平台差异。

# 事件循环

事件循环机制由宿主环境实现，浏览器环境和 Nodejs 环境下的事件循环有所不同。

事件循环本质上是一个 while 循环，只要 queue 里还有事件，那么就会在循环过程中取出事件执行，直到没有事件需要处理了。

```js
// queue 里面放着待处理事件
const queue = [];
while (true) {
  // 开始循环
  // 执行 queue 中的任务
  // ....

  if (queue.length === 0) {
    return; // 退出进程
  }
}
```

## 事件循环阶段介绍

分为以下六个阶段，依次执行：

- timers
- I/O callbacks
- idle, prepare
- poll
- check
- close callbacks

1. timers
   执行 setTimeout 或 setInterval 注册的回调函数。
2. I/O callbacks
   调用之前事件循环延迟执行的 I/O 回调函数。
3. idle, prepare
   只供 libuv 内部调用，这里可以忽略。
4. poll
   执行异步 I/O 的回调函数；计算当前轮询阶段阻塞后续阶段的时间。会尽量停留在此阶段。
5. check
   执行 setImmediate 回调函数。
6. close
   执行注册 close 事件的回调函数。

## process.nextTick

和 Promise 的回调函数一样，属于微任务。

当前阶段的同步任务执行完，就会执行这类微任务。

如果当前队列里同时有多种类型微任务，process.nextTick 总是会优先执行。

1. 同步任务
2. process.nextTick()
3. 微任务

## timers 阶段定时器的时间

定时器的时间参数实际范围是最小是 1ms，也就是设置 0 或者不设置实际对应 1ms。

取值范围为：1 毫秒到 2147483647 毫秒之间。

并且这个是最小间隔时间，实际可能会由于其他因素超过这个时间之后再执行。也就是设置了 10ms，实际可能过了 20ms 才执行。

```js
setTimeout(() => {
  console.log("setTimeout 1");
}, 0);
```

## setImmediate 与 setTimeout 执行时机问题

### 执行顺序不确定的情况

```js
setTimeout(() => console.log(1));
setImmediate(() => console.log(2));
```

`setTimeout(() => console.log(1));`实际等价于 `setTimeout(() => console.log(1), 1);`，即 1ms 之后执行 setTimeout。

取决于实际执行脚本消耗的时间，以下两种情况都有可能：

---

第一种情况：

1. timer 如果到了 1ms，打印 1
2. check 执行 setImmediate，打印 2

最终结果为 1，2

---

第二种情况：

- 第一轮循环

  1. timer 没到 1ms
  2. check 执行 setImmediate，打印 2

- 第二轮循环

  1. timer 打印 1

最终结果为 2， 1

---

### 执行顺序确定的情况

由于读文件的回调是在 poll 阶段执行，那么紧跟着就是 check 阶段执行 setImmediate，而 setTimeout 就要到下次循环的 timer 阶段再执行。

```js
// 'immediate'
// 'timeout'
const fs = require("fs");

fs.readFile("./1,js", () => {
  setTimeout(() => {
    console.log("timeout");
  }, 0);
  setImmediate(() => {
    console.log("immediate");
  });
});
```

## 事件循环执行过程

为了说明清楚，先进行一些定义：

- 脚本开始执行，进行一些初始化操作，执行同步任务，发出异步请求等，简为<**主线阶段**>
- 事件循环过程有前述的 6 个<**阶段**>，比如 timers 阶段
- 从 1 至 6 个阶段执行完成称作一个<**循环**>，也就是伪代码中 while 里的内容执行了一次

总体大概流程说明：

- 首先是主线脚本执行阶段，所有的同步任务依次执行。
- 其他任务按照属于哪个阶段，按照顺序放入全局相应的队列中。比如 setTimeout 放到 timers 阶段，setImmidate 放到 check，I/O 回调在 poll 阶段。
- 如果有微任务，也放入相应的微任务队列中（process.nextTick 队列中的都先于 Promise 队列中的任务执行）。
- 微任务是在当前阶段中其他同步任务执行完成后执行，把当前微任务队列清空后进入下一阶段。
- 主线执行完毕后，进入事件循环的 6 个阶段，会依次执行。
- 对于每个阶段里的每个方法，如果方法内部有微任务，放入当前的微任务队列，在当前方法结束前执行。如果有其他的属于 6 个阶段的任务，那么放入全局的相应队列中。

### 微任务执行时机

这里拿 setTimeout 举例说明执行顺序，换成其他阶段的方法也是一样的。

#### 示例一

只有主线任务和一个 timers 阶段的任务。

```js
setTimeout(() => {
  console.log("setTimeout 1");
}, 0);
console.log("1");
```

从上之下先执行主线任务：

1. 将 "setTimeout 1" 的回调放到对应回调队列中
2. 执行同步任务`console.log("1")`
3. 主线任务结束了，进入事件循环
4. 第一个就是 timer 阶段，时间到了，执行回调。

#### 示例二

在主线阶段任务中增加微任务

```js
Promise.resolve().then("Promise 1");
process.nextTick(console.log, "nextTick 1");
setTimeout(() => {
  console.log("setTimeout 1");
}, 0);
console.log("1");
```

从上之下先执行主线任务：

1. 将"Promise 1"放入 Promise 微任务队列
2. 将"nextTick 1"放入 nextTick 微任务队列
3. 将"setTimeout 1"的回调放到对应回调队列中
4. 执行同步任务`console.log("1")`
5. 检查当前阶段的微任务队列，先执行"nextTick 1"，再执行"Promise 1"
6. 主线任务结束了，进入事件循环
7. 第一个就是 timer 阶段，时间到了，执行回调。

#### 示例三

再在 timer 阶段任务中增加微任务，并且增加一个 setTimeout

```js
Promise.resolve().then("Promise 1");
process.nextTick(console.log, "nextTick 1");
setTimeout(() => {
  Promise.resolve().then("Promise 2");
  process.nextTick(console.log, "nextTick 2");
  console.log("setTimeout 1");
}, 0);
setTimeout(() => {
  Promise.resolve().then("Promise 3");
  process.nextTick(console.log, "nextTick 3");
  console.log("setTimeout 2");
}, 0);
console.log("1");
```

从上之下先执行主线任务：

1. 将"Promise 1"放入 Promise 微任务队列
2. 将"nextTick 1"放入 nextTick 微任务队列
3. 将"setTimeout 1"和"setTimeout 2"的回调放到对应回调队列中
4. 执行同步任务`console.log("1")`
5. 检查当前阶段的微任务队列，先执行"nextTick 1"，再执行"Promise 1"
6. 主线任务结束了，进入事件循环
7. 第一个就是 timer 阶段，时间到了，执行"setTimeout 1"。
8. 执行"setTimeout 1"中的微任务，"Promise 2"和"nextTick 2"
9. 执行"setTimeout 2"。
10. 执行"setTimeout 2"中的微任务，"Promise 3"和"nextTick 3"

#### 总结

可以理解为微任务是在**当前阶段的方法**内部的最后执行。

主线阶段可以当做是执行了一个方法，像示例二。
主线阶段的这个方法中同步任务执行完了，就执行微任务。

然后到事件循环，像示例三
第一个 **timers 阶段**：

- **"setTimeout 1"方法**内部，同步任务执行完了，就执行微任务。
- **"setTimeout 2"方法**内部，同步任务执行完了，就执行微任务。

如果后面其他阶段还有任务，是一样的，具体可以看后面复杂示例的分析。

### I/O callbacks 和 poll 阶段详解

通过示例说明，举例中的时间耗时是为了方便理解。

#### 示例一

假设读文件需要花费 20ms 才能拿到结果，定时器时间为 100ms

```js
const fs = require("fs");

setTimeout(() => {
  console.log("setTimeout");
}, 100);

fs.readFile("1.js", () => {
  console.log("fs");
});

console.log("1");
```

首先执行同步任务打印 1
定时器回调放进队列
异步读文件操作开始，实际处理交由 I/O 线程，等拿到结果再去主线程处理回调

——— 假设到这里过了 1ms

进入第一次事件循环

- timers 定时器没到期
- I/O callbacks 还没有需要执行的回调
- idle, prepare 这里不需要用户考虑
- poll
  在这个阶段，就会计算一个时间
  没有要执行 check 和 close 阶段的任务
  有一个 100ms 的定时器任务，假设到这里过 2ms 了，那么算下来还有 98ms 才需要执行定时器
  那么就会先停留在这个阶段，等待是否有 I/O 操作返回结果需要处理回调
  到第 20ms，文件读取返回了，那么就会执行文件回调
  这里文件回调里没有耗时操作，假设 21ms 文件回调结束，继续待在这个阶段。
  直到到 100ms 了，定时器到期，那么就会往下走，去到下一个循环
- check 无
- close callbacks 无

进入第二次循环

- timers 执行 100ms 的 setTimeout 回调
- I/O callbacks
- idle, prepare
- poll
- check
- close callbacks

所有任务处理完毕结束循环

#### 示例二

只是修改示例一的 setTimeout 过期时间为 2ms，小于文件读取时间 20ms

```js
const fs = require("fs");

setTimeout(() => {
  console.log("setTimeout");
}, 2);

fs.readFile("1.js", () => {
  console.log("fs");
});

console.log("1");
```

首先执行同步任务打印 1
定时器回调放进队列
异步读文件操作开始，实际处理交由 I/O 线程，等拿到结果再去主线程处理回调

——— 假设到这里过了 1ms

进入事件循环

- timers 定时器没到期
- I/O callbacks 还没有需要执行的回调
- idle, prepare 这里不需要用户考虑
- poll
  假设执行到这 2ms 了，计算时间定时器到期了，那么就会直接往下走，去到下一个循环
- check
- close callbacks

进入第二次循环

- timers 执行 2ms 的已到期的 setTimeout 回调
- I/O callbacks
- idle, prepare
- poll
  到了这个阶段，假设已经过了 10ms
  此时没有其他任务了，就会待在这里，等着处理 I/O 回调
  时间到 20ms，处理读取文件回调
- check
- close callbacks

所有任务处理完毕结束循环

#### 实例三

只是修改示例一的 setTimeout 过期时间为 20ms，等于文件读取时间。

为了说明 pending callback 的执行时机。

```js
const fs = require("fs");

setTimeout(() => {
  console.log("setTimeout");
}, 20);

fs.readFile("1.js", () => {
  console.log("fs");
});

console.log("1");
```

首先执行同步任务打印 1
定时器回调放进队列
异步读文件操作开始，实际处理交由 I/O 线程，等拿到结果再去主线程处理回调

——— 假设到这里过了 1ms

进入事件循环

- timers 定时器没到期
- I/O callbacks 还没有需要执行的回调
- idle, prepare 这里不需要用户考虑
- poll
  在这里等到 20ms
  计算时间定时器到期了，那么就会直接往下走，去到下一个循环
  此时文件返回了结果，而 poll 阶段已经结束
  那么文件读取回调放到下一阶段去执行，就是属于 pending callback，即未完成的回调
- check
- close callbacks

进入第二次循环

- timers 执行 20ms 的已到期的 setTimeout 回调
- I/O callbacks 处理需要处理的，但是还未处理的回调，也就是读取文件回调
- idle, prepare
- poll
  到了这个阶段，
  没有任何需要处理的任务了，继续往下
- check
- close callbacks

所有任务处理完毕结束循环

#### 总结

到 poll 阶段时，会尽量停留在 poll 阶段，等待处理异步 I/O 的回调函数。
同时也会计算等待了多长时间，去和最近的一个要到期的定时器时间比较，如果到定时器执行时间了，就会往下个阶段走。2024 年 4 月 30 日
或者 check、close 阶段有要执行的任务，也会往下走。
如果在等待阶段有异步 I/O 的回调函数需要处理，就会处理。
所以这个阶段叫做轮询阶段。

而如果和示例三类似的情况，有异步 I/O 的回调函数需要处理，但是当前循环的 poll 阶段已经结束了。
那么这个回调就会放到下次循环的 pending callbacks 时期处理，所以叫做待处理的回调函数阶段。

### 总体流程总结

从大的方面，是主线阶段执行，和六个阶段的循环执行。
其中每个阶段每个方法又涉及到微任务的执行时机。
以及考虑到实际执行消耗的时间，setTimeout 时间取值范围导致的不确定顺序问题。
基本就可以解决复杂问题的执行顺序。

结合前面的知识点，code/eventloop 文件夹中示例 12（三个子示例），分析了复杂情况下的打印情况。

#### 示例一

```js
process.nextTick(function () {
  console.log("1");
});
process.nextTick(function () {
  console.log("2");
  setImmediate(function () {
    console.log("3");
  });
  process.nextTick(function () {
    console.log("4");
  });
});

setImmediate(function () {
  console.log("5");
  process.nextTick(function () {
    console.log("6");
  });
  setImmediate(function () {
    console.log("7");
  });
});

setTimeout((e) => {
  console.log(8);
  new Promise((resolve, reject) => {
    console.log(8 + "promise");
    resolve();
  }).then((e) => {
    console.log(8 + "promise+then");
  });
}, 0);

setTimeout((e) => {
  console.log(9);
}, 0);

setImmediate(function () {
  console.log("10");
  process.nextTick(function () {
    console.log("11");
  });
  process.nextTick(function () {
    console.log("12");
  });
  setImmediate(function () {
    console.log("13");
  });
});

console.log("14");
new Promise((resolve, reject) => {
  console.log(15);
  resolve();
}).then((e) => {
  console.log(16);
});
```

开始执行脚本，从上往下分析：

微任务 process.nextTick 队列 放入
console.log("1");
console.log("2");

check 阶段放入
console.log("5");
console.log("10");

timers 阶段放入
console.log(8);
console.log(9);

同步任务执行
打印 14

执行 Promise 同步任务
打印 15
将 then 放入本轮 Promise 微任务队列 console.log(16);

到底了，检查 nextTick 队列开始执行
打印 1
打印 2
添加 console.log("3");到 check
添加 console.log("4");到本轮的 nextTick
由于新增了内容，检查 nextTick 不为空
打印 4
nextTick 队列空了，检查 Promise 微任务队列
打印 16

微任务队列都清空了，本轮脚本执行结束了

进入事件循环的 timer 阶段，定时器为 0，即 1ms，到时间了
打印 8
打印 8promise
Promise 微任务队列加入 console.log(8 + "promise+then");
检查微任务队列后打印
打印 8promise+then

timer 队列还有
打印 9

check 阶段
打印 5
执行本轮 nextTick，打印 6
console.log("7");放到 check 排队

打印 10
打印 11
打印 12

console.log("13");放到 check 排队

打印 3
打印 7
打印 13
