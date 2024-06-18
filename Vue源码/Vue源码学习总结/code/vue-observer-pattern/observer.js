import Dep from "./dep.js";

function defineReactive(obj, key, val) {
  const dep = new Dep();

  if (arguments.length === 2) {
    val = obj[key];
  }

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = val;
      if (Dep.target) {
        dep.depend();
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = obj[key];
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return;
      }
      val = newVal;
      // 值更新了，通知观察者
      dep.notify();
    },
  });
}

export class Observer {
  constructor(value) {
    this.value = value;
    // this.dep = new Dep();
    // this.vmCount = 0;
    // def(value, "__ob__", this);
    this.walk(value);
  }

  // 将obj变成响应式对象
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}

export function observe(value) {
  let ob;
  ob = new Observer(value);
  return ob;
}
