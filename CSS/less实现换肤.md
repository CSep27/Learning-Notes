框架： Vue+less+ECharts

#### 实现思路

1. 将皮肤值存入 localStorage，登录后从 localStorage 取值设置皮肤
2. 点击换肤时，给 body 设置不同的类名，每个类名下调用 less 的函数，传入不同颜色值。函数中使用变量对颜色进行设置。变量可以用 less 的变量，也可以使用[CSS 变量](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)。定义的 CSS 变量还可以在每个.vue 页面中使用，更加灵活。

#### 环境

1. 安装 less
   ```
   npm install --save less less-loader
   ```
   - [less 教程](https://www.w3cschool.cn/less/)
2. webpack 配置
   ```
   module: {
      rules: [
          {
              test: /\.less$/,
              use: [
                   {
                       loader: 'style-loader' // 让css可以被js正确的引入
                   }，
                   {
                       loader: 'css-loader', // 让css被引入后可以被正确的通过style标签插入页面
                       options: {}
                   },
                   {
                       loader: 'less-loader' // 定义在后面的loader先执行
                   }
              ]
          }
      ]
   }
   ```
   - 注：用 Vue Cli 生成项目的不需要再进行配置。（[官方文档](https://cli.vuejs.org/zh/guide/css.html#%E5%BC%95%E7%94%A8%E9%9D%99%E6%80%81%E8%B5%84%E6%BA%90)）
   - 如果需要额外添加 webpack 配置，可以在根目录下新建 vue.config.js 文件。（[官方文档](https://cli.vuejs.org/zh/guide/webpack.html)）

#### 代码

1. less 代码，也可以使用 CSS 变量实现换肤
   - 定义 theme 函数，需要换肤的颜色样式使用变量，传入默认值
   ```
   // static/less/theme.less
   .theme(
       @primary-color: #2d8cf0;
       @text-color: red;
       @background-color: #fff;
   ) {
       /* CSS变量 */
       body {
           --color-title: #1c2438;
           --color-border: #dddee1;
           --color-bg: #f1f1f1;
       }
       .wrapper {
           color: @text-color;
           background-color: @background-color;
           border: 1px solid var(--color-border);
       }
       .button-primary {
           background-color: @primary-color;
       }
   }
   ```
   - 定义不同皮肤下的类名，调用 theme 函数，传入变量值
   ```
   // static/less/color.less
   @import './theme.less';
   // 默认样式，使用默认颜色值
   .theme-default {
     .theme()
   }
   // 蓝色皮肤，传入颜色值
   // 定义CSS变量值
   .theme-blue {
     --color-title: #eeeeee;
     --color-border: #315280;
     --color-bg: #162947;
     .theme(
       @primary-color: #227fdf;
       @background-color: #162947;
       @text-color: #b5bbc9;
     )
   }
   ```
2. 点击切换皮肤
   ```
   // html
   <div>
         <button @click="changeSkinTheme('default')">default</button>
         <button @click="changeSkinTheme('blue')">blue</button>
       </div>
   // js
   export default {
       created () {
           this.$store.commit('changeSkinColor', this.$store.getters.getTheme)
       },
       methods: {
           changeSkinTheme (skinTheme) {
             if (skinTheme !== this.$store.getters.getTheme) {
               window.location.reload()
               this.$store.commit('setTheme', skinTheme)
               this.$store.commit('changeSkinColor', skinTheme)
             }
           }
       }
   }
   ```
3. 使用 Vuex 管理皮肤值，从 localStorage 中读取和存储

   ```
   // store/module/menu.js
   import $ from 'jquery'

   let userConfig = JSON.parse(window.localStorage.getItem('userConfig'))
   let defaultUserConfig = {theme: 'default'}
   userConfig = $.extend(defaultUserConfig, userConfig)

   const state = {
     theme: userConfig.theme,
     themeList: ['default', 'blue'],
     echartsTheme: 'light'
   }

   const getters = {
     getTheme: state => state.theme,
     getEchartsTheme: state => state.echartsTheme,
   }

   const mutations = {
     // 设置echarts主题
     setEchartsTheme (state, theme) {
       let echartsTheme = 'light'
       if (theme) {
         switch (theme) {
           case 'blue':
             echartsTheme = 'blue'
             break
         }
       }
       state.echartsTheme = echartsTheme
     },
     // 设置主题
     setTheme (state, theme) {
       if (theme && state.themeList.indexOf(theme) > -1) {
         state.theme = theme
         console.log(state.theme)
         let userConfig = JSON.parse(window.localStorage.getItem('userConfig'))
         !userConfig && (userConfig = {})
         userConfig.theme = theme
         window.localStorage.setItem('userConfig', JSON.stringify(userConfig))
       }
     },
     // 根据主题修改皮肤
     changeSkinColor (state, theme) {
       switch (theme) {
         case 'default':
           $('body').removeClass('theme-blue')
           $('body').addClass('theme-default')
           break
         case 'blue':
           $('body').removeClass('theme-default')
           $('body').addClass('theme-blue')
           break
       }
       this.commit('setEchartsTheme', theme)
     }
   }

   export default {
     state,
     getters,
     mutations
   }
   ```

4. 实现 echarts 换肤
   - [echarts 官网主题在线构建](https://www.echartsjs.com/theme-builder/)
   - 自定义主题-下载配置-选择 JSON 文件（项目中使用）
   - 同时导出配置（用于下次导入配置修改，可以预览效果）
   ```
   // main.js
   // 导入less文件
   import './static/less/color.less'
   import echarts from 'echarts'
   // 导入echarts主题配置文件
   import blueEchartsTheme from './static/vendor/purple-passion.json'
   // 注册主题
   echarts.registerTheme('blue', blueEchartsTheme)
   ```
   ```
   // 生成图表实例时，传入第二个参数为echarts主题
   this.$echarts.init(document.getElementById('line_chart'), this.$store.getters.getEchartsTheme)
   ```
