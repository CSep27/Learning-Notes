let uid = 0;

function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

export default class Dep {
  constructor() {
    this.id = uid++;
    // 观察者，也就是订阅者，发生变化时要通知哪些人
    this.subs = [];
  }

  // 添加观察者
  addSub(sub) {
    this.subs.push(sub);
  }

  // 删除观察者
  removeSub(sub) {
    remove(this.subs, sub);
  }

  // Dep.target 就是watcher实例
  // 建立watcher观察者和目标之间的联系
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  // 目标变动了，通知观察者，
  // 执行观察者的update方法，
  notify() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }
}

// 全局一次只有一个观察者
Dep.target = null;
