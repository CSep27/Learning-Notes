const MyPromise = require("./my-promise");

/* 测试1 */
// const p = new MyPromise((resolve, reject) => {
//   console.log("myPromise");
//   setTimeout(() => {
//     // resolve(1);
//     /* resolve(
//       new MyPromise((resolve, reject) => {
//         resolve(1); // 打印1
//       })
//     ); */
//     // resolve(p); // 没有打印 没有报错
//     // resolve({}); // 打印{}

//     // 包含then方法的对象，那么p.then会被替换成对象里的then
//     // 为了兼容Promise出现之前其他库实现thenable
//     resolve({
//       then() {
//         console.log(arguments);
//         // 打印 then，
//         // 由于这个then方法替换了promise.then，无法进行链式调用，后面的then不会再执行
//         console.log("then");
//       },
//     });
//   });
// })
//   // .then("不是函数不影响后续执行，会返回p")
//   .then((data) => {
//     console.log(data);
//     return 2;
//   })
//   .then((data) => {
//     console.log(data);
//   });

/* 测试2 */
// const promise = MyPromise.resolve(1)
//   .then(2)
//   .then(new MyPromise((resolve) => resolve("foo")))
//   .then(console.log);

/* 等价于下面的写法 */
// const promise1 = new MyPromise((resolve) => resolve(1));
// // 2不是函数，会把promise1返回
// const promise2 = promise1.then(2);
// // 这里是相当于传入了一个promise对象
// // 对于then的参数如果不是函数，会把原来的promise返回，也就是promise1
// const promise3 = promise2.then(new MyPromise((resolve) => resolve("foo")));
// const promise4 = promise3.then(console.log);

// 假设异步操作获取的结果为 1，并且调用 resolve 函数，将 p1 的状态变成 fulfilled
const p1 = new MyPromise((resolve, reject) => {
  console.log("1 MyPromise");
  setTimeout(() => {
    console.log("2");
    resolve(
      new MyPromise((resolve) => {
        setTimeout(() => {
          resolve(222);
        });
      })
    );
    console.log("3");
  });
});
p1.name = "p1";
// 传入一个参数，处理状态变成fulfilled的情况
const p2 = p1.then(function onFulfilled(data) {
  console.log("p1 then", data);
  console.log(typeof data);
  console.log(Object.prototype.toString.call(data));

  return 222;
});
p2.name = "p2";
// p1 变成了 fulfilled，p1.then执行完返回了p2
// onFulfilled return 了 222
// 按照规范会进入 `[[Resolve]](p2, 222)`
// 根据[2.3.4] 那么 p2 的状态 会变成 fulfilled
// 执行onFulfilled函数 return 333 再进入 `[[Resolve]](p3, 333)`
const p3 = p2.then(function onFulfilled(data) {
  console.log(data);
  return 333;
});
p3.name = "p3";

// 在这个场景中 执行then时 状态都是pending 没有进入其他状态处理时的情况
