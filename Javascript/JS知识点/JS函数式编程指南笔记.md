- 掘金小册《JavaScript 函数式编程实践指南》学习笔记

# 2. 前端视角看编程范式

- 三种编程范式
  1. 命令式编程 => 过程思维
  2. 面向对象编程（Object Oriented Programming）
  3. 函数式编程（Functional programming） => 结果思维

## 函数式编程是怎样解决问题的

- 以“输入”和“输出”为轴心，来组织程序。
- 不必去关注其内部的执行细节，只需要关注函数的输入与输出。

# 3. 纯函数和副作用

## 什么是纯函数

同时满足以下两个特征的函数，我们就认为是纯函数：

- 对于相同的输入（函数入参），总是会得到相同的输出
- 在执行过程中没有语义上可观察的副作用。

## 什么是副作用

如果一个函数除了计算之外，还对它的执行上下文、执行宿主等外部环境造成了一些其它的影响，那么这些影响就是所谓的”副作用”。

## 纯函数的本质

有且仅有【显式数据流】

> 纯函数（Pure Function）——输入输出数据流全是显式（Explicit）的函数。
> —— 维基百科

可以说纯函数就是：

> 输入只能够以参数形式传入，输出只能够以返回值形式传递，除了入参和返回值之外，不以任何其它形式和外界进行数据交换的函数。

# 4. 函数为何非“纯”不可？

- 纯函数是高度灵活的函数，它的计算逻辑在任何上下文都是成立的

# 5. 函数是“一等公民”

- “First-Class Function”（头等函数）的核心特征是“可以被当做变量一样用”
- JS 函数是可执行的对象

# 7.不可变数据实践指南

- 控制变化，确保所有的变化都在可预期的范围内发生
- 对于函数式编程来说，**函数的外部数据是只读的，函数的内部数据则是可写的**

# 8. 掌握“快照”思维——如何像创建一个 git commit 一样创建数据变更？

## 拷贝的问题

- 对于状态简单、逻辑轻量的应用来说，拷贝确实是一剂维持数据不可变性的良药。
- 但是对于数据规模巨大、数据变化频繁的应用来说，拷贝意味着一场性能灾难。

## Git “快照”是如何工作的

- 快照的本质是对索引的记录。
- Git 快照保存文件索引，而不会保存文件本身。
- 变化的文件将拥有新的存储空间+新的索引，不变的文件将永远呆在原地

## 理解“数据共享”

- 持久化数据结构的精髓同样在于“数据共享”。
- 为了达到这种“数据共享”的效果，持久化数据结构在底层依赖了一种经典的基础数据结构，那就是 Trie(字典树)。

# 10. 剖析 Immer.js 工作原理与设计模式

- 借助 Proxy 实现 具体逻辑需要再看！待看！
- 将“变与不变”分离，确保只有变化的部分被处理，而不变的部分则将继续留在原地。
- 严格地控制了“拷贝”发生的时机：当且仅当写操作确实发生时，拷贝动作才会被执行。
- “知其所止”

# 11. 因为 DRY，所以 HOF（高阶函数 higher-order function）

- 高阶函数，指的就是接收函数作为入参，或者将函数作为出参返回的函数。

# 12. Reduce：函数式语言的万金油

## map 和 reduce 之间的逻辑关系

- map() 的过程本质上也是一个 reduce()的过程！

- 区别仅仅在于， reduce() 本体的回调函数入参可以是任何值，出参也可以是任何值；而 map 则是一个相对特殊的 reduce() ,它锁定了一个数组作为每次回调的第一个入参，并且限定了 reduce() 的返回结果只能是数组。

## reduce() 映射了函数组合思想

- reduce 的工作流有两个特征：
  - reduce() 的回调函数在做参数组合
  - reduce() 过程构建了一个函数 pipeline

# 14. 深入函数组合（Composition）思想：compose/pipe 是如何实现的

## pipe

```js
/*
 * 考虑这样一个数字数组 arr：
 * const arr = [1, 2, 3, 4, 5, 6, 7, 8]
 * 现在我想以 arr 数组作为数据源，按照如下的步骤指引做一个求和操作：
 * 筛选出 arr 里大于 2 的数字 入参:数组 处理：判断大于2 出参：数组
 * 将步骤1中筛选出的这些数字逐个乘以 2 入参:数组 处理：每个数字乘以2 出参：数组
 * 对步骤 2 中的偶数数组做一次求和 入参:数组 处理：判断为偶数则求和 出参：一个数字
 */
// 数据
const arr = [1, 2, 3, 4, 5, 6, 7, 8];

// 1. 分步骤做，链式调用
const fn1 = (arr) => {
  return arr.filter((item) => item > 2);
};
const fn2 = (arr) => {
  return arr.map((item) => item * 2);
};
const fn3 = (arr) => {
  return arr.reduce((previousValue, currentValue) => {
    if (currentValue % 2 === 0) {
      previousValue += currentValue;
    }
    return previousValue;
  }, 0);
};
console.log(fn3(fn2(fn1(arr))));

// 2. 将中间态的步骤合并进一个函数
const fn = (arr) => {
  const fn1 = (arr) => {
    return arr.filter((item) => item > 2);
  };
  const fn2 = (arr) => {
    return arr.map((item) => item * 2);
  };
  const fn3 = (arr) => {
    return arr.reduce((previousValue, currentValue) => {
      if (currentValue % 2 === 0) {
        previousValue += currentValue;
      }
      return previousValue;
    }, 0);
  };
  const fnArr = [fn1, fn2, fn3];
  return fnArr.reduce((previousValue, currentValue) => {
    return currentValue(previousValue);
  }, arr);
};
console.log(fn(arr));

// 3. 再想一步，需要一个工具函数pipe，将fnArr作为参数传入
// 返回一个计算函数，再传入要计算的数据
// 这样对于任意数据，任意多个需要链式调用的函数，都可以像流水线一样操作
const pipe = (...args) => {
  return function (data) {
    return args.reduce((previousValue, func) => {
      return func(previousValue);
    }, data);
  };
};
const compute = pipe(fn1, fn2, fn3);
console.log(compute(arr));

/* 小册代码 */
function pipe1(funcs) {
  function callback(input, func) {
    return func(input);
  }

  return function (param) {
    return funcs.reduce(callback, param);
  };
}
```

