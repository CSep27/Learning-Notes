import Dep from "./2-dep";

function defineReactive(data, key, val) {
  // let dep = []; // 存储被收集的依赖
  let dep = new Dep(); // 存储被收集的依赖
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      // dep.push(window.target);
      dep.depend();
      return val;
    },
    set: function (newVal) {
      if (val === newVal) {
        return;
      }
      // for (let index = 0; index < dep.length; index++) {
      //   // 数据变化了，循环触发依赖
      //   dep[index](newVal, val);
      // }
      val = newVal;
      dep.notify();
    },
  });
}
