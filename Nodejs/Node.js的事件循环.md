# 总结

类似于浏览器 JS 中的宏任务微任务，多了一些内容

1. process.nextTick() 微任务
2. 除了 setTimeout 和 setInterval 定时器（timers），多了一个 setImmediate，并且归类到 check
3. 多了 I/O 操作，和 setTimeout 也是一样的，回调是在之后执行，执行时间取决于 I/O 操作的时间，操作完成后执行回调，**执行时间不固定，会插空执行**
4. 所有宏任务阶段的微任务紧跟在宏任务执行完成后执行，微任务数量是有限制的，防止当前阶段处理时间过长，导致后面的任务长时间无法执行

# process.nextTick()

- 类似于 promise.then()微任务，在当前宏任务（循环）之后，下个循环开始前插队执行
- 在同一个微任务队列中， process.nextTick() 执行要早于 promise.then()微任务
- 例 1

```js
// bar 1
// resolve
let bar;

function someAsyncApiCall(callback) {
  Promise.resolve().then(() => {
    console.log("resolve");
  });
  process.nextTick(callback);
}

someAsyncApiCall(() => {
  console.log("bar", bar);
});

bar = 1;
```

- 例 2

```js
// 1 emit 2 3 nextTick event!
const EventEmitter = require("events");

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    // 如果这里不用process.nextTick()，直接用this.emit('event')
    // 那么在new MyEmitter()时，constructor()函数就执行了，但是event事件还没有被注册
    process.nextTick(() => {
      console.log("nextTick");
      this.emit("event");
    });
    console.log("emit");
  }
}
console.log(1);
const myEmitter = new MyEmitter();
console.log(2);
myEmitter.on("event", () => {
  console.log("event!");
});
console.log(3);
```

# setImmediate() 和 setTimeout()

- 定时器，属于宏任务
- setImmediate() 意思是立即执行
- setTimeout() 指定时间后执行，时间为 0 并不代表一定会 0ms 后执行，即立即执行

## 执行时机

- setImmediate() 一旦在当前 轮询 阶段完成， 就执行脚本。
- setTimeout() 在最小阈值（ms 单位）过后运行脚本

### 执行顺序不确定的情况

- **运行不在 I/O 周期（即主模块）内的脚本，则执行两个计时器的顺序是非确定性的，因为它受进程性能的约束**

- 具体解释：在 mainline 部分执行 setTimeout 设置定时器 (没有写入队列呦)，与 setImmediate 写入 check 队列。mainline 执行完开始事件循环，第一阶段是 timers，这时候 timers 队列可能为空，也可能有回调；如果没有那么执行 check 队列的回调，下一轮循环在检查并执行 timers 队列的回调；如果有就先执行 timers 的回调，再执行 check 阶段的回调。因此这是 timers 的不确定性导致的。

```js
// 测试时的情况
// 先打印1
// setTimeout的时间设置在小于10ms时，与setImmediate的执行先后顺序是不确定的
// 大于等于10ms时，setImmediate先执行

setImmediate(() => {
  console.log("immediate");
});

setTimeout(() => {
  console.log("timeout");
}, 10);

console.log(1);
```

### 执行顺序确定的情况

- **如果两个函数在一个 I/O 循环内调用，setImmediate 总是被优先调用**：
- 使用 setImmediate() 相对于 setTimeout() 的主要优势是，
- 如果 setImmediate() 是在 I/O 周期内被调度的，那它将会在其中任何的定时器之前执行，跟这里存在多少个定时器无关

```js
// 'immediate'
// 'timeout'
const fs = require("fs");

fs.readFile("./1,js", () => {
  setTimeout(() => {
    console.log("timeout");
  }, 0);
  setImmediate(() => {
    console.log("immediate");
  });
});
```

# 举例