## compose 倒序的 pipe

- 将 reduce 替换为 reduceRight

```js
function compose(func) {
  function callback(input, func) {
    return func(input);
  }

  return function (param) {
    return funcs.reduceRight(callback, param);
  };
}
// 倒序传入要处理的函数
const compute = pipe(fn3, fn2, fn1);
console.log(compute(arr));
```

# 15. 偏函数和柯里化

偏函数和柯里化解决的最核心的问题有两个，分别是：

- 函数组合链中的多元参数问题
- 函数逻辑复用的问题

## 函数组合链中的多元参数问题

### 理解函数中的“元数（Arity）”

函数参数里的“元数”，指的其实就是函数参数的数量。

对于函数组合链来说，它总是预期链上的函数是一元函数：函数吃进一个入参，吐出一个出参，然后这个出参又会作为下一个一元函数的入参......参数个数的对齐，是组合链能够运转的前提。

只要我们想要对函数的入参数量进行改造，必须先想到偏函数&柯里化。

### 求解多元参数问题

#### 柯里化的概念与实现

- 柯里化是把 1 个 n 元函数改造为 n 个相互嵌套的一元函数的过程。
- 具体说柯里化是一个把 fn(a, b, c)转化为 fn(a)(b)(c)的过程。

#### 偏函数

- 偏函数是指通过固定函数的一部分参数，生成一个参数数量更少的函数的过程。
- 应用场景：通用函数为了确保其自身的灵活性，往往都具备“多元参数”的特征。但在一些特定的业务场景下，真正需要动态变化的只是其中的一部分的参数。这时候就可以

#### 偏函数 vs 柯里化

- 柯里化说的是一个 n 元函数变成 n 个一元函数。
- 偏函数说的是一个 n 元函数变成一个 m（m < n） 元函数。

- 对于柯里化来说，不仅函数的元发生了变化，函数的数量也发生了变化（1 个变成 n 个）。
- 对于偏函数来说，仅有函数的元发生了变化（减少了），函数的数量是不变的。

- 对于一个四元函数来说：`func(a, b, c, d);`
- 可以固定第一个入参，使其缩减为一个三元函数：`func(b, c, d);`
- 也可以固定前两个入参，使其缩减为一个二元函数：`func(c, d);`
- 总之，只要它的元比之前小，就满足了偏函数的要求。

# 16. 如何构造一个通用的 curry 函数

思路：

1. 获取函数参数的数量
2. 自动分层嵌套函数：有多少参数，就有多少层嵌套
3. 在嵌套的最后一层，调用回调函数，传入所有入参。

## 获取函数参数的数量

- 通过 Function.length 函数参数的数量

## 自动分层嵌套函数

1. 判断当前层级是否达到了嵌套的上限
2. 若达到，则执行回调函数，否则，继续“嵌套”，也就是递归调用自己

## 递归边界的判定

- 每一层嵌套函数，都需要“记住”参数，当记住的参数长度达到了回调函数参数的长度，则停止递归

## 代码

```js
function addThreeNum(a, b, c) {
  return a + b + c;
}
// curry 函数借助 Function.length 读取函数元数
function curry(func, arity = func.length) {
  // 定义一个递归式 generateCurried
  function generateCurried(prevArgs) {
    // generateCurried 函数必定返回一层嵌套
    return function curried(nextArg) {
      // 统计目前“已记忆”+“未记忆”的参数
      const args = [...prevArgs, nextArg];
      // 若 “已记忆”+“未记忆”的参数数量 >= 回调函数元数，则认为已经记忆了所有的参数
      if (args.length >= arity) {
        // 触碰递归边界，传入所有参数，调用回调函数
        return func(...args);
      } else {
        // 未触碰递归边界，则递归调用 generateCurried 自身，创造新一层的嵌套
        return generateCurried(args);
      }
    };
  }
  // 调用 generateCurried，起始传参为空数组，表示“目前还没有记住任何参数”
  return generateCurried([]);
}
const add = curry(addThreeNum);
console.log(add(1)(2)(3));
```

- 根据思路自己思考

1. 执行函数返回一个函数
2. 记忆参数

```js
function curry(fn) {
  const l = fn.length;
  // 需要记忆每次传进来的参数
  function generateIteration(args) {
    return function iteration(param) {
      args.push(param);
      if (args.length >= l) {
        // 到达条件时执行最初的fn
        return fn(...args);
      } else {
        // 否则继续生成回调函数，并且把当前已经记忆的参数传进去
        return generateIteration(args);
      }
    };
  }
  return generateIteration([]);
}
const add = curry(addThreeNum);
console.log(add(1)(2)(3));
```

