const MyPromise = require("./my-promise3-1");

// 假设异步操作获取的结果为 1，并且调用 resolve 函数，将 p1 的状态变成 fulfilled
const p1 = new MyPromise((resolve, reject) => {
  console.log("1 MyPromise");
  setTimeout(() => {
    console.log("2");
    resolve(111);
    console.log("3");
  });
});
// 传入一个参数，处理状态变成fulfilled的情况
const p2 = p1.then(function onFulfilled(data) {
  console.log(data);
  return 222;
});
