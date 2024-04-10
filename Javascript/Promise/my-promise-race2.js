// 使用MyPromise实现myRace方法
// 可以打断点看过程
const MyPromise = require("./my-promise3-2");

// 直接new Promise 函数里的内容就会执行
// 调用 Promise.myRace 只是返回了一个新的 Promise
// Promise.myRace([p1, p2]);
const p1 = new MyPromise((resolve, reject) => {
  // console.log("p1 new"); // 1. new 之后这里就会执行
  setTimeout(() => {
    // console.log("p1 setTimeout 300"); // 6.
    resolve("p1");
    // reject("p1 err");
  }, 300);
});
p1.name = "p1";
// console.log("after p1"); // 2. 同步
const p2 = new MyPromise((resolve, reject) => {
  // console.log("p2 new"); // 3.
  setTimeout(() => {
    // console.log("p2 setTimeout 200"); // 5.
    resolve("p2");
    // reject("p2 err");
  }, 200);
});
p2.name = "p2";
// console.log("after p2"); // 4.

MyPromise.myRace = function (promises) {
  const mp = new MyPromise((resolve, reject) => {
    for (let index = 0; index < promises.length; index++) {
      const p = promises[index];
      // 只要p.then是函数
      if (typeof p.then === "function") {
        p.then(resolve, reject);
      } else {
        resolve(p);
      }
    }
  });
  mp.name = "mp";
  return mp;
};

// 结果都是打印先完成的p2
const newPromise2 = MyPromise.myRace([p1, p2]);
newPromise2.then((data) => {
  // 先resolve完成的，会进入这里
  console.log("newPromise data:", data);
});
// MyPromise没有实现catch方法

// 打断点可以看到，p1, p2的异步都会执行，但是由于p1和p2的then函数的第一个函数参数onFulfilled用的都是mp的resolve
// p2先完成，已经将mp的状态变成了fulfilled
// p1的流程走到fulfillPromise函数时，判断状态不是pending，直接return了
/* 
if (promise.status !== statusMap.PENDING) {
  return;
}
*/
