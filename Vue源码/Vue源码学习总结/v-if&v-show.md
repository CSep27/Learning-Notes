v-if 和 v-show 在源码中的执行过程分析。

# v-if

## 普通 HTML 元素

元素在状态切换时会直接被销毁或被创建

如下 vue 代码，testIf 初始值为 false

```vue
<template>
  <div class="box">
    <div v-if="testIf">v-if测试</div>
    <button @click="testIf = !testIf">change-if</button>
  </div>
</template>
```

渲染成的 html，v-if 所在的 div 位置会用一个注释节点进行占位

```html
<div class="box">
  <!---->
  <button>change-if</button>
</div>
```

假设现在将隐藏状态切换为显示状态，vnode 变化。

旧 vnode 是注释节点， 新 vnode 的是 div

```js
prevVnode = {
  tag: undefined,
  isComment: true,
};

vnode = {
  tag: "div",
  isComment: false,
};
```

比对过程中：

1. 在 updateChildren 函数中，比较新旧节点过程中，两个节点不同，会创建新节点
2. 执行 createElm 创建 div 对应的 DOM 节点
3. div 节点有文本子节点，执行`createChildren(vnode, children, insertedVnodeQueue);`
4. createChildren 函数中还是调用 createElm 创建文本子节点，创建完成后插入到父节点中。
5. 再把 div 插入到父元素中

```js
// updateChildren
if (isUndef(idxInOld)) {
  // New element
  createElm(
    newStartVnode,
    insertedVnodeQueue,
    parentElm,
    oldStartVnode.elm,
    false,
    newCh,
    newStartIdx
  );
}

// createElm 创建 div元素
function createElm(
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return;
  }
  var data = vnode.data;
  var children = vnode.children;
  var tag = vnode.tag;
  if (isDef(tag)) {
    // 进去创建子元素
    createChildren(vnode, children, insertedVnodeQueue);
    insert(parentElm, vnode.elm, refElm);
  } else if (isTrue(vnode.isComment)) {
    vnode.elm = nodeOps.createComment(vnode.text);
    insert(parentElm, vnode.elm, refElm);
  } else {
    // 创建文本元素
    vnode.elm = nodeOps.createTextNode(vnode.text);
    insert(parentElm, vnode.elm, refElm);
  }
}

// createChildren 创建子文本元素
function createChildren(vnode, children, insertedVnodeQueue) {
  if (isArray(children)) {
    // 循环执行createElm
    for (var i_1 = 0; i_1 < children.length; ++i_1) {
      createElm(
        children[i_1],
        insertedVnodeQueue,
        vnode.elm,
        null,
        true,
        children,
        i_1
      );
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
  }
}
```

## 组件

vue 代码，v-if 作用在组件上

```vue
<template>
  <div>
    <LoadingComp v-if="testIf"></LoadingComp>
    <button @click="testIf = !testIf">change-if</button>
  </div>
</template>
```

前面的比较过程和普通元素一样，到根据 vnode 创建元素的阶段，会执行创建子组件的过程：

1. 执行 createElm 时，进入 createComponent 函数，创建组件，完成后直接返回，不会执行后面的代码。
2. createComponent 函数中，执行 vnode.data.init 钩子函数
3. init 函数中，执行`vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance)`。根据 vnode 创建组件实例，并放到 vnode.componentInstance 上
4. createComponentInstanceForVnode 函数中，执行`new vnode.componentOptions.Ctor(options);`，创建组件实例。
5. `vnode.componentOptions.Ctor`就是用来创建组件的 VueComponent 构造函数，定义在 Vue.extend 函数中。
6. 在 VueComponent 构造函数中会执行`this._init(options);`，这个方法就是创建组件实例的初始化方法，触发组件的生命周期函数。
7. LoadingComp 组件实例创建完成后，执行`child.$mount(hydrating ? vnode.elm : undefined, hydrating);`，进行挂载操作，这里 el 是 undefined。
8. $mount 过程和普通组件一样，就是 render => vnode => patch => DOM，会生成真实 DOM 放在 vnode.elm，还没有插入页面中。
9. 回到 createComponent 函数中，init 钩子执行结束。
10. vnode.componentInstance 组件实例有值了，执行`initComponent(vnode, insertedVnodeQueue);`
11. invokeCreateHooks 里，执行 cbs.create 数组中的钩子函数，包括 updateAttrs、updateClass、updateDOMListeners、updateDOMListeners、updateStyle、`_enter`、"create"、updateDirectives 8 个函数
12. initComponent 结束，执行`insert(parentElm, vnode.elm, refElm);`将 LoadingComp 子组件对应的 DOM 插入到父组件中

