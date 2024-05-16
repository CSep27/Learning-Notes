import Dep from "./dep.js";

function queueWatcher(watcher) {
  // 先加入队列，在合适时机循环队列执行
  watcher.run();
}

function parsePath(path) {
  const segments = path.split(".");
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

    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();

    this.cb = cb;
    if (typeof expOrFn === "function") {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
    }

    // 为了存储旧值。
    this.value = this.get();
  }

  get() {
    // pushTarget(this);
    // 把当前watcher给全局Dep.target
    Dep.target = this;
    let value;
    const vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
    } finally {
      this.cleanupDeps();
    }
    return value;
  }

  addDep(dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }
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

  update() {
    queueWatcher(this);
  }

  run() {
    const value = this.get();
    const oldValue = this.value;
    this.cb(value, oldValue);
  }
}
