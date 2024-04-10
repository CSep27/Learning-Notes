# 说明

阅读《深入浅出 Vue.js》书时记录的笔记

书中说的是 Vue 的 v2.5.2 版本

第 12 章 - 第 17 章（结束）

# 第 12 章 架构设计与项目结构

## 12.1 目录结构

```
+ scripts         # 与构建相关的脚本和配置文件
+ dist            # 构建后的文件
+ flow            # Flow的类型声明
+ packages        # vue-server-renderer和vue-template-compiler，作为单独的npm包发布，自动从源码中生成
+ test            # 所有的测试代码
+ src             # 源代码
  + compiler      # 与模板编译相关的代码
  + core          # 通用的、与平台无关的运行时代码
    + observer    # 实现变化侦测的代码
    + vdom        # 实现虚拟dom的代码
    + instance    # vue.js实例的构造函数和原型方法
    + global-api  # 全局API的代码 （Vue.use Vue.extend Vue.mixin等）
    + components  # 通用的抽象组件 （keep-alive组件）
  + server        # 与服务端渲染相关的代码
  + platforms     # 特定平台代码 （包括web、weex（用来构建跨平台应用的，即一套代码可以在web、ios、android平台上使用））
  + sfc           # 单文件组件解析逻辑
  + shared        # 整个项目的公用工具代码
+ types           # TypeScript类型定义
  + test          # 类型定义测试
```

### 不同 vue.js 的构建版本

- 完整版：构建后的文件同时包含编译器和运行时
- 编译器：负责将模板字符串编译成 JS 渲染函数
- 运行时：负责创建 vue.js 示例，渲染视图和使用虚拟 DOM 实现重新渲染，基本上包含除编译器外的所有部分
- UMD：运行时加编译器的 UMD 版本
- CommonJS：配合旧打包工具，只包含运行时的 CommonJS 版本
- ES Module：配合现代打包工具，只包含运行时的 ES Module 版本

- 如果需要编译模板字符串的情况下，就需要完整版，否则使用运行时版本即可

```js
// 需要编译器
new Vue({
  template: "<div>{{ hi }}</div>",
});

// 不需要编译器
new Vue({
  render(h) {
    return h("div", this.hi);
  },
});
```

- 当使用 vue-loader 或 vueify 的时候，\*.vue 文件内部的模板会在构建时预编译成 JavaScript。所以，最终打包完成的文件实际上是不需要编译器的，只需要引入运行时版本即可。

### 架构设计

- 大体分为三部分：核心代码、跨平台相关和公用工具函数。
- 先向 Vue 构造函数的 prototype 属性上添加一些方法，然后向 Vue 构造函数本身添加一些全局 API，接着将平台特有的代码导入进来，最后将编译器导入进来。最终将所有代码和 Vue 构造函数一起导出去。

# 第 13 章　实例方法与全局 API 的实现原理

## 13.1 数据相关的实例方法

- vm.$watch、vm.$set、vm.$delete 三个方法，在 stateMixin 中挂载到原型上

## 13.2 事件相关的实例方法

- vm.$on、vm.$once、vm.$off和vm.$emit，在 eventsMixin 中挂载到原型上

### 13.2.1 vm.$on

- 事件的实现方式：在注册事件时将回调函数收集起来，在触发事件时将收集起来的回调函数依次调用即可。

```js
Vue.prototype.$on = function (event, fn) {
  const vm = this;
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      this.$on(event[i], fn);
    }
  } else {
    (vm._events[event] || (vm._events[event] = [])).push(fn);
  }
  return vm;
};
```

- `vm._events`是在 new Vue()是执行 this.\_init 方法中，创建了一个\_events 属性，用来存储事件：

```js
// Object.create以一个现有对象作为原型，创建一个新对象
vm._events = Object.create(null);
```

### 13.2.2 vm.$off

