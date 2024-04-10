### Webpack 支持的模块化规范

1. COMMONJS
2. AMD
3. ES6 Module

- webpack 运行在 nodejs 环境中，用的是 COMMONJS 规范
- AMD 和 ES6 Module 一般在项目代码中使用

### Webpack 核心概念

#### 配置文件

- 是 Webpack 打包的依据

#### 核心概念

1. entry
2. output
3. loader
4. plugin

### 打包命令

#### 全局安装 webpack

- npm i webpack -g
- 打包命令
  - webpack (以当前目录下名为 webpack.config.js 的文件作为配置文件进行打包)
  - webpack --config 配置文件名称 (指定一个文件作为配置文件打包)

#### 安装局部 webpack

1. npm i webpack@3.0.1 --save
2. 配置 package.json

```
{
    "script": {
        "build": "webpack"
    }
}
```

3. 运行 npm run build （由于全局和局部的 webpack 版本不同,此时再直接运行 webpack 会报错）

- 直接用 webpack 命令使用的是全局的 webpack 进行打包，使用 npm run build 命令首先是用局部的，如果没有局部的再用全局的

### JS 的编译

#### 编译 ES6 的语法

- babel-loader
  1. 安装 npm install babel-loader @babel/core -save-dev
  ```
  module: {
      rules: [
          {
              test: /\.js$/,
              use: 'babel-loader'
          }
      ]
  }
  ```
  2. presets 是储存 JS 不同标准的插件，告诉 babel 按照哪个规范编译 安装 npm install @babel/preset-env -save-dev
  - 常见规范
    - es2015
    - es2016
    - es2017
    - env(通常采用)
    - babel-preset-stage
  - 增加 presets 配置
  ```
  module: {
     rules: [
         {
             test: /\.js$/,
             use: {
                 loader: 'babel-loader',
                 options: {
                     presets: [
                         '@babel/preset-env',
                         {
                             targets: {
                                 browsers: ['>1%'] // 全球市场占有率大于1%的浏览器都能识别的
                                 // node: '10'
                                 // chrome: '59'
                             }
                         }
                     ]
                 }
             }
         }
     ]
  }
  ```
  - targets 是 preset 的核心配置，告诉 preset 编译的具体目标，支持以 browsers(常用)、node 或特定浏览器为目标

#### 编译 ES6 的方法

1. babel-polyfill
   - npm install babel-polyfill --save-dev
   - 生效方式 生成一个全局对象，用 ES5 实现所有 ES6 的方法， 一般用于项目开发
   - 使用
     - 第一种：直接在文件中 import 'babel-polyfill' 不需要进行配置
     - 第二种：在 entry 配置里增加
     ```
     entry: {
         app: ['babel-polyfill', './app.js']
     }
     ```
2. babel-plugin-transform-runtime
   - npm install babel-plugin-transform-runtime babel-runtime --save-dev （此处仅为示意，实际安装时需要安装与 babel 版本对应的插件，所以命令可能会不同）
   - 生效方式 生成一个局部对象，只对使用的方法使用 ES5 重新实现，体积小，不会造成全局污染，所以一般用于框架开发
   - 使用：可以直接在配置文件里写，或者新建一个名叫.babelrc（名称固定）的文件，存放所有关于 babel 的配置。将配置文件中对应 options 中的内容都放到这个文件中
     ```
     {
         "presets": [
            '@babel/preset-env',
            {
                "targets": {
                    "browsers": ['>1%'] // 全球市场占有率大于1%的浏览器都能识别的
                    // node: '10'
                    // chrome: '59'
                }
            }
        ],
        "plugins": [
             ['@babel/transform'] // 前面安装babel使用的@babel/core的版本，所以此处安装了对应的版本 npm install @babel/plugin-transform-runtime @babel-runtime --save-dev
        ]
     }
     ```

#### 编译语法糖

#### 编译 Typescript

