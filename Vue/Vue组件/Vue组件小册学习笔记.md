# 组件顺序

- Vue.js 的组件**渲染顺序**是由内而外的

- 结构：一个 form 父组件，两个 form-item 并列子组件，form-item 中各有一个 input 子组件

```html
<i-form :model="formValidate" :rules="ruleValidate">
  <i-form-item label="用户名" prop="name">
    <i-input v-model="formValidate.name"></i-input>
  </i-form-item>
  <i-form-item label="邮箱" prop="mail">
    <i-input v-model="formValidate.mail"></i-input>
  </i-form-item>
</i-form>
```

- 过程如下：在 mount 之前，是从外到内，依次执行 beforeCreate、created、beforeMount 方法，并列的两个子组件每个都先执行这三个方法。然后从内到外执行 mounted。

```
form beforeCreate
form created
form beforeMount

  form-item beforeCreate
  form-item created
  form-item beforeMount

    input beforeCreate
    input created
    input beforeMount

  form-item beforeCreate
  form-item created
  form-item beforeMount

    input beforeCreate
    input created
    input beforeMount

    input mounted

  form-item mounted

    input mounted

  form-item mounted

form mounted
```

# 思路

- 最外层的 form 组件传入了 form

# 知识点

- 自定义组件的 v-model: https://v2.cn.vuejs.org/v2/guide/components-custom-events.html
- 一个组件上的 v-model 默认会利用名为 value 的 prop 和名为 input 的事件
- v-model 绑定的是 multiple，在组件中通过 prop value 可以拿到，并且通过 input 事件可以传更新后的值

```vue
<template>
  <!-- 父组件中使用iRadio组件 v-model双向绑定值 -->
  <i-radio v-model="radio2Value" @on-change="handleRadioChange">radio2</i-radio>
  <!-- 同步更新变化 -->
  <div>{{ radio2Value }}</div>
</template>
```

```vue
<template>
  <!-- iRadio组件 自定义组件用v-model绑定时，默认是value的props名 -->
  <input type="radio" :checked="currentValue" @change="handleChange" />
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentValue: this.value,
    };
  },
  watch: {
    value(newValue, oldValue) {
      console.log("value change");
      console.log(newValue, oldValue);
      this.updateModel();
    },
  },
  mounted() {
    this.updateModel();
  },
  methods: {
    handleChange(event) {
      const value = event.target.checked;
      this.currentValue = value;
      // 必须要有这行代码，才能触发value更新，才会进watch value
      // 父组件中双向绑定的 radio2Value 才会变化
      this.$emit("input", value);
      // 这里emit父组件绑定的"on-change"
      this.$emit("on-change", value);
    },
    updateModel() {
      this.currentValue = this.value === this.trueValue;
    },
  },
};
</script>
```

# checkboxGroup

- 通过 v-model 将数据绑定在父元素 checkboxGroup 上
- checkboxGroup 拿到当前选中的数据 value，在 mounted 时 updateModel
- updateModel 方法中，通过 findComponentsDownward 找到所有子组件，将 value 传给子组件的 model，如果 value 中包含当前子组件的 label，那么子组件就会被选中，即选中数据从父组件传递到子组件

# checkbox

- 子组件中，判断是不是 group 形式
- 是 group 时，使用 v-model="model"，model 是个数组，可以支持多个 checkbox 一起使用，是 vue 框架实现的
- 在 change 事件中，当前选中的数据会自动添加到 model 数组中，调用父组件的 change 方法，将最新选中的所有数据 model 传到父组件，父组件绑定的 event 需要拿到选中的数据。

# 动态生成组件

## Vue.extend 加上 $mount()

- Vue.extend 的作用，就是基于 Vue 构造器，创建一个“子类”，它的参数跟 new Vue 的基本一样，但 data 要跟组件一样，是个函数，再配合 $mount ，就可以让组件渲染，并且挂载到任意指定的节点上

```js
const Component = Vue.extend({
  template: `<div>{{message}}</div>`,
  data() {
    retrun {
      data: 'hello'
    }
  }
})
// 1
// vue组件
const component = new Component().$mount()
// 挂载组件
docuemnt.body.appendChild(component)

// 2
// 直接传入要挂载的元素ID
new Component().$mount('#app')

// 3
// 以对象参数形式传入
new Component().$mount({el: '#app'})
```

## Render 函数渲染一个 .vue 文件

```js
import Vue from "vue";
import Alert from "./alert.vue";

const props = {};

const instance = new Vue({
  render(h) {
    return h(Alert, {
      props,
    });
  },
});
// instance 相当于 上一种方法的 new Component()
const component = instance.$mount();
document.body.appendChild(component.$el);

// 拿到alert组件，instance中只有一个组件
const alert = instance.$children[0];
```

## 销毁组件

- $mount 手动渲染的组件，如果要销毁，也要用 $destroy 来手动销毁实例
- 必要时，也可以用 removeChild 把节点从 DOM 中移除。

# 全局提示组件

1. Alert.vue 的最外层是有一个 .alert 节点的，它会在第一次调用 $Alert 时，在 body 下创建，因为不在 <router-view> 内，它不受路由的影响，也就是说一经创建，除非刷新页面，这个节点是不会消失的，所以在 alert.vue 的设计中，并没有主动销毁这个组件，而是维护了一个子节点数组 notices。
2. .alert 节点是 position: fixed 固定的，因此要合理设计它的 z-index，否则可能被其它节点遮挡。
3. notification.js 和 alert.vue 是可以复用的，如果还要开发其它同类的组件，比如二次确认组件 $Confirm, 只需要再写一个入口 confirm.js，并将 alert.vue 进一步封装，将 notices 数组的循环体写为一个新的组件，通过配置来决定是渲染 Alert 还是 Confirm，这在可维护性上是友好的。
4. 在 notification.js 的 new Vue 时，使用了 Render 函数来渲染 alert.vue，这是因为使用 template 在 runtime 的 Vue.js 版本下是会报错的。

# 递归组件

- 实现一个递归组件的必要条件是：
  - 要给组件设置 name；
  - 要有一个明确的结束条件

# .sync 修饰符

- 一个语法糖，修改数据还是在父组件完成的，并非在子组件。
- 示例：input-number-sync

# 组件通信 provide/inject

- 在独立组件库中，不使用 vuex，实现状态管理
- 通过 provide/inject
- 在根组件中 provide，所有后代组件中需要用到时 inject
- 主要用于子组件获取上级组件状态

- 根组件 App.vue

```js
export default {
  provide() {
    return {
      app: this,
    };
  },
  data() {
    return {
      userInfo: { name: null },
    };
  },
};
```

- 子组件 Home.vue

```vue
<div>app: {{ app.userInfo.name }}</div>
```

- 加载顺序

```
app created
app mounted
home created
home mounted
```
