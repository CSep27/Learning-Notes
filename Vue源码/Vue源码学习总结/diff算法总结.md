# diff 算法过程分析

## 数据变化触发 patch

先只考虑最简单的情况，有一个`update-child.vue`文件，点击 change 按钮，items 数据内容变化

```vue
<template>
  <div class="update-child">
    <div class="update-container">
      <ul>
        <li v-for="item in items" :key="item.id">{{ item.val }}</li>
      </ul>
    </div>
    <button @click="change">change</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      items: [
        { id: 0, val: "A" },
        { id: 1, val: "B" },
        { id: 2, val: "C" },
        { id: 3, val: "D" },
        { id: 4, val: "E" },
        { id: 5, val: "F" },
      ],
    };
  },
  methods: {
    change() {
      this.items = [
        { id: 0, val: "A" },
        { id: 4, val: "E" },
        { id: 6, val: "G" },
        { id: 1, val: "B" },
        { id: 5, val: "F" },
      ];
    },
  },
};
</script>
```

> 从 Vue.js 2.0 开始，它引入了虚拟 DOM，将粒度调整为中等粒度，即**一个状态所绑定的依赖不再是具体的 DOM 节点，而是一个组件**。这样状态变化后，会通知到组件，组件内部再使用虚拟 DOM 进行比对。

初始化时，data 中的 items 变成了响应式数据。点击 change 按钮，将响应式数据 items 修改了，触发 setter，那么视图 watcher 的 update 方法就会触发。

`setter => dep.notify => Watcher.update => updateComponent => vm._update`

```js
vm._update(vm._render(), hydrating);
```

`vm._render()` 函数根据变更后的数据，生成了新的 vnode（ul 下面有 5 个 li），传入到了 `vm._update` 方法中

```js
Vue.prototype._update = function (vnode, hydrating) {
  var vm = this;
  // 旧的真实DOM会存在 vm.$el 上
  // 旧的vnode会存储在 vm._vnode 上
  // 这里用一个变量存储下来
  var prevEl = vm.$el;
  var prevVnode = vm._vnode;
  var restoreActiveInstance = setActiveInstance(vm);
  // 然后把通过vm._render()生成的新的 vnode 放到 vm._vnode 上
  // 等diff之后 vm.$el 上放的就是新的真实DOM了
  vm._vnode = vnode;
  // Vue.prototype.__patch__ is injected in entry points
  // based on the rendering backend used.
  if (!prevVnode) {
    // initial render
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
  } else {
    // updates
    // 就在这里，调用patch之后，vm.$el 上放的就是新的真实DOM
    vm.$el = vm.__patch__(prevVnode, vnode);
  }
};
```

this 也就是 vm，是当前 vue 组件实例，初次渲染时保存在了内存中。在触发 change 方法时，可以在控制台打印看到。

旧的真实 DOM 存储在 `vm.$el` 上，用变量 prevEl 保存下来，旧的 vnode 会存储在 `vm._vnode` 上，用变量 prevVnode 保存。

`vm.$el = vm.__patch__(prevVnode, vnode);`将旧 vnode 和新 vnode 进行 diff 算法比较。

在这个过程中，如果需要移动 DOM，就直接移动原来的 DOM 元素到新的位置上，如果需要创建 DOM，就将创建后的 DOM 元素直接插入到队列中去。当比较过程结束之后，返回处理后的 DOM 序列赋值给`vm.$el`。

## patch 具体过程

`vm.__patch__`方法中会调用`patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);`

在`patchVnode`方法中就会深入比较子元素，执行`updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);`

`update-child.vue`组件结构是树形结构，元素之间有父子关系，在 vnode 对象中用 children 数组和 parent 对象保存。

在比较父级的过程中，判断 children 有值情况下，会进行**深度搜索**比较。

先比较 div 元素`class="update-child"`，再比较子元素 div 元素`class="update-container"`，再比较子元素 ul。

到这经过 sameVNode 方法都会判定为 true，就开始比较 ul 的 children 数组。

### sameVNode 函数

1. key 相同
2. tag 相同
3. isComment 相同
4. isDef(a.data) === isDef(b.data) data 属性都有，或者都没有
5. sameInputType(a, b) 如果是 Input 标签，需要进一步判断

```js
function sameVnode(a, b) {
  return (
    a.key === b.key &&
    a.asyncFactory === b.asyncFactory &&
    ((a.tag === b.tag &&
      a.isComment === b.isComment &&
      isDef(a.data) === isDef(b.data) &&
      sameInputType(a, b)) ||
      (isTrue(a.isAsyncPlaceholder) && isUndef(b.asyncFactory.error)))
  );
}
function sameInputType(a, b) {
  if (a.tag !== "input") return true;
  var i;
  var typeA = isDef((i = a.data)) && isDef((i = i.attrs)) && i.type;
  var typeB = isDef((i = b.data)) && isDef((i = i.attrs)) && i.type;
  return typeA === typeB || (isTextInputType(typeA) && isTextInputType(typeB));
}
```

### diff 算法核心内容

主要通过 li 元素的变化来说明 diff 算法的过程。每个 li 在比较时还会往下比较子元素文本元素。