## 柯里化解决组合链的元数问题

1. 通过 curry 对函数进行“一元化”处理
2. 再调用 pipe 组合使用

```js
function curry(fn) {
  const l = fn.length;
  // 需要记忆每次传进来的参数
  function generateIteration(args) {
    return function iteration(param) {
      args.push(param);
      if (args.length >= l) {
        // 到达条件时执行最初的fn
        return fn(...args);
      } else {
        // 否则继续生成回调函数，并且把当前已经记忆的参数传进去
        return generateIteration(args);
      }
    };
  }
  return generateIteration([]);
}
const pipe = (...args) => {
  return function (data) {
    return args.reduce((previousValue, func) => {
      return func(previousValue);
    }, data);
  };
};
function add(a, b) {
  return a + b;
}

function multiply(a, b, c) {
  return a * b * c;
}

function addMore(a, b, c, d) {
  return a + b + c + d;
}

function divide(a, b) {
  return a / b;
}

const curriedAdd = curry(add);
const curriedMultiply = curry(multiply);
const curriedAddMore = curry(addMore);
const curriedDivide = curry(divide);

const compute = pipe(
  curriedAdd(1),
  curriedMultiply(2)(3),
  curriedAddMore(1)(2)(3),
  curriedDivide(300)
);
console.log(compute(3));
```

# 17. 范畴论

## 组合问题的链式解法

- 从编码的角度看，范畴论在 JS 中的应用，本质上还是为了解决函数组合的问题。
- 通过**构造一个【能够创造新盒子】盒子。**实现构造声明式的数据流

```js
const Box = (x) => {
  map: (f) => Box(f(x)),
  valueOf: () => x
}
function add4(num) {
  return num + 4;
}

function multiply3(num) {
  return num * 3;
}

function divide2(num) {
  return num / 2;
}
const computeBox = Box(10).map(add4).map(multiply3).map(divide2);
console.log(computeBox.valueOf());
```

## 复合运算：范畴论在编程中最核心的应用

从程序的视角触发，范畴包括了以下两个要素

1. 一组数据的集合（所谓“对象”）
2. 一些操作该数据集合的函数（所谓“态射”）

范畴中的函数（也即“态射”），是可以进行复合运算的。

## Box 盒子又名 Functor（函子）

一个 Functor 就是一个能够被映射的“东西”。

在 JS 中，这个“东西”可以被看作一个盒子、一个容器，它本质上是一种数据结构，一种“类型”。

而“映射”借助的就是 map 方法了。

也就是说，Functor 指的是一个实现了 map 方法的数据结构。

## 盒子模式下的代码组织方式

首先，盒子是一个存放数据的容器。同时，盒子内部可以定义一系列操作数据的函数。

关键的函数、决定盒子性质的那些函数，需要具备【创建并返回新的盒子】的能力

盒子的本质是一套行为框架。其内部容纳的数据是动态的，而数据的行为模式是预定义的。

以上面的 Box 为例，Box 函数会创建一个容器，对这个容器来说，入参 x 是未知的，但是针对 x 可以执行 map 的行为是确定的。

# 18. Functor（函子）：“盒子模式”构造函数组合链

按照上一节对 Functor 的定义，Array 其实也属于是 Functor，它也是一种实现了 map 方法的数据结构。

## “Box”又名 Identity Functor

为了标识 Functor 的类别，我们可以给它补充一个 inspect 函数：

```js
const Identity = (x) => ({
  map: (f) => Identity(f(x)),
  valueOf: () => x,
  inspect: () => `Identity {${x}}`,
});
```

同一类 Functor，往往具有相同的 map 行为

## Maybe Functor：识别空数据

### Maybe Functor 如何编码

Maybe Functor 在 Identity Functor 的基础上，增加了对空数据的校验。将错误控制在组合链的内部，不污染外部环境。

```js
const isEmpty = (x) => x === undefined || x === null;

const Maybe = (x) => ({
  map: (f) => (isEmpty(x) ? Maybe(null) : Maybe(f(x))),
  valueOf: () => x,
  inspect: () => `Maybe {${x}}`,
});
```

## 拓展：Functor 的“生存法则”

一个合法的 Functor 需要满足以下条件：

1. 恒等性（Identity）
2. 可组合性（Composition）

### 恒等性

如果传递了一个恒等函数（Identity Function ）到盒子的 map 方法里，map 方法创建出的新盒子应该和原来的盒子等价。

恒等函数：`const identity = x => x`

这条规则的目的有二：

1. 是为了确保你的 map 方法具备“创造一个新的盒子（Functor）”的能力。
2. 是为了确保你的 map 方法足够“干净”。map 方法只是一个行为框架，用于串联不同的行为（函数），而不是编辑这些行为。

### 可组合性

Functor 能够将嵌套的函数拆解为平行的链式调用。
`Functor.map(x => f(g(x)) = Functor.map(g).map(f)`

Functor 在实现函数组合的基础上，确保了副作用的可控。

# 19. Monad（单子）：“嵌套盒子”的问题解法

Monad 是一个同时实现了 map 方法和 flatMap 方法的盒子。

## “嵌套盒子”问题

在 Functor 内部嵌套 Functor 的情况，例如：

- 线性计算场景下的嵌套 Functor —— Functor 作为另一个 Functor 的计算中间态出现
- 非线性计算场景下的嵌套 Functor —— 两个 Functor 共同作为计算入参出现

### 线性计算场景下的嵌套 Functor

