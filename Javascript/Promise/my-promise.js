/* 
2021年按照视频学习，自己加上注释，有部分不明白的地方 
2024年发现主要是当时没有明白这个实现就是完全按照Promise/A+规范来的，
只要把规范看明白，然后按照es6的promise是个类开始编写代码，剩下的代码按照规范定义的去开发
*/
/* 状态枚举 */
const statusMap = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

/* 工具函数 */
function isFunction(fn) {
  return (
    Object.prototype.toString.call(fn).toLocaleLowerCase() ===
    "[object function]"
  );
}
function isObject(obj) {
  return (
    Object.prototype.toString.call(obj).toLocaleLowerCase() ===
    "[object object]"
  );
}
function isPromise(p) {
  // 当前的Promise
  return p instanceof MyPromise;
}

// 将promise设置为fulfilled状态
function fulfillPromise(promise, value) {
  // 只能由Pending状态装换成fulfilled状态
  if (promise.status !== statusMap.PENDING) {
    return;
  }
  promise.status = statusMap.FULFILLED;
  promise.value = value;
  // 执行当前promise的fulfilledCbs
  runCallbacks(promise.fulfilledCbs, value);
}
// 将promise设置为rejected状态
function rejectPromise(promise, reason) {
  if (promise.status !== statusMap.PENDING) {
    return;
  }
  promise.status = statusMap.REJECTED;
  promise.reason = reason;
  // 执行当前promise的fulfilledCbs
  runCallbacks(promise.rejectedCbs, reason);
}

function runCallbacks(callbacks, value) {
  callbacks.forEach((callback) => callback(value));
}

// 对应规范【2.3】中的`[[Resolve]](promise, x)`
function resolvePromise(promise, x) {
  // 【2.3.1】x与promise相同
  /* 
  const p = new Promise((resolve, reject) => {
    resolve(p)
  })
  */
  if (promise === x) {
    rejectPromise(
      promise,
      new TypeError(`${promise} and ${x} can't be the same`)
    );
    return;
  }
  // 【2.3.2】x是Promise
  /*
  const p = new Promise((resolve, reject) => {
    resolve(new Promise(() => {}))
  })
  */
  if (isPromise(x)) {
    if (x.status === statusMap.FULFILLED) {
      fulfillPromise(promise, x.value);
      return;
    }
    if (x.status === statusMap.REJECTED) {
      rejectPromise(promise, x.reason);
      return;
    }
    // 如果x是PENDING，调用x.then
    if (x.status === statusMap.PENDING) {
      x.then(
        () => {
          fulfillPromise(promise, x.value);
        },
        () => {
          rejectPromise(promise, x.reason);
        }
      );
      return;
    }
  }
  // 【2.3.3】如果x是函数或者对象
  /*
    const p1 = new Promise((resolve, reject) => {
      // x 是一个对象
      resolve({});
    }).then((x) => {
      // x 就是 resolve 函数的参数 {}
    });
    const p2 = new Promise((resolve, reject) => {
      resolve({
        then(y) {},
      });
    }).then((data) => {
      // data是执行对象then方法返回的值
    });
    */
  // 并且要兼容thenable的情况
  // thenable的方法只执行一次
  if (isObject(x) || isFunction(x)) {
    let then;
    // 【2.3.3.3.3】和 【2.3.3.3.4】
    // 用于保证第一个执行的方法优先，后面的执行都会被忽略
    let called = false;
    try {
      // 【2.3.3.1】
      // 假如x对象本身有then方法，那么把该方法赋值给变量then，用于兼容thenable对象（也就是定义了then方法的对象）
      then = x.then;
    } catch (error) {
      // 【2.3.3.2】
      rejectPromise(promise, error);
      return;
    }
    // 如果then是函数
    if (isFunction(then)) {
      try {
        // 【2.3.3.3】
        then.call(
          x,
          (y) => {
            if (called) return;
            called = true;
            // 【2.3.3.3.1】
            resolvePromise(promise, y);
          },
          (r) => {
            if (called) return;
            called = true;
            // 【2.3.3.3.2】
            rejectPromise(promise, r);
          }
        );
      } catch (e) {
        // 【2.3.3.3.4】
        if (called) return;
        called = true;
        rejectPromise(promise, e);
      }
    } else {
      // 【2.3.3.4】
      fulfillPromise(promise, x);
      return;
    }
  } else {
    // 【2.3.4】
    fulfillPromise(promise, x);
    return;
  }
}

