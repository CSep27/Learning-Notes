# 观察者——对象行为型模式

《设计模式：可复用面向对象软件的基础》书中，观察者模式有两个别名：依赖（Dependents）、发布-订阅（Publish-Subscribe）

## 意图

定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。

## 举例解释

有一个表格、一个柱状图、一个饼状图，有一份数据。这三个图都展示的是这个数据的统计内容。

三个图对象互相并不知道对方的存在，所以可以单独使用。如果修改了数据的内容那么三个图的内容会立即更改。

这说明这三个图对象，都依赖于数据对象。数据对象的任何状态变更都需要通知这三个对象。

在初始时这三个对象需要订阅数据对象，以便于数据对象变更时通知这三个对象。

观察者模式描述了如何建立这种关系。这一模式中的关键对象是目标和观察者。一个目标可以有任意数目的依赖他的观察者。

## 参与者

1. 目标 Subject

- 目标知道他的观察者。可以有任意多个观察者观察同一个目标。
- 提供注册和删除观察者对象的接口。
  - Attach(Observer)
  - Deattach(Observer)
  - notify()

2. 观察者 Observer

- 为那些在目标发生改变时需获得通知的对象定义一个更新接口。
  - update()

3. 具体目标 ConcreteSubject

- 将有关状态存入各 ConcreteObserver 对象。
- 当他的状态发生改变时，向他的各个观察者发出通知。
  - GetState()
  - SetState()
  - subjectState

4. 具体观察者 ConcreteObserver

- 维护一个指向对象的引用。
- 存储有关状态，这些状态应与目标的状态保持一致。
- 实现 Observer 更新接口，以使自身状态与目标的状态保持一致。
  - observerState

## 实现（部分）

1. 谁触发更新
   a. 由目标对象的<状态设定操作>在改变目标对象的状态后，自动调用 Notify。优点是，客户不需要记住要在目标对象上调用。缺点是多个连续的操作会产生多次连续的更新。可能效率较低。

2. 避免特定于观察者的更新协议——推/拉模型
   a. 推模型：目标向观察者发送关于改变的详细信息。不管他们需要与否。
   b. 拉模型：目标除最小通知外什么也不发出。在此之后由观察者显式的向目标询问细节。

3. 封装复杂的更新语义
   当目标和观察者间的依赖关系特别复杂时，可能需要一个维护这些关系的对象。我们称这样的对象为更改管理器（ChangeMangager）。它的目的是尽量减少观察者反映其目标的状态变化所需的工作量。例如，如果一个操作涉及到对几个相互依赖的目标进行改动。就必须保证仅在**所有的**目标都已更改完毕后才一次性的通知他们的观察者。而不是每个目标都通知观察者。

# 观察者模式与发布订阅模式区别

《深入浅出 Vue.js》书中以及在其他地方看到说这两种模式有区别

## 观察者模式

- 面向接口编程，松耦合
- 被观察者（Subject）
- 观察者（Observer）

- Observer 实现相同的接口，Subject 通知 Observer 时，调用统一方法

## 发布订阅模式

- 完全解耦
- 发布者 Publisher
- 订阅者 Subscriber

- 发布者不会直接通知订阅者，而是通过第三者经纪人 Broker
- 发布者只需告诉 Broker，我要发的消息，topic 是 AAA；
- 订阅者只需告诉 Broker，我要订阅 topic 是 AAA 的消息；
- 于是，当 Broker 收到发布者发过来消息，并且 topic 是 AAA 时，就会把消息推送给订阅了 topic 是 AAA 的订阅者。当然也有可能是订阅者自己过来拉取，看具体实现。

# Vue 观察者模式

1. 观察对象 Subject 通过自己内部的通知函数，调用所有观察者列表中观察者对应的回调函数，达到通知观察者的目的。
2. 观察者（Observer）通过调用观察者对象（Subject）中的添加方法，把自己的回调函数传入

## Dep

- `A dep is an observable that can have multiple directives subscribing to it.` 一个 dep 是一个可以有多个指令订阅的可观察对象
- Dep 就是被观察者 Subject

- 收集依赖的意思是，建立被观察者和观察者之间的依赖关系。

- Dep.target：正在被计算的当前目标 watcher（观察者），这个 watcher 是全局唯一的，因为任何时候只能有唯一一个正在被计算的 watcher

