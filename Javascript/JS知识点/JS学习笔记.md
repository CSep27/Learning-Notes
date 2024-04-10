### 1. break 只允许出现在循环或者 switch 语句中

### 2. 字符串的在内存中的不可变性

```
var str = "123";
str = str + "abc";
console.log(str);
```

- 字符串操作中
- 第一步，在栈中开辟一块空间用来存储字符串 “123”，变量 str 指向它
- 第二步，新开辟一块空间，找到 str 对应的值，将拼接后的结果”123abc”放到新空间中去，再改变变量 str 的指向，使其指向新空间

```
var num = 123;
num = num + 1;
console.log(num);
```

- 数值操作中
- 第一步，在栈中开辟一块空间用来存储数值 123，变量 num 指向它
- 第二步，找到 num 的值，加 1，得到 124，直接将值修改为 124，不开辟新空间也不需要改变 num 的指向

- 所以大量拼接字符串时会多了一些操作，并且原有的字符占据的空间不会被立即释放，因此会产生效率问题
- ES6 新增 `` 可以直接拼接字符串和变量

### 3. 只有 document 有 getElementById 方法

### 4. `document.getElementsByClassName` 有兼容性问题

- 调用时需要判断当前浏览器是否支持`document.getElementsByClassName`
- 如果直接在使用方法前判断，这样每次调用时都要进行一次判断，因此可以声明一个对象 support，在其中添加方法预先判断浏览器是否支持某些方法。
- 给 support 添加同名方法 getElementsByClassName，并且要验证该方法是否为浏览器原生提供的，具有应有的功能，而不是自定义或被修改过的。

```
var support = {
    getElementsByClassName: function () {
        var b = false;
        if (typeof document.getElementsByClassName === "function") {
            var dv = document.createElement("div");
            var cls = "itcast" + Math.random()
            dv.className = cls;
            // 将创建出来的dv放到页面中去
            document.body.appendChild(dv);
            b = document.getElementsByClassName(cls) === dv;
            document.body.removeChild(dv);
            return b;
        }
        return b;
    }
}

function getElmsByClsName(className, results) {
    results = results || [];
    if (support.getElementsByClassName()) {
        // 支持
        results.push.apply(results, document.getElementsByClassName(className));
    } else {
        // 不支持
        var nodes = document.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (" " + node.className + " ".indexOf(" " + className + " ") > -1) {
                results.push(node);
            }
        }
    }
    return results;
}

```

### 5. Dom 对象共同点，都有 nodetype 属性，并且值都不为 0

- ELEMENT_NODE:1 元素节点
- TEXT_NODE:3 文本节点
  - 获取文本节点的值 txtNode.nodeValue
- DOCUMENT_NODE:9 document
- DOCUMENT_FRAGMENT_NODE:11 documentFragment

### 6. 在 jQuery 中获取元素的方式，是从后往前获取的

- 原因：从后往前获取的效率要高
- CSS 选择器也是从后往前匹配的

### 7. 动态创建元素的推荐方式

1. 使用字符串拼接然后一次性添加到页面中去 拼接字符串：+= 数组： push，最后 join 一次
2. 使用 createElement 创建元素，然后一次性的添加到页面中去

- jQuery 中如何创建元素
  ```
  // 1
  var $dv=$("<div></div>");
  $("body").append($dv);
  // 2
  $("body").append("<div></div>");
  // 3
  $("<div></div>").appendTo("body");
  ```

### 8. documentFragment

- nodetype: 11
- 优势：只作为容器，不占用结构
- 用法：`var docFrag = document.createDocumentFragment();`
- 封装创建元素的函数
  ```
    // 方法1
    var createElement = function (htmlString) {
      var dv = document.createElement("div");
      dv.innerHTML = htmlString;
      var docFrag = document.createDocumentFragment();
      var len = dv.childNodes.length;
      for (var i = 0; i < len; i++) {
        docFrag.appendChild(dv.childNodes[0]);
      }
      return docFrag;
    }
    // 方法2
    var createElement = function (htmlString) {
      var dv = document.createElement("div");
      dv.innerHTML = htmlString;
      var docFrag = document.createDocumentFragment();
      while (dv.firstChild !== null) {
        docFrag.appendChild(dv.firstChild);
      }
      return docFrag;
    }
    var list = createElement("<div>123</div><div>abc</div>");
    document.body.appendChild(list);
  ```
  - 注意点：使用 appendChild 时会将元素从原来的位置扒下来放到新的位置上，所以 dv.childNodes 的长度会不断减小
