/* 
自己重新写一遍

第一步：实现最基础的流程，
1. 创建实例
2. onFulfilled在resolve(data)后执行，接收到参数data打印出来 

第二步：按照规范完善
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

/* 
fulfillPromise 完成promise 
rejectPromise 拒绝promise 
resolvePromise 处理promise

then 的回调：
onFulfilled
onRejected
*/

/* 
1. 基础功能，只考虑fulfilled状态
2. resolve返回值是1 这种普通值

value resason 都需要挂载到promise实例上，这样才能进行传递
*/

function fulfillPromise(promise, value) {
  if (promise.status !== statusMap.PENDING) {
    return;
  }
  promise.status = statusMap.FULFILLED;
  promise.value = value;
  // 变成 FULFILLED ，那么 then 函数的 onFulfilled 回调就可以执行了
  // 这个时候就是把resolve(value) 的value传递给 onFulfilled 的参数的时机
  // 那么在刚开始执行then函数时，就要把onFulfilled放到promise上，这里才能执行
  // 执行完了之后有个返回值，就是`return 2`，实际可以返回其他类型
  // promise.onFulfilled(value);
  runCallbacks(promise.onFulfilledCbs, value);
}

function rejectPromise(promise, reason) {
  if (promise.status !== statusMap.PENDING) {
    return;
  }
  promise.status = statusMap.REJECTED;
  promise.reason = reason;
  runCallbacks(promise.onRejectedCbs, reason);
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
    // 处理状态分支的先后顺序有影响吗？试过了，没有影响

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
      // 等待x的状态完成 调用x.then
      // 根据在最基础的调用中学习到的逻辑
      // x 实例初始化时是 pending状态，是用户定义的
      // 此时只有调用了 x.then，并把相应的回调传过去
      // 才能在x的状态变更后，用户写的resolve执行了，然后此时这里的回调就会执行
      // 在末尾注释例1 中 promise 是 p1 ,x.value是222
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
    // x的值就是1，规范中说 用 x 作为 value 完成 promise
    // 此时就是需要调用fulfillPromise
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

    // 其他的逻辑都是会进去的
    // 测试了常规操作下都没有进FULFILLED和REJECTED条件分支
    // 这一块暂时不知道什么时候会进

    // 结合 2.2.1 和 2.2.2
    // onFulfilled 必须在 promise 变成 fulfilled 状态后被调用
    // 如果 onFulfilled 不是函数，会被忽略
    // 意思是不会返回一个新的promise了，直接接着用原来的promise执行后续的逻辑
    if (promise1.status === statusMap.FULFILLED) {
      console.log("then FULFILLED");
      // 好像举例子没有进这里，只进了Pending ？？？
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
      // 增加处理非函数，给一个 恒等函数
      onFulfilled = isFunction(onFulfilled) ? onFulfilled : (_) => _;
      onRejected = isFunction(onRejected)
        ? onRejected
        : (err) => {
            throw err;
          };
      // 因此这里就是把 onFulfilled 放到 this上
      // 包裹一层用于接收value，并且要改成异步执行
      /* promise1.onFulfilled = (value) => {
        setTimeout(() => {
          const x = onFulfilled(value);
          // x需要进行下一步处理
          resolvePromise(promise2, x);
        });
      }; */
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
}
MyPromise.deferred = function () {
  const deferred = {};
  deferred.promise = new MyPromise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

module.exports = MyPromise;

/* 
例1
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
*/
