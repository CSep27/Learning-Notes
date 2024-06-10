import Dep from "./dep.js";

function queueWatcher(watcher) {
  // 先加入队列，在合适时机循环队列执行
  watcher.run();
}
// 通过parsePath处理返回一个函数，赋值给this.getter，统一为函数
function parsePath(path) {
  const segments = path.split("."); // vue中支持观察a.b形式的数据
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

export default class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm;

    this.deps = []; // 存储订阅的目标
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();

    this.cb = cb;
    if (typeof expOrFn === "function") {
      this.getter = expOrFn;
    } else {
      // 通过parsePath处理返回一个函数，将this.getter统一为函数
      this.getter = parsePath(expOrFn);
    }

    // 先把目标的旧值存储下来，当目标值更新时，进行比较。
    this.value = this.get();
  }

  get() {
    // vue中处理多个watcher时，先放到栈中，依次处理，后面每次拿出一个赋值给Dep.target
    // pushTarget(this);
    // v1版本简化只放一个，把当前watcher给全局Dep.target 用来存储当前的观察者，一次只有一个全局观察者
    Dep.target = this;
    let value;
    const vm = this.vm; // 在vue中，vm是实例对象，为了拿到data
    try {
      // 这里去获取data.test值时，就会触发getter函数，执行dep.depend()
      value = this.getter.call(vm, vm);
    } catch (e) {
    } finally {
      this.cleanupDeps();
    }
    return value;
  }

  addDep(dep) {
    // Dep类的实例 和 Watcher 类的实例建立联系
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep); // 观察者订阅目标，和目标建立联系 观察者 -> 目标
      if (!this.depIds.has(id)) {
        dep.addSub(this); // 目标把观察者加入到订阅者中，目标和观察者建立了联系 观察者 <- 目标
      }
    }
  }
  cleanupDeps() {
    // 判断deps中有的目标，在newDeps中没有了，那么移除订阅，然后把newDeps中的内容放到deps中，清空newDeps
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

  update() {
    queueWatcher(this);
  }

  run() {
    const value = this.get(); // 目标更新的时候执行，去拿更新后的值
    const oldValue = this.value;
    this.cb(value, oldValue);
  }
}
