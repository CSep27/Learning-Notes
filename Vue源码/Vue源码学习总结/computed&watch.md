感觉没必要比较这两个，搞清楚各自的原理和使用场景即可

# computed

不能和 data 中的变量重名

reversedMessage 的值是根据 message 计算之后的值得到的，初次渲染时，会触发一次函数，打印"reversedMessage computed"。

message 是目标，会创建 computed 内部观察者观测目标的变化。若目标改变，执行 reversedMessage 函数，重新结算值赋给 reversedMessage

假如 content 变量值变化，reversedMessage 没有依赖于 content，函数不会触发，组件渲染过程中直接用上次缓存的值

假如 message 变量值变成了"msg"，reversedMessage 依赖于 message，函数会触发，打印"reversedMessage computed"，重新计算 reversedMessage 的值，更新。

computed 函数里不支持写异步逻辑。

```vue
<template>
  <div id="example">
    <p>{{ content }}</p>
    <p>Original message: "{{ message }}"</p>
    <p>Computed reversed message: "{{ reversedMessage }}"</p>
  </div>
</template>
<script>
export default {
  data() {
    return {
      message: "message",
      content: "content",
    };
  },
  computed: {
    reversedMessage() {
      console.log("reversedMessage computed");
      return this.message.split("").reverse().join("");
    },
  },
};
</script>
```

# watch

watch 观察的是 data 里的数据，该数据是目标，会创建一个观察者，当目标变化时，触发对应函数执行。
