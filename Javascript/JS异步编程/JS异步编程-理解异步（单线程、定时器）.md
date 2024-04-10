# 同步与异步

## 同步

调用之后得到结果，再执行其他任务

```
const test = () => {
  let t = +new Date();
  while (true) {
    if (+new Date() - t >= 2000) {
      break;
    }
  }
};
console.log(1);
test();
console.log(2);
console.log(3);
// 输出：1
// 执行test()占用2s，2s后输出 2 3
```

## 异步

调用之后不管结果，继续执行其他任务

```
console.log(1);
setTimeout(() => {
  console.log(2);
}, 2000);
console.log(3);
// 输出：1 3
// 定时器2秒后输出 2
```

## 进程与线程

资料：[进程与线程的简单解释](http://www.ruanyifeng.com/blog/2013/04/processes_and_threads.html)

### 进程

    程序运行的实例
    同一程序可以产生多个进程
    一个进程包含一个或多个线程

### 线程

    操作系统能够进行运算调度的最小单位
    一次只能执行一个任务
    有自己的调用栈、寄存器环境
    同一进程的线程共享进程资源

查看进程的常用 linux 命令：
查看进程的状态：`ps (process status)`
查看动态的进程变化：`top (table of processes)`

# JS 单线程

## 浏览器的进程

启动浏览器后，会产生多个进程
![截屏2020-07-18 09.31.58.png](/img/bVbJQNr)

资料：
[现代浏览器的多进程架构](https://juejin.im/post/5bd7c761518825292d6b0217)
[浏览器的进程和线程](https://imweb.io/topic/58e3bfa845e5c13468f567d5)

## 渲染进程

渲染进程包括：

- GUI 线程 渲染布局，解析 HTML、CSS，构建 DOM 树
- JS 引擎线程
  - 解析执行 JS（Chrome V8 就是 JS 引擎，跑在 JS 引擎线程，JS 引擎线程只有一个。由于解释 JS 的引擎是单线程的，所以称 JS 为单线程）
  - 与 GUI 线程互斥（由于 JS 可以操作 DOM，如果和 GUI 线程同时操作 DOM，就会出问题）
- 定时器触发线程
  - setTimeout
  - setInterval
- 事件触发线程
  - 将满足条件的事件放入任务队列
- 异步 HTTP 请求线程
  - XHR 所在线程 (处理 ajax 请求，请求完成后，如果有回调就通知事件触发线程往任务队列添加事件）

JS 通过**浏览器内核的多线程**实现异步

### 异步场景：

1. 定时器
2. 网络请求
3. 事件绑定
4. Promise

# 定时器

## 定时器任务流程

1. 调用 WebAPI，如 setTimeout
2. 定时器线程计数
3. 事件触发线程将定时器事件放入任务队列
4. 主线程通过 Event Loop 遍历任务队列
   ![截屏2020-07-18 10.14.45.png](/img/bVbJQWV)

代码分析：

```
console.log(1);
setTimeout(() => {
  console.log(2);
}, 2000);
console.log(3);
```

    执行过程：
    console.log(1) 同步任务入栈执行，执行完出栈，打印1
    调用setTimeout，定时2s
    console.log(3) 同第一步，打印3
    执行栈空，检查任务队列，不到2s还没有任务
    2s到，事件触发线程将任务添加进任务队列
    循环检查就会发现有任务，将任务放入执行栈执行，打印2

![截屏2020-07-18 10.29.52.png](/img/bVbJQZ1)

## 定时器可能存在的问题

1. 定时任务可能不会按时执行
   ```
   // 由于同步任务执行了5s，所以5s后才打印2
   const test = () => {
     let t = +new Date();
     while (true) {
       if (+new Date() - t >= 5000) {
         break;
       }
     }
   };
   setTimeout(() => {
     console.log(2);
   }, 2000);
   test();
   ```
2. 定时器嵌套 5 次后最小间隔不能低于 4ms（不同浏览器实现不同)

## 定时器应用场景

- 防抖
- 节流
- 倒计时
- 动画（存在丢帧的情况）学习[requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)

## setTimeout 代码执行分析

```
for (var i = 1; i <= 10; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000 * i);
}
```

setTimeout 等同步的 for 循环执行后才执行，此时 i 已经变成 11，所以结果是每隔 1s 打印一个 11，打印 10 个 11

1. 可以利用闭包形成作用域，保留 i 的值，可以实现打印每隔 1s 打印 1-10
   ```
     for (var i = 1; i <= 10; i++) {
       (function (x) {
         setTimeout(() => {
           console.log(x)
         }, 1000 * x)
       })(i)
     }
   ```
2. 由于 var 没有块级作用域，所以换成 ES6 的 let 也可以实现
   ```
   for (let i = 1; i <= 10; i++) {
     setTimeout(function() {
       console.log(i);
     }, 1000 * i);
   }
   ```
