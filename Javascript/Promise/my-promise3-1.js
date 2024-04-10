/* 
自己重新写一遍

第一步：实现最基础的流程，
1. 创建实例
2. onFulfilled在resolve(data)后执行，接收到参数data打印出来 
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
  promise.status = statusMap.FULFILLED;
  promise.value = value;
  // 变成 FULFILLED ，那么 then 函数的 onFulfilled 回调就可以执行了
  // 这个时候就是把resolve(value) 的value传递给 onFulfilled 的参数的时机
  // 那么在刚开始执行then函数时，就要把onFulfilled放到promise上，这里才能执行
  // 执行完了之后有个返回值，就是`return 2`，实际可以返回其他类型
  setTimeout(() => {
    const x = promise.onFulfilled(value);
    // x需要进行下一步处理
  });
}

function rejectPromise(promise, reason) {}

// resolvePromise 处理promise， x的值有多种情况
function resolvePromise(promise, x) {
  // x的值就是1，规范中说 用 x 作为 value 完成 promise
  // 此时就是需要调用fulfillPromise
  fulfillPromise(promise, x);
}

class MyPromise {
  constructor(fn) {
    // promise的初始状态
    this.status = statusMap.PENDING;
    this.value = undefined;
    this.reason = undefined;

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
    // 刚开始调用时状态是pending，执行以下逻辑
    if (this.status === statusMap.PENDING) {
      // 因此这里就是把 onFulfilled 放到 this上
      promise1.onFulfilled = onFulfilled;
    }
    return promise2;
  }
}

module.exports = MyPromise;
