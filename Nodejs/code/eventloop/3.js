const fs = require("fs");

const timeoutScheduled = Date.now();

// 异步任务一：100ms 后执行的定时器
setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;
  console.log(`${delay}ms`); // 200？
}, 100);

// 异步任务二：文件读取后，有一个 200ms 的回调函数
fs.readFile("1.js", () => {
  const startCallback = Date.now();
  while (Date.now() - startCallback < 200) {
    // 什么也不做
  }
});

/* 
过程分析：
开始执行脚本
1. 没有同步任务
2. 有一个定时器，时间是100ms之后
3. 读文件的异步操作发送出去
4. 没有微任务

前面这些完成还没到100ms
开始第一次事件循环
1. timers 定时器时间还没到
2. I/O callbacks 就到了读文件的回调函数中，这里回调函数的循环会花费200ms
3. idle, prepare 内部的操作，一般可以忽略
4. poll 没有还未返回的I/O事件
5. check 没有 setImmediate()的回调函数
6. close 没有执行关闭请求的回调

进入第二次事件循环
1.  timers 时间以及超过200ms，定时器执行，打印的时间会大于200ms
剩下的继续几个阶段继续执行，实际上每个阶段已经没有代码执行了


*/
