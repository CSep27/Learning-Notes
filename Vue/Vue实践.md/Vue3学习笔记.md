# 多个应用实例

- createApp API 允许你在同一个页面中创建多个共存的 Vue 应用，而且每个应用都拥有自己的用于配置和全局资源的作用域。

# 原始 HTML

- 你不能使用 v-html 来拼接组合模板，因为 Vue 不是一个基于字符串的模板引擎。在使用 Vue 时，应当使用**组件**作为 UI 重用和组合的基本单元。

# 优化点

1. [更新类型标记](https://cn.vuejs.org/guide/extras/rendering-mechanism.html#patch-flags)

- 在为这些元素生成渲染函数时，Vue 在 vnode 创建调用中直接编码了每个元素所需的更新类型
- 运行时渲染器也将会使用位运算来检查这些标记，确定相应的更新操作

2. [树结构打平](https://cn.vuejs.org/guide/extras/rendering-mechanism.html#tree-flattening)

- 只需要变遍历打平的树，忽略模板中的静态部分

3. shallowRef 等方法，可以设置对大数据不进行深度监听
