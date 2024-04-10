# 说明

阅读《深入浅出 Vue.js》书时记录的笔记

书中说的是 Vue 的 v2.5.2 版本

第 1 章 - 第 4 章（目前）

# 第 1 章 Vue.js 简介

## 1.2 Vue.js 简史

- 渐进式框架，就是把框架分层。
- 最核心的部分是视图层渲染，然后往外是组件机制，在这个基础上再加入路由机制，再加入状态管理，最外层是构建工具。
- 所谓分层，就是说你既可以只用最核心的视图层渲染功能来快速开发一些需求，也可以使用一整套全家桶来开发大型应用

# 第一篇 变化侦测

- 从状态生成 DOM，再输出到用户界面显示的一整套流程叫做渲染，应用在运行时会不断地进行重新渲染。
- 响应式系统赋予框架重新渲染的能力，变化侦测是响应式系统的核心。
- 变化侦测是侦测数据的变化。当数据变化时，会通知视图进行相应的更新。

# 第 2 章 Object 的变化侦测

- Vue.js 的状态是声明式的，通过模板来描述状态和 DOM 之间的映射关系

- 应用运行时内部的状态会不断发生变化，此时需要不停地重新渲染，如何确定状态中发生了什么变化？
- 有两种变化侦测的类型：“推”（push）和“拉”（pull）
- Angular 和 React 的变化侦测都属于“拉”，状态可能变了，就发送信号告诉框架，框架进行暴力比对找出需要重新渲染的 DOM 节点。Angular 中是脏检查，React 中用的是虚拟 DOM。
- Vue.js 的变化侦测属于“推”。当状态发生变化时，Vue.js 立刻就知道了，而且在一定程度上知道哪些状态变了。因此，它知道的信息更多，也就可以进行更细粒度的更新。
- 但是粒度越细，依赖追踪的内存开销越大。因此，从 Vue.js 2.0 开始，它引入了虚拟 DOM，将粒度调整为中等粒度，即**一个状态所绑定的依赖不再是具体的 DOM 节点，而是一个组件**。这样状态变化后，会通知到组件，组件内部再使用虚拟 DOM 进行比对。

## 2.2 如何追踪变化

- 侦测对象的变化：Object.defineProperty 和 ES6 的 Proxy

```js
function defineReactive(data, key, val) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
    },
  });
}
```

## 2.3 如何收集依赖

- 之所以要观察数据，是当数据的属性发生变化时，可以通知哪些曾经使用了该数据的地方
- 如下代码中，当 name 变化时，要向使用 name 的地方发送通知：

```html
<template>
  <h1>{{ name }}</h1>
</template>
```

- 在 Vue.js2.0 中，**模板使用数据等同于组件使用数据。数据发生变化，会通知到组件，组件内部再通过虚拟 DOM 重新渲染。**

- 将依赖收集起来，等属性变化时，依次触发。**在 getter 中收集依赖，在 setter 中触发依赖**

## 2.4 依赖收集在哪里

- 收集到 Dep 类中，使用时 new 一个实例，一个 dep 数组用来保存依赖
- 假设依赖是一个函数，保存在 window.target 上

```js
function defineReactive(data, key, val) {
  let dep = new Dep(); // 修改
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend(); // 修改
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
      dep.notify(); // 新增
    },
  });
}
```

- 解耦合，将依赖收集的代码封装成一个 Dep 类，专门用来管理依赖。包括收集、删除依赖，向依赖发送通知

```js
export default class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    remove(this.subs, sub);
  }

  depend() {
    if (window.target) {
      this.addSub(window.target);
    }
  }

  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update(); // update在Watcher类中
      // subs[i]就是window.target
    }
  }
}

function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
```

## 2.5 依赖是谁

- 收集的依赖是谁？就是当属性发生变化后，通知谁。
- 前面说到需要通知使用数据的地方，但是使用数据的地方很多，而且类型还不一样。可能是模板，也可能是用户写的 watch。那么就需要抽象出一个能集中处理这些情况的类。然后，在依赖收集阶段只收集这个封装好的类的实例，通知也只通知它。然后它再通知其他地方。这个就是 Watcher。

