- 《Webpack5 核心原理与应用实践》 掘金小册 笔记
- 进度 18

# vue-loader

## 环境

- node 13.9.0
- "webpack": "^5.74.0",
- "webpack-cli": "^4.10.0"
- vue-loader 安装 17.0.0 版本时，打包报错：

```
[webpack-cli] Failed to load 'D:\code\learn-webpack\webpack.config.js' config
[webpack-cli] Error: Cannot find module 'vue/compiler-sfc'
Require stack:
- D:\code\learn-webpack\node_modules\vue-loader\dist\index.js
...
```

- 卸载重新安装 vue-loader 15.9.8 版本即可

# eslint-webpack-plugin

- npm i -D eslint-webpack-plugin 安装 eslint-webpack-plugin 接入 eslint
- npm i -D eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-n 安装 eslint 规范，按照哪种规范去进行修正，用 eslint-config-standard，同时需要安装后面三个，否则会报错：

```
ERROR in [eslint] Failed to load plugin 'promise' declared in '.eslintrc » eslint-config-standard': Cannot find module 'eslint-plugin-promise'
```

- 安装完成后执行`npx webpack` (当前项目下运行 webpack) 进行 webpack 打包操作，代码中不符合规范的部分就会标红，如果没有，重启一下编辑器。

## eslint-plugin-vue

- vue 官方的 eslint 插件，用法参考官方文档：https://eslint.vuejs.org/user-guide/#usage

# html-webpack-plugin

- 是一款根据编译产物自动生成 HTML 文件的 Webpack 插件，借助这一插件我们无需手动维护产物数量、路径、hash 值更新等问题
- 安装后，引入 plugin，并在 plugins 配置中 new Plugin()，配置使用的 html 模板

# webpack-dev-server

- 结合 Webpack 工作流，提供基于 HTTP(S) 协议的静态资源服务；
- 提供资源热更新能力，在保持页面状态前提下自动更新页面代码，提升开发效率。
- 安装后，添加 devServer 配置项

```
devServer: {
    hot: true, // 热更新
    open: true // 打开页面
  },
```

- 运行`npx webpack serve`

# vue

- 前面的 vue 文件能正常运行在浏览器里
- 需要安装 Vue，在入口处增加代码

```
import Vue from 'vue'
import testVue from './test.vue'
new Vue({
  render: (h) => h(testVue)
}).$mount('#app')
```

- 模板 index.html 中需要有`<div id="app"></div>`，指定用于插入代码的位置
- test.vue 中有没有 id 为 app 的元素不影响，`<div id="app"></div>`这个元素是会被插入内容取代的
- 现在修改 test.vue 里的代码保存就有热更新效果了

# webpack 构建 NPM 库

## 导出模块