1. 安装 typescript 和 ts-loader
   - npm i typescript ts-loader --save-dev
2. 写入配置文件
   ```
   module: {
      rules: [
          {
              test: /\.tsx?$/,
              use: {
                  loader: 'ts-loader'
              }
          }
      ]
   }
   ```
3. 编写 tsconfig.json(类似.babelrc,ts-loader 的额外配置)
   ```
   {
       "complierOptions": {
           "module": "commonjs", // 规范
           "target": "es5" // 编译成
       },
       exclude: ["./node_modules"] // 不编译的文件夹
   }
   ```

#### 常见语法糖编译

- 基本和 ts 的三步的相同：
  1. 安装对应 loader
  2. 写入配置文件
  3. 根据 loader 规则写配置

### CSS 的编译

#### CSS

1. 安装

- css-loader，让 css 可以被 js 正确的引入
- style-loader，让 css 被引入后可以被正确的通过 style 标签插入页面
- 先经过 css-loader 处理，再由 style-loader 处理
- npm i style-loader css-loader --save

2. 配置

- 定义在后面的 loader 先执行，所以 css-loader 要写在后面！

```
module: {
   rules: [
       {
           test: /\.css$/,
           use: [
                {
                    loader: 'style-loader',
                    options: {
                        insertAt: 'top', // 相对于头部
                        // insertInto: '#mydiv'
                        singleton: true,
                        tranform: './tranform.js' // 指定哪个文件对css进行修改
                    }
                }，
                {
                    loader: 'css-loader',
                    options: {
                        module: {
                             // webpack4以下的版本此配置写在module平级的位置
                            localIdentName: '[path][name]_[local]_[hash:4]' // 设置编码后的类名，方便阅读
                        }

                    }
                }
           ]
       }
   ]
}
```

3. style-loader 的核心配置

- insertAt style 标签插入到哪一块区域
- insertInto 插入指定的 DOM
- singleton 是否合并为一个 style 标签
- transform 在浏览器环境下，插入 style 到页面前，用 js 对 css 进行操作

```
// tranform.js
module.exports = function (css) {
    // 可以获取到window对象
    // css是字符串
    if (window.screen.width < 500) {
        css = css.replace('red', yellow)
    }
    return css
}
```

4. css-loader 的核心配置

- minimize 是否压缩 css（注意：webpack4+版本不支持）
- module 是否使用 css 模块化
- alias css 中的全局别名（注意：webpack4+版本不支持）

```
// test.css 使用css模块化 moule设置为true
// 定义全局类名 打包后不会重新编码
:global .border-white {
    border: 4px solid white;
}
// 定义局部类名 会重新编码，所以如果在html里直接加div1类名样式不会生效
:local .div1 {
    width: 50px;
    height: 50px;
    composes: border-white; // 继承
    // composes: boder-yellow from './test1.css' // 从其他文件继承
}

// app.js 解决局部类名重新编码的问题
import test from './test.css'
import test1 from './test1.css'
document.getElementById('mydiv'.setAttribute('class', test.div1)
```

#### less

1.  - less
    - less-loader
2.  配置

```
module: {
   rules: [
       {
           test: /\.less$/,
           use: [
                {
                    loader: 'style-loader'
                }，
                {
                    loader: 'css-loader',
                    options: {
                        module: {
                             // webpack4以下的版本此配置写在module平级的位置
                            localIdentName: '[path][name]_[local]_[hash:4]' // 设置编码后的类名，方便阅读
                        }

                    }
                },
                {
                    loader: 'less-loader'
                }
           ]
       }
   ]
}
```

#### sass

1.  - sass-loader
    - node-sass

### 提取 css 代码

1. 安装对应的插件 extract-text-webpack-plugin 将 css 提取为单独的文件

- npm i extract-text-webpack-plugin --save // 只能在 webpack3 中使用
- npm i extract-text-webpack-plugin@next --save // 在 webpack4 中使用
- 注意：依赖于局部的 webpack，所以要在当前项目安装 webpack

