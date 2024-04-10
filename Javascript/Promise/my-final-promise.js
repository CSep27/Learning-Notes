/* 
基于 my-promise3-2 自己实现的 通过测试例版本，去掉多余的注释

增加新功能
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
  return p instanceof MyPromise;
}

function fulfillPromise(promise, value) {
  if (promise.status !== statusMap.PENDING) {
    return;
  }
  promise.status = statusMap.FULFILLED;
  promise.value = value;
  runCallbacks(promise.onFulfilledCbs, value);
  // isFunction(promise.onFinally) && promise.onFinally();
}

function rejectPromise(promise, reason) {
  if (promise.status !== statusMap.PENDING) {
    return;
  }
  promise.status = statusMap.REJECTED;
  promise.reason = reason;
  runCallbacks(promise.onRejectedCbs, reason);
  // isFunction(promise.onFinally) && promise.onFinally();
}
function runCallbacks(callbacks, value) {
  callbacks.forEach((callback) => callback(value));
}

// resolvePromise 处理promise， x的值有多种情况
function resolvePromise(promise, x) {
  if (promise === x) {
    rejectPromise(
      promise,
      new TypeError(`${promise} and ${x} can't be the same`)
    );
    return;
  }

  if (isPromise(x)) {
    if (x.status === statusMap.FULFILLED) {
      fulfillPromise(promise, x.value);
      return;
    }

    if (x.status === statusMap.REJECTED) {
      rejectPromise(promise, x.reason);
      return;
    }

    // 现在正在处理的是传入的promise参数的状态
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
  if (isFunction(x) || isObject(x)) {
    let then;
    let called = false;
    try {
      then = x.then;
    } catch (e) {
      rejectPromise(promise, e);
      return;
    }
    if (isFunction(then)) {
      try {
        // 【2.3.3.3】
        then.call(
          x,
          (y) => {
            if (called) {
              return;
            }
            called = true;
            resolvePromise(promise, y);
          },
          (r) => {
            if (called) {
              return;
            }
            called = true;
            rejectPromise(promise, r);
          }
        );
      } catch (e) {
        if (called) {
          return;
        }
        called = true;
        rejectPromise(promise, e);
      }
    } else {
      fulfillPromise(promise, x);
      return;
    }
  } else {
    fulfillPromise(promise, x);
  }
}

class MyPromise {
  constructor(fn) {
    // promise的初始状态
    this.status = statusMap.PENDING;
    this.value = undefined;
    this.reason = undefined;

    // 2.2.6
    this.onFulfilledCbs = [];
    this.onRejectedCbs = [];

    fn(
      // 对应用户使用时的resolve函数参数，传参为value
      (value) => {
        // 需要根据value值的类型进行下一步处理
        // 并不是直接简单的将状态变成fulfilled
        resolvePromise(this, value);
      },
      // 对应用户使用时的reject函数参数，传参为reason
      (reason) => {
        rejectPromise(this, reason);
      }
    );
  }

  then(onFulfilled, onRejected) {
    const promise1 = this;
    const promise2 = new MyPromise(() => {});

    // 结合 2.2.1 和 2.2.2
    if (promise1.status === statusMap.FULFILLED) {
      console.log("then FULFILLED");
      // 2.2.1.1
      if (!isFunction(onFulfilled)) {
        return promise1;
      }
      // 2.2.2.1
      // 前面在pending里执行onFulfilled时要加setTimeout处理成异步才可以
      // 这里要执行也是一样的
      // 调用onFulfilled 遵循 2.2.2.7的规则
      setTimeout(() => {
        try {
          const x = onFulfilled(promise1.value);
          // x需要进行下一步处理
          resolvePromise(promise2, x);
        } catch (e) {
          rejectPromise(promise2, e);
        }
      });
    }
    if (promise1.status === statusMap.REJECTED) {
      console.log("then REJECTED");
      // 2.2.1.2
      if (!isFunction(onRejected)) {
        return promise1;
      }
      // 2.2.2.2
      setTimeout(() => {
        try {
          const x = onRejected(promise1.reason);
          resolvePromise(promise2, x);
        } catch (e) {
          rejectPromise(promise2, e);
        }
      });
    }

    // 刚开始调用时状态是pending，执行以下逻辑
    if (this.status === statusMap.PENDING) {
      console.log("then PENDING");
      // 2.2.5 必须作为函数调用，所以要给一个默认函数
      onFulfilled = isFunction(onFulfilled) ? onFulfilled : (_) => _;
      onRejected = isFunction(onRejected)
        ? onRejected
        : (err) => {
            throw err;
          };
      // onFulfilled 可能有多个，所以需要改成先放到队列中
      const onFulfilledFn = (value) => {
        setTimeout(() => {
          try {
            const x = onFulfilled(value);
            // x需要进行下一步处理
            resolvePromise(promise2, x);
          } catch (e) {
            rejectPromise(promise2, e);
          }
        });
      };
      promise1.onFulfilledCbs.push(onFulfilledFn);

      const onRejectedFn = (reason) => {
        setTimeout(() => {
          try {
            const x = onRejected(reason);
            resolvePromise(promise2, x);
          } catch (e) {
            rejectPromise(promise2, e);
          }
        });
      };
      promise1.onRejectedCbs.push(onRejectedFn);
    }
    return promise2;
  }

  // catch方法接收一个函数参数
  // catch()方法返回的还是一个 Promise 对象，因此后面还可以接着调用then()方法。
  // catch()方法之中，还能再抛出错误。

  /* 
  1. 如果同时有then的第二个参数和catch方法，catch方法不执行
  2. catch方法返回Promise对象，如果catch的函数参数返回了值，会接着传到后续的then中
  */
  catch(onRejected) {
    const promise1 = this;
    const promise2 = new MyPromise(() => {});
    // 放到promise1.onRejectedCbs中
    // 对于第一点，then的第二个参数会先执行，把promise状态改变了
    // 队列里的这里再执行就直接return了
    promise1.onRejectedCbs.push((reason) => {
      setTimeout(() => {
        try {
          const x = onRejected(reason);
          resolvePromise(promise2, x);
        } catch (e) {
          rejectPromise(promise2, e);
        }
      });
    });
    return promise2;
  }

  /* 
  1. 不接受任何参数，这意味着没有办法知道，前面的 Promise 状态到底是fulfilled还是rejected。
  2. 这表明，finally方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。 
  */
  finally(onFinally) {
    // 按照 https://es6.ruanyifeng.com/#docs/promise#Promise-prototype-finally 中的思路实现
    // then FULFILLED 出现了
    return this.then(
      (value) => {
        return new MyPromise((resolve) => {
          resolve(onFinally());
        }).then(() => {
          return value;
        });
      },
      (reason) => {
        return new MyPromise((resolve) => {
          resolve(onFinally());
        }).then(() => {
          throw reason;
        });
      }
    );
  }
}
/* 
Promise.resolve(value) 等价于
new Promise((resolve) => {resolve(value)})
*/
// 当使用 MyPromise.resolve方法时，会进入then FULFILLED
MyPromise.resolve = function (value) {
  return new MyPromise((resolve) => {
    resolve(value);
  });
};
// 当使用 MyPromise.resolve方法时，会进入then FULFILLED
MyPromise.reject = function (reason) {
  return new MyPromise((resolve, reject) => {
    reject(reason);
  });
};
/* 
测试代码 
npm install promises-aplus-tests -g 
promises-aplus-tests my-final-promise.js
*/
MyPromise.deferred = function () {
  const deferred = {};
  deferred.promise = new MyPromise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

module.exports = MyPromise;
