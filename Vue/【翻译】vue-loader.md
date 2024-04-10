原文：[vue-loader README.md](https://github.com/vuejs/vue-loader)

# vue-loader

- vue-loader 是一个给 webpack 使用的 loader，让我们能以单页面应用（SFCs）的形式写 vue 组件

```vue
<template>
  <div class="example">{{ msg }}</div>
</template>

<script>
export default {
  data() {
    return {
      msg: "Hello world!",
    };
  },
};
</script>

<style>
.example {
  color: red;
}
</style>
```

`vue-loader`提供了很多很酷的特性：

    - 允许为一个 Vue 组件的每一部分使用其他的 webpack loaders，例如给`<style>`使用 Sass，给`<template>`使用 Pug；
    - 允许在`.vue`文件中使用自定义块，并且有自定义的 loader 可以应用于自定义块
    - 将`<style>` 和 `<template>`中的静态文件引用当做模块依赖对待，并且使用webpack loader处理这些静态资源引用；
    - 对每个模块模拟实现局部CSS；
    - 开发环境中实现热重载的状态保留；

概括来说，webpack 和 vue-loader 的结合会提供给你一个现代的，灵活的和非常强大的前端工作流用于实现 Vue.js 应用。

## vue-loader 如何工作的

> 下面的部分是针对对于 vue-loader 内部实现细节感兴趣的维护者和贡献者，对于终端用户来说不是必备的知识。

- vue-loader 不是一个简单的源码转换 Loader。它使用专门的 loader 链（你可以认为每个模块都是一个虚拟模块）来处理 SFC 中的每个语言模块，并且把所有块组装到最终模块中。下面是一个关于整个过程如何实现的简短概述：

1.  vue-loader 使用`@vue/component-compiler-utils`把 SFC 源码解析为 SFC 描述符。然后生成一个每个语言块的 import，因此真正的返回模块代码看起来像这样：

    ```js
    // code returned from the main loader for 'source.vue'

    // import the <template> block
    import render from 'source.vue?vue&type=template'
    // import the <script> block
    import script from 'source.vue?vue&type=script'
    export * from 'source.vue?vue&type=script'
    // import <style> blocks
    import 'source.vue?vue&type=style&index=1'

    script.render = render
    export default
    ```

    注意代码如何导入 source.vue 本身，每个块使用不同的请求参数

2.  我们想要 script 块中的内容像`.js` 文件一样被处理，其他语言块也一样，所以我们想要 webpack 将任何已配置的匹配`.js`的模块规则也应用到像`source.vue?vue&type=script`的请求上。这是`VueLoaderPlugin` (`src/plugins.ts`)做的事情：对于在 webpack 配置中的每个模块规则，它创建了一个修改后的副本，指向了相应的 Vue 语言块请求。

    （个人理解：比如使用 postcss-pxtorem 这个 loader 时，在控制台查看元素样式时，element 面板中看到的是转换后的 rem 单位，source 面板中看 Vue 源码是转换前的 px 单位）

    假设我们已经给所有`*.js`文件配置了 `babel-loader`。这个规则会被复制并且也应用到 Vue SFC 的`<script>`块。在 webpack 内部，像这样的请求

    ```js
    import script from "source.vue?vue&type=script";
    ```

    将会扩展成:

    ```js
    import script from "babel-loader!vue-loader!source.vue?vue&type=script";
    ```

    注意`vue-loader`也会匹配上，因为`vue-loader`应用于`.vue`文件

    相似的，如果你给`*.scss`文件配置了`style-loader` + `css-loader` + `sass-loader`：

    ```html
    <style scoped lang="scss">
    ```

    将会被 `vue-loader` 转换为:

    ```js
    import "source.vue?vue&type=style&index=1&scoped&lang=scss";
    ```

    然后 webpack 会把它扩展成:

    ```js
    import "style-loader!css-loader!sass-loader!vue-loader!source.vue?vue&type=style&index=1&scoped&lang=scss";
    ```

3.  当处理扩展后的请求时，`vue-loader`将会再次包含进来。然而这次，`vue-loader`注意到请求有`queries`并且仅指向一个明确的块。所以它选择（src/select.ts）目标块的内容，然后把内容传递给匹配的 loader 进行处理

4.  对于`<script>`块，差不多就是这样了。对于`<template>`和`<style>`块，需要执行一些额外的任务：

    - 我们需要使用 Vue 模板编译器编译 template
    - 我们需要**在`css-loader`处理之前**，post-process（后处理，根据下文，应该是使用`src/stylePostLoader.ts`处理，即`style-post-loader`） `<style scoped>` 块中的 CSS

    技术上来说，这些是需要被注入到扩展后的 loader 链中的额外的 loaders（`src/templateLoader.ts` and `src/stylePostLoader.ts`）。如果终端用户需要自己配置这些 loaders，那会非常复杂，所以`VueLoaderPlugin`也注入了一个全局的能够拦截 Vue `<template>` 和 `<style>`请求并且注入必要的 loaders 的[Pitching loader](https://webpack.js.org/api/loaders/#pitching-loader) (`src/pitcher.ts`)。最终的请求看起来像下面这样

    ```js
    // <template lang="pug">
    import "vue-loader/template-loader!pug-loader!vue-loader!source.vue?vue&type=template";

    // <style scoped lang="scss">
    import "style-loader!css-loader!vue-loader/style-post-loader!sass-loader!vue-loader!source.vue?vue&type=style&index=1&scoped&lang=scss";
    ```

# 附录

- [vue-loader 中文文档](https://vue-loader.vuejs.org/zh/)
- [SFC Descriptor](https://zhuanlan.zhihu.com/p/36080403)