2. 改造 loader 处的写法，在 plugin 处添加

```
var extractTextCss = require('extract-text-webpack-plugin')
module.export = {
    entry: {
        app: './app.js'
    },
    output: {
        path: __dirname + '/src/dist',
        filename: './[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: extractTextCss.extract({
                   fallback: {
                        loader: 'style-loader'
                   },
                   use: [
                        {
                            loader: 'css-loader',
                            options: {
                                module: {
                                    localIdentName: '[path][name]_[local]_[hash:4]'
                                }

                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss', // 指定下面的plugins给谁使用
                                plugins: [
                                    require('autoprefixer')({
                                        'overrideBrowserslist': [
                                            '>1%', 'last 2 versions' // 指定兼容到的浏览器
                                        ]
                                    }), // 给样式加前缀插件，用于兼容
                                    require('postcss-css-next')() // 兼容下一代css语法
                                ]  // 安装后需要require调用
                            }
                        },
                        {
                            loader: 'less-loader'
                        }
                   ]
                })
            }
        ]
    },
    plugins: [
        new extractTextCss({
            filename: '[name].min.css'
        })
    ]
}
```

3. 在 html 中手动引入打包后的 css 文件

#### postcss

- npm i postcss postcss-loader autoprefixer postcss-cssnext --save

#### 全局兼容性配置

- 由于涉及到兼容性的插件都需要配置兼容到哪个版本，因此可以在 package.json 中统一设置。或者写到单独的.browserslistrc 文件中

```
{
    "browserslist": [
        '>1%', 'last 2 versions'
    ]
}
```

### 处理 HTML

1. 安装
   - npm i -D html-webpack-plugin
   - 配置
     1. filename 打包生成 html 文件的名字
     2. template 指定一个 html 文件为模板
     3. minify 压缩 html
     4. inject 是否插入 js,css 插入的位置
     5. chunks 多入口时，指定引入
2. 配置

```
var extractTextCss = require('extract-text-webpack-plugin')
var htmlWebpackPlugin =  require('html-webpack-plugin')
module.export = {
    entry: {
        app: './app.js',
        app2: './app2.js'
    },
    output: {
        path: __dirname + '/src/dist',
        filename: './[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: extractTextCss.extract({
                   fallback: {
                        loader: 'style-loader'
                   },
                   use: [
                        {
                            loader: 'css-loader',
                            options: {
                                module: {
                                    localIdentName: '[path][name]_[local]_[hash:4]'
                                }

                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss', // 指定下面的plugins给谁使用
                                plugins: [
                                    require('autoprefixer')({
                                        'overrideBrowserslist': [
                                            '>1%', 'last 2 versions' // 指定兼容到的浏览器
                                        ]
                                    }), // 给样式加前缀插件，用于兼容
                                    require('postcss-css-next')() // 兼容下一代css语法
                                ]  // 安装后需要require调用
                            }
                        },
                        {
                            loader: 'less-loader'
                        }
                   ]
                })
            }
        ]
    },
    plugins: [
        new extractTextCss({
            filename: '[name].min.css'
        }),
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: './index.html',
            minify: {
                collapseWithespace: true
            }, // 通过第三方插件压缩的
            chunks: ['app'] // 只会引入打包的app.js
        })
    ]
}
```

### webpack 的环境

#### 不同环境下的配置

- 告诉 webpack 当前环境
  - webpack --env envname
- 编写配置文件区分环境
  1. 编写一个开发环境配置文件
  ```
  // webpack.dev.js
  module.exports = {}
  ```
  2. 编写一个生成环境配置文件
  ```
  // webpack.pro.js
  module.exports = {}
  ```
  3. 在基础配置引入开发和生成配置
  ```
  // webpack.config.js
  const dev = require('./webpack.dev.js')
  const pro = require('./webpack.pro.js')
  const merge = require('webpack-merge') // 需安装webpack合并工具
  module.exports = env => {
      console.log(env) // 这里就能获取到envname
      var common = {}
      return merge(common, env === 'production ? pro : dev')
  }
  ```
  4. 判断 env 参数，合并对应的配置
