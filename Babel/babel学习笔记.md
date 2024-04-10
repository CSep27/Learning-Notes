注：小册《Babel 插件通关秘籍》 学习笔记

# 学习进度记录

- 23. 实战案例
- 包括 23 节和之前的内容基本都过了一遍
- 16-17 自己有仿照写过，代码在 D:\code\my-babel-exercize
- 18-23 看代码跑了一遍，大致明白原理

# Babel 处理过程

1. 解析 => 接收代码输出 AST

- 先进行词法分析
  - 词法分析阶段把字符串形式的代码转换为 令牌（tokens） 流。
- 再进行语法分析
  - 语法分析阶段会把一个令牌流转换成 AST 的形式。
  - 这个阶段会使用令牌中的信息把它们转换成一个 AST 的表述结构

2. 转换

- 转换步骤接收 AST 并对其进行遍历，在此过程中对节点进行添加、更新及移除等操作。
- 这是 Babel 或是其他编译器中最复杂的过程，同时也是插件将要介入工作的部分。
- 递归的树形遍历

3. 生成

- 把最终（经过一系列转换之后）的 AST 转换成字符串形式的代码，同时还会创建源码映射（source maps）。
- 代码生成：深度优先遍历整个 AST，然后构建可以表示转换后代码的字符串。

# 抽象语法树

## 遍历

### Visitors 访问者

- 访问者模式
- 当创建访问者时你实际上有两次机会来访问一个节点。
- 进入和退出时都会访问到节点

### Paths 路径

- 表示两个节点之间连接的对象
- 当前节点，父节点，还有很多其他的属性
- 路径对象还包含添加、更新、移动和删除节点有关的其他很多方法
- 当你有一个 Identifier() 成员方法的访问者时，你实际上是在访问路径而非节点。

### State 状态

- 存放一些全局的东西

### Scopes 作用域

- 你创建一个新的作用域时，需要给出它的路径和父作用域，之后在遍历过程中它会在该作用域内收集所有的引用(“绑定”)。

#### Bindings 绑定

- 所有引用属于特定的作用域，引用和作用域的这种关系被称作：绑定（binding）。

# API

## babylon

- Babel 的解析器
- 做解析步骤的工作

## babel-traverse

- Babel Traverse（遍历）模块维护了整棵树的状态，并且负责替换、移除和添加节点。
- 遍历 AST 进行转换

## babel-types

- 包含了构造、验证以及变换 AST 节点的方法
- 在转换过程中用到的一些工具方法
- 比如进行判断 isIdentifier

## babel-generator

- babel 的代码生成器，用在生成阶段，读取 AST 并生成代码和源码映射

## babel-template

- 让你编写字符串形式且带有占位符的代码来代替手动编码， 尤其是生成的大规模 AST 的时候。 在计算机科学中，这种能力被称为准引用（quasiquotes）。

# 常见的 AST 节点

## statement

- statement 是语句，它是可以独立执行的单位，比如 break、continue、debugger、return 或者 if 语句、while 语句、for 语句，还有声明语句，表达式语句等。我们写的每一条可以独立执行的代码都是语句。

## expression

- 表达式 执行完有返回值，这是和语句 (statement) 的区别。
- 表达式语句解析成 AST 的时候会包裹一层 **ExpressionStatement** 节点，代表这个表达式是被当成语句执行的。

# 用法

## path

### path.get()

以 exercize-module-iterator\src\traverseModule.js 中的代码分析举例

1. `const subModulePath = moduleResolver(curModulePath, path.get('source.value').node);`

- `path.get('source')` 拿到的是`path.node.source`的 NodePath 类型的实例
- `path.get('source.node')` 拿到的是`path.node.source.value`的 NodePath 类型的实例
- `path.get('source.value').node` 最终拿到的内容就是 `path.node.source.value`
- 中间获取过程不一样，可以断点进入 path.get()方法查看

2. `const specifierPaths = path.get('specifiers');`

- path.get('specifiers') => [NodePath, NodePath]
- path.node.specifiers => [Node, Node]
- 都是数组，但是数组中对象的类型不同，NodePath 包含了路径相关的信息，比如 parent。path 对象也是这个类型，NodePath 类型对象有个 node 属性，就是第二种方法拿到的数组里的值
- `path.get('specifiers')[0].node === path.node.specifiers[0]` => true

3. path.get('xxx')拿到的对象是包含路径信息的对象，参数可以传入 path.node 对象的属性，返回的是 NodePath 类型的对象，如果需要获取 path.node 对象更深层的属性对应的 NodePath 类型的对象，可以传入`a.b`，`path.node.a.b`是可以访问到的。
