# 视频地址
- https://www.bilibili.com/video/BV1YU4y1g745?spm_id_from=333.880.my_history.page.click
- 进度：2.10.2
- 前面看了几章基础的，中间跳过了

# 代码分离方法
## 1. 多入口
- 直接配置多入口，会存在一个问题，
- 假如A和B入口文件中都引入了lodash文件，那么lodash会被同时打包进这两个入口中，重复打包导致两个入口文件都很大
- 解决办法：
```
module.exports = {
  entry: {
    // 入口A 
    index: {
      import: './src/main.js',
      dependOn: 'shared',
    },
    // 入口B
    another: {
      import: './src/another.js',
      dependOn: 'shared',
    },
    // 共同的依赖 
    shared: 'lodash'
  },
  output: {
    filename: '[name].[hash].js',
    // Webpack打包文件后的输出目录 是在生产环境中，开发环境是存在内存里的
    path: path.join(__dirname, './dist'),
    // 表示资源(assets)被引用的根路径，在入口Index.html能看到资源路径前会加上这个
    // publicPath: '//localhost:8080'
  },
}
```

## 2. optimization.splitChunks配置
```
optimization: {
    splitChunks: {
        chunks: 'all'
    }
}
```

## 3. import动态导入
- 把这段代码放到点击事件的回调中，就会在点击之后再下载这个模块
```
import(/* webpackChunkName: 'math' */ "./math.js").then((content) => {
    console.log(content)
})
```

## 4. [预获取](https://webpack.docschina.org/guides/code-splitting/#prefetchingpreloading-modules)
- 在模块前添加注释`/* webpackPrefetch: true */`
- 效果是会增加一个`<link rel="prefetch" href="math.js">`
- [链接类型preload](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Link_types/prefetch)
- 加载完必要资源后，在网络空闲时再下载
```
import(/* webpackPrefetch: true */ "./math.js").then((content) => {
    console.log(content)
})
```

# 缓存
## 1. 输出文件名
- contenthash根据内容生成的hash值，如果内容不变，那么文件名称不变
- 有利于浏览器缓存
```
output: {
    filename: '[name].[contenthash].js'
}
```
## 2. 缓存第三方库