```js
function updateChildren(
  parentElm,
  oldCh,
  newCh,
  insertedVnodeQueue,
  removeOnly
) {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx, idxInOld, vnodeToMove, refElm;

  // removeOnly is a special flag used only by <transition-group>
  // to ensure removed elements stay in correct relative positions
  // during leaving transitions
  const canMove = !removeOnly;

  if (process.env.NODE_ENV !== "production") {
    checkDuplicateKeys(newCh);
  }

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      patchVnode(
        oldStartVnode,
        newStartVnode,
        insertedVnodeQueue,
        newCh,
        newStartIdx
      );
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      patchVnode(
        oldEndVnode,
        newEndVnode,
        insertedVnodeQueue,
        newCh,
        newEndIdx
      );
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // Vnode moved right
      patchVnode(
        oldStartVnode,
        newEndVnode,
        insertedVnodeQueue,
        newCh,
        newEndIdx
      );
      canMove &&
        nodeOps.insertBefore(
          parentElm,
          oldStartVnode.elm,
          nodeOps.nextSibling(oldEndVnode.elm)
        );
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // Vnode moved left
      patchVnode(
        oldEndVnode,
        newStartVnode,
        insertedVnodeQueue,
        newCh,
        newStartIdx
      );
      canMove &&
        nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // 进入最后的else
      // oldKeyToIdx 初始为undefined，赋值了之后后续可以复用
      if (isUndef(oldKeyToIdx))
        // createKeyToOldIdx 在oldCh里，遍历 oldStartIdx 和 oldEndIdx 之间的元素
        // 以元素的key为索引，循环的i为值，返回map对象 {2: 2, 3: 3}
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      // 如果设置了key，那么直接从 oldKeyToIdx 这个对象中根据key就可以找到元素
      // 如果没有设置key，就需要执行findIdxInOld函数，进行循环，依次进行sameNode函数比较，去找相同的元素
      idxInOld = isDef(newStartVnode.key)
        ? oldKeyToIdx[newStartVnode.key]
        : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
      if (isUndef(idxInOld)) {
        // 如果没找到就要创建新元素
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
      } else {
        // 找到了key相同的元素
        vnodeToMove = oldCh[idxInOld];
        if (sameVnode(vnodeToMove, newStartVnode)) {
          // 判断是sameNode
          // 将找到的元素 和 newStartVnode进行patch，深度比较子元素
          patchVnode(
            vnodeToMove,
            newStartVnode,
            insertedVnodeQueue,
            newCh,
            newStartIdx
          );
          // 原来位置元素变成undefined，还占着位置
          oldCh[idxInOld] = undefined;
          // 把元素移动到oldStartVnode前面
          canMove &&
            nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
        } else {
          // same key but different element. treat as new element
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
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }
  if (oldStartIdx > oldEndIdx) {
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
    addVnodes(
      parentElm,
      refElm,
      newCh,
      newStartIdx,
      newEndIdx,
      insertedVnodeQueue
    );
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
  }
}
```

#### 四个方向的比较

A B C D E F
A E G B F

四个指针分别指向新旧 vnode 的开始和结束位置，按照如下顺序，将指针对应的 vnode 传入 sameVnode 方法进行比较。

如果不同就接着下一个方向比较，如果相同，进行处理后，又从头开始按顺序比较。

```
|  oldStartIdx 和 newStartIdx 如果相同，节点位置不变，两个指针都++
 | oldEndIdx 和 newEndIdx     如果相同，节点位置不变，两个指针都--
\  oldStartIdx 和 newEndIdx   如果相同，将oldStartIdx对应的elm移动到oldEndIdx后，oldStartIdx++，newEndIdx--
/  oldEndIdx 和 newStartIdx   如果相同，将oldEndIdx对应的elm移动到oldStartIdx前，oldEndIdx--，newStartIdx++
```

移动元素在浏览器环境中就是调用`parentNode.insertBefore(newNode, referenceNode);`API

#### 四个方向比较之后的遍历

当四个方向比较都没找到相同的，进入最后的 else。

此时遍历 oldStartIdx 和 oldEndIdx 之间的元素，查找当前 newStartIdx 是否在其中。

- 如果找到，把元素移动到 oldStartIdx 前去。
- 如果没找到，根据 vnode 创建 DOM 元素，插入到 oldStartIdx 前面。

具体见代码中的注释分析。

##### key 在查找中的作用

在查找 newStartIdx 是否在 oldStartIdx 和 oldEndIdx 之间的元素（简称为待查找区间元素）中时。

- 如果给每个 li 元素设置了唯一的与当前元素绑定的 key，先循环一次待查找区间元素生成 map，再通过 key 直接在 map 里找。后续查找就会非常方便，效率高。
- 如果没有设置 key，那么每个元素都需要循环一次待查找区间元素，去找有没有相同元素。复杂度就会提高。

key 的作用是为了提高查找 vnode 的效率，降低算法复杂度。

所以 key 要和当前元素绑定，一一对应，一般用数据唯一标识 id 作为 key。

#### 指针查找结束后

如果 newStartIdx>newEndIdx 了，说明新元素遍历完了，如果此时 oldStartIdx<=oldEndIdx 的话，说明剩下这些旧元素没用到了，直接删除。
如果 oldStartIdx>oldEndIdx 了，说明旧元素遍历完了，如果此时 newStartIdx<=newEndIdx 的话，说明剩下这些新元素都需要创建，然后插入到 oldStartIdx 之前。

#### 总结

在 patch 过程中：

- 原来的元素只是改变了位置的，会复用移动到新位置上
- 不用的元素被删除
- 新元素会根据 vnode 生成新的 DOM 插入其中
- 深度搜索往下比较到叶子节点

## 过程总结

1. 数据变化，触发 watcher.update 方法，执行`_vender` 函数生成新的 vnode。（以组件为粒度进行更新）
2. 新旧 vnode，深度优先比较，一直比较到最下面的子元素，调用 diff 算法比较
3. 比较发现，如果元素可以复用，就按照规则移动，移动的是真实的 DOM 元素。