```js
Vue.prototype.$off = function (event, fn) {
  const vm = this;
  // 没有参数时，表示移除所有事件监听器
  if (!arguments.length) {
    // 将 vm._events 重置为初始状态
    vm._events = Object.create(null);
    return vm;
  }

  // event支持数组
  if (Array.isArray(event)) {
    for (let i = 0, l = event.length; i < l; i++) {
      // 依次给每个参数执行$off方法
      this.$off(event[i], fn);
    }
    return vm;
  }

  // 单个参数，获取到该事件绑定的函数
  const cbs = vm._events[event];
  if (!cbs) {
    // 如果没有找到绑定的函数，直接返回vm即可
    return vm;
  }
  // 找到了，置为null，移除该事件的所有监听器
  if (arguments.length === 1) {
    vm._events[event] = null;
    return vm;
  }
  return vm;

  // 只移除与fn相同的监听器
  if (fn) {
    const cbs = vm._events[event];
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
  }
  return vm;
};
```

- 注意：处理移除指定函数监听器时的循环，使用 splice 方法，会改变数组长度，所以是**从后往前循环**，这样删除掉一个值时，不会影响到后续的处理
- 但是试过了，这里的代码在找到之后就 break 停止循环了，没有继续找，只找到一个就结束了，所以这种 break 的情况应该是不影响，只有需要继续处理的时候才会影响

### 13.2.3 vm.$once

- 在 vm.$once中使用vm.$on 实现监听事件功能，自定义事件触发后，会执行拦截器，将事件从监听列表中清除

```js
Vue.prototype.$once = function (event, fn) {
  const vm = this;
  function on() {
    vm.$off(event, on);
    fn.apply(vm, arguments);
  }
  on.fn = fn;
  vm.$on(event, on);
  return vm;
};
```

- 书上说的不对，这里$on和$off 绑定的函数都是 on 函数，在$off 内部执行`if (cb === fn || cb.fn === fn) `的判断时，`cb === fn`就是 true

### 13.2.4 vm.$emit

- 作用：触发事件
- 实现：从 vm.$events 中取出对应的事件监听器回调，依次执行

## 13.3 生命周期相关的实例方法

- vm.$mount：在 lifecycleMixin 中挂载
- vm.$forceUpdate：在 lifecycleMixin 中挂载
- vm.$nextTick：在 renderMixin 中挂载
- vm.$destroy：在跨平台的代码中挂载

### 13.3.1 vm.$forceUpdate

- 作用：迫使 Vue.js 实例重新渲染。只影响实例本身以及插入插槽内容的子组件，而不是所有子组件
- 待看！前面的 watcher 的 update
- Vue.js 的自动渲染通过变化侦测来侦测数据，即当数据发生变化时，Vue.js 实例重新渲染。而 vm.$forceUpdate 是手动通知 Vue.js 实例重新渲染。

### 13.3.2 vm.$destroy

- 作用：完全销毁一个实例，清理实例与其他实例的链接，解绑全部指令和监听器，触发 beforeDestroy 和 destroyed 钩子函数

#### 实现原理

1. 判断\_isBeingDestroyed，避免反复执行
2. 调用 callHook 函数触发 beforeDestroy 的钩子函数
3. 清理当前组件与父组件之间的连接，将当前组件实例从父组件实例的$children 属性中删除

   ```js
   // 删除自己与父级之间的连接
   const parent = vm.$parent;
   if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
     remove(parent.$children, vm);
   }
   ```

   - 子组件在不同的父组件中是不同的 Vue.js 实例，所以一个子组件实例的父级只有一个
   - remove 方法实现：
     - indexOf 比较对象时，比较的是对象的引用，传入的 item 和 arr 中存储的对象引用是相同的，所以能够找到

   ```js
   export function remove(arr, item) {
     if (arr.length) {
       const index = arr.indexOf(item);
       if (index > -1) {
         return arr.splice(index, 1);
       }
     }
   }
   ```

4. 销毁实例上的 watcher

   - watcher 的 teardown 方法，作用是从所有依赖项的 Dep 列表中将自己移除
   - 还需要销毁用户使用 vm.$watch 所创建的 watcher 实例，每当创建 watcher 实例时，都会将 watcher 实例添加到 vm.\_watchers 中，只要依次执行 vm.\_watchers 中每个 watcher 的 teardown 方法即可。