- 在 package.json 文件中配置自定义命令
  ```
  {
      "scripts": {
          "build": "webpack --env production",
          "dev": "webpack-dev-server --env development"
      }
  }
  ```
  - 运行 npm run build 开发环境打包
  - 运行 npm run dev 生产环境打包

#### webpack4 中的环境区分

- webpack --mode production/development/none
- 指定环境后根据 webpack 默认的配置进行打包
- 未指定 mode 会有告警，可以在 package.json 中配置 mode 消除告警

### webpack-dev-server

- 模拟线上环境进行项目调试的工具
- 常用额外功能
  1. 路径重定向
  2. 浏览器中显示编译错误
  3. 接口代理
  4. 热更新
- 使用步骤
  1. 安装 webpack-dev-server 分全局和局部
  -
  2. 配置 devServer 字段
  ```
  // webpack.config.js
  module.exports = {
      devServer: {
          port: 9000
      }
  }
  ```
  3. 利用命令行开启服务 npm run dev
  ```
  // package.json
  {
      "scripts": {
          "dev": "webpack-dev-server --open" // --open 自动打开浏览器
      }
  }
  ```
- devServer 常用配置
  1. inline 服务的开启模式
  2. port 代理接口
  3. historyApiFallback 路径重定向 一般用于 404
  4. hot 热更新
  5. lazy 懒编译 多入口时使用
  6. overlay 错误遮罩
  7. proxy 代理请求 解决跨域问题
  ```
  // webpack.config.js
  module.exports = {
      devServer: {
          port: 9000,
          inline: false, // 页面顶部显示状态条
          // historyApiFallback: true, // 输入不存在的路由不会跳转提示找不到，而是停留在当前页面
          historyApiFallback: {
              rewrites: [
                  {
                      from: /^\/[-~]+/,
                      to: function(context) {
                          return './' + context.match[1]+'.html'
                      }
                  }
              ]
          }, // 指定重定向规则
          proxy: {
              '/': { // 匹配路径
                  target: '128.23.321.1', // 转发到
                  changeOrigin: true,
                  pathRewrite: {
                      '^/comments': '/api/comments' // 右边，实际转发的路径
                  },
                  headers: {},
                  hot: true, // 与extractTextCss不兼容，开启时需要将其禁用
                  hotOnly: true // 只使用热更新不使用live-reloading ，修改代码后页面不刷新直接改变
              }
          }
      }
  }
  ```
  - 注： 修改 JS 代码时页面不刷新直接改变，要在代码里增加
  ```
  if (module.hot) {
      // 接收代码更改
      module.hot.accept()
  }
  ```

#### source-map

- 定位打包后的代码对应与源文件的位置

```
// webpack.config.js
module.exports = {
    devtool: 'eval-source-map'
}
```

- 开发模式
  - eval 无需 source-map
  - eval-source-map 需要简单的调试
  - cheap-eval-source-map 较为详细的调试
  - cheap-module-source-map 开发过程一般使用
- 生产模式
  - source-map 上线后一般使用
  - hidden-source-map 一般不使用
  - nosource-source-map 一般不使用

### webpack 原理解析

- webpack 依赖于 node 的环境和文件操作系统，webpack 打包就是利用 node 去读取文件，进行一些字符串处理后，再利用 node 去写入文件

#### webpack 打包流程

1. 读取配置文件
2. 注册内部插件与配置插件
3. loader 编译
4. 组织模块
5. 生成最终文件导出

#### loader 原理

- loader 是一个方法：接收一个字符串，方法内部处理完后再返回字符串

