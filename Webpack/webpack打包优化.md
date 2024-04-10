### 打包优化

- chunks 代码块，即 webpack 把 js 分割成了几块代码
- module 模块，每一个文件即一个模块

#### 获取可视化的打包结果分析

- 官方版本
  1. Mac: webpack --profile --json >stats.json (将打包结果形成名为 stats 的 json 文件并输出)
  2. Windows: webpack --pofile --json | Out-file 'stats.json' -Encoding OEM
  - 将生成的 json 文件传到 webpack.github.io/analyse 网站上获得可视化的分析结果
- 社区版本
  - webpack-bundle-analyzer 需要 npm 安装
  ```
  var wba = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  module.export = {
      plugins: {
          new wba()
      }
  }
  ```

#### mini-css-extract-plugin

- 将 css 打包成单独的文件
- 使用该插件不能使用 style-loader

```
var MiniCssExtractPlugin = require('mini-css-extract-plugin')
moule.exports = {
module: {
   rules: [
       {
           test: /\.css$/,
           use: [
                {
                    loader: MiniCssExtractPlugin.loader
                }，
                {
                    loader: 'css-loader'
                }
           ]
       }
   ]
}
plugins: {
    new MiniCssExtractPlugin({
        filename: '[name].css'
    })
}
}
```

#### 优化打包速度

##### 项目本身

1. 减少依赖嵌套深度
2. 使用尽可能少的处理，每一个 webpack 操作都会增加打包时间

##### webpack 层面

1. dll 处理

- 第三方包由于基本不会变化所以可以先打包好放在那里

```
// webpack.dll.js
const webpack = require('webpack')
module.exports = {
    // 需要打包的第三方库
    entry: {
        jquery: ['jquery'], // 值必须为数组
        loadsh: ['loadsh']
    },
    output: {
        path: __dirname + '/src/dll',
        filename: './[name].js',
        library: '[name]' // 引用名称，使用时的名称
    },
    plugins: [
        new webpack.DllPlugin({
            path: __dirname + '/src/dll/[name].json', // 用于关联
            name: '[name]'
        })
    ]
}
// webpack.config.js
module.exports = {
    entry: {},
    output: {},
    plugins: [
        // 通过json文件，将已经打包好的第三方模块和现在的关联起来。之后打包过程中再遇到引用这两个模块的地方就是直接去找之前已经打包好的文件
        new webpack.DllReferencePlugin({
            manifest: require('./src/dll/jquery.json')
        }),
        new webpack.DllReferencePlugin({
            manifest: require('./src/dll/loadsh.json')
        })
    ]
}
```

2. 通过 include 减少处理范围
3. happypack
   - 多进程处理 如果处理的文件不多，可能适得其反，因为增加优化操作也会增加处理时间
4. uglify 优化 webpack4 中已移除
5. 减少 resolve，sourcemap，cache-loader，用新版本的 node 和 webpack

```
// webpack.prod.conf.js
const HappyPack =  require('happypack')
// 新建线程池
// node模块自带的os模块
const os = require('os')
const happypackThreadPool = HappyPack.ThreadPool({size: os.cpus().length}) // size 线程池里的子进程数量

module.exports = {
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'happypack/loader?id=happyVue', options: VueConfig
            },
            {
                test: /\.js$/,
                loader: 'happypack/loader?id=happyBabel', // 代替原来的babel-loader
                include: [resolve('src')] // 指定处理的文件夹范围
            },
            {
                test: /\.png$/,
                loader:['cache-loader', 'url-loader'] // cache-loader加在第一个 作用不大
            },
        ]
    },
    plugins: [
        new HappyPack({
            id: 'happyBabel', // 指定id
            loader: [
                {
                    loader: 'babel-loader?cacheDirectory=true', // cacheDirectory是否需要缓存
                }
            ],
            threadPool: happypackThreadPool // 线程池
        }),
        new HappyPack({
            id: 'happyVue',
            loader: [
                {
                    loader: 'vue-loader?cacheDirectory=true',
                }
            ],
            threadPool: happypackThreadPool // 线程池
        }),
        new UglifyPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            },

            parallel: true,
            cache: true // 开启压缩缓存

        })
    ]
}
```

#### 长缓存优化

- 打包出的文件名会加上一个 hash 值是为了实现缓存更新，浏览器或根据文件名确认文件是否改动
- 把 hash 改为 chunkhash 只有 chunk 变动时文件名才变动，避免使用打包 hash 时没有改动的模块名称也跟着变化

```
output: {
    filename: './[name].[chunkhash].js'
},
plugins: {
    new NamedChunksPlugin(),
    new NamedModulesPlugin()
}
```

- 没改变第三方模块，但是改变了引用顺序，删除或增加也会导致 chunkhash 变化。NamedChunksPlugin 和 NamedModulesPlugin 插件（webpack 自带），使用文件名命名 chunks
- mini-css-extract-plugin 支持 hash 命名，所以也可以实现优化，不过作用不大
- 问题？长缓存优化要再看看

### eslint

- eslint + eslint-loader 核心内容
- eslint-plugin-html
- eslint-friendly-formatter 友好提示
- eslint-config-stand 代码风格标准

```
{
    test: /\.js$/,
    loader: 'eslint-loader',
    options: {
        formatter: require('eslint-friendly-formatter')
    }
}
// .eslintrc.js 自定义风格标准
module.exports = {
    root: true,
    env: { // 以什么为目标
        browser: true
    },
    extends: [
        'standard',
        'plugins: vue/essential', // eslint-plugin-vue
    ],
    // 自定义规则
    rules: {
        'no-debugger': 'on', // 禁止debugger
        'generator-star-spacing': process.env.NODE_ENV === 'production' ? 'on' : 'off',
        'indent': 'off',
        'no-console': 'on'
    }
}
```

### plugins 和 loader

#### webpack.DefinePlugin

- 定义全局变量

#### webpack.NoEmitOnErrorsPlugins

- 屏蔽错误 打包时出现错误可以先屏蔽掉继续打包

#### webpack.ProvidePlugin

- 提供全局的模块 一个包很多地方都需要用，可以使用该插件

#### copy-webpack-plugin

- 提供静态拷贝 把指定目录拷贝到打包结果中，一般用于生产模式

```
plugins: {
    new webpack.ProvidePlugin({
        $: 'jquery'
    }),
    new CopyWebpackPlugin([
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
    })
}
```

### 环境的区分

#### 项目环境

- 开发
- 测试
- 预发
- 线上

#### 配置环境

- 开发
- 测试 生产环境配置加上开发工具
- 线上

### 项目问题解决

- 不要把配置当配置，当成一个程序

#### 解决方案归纳

- 如果是要对模块内容进行处理，loader 是第一解决方案
- 如果要增加一些特殊的功能，可以自定义增加插件
- 项目的打包简化，可变性配置等。通过编写相应的操作函数
