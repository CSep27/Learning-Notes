// 使用原生Promise实现myRace方法

// 直接new Promise 函数里的内容就会执行
// 调用 Promise.myRace 只是返回了一个新的 Promise
// Promise.myRace([p1, p2]);
const p1 = new Promise((resolve, reject) => {
  // console.log("p1 new"); // 1. new 之后这里就会执行
  setTimeout(() => {
    // console.log("p1 setTimeout 300"); // 6.
    resolve("p1");
    // reject("p1 err");
  }, 300);
});
p1.name = "p1";
// console.log("after p1"); // 2. 同步
const p2 = new Promise((resolve, reject) => {
  // console.log("p2 new"); // 3.
  setTimeout(() => {
    // console.log("p2 setTimeout 200"); // 5.
    resolve("p2");
    // reject("p2 err");
  }, 200);
});
p2.name = "p2";
// console.log("after p2"); // 4.
Promise.race([p1, p2])
  .then((data) => {
    // 先resolve完成的，会进入这里
    console.log(data); // p2
  })
  .catch((err) => {
    // 先reject的，会进入这里
    console.error(err);
  });

const newPromise = Promise.myRace([p1, p2]);
newPromise
  .then((data) => {
    // 先resolve完成的，会进入这里
    console.log("newPromise data:", data);
  })
  .catch((err) => {
    // 先reject的，会进入这里
    console.error(err);
  });