- `ele1.appendChild(ele2)`
  - 如果 ele2 是页面上原有的标签，会把他从原来的位置揪下来，如果不是页面上原有的标签，直接追加
  - 注意点：在调用 appendChild 方法的时候，会将页面中存在的元素或者作为某个元素的子元素（DOM 结构）存在的元素移除掉，之后再追加。如果这些元素，被存储到了某个数组中，并且 调用 appendChild 的时候，是直接从数组中获取的元素，那么，此时会将页面中的元素做移除并添加的操作。但是不会影响到数组本身（数组中的元素的顺序是不会改变的）
- `ele.cloneNode(boolean)`
  ```
  // 克隆demo 克隆出来的元素被变量clone接收
  var clone = demo.cloneNode(true);
  // 参数是一个布尔值 true表示深层复制 false是浅层复制
  // 深层复制会把内部 所有的内容都复制
  // 克隆出来的节点不会对原来的节点产生任何影响
  ```

### 9. 数组和对象的联系和区别

- 数组：有序键值对的集合
  - 数组的索引号，就相当于对象的键（属性）
- 对象：无序键值对的集合

- 如何区分数组和伪数组？
  1. arr instanceof Array 若是返回 true
     - 使用此方法来判断类型是否是数组，在一个页面中是没有问题的。但是，如果是页面中嵌套了 iframe，某些浏览器中返回的就是 false
  2. Array.isArray(arr) 若是返回 true 有兼容性问题
  3. Object.prototype.toString.call(arr)

### 10. length 和 push 方法的关系

- push 方法会自动修改对象的 length 属性
- 不管这个对象一开始有没有这个属性，如果一开始没有 length 就会添加
- 如果有，就会修改 length 属性的值
- 如果这个属性是只读的，那么，调用 push 方法的时候，就会报错

### 11. 函数声明与函数表达式

```
  // 函数声明 有function关键字 就是函数声明 就会把这个函数的引用赋值给关键字后面的标识符
  // 将来通过这个标识符就可以对函数进行调用
  function fn1() {
    console.log("fn1");
  }
  // 函数表达式 运算符和function关键字 构成了表达式 此时函数就变为了一个整体
  // 会把这个函数的引用返回 也就是说 这个整体相当于一个引用
  var fn2 = function () {
    console.log("fn2");
  };

  // 也就是说 只要有运算符 函数就变为了一个可以调用的整体
  (function () {
  })();
  +function () {
    console.log("fn2");
  }();
  !function () {
    console.log("fn2");
  }();

  // 函数表达式 如果在function关键字后面写了标识符 也不会报错
  // 但是没有意义 function关键字后面即使写了标识符 也获取不到引用
  var fn3 = function fn4() {
    console.log("a");
  };
  fn3(); // a
  fn4(); // Uncaught ReferenceError: fn4 is not defined
```

### 12. jQuery 的入口函数 与 window.onload 有什么区别？

1. 绑定事件的数量不同
   - window.onload 只能出现一次
   - window.addEventListener("load", function() {}) 通过此种方法可以绑定多个
   - jQuery 的入口函数可以出现多次
2. 执行的时机不同（主要区别）
   - jQuery 的入口函数，是等到文档树（DOM 树）加载完成就会执行
   - window.onload 这个事件，是等到所有的外部资源（页面、图片、视频、引入的 js、css 等）加载之后，再执行

### 13. 获取元素样式

- style 只能用来获取行内样式
- W3C 标准：
  ```
  // 返回值是一个对象，这个方法可以获取到元素的所有样式
  window.getComputedStyle( 要获取的元素 [,伪元素] )
  // IE 返回值是一个对象
  dom.currentStyle()
  ```

### 14. = 等号运算符返回的是等号右边的值

```
var a = b = 0;
console.log(a); // 0
console.log(b); // 0
```

### 15. 逗号运算符返回的是最后一个的值

```
var a = (1, 3, 5, 7);
console.log(a); // 7
for (var i = 0; i < 10, i < 20; i++) {
    console.log(1); // 20个1
}
```

### 16. p 元素内部不允许出现任何块级元素

### 17. 函数的 length 属性 是形参的个数

### 18. tabIndex 属性可设置或返回某个区域的 tab 键控制次序

```
areaObject.tabIndex = tabIndex
```