## flatMap：打开盒子，取出数据

```js
const Monad = (x) => ({
  map: (f) => Monad(f(x)),
  valueOf: () => x,
  inspect: () => `Monad {${x}}`,

  // 新增一个主动打开盒子的方法 flatMap
  flatMap: (f) => map(f).valueOf(),
});

const monad = Monad(1);
const nestedMonad = Monad(monad);

// 试试会发生什么？
nestedMonad.flatMap();
// 报错：map is not defined
// 执行上下文问题
```

### of 方法，通过 OOP 解决

```js
class Monad {
  constructor(x) {
    this.val = x;
  }

  map(f) {
    return Monad.of(f(this.val));
  }

  flatMap(f) {
    return this.map(f).valueOf();
  }

  valueOf() {
    return this.val;
  }
}

Monad.of = function (val) {
  return new Monad(val);
};

const monad = Monad.of(1);
const nestedMonad = Monad.of(monad);

// 输出 Monad {val: 1}，符合“不嵌套”的预期
console.log(nestedMonad.flatMap((x) => x));
```

### flatMap 的极简实现

flatMap 直接返回 f(x)，不放入盒子中

```js
const Monad = (x) => ({
  map: (f) => Monad(f(x)),
  // flatMap 直接返回 f(x) 的执行结果
  flatMap: (f) => f(x),

  valueOf: () => x,
  inspect: () => `Monad {${x}}`,
});
```

# 20. 连点成线的艺术：Semigroup（半群）与 Monoid（幺半群）

## Semigroup（半群） 的数学背景

### 结合律

在数学中，结合律是指：只要运算数字的位置没有发生改变，运算顺序的调整不会改变运算的结果。

```js
(1 + 2) + 3 = 1 + (2 + 3) = 6
(1 * 2) * 3 = 1 * (2 * 3) = 6
```

### 闭合

在数学中，闭合意味着我们对某个集合的成员进行运算后，生成的仍然是这个集合的成员。

整数在加法和乘法下是闭合的。

```js
1 + 2 + 3 = 6
1 * 2 * 3 = 6
```

### 理解数学中的 Semigroup

> 在数学中，半群是**闭合**于**结合性\*\***二元运算\*\*之下的集合 S 构成的代数结构。——wikipedia

二元运算映射到程序里就是指函数参数的数量。

## Semigroup 在函数式编程中的形态

在整数运算的加法/乘法中，+/\* 是一个运算符，可以用来计算两个任意的整数以获得另一个整数。因此，加法运算/乘法运算在所有可能的整数集合上形成一个 Semigroup。

这个逻辑其实是可以直接往 JS 中做映射的——在 JS 中，我们同样有运算符、有包括整数在内的各种数据类型，同样可以实现各种各样的计算过程。

### JS 语言中的 Semigroup

常见的几个 JS 中的 Semigroup ：

- 整数的加法和乘法
- (boolean, &&)，布尔值的“与”运算
- (boolean, ||)，布尔值的“或”运算
- (string, +/concat) ，字符串的拼接（并集）运算。
- (Array, concat)，数组的拼接（并集）运算

#### 布尔值的“与”、“或”运算

```js
const a = true;
const b = false;
const c = true;

// 与运算结果
const resOfAnd = a && b && c;

// 或运算结果
const resOfOr = a || b || c;

// 验证与运算是否符合结合律
const isAndAssociative = (a && b && c) === (a && b && c);
// 验证或运算是否符合结合律
const isOrAssociative = (a || b || c) === (a || b || c);

// 验证与运算是否符合闭合原则
const isAndClosed = typeof resOfAnd === "boolean";
// 验证或运算是否符合闭合原则
const isOrClosed = typeof resOfOr === "boolean";

// true true true true
console.log(isAndAssociative, isOrAssociative, isAndClosed, isOrClosed);
```

#### 字符串的拼接（并集）运算

使用 + 运算符和 concat()都是可行的

```js
const a = "xiuyan";
const b = "is";
const c = "handsome";

// 等价于 a + b + c
const res = a.concat(b).concat(c);

// 验证是否符合结合律
const isAssociative = a.concat(b).concat(c) === a.concat(b.concat(c));

// 验证是否符合闭合原则
const isClosed = typeof res === "string";

// true true
console.log(isAssociative, isClosed);
```

#### 数组的拼接（并集）运算

```js
const a = [1, 2];
const b = [3, 4];
const c = [5, 6];

// a + b + c
const res = a.concat(b).concat(c);

// 验证是否符合结合律
// 注意，这里我们判断的是数组的内容是否相等，而不是引用是否相等
const isAssociative =
  a.concat(b).concat(c).toString() == a.concat(b.concat(c)).toString();

// 验证是否符合闭合原则
const isClosed = res instanceof Array;

// true true
console.log(isAssociative, isClosed);
```

数组取并集运算能够形成一个 Semigroup（半群），字符串取并集运算也能够形成一个 Semigroup（半群）。

数组取并集的方法是 concat()，字符串取并集的方法也是 concat()。

在函数式编程的实践中，Semigroup 盒子的接口方法（也就是我们常说的“基础行为”）正是这个 concat()！

### 函数式编程中的 Semigroup 盒子

Semigroup 中总是有以下两个要素：

- 运算数：参与运算的数据。比如加法运算中的 1、2、3，与运算中的 true、false 等。
- 运算符：执行运算的符号。比如 +、\*、||、&& 等等等等......

