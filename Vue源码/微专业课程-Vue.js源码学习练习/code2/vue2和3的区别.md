注：

- 重新看微专业课程，将 vue2 和 vue3 放在一起比较学习
- code2 存放练习和临时笔记

# 响应式的区别

## vue2

`observe(vm._data = {}, true /* asRootData */)`

是以组件为粒度，将组件中 data 函数返回的对象`vm._data`，传入 observe 函数中。
在 observe 函数中，`vm._data`就是执行 Object.defineProperty 方法传入的 obj，key 就是`vm._data`的属性，通过一个循环依次调用 Object.defineProperty，如果属性的值还是对象，那么就会继续深度执行。

`Object.defineProperty(obj, key, {})`

所以就是放在 data 里的都是响应式数据了，所以就会有一个优化方法是，不需要响应式数据的不要放到 data 上

## vue3

### ref

vue2 中，访问则是`this.x`，或是在模板中直接使用`{{ x }}`

```js
export default {
  data() {
    return {
      x: 1,
    };
  },
};
```

vue3 中：`const x = ref(1)`，ref 函数将传入的 1 这种初始值放到了 x 响应式对象的 value 属性上，返回的 x 本身是一个响应式对象了。访问值要通过`x.value`，而在模板中 vue 做了处理，可以直接用`{{ x }}`。

因此非响应式数据，就正常写，响应式数据就传入 ref 中包裹一层，使用返回的变量，并且通过 value 获取。当给 ref 传入对象时，通过`obj.value`才能访问到传入的对象，再通过`obj.value.nested`访问属性

并且传入的对象具有深层响应性，也就是执行`obj.value.nested.count++;`可以直接修改该响应式对象的值，触发变化。

```js
import { ref } from "vue";

const obj = ref({
  nested: { count: 0 },
  arr: ["foo", "bar"],
});

function mutateDeeply() {
  // 以下都会按照期望工作
  obj.value.nested.count++;
  obj.value.arr.push("baz");
}
```

vue2 中，向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新。需要调用`Vue.set`

### reactive

reactive() 返回的是一个原始对象的 Proxy，它和原始对象是不相等的。

只有代理对象是响应式的，更改原始对象不会触发更新。

当 ref 的值是一个对象时，ref()在内部会调用 reactive。

ref 是将内部值包装在特殊对象中，需要通过 value 访问。reactive 是直接让对象有响应性。如下示例：

```vue
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <button @click="increment">count: {{ count }}</button>
    <button @click="incrementRefObj">refObj count: {{ refObj.count }}</button>
    <button @click="incrementStateCount">state.count: {{ state.count }}</button>
  </div>
</template>

<script setup>
/* <script setup> 中的顶层的导入、声明的变量和函数可在同一组件的模板中直接使用 */
import { ref, reactive } from "vue";
const count = ref(0);
const refObj = ref({ count: 0 });
const state = reactive({ count: 0 });
function increment() {
  count.value++;
}
function incrementRefObj() {
  refObj.value.count++;
}
function incrementStateCount() {
  state.count++;
}
</script>
```

## 响应式实现思路

- 11.html 响应式是什么样子
- 12.html 实现一对一和一对多的响应式（目标对应订阅者）
- 13.html 实现多对一和多对多的响应式，使用微任务和队列

# computed

- 用户传入一个 getter 函数，函数中的响应式变量变化时，才重新计算值
- 否则都使用缓存值，函数不会
