## 响应式

- 是一种面向数据流和变化传播的编程范式。这意味着可以在编程语言中很方便地表达静态或动态的数据流，而相关的计算模型会自动将变化的值通过数据流进行传播。

- Vue 2+ 版本基于 Object.defineProperty 实现数据双向绑定，即数据变化时，视图也变化。
- Object.defineProperty 用法：

```js
let obj = {};
Object.defineProperty(obj, "value", {
  get() {
    return 1;
  },
  set(newValue) {
    console.log("set");
    value = newValue;
  },
});
// 控制台
// obj.value => 1
// obj.value = 2 => set
```

- 假设以 x 和 y 表示，当 x 改变时，y 也相应变化

```js
let ref = (initValue) => {
  let value = initValue;
  return Object.defineProperty({}, "value", {
    get() {
      return value;
    },
    set(newValue) {
      value = newValue;
      active(); // x变化时触发y变化
    },
  });
};
// 将x转换成可以监听变化的对象
let x = ref(1);
// 当x变化时，y相应改变（f函数模拟变化）
let f = (n) => n * 100 + 100;
let active;
let watch = (cb) => {
  active = cb;
  active(); // 开始时触发一次
};
watch(() => {
  y = f(x.value);
  console.log(y);
});
x.value = 2; // 300
```

- 现在如果 x 的变化也会引起 z 的变化，那么就再需要增加一个 active
- 因此，由于一个变量的修改会涉及到模板中多处的变化，**需要将依赖变量的地方收集起来，等更新时批量操作**
  ![依赖收集.png](./images/依赖收集.png)
- 增加一个用来收集依赖的类 Dep

```js
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
```

- 改造一下 watch 函数，避免重复收集
- 在 get 中收集依赖，在 set 中触发
- 最终实现：

```js
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
// 当X变化时，引起y和z的变化，一个变化引发多个变化
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
```
