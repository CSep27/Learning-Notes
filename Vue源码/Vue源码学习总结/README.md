学习 Vue 源码过程中自己总结的笔记

1. 观察者模式，先搞懂这个核心，并且用用户自定义 watcher 作为例子，视图 watcher 做例子比较麻烦
2. 搞懂编译器
3. 搞懂 diff 算法
4. 从 new Vue()到 mount，总流程。那么基本上全流程跑通，数据更新也明白
5. 再看每一个点

`new Vue()`时 initData，将数据变成了响应式

mount 时 `new Watcher()`，执行一次 get 取值操作

1. 触发 getter 函数，执行 dep.depend()，建立目标和观察者关系
2. 获取到的值存储起来，用于后续判断变化与否

# 学习时如何调试 vue 源码

- 当使用 vue-loader 或 vueify 的时候，`.vue` 文件内部的模板会在构建时预编译成 JavaScript。所以，最终打包完成的文件实际上是不需要编译器的，只需要引入运行时版本即可。

在 vue-cli 生成的项目中调试源码，用的是 vue.runtime.esm.js，即运行时版本。编译是有 vue-loader 完成的，具体可以看翻译 vue-loader 那篇文章。

如果要看编译器的内容，可以在 html 文件中引入完整版 vue.js，进行调试
看`Vue源码/Vue.js源码学习练习/test/vue-test-compile.html`