## 2.6 什么是 Watcher

- ？？？
- Watcher 是一个中介的角色，数据发生变化时通知它，然后它再通知其他地方。

- 使用 watcher：

```js
// keypath
vm.$watch("a.b.c", function (newVal, oldVal) {
  // 做点什么
});
```

```js
export default class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    // 执行this.getter()，就可以读取data.a.b.c的内容
    this.getter = parsePath(expOrFn); // parsePath返回函数
    this.cb = cb;
    this.value = this.get();
  }

  get() {
    // window.target 是要通知的部分，前面假设依赖放在window.target上
    // 在get方法中先把window.target设置成了this，也就是当前watcher实例，就会有update方法
    window.target = this;
    // 获取到data.a.b.c的值
    let value = this.getter.call(this.vm, this.vm);
    window.target = undefined;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    // cb就是传入的回调
    this.cb.call(this.vm, this.value, oldValue);
  }
}
```

```js
/**
 * 解析简单路径
 */
const bailRE = /[^\w.$]/;
export function parsePath(path) {
  if (bailRE.test(path)) {
    return;
  }
  const segments = path.split(".");
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}
```

## 2.7 递归侦测所有 key

- 封装 Observer 类：将一个数据内的所有属性（包括子属性）都转换成 getter/setter 的形式，然后去追踪它们的变化

```js
/**
 * Observer类会附加到每一个被侦测的object上。
 * 一旦被附加上，Observer会将object的所有属性转换为getter/setter的形式
 * 来收集属性的依赖，并且当属性发生变化时会通知这些依赖
 */
export class Observer {
  constructor(value) {
    this.value = value;

    if (!Array.isArray(value)) {
      this.walk(value);
    }
  }

  /**
   * walk会将每一个属性都转换成getter/setter的形式来侦测变化
   * 这个方法只有在数据类型为Object时被调用
   */
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }
}

function defineReactive(data, key, val) {
  // 新增，递归子属性
  if (typeof val === "object") {
    new Observer(val);
  }
  let dep = new Dep();
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend();
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }

      val = newVal;
      dep.notify();
    },
  });
}
```

## 2.8 关于 Object 的问题

- getter/setter 只能追踪一个数据是否被修改，无法追踪新增属性和删除属性
- vm.$set与vm.$delete 两个 API 用于解决此问题

## 2.9 总结

- 变化侦测就是侦测数据的变化。当数据发生变化时，要能侦测到并发出通知。
- Object 可以通过 Object.defineProperty 将属性转换成 getter/setter 的形式来追踪变化。读取数据时会触发 getter，修改数据时会触发 setter。
- 我们需要在 getter 中收集有哪些依赖使用了数据。当 setter 被触发时，去通知 getter 中收集的依赖数据发生了变化。
- 收集依赖需要为依赖找一个存储依赖的地方，为此我们创建了 Dep，它用来收集依赖、删除依赖和向依赖发送消息等。
- 所谓的依赖，其实就是 Watcher。只有 Watcher 触发的 getter 才会收集依赖，哪个 Watcher 触发了 getter，就把哪个 Watcher 收集到 Dep 中。当数据发生变化时，会循环依赖列表，把所有的 Watcher 都通知一遍。
- Watcher 的原理是先把自己设置到全局唯一的指定位置（例如 window.target），然后读取数据。因为读取了数据，所以会触发这个数据的 getter。接着，在 getter 中就会从全局唯一的那个位置读取当前正在读取数据的 Watcher，并把这个 Watcher 收集到 Dep 中去。通过这样的方式，Watcher 可以主动去订阅任意一个数据的变化。
- 此外，我们创建了 Observer 类，它的作用是把一个 object 中的所有数据（包括子数据）都转换成响应式的，也就是它会侦测 object 中所有数据（包括子数据）的变化

