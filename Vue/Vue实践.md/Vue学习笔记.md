使用 Vue 过程中一些需要记录的点

# 封装组件

## 通过 props 自定义传入 render

- 封装组件时，需要让用户自己传入 render 函数，自定义渲染内容
- 比如表格组件，普通列用户需要将状态列内容进行转换，不同状态显示成不同颜色的圆点。
- 知识点：[渲染函数 & JSX](https://v2.cn.vuejs.org/v2/guide/render-function.html)
- jsx 的用法看[jsx-vue2](https://github.com/vuejs/jsx-vue2)文档

### 代码

```vue
<template>
  <div>
    测试函数式组件
    <table-column :render="renderFn" name="table-column" @click="clickSpan">
      <div>子节点</div>
    </table-column>
  </div>
</template>
<script>
// 两种方式都可以
import tableColumn from "./table-column.js";
// import tableColumn from "./table-column.vue";
export default {
  components: { tableColumn },
  data() {
    return {
      renderFn: function (h) {
        return h(
          "div",
          {
            attrs: { title: "span" },
            class: "test-span",
          },
          // 子节点
          ["先写一些文字", h("h1", "一则头条")]
        );
      },
    };
  },
  methods: {
    clickSpan() {
      console.log("clickSpan");
    },
  },
};
</script>
<style>
.test-span {
  background-color: #fff;
}
.test-span:hover {
  background-color: rgb(224, 186, 186);
}
</style>
```

- table-column.js

```javascript
export default {
  functional: true, // 函数式组件
  props: {
    render: Function,
  },
  render: function (createElement, context) {
    console.log("render");
    console.log(context);
    console.log(this); // null
    return context.props.render(createElement, context);
  },
};
```

- table-column.vue

```javascript
<script>
export default {
  functional: true, // 函数式组件
  props: {
    render: Function,
  },
  render: function (createElement, context) {
    console.log("render");
    console.log(context);
    console.log(this); // vue实例
    // 可以通过this拿到prop传入的render
    return this.render(createElement, context);
  },
};
</script>
```

### 组件代码

- basic-table.vue 表格组件
- table-column.js 函数式组件![table-column](D:\学习笔记\images\vue-component\table-column.png)
-
- front-end-table.vue 使用示例
- ![table-column-2](D:\学习笔记\images\vue-component\table-column-2.png)

![table-column-3](D:\学习笔记\images\vue-component\table-column-3.png)

### 开发组件时遇到的现象分析

- 基于 element 组件封装 table 组件时遇到一个现象，table 的列是通过类似上面例子中传 render 函数动态渲染的，发现鼠标在表格的不同行之间移动时，会进入`table-column.js`中的 render 函数。
- 分析源码发现`packages/table/src/table-body.js`中，tr 元素上绑定的`handleMouseEnter`和`handleMouseLeave`方法中，改变了 states 值。
- 通过断点发现会进 Object.defineProperty 方法中的 getter，obj 就是 table-body.js 文件中的 props 值，val 是 table-store.js 中 TableStore 的实例。具体的不清楚相关逻辑。最终会触发组件的 render 方法。
- 如果把绑定方法中改变 states 值的方法删除，那么就不会触发 render。
- 但是 beforeUpdate 和 updated 没有被触发，是不是 vue 发现不需要更新，待验证

# 插槽透传

- [vm.$slots](https://v2.cn.vuejs.org/v2/api/#vm-slots)
- [vm.$scopedSlots](https://v2.cn.vuejs.org/v2/api/#vm-scopedSlots)

- 使用$slots 实现，在中间组件增加

```vue
<template v-for="(_, key) in $slots" v-slot:[key]>
  <slot :name="key"></slot>
</template>
```

- 作用域插槽，让父组件在使用子组件时能访问到子组件里的数据
- 推荐写法，使用$scopedSlots 实现，包含了普通 slot 和作用域 slot

```vue
<template v-for="(_, key) in $scopedSlots" v-slot:[key]="slotProps">
  <slot :name="key" v-bind:slotProps="slotProps"></slot>
</template>
```

# 自定义事件

## .sync 修饰符

- [自定义事件 - .sync 修饰符](https://v2.cn.vuejs.org/v2/guide/components-custom-events.html#sync-%E4%BF%AE%E9%A5%B0%E7%AC%A6)

- 父组件中有弹窗组件，对于弹窗组件的显示隐藏，之前会写成在父组件和子组件中各自定义一个变量

```vue
<!-- 父组件 -->
<search-modal :modal-visible="modalVisible"></search-modal>

<script>
export default {
  data() {
    return {
      modalVisible: false, // 父组件控制search-modal显示隐藏
    };
  },
};
</script>
```

```vue
<!-- 子组件 -->
<script>
export default {
  props: {
    modalVisible: Boolean,
  },
  data() {
    return {
      visible: false, // 需要子组件内部再维护一个变量，不能直接去修改props
    };
  },
};
</script>
```

- 使用.sync 修饰符

```vue
<!-- 父组件 -->
<search-modal :modal-visible.sync="modalVisible"></search-modal>

<script>
export default {
  data() {
    return {
      modalVisible: false, // 父组件控制search-modal显示隐藏
    };
  },
};
</script>
```

```vue
<!-- 子组件 -->
<script>
export default {
  props: {
    modalVisible: Boolean,
  },
  methods: {
    // 子组件内部修改状态，直接通过'update:modalVisible'触发事件去更新父组件传入的prop
    // 内部不需要再维护一个变量了，相当于prop进行了“双向绑定”
    onVisibleChange(visible) {
      this.$emit("update:modalVisible", visible);
    },
  },
};
</script>
```

# vue-router

## 路由组件传参

- [路由组件传参](https://v3.router.vuejs.org/zh/guide/essentials/passing-props.html)

```javascript
// 路由配置
const router = new VueRouter({
  routes: [
    {
      name: "user",
      path: "/user/:id",
      component: User,
      props: true, // route.params 将会被设置为组件属性
    },
    {
      path: "/about",
      name: "about",
      props: (route) => ({ name: route.query.name }), // 使用函数，可以将query作为props
      component: About,
    },
  ],
});

// 其他页面执行路由跳转
this.$router.push({
  name: "user",
  params: { id: "123" }, // params => /user/123
});
this.$router.push({
  name: "about",
  query: { name: "abc" }, // query => /about?name=abc
});

// user组件
// this.$route.params => {id: '123'}
const User = {
  props: ["id"],
  template: "<div>User {{ id }} </div>",
};

// about组件
// this.$route.query => {name: 'abc'}
const About = {
  props: ["name"],
  template: "<div>About {{ name }} </div>",
};
```

# $emit 方法新增参数

```javascript
// HelloWorld组件
this.$emit('change', value)

// 父组件 需要添加参数
// $event 子组件传递了1个参数
<HelloWorld @change="changeSomething($event, 'other')" />
// arguments（类数组对象） 子组件传递了多个参数
<HelloWorld @change="changeSomething(arguments, 'other')" />
```

# 生命周期执行顺序

- vue created 加了 async 后 mounted 里的同步方法先执行了
- 如图 生命周期异步
- 本来 created 是同步，setBreadcrumb 会在 getMenuData 后执行，setBreadcrumb 需要用到 getMenuData 里设置的变量值
- 变成异步后，setBreadcrumb 在 await 方法后执行了

## updated & destoryed 应用

```vue
// main.vue
<div>
  <router-view></router-view>
</div>
```

- 开始时 router-view 里显示父页面，
- 打开父页面时 main created 然后 mounted
- 点击父页面按钮进入子页面，main updated，此时 main 不会再触发 created 和 mounted
- child created 然后 mounted
- 离开 child 时在 destoryed 里处理相关逻辑

# mixin 使用

## 缺点

1. 命名冲突：mixin 与当前文件中的名称冲突
2. 依赖关系隐晦，改变一个 mixin 时，影响其他组件难以追踪

## 解决

1. 约定 mixin 中的命名，与常规页面的命名区别开来。比如：普通命名是`camelCase`，mixin 中命名增加前缀`mx_camelCase`
2. 明确指明依赖关系

# v-deep 和 scoped 的实现原理

示例代码，引入了 element 组件：

```vue
<template>
  <div class="t-box">
    <div>
      888
      <p>test</p>
    </div>
    <el-table
      class="t-table"
      :data="
        tableData.filter(
          (data) =>
            !search || data.name.toLowerCase().includes(search.toLowerCase())
        )
      "
      style="width: 100%"
    >
      <el-table-column label="Date" prop="date"> </el-table-column>
      <el-table-column label="Name" prop="name"> </el-table-column>
      <el-table-column align="right">
        <template slot="header">
          <el-input v-model="search" size="mini" placeholder="输入关键字搜索" />
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >Edit</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
            >Delete</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [
        {
          date: "2016-05-02",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1518 弄",
        },
        {
          date: "2016-05-04",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1517 弄",
        },
        {
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄",
        },
        {
          date: "2016-05-03",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1516 弄",
        },
      ],
      search: "",
    };
  },
  methods: {
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDelete(index, row) {
      console.log(index, row);
    },
  },
  mounted() {
    console.log(this.$slots);
  },
};
</script>
<style scoped>
.t-table {
  color: brown;
}
/* 使用深度选择器改变表头颜色 */
::v-deep .t-table.el-table thead {
  color: darkblue;
}
</style>
```

## scoped

最终生成的 html 中会在组件的每个元素上统一加一个属性，是当前组件独有的，如：data-v-a3f00c96，子组件只在根元素上加。示例代码如下：

```html
<!-- data-v-7ba5bd90 是当前组件的父组件加了scoped所以添加上的 -->
<div data-v-a3f00c96="" data-v-7ba5bd90="" class="t-box">
  <div data-v-a3f00c96="">
    888
    <p data-v-a3f00c96="">test</p>
  </div>
  <!-- 子组件的根元素会加上 -->
  <div data-v-a3f00c96="" class="el-select">
    <!-- 子组件内部的元素不会加上 -->
    <div class="el-input el-input--suffix">
      <!-- ... -->
    </div>
  </div>
  <div
    data-v-a3f00c96=""
    class="el-table t-table el-table--fit el-table--enable-row-hover el-table--enable-row-transition"
    style="width: 100%"
  >
    <div class="hidden-columns"></div>
    <!-- ... -->
    <div class="el-table__column-resize-proxy" style="display: none"></div>
  </div>
</div>
```

最终生成的 css 中在选择器后面加上这个属性：

```css
.t-table[data-v-a3f00c96] {
  color: brown;
}
```

## ::v-deep

深度选择器最后的效果：

```css
[data-v-a3f00c96] .t-table.el-table thead {
  color: darkblue;
}
```

::v-deep 的位置会被替换成当前组件独有的属性 data-v-a3f00c96。

如果将 scoped 去掉，只使用 v-deep 是不会生效的，因为加上 scoped 才会加上 data-v-xxx 属性。

## 资料

[组件作用域内的-CSS](https://v2.cn.vuejs.org/v2/guide/comparison.html#%E7%BB%84%E4%BB%B6%E4%BD%9C%E7%94%A8%E5%9F%9F%E5%86%85%E7%9A%84-CSS)

[vue-loader-scoped-css](https://vue-loader.vuejs.org/zh/guide/scoped-css.html)

# 自定义指令

使用自定义指令实现对于元素的权限控制

假设有三种角色，值对应为`sysadmin, orgadmin, orguser`，进入页面时通过接口获取当前的角色，再判断是否显示元素（示例中的按钮）

## 示例代码

在入口 main.js 中注册全局指令

```js
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

// 定义指令，实现权限控制
Vue.directive("auth", {
  // 当被绑定的元素插入到 DOM 中时……
  bind: function (el, binding) {
    // 这里拿到的还是原来的初始值，不是异步拿到的值
    console.log("bind", store.state.auth);
    console.log(el, binding);
  },
  update: function (el, binding) {
    // 这里拿到修改后的值
    console.log("update", store.state.auth);
    console.log(el, binding);
  },
  componentUpdated: function (el, binding) {
    // 这里拿到修改后的值
    console.log("componentUpdated", store.state.auth);
    console.log(el, binding);
    // 逻辑写在这里
    if (!binding.value.includes(store.state.auth)) {
      el.style.display = "none";
    }
  },
  unbind: function (el, binding) {
    console.log("unbind", store.state.auth);
    console.log(el, binding);
  },
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
```

在 store/index.js 中存储和调接口获取角色值

```js
import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 默认值
    auth: "sysadmin",
  },
  getters: {},
  mutations: {
    setAuth(state, payload) {
      state.auth = payload.authName;
    },
  },
  actions: {
    setAuth(context) {
      // 调接口之后，获取到新的auth
      setTimeout(() => {
        const authName = "orgadmin";
        // this.$store.dispatch("setAuth", authName);
        context.commit("setAuth", { authName });
      });
    },
  },
  modules: {},
});
```

AboutView.vue 代码：

```vue
<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h2>Vue.directive自定义指令</h2>
    <p>
      下面的按钮仅在权限为sysadmin和orgadmin时显示，如果是orguser权限则不显示，当用户登录之后将用户角色保存在store中
    </p>
    <p>普通做法，通过v-if</p>
    <button v-if="[sysadmin, orgadmin].includes($store.state.auth)">
      v-if按钮1
    </button>
    <p>
      通过指令，把判断的逻辑放在指令中实现。更清晰，有权限只要把角色加到数组中即可
    </p>
    <button v-auth="[sysadmin, orgadmin]">v-auth按钮2</button>
  </div>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      sysadmin: "sysadmin",
      orgadmin: "orgadmin",
    };
  },
  computed: {
    // 通过辅助函数mapState
    // 返回一个对象，通过...对象展开运算符混入当前对象
    ...mapState({
      countNum: (state) => state.countNum,
      // 字符串 "age" 等同于 (state) => state.age
      // 是简写
      countAge: "age",
    }),
    // 如果传入多个，每一个都需要这么写
    /* countNum() {
      return this.$store.state.countNum;
    },
    countAge() {
      return this.$store.state.age;
    }, */
  },
  created() {
    // 进入页面执行获取权限的操作
    this.$store.dispatch("setAuth");
  },
};
</script>
```