```js
// src/core/observer/dep.js
/* @flow */

import type Watcher from "./watcher";
import { remove } from "../util/index";

let uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  // Watcher 观察者，订阅者
  subs: Array<Watcher>;

  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  // 给观察者提供的方法，用于watcher调用，建立依赖关系
  // 添加观察者
  addSub(sub: Watcher) {
    this.subs.push(sub);
  }

  removeSub(sub: Watcher) {
    remove(this.subs, sub);
  }
  // 添加依赖，就是建立和watcher之间的联系
  // Dep.target 是watcher实例，
  // 调用watcher.addDep，建立依赖关系
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}
// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
const targetStack = [];

// 在Watcher类的get方法中调用，传入Watcher类实例
// 建立被观察者和观察者之间的关系？
// Dep 被观察者的构造函数，有个target属性，存储的是当前的watcher实例
export function pushTarget(_target: Watcher) {
  if (Dep.target) targetStack.push(Dep.target);
  Dep.target = _target;
}

export function popTarget() {
  Dep.target = targetStack.pop();
}
```

## Watcher

- 一个观察者 watcher 解析一个表达式，收集依赖，并且当表达式的值改变时，触发回调。
- 也被用于$watch() API 和指令

```js
// src/core/observer/watcher.js
/* @flow */

import { queueWatcher } from "./scheduler";
import Dep, { pushTarget, popTarget } from "./dep";

import {
  warn,
  remove,
  isObject,
  parsePath,
  _Set as Set,
  handleError,
} from "../util/index";

import type { ISet } from "../util/index";

let uid = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: ISet;
  newDepIds: ISet;
  getter: Function;
  value: any;

  constructor(
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ) {
    this.vm = vm;
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.expression =
      process.env.NODE_ENV !== "production" ? expOrFn.toString() : "";
    // parse expression for getter
    if (typeof expOrFn === "function") {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = function () {};
        process.env.NODE_ENV !== "production" &&
          warn(
            `Failed watching path: "${expOrFn}" ` +
              "Watcher only accepts simple dot-delimited paths. " +
              "For full control, use a function instead.",
            vm
          );
      }
    }
    this.value = this.lazy ? undefined : this.get();
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get() {
    pushTarget(this);
    let value;
    const vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`);
      } else {
        throw e;
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }

  // 观察者提供的方法，用于与被观察者建立关系
  /**
   * Add a dependency to this directive.
   */
  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  /**
   * Clean up for dependency collection.
   */
  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run() {
    if (this.active) {
      const value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value;
        this.value = value;
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            handleError(
              e,
              this.vm,
              `callback for watcher "${this.expression}"`
            );
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  /**
   * Depend on all deps collected by this watcher.
   */
  depend() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   */
  teardown() {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      let i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  }
}
```

## Observer

- 附加到每个被观察对象的 Observer（观察者）类。
- 一旦添加上，observer 观察者将目标对象的属性名转换为收集依赖和触发更新的 getter/setters

```js
/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
class Observer {}
```

- 就是将对象的变成响应式对象，处理了数组和对象两种情况
- 导出 observe 方法，在需要转换为响应式对象的地方调用
- 搜索可以看到在 initData 方法中调用了，将 data 转换为响应式对象
- observe 方法内部会`new Observer(value)`

- observe 的注释：

```js
/* Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one. */
```

- 尝试给一个 value 创建一个 observer 实例，如果成功创建了，返回新的 observer 实例，如果本来就有那么返回已经存在的实例

- 导出的 set 和 del 方法，就是实例方法`this.$set`和`this.$delete`的实现

```js
/* @flow */

import Dep from "./dep";
import VNode from "../vdom/vnode";
import { arrayMethods } from "./array";
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isValidArrayIndex,
  isServerRendering,
} from "../util/index";

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
export const observerState = {
  shouldConvert: true,
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor(value: any) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    // 调用Object.defineProperty
    def(value, "__ob__", this);
    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk(obj: Object) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      // 将对象变为响应式对象
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray(items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }
}

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment(target, src: Object, keys: any) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment(target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe(value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }
  let ob: Observer | void;
  // 判断value已经有"__ob__"属性了，并且该属性是Observer的实例
  // 就是已经存在的情况
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive(
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep();

  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get;
  const setter = property && property.set;
  // shallow 表示浅，true就表示子元素不转换为响应式
  // false就表示要进行操作，对子元素进行观察
  let childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend(); // 收集依赖
        if (childOb) {
          childOb.dep.depend();
          // 如果value 是数组，还要进行处理
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== "production" && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    },
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set(target: Array<any> | Object, key: any, val: any): any {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  if (hasOwn(target, key)) {
    target[key] = val;
    return val;
  }
  const ob = (target: any).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== "production" &&
      warn(
        "Avoid adding reactive properties to a Vue instance or its root $data " +
          "at runtime - declare it upfront in the data option."
      );
    return val;
  }
  if (!ob) {
    target[key] = val;
    return val;
  }
  defineReactive(ob.value, key, val);
  ob.dep.notify();
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del(target: Array<any> | Object, key: any) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }
  const ob = (target: any).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== "production" &&
      warn(
        "Avoid deleting properties on a Vue instance or its root $data " +
          "- just set it to null."
      );
    return;
  }
  if (!hasOwn(target, key)) {
    return;
  }
  delete target[key];
  if (!ob) {
    return;
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray(value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}
```

## 总结

普通情况下，数据 data 是目标，视图是观察者，data 变化，通知视图变化。

初始化时，建立目标和观察者的联系，用到了三个类，Dep Observer Watcher。

- Dep 用于管理目标，提供接口方法
- Observer 主要用 data 变成响应式
- Watcher 用于管理观察者，提供接口方法

除了视图是观察者，搜索源码能看到，`new Watcher()`出现在三个地方：

1. mount => mountComponent => `new Watcher()` isRenderWatcher = true
   是渲染 watcher。挂载时才需要创建，因为挂载意味着有视图，也就是需要渲染了。
2. initComputed => watchers[key] = new Watcher()
   给 computed 属性创建内部 watcher，因为 computed 属性其实就是观察内部依赖的目标有没有变化，如果变化了，computed 属性就要变化。如下，观察 a 和 b（目标），变化了，则需要通知 countNum 变化
   ```js
   computed: {
     countNum() {
       return this.a + this.b;
     }
   }
   ```
3. Vue.prototype.$watch => const watcher = new Watcher()
   也就是用户手动添加 watcher
   ```js
   watch: {
      message(newValue, oldValue) {
        console.log(newValue, oldValue);
      }
   }
   ```

---

目标初始化过程：

initData 方法中 => 执行 observe 方法`const ob = observe(data)`，返回的 ob 是 Observer 类的实例 => 在 observe 方法中执行了`new Observer(value)` => 实例化 Observer 类会调用 defineReactive 方法 => defineReactive 方法执行时，1. `new Dep()`；2. 调用 defineProperty（get set）=> get 中调用了 dep.depend 收集依赖，set 中调用了 dep.notify 触发更新

---

观察者初始化过程：

mount => mountComponent => `new Watcher()` => `this.value = this.get()` => 1. `pushTarget(this)`把当前 watcher 存入了 targetStack 栈中；2. 获取 data 当前的值存储在 watcher 的 value 中 => 触发了 defineProperty 的 get 函数 => 执行`dep.depend()`，目标 dep 的 subs 存入了当前观察者，观察者 watcher 的 deps 里存入了当前的目标 dep，相互之间建立了联系

---

更改数据后触发 setter，通知视图（渲染 watcher）更新过程：

在 setter 函数中调用 Dep.notify => Watcher.update => 需要在微任务里执行，中间封装了很多方法，用 Promise.then => flushSchedulerQueue => Watcher.run => Watcher.get => this.getter => expOrFn 也就是 watcher.expression => `vm._update(vm._render(), hydrating);` 就是视图更新的方法

`vm._render()` => 内部调用 render 方法生成 vnode：`vnode = render.call(vm._renderProxy, vm.$createElement);` => 生成的 vnode 作为`vm._update`的参数 => `vm._update`内部调用 `vm.$el = vm.__patch__(prevVnode, vnode);` => 进行新旧 vnode 比较之后返回`function patch(oldVnode, vnode, hydrating, removeOnly)` => 最终返回`vm.$el`，也就是实际的 DOM 元素

```js
// Watcher实例
/* const watcher = {
  depIds: Set{},
  deps: [Dep, Dep],
  newDepIds: Set{},
  newDeps: [Dep, Dep],
  expression: 'function () {\n      vm._update(vm._render(), hydrating);\n    }'
} */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get();
  }
};
Watcher.prototype.get = function () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {}
};
// 在watcher构造函数中，也就是初始化时定义了 this.getter
if (typeof expOrFn === "function") {
  this.getter = expOrFn;
} else {
  this.getter = parsePath(expOrFn);
}
```
