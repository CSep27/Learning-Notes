// 将x转换成可以监听变化的对象
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