映射到函数式编程来看的话，运算数可以理解为**函数的入参**，运算符则可以被抽象为一**个 concat() 函数**。

```js
// 定义一个类型为 Add 的 Semigroup 盒子
const Add = (value) => ({
  value,
  // concat 接收一个类型为 Add 的 Semigroup 盒子作为入参
  concat: (box) => Add(value + box.value),
});

// 输出一个 value=6 的 Add 盒子
Add(1).concat(Add(2)).concat(Add(3));
```

在这段代码中，我们将运算符 concat()和运算数 value 都包裹在一个名为 Add 的盒子中。

concat()接口能够同时拿到**当前盒子**的运算数 value 和**下一个盒子**的运算数 box.value，它会基于这两个运算数执行**二元运算**，最后把二元运算的结果包裹在一个新的 Add 盒子中返回。

concat() 接口是 Semigroup 盒子的核心，它能够消化任何可能的 Semigroup 运算。本节标题中的“连点成线”描述的就是 concat()接口的特征：**concat()接口宛如一条【线】，它能够将链式调用中前后相邻的两个【点】（也就是“盒子”）串联起来，进行盒子间的二元运算。**

我们可以用`Semigroup(x).concat(Semigroup(y))`来表示一个最小的二元运算单元

乘法运算的 Semigroup 盒子

```js
// 定义一个类型为 Multi 的 Semigroup 盒子
const Multi = (value) => ({
  value,
  // concat 接收一个类型为 Multi 的Semigroup 盒子作为入参
  concat: (box) => Multi(value * box.value),
});

// 输出一个 value=60 的 Multi 盒子
Multi(3).concat(Multi(4)).concat(Multi(5));
```

形如 Add 盒子、Multi 盒子这样，实现了 concat()接口的盒子，就是 Semigroup（半群）盒子。

## 由 Semigroup 推导 Monoid

> A monoid is an algebraic structure intermediate between semigroups and groups, and is a semigroup having an identity element. ——Wikipedia
> 修言直译：Monoid 是一种介于 Semigroup 和 group 之间的代数结构，它是一个拥有了 identity element 的半群。

Monoid 是一个拥有了 identity element 的半群——**Monoid = Semigroup + identity element**

identity element 在数学上叫做“单位元”。 单位元的特点在于，它和任何运算数相结合时，都不会改变那个运算数。

在函数式编程中，单位元也是一个函数，我们一般把它记为“empty() 函数”。

也就是说，Monoid =（函数。

```js
// 定义一个类型为 Add 的 Semigroup 盒子
const Add = (value) => ({
  value,
  // concat 接收一个类型为 Add 的 Semigroup 盒子作为入参
  concat: (box) => Add(value + box.value),
});

// 这个 empty() 函数就是加法运算的单位元
Add.empty = () => Add(0);

// 输出一个 value=3 的 Add 盒子
Add.empty().concat(Add(1)).concat(Add(2));
```

# 21. 从数学理论到函数组合：Monoid、Compose 中的复合本质

concat()接口是对数学中的二元运算符的抽象。 concat()接口宛如一条【线】，它能够将链式调用中前后相邻的两个【点】（也就是“盒子”）串联起来，进行盒子间的二元运算。

## concat() 与 reduce() ：从二元运算到 n 元运算

concat() 与 reduce() 相同点都是“两两组合，循环往复”。

区别在于，concat()方法的宿主可以是任意一个 Semigroup/Monoid 盒子，而 callback()和 reduce()一起，依附于数组数据结构而存在。

reduce()还能够通过反复地调用 callback()，来将有限的二元运算延伸至无限的 n 元运算。

在实践中，Monoid 常常被放在 reduce 的 callback 中参与计算。

```js
// 定义一个类型为 Add 的 Monoid 盒子
const Add = (value) => ({
  value,
  // concat 接收一个类型为 Add 的 Monoid 盒子作为入参
  concat: (box) => Add(value + box.value),
});
Add.empty = () => Add(0);

// 把 Add 盒子放进 reduce 的 callback 里去
const res = [1, 2, 3, 4].reduce(
  (monoid, num) => monoid.concat(Add(num)),
  Add(0)
);
```

## empty()函数解决了什么问题

empty()函数能够解决 n 元运算中的计算起点（也即“初始值”）不存在的问题。

计算起点的应该是一个 Monoid/Semigroup 盒子（能够提供 concat() 接口），并且它的值不应该对计算结果产生任何影响。这就是 Monoid 的单位元——empty()函数。

## concat() + reduce() 推导 foldMap() 函数

用 Monoid 来表示一个任意的 Monoid 盒子，用 arr 来表示一个任意的数组，concat()+reduce()的组合代码就可以抽象如下：

```js
arr.reduce((monoid, value) => monoid.concat(Monoid(value)), Monoid.empty());

// 先调用 map()，将数组中的所有元素都包装成 Monoid，然后再进行 reduce()调用
arr
  .map((value) => Monoid(value))
  .reduce(
    (monoid, currentMonoid) => monoid.concat(currentMonoid),
    Monoid.empty()
  );
```

对于 foldMap()来说，“实现 n 元的 Monoid 盒子运算”这个功能是固定的，而“运算符（也即 Monoid 盒子的类型）”以及“运算数（也即数组的内容）”则是动态的。动态信息总是以函数参数的形式传入。也就是说，foldMap()函数的入参，就是楼上模板代码中的 Monoid 和 arr。

