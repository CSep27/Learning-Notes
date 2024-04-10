[如何把 table 组件性能提升 10 倍](https://mp.weixin.qq.com/s/8S4YoFllhpN68-OlJWcWag) - 黄轶

## 减少 DOM 的渲染数量

优化方向：table 组件尽可能减少 DOM 的渲染数量。

现象：列很多，比如 20 列，前后有固定列。此时分页支持一页 200 条数据时，第一列有选择框，需要选择数据进行操作，会卡顿。

原因分析：实现固定列布局，ElementUI 使用了 6 个 table 标签实现。表头和表体各自用了一个 table。左右侧 fixed 的表格，加 4 个，一共 6 个。fixed 表格从 DOM 上都渲染了完整的列，然后从样式上控制显示隐藏。

优化措施：

1. 针对固定列，只渲染固定列中需要展示列的 DOM，然后做好高度同步
2. 对于 20 列的表格，初次渲染仅渲染关键列（展示的列），其他列通过配置方式动态渲染。用户修改了渲染的列之后，在前端存下来，方便下一次渲染。

## 更新渲染的优化

定位问题：打开 Performance 面板记录 checkbox 点选前后的性能。

黄色部分是 Scripting 脚本的执行时间，紫色部分是 Rendering 所占的时间。绿色部分是渲染。

观察 JS 脚本执行的 call tree，查看具体函数的执行时间。

组件的 render to vnode 花费的时间约 600ms；vnode patch to DOM 花费的时间约 160ms。

因为点选了 checkbox，在组件内部修改了其维护的选中状态数据，而整个组件的 render 过程中又访问了这个状态数据，因此当这个数据修改后，会引发整个组件的重新渲染。

而又由于有 1000 \* 7 条数据，因此整个表格需要循环 1000 \* 7 次去创建最内部的 td，整个过程就会耗时较长。

> 1. 会通过 performance 看并且分析出性能问题的原因，找到问题所在的地方，是在哪里花的时间多。
> 2. 对 vue 源码熟悉，知道 vue 中函数的作用

在 ElementUI 的 Table 组件中，在渲染每个 td 的时候，有这么一段代码：

```js
const data = {
  store: this.store,
  _self: this.context || this.table.$vnode.context,
  column: columnData,
  row,
  $index,
};
```

每次访问`this.store`时，都会触发响应式数据内部的 getter 函数，进而执行依赖收集，这段代码被执行 7000 次，就会执行 7000 次依赖收集，而真正的依赖收集只需要执行一次。

修改方案：在在组件 render 函数的入口处定义一些局部变量：

```js
render(h) {
  const { store /*...*/} = this
  const context = this.context ||  this.table.$vnode.context
}
```

然后改成局部变量，这样在内部渲染 td 的渲染中再次访问这些变量就不会触发依赖收集了

```js
rowRender({store, context, /* ...其它变量 */}) {
  const data = {
    store: store,
    _self: context,
    column: columnData,
    row,
    $index,
    disableTransition,
    isSelectedRow
  }
}
```

将类似的代码都做修改。

修改后，组件的 render to vnode 花费的时间约 240ms；vnode patch to DOM 花费的时间约 127ms。

### 手写 benchmark

benchmark（监测计算机性能的）基准（问题）标准检查程序；

```vue
<template>
  <div>
    <div>
      <zm-button @click="toggleSelection(computedData[1])"
        >切换第二行选中状态
      </zm-button>
    </div>
    <div>更新所需时间: {{ renderTime }}</div>
  </div>
</template>

<script>
export default {
  methods: {
    toggleSelection(row) {
      const s = window.performance.now();
      if (row) {
        this.$refs.table.toggleRowSelection(row);
      }
      setTimeout(() => {
        this.renderTime = (window.performance.now() - s).toFixed(2) + "ms";
      });
    },
  },
};
</script>
```

我们在点击事件的回调函数中，通过 window.performance.now() 记录起始时间，然后在 setTimeout 的回调函数中，再去通过时间差去计算整个更新渲染需要的时间。

由于 JS 的执行和 UI 渲染占用同一线程，因此在一个宏任务执行过程中，会执行这俩任务，而 setTimeout 0 会把对应的回调函数添加到下一个宏任务中，当该回调函数执行，说明上一个宏任务执行完毕，此时做时间差去计算性能是相对精确的。

测试后，性能提升约 3 倍。

## v-memo 的启发

问题：只更新了一行数据的选中状态，却还是重新渲染了整个表格，仍然需要在组件 render 的过程中执行多次的循环，在 patch 的过程中通过 diff 算法来对比更新。

### v-memo 的实现原理

[v-memo](https://cn.vuejs.org/api/built-in-directives.html#v-memo)

> 当组件的 selected 状态改变，默认会重新创建大量的 vnode，尽管绝大部分都跟之前是一模一样的。v-memo 用在这里本质上是在说“只有当该项的被选中状态改变时才需要更新”。这使得每个选中状态没有变的项能完全重用之前的 vnode 并跳过差异比较。注意这里 memo 依赖数组中并不需要包含 item.id，因为 Vue 也会根据 item 的 :key 进行判断。

v-memo 的核心就是复用 vnode

### 在 table 组件的应用

复用缓存的 vnode，空间换时间的优化策略。

在表格组件中选择状态没有变化的行，可以从缓存中获取。

给 Table 组件设计了 useMemo 这个 prop，专门用于有选择列的场景。

在 TableBody 组件的 created 钩子函数中，创建了用于缓存的对象：

```js
created() {
  if (this.table.useMemo) {
    if (!this.table.rowKey) {
      throw new Error('for useMemo, row-key is required.')
    }
    this.vnodeCache = []
  }
}
```

把 vnodeCache 定义到 created 钩子函数中，是因为它并不需要变成响应式对象。

每一行的 key 作为缓存的 key，因此 Table 组件的 rowKey 属性是必须的。

然后在渲染每一行的过程中，添加了 useMemo 相关的逻辑：

```js
function rowRender(
  {
    /* 各种变量参数 */
  }
) {
  let memo;
  const key = this.getKeyOfRow({ row, rowIndex: $index, rowKey });
  let cached;
  if (useMemo) {
    cached = this.vnodeCache[key];
    const currentSelection = store.states.selection;
    if (
      cached &&
      !this.isRowSelectionChanged(row, cached.memo, currentSelection)
    ) {
      return cached;
    }
    memo = currentSelection.slice();
  }
  // 渲染 row，返回对应的 vnode
  const ret = rowVnode;
  if (useMemo && columns.length) {
    ret.memo = memo;
    this.vnodeCache[key] = ret;
  }
  return ret;
}
```

在每次渲染 row 的 vnode 前，会根据 row 对应的 key 尝试从缓存中取；如果缓存中存在，再通过 isRowSelectionChanged 来判断行的选中状态是否改变；如果没有改变，则直接返回缓存的 vnode。

如果没有命中缓存或者是行选择状态改变，则会去重新渲染拿到新的 rowVnode，然后更新到 vnodeCache 中。

当然，这种实现相比于 v-memo 没有那么通用，只去对比行选中的状态而不去对比其它数据的变化。你可能会问，如果这一行某列的数据修改了，但选中状态没变，再走缓存不就不对了吗？

确实存在这个问题，但是在我们的使用场景中，遇到数据修改，是会发送一个异步请求到后端，然获取新的数据再来更新表格数据。因此我只需要观测表格数据的变化清空 vnodeCache 即可：

```js
watch: {
  'store.states.data'() {
    if (this.table.useMemo) {
      this.vnodeCache = []
    }
  }
}
```

此外，我们支持列的可选则渲染功能，以及在窗口发生变化时，隐藏列也可能发生变化，于是在这两种场景下，也需要清空 vnodeCache：

```js
watch:{
  'store.states.columns'() {
    if (this.table.useMemo) {
      this.vnodeCache = []
    }
  },
  columnsHidden(newVal, oldVal) {
    if (this.table.useMemo && !valueEquals(newVal, oldVal)) {
      this.vnodeCache = []
    }
  }
}
```

修改后：组件的 render to vnode 花费的时间约 20ms；vnode patch to DOM 花费的时间约 1ms，整个更新渲染过程， JS 的执行时间大幅减少。

## 总结

1. 减少 DOM 数量
2. 优化 render 过程
3. 复用 vnode
4. 从业务角度思考，做一些优化

使用 vue2 框架，但是学习 vue3 框架中的优化思想，用于项目中。

# 待完成：自己动手做一遍

1000 条数据，13 列数据，1 列选择框，共 14 列。

切换第二行状态：371.70ms

固定选择框和头尾列共 3 列：669ms

- 一共 3064ms scripting 占据 2649ms，rendering 345ms

| 状态                      | 渲染时间 | 切换第二行状态渲染时间 |
| ------------------------- | -------- | ---------------------- |
| 默认，14 列，1000 条数据  |          | 371.70ms               |
| 固定选择框和头尾列共 3 列 | 3064ms   | 669ms                  |
|                           |          |                        |
|                           |          |                        |
|                           |          |                        |

1. 列定制功能，已经在项目中做过了。就是默认的时候少渲染一些列，通过配置勾选增减列。
2. 只需要渲染固定展示的列的 DOM，然后做好高度同步即可。没说怎么实现的

## element-ui 的 table

```txt
table # 全局配置
├── index.js # 导出组件
├── src   #
│   ├── table.vue # 组件入口 el-table
│   ├── table-header.js   # 表头 el-table 内部用
│   ├── table-body.js   # 表体 el-table 内部用
│   ├── table-footer.js # 表格底部 el-table 内部用
│   ├── table-column.js # 列，使用时放在el-table里
│   ├── table-store.js # 专门给table用的store，用于共享数据
│   ├── table-layout.js # TableLayout 类，提供addObserver方法
│   ├── layout-observer.js # 给table添加observer，有两个方法，onColumnsChange和onScrollableChange
│   ├── dropdown.js
│   ├── filter-panel.vue
│   └── ...
└── ...
```

packages/table/src/table-store.js table 定义的 store，是一个 function，构造函数，原型上添加了很多方法，用于存储 table 的状态

在 table.vue 中，是一个 table 组件。在 data 中`const store = new TableStore(this, {})`，this 就是当前 table 组件。store 放到 data 中，可以通过`this.table`访问，是响应式对象。

用来设置列的 width

```html
<colgroup>
  <col name="el-table_4_column_43" width="55" />
</colgroup>
```

th 的 colspan 和 rowspan，用来实现多级表头

```html
<tr class="">
  <th colspan="1" rowspan="3" class="el-table_9_column_36     is-leaf">
    <div class="cell">日期</div>
  </th>
  <th colspan="5" rowspan="1" class="el-table_9_column_37    ">
    <div class="cell">配送信息</div>
  </th>
  <th class="gutter" style="width: 0px; display: none;"></th>
</tr>
```

增加了 fixed 的列，在原本的 wrapper 里会加上 is-hidden 类

是否加上 is-hidden 是在 isColumnHidden 函数中根据当前列的 index 判断。left 的 fixed 列最终全部排在左边，right 全部依次排在右边。

在 fixed 的 table 里，除了 fixed 的列，会把其他列加上 is-hidden 类

样式表中，is-hidden 类会被设置为隐藏

```scss
&.is-hidden {
  > * {
    visibility: hidden;
  }
}
```

zm 的优化方案就是直接不渲染需要隐藏的列。

[调试 element-ui 源码](https://zhuanlan.zhihu.com/p/577653984)

```jsx
<colgroup>
  {this._l(this.columns, (column) => (
    <col name={column.id} />
  ))}
</colgroup>
```

`this._l`是 vue 内部的方法，和 v-for 效果一样。

> 只要在原生的 JavaScript 中可以轻松完成的操作，Vue 的渲染函数就不会提供专有的替代方法。比如，在模板中使用的 v-if 和 v-for，这些都可以在渲染函数中用 JavaScript 的 if/else 和 map 来重写。

第一个参数 this.columns 是所有要渲染的列数组，每个项是描述列的对象。第二个参数是用户提供的 render 渲染函数，this.columns 数组的项 column 会被作为参数传进去，这里是渲染一个 col 标签。

执行 render 函数，访问`this.columns[i][id]`，`this.columns[i]`是一个响应式数据，进入 getter

最终返回 VNode 数组，后续会被 vue 渲染为真实 DOM。

最终会根据 this.columns 的数量渲染相应个数的 col 标签，就相当于在 col 上使用 v-for 效果一样。这样直接调用 this.\_l，是因为使用 JSX 写法的原因？

```js
function installRenderHelpers(target) {
  // ...
  target._l = renderList;
  // ...
}
```

src/core/instance/render-helpers/render-list.js

```js
/**
 * Runtime helper for rendering v-for lists.
 */
export function renderList(
  val: any,
  render: (val: any, keyOrIndex: string | number, index?: number) => VNode
): ?Array<VNode> {
  let ret: ?Array<VNode>, i, l, keys, key;
  if (Array.isArray(val) || typeof val === "string") {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === "number") {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      const iterator: Iterator<any> = val[Symbol.iterator]();
      let result = iterator.next();
      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }
  if (!isDef(ret)) {
    ret = [];
  }
  (ret: any)._isVList = true;
  return ret;
}
```

找到一个优化思路文章，改成使用 sticky 定位实现：https://juejin.cn/post/7129129207220666382

vue3 的 element-plus 的 table 进行了优化，表头和内容各用了一个表格，一共两个表格。看到样式中用的就是 sticky。sticky 属性 IE 还是不支持，所以原因还是基于浏览器兼容性考虑。vue2(defineProperty) 支持 IE9 的，所以相应的 UI 库对于浏览器的支持是不是因此也需要兼容性更好？而 vue3（Proxy）已经不考虑 IE 的兼容性了，所以都可以使用更新的特性了。

## 本地变量

修改前 812ms 1023 1424 平均约 1000
修改后 1309 595 1681 1387 466 651 如果切换频繁 就数量小
