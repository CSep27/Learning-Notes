感觉没必要比较这两个，搞清楚各自的原理和使用场景即可

# computed

不能和 data 中的变量重名，最终也像 data 里的变量一样在模板中使用。

reversedMessage 的值是根据 message 计算之后的值得到的，初次渲染时，会触发一次函数，打印"reversedMessage computed"。

message 是目标，会创建 computed 内部观察者观测目标的变化。若目标改变，执行 reversedMessage 函数，重新计算值赋给 reversedMessage

假如 content 变量值变化，reversedMessage 没有依赖于 content，函数不会触发，**组件渲染过程中直接用上次缓存的值**

假如 message 变量值变成了"msg"，reversedMessage 依赖于 message，函数会触发，打印"reversedMessage computed"，重新计算 reversedMessage 的值，更新。

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

## getter 不应有副作用

计算属性的 getter 应只做计算而没有任何其他的副作用：

- **不要**改变其他状态
- **不要**在 getter 中做异步请求
- **不要**更改 DOM

## 避免直接修改计算属性值

从计算属性返回的值是派生状态。可以把它看作是一个“临时快照”，每当源状态发生变化时，就会创建一个新的快照。更改快照是没有意义的，因此计算属性的返回值应该被视为只读的，并且永远不应该被更改——应该更新它所依赖的源状态以触发新的计算。

## 使用 computed 和 method 的区别

method 方法不能和数据（data 和 computed）重名

官方文档示例：

computed 的 now 和 method 里的 getNow 都是执行`Date.now()`，是非响应式数据，一开始渲染时都会展示当前时间戳。

当点击 changeContent 按钮修改 content 数据内容，视图更新，reversedMessage 依赖的响应式 message 值没有更新，因此不会更新，now 依赖的`Date.now()`不是响应式的，也不会变化。而 getNow 方法会出现执行，更新为本次视图更新时的时间。

reversedMessage 如果直接将方法写在模板中，会让模板过重且难以维护。并且即使 message 没有变化，其他原因触发了视图渲染，也会执行方法重新计算。

因此需要缓存时用 computed，不需要缓存时用 method。

```vue
<template>
  <div>
    <div>content {{ content }}</div>
    <button @click="changeContent">changeContent</button>
    <div>computed reversedMessage: {{ reversedMessage }}</div>
    <!-- <div>method reversedMessage: {{ message.split("").reverse().join("") }}</div> -->
    <div>computed now: {{ now }}</div>
    <div>method now: {{ getNow() }}</div>
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
    now: function () {
      return Date.now();
    },
    reversedMessage() {
      console.log("reversedMessage computed");
      return this.message.split("").reverse().join("");
    },
  },
  methods: {
    changeContent() {
      this.content = "1";
    },
    getNow: function () {
      return Date.now();
    },
  },
};
</script>
```

# watch

watch 观察的是 data 或者 computed 里的数据，该数据是目标，会创建一个观察者，当目标变化时，触发对应函数执行。

观察数据变化后，执行一些操作，可以是异步操作。

如下示例：

watch 中可以观察 content1（data），在 content1 变化后执行异步操作
可以观察 reversedMessage（computed）。两者都属于被观察的目标，

```vue
<template>
  <div>
    <div>computed: {{ reversedMessage }}</div>
    <div>
      <div>watch {{ content1 }} change</div>
      <div>content2: {{ content2 }}</div>
    </div>
    <button @click="change">change</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "message",
      content1: "content1",
      content2: "content2",
    };
  },
  computed: {
    reversedMessage() {
      console.log("reversedMessage computed");
      return this.message.split("").reverse().join("");
    },
  },
  watch: {
    content1(newValue) {
      console.log("watch content1", newValue);
      setTimeout(() => {
        this.content2 = "content2change";
      });
    },
    reversedMessage(newValue) {
      console.log("reversedMessage newValue: ", newValue);
    },
  },
  methods: {
    change() {
      this.content1 = "new 1";
      this.message = "message1";
    },
  },
};
</script>
```
