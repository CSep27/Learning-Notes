Vue3.0 响应式由 Object.defineProperty 改为 Proxy 实现，因为前者无法监听到对象上增删属性的变化

# Vue3.0 composition API

- reactive 和 ref 类似，不同的是接受一个对象作为参数，并且会深度遍历这个对象，对各个属性进行拦截
- ref 将一个基本类型的值作为入参，然后返回一个响应式并包含一个 value 属性的对象
- readonly 只读，set 操作时返回警告，不能进行写操作

- computed 计算属性，基于内部的响应式依赖进行缓存，只有在相关响应式依赖发生改变时才会重新求值
  ```js
  let x = computed(() => count.value + 3);
  ```
- watchEffect 数据变化时立即变化，执行后返回一个函数（stop：停止监听数据变化）
- watch 监听数据变化，并在回调函数中返回数据变更前后的两个值；用于在数据变化后执行异步操作或者开销较大的操作
