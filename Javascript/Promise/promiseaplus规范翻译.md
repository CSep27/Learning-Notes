英文版：[promiseaplus](https://promisesaplus.com/)

# Promise A+规范

一个 promise 代表了一个异步操作的最终结果。与一个 promise 交互的主要方式是通过它的 then 方法，then 方法注册回调函数用于接收一个 promise 的最终的值，或者接收一个为什么 promise 没有变成完成状态的原因。

这个规范详细定义了 then 方法的行为，提供了一个可互操作的基础，所有的与 Promises/A+ 一致的 promise 实现都可以依赖于此。因此，这个规范必须要非常健壮。尽管 Promises/A+ 组织或许偶尔会修订这个规范，有一些很小的向下兼容的改变去处理新发现的边缘问题。只有在仔细的考虑讨论和测试之后，我们才会合并大的或者向下不兼容的改变。

从历史的角度来说，Promises/A+ 阐明了早期的 Promises/A 提议的行为条款，扩充了条款以覆盖实际上的行为，并且去掉了不明确或者有问题的部分。

最后，Promises/A+ 的核心规范不会处理怎么创建、完成或者拒绝 promises（create,fulfill,reject），而是选择关注于提供一个可以彼此协作的 then 方法。未来一些相关的其他规范或许会做这些事情。

## 1. 术语

1. Promise 一个有 then 方法的对象或函数，行为符合本规范
2. thenable 一个定义了 then 方法的对象或函数
3. value 任何 JavaScript 的合法值（包括 undefined, thenable 或 promise）
4. exception 使用 throw 语句抛出的值
5. reason 一个标示 Promise 被拒绝原因的值

## 2. 要求

### 2.1 Promise 的状态

promise 必须是以下三种状态之一

1. pending 可以转换成 fulfilled 或 rejected 状态
2. fulfilled 不能转换成其他状态，必须有一个不能改变的 value
3. rejected 不能转换成其他状态，必须有一个不能改变的 reason

> Promise 的状态可以由 pending 改为 fulfilled 或 rejected，当状态变为 fulfilled 或 rejected 后，状态稳定了，任何操作都不能修改 Promise 的状态了

### 2.2 then 方法

一个 promise 必须提供一个 then 方法，用于获取它现在或者最终的 value 或者 reason。

promise 的 then 接收两个参数 onFulfilled 和 onRejected：

```js
promise.then(onFulfilled, onRejected);
```

1. onFulfilled 和 onRejected 都是可选的参数
   - 如果 onFulfilled 不是函数，会被忽略
   - 如果 onRejected 不是函数，会被忽略
2. 如果 onFulfilled 是函数
   - onFulfilled 必须在 promise 变成 fulfilled 状态后被调用，promise 的 value 作为它的第一个参数
   - 最多只会被调用一次
3. 如果 onRejected 是函数
   - onRejected 必须在 Promise 变成 rejected 状态后调用，promise 的 reason 作为它的第一个参数
   - 最多只会被调用一次
4. 一旦[执行上下文栈](https://es5.github.io/#x10.3)只包含了平台代码，onFulfilled 和 onRejected 就不能被调用了。（onFulfilled or onRejected must not be called until the execution context stack contains only platform code. ）[3.1] (注：[3.1]表示第三节第一点对这里做了进一步补充解释，下同)
5. onFulfilled 和 onRejected 必须作为函数被调用（也就是说，with no this value）[3.2]
6. then 方法可以被**同一 promise**调用多次
   - 如果 promise 变成 fulfilled 状态，所有 onFulfilled 回调函数会依次按照定义时的顺序执行
   - 如果 promise 变成 rejected 状态，所有 onRejiected 回调函数会依次按照定义时的顺序执行
7. then 方法必须返回一个新的 promise[3.3]。
   ```js
   promise2 = promise1.then(onFulfilled, onRejected);
   ```
   - 无论 onFulfilled 还是 onRejected 返回了值 x，那么都执行 Promise Resolution 程序`[[Resolve]](promise2, x)`
   - 无论 onFulfilled 还是 onRejected 抛出了异常 e，那么 promise2 必须变成 rejected 状态，e 作为 reason。
   - 如果 onFulfilled 不是函数，并且 promise1 的状态是 fulfilled。promise2 的状态也是 fulfilled，值同 promise1。
   - 如果 onRejected 不是函数，并且 promise1 的状态是 rejected。promise2 的状态也是 rejected，值同 promise1

### 2.3 Promise 决议过程

promise 决议过程（promise resolution procedure）是一个抽象的操作，将一个 promise 和一个 value 作为输入，用`[[Resolve]](promise, x)`来表示它。如果 x 是一个 thenable 对象，并且假设 x 的行为像一个 promise，它会尝试创建 promise，延续 x 的状态。否则，它会完成 promise，携带值 x。

这种对于 thenable 对象的处理让 promise 能实现互操作功能，只要它们暴露了一个符合 Promises/A+ 规范的 then 方法。这让符合 Promises/A+ 规范的实现能够适配那些不符合 Promises/A+ 规范的实现，只需要它们有一个合适的 then 方法。

按照下列步骤执行`[[Resolve]](promise, x)`：

2.3.1 如果 promise 和 x 指向同一个对象，用一个 TypeError 作为原因拒绝 promise

2.3.2 如果 x 是一个 promise，采用它的状态[3.4]

    - 2.3.2.1 如果 x 是 pending 状态，promise 必须保持 pending 直到 x 是 fulfilled 或者 rejected 状态
    - 2.3.2.2 如果 x 是 fulfilled 状态，用同样的 value 完成 promise
    - 2.3.2.3 如果 x 是 rejected 状态，用同样的 reason 拒绝 promise

2.3.3 如果 x 是一个对象或者函数

    - 2.3.3.1 将`x.then`赋值给`then`。[3.5]
    - 2.3.3.2 如果获取 x.then 的值导致抛出一个异常 e，用 e 作为 reason 拒绝 promise
    - 2.3.3.3 如果 then 是一个函数，用 x 作为 this 执行这个函数，第一个参数是 resolvePromise，第二个参数是 rejectPromise

          - 2.3.3.3.1 如果 resolvePromise 执行时带有参数值 y，执行`[[Resolve]](promise, y)`
          - 2.3.3.3.2 如果 rejectPromise 执行时带有参数 r，用 r 作为 reason 拒绝 promise
          - 2.3.3.3.3 如果 resolvePromise 和 rejectPromise 都执行了，或者对同一个参数进行多次调用，第一个执行的方法优先，后面的执行都会被忽略。
          - 2.3.3.3.4 如果执行 then 时抛出了异常 e。如果 resolvePromise 和 rejectPromise 都已经执行过了，忽略异常。否则用 e 作为 reason 拒绝 promise

    - 2.3.3.4 如果 then 不是一个函数，用 x 作为 value 完成 promise

2.3.4 如果 x 不是对象也不是函数，用 x 作为 value 完成 promise

如果一个 promise 是被一个参与到 thenable 链中的 thenable 对象决议的，那么递归类型的`[[Resolve]](promise, thenable)`最终会导致`[[Resolve]](promise, thenable)`再次被调用，遵循上面的算法最终会导致无限递归。鼓励实现检测这种递归（但不是必须的），并以一个说明性的 TypeError 作为理由拒绝 promise。（Implementations are encouraged, but not required, to detect such recursion and reject promise with an informative TypeError as the reason.）[3.6]

## 3. 注意点

1. 平台代码（ “platform code” ）意味着引擎，环境和 promise 的实现代码。在实践中，这种要求（应该就是指前面的 2.2.4）保证了 onFulfilled 和 onRejected 异步执行，在事件循环到 then 方法被调用后，并且进入了一个新的栈时。这种可能是用一个“宏任务”机制实现，像 setTimeout 或者 setImmediate，或者用一个“微任务”机制实现，像 MutationObserver 或者 process.nextTick。因此 promise 的实现是依平台代码（ “platform code” ）而定的，它自身可能包含一个任务调度队列或者“蹦床”（ “trampoline” ），在这里调用处理程序。
2. 在严格模式下，内部的 this 是 undefined，宽松模式下，是全局对象。
3. 实现可能会允许`promise2 === promise1`，提供这种实现以适应所有需求。每种实现应该说明是否提供了`promise2 === promise1`，并且在何种情况下成立。
4. 一般来说，只有当 x 来自于当前实现时，才知道它是一个真正的 promise。这条允许特定实现的规定意味着与已经被熟知的 promises 一致。（This clause allows the use of implementation-specific means to adopt the state of known-conformant promises.）
5. 首先存储对`x.then`的引用，然后测试引用，最后调用引用的步骤，避免了对`x.then`的多次访问。这些防范措施对于在遇到一个访问器属性时保证一致性是很重要的，访问器属性的值或许会在每次检索之间发生变化。
6. 实现不应该对 thenable 链的深度设置任何限制，或者假设超过了任意限制，会进入无限递归。只有真的循环才会触发 TypeError；如果遇到了一个明确的 thenable 的无限链，永远递归才是正确的行为。