```js
const fs = require("fs");
const ITERATIONS_MAX = 2;
let iteration = 0;
const start = Date.now();
const msleep = (i) => {
  for (let index = 0; Date.now() - start < i; index++) {
    // do nonthing
  }
};
Promise.resolve().then(() => {
  // Microtask callback runs AFTER mainline, even though the code is here
  console.log("Promise.resolve.then", "MAINLINE MICROTASK");
});
console.log("START", "MAINLINE");
const timeout = setInterval(() => {
  console.log("START iteration " + iteration + ": setInterval", "TIMERS PHASE");
  if (iteration < ITERATIONS_MAX) {
    setTimeout(
      (iteration) => {
        Promise.resolve().then(() => {
          console.log(
            "setInterval.setTimeout.Promise.resolve.then",
            "TIMERS PHASE MICROTASK"
          );
        });
        console.log(
          "TIMER EXPIRED (from iteration " +
            iteration +
            "): setInterval.setTimeout",
          "TIMERS PHASE"
        );
      },
      0,
      iteration
    );
    fs.readdir(__dirname, (err, files) => {
      if (err) throw err;
      // console.log(`fs.readdir() callback: ${iteration}`)
      // 当前有多少文件内容
      console.log(
        "fs.readdir() callback: Directory contains: " + files.length + " files",
        "POLL PHASE"
      );
      queueMicrotask(() =>
        console.log(
          "setInterval.fs.readdir.queueMicrotask",
          "POLL PHASE MICROTASK"
        )
      );
      Promise.resolve().then(() => {
        console.log(
          "setInterval.fs.readdir.Promise.resolve.then",
          "POLL PHASE MICROTASK"
        );
      });
    });
    setImmediate(() => {
      Promise.resolve().then(() => {
        console.log(
          "setInterval.setImmediate.Promise.resolve.then",
          "CHECK PHASE MICROTASK"
        );
      });
      console.log("setInterval.setImmediate", "CHECK PHASE");
    });
    // msleep(1000); // 等待 I/O 完成
  } else {
    console.log("Max interval count exceeded. Goodbye.", "TIMERS PHASE");
    clearInterval(timeout);
  }
  console.log("END iteration " + iteration + ": setInterval", "TIMERS PHASE");
  iteration++;
}, 0);
console.log("END", "MAINLINE");
```

- 打印结果分析

```
------ 主线立即执行，相当于有个立即执行的main() ------
START MAINLINE       主线宏任务
END MAINLINE         主线宏任务
Promise.resolve.then MAINLINE MICROTASK     主线微任务

------ 事件循环

------ 第0次执行 setInterval 进if if里的任务都放到宏任务队列里了，所以先打印START和END -------
START iteration 0: setInterval TIMERS PHASE
END iteration 0: setInterval TIMERS PHASE

--- check，setImmediate回调执行打印，setImmediate回调中执行微任务 ---
setInterval.setImmediate CHECK PHASE
setInterval.setImmediate.Promise.resolve.then CHECK PHASE MICROTASK

--- timers，到时间了，setTimeout回调执行，setTimeout回调中执行微任务 ---
TIMER EXPIRED (from iteration 0): setInterval.setTimeout TIMERS PHASE
setInterval.setTimeout.Promise.resolve.then TIMERS PHASE MICROTASK

--- fs.readdir()执行了，只是还没有获取结果，回调还没执行，等待到时间执行

------ 第1次执行 setInterval 进if 先打印START和END ------
START iteration 1: setInterval TIMERS PHASE
END iteration 1: setInterval TIMERS PHASE

--- poll I/O操作，读取当前目录下有多少文件，第0次时这个任务放到队列里了，
--- 但是当时还没有拿到结果，回调还没执行，现在拿到结果了，执行回调
--- 执行当前阶段的微任务
fs.readdir() callback: Directory contains: 11 files POLL PHASE
setInterval.fs.readdir.queueMicrotask POLL PHASE MICROTASK
setInterval.fs.readdir.Promise.resolve.then POLL PHASE MICROTASK

--- 这是第1次的放到队列里的，也是已经拿到结果了，所以打印了
--- 但是执行时间是不确定的，可以将msleep函数放开再打印一次
fs.readdir() callback: Directory contains: 11 files POLL PHASE
setInterval.fs.readdir.queueMicrotask POLL PHASE MICROTASK
setInterval.fs.readdir.Promise.resolve.then POLL PHASE MICROTASK

--- check，setImmediate执行
setInterval.setImmediate CHECK PHASE
setInterval.setImmediate.Promise.resolve.then CHECK PHASE MICROTASK

--- timers， setTimeout执行
TIMER EXPIRED (from iteration 1): setInterval.setTimeout TIMERS PHASE
setInterval.setTimeout.Promise.resolve.then TIMERS PHASE MICROTASK

------ 第2次执行setInterval，打印START，进入else，打印到次数了，清除了定时器，在打印END
START iteration 2: setInterval TIMERS PHASE
Max interval count exceeded. Goodbye. TIMERS PHASE
END iteration 2: setInterval TIMERS PHASE
```

# 参考资料

- [NodeJS 中的事件循环--理解同步和异步编程](https://chinese.freecodecamp.org/news/nodejs-eventloop-tutorial/) 主要讲了同步和异步
- [Node.js 事件循环](https://learnku.com/articles/38802) 示例来源
