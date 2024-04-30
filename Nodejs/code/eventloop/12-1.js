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

/* 
开始执行脚本，从上往下分析：

微任务 process.nextTick 队列 放入
console.log("1");
console.log("2");

check阶段放入
console.log("5");

console.log("10");

console.log("3");

timers阶段放入
console.log(8);
console.log(9);

同步任务执行
打印14

执行Promise，
打印15
将then放入本轮Promise微任务队列 console.log(16);

到底了，检查nextTick队列开始执行
打印1
打印2
  添加console.log("3");到check
  添加console.log("4");到nextTick
检查nextTick又新增了内容
打印4
nextTick队列空了，检查Promise微任务队列
打印16

本轮脚本执行结束了，微任务队列都清空了

进入事件循环的timer阶段，定时器为0，即1ms，到时间了
打印8
打印8promise
Promise微任务队列加入 console.log(8 + "promise+then");
检查微任务队列后打印
打印8promise+then

timer队列还有
打印9

check阶段
打印5
打印6

console.log("7");放到check排队

打印10
打印11
打印12

console.log("13");放到check排队

打印3
打印7
打印13
*/