```
// webpack.config.js
module.exports = {
    module: {
        rules: [
            {
                test: /\.wy$/,
                use: './wy-loader'
            }
        ]
    }
}
// wy-loader/index.js
moduele.exports = function (resource) {
    // return resource.replace('c', 'console.log')
    // webpack提供的方法 可以返回多个值
    this.callback(err, resource.replace('c', 'console.log'), sourcemap)
}
// app.js
import './test.wy'
// test.wy
c(1)

```

#### 打包结果分析

- 打包代码

```
(function (modules) {
    function __webpack_require__(moduleId){}
    return __webpack.require(__webpack_require__.s = './app.js')
})({
    './app.js': (function () {}),
    'mode1.js': (function () {}),
    'mode2.js': (function () {}),
})
```

#### dev-server 原理分析

- dev-server 利用 express 和一个中间件 webpack-dev-middleware 来开启服务，然后开启的 server 会执行打包出来的代码

### 图片等资源的处理

#### 1. 引入资源文件的 loader

- file-loader 能够正常引入所有资源文件
- url-loader 是 file-loader 的二次封装，增加了一些新功能

#### 2.1 css 中图片的处理

- img-loader 图片的优化，本身没有功能，相当于一个插槽，通过插件实现功能

```
module.exports = {
    output: {
        path: __dirname + '/dist',
        publicPath: '' // 公共的publicPath
    },
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif|jpeg)$/,
                use: [
                    /* {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash:4]:[ext]', // ext 表示文件后缀名
                            outputPath: 'assets/img',
                            publicPath: '' // 某种文件的publicPath
                        }
                    }, */
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[hash:4]:[ext]', // ext 表示文件后缀名
                            outputPath: 'assets/img',
                            publicPath: '',
                            limit: 5000 // 5kb 小于该值的图片转换成base64，转换后会直接渲染，不再是异步请求，所以过大的图片也转换会导致页面加载慢
                        }
                    },
                    {
                        loader: 'img-loader',
                        options: {
                            plugins: [
                                require('imagemin-pngquant')({
                                speed: 10// 1-11 值越小，压缩的体积越小
                                }),
                                require('imagemin-mozjpeg')({
                                quality: 10// 1-100 值越小，压缩的体积越小
                                }),
                                require('imagemin-gifsicle')({
                                optimizationLevel: 1// 1,2,3 值越大，压缩的体积越小
                                }),
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

- png 压缩的到 0.5 左右，gif、jpg 等图片看情况压缩到 0.8 到 0.6；base 转码一般在 5000byte 左右
-

#### 2.2 html 中图片的处理

1. 在 html 中使用模板字符串的写法

```
// html
<img src="${require('./assets/image/img4.jpg')}"/>
```

2. 使用 html-loader

```
{
    test: /\.html$/,
    use: {
        loader: 'html-loader',
        options: {
            attrs: ['img:src', 'img:data-src'] // 如果写了懒加载，img标签上增加data-src属性
        }
    }
}
```

#### 3. 雪碧图

1. postcss-sprites

- 属于 postcss-loader 的插件，会自动把 css 文件中引入的背景图合并成雪碧图，并修改 css 文件。由于是按照原图大小定位，因此只适用于图片与背景刚好 1:1 的情况
- postcss-loader 放在所有 css-loader 的最后

```
{
    loader: 'postcss-loader',
    options: {
        plugins: [
            require('postcss-sprites')({
                spritePath: './dist/asstes/sprite'
            })
        ]
    }
}
```

2. webpack-spritesmith

- 一个独立的插件，会按照指定的路径的指定图片，生成一个雪碧图，和一个雪碧图相关的 css。不会修改原 css。可以配置参数指定要处理的图片，但是最后需要手动添加类名。

```
const webpackSpriteSmith = require('webpack-spritesmith')
module.exports = {
    plugins: {
        new webpackSpriteSmith({
            src: {
                cwd: path.join(__dirname, 'src/assets/img'), // 指定要处理的图片文件夹
                glob: '*.jpg'// 处理什么类型的图片
                target: {
                    image: path.join(__dirname, 'dist/sprites/sprite.png'),
                    css: path.join(__dirname, 'dist/sprites/sprite.css')
                },
                apiOptions: {
                    cssImageRef: './sprite.png', // 调用雪碧图的路径
                }
            }
        })
    }
}

