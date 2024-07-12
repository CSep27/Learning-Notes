## Vue.set()

vue2.0 中不能直接监听对象中新增属性的变化，如果需要监听，需要通过 [Vue.set( target, propertyName/index, value )](https://cn.vuejs.org/v2/api/#Vue-set)方法添加

set 函数通过`Object.defineProperty`将传入的对象上的属性变为响应式属性，简易版实现如下：

```js
const set = (target, prop, initValue) => {
  let value = initValue;
  let dep = new Dep();
  return Object.defineProperty(target, prop, {
    get() {
      dep.depend();
      return value;
    },
    set(newValue) {
      value = newValue;
      dep.notify();
    },
  });
};
```

这段代码中的逻辑与 ref 函数中的逻辑重复，将代码提取放到 createReactive 函数中。

## 数组响应式

`let countArr = set([], 1, 0)`
通过 set 函数将 countArr[1]设置为响应式，但是 countArr[0]为非响应式。出于性能的考虑，Vue 默认不会将数组的每一项进行响应式监听。如果需要，可以通过 Vue.set()实现。
同时 Vue 源码中对于`push pop shift unshift splice sort reverse`这些方法进行了处理，使得通过这些方法操作数组时能感知到数据的变化。

处理数组原型上的 push 方法

1. 通过 set 生成一个响应式数组，在执行 set 函数时，已经添加了依赖
2. 改造数组原型上的 push 方法。首先将原型上的 push 方法存储起来，再重新定义 Array.prototype.push。
3. 在新方法中首先执行本来的 push 操作，然后需要调用 notify 方法，触发依赖的执行。notify 方法挂载在 createReactive 函数内的 dep 实例上，这里的 this 即 createReactive 函数中的 target 对象，所以可以改造 createReactive 函数，将 dep 实例挂载到 target 的\_dep 属性上。这样就可以拿到并触发 notify 了。

```js
let createReactive = (target, prop, value) => {
  // let dep = new Dep()
  target._dep = new Dep();
  if (Array.isArray(target)) {
    target.__proto__ = arrayMethods;
  }
  return Object.defineProperty(target, prop, {
    get() {
      target._dep.depend();
      return value;
    },
    set(newValue) {
      value = newValue;
      target._dep.notify();
    },
  });
};

let push = Array.prototype.push;
let arrayMethods = Object.create(Array.prototype);
arrayMethods.push = function (...args) {
  push.apply(this, [...args]);
  // 这里需要调用notify方法
  // notify方法挂载在createReactive函数内的dep实例上，修改为挂载到target上
  // 这里通过this就可以拿到notify方法
  this._dep && this._dep.notify();
};
```

完整带示例代码：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>

  <body>
    <button id="add">add</button>
    <div id="app"></div>
    <hr />
    <button id="addArr">addArr</button>
    <div id="appArr"></div>
  </body>
  <script>
    let active;

    let effect = (fn, options = {}) => {
      // 为什么要增加一个_effect函数
      // 因为需要给_effect增加属性
      // 也可以直接给fn增加，但是由于引用类型的原因，会对fn函数造成污染
      let _effect = (...args) => {
        try {
          active = _effect;
          return fn(...args);
        } finally {
          active = null;
        }
      };

      _effect.options = options;
      _effect.deps = []; // effect和dep的关系-1
      return _effect;
    };

    let cleanUpEffect = (effect) => {
      // 清除依赖
      // 需要反向查找effect被哪些dep依赖了
      // 在effect上添加[] 建立双向索引
      const { deps } = effect;
      console.log(deps);
      console.log(effect);
      if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
          deps[i].delete(effect);
        }
      }
    };

    let watchEffect = (cb) => {
      /* active = cb
    active()
    active = null */
      let runner = effect(cb);
      runner();

      return () => {
        cleanUpEffect(runner);
      };
    };

    let nextTick = (cb) => Promise.resolve().then(cb);

    // 队列
    let queue = [];

    // 添加队列
    let queueJob = (job) => {
      if (!queue.includes(job)) {
        queue.push(job);
        // 添加之后，将执行放到异步任务中
        nextTick(flushJob);
      }
    };

    // 执行队列
    let flushJob = () => {
      while (queue.length > 0) {
        let job = queue.shift();
        job && job();
      }
    };

    let Dep = class {
      constructor() {
        // 存放收集的active
        this.deps = new Set();
      }
      // 依赖收集
      depend() {
        if (active) {
          this.deps.add(active);
          active.deps.push(this.deps); // effect和dep的关系-2
        }
      }
      // 触发
      notify() {
        this.deps.forEach((dep) => queueJob(dep));
        this.deps.forEach((dep) => {
          dep.options && dep.options.schedular && dep.options.schedular();
        });
      }
    };

    let createReactive = (target, prop, value) => {
      // let dep = new Dep()
      target._dep = new Dep();
      if (Array.isArray(target)) {
        target.__proto__ = arrayMethods;
      }
      return Object.defineProperty(target, prop, {
        get() {
          target._dep.depend();
          return value;
        },
        set(newValue) {
          value = newValue;
          target._dep.notify();
        },
      });
    };

    let ref = (initValue) => createReactive({}, "value", initValue);

    const set = (target, prop, initValue) =>
      createReactive(target, prop, initValue);

    let computed = (fn) => {
      let value;
      let dirty = true; // 为true表明依赖的变量发生了变化，此时需要重新计算
      let runner = effect(fn, {
        schedular() {
          if (!dirty) {
            dirty = true;
          }
        },
      });
      return {
        get value() {
          if (dirty) {
            // 何时将dirty重置为true，当执行fn后
            // 因此需要通过配置回调函数，在执行fn后将dirty重置为true
            // value = fn()
            value = runner();
            dirty = false;
          }
          return value;
        },
      };
    };

    let watch = (source, cb, options = {}) => {
      const { immediate } = options;
      const getter = () => {
        return source();
      };
      // 将函数添加到count的依赖上去，当count变化时
      let oldValue;
      const runner = effect(getter, {
        schedular: () => applyCb(),
      });

      const applyCb = () => {
        let newValue = runner();
        if (newValue !== oldValue) {
          cb(newValue, oldValue);
          oldValue = newValue;
        }
      };

      if (immediate) {
        applyCb();
      } else {
        oldValue = runner();
      }
    };

    let push = Array.prototype.push;
    let arrayMethods = Object.create(Array.prototype);

    arrayMethods.push = function (...args) {
      console.log(this);
      push.apply(this, [...args]);
      // 这里需要调用notify方法
      // notify方法挂载在createReactive函数内的dep实例上，修改为挂载到target上
      // 这里通过this就可以拿到notify方法
      this._dep && this._dep.notify();
    };

    // set示例：
    let count = ref(0);
    /* // count.v新增属性，不会有响应式变化
  document.getElementById('add').addEventListener('click', function () {
    if (!count.v) {
      count.v = 0
    }
    count.v++
  })

  let str
  let stop = watchEffect(() => {
    str = `hello ${count.v}`
    document.getElementById('app').innerText = str
  }) */

    document.getElementById("add").addEventListener("click", function () {
      if (!count.v) {
        set(count, "v", 0);
        watchEffect(() => {
          str = `hello ${count.v}`;
          document.getElementById("app").innerText = str;
        });
      }
      count.v++;
    });

    // 数组push示例：
    let arrValue = 0;
    // set函数中已经对依赖进行了一次添加
    let countArr = set([], 1, 0);
    document.getElementById("addArr").addEventListener("click", function () {
      arrValue++;
      countArr.push(arrValue);
    });
    watchEffect(() => {
      str = `hello ${countArr.join(",")}`;
      document.getElementById("appArr").innerText = str;
    });
  </script>
</html>
```
