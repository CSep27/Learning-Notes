![diff.jpeg](/img/bVbJqK6)

### Virtual DOM

为什么要使用 Virtual DOM？

- 将得到的变更通知生成新的 Virtual DOM 树。将新的和旧的进行 diff patch 操作，减少了直接通过 DOM API 去增删改查 DOM 的操作，提高开发效率。
- `All problem in computer science can be resolved by another level of indirection` 软件开发中的所有问题都可以通过增加一层抽象来解决。（关注点分离）

Virtual DOM 是分层思想的一种体现

- 框架将 DOM 抽象成 Virtual DOM 后可以应用在各个终端
  ![Virtual DOM.jpeg](/img/bVbJjsX)

### Diff 策略

1、 按 tree 层级 diff（level by level）

- 在 Web UI 中很少会出现 DOM 层级会因为交互而产生更新
- 在新旧节点之间按层级进行 diff
  ![tree-diff.jpeg](/img/bVbJjtd)

2、 按类型进行 diff

- 不同类型的节点之间往往差异很大，为了提升效率，只会对相同类型节点进行 diff
- 不同类型会直接创建新类型节点，替换旧类型节点
- 下图中，由上一层图形变为下一层图形。同层比较，第二列五角星和三角形不同，虽然子节点的两个五角星相同，但是也会直接将三个五角星直接销毁，替换为新的节点。
  ![不同类型-1.jpeg](/img/bVbJjtj)
  ![不同类型-2.jpeg](/img/bVbJjtn)

3、 列表 Diff

- 给列表元素设置 key，可以提升效率

### Diff 过程

- 参考文章：[详解 Vue 的 Diff 算法](https://juejin.im/post/5affd01551882542c83301da#heading-8)

```js
  updateChildren(parentElm, oldCh, newCh) {
    let oldStartIdx = 0, newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx
    let idxInOld
    let elmToMove
    let before
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {   // 对于vnode.key的比较，会把oldVnode = null
        oldStartVnode = oldCh[++oldStartIdx]
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx]
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode)
        api.insertBefore(parentElm, oldStartVnode.el, api.nextSibling(oldEndVnode.el))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode)
        api.insertBefore(parentElm, oldEndVnode.el, oldStartVnode.el)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 使用key时的比较
        if (oldKeyToIdx === undefined) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx) // 有key生成index表
        }
        idxInOld = oldKeyToIdx[newStartVnode.key]
        if (!idxInOld) {
          api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
          newStartVnode = newCh[++newStartIdx]
        }
        else {
          elmToMove = oldCh[idxInOld]
          if (elmToMove.sel !== newStartVnode.sel) {
            api.insertBefore(parentElm, createEle(newStartVnode).el, oldStartVnode.el)
          } else {
            patchVnode(elmToMove, newStartVnode)
            oldCh[idxInOld] = null
            api.insertBefore(parentElm, elmToMove.el, oldStartVnode.el)
          }
          newStartVnode = newCh[++newStartIdx]
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].el
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }
```

- `updateChildren`代码分析

1. 循环成立条件：OldStart 小于等于 OldEnd && NewStart 小于等于 NewEnd 时
2. 判断 VNode 是否为 null，是指针指向下一个节点
3. 不是则按照 OS 和 NS（S|）、OE 和 NE（E|）、 OS 和 NE（\\ ）、OE 和 NS（/）的顺序进行比较判断
   若相同
   S| 节点位置不变，指针+1
   E| 节点位置不变，指针-1
   \ OldStart 移动到 OldEnd 之后，OldStart +1， NewEnd -1
   / OldEnd 移动到 OldStart 之前，NewStart +1， OldEnd -1
   若不同，根据 key 生成 OldStart 和 OldEnd 之间的 index 表，查找元素是否在 OldStart 和 OldEnd 之间
   若有，直接移动到 OldStart 前
   若没有，创建后，移动到 OldStart 前

4. 判断如果 NewStart > NewEnd，说明新节点已经遍历完，删除 OldStart 和 OldEnd 之间的 DOM
   如果 OldStart > OldEnd，说明旧节点已经遍历完，将多的新节点根据 index 添加到 DOM 中去

- 例：如图，灰色表示 Virtual DOM 深色表示真实的 DOM
  ![diff-2.jpeg](/img/bVbJqGg)
- 四个指针
  - OldStartIdx 旧开始节点
  - OldEndIdx 和 旧结束节点
  - NewStartIdx 新开始节点
  - NewEndIdx 新结束节点

1. 判断 OldStartIdx 和 NewStartIdx 是否相同。1 和 1 相同，两个 Start 指针都往右移动一位（+1）
2. 继续比较 OldStartIdx 和 NewStartIdx 是否相同。2 和 5 不同，改为比较 OldEndIdx 和 NewEndIdx
3. 6 和 6 相同，两个 End 指针都往左移动一位（-1）。5 和 2 不一致，改为比较 OldStartIdx 和 NewStartIdx
4. 2 和 5 不同，改为比较 OldEndIdx 和 NewEndIdx，也不同。改为比较 OldStartIdx 和 NewEndIdx（\方向）。2 和 2 相同，将 OldStartIdx 对应的真实 DOM 移动到 OldEndIdx 之后，同时 OldStartIdx 右移一位，NewEndIdx 左移一位。
5. 继续比较 Start，不同，比较 End，也不同。比较 OldStart 和 NewEnd，不同。比较 OldEnd 和 NewStart（/方向），相同。移动 OldEnd 对应的真实 DOM 到 OldStart 之前。同时 OldEnd 左移，NewStart 右移。
6. 继续循环，Start| End| \ / 四个方向，都不同。根据 key 生成 OldStart 和 OldEnd 之间的 index 表，查找 7 是否在 OldStart 和 OldEnd 之间。如果找到，直接挪到 OldStart 之前。找不到，则说明是新节点，将 7 由 VirtualDOM 生成真实 DOM 后挪到 OldStart 之前。
7. NewEnd 左移，此时 NewEnd 小于 NewStart，结束循环
8. 删除 OldStart 和 OldEnd 之间的部分
9. 新 Virtual DOM 已存在，DOM 节点也已生成，销毁旧 Virtual DOM 列表
10. 设置 key 之后，就不要遍历了。算法复杂度为 O(n)，否则最坏情况为$O(n^2)$

- vue2+中并没有完整的 patch 过程，节点操作是在 diff 操作过程中同时进行的，提升了增删改查 DOM 节点时的效率