5. 向 Vue.js 实例添加 \_isDestroyed 属性来表示 Vue.js 实例已经被销毁。当 vm.$destroy 执行时，Vue.js 不会将已经渲染到页面中的 DOM 节点移除，但会将模板中的所有指令解绑
6. 触发 destoryed 钩子函数
7. 移除实例上的所有事件监听器

### 13.3.3 vm.$nextTick

- 作用：将回调延迟到下次 DOM 更新周期后执行
- 使用场景：当更新了状态（数据）后，需要对新 DOM 做一些操作，这时由于没有重新渲染所以获取不到更新后的 DOM，这时需要使用 nextTick 方法

### 13.3.4 vm.$mount

完整版和只包含运行时版本之间的差异在于是否有编译器，而是否有编译器的差异主要在于 vm.$mount 方法的表现形式。

在完整的构建版本中，vm.$mount 首先会检查 template 或 el 选项所提供的模板是否已经转换成渲染函数（render 函数）。如果没有，则立即进入编译过程，将模板编译成渲染函数，完成之后再进入挂载与渲染的流程中。

只包含运行时版本的 vm.$mount 没有编译步骤，它会默认实例上已经存在渲染函数，如果不存在，则会设置一个。并且，这个渲染函数在执行时会返回一个空节点的 VNode，以保证执行时不会因为函数不存在而报错。

从原理的角度来讲，完整版和只包含运行时版本之间是包含关系，完整版包含只包含运行时版本。

完整版 vm.$mount 的实现代码：

```js
const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el) {
  // 做些什么
  return mount.call(this, el);
};
```

在上面的代码中，我们将 Vue 原型上的 $mount 方法保存在 mount 中，以便后续使用。然后 Vue 原型上的 $mount 方法被一个新的方法覆盖了。新方法中会调用原始的方法，这种做法通常被称为**函数劫持**。

通过函数劫持，可以在原始功能之上新增一些其他功能。在上面的代码中，vm.$mount 的原始方法就是 mount 的核心功能，而在完整版中需要将编译功能新增到核心功能上去。

### 只包含运行时版本的 vm.$mount 的实现原理

```js
Vue.prototype.$mount = function (el) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el);
};
```

钩子函数触发后，将执行真正的挂载操作。挂载操作与渲染类似，不同的是渲染指的是渲染一次，而挂载指的是持续性渲染。挂载之后，每当状态发生变化时，都会进行渲染操作。

```js
01  export function mountComponent (vm, el) {
02    if (!vm.$options.render) {
03      vm.$options.render = createEmptyVNode
04      if (process.env.NODE_ENV !== 'production') {
05        // 在开发环境下发出警告
06      }
07    }
08    // 触发生命周期钩子
09    callHook(vm, 'beforeMount')
10
11    // 挂载
12    vm._watcher = new Watcher(vm, () => {
13      vm._update(vm._render())
14    }, noop)
15
16    // 触发生命周期钩子
17    callHook(vm, 'mounted')
18    return vm
19  }
```

vm.\_update(vm.\_render()) 的作用是先调用渲染函数得到一份最新的 VNode 节点树，然后通过 \_update 方法对最新的 VNode 和上一次渲染用到的旧 VNode 进行对比并更新 DOM 节点。

简单来说，就是执行了渲染操作。挂载是持续性的，而持续性的关键就在于 new Watcher 这行代码。Watcher 的第二个参数支持函数，并且当它是函数时，会同时观察函数中所读取的所有 Vue.js 实例上的响应式数据。

## 13.4 全局 API 的实现原理

### 13.4.1 Vue.extend

Vue.extend 的作用是创建一个子类，所以可以创建一个子类，然后让它继承 Vue 身上的一些功能。

### 13.4.2 Vue.nextTick

### 13.4.3 Vue.set

### 13.4.4 Vue.delete

以上三者的实现原理与相应的实例方法实现原理一样

### 13.4.5 Vue.directive

### 13.4.6 Vue.filter

### 13.4.7 Vue.component

以上三者统一放在 src/shared/constants.js 中的 ASSET_TYPES 常量定义中

实现代码在 src/core/global-api/assets.js

### 13.4.8 Vue.use

有两部分逻辑需要处理：