```js
function createElm(
  vnode,
  insertedVnodeQueue,
  parentElm,
  refElm,
  nested,
  ownerArray,
  index
) {
  if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
    return;
  }
}

function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
  var i = vnode.data;
  if (isDef(i)) {
    var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
    // 执行init钩子函数
    if (isDef((i = i.hook)) && isDef((i = i.init))) {
      i(vnode, false /* hydrating */);
    }
    // after calling the init hook, if the vnode is a child component
    // it should've created a child instance and mounted it. the child
    // component also has set the placeholder vnode's elm.
    // in that case we can just return the element and be done.
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue);
      insert(parentElm, vnode.elm, refElm);
      if (isTrue(isReactivated)) {
        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
      }
      return true;
    }
  }
}

var componentVNodeHooks = {
  init: function (vnode, hydrating) {
    var child = (vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    ));
    child.$mount(hydrating ? vnode.elm : undefined, hydrating);
  },
};
function createComponentInstanceForVnode(
  // we know it's MountedComponentVNode but flow doesn't
  vnode,
  // activeInstance in lifecycle state
  parent
) {
  return new vnode.componentOptions.Ctor(options);
}

Vue.extend = function (extendOptions) {
  var Sub = function VueComponent(options) {
    this._init(options);
  };
  return Sub;
};

Vue.prototype._init = function (options) {
  initLifecycle(vm);
  initEvents(vm);
  initRender(vm);
  callHook$1(vm, "beforeCreate", undefined, false /* setContext */);
  initInjections(vm); // resolve injections before data/props
  initState(vm);
  initProvide(vm); // resolve provide after data/props
  callHook$1(vm, "created");
};

function initComponent(vnode, insertedVnodeQueue) {
  vnode.elm = vnode.componentInstance.$el;
  invokeCreateHooks(vnode, insertedVnodeQueue);
}

function invokeCreateHooks(vnode, insertedVnodeQueue) {
  for (var i_2 = 0; i_2 < cbs.create.length; ++i_2) {
    cbs.create[i_2](emptyNode, vnode);
  }
  i = vnode.data.hook; // Reuse variable
  if (isDef(i)) {
    if (isDef(i.create)) i.create(emptyNode, vnode);
    if (isDef(i.insert)) insertedVnodeQueue.push(vnode);
  }
}
```

# v-show

原理：设置`display:none`隐藏元素

测试代码：`<div v-show="testShow">v-show测试</div>`

假设现在将显示状态切换为隐藏状态，vnode 变化。

div 对应的 vnode 的`data.directives[0].value`值从 true 变成了 false

```js
// 省略了很多内容
// prveVnode
prveVnode = {
  tag: "div",
  data: {
    directives: [
      {
        expression: "testShow",
        name: "show",
        oldValue: true,
        rawName: "v-show",
        value: true,
      },
    ],
  },
  // 子节点是个文本节点
  children: [
    {
      tag: "undefined",
      text: "v-show测试",
    },
  ],
};
// vnode
vnode = {
  tag: "div",
  data: {
    directives: [
      {
        expression: "testShow",
        name: "show",
        rawName: "v-show",
        value: false,
      },
    ],
  },
  // 子节点是个文本节点
  children: [
    {
      tag: "undefined",
      text: "v-show测试",
    },
  ],
};
```

在比较新旧 vnode 的过程中

1. 执行 patchVnode 函数过程中，如果 data 有值，就会执行钩子函数。
2. `cbs.update`是一个存储钩子函数的数组，其中有个 updateDirectives 函数就是 用来比较`data.directives`
3. 再执行`_update`函数，比较新旧 vnode 中对应的值进行更新操作。
4. 执行`callHook(dir, 'update', vnode, oldVnode);`钩子函数
5. 在 update 函数中修改元素 display 样式

```js
// 注：只保留了本例中用到的主干代码
// patchVnode
if (isDef(data) && isPatchable(vnode)) {
  for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
  if (isDef((i = data.hook)) && isDef((i = i.update))) i(oldVnode, vnode);
}

// updateDirectives
function updateDirectives(oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update(oldVnode, vnode) {
  var oldDirs = normalizeDirectives(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives(vnode.data.directives, vnode.context);
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    // existing directive, update
    dir.oldValue = oldDir.value;
    dir.oldArg = oldDir.arg;
    // 这里的update钩子，在该函数中修改样式
    callHook(dir, "update", vnode, oldVnode);
  }
}

update = function (el, _a, vnode) {
  var value = _a.value,
    oldValue = _a.oldValue;
  /* istanbul ignore if */
  if (!value === !oldValue) return;
  vnode = locateNode(vnode);
  var transition = vnode.data && vnode.data.transition;
  if (transition) {
    // transition 动画处理
  } else {
    // 在这里设置元素display样式
    // el.__vOriginalDisplay 保存显示状态时设置的初始值
    el.style.display = value ? el.__vOriginalDisplay : "none";
  }
};
```