# 第 3 章 Array 的变化侦测

- `this.list.push(1)`数组的 push 操作不会触发 getter/setter

## 3.1 如何追踪变化

- ES6 之前，JS 没有元编程的能力，也就是没有提供可以拦截原型方法的能力。可以用自定义的方法覆盖原生的原型方法。

- 用一个拦截器覆盖 Array.prototype，每当使用 Array 原型上的方法操作数组时，实际执行的是拦截器中提供的方法，然后在拦截器中使用原生 Array 的原型方法操作数组。

## 3.2 拦截器

- 处理可以改变数组自身内容的方法，包括：push、pop、shift、unshift、splice、sort 和 reverse

```js
const arrayProto = Array.prototype;
// 创建一个新对象arrayMethods，原型是arrayProto
export const arrayMethods = Object.create(arrayProto);
["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(
  function (method) {
    // 缓存原始方法
    const original = arrayProto[method];
    Object.defineProperty(arrayMethods, method, {
      value: function mutator(...args) {
        // 执行original，实现本来的功能
        return original.apply(this, args);
      },
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }
);
```

## 3.3 使用拦截器覆盖 Array 原型

- 拦截操作只覆盖响应式数组的原型，不能污染全局的 Array
- 将一个数据转换成响应式，需要通过 Observer，所以在 Observer 中使用拦截器覆盖即将被转换成响应式 Array 类型数据的原型。

```js
export class Observer {
  constructor(value) {
    this.value = value;
    if (Array.isArray(value)) {
      // 将拦截器赋值给value.__proto__
      value.__proto__ = arrayMethods; // 新增
    } else {
      this.walk(value);
    }
  }
}
```

- `__proto__` 其实是 Object.getPrototypeOf 和 Object.setPrototypeOf 的早期实现

## 3.4 将拦截器的方法挂载到数组的属性上

- 需要处理不能使用`__proto__`的情况
- 不支持时调用 copyAugement 函数将拦截器中的方法挂载到 value 上，实际使用时执行的就是拦截器中的方法，而不是 Array.prototype 上的方法

```js
import { arrayMethods } from "./array";

// __proto__ 是否可用
const hasProto = "__proto__" in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

export class Observer {
  constructor(value) {
    this.value = value;

    if (Array.isArray(value)) {
      // 修改
      const augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);
    } else {
      this.walk(value);
    }
  }

  // ……
}
// 这个方法作用和前面说的一样，就是value.__proto__ = arrayMethods;
function protoAugment(target, src, keys) {
  target.__proto__ = src;
}
// keys是需要处理的方法名称数组
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    // def ??? 还没说具体作用
    def(target, key, src[key]);
  }
}
```

## 3.5 如何收集依赖

- 不管 value 是什么，要向在一个 Object 中得到某个属性的数据，肯定要通过 key 来读取 value
- 因此，在读取`this.list`时，肯定会触发名字叫做 list 的属性的 getter
- 所以 Array 的依赖和 Object 一样，也在 defineReactive 中收集
- 所以，Array 在 getter 中收集依赖，在拦截器中触发依赖。

## 3.6 依赖列表存在哪里

- Vue.js 把 Array 的依赖存放在 Observer 中。
- 因为在 getter 中和 Array 拦截器中都能够访问到 Observer 实例。

```js
export class Observer {
  constructor(value) {
    this.value = value;
    // 在Observer类中增加dep
    this.dep = new Dep(); // 新增dep

    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);
    } else {
      this.walk(value);
    }
  }

  // ……
}
```

## 3.7 收集依赖

```js
function defineReactive(data, key, val) {
  let childOb = observe(val); // 修改
  let dep = new Dep();
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      dep.depend();

      // 新增
      if (childOb) {
        childOb.dep.depend();
      }
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }

      dep.notify();
      val = newVal;
    },
  });
}

/**
 * 尝试为value创建一个Observer实例，
 * 如果创建成功，直接返回新创建的Observer实例。
 * 如果value已经存在一个Observer实例，则直接返回它
 */
export function observe(value, asRootData) {
  if (!isObject(value)) {
    return;
  }
  let ob;
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob;
}
```