- 一部分是插件的类型，可以是 install 方法，也可以是一个包含 install 方法的对象；
- 另一部分逻辑是插件只能被安装一次，保证插件列表中不能有重复的插件。

### 13.4.9 Vue.mixin

实现原理：将用户传入的对象与 Vue.js 自身的 options 属性合并在一起

```js
import { mergeOptions } from "../util/index";

export function initMixin(Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
```

### 13.4.10 Vue.compile

将一个模板字符串编译成 render 函数。只在完整版时可用。

### 13.4.11 Vue.version

提供字符串形式的 Vue 安装版本号。

源码中的实现步骤是：Vue.js 在构建文件的配置中定义了 `__VERSION__` 常量，使用 rollup-plugin-replace 插件在构建的过程中将代码中的常量 `__VERSION__` 替换成 package.json 文件中的版本号。

# 第 14 章 生命周期

## 14.3 errorCaptured 与错误处理

[errorCaptured](https://v2.cn.vuejs.org/v2/api/#errorCaptured)

Vue.js 会捕获所有用户代码抛出的错误，然后会使用一个名叫 handleError 的函数来处理这些错误。

定义在：src/core/util/error.js

通过 while 语句自底向上不停地循环获取父组件，直到根组件。

在循环中，我们通过 cur.$options.errorCaptured 属性读出 errorCaptured 钩子函数列表，遍历钩子函数列表并依次执行列表中的每一个 errorCaptured 钩子函数。

也就是说，自底向上的每一层都会读出当前层组件的 errorCaptured 钩子函数列表，并依次执行列表中的每一个钩子函数。

当组件循环到根组件时，从属链路中的多个 errorCaptured 钩子函数就都被触发完了。

## 14.4 初始化实例属性

注意：以 $ 开头的属性是提供给用户使用的外部属性，以 \_ 开头的属性是提供给内部使用的内部属性。

vm.$parent 属性，它需要找到第一个非抽象类型的父级，通过 while 循环。

vm.$children 属性，它会包含当前实例的直接子组件。该属性的值是从子组件中主动添加到父组件中的。

```js
export function initLifecycle(vm) {
  const options = vm.$options;

  // 找出第一个非抽象父类
  let parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}
```

vm.$root，它表示当前组件树的根 Vue.js 实例。

    - 如果当前组件没有父组件，那么它自己其实就是根组件，它的 $root 属性是它自己，
    - 它的子组件的 vm.$root属性是沿用父级的$root，所以其直接子组件的 $root 属性还是它，
    - 其孙组件的 $root 属性沿用其直接子组件中的 $root 属性，
    - 以此类推。因此，这其实是自顶向下将根组件的 $root 依次传递给每一个子组件的过程。

## 14.5 初始化事件

简单来说，如果 v-on 写在组件标签上，那么这个事件会注册到子组件 Vue.js 事件系统中；如果是写在平台标签上，例如 div，那么事件会被注册到浏览器事件中。

在实例初始化阶段，被初始化的事件指的是父组件在模板中使用 v-on 监听子组件内触发的事件。

```js
export function initEvents(vm) {
  vm._events = Object.create(null);
  // 初始化父组件附加的事件
  const listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}
```

所有使用 vm.$on 注册的事件监听器都会保存到 `vm._events` 属性中。

在模板编译阶段，当模板解析到组件标签时，会实例化子组件，同时将标签上注册的事件解析成 object 并通过参数传递给子组件。所以当子组件被实例化时，可以在参数中获取父组件向自己注册的事件，这些事件最终会被保存在 `vm.$options._parentListeners` 中。

## 14.6 初始化 inject

inject 在 data/props 之前初始化，而 provide 在 data/props 后面初始化。这样做的目的是让用户可以在 data/props 中使用 inject 所注入的内容。也就是说，可以让 data/props 依赖 inject，所以需要将初始化 inject 放在初始化 data/props 的前面。

初始化 inject，就是使用 inject 配置的 key 从当前组件读取内容，读不到则读取它的父组件，以此类推。它是一个自底向上获取内容的过程，最终将找到的内容保存到实例（this）中，这样就可以直接在 this 上读取通过 inject 导入的注入内容。

Vue.js 在实例化的第一步是规格化用户传入的数据，如果 inject 传递的内容是数组，那么数组会被规格化成对象并存放在 from 属性中。

## 14.7 初始化状态

initState 函数的代码如下：

```js
export function initState(vm) {
  vm._watchers = [];
  const opts = vm.$options;
  if (opts.props) initProps(vm, opts.props);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) {
    initData(vm);
  } else {
    observe((vm._data = {}), true /* asRootData */);
  }
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}
```

首先在 vm 上新增一个属性 \_watchers，用来保存当前组件中所有的 watcher 实例。无论是使用 vm.$watch 注册的 watcher 实例还是使用 watch 选项添加的 watcher 实例，都会添加到 vm.\_watchers 中。

初始化状态可以分为 5 个子项，分别是初始化 props、初始化 methods、初始化 data、初始化 computed 和初始化 watch

### 14.7.1 初始化 props

Vue.js 中的所有组件都是 Vue.js 实例，组件在进行模板解析时，会将标签上的属性解析成数据，最终生成渲染函数。而渲染函数被执行时，会生成真实的 DOM 节点并渲染到视图中。

但是这里面有一个细节，如果某个节点是组件节点，也就是说模板中的某个标签的名字是组件名，那么在虚拟 DOM 渲染的过程中会将子组件实例化，这会将模板解析时从标签属性上解析出的数据当作参数传递给子组件，其中就包含 props 数据。

### 14.7.2 初始化 methods

只需要循环选项中的 methods 对象，并将每个属性依次挂载到 vm 上即可

### 14.7.3 　初始化 data

看过了

### 14.7.4 初始化 computed

计算属性的结果会被缓存，且**只有在计算属性所依赖的响应式属性或者说计算属性的返回值发生变化时才会重新计算**。那么，如何知道计算属性的返回值是否发生了变化？这其实是结合 Watcher 的 dirty 属性来分辨的：当 dirty 属性为 true 时，说明需要重新计算“计算属性”的返回值；当 dirty 属性为 false 时，说明计算属性的值并没有变，不需要重新计算。

而使用 watch 是只要 watch 的值变化了，就会触发。

注意：如果是在模板中读取计算属性，那么使用组件的 Watcher 观察计算属性中用到的所有数据的变化。如果是用户自定义的 watch，那么其实是使用用户定义的 Watcher 观察计算属性中用到的所有数据的变化。其区别在于当计算属性函数中用到的数据发生变化时，向谁发送通知。

说明：计算属性的一个特点是有缓存。计算属性函数所依赖的数据在没有发生变化的情况下，会反复读取计算属性，而计算属性函数并不会反复执行。

新版计算属性的内部原理。与之前最大的区别就是组件的 Watcher 不再观察数据的变化了，而是只观察计算属性的 Watcher（把组件的 watcher 实例添加到计算属性的 watcher 实例的依赖列表中），然后计算属性主动通知组件是否需要进行渲染操作。

再看看

### 14.7.5 初始化 watch

再看看

# 第 15 章 指令的奥秘

## 15.1 指令原理概述

在模板解析阶段，我将指令解析到 AST，然后使用 AST 生成代码字符串的过程中实现某些内置指令的功能，最后在虚拟 DOM 渲染的过程中触发自定义指令的钩子函数使指令生效。

在模板解析阶段，会将节点上的指令解析出来并添加到 AST 的 directives 属性中。

随后 directives 数据会传递到 VNode 中，接着就可以通过 vnode.data.directives 获取一个节点所绑定的指令。

最后，当虚拟 DOM 进行 patch 时，会根据节点的对比结果触发一些钩子函数。更新指令的程序会监听 create、update 和 destroy 钩子函数，并在这三个钩子函数触发时对 VNode 和 oldVNode 进行对比，最终根据对比结果触发指令的钩子函数。（使用自定义指令时，可以监听 5 种钩子函数：bind、inserted、update、componentUpdated 与 unbind。）指令的钩子函数被触发后，就说明指令生效了。

### 15.1.3 v-on 指令

v-on 指令的作用是绑定事件监听器，事件类型由参数指定。它用在普通元素上时，可以监听原生 DOM 事件；用在自定义元素组件上时，可以监听子组件触发的自定义事件。

## 15.2 自定义指令的内部原理

虚拟 DOM 通过算法对比两个 VNode 之间的差异并更新真实的 DOM 节点。在更新真实的 DOM 节点时，有可能是创建新的节点，或者更新一个已有的节点，还有可能是删除一个节点等。

虚拟 DOM 在渲染时，除了更新 DOM 内容外，还会触发钩子函数。例如，在更新节点时，除了更新节点的内容外，还会触发 update 钩子函数。这是因为标签上通常会绑定一些指令、事件或属性，这些内容也需要在更新节点时同步被更新。**因此，事件、指令、属性等相关处理逻辑只需要监听钩子函数，在钩子函数触发时执行相关处理逻辑即可实现功能。**

然后判断注册自定义指令时，该指令是否设置了 componentUpdated 方法。如果设置了，则将该指令添加到 dirsWithPostpatch 列表中。这样做的目的是**让指令所在组件的 VNode 及其子 VNode 全部更新后，再调用指令的 componentUpdated 方法。** (与 update 方法的区别)

mergeVNodeHook 可以将一个钩子函数与虚拟节点现有的钩子函数合并在一起，这样当虚拟 DOM 触发钩子函数时，新增的钩子函数也会被执行。

虚拟 DOM 会在元素更新前触发 prepatch 钩子函数，正在更新元素时中会触发 update 钩子函数，更新后会触发 postpatch 钩子函数。因此，指令的 componentUpdated 需要使用 mergeVNodeHook 在 postpatch 钩子函数列表中新增一个钩子函数，当钩子函数被执行时再去执行指令的 componentUpdated 方法。

## 15.2 虚拟 DOM 钩子函数

虚拟 DOM 在渲染时会触发的所有钩子函数以及每个钩子函数的触发时机。

| 名称      | 触发时机                                                                                                        | 回调参数              |
| --------- | --------------------------------------------------------------------------------------------------------------- | --------------------- |
| init      | 已添加 vnode，在 patch 期间发现新的 vnode 节点时触发                                                            | vnode                 |
| create    | 已经基于 vnode 创建了 DOM 元素                                                                                  | emptyNode, vnode      |
| activate  | keepalive 组件被创建                                                                                            | emptyNode, innerNode  |
| insert    | 一旦 vnode 对应的 DOM 元素被插入到视图中并且 patch 周期的其余部分已经完成，就会触发                             | vnode                 |
| prepatch  | 一个元素即将被 patch                                                                                            | oldVnode, vnode       |
| update    | 一个元素正在被更新                                                                                              | oldVnode, vnode       |
| postpatch | 一个元素已经被 patch                                                                                            | oldVnode, vnode       |
| destory   | 当前 DOM 元素被移除时，或者它的父 DOM 元素被移除时触发                                                          | vnode                 |
| remove    | 当前 DOM 元素被移除时触发。说明：这个元素从父元素中移除时会触发，但是如果它是被移除的元素的子元素，则不会触发。 | vnode, removeCallback |

# 第 16 章 过滤器的奥秘

在编译阶段将过滤器编译成函数调用，串联的过滤器编译后是一个嵌套的函数调用，前一个过滤器函数的执行结果是后一个过滤器函数的参数。编译后的 \_f 函数是 resolveFilter 函数的别名，resolveFilter 函数的作用是找到对应的过滤器并返回。

在初始化 Vue.js 实例时，把全局过滤器与组件内注册的过滤器合并到 this.$options.filters中了，而this.$options.filters 其实同时保存了全局过滤器和组件内注册的过滤器。resolveAsset 只需要从 this.$options.filters 中查找过滤器即可。

# 第 17 章 最佳实践

## 17.1 为列表渲染设置属性 key

## 17.2 在 v-if/v-if-else/v-else 中使用 key

如果一组 v-if + v-else 的元素类型相同，最好使用属性 key（比如两个 <div> 元素）。

如果**不希望元素被复用的情况下，就加 key**，否则可以不加。

## 17.3 路由切换组件不变

典型问题就是，当页面切换到同一个路由但不同参数的地址时，组件的生命周期钩子并不会重新触发。因为 vue-router 会识别出两个路由使用的是同一个组件从而进行复用。

### 17.3.1 路由导航守卫 beforeRouteUpdate

vue-router 提供了导航守卫 beforeRouteUpdate，**该守卫在当前路由改变且组件被复用时调用**，所以可以在组件内定义路由导航守卫来解决这个问题。

[组件内的守卫](https://v3.router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E8%B7%AF%E7%94%B1%E7%8B%AC%E4%BA%AB%E7%9A%84%E5%AE%88%E5%8D%AB)

最推荐的做法。

### 17.3.2 观察$route 对象的变化

通过 watch 可以监听到路由对象发生的变化，从而对路由变化作出响应。

会增加依赖追踪的内存开销。

如果需要这种做法，推荐在组件里只观察自己需要的 query，这样有利于减少不必要的请求。

假设路由中的参数是 /user?id=4&page=1 时

```js
const User = {
  template: "...",
  watch: {
    "$route.query.id"() {
      // 请求个人描述信息
    },
    "$route.query.page"() {
      // 请求列表
    },
  },
};
```

### 17.3.3 为 router-view 组件添加属性 key

利用虚拟 DOM 在渲染时通过 key 来对比两个节点是否相同的原理。通过给 router-view 组件设置 key，可以使每次切换路由时的 key 都不一样，让虚拟 DOM 认为 router-view 组件是一个新节点，从而先销毁组件，然后再重新创建新组件。

改动小，但是浪费性能。

## 17.4 为所有路由统一添加 query

场景：如果路由上的 query 中有一些是从上游链路上传下来的，那么需要在应用的任何路由中携带

### 17.4.1 　使用全局守卫 beforeEach

在 beforeEach 使用 next 方法来中断当前导航，并切换到新导航，添加一些新 query 进去。并且添加判断这个全局添加的参数在路由对象中是否存在，如果存在，则不开启新导航。

```js
const query = { referer: "hao360cn" };
router.beforeEach((to, from, next) => {
  to.query.referer ? next() : next({ ...to, query: { ...to.query, ...query } });
});
```

缺点是每次切换路由时，全局守卫 beforeEach 会执行两次。

### 17.4.2 使用函数劫持

通过拦截 router.history.transitionTo 方法，在 vue-router 内部在切换路由之前将参数添加到 query 中。其使用方式如下：

```js
const query = { referer: "hao360cn" };
const transitionTo = router.history.transitionTo;

router.history.transitionTo = function (location, onComplete, onAbort) {
  location =
    typeof location === "object"
      ? { ...location, query: { ...location.query, ...query } }
      : { path: location, query };

  transitionTo.call(router.history, location, onComplete, onAbort);
};
```

修改了内部代码，属于危险操作。

## 17.5 区分 Vuex 与 props 的使用边界

在项目开发中，业务组件会使用 Vuex 维护状态。

对于通用组件，使用 props 以及事件进行父子组件间的通信（通用组件不需要兄弟组件间的通信）。

通用组件要定义细致的 prop，并且尽可能详细，至少需要指定其类型。

## 17.6 避免 v-if 和 v-for 一起使用

## 17.7 为组件样式设置作用域

对于应用来说，最佳实践是只有顶级 App 组件和布局组件中的样式可以是全局的，其他所有组件都应该是有作用域的。

在 Vue.js 中，可以通过 scoped 特性或 CSS Modules（一个基于 class 的类似 BEM 的策略）来设置组件样式作用域。

对于组件库，我们应该更倾向于选用**基于 class 的策略**而不是 scoped 特性。因为基于 class 的策略使覆写内部样式更容易，它使用容易理解的 class 名称且没有太高的选择器优先级，不容易导致冲突。

## 17.8 　避免在 scoped 中使用元素选择器

基本都要避免使用元素选择器

### 17.9 　避免隐性的父子组件通信

一个理想的 Vue.js 应用是“prop 向下传递，事件向上传递”。遵循这一约定会让你的组件更容易理解。

然而，在一些边界情况下，prop 的变更或 this.$parent 能够简化两个深度耦合的组件。

权衡之后再做决定。
