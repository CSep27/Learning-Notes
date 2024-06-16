# 说明

通过示例对 Vuex 的基础用法进行总结

代码结构如下：

```
- store
    - modules
        cart.js
        product.js
    index.js
```

store/index.js 代码：

```js
import Vue from "vue";
import Vuex from "vuex";
import cart from "./modules/cart";
import product from "./modules/product";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    cart,
    product,
  },
});
```

假设 store 有两个模块：

- 模块 cart `{namespaced: true,}` 设置命名空间为 true
- 模块 product `{namespaced: false,}` 设置命名空间为 false

# state

## 组件内使用

```js
console.log(this.$store.state);
console.log(this.$store.state.cart.checkoutStatus);
console.log(this.$store.state.product.all);
```

# getters

## 组件内使用

```js
// cart模块设置了命名空间为true 那么访问该命名空间中的getters需要通过 ['cart/cartProducts']属性
console.log(this.$store.getters["cart/cartProducts"]);
// 如果没有设置命名空间为true 那么就是注册在全局 不需要加模块名product即可访问
console.log(this.$store.getters.test);
```

## 局部 getters 里获取全局 getters

```js
const getters = {
  cartProducts: (state, getters, rootState, rootGetters) => {
    // rootState 全局state
    // rootGetters 全局getters
    console.log(state, getters, rootState, rootGetters);
    return 1;
  },
};
```

# mutations

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation！

```js
// commit mutation
// 命名空间为true的需要加模块名
this.$store.commit("cart/pushProductToCart", { id: 1 });
this.$store.commit("setProducts", [{ id: 2 }]);
```

## mutation 里的 state 是局部 state

```js
const mutations = {
  pushProductToCart (state, { id }) {
    console.log(state)
    console.log('pushProductToCart', id)
    state.items.push({
      id,
      quantity: 1
    })
  },
```

# actions

action 提交的是 mutation，而不是直接变更状态。

action 可以包含任意异步操作。

```js
// dispatch actions 是否加模块名同上
this.$store.dispatch("cart/checkout", { id: 3 });
this.$store.dispatch("getAllProducts");
```

## 局部 actions 里获取全局变量或调用全局方法

action 函数第一个参数是一个与 store 实例具有相同方法和属性的 context 对象：`{commit, dispatch, getters, state, rootGetters, rootState}`

```js
// cart.js
const actions = {
  checkout(ctx, products) {
    // ctx对象 前面四个为局部的 后面两个为全局的
    // {commit, dispatch, getters, state, rootGetters, rootState}
    console.log(ctx);

    // 访问全局的方法，增加{root: true}即可
    // 如果方法不在命名空间（namespaced: false）里 可以不加模块名
    ctx.commit("setProducts", { root: true });

    // 通过提交mutation 实际修改state的操作在'setCheckoutStatus'里
    const savedCartItems = [...state.items];
    ctx.commit("setCheckoutStatus", null);
  },
  // { state, commit } 解构获取
  addProductToCart({ state, commit }, product) {
    commit("setCheckoutStatus", null);
  },
};
```

```js
// product.js
const actions = {
  getAllProducts({ commit }) {
    console.log("getAllProducts");
    // 访问全局的方法，增加{root: true}即可
    // 如果方法是在命名空间里（namespaced: true） 还是要加模块名
    commit("cart/pushProductToCart", { id: "product" }, { root: true });

    shop.getProducts((products) => {
      commit("setProducts", products);
    });
  },
};
```

## 在局部命名空间中注册全局 action

在 cart.js 中

```js
const actions = {
  // 这里是对象
  globalAction: {
    root: true, // 设置root:true
    // 处理函数放这里
    handler(ctx, data) {
      console.log(ctx);
      console.log(data);
    },
  },
};
// 调用
this.$store.dispatch("globalAction", "全局action");
```

## 组合 action 处理复杂异步流程

[link](https://vuex.vuejs.org/zh/guide/actions.html#%E7%BB%84%E5%90%88-action)
