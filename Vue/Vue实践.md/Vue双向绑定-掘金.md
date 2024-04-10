引言：看到有一些文章说到 Vue 的响应式和双向绑定，本文是阅读 Vue 文档后的一些练习和一些总结，本篇重点在于介绍 Vue 文档中提到双向绑定的部分。

# 响应式

首先简单说下响应式。

在 Vue 文档的[深入响应式原理](https://v2.cn.vuejs.org/v2/guide/reactivity.html)中说到。

> Vue 最独特的特性之一，是其非侵入性的响应式系统。数据模型仅仅是普通的 JavaScript 对象。而当你修改它们时，视图会进行更新。

也就是常说的数据驱动视图变化。就是修改数据，视图自动更新，就是页面上的内容自动更新了。

如下示例 1，通过 CDN 引入 Vue，将 Vue 实例 app 挂载到 window 上，在控制台就可以手动修改 app.message 了，修改完后，浏览器上的内容就变化了。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>

  <body>
    <div id="app">{{ message }}</div>
  </body>
  <script>
    var app = new Vue({
      el: "#app",
      data: {
        message: "Hello Vue!",
      },
    });
    window.app = app;
  </script>
</html>
```

效果图：

![one-way-data-binding.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75a98c0726944b41b56921b23dca98f8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=306&h=333&s=43393&e=gif&f=32&b=fefefe)

我们在控制台手动修改数据的过程，可以看做在实际项目中就是从后端获取到数据后再给 message 赋值的过程。

这样就是一个单向绑定，数据变化视图变化。

这个操作能成功的原因就是基于 Vue 的响应式系统。

那么双向绑定在文档中搜索之后可以看到如下结果：

![search-binding.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/902395b424994f14a5502ee8b8f53a5f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=942&h=830&s=159448&e=png&b=ffffff)

下面具体看下。

# 双向绑定

双向绑定就是当数据变化时视图变化（案例 1），并且当视图变化时数据也变化，视图和数据之间双向绑定。如何让视图变化，最常见的就是表单输入操作（输入操作就是直接修改浏览器上展示的视图）。

## [表单输入绑定](https://v2.cn.vuejs.org/v2/guide/forms.html)

> 你可以用 v-model 指令在表单 `<input>`、`<textarea>` 及 `<select>` 元素上创建**双向数据绑定**。它会根据控件类型自动选取正确的方法来更新元素。尽管有些神奇，**但 v-model 本质上不过是语法糖**。它负责监听用户的输入事件以更新数据，**并对一些极端场景进行一些特殊处理**。

示例 2：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>

  <body>
    <div id="app">
      <input v-model="message" placeholder="edit me" />
      <p>Message is: {{ message }}</p>
    </div>
  </body>
  <script>
    var app = new Vue({
      el: "#app",
      data: {
        message: "Hello Vue!",
      },
    });
    window.app = app;
  </script>
</html>
```

当我们在输入框里输入数据时，p 标签里的 message 自动变化，与我们输入的内容是一致的。这个 message 也就是绑定在 input 框中的数据，放在 p 标签里是为了清晰的看到 message 的变化。

同样当我们在控制台修改 message 的值，输入框和 p 标签中的值都会相应变化。

![two-way-data-binding-2.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6877375fc82e43749483bc34a58295ae~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=306&h=333&s=73383&e=gif&f=43&b=fdfdfd)

接下来看下 v-model 在组件上的使用。

## [自定义组件的 v-model](https://v2.cn.vuejs.org/v2/guide/components-custom-events.html#%E8%87%AA%E5%AE%9A%E4%B9%89%E7%BB%84%E4%BB%B6%E7%9A%84-v-model)

> 一个组件上的 v-model 默认会利用名为 value 的 prop 和名为 input 的事件

### 以 input 输入框为例

有一个封装了 input 输入框的 iInput 组件，父组件使用这个组件，最后拿到 iInput 的输入值。

普通写法，示例 3-1：

```js
<!-- 父组件 -->
<template>
  <div class="about">
    <h2>v-model测试</h2>
    <!-- 在组件上绑定名为 value 的 prop 和 input 事件，onInput里拿到子组件传过来的数据再赋值给userName -->
    <!-- 这里绑定的值 value 和事件 input 可以用其他名字，和子组件中的 prop 以及 $emit 函数的事件名对应上即可-->
    <i-input :value="userName" @input="onInput"></i-input>

    <button @click="onSubmit">提交</button>
  </div>
</template>
<script>
import iInput from "@/components/i-input.vue";
export default {
  components: {
    iInput,
  },
  data() {
    return {
      userName: "父组件初始值",
    };
  },
  methods: {
    onInput(data) {
      this.userName = data;
    },
    onSubmit() {
      console.log(this.userName);
    },
  },
};
</script>
```

```js
<!-- 子组件 -->
<template>
  <!-- iInput组件 -->
  <div>
    <input type="input" :value="currentValue" @input="handleInput" />
    <div>子组件中，显示input输入的值： {{ currentValue }}</div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      // 用父组件的值作为初始值
      currentValue: this.value,
    };
  },
  methods: {
    /* 对于input框，需要绑定input事件，拿到更改后的值 */
    handleInput(event) {
      console.log(event);
      this.currentValue = event.target.value;

      // 执行$emit，将更改后的数据传递给父组件
      this.$emit("input", this.currentValue);
    },
  },
};
</script>
```

而如果使用 v-model，子组件写法不用变，因为直接用的名称为 value 的 prop 和名称为 input 的事件（`this.$emit("input", this.currentValue);`这里`$emit`参数的 input）

父组件修改如下，示例 3-2 ：

```js
<template>
  <div class="about">
    <h2>v-model测试</h2>
    <!-- 修改为使用 v-model="userName" -->
    <i-input v-model="userName"></i-input>

    <!-- <i-input :value="userName" @input="onInput"></i-input> -->
    <button @click="onSubmit">提交</button>
  </div>
</template>
<script>
import iInput from "@/components/i-input.vue";
export default {
  components: {
    iInput,
  },
  data() {
    return {
      userName: "父组件初始值",
    };
  },
  methods: {
    /* 注释掉没用到的方法 */
    /* onInput(data) {
      this.userName = data;
    }, */
    onSubmit() {
      console.log(this.userName);
    },
  },
};
</script>
```

示例 3-1 和示例 3-2 最终的效果是一样的。

写法上父组件中的`<i-input :value="userName" @input="onInput"></i-input>`写法被替换成更简单的：`<i-input v-model="userName"></i-input>`，子组件中按照 Vue 要求的用名称为 value 的 prop 和名称为 input 的事件即可。这里能清晰的看到为什么说 v-model 本质上是语法糖。

文档中还提到了其他的表单控件，比如 checkbox，它的选中与否状态是用 checked 属性来表示，也就是我们需要拿到的类似 input 输入框的 value 值，而它的 value 属性有其他作用，对应的需要处理的事件也不同。所以 Vue 文档中说：

> v-model 在内部为不同的输入元素使用不同的 property 并抛出不同的事件：
>
> - text 和 textarea 元素使用 value property 和 input 事件；
> - checkbox 和 radio 使用 checked property 和 change 事件；
> - select 字段将 value 作为 prop 并将 change 作为事件。

在将这些输入控件封装成组件时，文档上也提到：

> 像单选框、复选框等类型的输入控件可能会将 value attribute 用于不同的目的。model 选项可以用来避免这样的冲突。

这种情况下可能就是前文 Vue 文档中提到的对极端场景进行处理。

### 以 checkbox 为例

子组件中增加了 model，注意子组件中注释的修改。

```js
<!-- 子组件 -->
<template>
  <div>
    <input
      type="checkbox"
      value="agreement"
      :checked="currentValue"
      @change="handleChange"
    />
    <label for="agreement">同意</label>
    <div>子组件中，显示radio checked值： {{ currentValue }}</div>
  </div>
</template>

<script>
export default {
  // 不是默认的value和input，这里需要配置model
  model: {
    prop: "checked",
    event: "change",
  },
  props: {
    // 改为checked
    checked: Boolean,
  },
  data() {
    return {
      currentValue: this.checked,
    };
  },
  methods: {
    handleChange(event) {
      console.log(event);
      // 这里是checked
      this.currentValue = event.target.checked;
      // 改为change
      this.$emit("change", this.currentValue);
    },
  },
};
</script>
```

```js
<!-- 父组件 -->
<template>
  <div class="about">
    <h2>v-model测试</h2>
    <i-checkbox v-model="checkedItem"></i-checkbox>
    <button @click="onSubmit">提交</button>
  </div>
</template>
<script>
import iCheckbox from "@/components/i-checkbox.vue";
export default {
  components: {
    iCheckbox,
  },
  data() {
    return {
      checkedItem: true,
    };
  },
  methods: {
    onSubmit() {
      console.log(this.checkedItem);
    },
  },
};
</script>
```

Vue 文档中还有一段话：

> AngularJS 使用双向绑定，Vue 在不同组件间强制使用单向数据流。这使应用中的数据流更加清晰易懂。

也就是说一般情况下，Vue 在不同组件间强制使用单向数据流。我们常用的就是通过 prop 和 `$emit` 来实现父子通信，prop 是父向子，`$emit` 是子向父，也就是示例 3-1。在示例 3-2 中，对于子组件还是 prop 和 `$emit`，父组件中使用 v-model 的写法更简单了，看父组件就像看 示例 2 一样是双向绑定了。

还能看到一个“双向绑定”的地方就在`.sync`修饰符，这里的双向绑定被添加了双引号。下面先看下.sync 用法。

### `.sync`修饰符

> 在有些情况下，我们可能需要对一个 prop 进行“双向绑定”。不幸的是，真正的双向绑定会带来维护上的问题，因为子组件可以变更父组件，且在父组件和子组件两侧都没有明显的变更来源。

举例：父组件中有个按钮，点击打开弹窗组件。点击弹窗上的关闭按钮，关闭弹窗。

效果图：

![modal.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d138449e9f44cb5b263f5aa2f9b8974~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=306&h=214&s=20026&e=gif&f=16&b=fdfdfd)

#### 普通写法

示例 4-1：

```js
<!-- 父组件 -->
<template>
  <div>
    <i-modal
      :modal-visible="modalVisible"
      @on-modal-change="modalVisible = $event"
    ></i-modal>
    <button @click="modalVisible = true">打开modal</button>
  </div>
</template>
<script>
import iModal from "@/components/i-modal.vue";
export default {
  data() {
    return {
      modalVisible: false,
    };
  },
};
</script>
```

```js
<!-- 子组件 -->
<template>
  <div v-show="modalVisible" class="box">
    <div class="content">
      <button @click="closeModal">点击关闭弹窗</button>
      <p>弹窗组件</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modalVisible: Boolean,
  },
  methods: {
    closeModal() {
      this.$emit("on-modal-change", false);
    },
  },
};
</script>
<style scoped>
.box {
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.1);
}
.content {
  width: 240px;
  height: 120px;
  padding: 10px;
  margin: 0 auto;
  background: white;
}
</style>
```

#### 使用.sync 写法

示例 4-2：

```js
<!-- 父组件 -->
<template>
  <div>
    <!-- 加上.sync 写法更简单 -->
    <i-modal :modal-visible.sync="modalVisible"></i-modal>
    <button @click="modalVisible = true">打开modal</button>
  </div>
</template>
<script>
import iModal from "@/components/i-modal.vue";
export default {
  data() {
    return {
      modalVisible: false,
    };
  },
};
</script>
```

```js
<!-- 子组件 -->
<template>
  <div v-show="modalVisible" class="box">
    <div class="content">
      <button @click="closeModal">点击关闭弹窗</button>
      <p>弹窗组件</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modalVisible: Boolean,
  },
  methods: {
    // 子组件通过'update:modalVisible'触发事件去更新父组件传入的prop
    closeModal() {
      this.$emit("update:modalVisible", false);
    },
  },
};
</script>
<style scoped>
.box {
  position: fixed;
  z-index: 1000;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.1);
}
.content {
  width: 240px;
  height: 120px;
  padding: 10px;
  margin: 0 auto;
  background: white;
}
</style>
```

#### `.sync`总结

父组件中，普通写法：`<i-modal :modal-visible="modalVisible" @on-modal-change="modalVisible = $event"></i-modal>`。

和前文中的 v-model 一样，使用`.sync` 语法糖写法更简单。父组件中在 propName 后面加上`.sync`。如：`<i-modal :modal-visible.sync="modalVisible"></i-modal>`。子组件中，`$emit` 事件名称相应的使用`update:propName`。如：`this.$emit("update:modalVisible", false);`

这种情况下，不是前面说的表单输入情况下视图和数据之间的双向绑定，而是 Vue 提供了.sync 语法糖，实现看起来像是数据在父子组件之间双向绑定了。

# 总结

前面展示的单向绑定和双向绑定的案例，指的是视图与数据之间的绑定关系。而能够实现这些效果，都是因为使用了 Vue 框架，其基于响应式的原理使我们不用直接操作 DOM，而是只需要变更数据（Model）即可驱动视图（View）变化，也就是 MVVM 框架做的事情。

关于 MVVM，Vue 官网中说：

> 虽然没有完全遵循 MVVM 模型，但是 Vue 的设计也受到了它的启发。因此在文档中经常会使用 vm (ViewModel 的缩写) 这个变量名表示 Vue 实例。

以上就是个人对 Vue 官方文档中关于双向绑定的一些解读，如有谬误，欢迎指正！

# 参考资料

1. 廖雪峰的官方网站

- [单向绑定](https://www.liaoxuefeng.com/wiki/1022910821149312/1109447325776608)
- [双向绑定](https://www.liaoxuefeng.com/wiki/1022910821149312/1109527162256416)