```js
// 这里我以 map+reduce 的写法为例，抽象 foldMap() 函数
const foldMap = (Monoid, arr) =>
  arr
    .map(Monoid)
    .reduce(
      (prevMonoid, currentMonoid) => prevMonoid.concat(currentMonoid),
      Monoid.empty()
    );

// 定义 Multi 盒子
const Multi = (value) => ({
  value,
  concat: (box) => Multi(value * box.value),
});
Multi.empty = () => Multi(1);

// 使用 foldMap 实现 Multi 盒子求积功能
const res = foldMap(Multi, [1, 2, 3, 4]);

// 输出 24， 求积成功
console.log(res.value);
```

## 从 Monoid 到函数组合

### compose 特征：两两组合、循环往复

compose 的过程，也是一个“两两组合、循环往复”的过程，是一个由二元运算拓展至 n 元运算的过程。

一个大的 compose，可以看作是无数个小的 compose 单元的组合。每个 compose 单元，都只会组合两个函数。这个最小的 compose 单元，用代码表示如下：

```js
// 就是类似上一节里reduce的第一个函数参数的作用
const compose = (func1, func2) => (arg) => func1(func2(arg));
```

### compose 与 Monoid 的共性

Monoid 的特征：Monoid = 闭合 + 结合律 + 二元运算 + empty() 函数

compose 也具有这些特征

#### compose 是闭合的二元运算

将“compose”看做是一个运算符，把参与组合的函数看做运算数，那么有`func1 compose func2 = func3`，运算后得到的还是一个函数

#### compose 是符合结合律的

对于任意的三个函数 func1、func2、func3，总是有这样的规律：

```js
compose(
  compose(func1, func2),
  func3
) = compose(
  func1,
  compose(func2, func3)
)
```

> All properties of composition of relations are true of composition of functions, such as the property of associativity. ——wikipedia "Function Composition"词条
> 修言直译：所有“关系组合”的属性都是适用于函数组合的，比如结合律。

#### compose 的单位元如何实现

Identity Function（恒等函数）：`const identity = x => x`

不包含任何的计算修改逻辑，将入参原封不动返回，俗称“透传”。一个“透传”函数和任何函数结合，都不会改变那个函数的运算结果。因此，恒等函数就是函数组合的“单位元”。

## 范畴的本质是复合

范畴的本质是复合。 从实践的角度看，范畴论在 JS 中的应用，本质上还是为了解决函数组合的问题。

“组合”是一个更加泛的概念。除了函数的组合，还有“盒子”的组合。

compose()函数组合的是函数本身，而 foldMap()函数组合的则是不同的 Monoid 盒子。

这两种函数消化的入参类型不同，函数体的编码实现不同，但它们的逻辑特征却高度一致：**通过多次执行二元运算，将有限的二元运算拓展为无限的 n 元运算。**

两两结合，循环往复，聚沙成塔——这，就是“组合”过程。

# 22. 面向对象 vs 函数式：软件复杂度问题的两种解法

## 软件复杂度问题的两种解法

- 抽象：OOP 将数据与行为打包抽象为对象，对象是一等公民；而 FP 将行为抽象为函数，数据与行为是分离的，函数是一等公民。
- 代码重用：OOP 的核心在于继承，而 FP 的核心在于组合。

## 抽象：谁是一等公民

- 在网课的案例中，我之所以倾向于使用 FP 求解，是因为这是一个**重行为、轻数据结构**的场景；
- 在游戏的案例中，我之所以倾向使用 OOP 求解，是因为这是一个**重数据结构、轻行为**的场景。

### FP：函数是一等公民

FP 构造出的程序，就像一条长长的管道。管道的这头是源数据，管道的那头是目标数据——数据本身是清晰的、确定的、不可变的。**数据不是主角，那些围绕数据展开的行为才是主角。“行为”也就是函数，**一个小的行为单元，就仿佛是一根小小的管道。我们关心的，是如何把一节一节简单的小管道组合起来，进而得到一个复杂的、功能强大的大管道。

### OOP：对象是一等公民

OOP 通过寻找事物之间的共性，来抽象出对一类事物的描述。

既然描述的是【事物】，那么 OOP 的世界毫无疑问是一个名词占据主导的世界。在 OOP 的语境下，我们关注的不是一个个独立的函数单元，而是一系列有联系的属性和方法。**我们把相互联系的属性和方法打包，抽象为一个“类”数据结构**。当我们思考问题的时候，**我们关注的不是行为本身，而是谁做了这个行为，谁和谁之间有着怎样的联系。**

## 代码重用：组合 vs 继承

组合的过程是一个两两结合、聚沙成塔的过程；而继承则意味着子类在父类的基础上重写/增加一些内容，通过创造一个新的数据结构来满足的新的需求。

### 继承的问题

子类和父类之间的关系，是一种紧耦合的关系——父类的任何变化，都将直接地影响到子类。

### 为 OOP 引入组合思想

整个游戏仍然可以是基于 OOP 来抽象角色和角色关系的。我们仅仅是在需要实现代码重用时，引入了组合这种方法。

# 23. 函数式思想在 React 框架设计中的实践

## 宏观设计：数据驱动视图

React 的核心特征是“数据驱动视图”，这个特征在业内有一个非常有名的函数式来表达：`UI = render(data)`或`UI = f(state)`。React 的视图会随着数据的变化而变化。

### React 组件渲染的逻辑分层

```js
const App = () => {
  const [num, setNum] = useState(1);

  return <span>{num}</span>;
};
```

