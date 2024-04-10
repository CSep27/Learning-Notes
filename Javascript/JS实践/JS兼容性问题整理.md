## 1. 内部文本属性

- innerHTML
  - 获取和设置标签中的内容，设置的内容会当作节点对象被解析到 DOM 树上
- innerText
  - 获取和设置标签中的内容，设置的内容会被当作普通文本（有兼容性问题，旧版 ff 不支持）
- textContent
  - 获取和设置标签中的内容，设置的内容会被当作普通文本（有兼容性问题，旧版 IE 不支持）

## 2. 节点

### 2.1 节点类型

- node.nodeType
  - 1 表示元素节点 2 表示属性节点 3 表示文本节点

### 2.2 节点层次

1. - childNodes // 子节点
   - children // 子元素 不是标准的，但是兼容性很好
2. - nextSibling // 下一个兄弟节点
   - nextElementSibling // 下一个兄弟元素 有兼容性问题
3. - previousSibling // 上一个兄弟节点
   - nextElementSibling // 下一个兄弟元素 有兼容性问题
4. - firstChild // 第一个节点
   - firstElementChild // 第一个子元素 有兼容性问题

## 3. 获取自定义属性

- 统一通过 getAttribute()获取自定义属性

## 4. 事件

- 事件对象
  - 普通 event
  - IE window.event
  ```
  var e = event || window.event
  ```
- 触发事件的目标元素
  ```
  var target = e.srcElement|| e.target
  ```

1. IE678 中,事件对象是作为一个全局变量来保存和维护的.所有的浏览器事件,不管是用户触发的，还是其他事件,都会更新 window.event 对象.所以在代码中，只要调用 window.event 就可以获取事件对象， 再通过 event.srcElement 就可以取得触发事件的元素进行进一步处理.
2. 其他浏览器中，事件对象却不是全局对象，一般情况下，是现场发生，现场使用，浏览器把事件对象自动传给事件处理程序.

## 5. 页面滚动坐标

```
var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
```

## 6. 获取计算后样式

- 例如 要获取未加定位的盒子的 left 属性值，如何获取到计算后的样式属性值
- w3c
  - window.getComputedStyle(元素,伪元素)["left"]
  - 第二个参数是伪元素，传入 null 即可
- IE
  - div.currentStyle.left 或 div.current["left"]

## 7.网页可视区宽高

```
var clientWidth = window.innerWidth|| document.documentElement.clientWidth|| document.body.clientWidth|| 0;
```
