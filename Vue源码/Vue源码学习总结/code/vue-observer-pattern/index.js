import { observe } from "./observer.js";
import watch from "./watch.js";
// 简单的观察者效果
const data = {
  test: 1,
};
observe(data);
// 传入vm是为了获取到data，这里简化直接传data
watch(data, "test", (newValue, oldValue) => {
  console.log(newValue, oldValue);
  console.log(data.test);
});

setTimeout(() => {
  data.test = 2;
}, 100);
