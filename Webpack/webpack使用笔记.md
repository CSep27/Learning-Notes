# webpack 配置

## output

### path

- 生产环境 Webpack 打包文件后的输出目录，开发环境是存在内存里的

### publicPath

- 表示资源被引用的根路径，在入口 index.html 能看到资源路径前会加上这个
- 如果资源放在 CDN 上，可以将这个地址配置为 CDN 地址

### libraryTarget

- 建议使用`output.library.type`配置该属性
- 配置 library 如何暴露，就是最终打包出来的产物是哪一种模块类型

#### libraryTarget: 'commonjs2'

- ['commonjs'和'commonjs2'的区别](https://github.com/webpack/webpack/issues/1114)

  - commonjs mean pure CommonJs
  - commonjs2 also includes the module.exports stuff.

- 配置 commonjs2，那么打包出来的就是下面这样

  ```js
  // webpack.config.js
  module.exports = {
    output: {
      library: "MyLibrary", // 模块名称
      libraryTarget: "commonjs2",
    },
  };
  ```

  ```js
  // 打包出来的最终产物
  // _entry_return_ 表示入口返回的结果
  module.exports = _entry_return_;

  // use in node
  require("MyLibrary").doSomething();
  ```

- element-ui 配置 commonjs2 打包出来的产物（未压缩 36243 行），简洁版：执行一个匿名函数，参数为一个数组，执行完返回结果对象，取这个对象的 default 值赋值给 module.exports

  ```js
  module.exports = (function (modules) {})([])["default"];
  ```

- 稍微补充细节版：

  ```js
  // element-ui.common.js
  module.exports = (function (modules) {
    // ...
    // The require function
    function __webpack_require__(moduleId) {
      // ...
      return module.exports;
    }
    // ...
    return __webpack_require__((__webpack_require__.s = 38));
  })([
    /* 0 */
    function (module, exports) {
      module.exports = require("element-ui/lib/utils/dom");
    },
    // ... 0-37都是结构与第一个相同的function
    /* 37 */

    /* 38 */
    // 38导出的也是39，所以注释的数字也是有作用的
    function (module, exports, __webpack_require__) {
      module.exports = __webpack_require__(39);
    },
    /* 39 */
    function (module, __webpack_exports__, __webpack_require__) {
      // ...
      var src_0 = (__webpack_exports__["default"] = {
        version: "2.6.3",
        locale: lib_locale_default.a.use,
        i18n: lib_locale_default.a.i18n,
        install: src_install,
        CollapseTransition: collapse_transition_default.a,
        Loading: packages_loading,
        // ...
      });
    },
  ])["default"];
  ```

#### libraryTarget: 'umd'

- 支持多种模块的格式

```js
module.exports = {
  //...
  output: {
    library: "MyLibrary",
    libraryTarget: "umd",
  },
};
```

- 输出中会判断不同的环境，产物体积会更大：

```js
(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if (typeof define === "function" && define.amd) define([], factory);
  else if (typeof exports === "object") exports["MyLibrary"] = factory();
  else root["MyLibrary"] = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return _entry_return_;
});
```

- element 打包（未压缩 43703 行），一个匿名自执行函数，将当前上下文 root 和实际执行的 factory 函数传入 webpackUniversalModuleDefinition 函数中.
- factory return 的函数结构和配置 commonjs2 时 module.exports 后面的函数结构是一致的，也就对应了 webpackUniversalModuleDefinition 第一个 if 的情况

```js
(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory(require("vue"));
  else if (typeof define === "function" && define.amd)
    define("ELEMENT", ["vue"], factory);
  else if (typeof exports === "object")
    exports["ELEMENT"] = factory(require("vue"));
  else root["ELEMENT"] = factory(root["Vue"]);
})(
  typeof self !== "undefined" ? self : this,
  function (__WEBPACK_EXTERNAL_MODULE__0__) {
    return (function (modules) {
      return __webpack_require__((__webpack_require__.s = 48));
    })([
      /* 0 */
      function (module, exports) {
        module.exports = __WEBPACK_EXTERNAL_MODULE__0__;
      },
      // ...
      /* 87 */
      function (module, __webpack_exports__, __webpack_require__) {},
    ])["default"];
  }
);
```

### libraryExport

- 推荐使用`output.library.export`
- 配置哪个模块会通过 libraryTarget 暴露，默认是 undefined，配置''空字符串效果也是一样的，会导出整个（命名空间）对象

- 假设配置了`libraryTarget: 'var'`，相对应的 libraryExport 配置的效果：

- `libraryExport: 'default'`入口的默认导出会被当做 library target

  - `var MyDefaultModule = _entry_return_.default;`

- `libraryExport: 'MyModule'`指定模块会被当做 library target

  - `var MyModule = _entry_return_.MyModule;`

- `libraryExport: ['MyModule', 'MySubModule']`数组会被解析为路径，然后当做 library target

  - `var MySubModule = _entry_return_.MyModule.MySubModule;`

- 上面 libraryTarget 的示例中，libraryExport 是默认情况，可以看到打包出来的代码中有个`对象["default"]`。而入口文件中是`export default {}`，就是默认导出一个 default 对象

### 实例解析 1

```js
// 入口index.js
function test() {
  console.log("test");
}
export default { test };
```

```js
// webpack.config.js
const path = require("path");

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    library: {
      name: "MyLibrary",
      type: "commonjs2",
      export: "default",
    },
  },
};
```

```js
// test.cjs
const MyTest = require("./dist/main");
console.log(MyTest);
```

#### 不配置 library.name

```js
// 打包产物中有
module.exports = __webpack_exports__["default"];

// test.cjs 打印 MyTest 输出
{ test: [Function: test] }

// 使用 test 函数
MyTest.test()
```

#### 配置`library.name = 'MyLibrary'`

```js
// 打包产物中有
module.exports.MyLibrary = __webpack_exports__["default"];

// test.cjs 打印 MyTest 输出
{ MyLibrary: { test: [Function: test] } }

// 使用 test 函数
MyTest.MyLibrary.test()
```

### 实例解析 2

- webpack 配置`export: "test",`

```js
// 入口index.js
function test() {
  console.log("test");
}
export { test }; // 修改了此行
```

```js
// webpack.config.js
const path = require("path");

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    library: {
      type: "commonjs2",
      export: "test",
    },
  },
};
```

```js
// test.cjs
const MyTest = require("./dist/main");
console.log(MyTest);
```

#### 不配置 library.name

```js
// 打包产物中有
module.exports = __webpack_exports__.test;

// test.cjs 打印 MyTest 输出
[Function: test]

// 使用 test 函数
MyTest();
```

#### 配置`library.name = 'MyLibrary'`

```js
// 打包产物中有
module.exports.MyLibrary = __webpack_exports__.test;

// test.cjs 打印 MyTest 输出
{ MyLibrary: [Function: test] }

// 使用 test 函数
MyTest.MyLibrary()
```

### 实例总结

- webpack v5.75.0
- 前提`type: "commonjs2",`

#### library.name

- 配置 name，产物中`module.exports.MyLibrary = xxx`，使用时拿到的对象上有个 MyLibrary 属性
- 不配置 name，产物中`module.exports = xxx`，使用时没有 MyLibrary 属性

#### library.export

##### 'default'

- 原始代码：`export default { test };`，
- 配置：`export: "default",`，
- 产物：`__webpack_exports__["default"]`
- 使用时拿到的是一个有 test 方法的对象，也就是原始代码中导出的一个名称为 default 的对象，该对象中有个 test 方法。

##### 'test'

- 原始代码：`export { test };`，
- 配置：`export: "test",`，
- 产物：`__webpack_exports__.test`，
- 使用时拿到的就是 test 函数本身了，在原始代码中直接导出的没有名称的对象`{ test }`，`export: "test",`则是告诉 webpack，导出的是这个无名对象中的 test 方法。
- 如果原始代码中`export { test, test1 }`导出了两个方法，产物中能搜索到 test1，但是使用时是拿不到 test1 的，因为只导出了 test

# url-loader

## options

### name

- 配置：`name: '[name]-[hash:7].[ext]',`
- 最终生成：`logout-b4f3b33.png`，本来的名字-7 位 hash 值.扩展名
- 也可以加上一层文件夹：`name: 'img/[name]-[hash:7].[ext]',`，最终会多一层 img 文件夹

### outputPath

- 打包文件后的输出目录，是基于`output.path`的
- 配置：`outputPath: 'assets',`
- 生成的文件的地址：`dist/assets/logout-b4f3b33.png`

### publicPath

- 资源被引用的路径
- 配置：`publicPath: 'assets',`
- 代码中引用时的地址：`<img src="assets/logout-b4f3b33.png" alt="">`，指的是相对 dist 的地址
- 开发环境中 publicPath 和 outputPath 要设置为一致，这样资源才能正确被加载

# 示例

```js
//
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  mode: "development",
  entry: "./src/main.js",
  output: {
    filename: "[name].js",
    // Webpack打包文件后的输出目录 是在生产环境中，开发环境是存在内存里的
    path: path.join(__dirname, "./dist"),
    // 表示资源(assets)被引用的根路径，在入口Index.html能看到资源路径前会加上这个
    // publicPath: '//localhost:8080'
  },
  module: {
    rules: [
      /* {
        test: /\.(gif|jpg|png|woff2?|svg|eot|ttf)\??.*$/,
        loader: 'url-loader?limit=8192'
    }, */
      {
        test: /\.(woff2?|eot|ttf|otf|svg)\??.*$/,
        // loader: 'url-loader?limit=8192'
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[name][hash:7][ext]",
            },
          },
        ],
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        use: ["vue-loader"],
        // loader: 'vue-loader'
      },
      {
        test: /\.(png|jpg)\??.*$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 4096,
              name: "img/[name]-[hash:7].[ext]", // logout-b4f3b33.png
              // 本地 publicPath 和 outputPath要设置为一致
              // 如果图片是cdn地址 可以设置publicPath
              publicPath: "assets", // 引用时的地址 <img src="assets/logout-b4f3b33.png" alt="">
              // outputPath: 'images', // 生成的文件的地址 dist/images/logout-b4f3b33.png
              outputPath: "assets", // 生成的文件的地址 dist/images/logout-b4f3b33.png
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "./public/index.html"),
    }),
  ],
};
```

# webpack5

## 处理 asset files

- [Asset Modules](https://webpack.js.org/guides/asset-modules/#root) 处理 asset files (fonts, icons, etc)，不用配置额外的 loaders
