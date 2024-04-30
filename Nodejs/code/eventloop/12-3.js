const fs = require("fs");

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
}, 10);

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

const startTime = Date.now();
fs.readFile("1.js", () => {
  console.log("读文件结束", Date.now() - startTime, "ms");
  setImmediate(() => console.log("读文件后的 check", 17));
  setTimeout(() => console.log("读文件后的 timer", 18));
});

console.log("14");
new Promise((resolve, reject) => {
  console.log(15);
  resolve();
}).then((e) => {
  console.log(16);
});

/* 
正确答案
14
15
1
2
4
16
8
8promise
8promise+then
9
5
6
10
11
12
3
7
13
读文件结束 24ms
读文件后的 check 17
读文件后的 timer 18
*/

/* 
这里读文件花的时间不固定，由于setTimeout定时器事件设置为0，
到poll阶段时会去询问文件有没有读完，没有继续执行下面的阶段，
由于这里执行其他代码的时间小于读文件的时间，那么读文件回调在最后才执行。

假设前面事件循环每一轮用时1ms，读文件用时20ms
主线 1ms
剩下的只用了一次循环阶段，
中间到poll就去看下有没有读完文件，还没有 
假设耗时1ms

然后就继续循环，到poll阶段就去接着去问，
此时由于其他阶段没有任务，就会一直待在poll阶段询问？

这里把setTimeout时间改成10ms，在setImmidate之间打印了

14
15
1
2
4
16
8
8promise
8promise+then
5
6
10
11
12
3
9 => 在这里打印了
7
13
读文件结束 12 ms
读文件后的 check 17
读文件后的 timer 18
*/