- 修改  `output.library`  配置，以适当方式导出模块内容
- [output.library.name](https://webpack.js.org/configuration/output/#outputlibraryname)：用于定义模块名称，在浏览器环境下使用  `script`  加载该库时，可直接使用这个名字调用模块
- [output.library.type](https://webpack.js.org/configuration/output/#outputlibrarytype)：用于编译产物的模块化方案，可选值有：`commonjs`、`umd`、`module`、`jsonp`  等，通常选用兼容性更强的  `umd`  方案即可。

## 排除第三方库

- 使用者可能在业务中安装了第三方库
- 使用  [externals](https://webpack.js.org/configuration/externals/)  配置项，将第三方依赖排除在打包系统之外
- 改造后，主要发生了两个变化：

1.  产物仅包含  `test-lib`  库代码，体积相比修改前大幅降低；
1.  UMD 模板通过  `require`、`define`  函数中引入  `lodash`  依赖并传递到  `factory`。

- 将 loash 声明为 peerDependencies
  - `peerDependencies`的目的是提示宿主环境去安装满足插件 peerDependencies 所指定依赖的包，然后在插件 import 或者 require 所依赖的包的时候，永远都是引用宿主环境统一安装的 npm 包，最终解决插件与所依赖包不一致的问题。，资料：https://www.cnblogs.com/wonyun/p/9692476.html
- 直接使用 [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals)  排除所有  `node_modules`  模块
  ```
  // webpack.config.js
  const nodeExternals = require('webpack-node-externals');
  module.exports = {
      // ...
      externals: [nodeExternals()]
      // ...
  };
  ```

## 抽离 CSS 代码

- 使用  `mini-css-extract-plugin`  抽离样式文件

## 生成 Sourcemap

- 增加`devtool: 'source-map'`
- 业务方只需使用  `source-map-loader`  就可以将这段 Sourcemap 信息加载到自己的业务系统中，实现框架级别的源码调试能力。

# webpack 核心配置结构

## 配置结构详解

### 单个配置对象

- 业务项目中常用

### 配置对象数组

- 用于需要为同一份代码构建多种产物的场景
  - vue 源码中，将打包配置中不同的部分抽取到 builds 对象中，其他相同配置部分复用
  - 可以通过 webpack-merge 工具合并配置，简化逻辑

### 函数

- Webpack 启动时会执行该函数获取配置，可以在函数中根据环境参数(如 `NODE_ENV`)动态调整配置对象。
- 导出的函数中返回配置对象，配置数组或者 Promise 对象
- 函数的两个参数：
  - `env`：通过 `--env` 传递的命令行参数，适用于自定义参数
  - `argv`：命令行 [Flags](https://webpack.js.org/api/cli/#flags) 参数

```
module.exports = function(env, argv) {
  // ...
  return {
    entry: './src/index.js',
    // 其它配置...
  }
}
```

## 环境治理策略

- 将不同环境配置分别维护在单独的配置文件中
- 配合`--config`指定配置目标`npx webpack --config webpack.development.js`
- 公共的配置可以放在`webpack.common.js`中，再通过`webpack-merge`合入

## 核心配置项汇总

### entry

#### dependOn

1. 普通配置

```
entry: {
  app: './src/index.js'
},

// index.js
import Vue from 'vue'
/* import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css' */
import testVue from './test-vue.vue'
/* Vue.use(ViewUI) */
new Vue({
  render: (h) => h(testVue)
}).$mount('#app')

```

- 引入 iview 之前，入口文件 app.js 315 KB
- 引入之后，入口文件 app.js 2.94MB
- app.js 将 iview.js 打包到一起导致入口体积变大

2. 使用 dependOn

- 将 iview 引用提取到单独的 vendor.js 中

```
entry: {
  vendor: './src/vendor.js',
  app: {
    import: './src/index.js',
    dependOn: 'vendor'
  }
},

// vendor.js
import Vue from 'vue'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
Vue.use(ViewUI)
```

- 使用 dependOn 配置后，iview 被抽离到 vendor.js 文件中，2.92MB
- app.js 入口文件大小为 27KB
- 加载时会先请求 vendor.js 再请求 app.js

# 持久化缓存

## webpack5

- 将首次构建的过程与结果数据持久化保存到本地文件系统，在下次执行构建时跳过解析、链接、编译等一系列非常消耗性能的操作，直接复用上次的 Module/ModuleGraph/Chunk 对象数据，迅速构建出最终产物。

```
cache: {
    type: 'filesystem'
},
```

- 还是引入体积较大的 iview 包，第一次打包： 10305ms
- 修改 test-vue 文件，重新打包：1875ms
- 不加缓存优化，第二次时间会与第一次差不多 9660ms

## webpack4

1. cache-loader
2. hard-source-webpack-plugin
3. 组件自带缓存功能

- babel-loader
- eslint-webpack-plugin
- stylelint-webpack-plugin

```
module.exports = {
    // ...
    module: {
        rules: [{
            test: /\.m?js$/,
            loader: 'babel-loader',
            options: {
                cacheDirectory: true,
            },
        }]
    },
    // ...
    plugins: [
      new ESLintPlugin({ cache: true }),
      new StylelintPlugin({ files: '**/*.css', cache: true }),
    ],
};
```

# 并行构建

- [进程间通信](https://blog.51cto.com/u_15236724/5366300)（英語：Inter-Process Communication，简称 IPC），指至少两个进程或线程间传送数据

1. HappyPack
2. Thread-loader

- 引入 iview 和 echarts
- 处理 js 时增加了'thread-loader'
- 19379ms => 13932ms 有一定程度提升，但是本身也会增加一定的处理时间

```
{
  test: /\.js$/,
  use: [
    {
      loader: 'thread-loader',
      options: {
        workers: 2,
        workerParallerlJobs: 50
      }
    },
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env']
      }
    }]
},
```

3. Parallel-Webpack
4. Terser

# 15. 构建性能优化技巧

1. 使用最新版本 webpack
2. 使用 lazyCompilation(实验特性)：实现 entry 或异步引用模块的按需编译
3. 约束 loader 执行范围，配置 include、exclude
4. 使用 noParse 跳过文件编译
5. 开发模式跳过产物优化
6. 最小化 watch 监控范围
7. 跳过 TS 类型检查：借助编辑器的 TypeScript 插件实现代码检查；使用 fork-ts-checker-webpack-plugin 插件将类型检查能力剥离到 子进程 执行
8. 优化 ESLint 性能：使用新版本组件 eslint-webpack-plugin 替代旧版 eslint-loader
9. 慎用 source-map：开发环境使用 eval ，确保最佳编译速度；生产环境使用 source-map，获取最高质量。
10. 设置 resolve 缩小搜索范围

注：评论中说“改动在实际项目中可行性不大”。这些很多之前也看到过，作为思考的方向吧，实际结合实际项目。

第一点升级，旧项目升级版本涉及到的变动还是不小的，很多相关依赖，配置都需要修改，工作量不小。需要评估后再做。

# 16. 深入理解 chunk

## 配置项与最佳实践

SplitChunksPlugin 支持的配置项：

- minChunks：用于设置引用阈值，被引用次数超过该阈值的 Module 才会进行分包处理；
- maxInitialRequest/maxAsyncRequests：用于限制 Initial Chunk(或 Async Chunk) 最大并行请求数，本质上是在限制最终产生的分包数量；
- minSize： 超过这个尺寸的 Chunk 才会正式被分包；
- maxSize： 超过这个尺寸的 Chunk 会尝试继续做分包；
- maxAsyncSize： 与 maxSize 功能类似，但只对异步引入的模块生效；
- maxInitialSize： 与 maxSize 类似，但只对 entry 配置的入口模块生效；
- enforceSizeThreshold： 超过这个尺寸的 Chunk 会被强制分包，忽略上述其它 size 限制；
- cacheGroups：用于设置缓存组规则，为不同类型的资源设置更有针对性的分包策略。
  结合这些特性，业界已经总结了许多惯用的最佳分包策略，包括：

针对 node_modules 资源：

- 可以将 node_modules 模块打包成单独文件(通过 cacheGroups 实现)，防止业务代码的变更影响 NPM 包缓存，同时建议通过 maxSize 设定阈值，防止 vendor 包体过大；
- 更激进的，如果生产环境已经部署 HTTP2/3 一类高性能网络协议，甚至可以考虑将每一个 NPM 包都打包成单独文件，具体实现可查看小册示例；

针对业务代码：

- 设置 common 分组，通过 minChunks 配置项将使用率较高的资源合并为 Common 资源；
  首屏用不上的代码，尽量以异步方式引入；
- 设置 optimization.runtimeChunk 为 true，将运行时代码拆分为独立资源。

根据实际情况，择优选用。

# 17. 代码压缩

## 原理

用“**更精简**”的代码表达“**同一套**”程序逻辑

先将字符串形态的代码转换为结构化、容易分析处理的 AST（抽象语法树）形态，之后在 AST 上应用上面的规则做各种语法、语义、逻辑推理与简化替换，最后按精简过的 AST 生成结果代码。

## 使用 TerserWebpackPlugin

Webpack5.0 后默认使用 Terser 作为 JavaScript 代码压缩器，简单用法只需通过 optimization.minimize 配置项开启压缩功能（使用 mode = 'production' 启动生产模式构建时，默认会开启 Terser 压缩）即可：

```js
module.exports = {
  //...
  optimization: {
    minimize: true,
  },
};
```

多数情况下使用默认 [Terser 配置](https://github.com/terser/terser#compress-options)即可，必要时也可以手动创建 terser-webpack-plugin 实例并传入压缩配置实现更精细的压缩功能，例如：

```js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  // ...
  optimization: {
    // 控制是否开启压缩
    minimize: true,
    // 压缩器数组配置
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            reduce_vars: true,
            pure_funcs: ["console.log"],
          },
          // ...
        },
      }),
    ],
  },
};
```

terser-webpack-plugin 提供下述 配置项：

- test：只有命中该配置的产物路径才会执行压缩，功能与 module.rules.test 相似；
- include：在该范围内的产物才会执行压缩，功能与 module.rules.include 相似；
- exclude：与 include 相反，不在该范围内的产物才会执行压缩，功能与 module.rules.exclude 相似；
- parallel：是否启动并行压缩，默认值为 true，此时会按 os.cpus().length - 1 启动若干进程并发执行；
- minify：用于配置压缩器，支持传入自定义压缩函数，也支持 swc/esbuild/uglifyjs 等值，下面我们再展开讲解；
- terserOptions：传入 minify —— “压缩器”函数的配置参数；
- extractComments：是否将代码中的备注抽取为单独文件，可配合特殊备注如 @license 使用。

1. 通过 test/include/exclude 过滤插件的执行范围，配合 minimizer 的数组特性，可以实现针对不同产物执行不同的压缩策略，例如：

```js
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: { foo: "./src/foo.js", bar: "./src/bar.js" },
  output: {
    filename: "[name].js",
    // ...
  },
  optimization: {
    minimize: true,
    minimizer: [
      // 针对 foo.js 产物文件会执行 exctractComments 逻辑，将备注信息抽取为单独文件
      new TerserPlugin({
        test: /foo\.js$/i,
        extractComments: "all",
      }),
      // 针对 bar.js，由于 extractComments = false，不单独抽取备注内容。
      new TerserPlugin({
        test: /bar\.js/,
        extractComments: false,
      }),
    ],
  },
};
```

2. terser-webpack-plugin 插件更像是一个代码压缩功能骨架，底层还支持使用 SWC、UglifyJS、ESBuild 作为压缩器，使用时只需要通过 minify 参数切换即可，例如：

```js
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.swcMinify,
        // `terserOptions` 将被传递到 `swc` (`@swc/core`) 工具
        // 具体配置参数可参考：https://swc.rs/docs/config-js-minify
        terserOptions: {},
      }),
    ],
  },
};
```

> 提示：TerserPlugin 内置如下压缩器：
>
> - TerserPlugin.terserMinify：依赖于 terser 库；
> - TerserPlugin.uglifyJsMinify：依赖于 uglify-js，需要手动安装 yarn add -D uglify-js；
> - TerserPlugin.swcMinify：依赖于 @swc/core，需要手动安装 yarn add -D @swc/core；
> - TerserPlugin.esbuildMinify：依赖于 esbuild，需要手动安装 yarn add -D esbuild。
>
> 另外，terserOptions 配置也不仅仅专供 terser 使用，而是会透传给具体的 minifier，因此使用不同压缩器时支持的配置选项也会不同。

## 使用 CssMinimizerWebpackPlugin 压缩 CSS

使用 mini-css-extract-plugin 将 CSS 代码抽取为单独的 CSS 产物文件，这样才能命中 css-minimizer-webpack-plugin 默认的 test 逻辑；然后使用 css-minimizer-webpack-plugin 压缩 CSS 代码。

```js
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  //...
  module: {
    rules: [
      {
        test: /.css$/,
        // 注意，这里用的是 `MiniCssExtractPlugin.loader` 而不是 `style-loader`
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      // Webpack5 之后，约定使用 `'...'` 字面量保留默认 `minimizer` 配置
      "...",
      new CssMinimizerPlugin(),
    ],
  },
  // 需要使用 `mini-css-extract-plugin` 将 CSS 代码抽取为单独文件
  // 才能命中 `css-minimizer-webpack-plugin` 默认的 `test` 规则
  plugins: [new MiniCssExtractPlugin()],
};
```

css-minimizer-webpack-plugin 也支持 test、include、exclude、minify、minimizerOptions 配置，其中 minify 支持：

- CssMinimizerPlugin.cssnanoMinify：默认值，使用 cssnano 压缩代码，不需要额外安装依赖；
- CssMinimizerPlugin.cssoMinify：使用 csso 压缩代码，需要手动安装依赖 yarn add -D csso；
- CssMinimizerPlugin.cleanCssMinify：使用 clean-css 压缩代码，需要手动安装依赖 yarn add -D clean-css；
- CssMinimizerPlugin.esbuildMinify：使用 ESBuild 压缩代码，需要手动安装依赖 yarn add -D esbuild；
- CssMinimizerPlugin.parcelCssMinify：使用 parcel-css 压缩代码，需要手动安装依赖 yarn add -D @parcel/css。

## 使用 HtmlMinifierTerser 压缩 HTML

html-minifier-terser 是一个基于 JavaScript 实现的、高度可配置的 HTML 压缩器，支持一系列 压缩特性 如：

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");
// yarn add -D html-minimizer-webpack-plugin
// 借助 html-minimizer-webpack-plugin 插件接入 html-minifier-terser 压缩器
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");

module.exports = {
  // ...
  optimization: {
    minimize: true,
    minimizer: [
      // Webpack5 之后，约定使用 `'...'` 字面量保留默认 `minimizer` 配置
      "...",
      new HtmlMinimizerPlugin({
        minimizerOptions: {
          // 折叠 Boolean 型属性
          collapseBooleanAttributes: true,
          // 使用精简 `doctype` 定义
          useShortDoctype: true,
          // 删除节点间的空字符串
          collapseWhitespace: true,
          // ...
        },
      }),
    ],
  },
  plugins: [
    // 简单起见，这里我们使用 `html-webpack-plugin` 自动生成 HTML 演示文件
    new HtmlWebpackPlugin({
      templateContent: `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>webpack App</title>
      </head>
      <body>
        <input readonly="readonly"/>
        <!-- comments -->
        <script src="index_bundle.js"></script>
      </body>
    </html>`,
    }),
  ],
};
```

## 总结

在 Webpack 中需要使用 optimization.minimizer 数组接入代码压缩插件，比较常用的插件有：

- terser-webpack-plugin：用于压缩 ES6 代码的插件；
- css-minimizer-webpack-plugin：用于压缩 CSS 代码的插件；
- html-minifier-terser：用于压缩 HTML 代码的插件。

这些插件用法非常相似，都支持 include/test/exclude 配置项，用于控制压缩功能的应用范围；也都支持 minify 配置项，用于切换压缩器，借助这个配置我们可以使用性能更佳的工具，如 ESBuild 执行压缩。

# 18. 其他性能优化技巧

## 动态加载

动态加载是 Webpack 内置能力之一，我们不需要做任何额外配置就可以通过动态导入语句(import、require.ensure)轻易实现。但请 注意，这一特性有时候反而会带来一些新的性能问题：一是过度使用会使产物变得过度细碎，产物文件过多，运行时 HTTP 通讯次数也会变多，在 HTTP 1.x 环境下这可能反而会降低网络性能，得不偿失；二是使用时 Webpack 需要在客户端注入一大段用于支持动态加载特性的 Runtime：

这段代码即使经过压缩也高达 2.5KB 左右，如果动态导入的代码量少于这段 Runtime 代码的体积，那就完全是一笔赔本买卖了。

因此，请务必慎重，多数情况下我们没必要为小模块使用动态加载能力！目前社区比较常见的用法是配合 SPA 的前端路由能力实现页面级别的动态加载

```js
import(/* webpackChunkName: "sub-pages" */ "./Bar.vue");
```

webpackChunkName 用于指定该异步模块的 Chunk 名称，相同 Chunk 名称的模块最终会打包在一起，这一特性能帮助开发者将一些关联度较高，或比较细碎的模块合并到同一个产物文件，能够用于管理最终产物数量。

## HTTP 缓存优化

Webpack 只是一个工程化构建工具，没有能力决定应用最终在网络分发时的缓存规则，但我们可以调整产物文件的名称(通过 Hash)与内容(通过 Code Splitting)，使其更适配 HTTP 持久化缓存策略。
