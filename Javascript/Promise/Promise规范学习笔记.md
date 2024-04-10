# ES6 Promise

## API

[ECMAScript 6 入门 - Promise 对象](https://es6.ruanyifeng.com/#docs/promise)

注意点：

1. then 和 catch 返回的 promise 是新的 promise，不是原来的
2. Promise 对象的错误会“冒泡”，直到被捕获为止，所以一般可以在最后写 catch 捕获错误。

错误捕获示例：

```js
new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    reject(new Error("err1"));
    console.log(2);
  });
})
  .then(
    (data) => {
      console.log(data);
      throw Error("err2");
    },
    (err) => {
      // 这里写了错误处理就会被捕获
      // 错误被捕获了，3就会正常打印
      console.error(err);
    }
  )
  .then((data) => {
    console.log(3);
  })
  .catch((err) => {
    // 如果前面没有错误处理，就会被这里捕获
    // 不会打印3
    console.error(err);
  });
```

最佳实践：

- 总是使用 catch()方法，而不使用 then()方法的第二个参数，这样可以处理 Promise 内部发生的错误。
- catch 可以写在最后
- 传递函数给 then 方法
- then 方法中使用 return
- promise 不要嵌套

题目：3 秒之后亮红灯一次，再过 2 秒亮绿灯一次，再过 1 秒亮黄灯一次，用 promise 实现多次交替亮灯的效果（可以用 console.log 模拟亮灯）。

```js
function light(color, second) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(color);
      resolve();
    }, second * 1000);
  });
}

function orderLights(list) {
  let promise = Promise.resolve();
  list.forEach((item) => {
    promise = promise.then(function () {
      return light(item.color, item.second);
    });
  });
}
orderLights([
  {
    color: "red",
    second: 3,
  },
  {
    color: "green",
    second: 2,
  },
  {
    color: "yellow",
    second: 1,
  },
]);
```

## Promise 过程

![image](./images/promise/promise-1.webp)

- 创建 Promise 时是 pending 状态
- 异步求值成功后，pending 状态变为 fulfilled 状态，通过 resolve(成功的结果)传递到.then(onFullfillment)中，onFullfillment 就能拿到成功的结果。一次异步求值结束。这个结果可以驱动下一次异步求值的过程，所以默认会返回一个新的 pending 状态的 Promise，所以可以接着.then。
- 异步求值失败后，pending 状态变为 rejected 状态，reject(失败的结果)在.then(...,onRejection)或者.catch 里接收到，默认也会返回一个新的 Pending 状态的 Promise，所以可以接着.then。
- .then 里面直接返回值则看做是返回的 Promise 直接变成 fulfilled 状态，相当于 resolve(返回值)

代码分析：

```js
const promise = MyPromise.resolve(1)
  .then(2)
  .then(Promise.resolve("3")))
  .then(console.log);

/* 等价于下面的写法 */
const promise1 = new MyPromise((resolve) => resolve(1));
// 2不是函数，会把promise1返回
const promise2 = promise1.then(2);
// 这里是相当于传入了一个promise对象
// 对于then的参数如果不是函数，会把原来的promise返回，也就是promise1
const promise3 = promise2.then(new MyPromise((resolve) => resolve("3")));
const promise4 = promise3.then(console.log);

/*
Promise.resolve 是一个函数
Promise.resolve() 是Promise.resolve这个函数执行了 执行完的结果是Promise对象

Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))

typeof Promise.resolve(1) // 'object'
typeof new Promise((resolve) => resolve("foo")) // 'object'
Object.prototype.toString.call(Promise.resolve(1)) // '[object Promise]'
*/
```

# 手写 Promise

1. 学习 Promise/A+ 规范（定义了最基础的功能）
2. 熟悉 Promise 基础用法
3. 按照规范结合 ES6 Promise 用法实现代码（使用 setTimeout 模拟异步实现）
4. 使用 [promise-aplus/promises-tests](https://github.com/promises-aplus/promises-tests) 插件验证
5. 按需实现 Promise/A+ 规范中没有定义的，ES6 Promise 中有的功能

ES6 的 Promise 是一个类

- 实现 MyPpromise 代码：`my-promise.js`
- 测试 MyPpromise 代码：`my-promise-test.js`
- 测试原生 Promise 代码：`my-promise-test.js`
- 使用[promises-tests](https://github.com/promises-aplus/promises-tests)执行测试用例：
  - `npm install promises-aplus-tests -g`
  - `promises-aplus-tests my-promise.js`

## Promise/A+ 规范

见翻译

## Promise 基础用法

> 根据分析自行完成 MyPromise

Promise 的基本特性

1. Promise 是个类，实例化 Promise 生成的对象记为 p1
2. p1 有三种状态：pending，fulfilled，rejected，初始状态为 pending
3. 实例化过程中会直接执行传入的函数参数 fn
4. fn 中有异步操作（在手写源码中使用 setTimeout 模拟）
5. fn 有两个函数参数 resolve 和 reject
6. 当异步操作结束后，根据结果由用户自定义逻辑根据情况决定调用哪个函数参数，并且用户可以给 resolve 和 reject 函数传值
7. resolve 函数的参数记为 value，reject 函数的参数记为 reason
8. 如果调用 resolve 函数，需要处理 value，根据 value 的不同进行下一步处理，将 p1 的状态变成 fulfilled；如果调用 reject 函数，需要处理 reason，将 p1 的状态变成 rejected

```js
// 假设异步操作获取的结果为 1，并且调用 resolve 函数，将 p1 的状态变成 fulfilled
const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  });
});
```

异步获取到的结果我们需要处理，p 有个实例方法 then，用来处理异步结果：

1. then 函数支持两个函数参数
2. 第一个函数在 p1 的状态变成 fulfilled 时调用，记为 onFulfilled
3. 第二个函数在 p1 的状态变成 rejected 时调用，记为 onRejected

```js
// 假设异步操作获取的结果为 1，并且调用 resolve 函数，将 p1 的状态变成 fulfilled
const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  });
});
// 传入一个参数，处理状态变成fulfilled的情况
const p2 = p1.then(function onFulfilled(data) {
  console.log(data);
  return 2;
});
```

1. 上述代码中，`p1.then`函数的执行时机是在 fn 执行之后就执行，此时 p1 的状态是 pending
2. `p1.then`函数执行后，会返回一个新的 Promise 实例 p2
3. fn 中的异步操作结束了（setTimeout 执行了），执行`resolve(1)`
4. p1 的状态确认为 fulfilled 了，onFulfilled 函数执行，data 就是 1，即 resolve 的参数 value

基于此，可以先实现一个暂只处理 fulfilled 状态的 Promise

先看下 Promise 中的执行顺序

```js
const p1 = new Promise((resolve, reject) => {
  console.log("1 Promise");
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
// "1 Promise" "2" "3" 111
```

注意 "2" "3" 都先与 111 打印，所以 MyPromise 需要实现相同的效果， resolve 里面也要用异步

`my-promise3-1.js` 实现初步效果

总结一下从模拟实现的角度如何知道状态变化的逻辑

1. new Promise 实例化生成 p1 对象，p1.status 是 pending
2. 马上执行`p1.then`，pending 状态下会将 then 的回调 onFulfilled 挂载到 p1 对象上
3. resolve(data) 函数执行了，异步操作结束了，状态确认了为 fulfilled
4. 在内部处理中的逻辑就是 resolve 函数执行完，执行 onFulfilled 函数，并拿到 data

所以前面 return 了一个新的 Promise 实例 p2，要在它的状态变化后做出响应，那么就执行一下 p2.then，这样当 p2 的状态确定下来了，对应的回调函数就会执行了。

这个过程其实之前从使用的角度也是明白的，比较浅层，现在从原理的角度看明白的更透彻了。

`my-promise3-2.js` 功能全部完成，测试用例通过

遗留问题：

then 函数里判断 promise1.status 状态为 FULFILLED 和 REJECTED 的分支逻辑不知道什么情况下执行