在 React 组件的初始化渲染过程中，有以下两个关键的步骤：

- 结合 state 的初始值，计算 <App /> 组件对应的虚拟 DOM
- 将虚拟 DOM 转化为真实 DOM

React 组件的更新过程，同样也是分两步走：

- 结合 state 的变化情况，计算出虚拟 DOM 的变化
- 将虚拟 DOM 转化为真实 DOM

`UI = f(data)`，其中 data 这个自变量，映射到 React 里就是 state。

因变量 UI 对应的则是我们肉眼可见的渲染内容，它的形态与宿主环境息息相关。在 React 中，UI 指的就是浏览器中的 DOM。

f()函数则对应的是 React 框架内部的运行机制，结合上文的分析，这套运行机制整体上可以分为两层（如下图所示）：

state 变化 => 计算层 => 虚拟 DOM => 副作用层 => 真实 DOM

- 计算层：负责根据 state 的变化计算出虚拟 DOM 信息。这是一层较纯的计算逻辑。
- 副作用层：根据计算层的结果，将变化应用到真实 DOM 上。这是一层绝对不纯的副作用逻辑。

组件作为 React 的核心工作单元，其作用正是描述数据和视图之间的关系。

若是把这个公式代入到微观的组件世界中去，那么 React 组件对应的就是公式中的 f() 函数。

## 组件设计：组件即函数

定义一个 React 组件，其实就是定义一个吃进 props、吐出 UI（注意，此处的 UI 指的是对 UI 的描述，而不是真实 DOM，下文同） 的函数：

```js
function App(props) {
  return <h1>{props.name}</h1>;
}
```

如果这个组件需要维护自身的状态、或者实现副作用等等，只需要按需引入不同的 Hooks（下面代码是一个引入 useState 的示例）：

```js
function App(props) {
  const [age, setAge] = useState(1);

  return (
    <>
      <h1>
        {" "}
        {props.name} age is {age}
      </h1>
      <button onClick={() => setAge(age + 1)}>add age</button>
    </>
  );
}
```

从趋势上看，函数组件+ React-Hooks 才是 React 的未来。

## 函数组件的心智模型：如何函数式地抽象组件逻辑

在 React-Hooks 推出以前，React 函数组件的定位仅仅是对类组件的一种补充。

在那时，函数组件能够，也仅仅能够完成从 props 到 UI 的映射——这样的转换逻辑是绝对纯的、没有任何副作用的。这一时期的函数式组件，毫无疑问是纯函数。

不管 App 组件渲染（App 组件渲染===App()函数执行）了多少次，useState()总是能“记住”组件最新的状态——这意味着 App()函数上下文被销毁时，它所对应的组件状态其实被保留了下来。要做到这一点，只能是把状态独立到 App()的外面去维护。

> 注：这种 Hook 与组件之间的松耦合关系，并不是 useState()所特有的，而是所有 React Hooks 的共性。

也就是说，对于函数组件来说，state 本质上也是一种外部数据。函数组件能够消费 state，却并不真正拥有 state 。

当我们在函数体内调用 useState() 的时候，相当于把函数包裹在了一个具备 state 能力的“壳子”里。只是这层“壳子”是由 React 实现的，我们作为用户感知不到，所以看起来像是函数组件“拥有了自己的状态”一样。

示意伪代码：

```js
function Wrapper({ state, setState }) {
  return <App state={state} setState={setState} />;
}
```

至少从逻辑上来看，Wrapper 这段伪代码足以描述 useState 和函数组件之间的关联关系——useState 所维护的状态（state），本质上和 props、context 等数据一样，都可以视作是 App 组件的 “外部数据”，也即 App() 函数的“入参” 。

用 FunctionComponent 表示任意一个函数组件，函数组件与数据、UI 的关系可以概括如下：

```js
UI = FunctionComponent(props, context, state);
```

**对于同样的入参（也即固定的 props 、 context 、 state ），函数组件总是能给到相同的输出。因此，函数组件仍然可以被视作是一个“纯函数”。**

**Hook 对函数能力的拓展，并不影响函数本身的性质。函数组件始终都是从数据到 UI 的映射，是一层很纯的东西。**而以 useEffect、useState 为代表的 Hooks，则负责消化那些不纯的逻辑。比如状态的变化，比如网络请求、DOM 操作等副作用。

也就是说，在组件设计的层面，React 也在引导我们朝着“纯函数/副作用”这个方向去思考问题。

在过去，设计一个 Class 组件，我们需要思考“**如何将业务逻辑解构到五花八门的生命周期里**”。

而现在，设计一个函数组件，我们关注点则被简化为“**哪些逻辑可以被抽象为纯函数，哪些逻辑可以被抽象为副作用**”。

我们关注的细节变少了，需要思考的问题变少了，抽象的层次更高了——React 背靠函数式思想，重构了组件的抽象方式，为我们创造了一种更加声明式的研发体验。

# 24. 函数式思想在 React 应用研发中的实践

## 函数式的 React 代码重用思路

### 高阶组件（HOC）的函数式本质

> 高阶组件（HOC）是 React 中用于复用组件逻辑的一种高级技巧。HOC 自身不是 React API 的一部分，它是一种基于 React 的组合特性而形成的设计模式。 具体而言，**高阶组件是参数为组件，返回值为新组件的函数。** ——React 官方文档

#### 高阶组件是函数

当我们使用函数组件构建应用程序时，高阶组件就是高阶函数。

#### 要组合，不要继承