## 3.8 在拦截器中获取 Observer 实例

- 距离上次学习又过去了一段时间，前面的又不太记得了，这时一个连贯的学习过程，中间如果打断了，再重新学习就很难接上了！！！
- 难啊！！！加油啊！！！

```js
// 工具函数
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

export class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();
    def(value, "__ob__", this); // 新增

    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);
    } else {
      this.walk(value);
    }
  }

  // ……
}
```

- dep 保存在 Observer 中的，所以需要在 this 上读到 Observer 的实例
- def 看源码是一个工具函数，就是调用 Object.defineProperty
- `def(value, "__ob__", this);` 在 value 上新增一个不可枚举的属性`__ob__`，属性的值就是当前 Observer 的实例
- 这样就可以通过数组数据的`__ob__`属性拿到 Observer 实例，然后就可以拿到`__ob__`上的 dep 了
- `__ob__`还可以用来标记当前 value 是否已经被 Observer 转换成了响应式数据

## 3.9 向数组的依赖发送通知

```js
["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(
  function (method) {
    // 缓存原始方法
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__; // 这里就是上一节中的代码实现了在拦截器中拿到Observer实例，进一步就可以拿到dep
      ob.dep.notify(); // 向依赖发送消息
      return result;
    });
  }
);
```

## 3.10 侦测数组中元素的变化

- 除了侦测数组自身变化（增删元素），还需要侦测数组中元素的变化
- 要侦测响应式数据的所有子数据

```js
export class Observer {
  constructor(value) {
    this.value = value;
    def(value, "__ob__", this);

    // 新增 是数组就循环处理
    if (Array.isArray(value)) {
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  /**
   * 侦测Array中的每一项
   */
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      // 这里就是将数组中的每个元素都执行一遍new Observer
      observe(items[i]);
    }
  }

  // ……
}
```

## 3.11 侦测新增元素的变化

- 获取新增的元素并使用 Observer 来侦测即可

### 3.11.1 获取新增元素

- 在拦截器中进行判断，如果是可以新增数组元素的方法（push、unshift、splice），就监测新增的元素

### 3.11.2 使用 Observer 侦测新增元素

```js
["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(
  function (method) {
    // 缓存原始方法
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
      const result = original.apply(this, args);
      const ob = this.__ob__;
      // 判断方法，将新增元素存储起来
      let inserted;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
          inserted = args.slice(2);
          break;
      }
      // 对新增元素执行observeArray方法
      if (inserted) ob.observeArray(inserted); // 新增
      ob.dep.notify();
      return result;
    });
  }
);
```

## 3.12 关于 Array 的问题

- 对 Array 的变化侦测是通过拦截原型的方式实现的，所以有些操作是拦截不到的
- `this.list[0] = 2`或`this.list.length = 0`

# 第 4 章 变化侦测相关的 API 实现原理

## 4.1 vm.$watch

### 4.1.2 watch 的内部原理

```js
Vue.prototype.$watch = function (expOrFn, cb, options) {
  const vm = this;
  options = options || {};
  const watcher = new Watcher(vm, expOrFn, cb, options);
  if (options.immediate) {
    cb.call(vm, watcher.value);
  }
  return function unwatchFn() {
    watcher.teardown();
  };
};
```

- expOrFn 参数支持函数。如果 expOrFn 是函数，则直接赋值给 getter，如果不是函数，使用 parsePath 读取 keypath 中的数据。

```js
export default class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    // expOrFn参数支持函数
    if (typeof expOrFn === "function") {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
    }
    this.cb = cb;
    this.value = this.get();
  }
}
```

- Watcher 中添加 teardown 方法实现 unwatch 功能
- 首先，需要在 Watcher 中记录自己都订阅了谁
