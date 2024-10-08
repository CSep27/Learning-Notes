// 假如x变化，y和z都要变化
let x;
let y;
let z;
let fy = (n) => n * 100 + 100;
let fz = (n) => n + 1;

let active;
let watch = (cb) => {
  active = cb;
  active();
  active = null; // 避免重复收集
};
// 当x变化时，引起y和z的变化，一个变化引发多个变化
class Dep {
  constructor() {
    // Set 数据结构 类似于数组，但成员都是唯一的
    // 通过new生成Set数据结构
    this.deps = new Set();
  }
  depend() {
    // 依赖收集
    if (active) {
      // 通过add()方法向Set结构加入成员
      this.deps.add(active);
    }
  }
  notify() {
    // 触发
    this.deps.forEach((dep) => dep());
  }
}
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
      dep.notify();
    },
  });
};

x = ref(1);
watch(() => {
  y = fy(x.value);
  console.log(y);
});
watch(() => {
  z = fz(x.value);
  console.log(z);
});

x.value = 2;
/*
控制台打印
200
2
300
3
*/
