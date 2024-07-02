# CSS

## 样式隔离

1. 安装插件`npm i postcss-plugin-namespace`
2. 根目录新建`postcss.config.js`

```js
module.exports = {
  plugins: [require("postcss-plugin-namespace")(".unique-classname")],
};
```

3. 入口 vue 文件中，根元素增加类名`unique-classname`

## CSS 共享

- 定义 CSS 变量全局使用

## 元素布局

- 如果需要将子应用放到指定位置
- 在子应用中增加配置指定子应用放入的元素 ID（appOptions 中的 el 配置）
- 主应用中增加指定 ID 的元素

## BEM 命名规范

- 实现 BEM 功能的基于 sass 的库：sass-bem
- 每个项目中都安装

```
// 使用
@import 'node_modules/sass-bem/bem';
$bem-object-namespace: 'op'; // 修改命名空间
```

# JS

## 路由跳转

- 不同子应用之间进行路由跳转
- history 模式`window.history.pushState({}, '', '/path/subpath');`
- hash 模式`window.history.pushState({}, '', '/path#/hash?query=value');`
- single-spa 框架重新封装了 popState 方法，页面 location（包括 hash）变化就会触发该方法
  - 可以通过监听 popState 方法，根据 url 设置面包屑
  - `window.addEvent('popState', onPopState)`

## 全局污染

### JS 单例沙箱

- 只支持一次挂载一个子应用的场景
- 参考 qiankun 源码中`SnapshotSandbox`

使用方法：

1. 在基座应用中为每一个子应用 new 一个沙箱实例，通过参数传递给子应用
2. 改造子应用的 mount 和 unmount 方法，分别在其中调用 active 和 inactive 方法
3. 如果给 window 挂载属性需要在调用 active 方法之后挂载，沙箱才能起到隔离的作用

```js
// 主应用
import { registerApplication, start } from "single-spa";
import SnapshotSandbox from "./sandbox/snapshot-sandbox";
const sandboxService = new SnapshotSandbox();

registerApplication({
  name: "@vue-mf/rate-dogs",
  app: () => System.import("@vue-mf/rate-dogs"),
  activeWhen: "/rate-dogs",
  customProps: {
    sandbox: sandboxService,
  },
});

start();

// 子应用
export async function mount(props) {
  props.sandbox.active();
  window.service = "s";
  return vueLifecycles.mount(props);
}
export async function unmount(props) {
  props.sandbox.inactive();
  return vueLifecycles.unmount(props);
}
```

## 共享公共方法和组件

### 上传到私有库

- 再和普通库一样安装

### 放在单独子应用 styleguide 中

- styleguide 组件的 main.ts 中导出方法和组件

```js
import * as utils from "./utils/index";
// ...
export { utils };
export { default as PageHeader } from "./components/page-header.vue";
```

- 其他子应用使用（借助 system.js）

1. 在入口 main.js 中导入，并全局注册

```js
// main.js
(async () => {
  const { utils, PageHeader } = await window.System.import('@vue-mf/styleguide');
  Vue.component('mf-page-header', PageHeader);
  Vue.prototype.utils = utils;
})()

// home-vue.vue
<mf-page-header></mf-page-header>
console.log(this.utils.deepCopy({c: 'utils'}));
```

2. 在要使用的页面导入

```js
// home-vue.vue
export default {
  components: {
    PageHeader: async () => {
      const { PageHeader } = await window.System.import("@vue-mf/styleguide");
      return PageHeader;
    },
  },
  data() {
    return {
      utils: {},
    };
  },
  async created() {
    const { utils } = await window.System.import("@vue-mf/styleguide");
    this.utils = utils;
  },
};
```