```

#### 4. 其他资源的处理

1. 定义 test 规则
2. 使用 url-loader 或 file-loader
3. 规划路径

```
module.exports = {
    module: {
        rules: [
            {
                test: /\.html$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'img:data-src', 'video:src']
                    }
                }
            }
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/, // 处理字体文件
                use: {
                    loader: 'url-loader'
                }
            },
            {
                test: /\.mp4$/, // 处理视频文件 写在html中的 配合html-loader
                use: {
                    loader: 'url-loader'
                }
            }
        ]
    }
}
```

### 代码分割与体积优化

- 减少加载代码的大小
- 提取公共资源，减少加载次数
- 多入口配置

```
module.exports = {
    entry: {
        app: './app.js',
        app2: './app2.js'
    },
    plugins: [
        // 多入口时
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: './index.html',
            chunks: ['app']
        }),
        new htmlWebpackPlugin({
            filename: 'index2.html',
            template: './index.html',
            chunks: ['app2']
        })
    ]
}
```

- 多页面应用 提取公共依赖
  - 主业务代码+公共依赖+第三方包+webpack 运行代码
- 单页面应用 减少文件体积，拆分应用，把需要异步加载的改成异步加载
  - 主业务代码+异步模块+第三方包+webpack 运行代码

#### 如何代码分割

- webpack3 CommonChunksPlugin

```
const webpack = require('webpack')
module.exports = {
    plugins: {
        new webpack.optimize.CommonChunksPlugin({
            name: 'vender', // 第三方包
            minChunks: 'infinity' // 只要出现就打包
        }),
        new webpack.optimize.CommonChunksPlugin({
            name: 'manifest', // webpack运行代码
            minChunks: 'infinity'
        }),
        new webpack.optimize.CommonChunksPlugin({
            name: 'app.js', // 业务代码
            minChunks: '2' // 重复出现2次的才打包
        })
    }
}
```

- webpack4 SplitChunksPlugin

```
// app.js
// 异步加载模块
// 注释的作用是指定该模块打包后的名称
import ( /*webpackChunkName:'ma'*/ './modulea.js')
// 异步加载模块
require.ensure([], function () {
    require('./modulea.js')
})
// webpack.config.js
module.exports = {
    optimization: {
        minimize: true, // 模式设置为production会自动将压缩置为true
        splitChunks: {
            chunks: 'initial', // initial 只对入口文件进行模块分析；all 所有文件； async
            minSize: 30000, // 默认对大于30kb的模块进行提取
            // 未定义时，默认会将公共的第三方依赖分开打包到vendor
            // 自定义提取规则
            cacheGroups: {
                mode1: {
                    test: /mode1/
                },
                vendor: {
                    test: /([\\/]node_modules[\\/])/, // 将node_modules文件夹的内容提取出来放到vender中,
                    name: 'vender',
                    chunks: 'all'
                }
            }
        },
        runtimeChunk: true // 提取webpack运行代码
    }
}
```

- 清除之前的 dist

```
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
module.exports = {
    plugins: [
        new CleanWebpackPlugin()
    ]
}
```

#### 代码体积控制

- webpack3 optimize.UglifyJsPlugin()
- webpack4 mode 设置为 production 会自动开启压缩(minimize)和 treeShaking 模式
- treeShaking 建立在依赖流的基础上 不打包没用到的代码

```
// modulea.js
export a = function () {}
export b = function () {}
// app.js 引入并且使用了
import {a} from './modulea.js'
a()
// 在打包时只会将modulea.js中a的内容打包进去
// jquery这类框架都是立即执行函数，所以无法treeShaking
```