class MyPromise {
  constructor(fn) {
    this.status = statusMap.PENDING;
    this.value = undefined;
    this.reason = undefined;
    // then函数的参数 放到数组中依次执行
    // 实际是在微任务阶段执行，里面都是用setTimeout模拟
    this.fulfilledCbs = [];
    this.rejectedCbs = [];

    // new Promise(() => {})
    // fn就是传入的函数，new时直接执行
    // fn的两个参数就是resolve函数和reject函数
    fn(
      (value) => {
        // resolve执行就是把value的值传给了then方法
        resolvePromise(this, value);
      },
      (reason) => {
        rejectPromise(this, reason);
      }
    );
  }
  // Promise实例有then方法
  // then方法两个参数
  // 返回一个新的Promise 实现链式调用
  then(onFulfilled, onRejected) {
    const promise1 = this; // 当前Promise
    const promise2 = new MyPromise(() => {}); // 返回的promise
    // 如果Promise状态是FULFILLED
    if (promise1.status === statusMap.FULFILLED) {
      // 第一个参数不是函数的话，把当前Promise返回
      if (!isFunction(onFulfilled)) {
        return promise1;
      }
      // setTimeout 模拟异步执行
      setTimeout(() => {
        // 执行可能会出错 需要try catch
        try {
          // onFulfilled接收resolve函数的参数
          // x 保存onFulfilled执行返回的值
          const x = onFulfilled(promise1.value);
          // 根据x的情况，处理promise2的状态
          resolvePromise(promise2, x);
        } catch (error) {
          // 执行onFulfilled如果产生了错误，将错误放到rejectedPromise中处理
          rejectPromise(promise2, error);
        }
      });
    }
    // 如果Promise状态是REJECTED
    if (promise1.status === statusMap.REJECTED) {
      // 第二个参数不是函数的话，把当前Promise返回
      if (!isFunction(onRejected)) {
        return promise1;
      }
      setTimeout(() => {
        // 执行可能会出错 需要try catch
        try {
          // onRejected接收reject函数的参数
          // x 保存onRejected执行返回的值
          const x = onRejected(promise1.reason);
          // x会在promise2拿到处理
          resolvePromise(promise2, x);
        } catch (error) {
          rejectPromise(promise2, error);
        }
      });
    }
    // 所以最开始的时候会进入这里，then执行了一次，把参数（函数）放到了数组中
    // 等到Promise的状态确定之后，再执行参数（函数）
    // 如果Promise状态是PENDING
    if (promise1.status === statusMap.PENDING) {
      // 还是要判断是否函数，不是函数的话赋值函数
      // 两个参数都必须是函数，否则会被忽略 [2.2.1]
      // (_) => _ 函数式编程 - 恒等函数
      onFulfilled = isFunction(onFulfilled) ? onFulfilled : (_) => _;
      onRejected = isFunction(onRejected)
        ? onRejected
        : (err) => {
            throw err;
          };
      // 这里传入了参数但是没有接收，应该把promise1.value改成接收的参数？
      // 把需要调用的函数push到数组中
      promise1.fulfilledCbs.push((value) => {
        setTimeout(() => {
          // 执行可能会出错 需要try catch
          try {
            // onFulfilled接收resolve函数的参数
            // x 保存onFulfilled执行返回的值
            // const x = onFulfilled(promise1.value);
            const x = onFulfilled(value);
            // x会被promise2拿到处理
            resolvePromise(promise2, x);
          } catch (error) {
            rejectPromise(promise2, error);
          }
        });
      });
      promise1.rejectedCbs.push((reason) => {
        setTimeout(() => {
          // 执行可能会出错 需要try catch
          try {
            // onRejected接收reject函数的参数
            // x 保存onFulfilled执行返回的值
            // const x = onRejected(promise1.reason);
            const x = onRejected(reason);
            // x会在promise2拿到处理
            resolvePromise(promise2, x);
          } catch (error) {
            rejectPromise(promise2, error);
          }
        });
      });
    }
    // then方法返回新的Promise
    return promise2;
  }
}
/**
 * 怎么执行测试用例
 * 添加以下代码
 * 执行 npm install promises-aplus-tests -g
 * 在当前路径下，运行 promises-aplus-tests my-promise.js
 */
// 测试用到的钩子
MyPromise.deferred = function () {
  const deferred = {};
  deferred.promise = new MyPromise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

module.exports = MyPromise;
// window.MyPromise = MyPromise