- 将第三方库提取到单独的chunk中，并进行缓存
- [splitChunks](https://webpack.docschina.org/plugins/split-chunks-plugin/) 有默认的配置

```javascript
splitChunks: {
  // 缓存组配置
  // https://webpack.docschina.org/plugins/split-chunks-plugin/#splitchunkscachegroups
  cacheGroups: {
    // 任意取的名称，表示一个缓存组
    vendor: {
      // 缓存node_modules文件夹下的内容
      // [\\/] 是为了跨平台兼容不同的斜杠写法
      test: /[\\/]node_modules[\\/]/,
      // 拆分chunk的名称
      // https://webpack.docschina.org/plugins/split-chunks-plugin/#splitchunksname
      name: 'vendors',
      // 所有chunks都缓存
      // https://webpack.docschina.org/plugins/split-chunks-plugin/#splitchunkschunks
      chunks: 'all',
    }
  }
}
```

# 外部扩展externals
```
// 打包时不打包jquery
// 1. 通过HtmlWebpackPlugin指定一个html模板，在模板中通过script标签引入jquery地址
// 2. 修改配置，并增加externalsType: 'script'，webpack会自动将数组中的的CDN路径放到打包出来的页面中引用
externals: {
  jquery: [
    'https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.js',
    '$'
  ]
},
// https://webpack.docschina.org/configuration/externals#externalstype
externalsType: 'script'
```

# optimization.usedExports
- https://webpack.docschina.org/configuration/optimization/#optimizationusedexports
- 默认是true
- 一个模块导出了2个方法，但是只有一个方法被其他模块导入使用了，那么打包的时候只会打包用到的那个方法

# sideEffects
- https://webpack.docschina.org/configuration/optimization/#optimizationsideeffects
- 在packages.json中配置
- true表示所有文件都是有副作用的，不能treeShaking删除
- false表示所有文件都没有副作用，可以treeShaking删除。如果此时import了一个设置样式的css文件，该文件会被自动删除，设置的样式不会生效
- 值可以设置为数组，`['*.css']`，表示css文件有作用不能删除

# devServer
- https://webpack.docschina.org/configuration/dev-server#devserverdevmiddleware
- 配置开发环境将打包内容写入硬盘，而不是默认的放在内存中
```
devServer: {
  devMiddleware: {
    writeToDisk: true
  }
}
```

# PWA 渐进式Web应用
- 可以离线使用的web应用，类似于Native App
- 使用`workbox-webpack-plugin`插件
```
plugins: {
  new WorkboxPlugins.GenerateSW({
    clientsClaim: true，
    skipWaitig: true
  })
}
```
- 在代码中注册serviceWorker
- https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API
```
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // '/service-worker.js'是webpack打包出来的文件
    // register返回的是Promise
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('success', registration)
      })
      .catch(error => {
        console.log('error', error)
      })
  })
}
```
- 现在启动服务之后将服务关闭，页面还能正常访问
- 原理是内容被缓存了，打开`chrome://serviceworker-internals`能看到
- 如果点击了unregister，那么刚刚的页面就访问不了了

# shimming 
- https://webpack.docschina.org/guides/shimming/#root
- 不推荐使用全局依赖
## 预置全局变量
- 不需要手动在代码里引入模块，即可以使用lodash
```
plugins: {
  new webpack.ProvidePlugin({
    _: 'lodash'
  })
}
```

## 改变某个模块的this指向
- [imports-loader](https://www.npmjs.com/package/imports-loader)
- 一些遗留模块的this指向window，比如index.js中有代码`this.alert('hello')`，其中this需要指向window，但是当模块运行在CommonJS上下文时，this指向module.exports了
```
module: {
  rule: {
    // 作用于哪个文件
    test: require.resolve('./src/index.js'),
    // 将其中的this指向window
    use: 'imports-loader?wrapper=window'
  }
}
```
- [require.resolve](https://nodejs.org/docs/latest-v16.x/api/modules.html#file-modules)返回的是文件的绝对路径
- require返回的是文件module.exports导出来的值

## 全局exports
- [exports-loader](https://www.npmjs.com/package/exports-loader)
```
module: {
  rule: {
    // 假设global.js是一个外部文件，其中的方法不清楚是用什么形式写的
    // 现在我们需要导入使用
    test: require.resolve('./src/global.js'),
    // 借助exports-loader，具体配置查看文档
    // 那么就可以用commonjs的方式引入使用了
    // const { parse } = require('./globals.js)
    use: 'exports-loader?type=commonjs'
  }
}
```

# 构建library
```
output: {
  // 给当前项目library取得名字
  // 比如iview源码中，这里就是'iview'
  library: 'mylib',
  // 兼容多种模块类型的一种打包方式
  libraryTarget: 'umd',
}
```

# 模块联邦
- 假设有两个子应用
- A子应用暴露其中的nav模块，B子应用可以直接引入nav模块
```
// A应用配置
const { ModuleFederationPlugin } = require('webpack').container;
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'nav', // 暴露的应用名称
      filename: 'remoteEntry.js', // 暴露的资源的路径
      remotes: {},
      exposes: {
        // 键是使用时用到
        // 值是组件所在的真实路径
        './Header': './src/Header.js'
      },
      // 共享的第三方模块，比如lodash等
      shared: {}
    })
  ]
}
```

```
// B应用配置
const { ModuleFederationPlugin } = require('webpack').container;
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'home',
      filename: 'remoteEntry.js',
      // 需要使用A应用暴露的nav
      remotes: {
        // 键是使用时用到
        // 值里的nav是A应用中配置的name
        // A应用端口3003; remoteEntry.js是配置的filename
        nav: 'nav@http://localhost:3003/remoteEntry.js'
      },
      exposes: {},
      // 共享的第三方模块，比如lodash等
      shared: {}
    })
  ]
}

// B应用中使用
import('nav/Header').then((Header) => {
  // 使用Header组件
  console.log(Header.default)
})
```

# 提升构建性能
## 通用环境提升构建性能
- https://webpack.docschina.org/guides/build-performance/
1. 更新webpack和node到最新版本
2. 将loader应用于最少数量的必要模块，配置include
3. 尽量少使用工具，每个工具需要耗时启动
4. 解析
  - 减少resolve.modules，resolve.extensions，resolve.mainFiles，reslove.descriptionFiles中的条目数量，因为他们会增加文件系统调用的次数
  - 如果不使用symlinks（例如 npm link 或yarn link），可以设置`resolve.symlinks: false`
  - 如果使用自定义resolve plugin规则并且没有指定context上下文，可以设置`resolve.cacheWithContext: false`
5. 小即是快
  - 使用数量更少/体积更小的library
  - 在多页面应用程序中使用splitChunksPlugin，并开启async模式
  - 移除未引用代码
  - 只编译你当前正在开发的那些代码
6. 持久化存储