```jsx
// 定义一个 NetWorkComponent，组合多个高阶组件的能力
const NetWorkComponent = compose(
  // 高阶组件 withError，用来提示错误
  withError,
  // 高阶组件 withLoading，用来提示 loading 态
  withLoading,
  // 高阶组件 withFetch，用来调后端接口
  withFetch
)(Component)

const App = () => {
  ...

  return (
    <NetWorkComponent
      // params 入参交给 withFetch 消化
      url={url}
      // error 入参交给 withError 消化
      error={error}
      // isLoading 入参交给 withLoading 消化
      isLoading={isLoading}
    />
  )
}
```

无论组件的载体是类还是函数，React 的代码重用思路总是函数式的。

### 高阶组件（HOC）的局限性

<对 react 框架不太了解，相关章节暂不学习>

# 27. 函数式编程沉思录（上）：语言特性分析（JS、TS & Flow）

## 函数式的 JavaScript

JS 语言支持函数式编程的关键特性：

1.  函数是一等公民
2.  闭包

### 函数是一等公民

### 闭包

在 JavaScript 中，闭包（closure）是指一个函数能够访问并使用其声明时所在的词法作用域（lexical scope）中的变量——即使该函数在声明时所在的作用域已经执行完毕、并且该作用域已经被销毁了。

简单来说，如果一个函数定义在另一个函数的内部，并且在外部函数返回之后仍然可以访问外部函数的变量，那么这个函数就形成了一个闭包。

```js
function outerFunction() {
  const outerValue = "外部函数的变量";

  function innerFunction() {
    console.log(outerValue);
  }

  return innerFunction;
}

const inner = outerFunction();
// 输出："外部函数的变量"
inner();
```

闭包允许函数“记住”它们创建时的词法环境（lexical environment），即函数的外部变量。这是我们在 JS 函数式编程中实现高阶函数、柯里化、偏函数等技术的基本前提。

闭包支持了高阶函数的实现，而偏函数、柯里化等技术又是高阶函数的特例。

## TS 和 Flow 对函数式的支持

通过使用 TS 和 Flow，确实可以帮助我们在开发过程中更好地使用函数式编程。

需要重点关注：**类型检查、函数重载和泛型**

### 类型检查

函数式编程中，函数的参数和返回值类型通常很重要，因此类型安全特别重要。

TS 示例代码：

```ts
// ts 示例代码
function add(a: number): (b: number) => number {
  return function (b: number): number {
    return a + b;
  };
}

const add2 = add(2);
// 输出 5
console.log(add2(3));
```

Flow 示例代码：

```js
// @flow
function add(a: number): (b: number) => number {
  return function (b: number): number {
    return a + b;
  };
}

const add2 = add(2);
// 输出 5
console.log(add2(3));
```

### 泛型和函数重载：以 fp-ts 的 compose 实现为例

#### compose 中的函数重载

函数重载是指在同一个作用域内定义了多个同名函数，这些同名函数的参数类型或数量不同。当调用这个同名函数时，编译器会根据传入的参数类型或数量来决定应该调用哪个函数。

调用 compose() 函数时，编译器会根据传入的参数类型和数量来选择正确的函数重载进行调用

#### compose 中的泛型

泛型允许我们在定义函数时不指定具体类型，而是在调用函数时再根据传入的参数类型确定具体的类型。

函数组合链上每一个函数都应该符合“前置函数的输出和后继函数的输入必须一致”。

所以对于函数组合链上不同函数之间的参数类型关系，用泛型来表达是再合适不过的。

# 28. 函数式编程沉思录（下）：从数学理论到编码实践

## Lambda 演算

Lambda 演算是一种简洁的数学模型。

Lambda 演算的核心概念经过扩展和演变，已经形成了我们今天在函数式编程中喜闻乐见的编码特性，其中最为核心两个特性分别是：

1. 函数是一等公民
2. 匿名函数

### “函数是一等公民”缘起何处？

#### Lambda 演算中的“函数是一等公民”

Lambda 演算的核心思想是：所有的计算都是通过函数来表示的，没有其他基本构建块（如变量或对象）

回到数学层面的应用上来看，Lambda 演算使用一种特殊的表示法（即 Lambda 表达式）来定义和应用函数。Lambda 表达式使用希腊字母 λ（Lambda） 作为一个前缀，表示我们正在定义一个抽象函数。

我们可以使用 λx 表示一个关于变量 x 的抽象函数，并且可以在 λ 后面跟上一个表达式来表示函数体。举个例子，λx.(x + 1) 就表示一个将输入的数值加 1 的抽象函数。

当将一个参数应用于一个 Lambda 函数时，我们只需将参数放在函数后面，用空格隔开。举个例子，(λx.(x + 1)) 2 表示给我们之前定义的抽象函数传入一个值为 2 的参数，其对应的计算结果为 3。

在 Lambda 计算中，我们只能够像上面这样，定义和应用函数，使用函数来表达所有的计算，而不能够定义和应用函数之外的任何构建块。

Lambda 运算中的函数可以作为参数传递给其他函数，也可以作为其他函数的返回值。

因此，Lambda 演算中不存在其他数据类型或结构（如变量、对象等），所有计算都是通过函数及其组合来表示的。这，就是“函数是一等公民”在数学世界的内涵。

> 资料：[4. 用“λ 演算法”去理解，为什么函数式编程会有更少的 bug](https://www.bilibili.com/video/BV1d34y1v7xr) 帮助理解“λ 演算法”
