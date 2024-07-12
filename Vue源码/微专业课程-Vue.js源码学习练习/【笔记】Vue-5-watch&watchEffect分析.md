## watch

watch 的使用:
[watch( expOrFn, callback, \[options\] )](https://cn.vuejs.org/v2/api/#vm-watch)

- 第一个参数可以是 Vue 实例上的一个表达式或者一个函数，函数表示监听它计算结果的变化
- 第二个参数是监听到变化后执行的函数
- 第三个参数是对象，可以进行 deep（深度监听）、immediate（立即触发依次）的配置

分析第一个参数是函数时的情况
`watch(() => count.value, (newValue, oldValue) => {})`
思路：第一个参数是函数时，执行函数，通过 count 对象上的 get 拦截器，将变化加入到 count.value 的依赖中去，count.value 变化后就会通知到 watch 函数。

watch 函数

1. 增加一个 watch 函数，有三个参数，监听源 source，回调函数 cb，配置对象 options
2. 定义一个 getter 函数，执行 source（源码中需要处理 source 是其他类型的情况）
3. 通过 effect 函数添加依赖，第一个参数即 getter，第二个对象参考 computed 定义的`schedular中`，在变化发生后执行
4. schedular 中当`newValue !== oldValue`时执行回调

```js
let watch = (source, cb, options = {}) => {
  // 源码中需要处理source是其他类型的情况
  const getter = () => {
    return source();
  };
  let oldValue;
  // 当监听的值变化后，执行回调
  const runner = effect(getter, {
    schedular: () => {
      let newValue = runner();
      if (newValue !== oldValue) {
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    },
  });
  // 先执行一次拿到旧值
  oldValue = runner();
};
```

实现 immediate 参数

- immediate 为 true 时，开始时就执行一次 cb 函数

```js
let watch = (source, cb, options = {}) => {
  const { immediate } = options;
  // 源码中需要处理source是其他类型的情况
  const getter = () => {
    return source();
  };
  let oldValue;
  // 当监听的值变化后，执行回调
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
    // 先执行一次拿到旧值
    oldValue = runner();
  }
};
```

## watchEffect

watchEffect 数据变化时立即变化，执行后返回一个函数（stop：停止监听数据变化）
watchEffect 就是前面代码中的 watchEffect，需要增加返回函数的功能。返回的函数通过清除依赖实现停止监听。

1. 增加 cleanUpEffect 函数，将 runner 传入
2. 收集依赖时，将 effect 添加到 deps 中，现在需要反向查找 effect 被哪些 deps 依赖了。通过在 effect 上添加一个数组，用于存放 deps，建立双向索引

```js
let Dep = class {
  constructor() {
    // 存放收集的active
    this.deps = new Set();
  }
  // 依赖收集
  depend() {
    if (active) {
      this.deps.add(active);
      // 将deps放到active(即effect上的deps属性中)
      active.deps.push(this.deps);
    }
  }
  // 触发
  notify() {
    this.deps.forEach((dep) => {
      queueJob(dep);
      // 执行钩子函数
      dep.options && dep.options.schedular && dep.options.schedular();
    });
  }
};

let cleanUpEffect = (effect) => {
  // 收集依赖时，将effect添加到deps中
  // 现在需要反向查找effect被哪些deps依赖了
  // 因此在effect上添加一个数组，用于存放deps，建立双向索引
  const { deps } = effect;
  // 如果deps有值，通过Set数据的delete方法清除effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
  }
};
let watchEffect = (cb) => {
  let runner = effect(cb);
  runner();
  // 返回函数清除依赖
  return () => {
    cleanUpEffect(runner);
  };
};
```

完整有示例代码：

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
  </body>
  <script>
    let active;

    let effect = (fn, options = {}) => {
      // _effect 额外包装了一层，用于给它添加属性
      // 为了保证fn函数的纯粹性
      let _effect = (...args) => {
        try {
          active = _effect;
          return fn(...args); // 需要添加return语句用于computed函数中拿到变化之后的值
        } finally {
          // 无论是否抛出异常最后finally都会执行
          // 这句代码是在`return fn(...args)`后需要执行，因此需要放进try{}finally{}中
          active = null;
        }
      };
      _effect.options = options;
      _effect.deps = [];
      return _effect;
    };

    let cleanUpEffect = (effect) => {
      // 收集依赖时，将effect添加到deps中
      // 现在需要反向查找effect被哪些deps依赖了
      // 因此在effect上添加一个数组，用于存放deps，建立双向索引
      const { deps } = effect;
      if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
          deps[i].delete(effect);
        }
      }
    };

    // 之前的watch实现的即是watchEffect函数的功能
    let watchEffect = (cb) => {
      /* active = cb
    active()
    active = null */
      // 将原来部分的逻辑提取到effect函数中
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
          active.deps.push(this.deps);
        }
      }
      // 触发
      notify() {
        this.deps.forEach((dep) => {
          queueJob(dep);
          // 执行钩子函数
          dep.options && dep.options.schedular && dep.options.schedular();
        });
      }
    };

    // 传入一个函数，返回一个包含可监听value值的对象
    let computed = (fn) => {
      let value;
      // 需要设置一个标记记录依赖的值是否变化，只有变化了才重新计算
      let dirty = true;
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
            // 何时将dirty重置为true
            // 在执行fn时，监听的响应式数据变化之后将dirty重置为true
            // 就是在执行notify()时
            // notify中的dep对应的为watchEffect传入的cb，因此需要改造watchEffect
            // value = fn() // value值置为传入函数执行的结果
            value = runner();
            // 计算之后将标记置为false。只要数据没有变化，就不会再重新计算
            dirty = false;
          }
          return value;
        },
      };
    };

    let ref = (initValue) => {
      let value = initValue;
      let dep = new Dep();
      return Object.defineProperty({}, "value", {
        get() {
          dep.depend();
          return value;
        },
        set(newValue) {
          value = newValue;
          // active()
          dep.notify();
        },
      });
    };

    let watch = (source, cb, options = {}) => {
      const { immediate } = options;
      // 源码中需要处理source是其他类型的情况
      const getter = () => {
        return source();
      };
      let oldValue;
      // 当监听的值变化后，执行回调
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
        // 先执行一次拿到旧值
        oldValue = runner();
      }
    };

    // 使用：
    let count = ref(0);
    document.getElementById("add").addEventListener("click", function () {
      count.value++;
    });
    watch(
      () => count.value,
      (newValue, oldValue) => {
        console.log(newValue, oldValue);
      },
      { immediate: true }
    );

    let str;
    let stop = watchEffect(() => {
      str = `hello ${count.value} ${computedValue.value}`;
      document.getElementById("app").innerText = str;
    });

    // 3秒后执行stop函数，点击按钮后数字不再变化
    setTimeout(() => {
      stop();
    }, 3000);
  </script>
</html>
```
