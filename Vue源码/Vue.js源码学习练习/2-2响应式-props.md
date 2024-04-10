# props

## 规范化

在初始化 props 之前，首先会对 props 做一次 normalize，它发生在 mergeOptions 的时候，在 src/core/util/options.js 中。

normalizeProps 的实现，其实这个函数的主要目的就是把我们编写的 props 转成对象格式，因为实际上 props 除了对象格式，还允许写成数组格式。

举个例子：

```js
export default {
  props: ["name", "nick-name"],
};
```

经过 normalizeProps 后，会被规范成：

```js
options.props = {
  name: { type: null },
  nickName: { type: null },
};
export default {
  props: {
    name: String,
    nickName: {
      type: Boolean,
    },
  },
};
```

经过 normalizeProps 后，会被规范成：

```js
options.props = {
  name: { type: String },
  nickName: { type: Boolean },
};
```

## 初始化

Props 的初始化主要发生在 new Vue 中的 initState 阶段，在 src/core/instance/state.js 中。

```js
function initProps(vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {};
  const props = (vm._props = {});
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = (vm.$options._propKeys = []);
  const isRoot = !vm.$parent;
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  for (const key in propsOptions) {
    keys.push(key);
    // propsOptions 上一步规范后的当前组件自定义的 props 配置
    // 例如 {modalVisible: {type: Boolean}}
    // propsData 父组件传递的props数据
    // {modalVisible: true}
    const value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      // 校验 prop 的 key 是否是 HTML 的保留属性
      const hyphenatedKey = hyphenate(key);
      if (
        isReservedAttribute(hyphenatedKey) ||
        config.isReservedAttr(hyphenatedKey)
      ) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        );
      }
      // 添加一个自定义 setter，当我们直接对 prop 赋值的时候会输出警告
      defineReactive(props, key, value, () => {
        if (vm.$parent && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
              `overwritten whenever the parent component re-renders. ` +
              `Instead, use a data or computed property based on the prop's ` +
              `value. Prop being mutated: "${key}"`,
            vm
          );
        }
      });
    } else {
      defineReactive(props, key, value);
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, `_props`, key);
    }
  }
  toggleObserving(true);
}
```

initProps 主要做 3 件事情：校验、响应式和代理。

### 校验

遍历 propsOptions，执行 validateProp(key, propsOptions, propsData, vm) 方法。

这里的 propsOptions 就是我们定义的 props 在规范后生成的 options.props 对象，propsData 是从父组件传递的 prop 数据。

校验的目的就是检查一下我们传递的数据是否满足 prop 的定义规范。

### 响应式

回到 initProps 方法，当我们通过 const value = validateProp(key, propsOptions, propsData, vm) 对 prop 做验证并且获取到 prop 的值后，接下来需要通过 defineReactive 把 prop 变成响应式。

在开发环境中我们会校验 prop 的 key 是否是 HTML 的保留属性，并且在 defineReactive 的时候会添加一个自定义 setter，当我们直接对 prop 赋值的时候会输出警告

关于 prop 的响应式有一点不同的是当 vm 是非根实例的时候，会先执行 toggleObserving(false)，它的目的是为了响应式的优化，我们先跳过，之后会详细说明。

### 代理

在经过响应式处理后，我们会把 prop 的值添加到 vm.\_props 中，比如 key 为 name 的 prop，它的值保存在 vm.\_props.name 中，但是我们在组件中可以通过 this.name 访问到这个 prop，这就是代理做的事情。

```js
// static props are already proxied on the component's prototype
// during Vue.extend(). We only need to proxy props defined at
// instantiation here.
if (!(key in vm)) {
  proxy(vm, `_props`, key);
}
```

其实**对于非根实例的子组件而言，prop 的代理发生在 Vue.extend 阶段**，在 src/core/global-api/extend.js 中：

```js
Vue.extend = function (extendOptions: Object): Function {
  // ...
  const Sub = function VueComponent(options) {
    this._init(options);
  };
  // ...

  // For props and computed properties, we define the proxy getters on
  // the Vue instances at extension time, on the extended prototype. This
  // avoids Object.defineProperty calls for each instance created.
  if (Sub.options.props) {
    initProps(Sub);
  }
  if (Sub.options.computed) {
    initComputed(Sub);
  }

  // ...
  return Sub;
};

function initProps(Comp) {
  const props = Comp.options.props;
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key);
  }
}
```

这么做的好处是不用为每个组件实例都做一层 proxy，是一种优化手段。

## Props 更新

在父组件重新渲染的最后，会执行 patch 过程，进而执行 patchVnode 函数，patchVnode 通常是一个递归过程，当它遇到组件 vnode 的时候，会执行组件更新过程的 prepatch 钩子函数，在 src/core/vdom/patch.js 中：

```js
function patchVnode(
  oldVnode,
  vnode,
  insertedVnodeQueue,
  ownerArray,
  index,
  removeOnly
) {
  // ...

  let i;
  const data = vnode.data;
  if (isDef(data) && isDef((i = data.hook)) && isDef((i = i.prepatch))) {
    i(oldVnode, vnode);
  }
  // ...
}
```

prepatch 函数定义在 src/core/vdom/create-component.js 中：

```js
prepatch (oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
  const options = vnode.componentOptions
  const child = vnode.componentInstance = oldVnode.componentInstance
  updateChildComponent(
    child,
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  )
}
```

为什么 vnode.componentOptions.propsData 就是父组件传递给子组件的 prop 数据呢（这个也同样解释了第一次渲染的 propsData 来源）？

在组件的 render 过程中，对于组件节点会通过 createComponent 方法来创建组件 vnode，在创建组件 vnode 的过程中，首先从 data 中提取出 propData，然后在 new VNode 的时候，作为第七个参数 VNodeComponentOptions 中的一个属性传入，所以我们可以通过 vnode.componentOptions.propsData 拿到 prop 数据。

这里都是直接看文档就可以了。

### 子组件重新渲染

其实子组件的重新渲染有 2 种情况，一个是 prop 值被修改，另一个是对象类型的 prop 内部属性的变化。

先来看一下 prop 值被修改的情况，当执行 props[key] = validateProp(key, propOptions, propsData, vm) 更新子组件 prop 的时候，会触发 prop 的 setter 过程，只要在渲染子组件的时候访问过这个 prop 值，那么根据响应式原理，就会触发子组件的重新渲染。

再来看一下当对象类型的 prop 的内部属性发生变化的时候，这个时候其实并没有触发子组件 prop 的更新。但是在子组件的渲染过程中，访问过这个对象 prop，所以这个对象 prop 在触发 getter 的时候会把子组件的 render watcher 收集到依赖中，然后当我们在父组件更新这个对象 prop 的某个属性的时候，会触发 setter 过程，也就会通知子组件 render watcher 的 update，进而触发子组件的重新渲染。

以上就是当父组件 props 更新，触发子组件重新渲染的 2 种情况

## toggleObserving

对于对象的 prop 值，子组件的 prop 值始终指向父组件的 prop 值，只要父组件的 prop 值变化，就会触发子组件的重新渲染，所以这个 observe 过程是可以省略的。

父组件没有传递 prop 值对默认值的处理逻辑，因为这个值是一个拷贝，所以我们需要 toggleObserving(true)，然后执行 observe(value) 把值变成响应式。

在 updateChildComponent 过程中，和 initProps 的逻辑一样，不需要对引用类型 props 递归做响应式处理，所以也需要 toggleObserving(false)。

基本都是复制了教程中的文字，主要是自己执行看下逻辑
