# Map

JS 中的对象，是键值对的集合，最早只能用字符串作为键。是“字符串-值”的对应。

Map 可以**用任何类型的值（包括对象）作为键**。是“**值-值**”的对应。

两者都是 hash 结构实现，Map 是一种更完善的 hash 结构实现。

> 散列表（hash table，也叫做哈希表），是根据键（key）而直接访问在内存存储位置的数据结构。也就是说，它通过计算一个关于键值的函数，将所需查询的数据映射到表中的一个位置来记录访问，这加快了查找速度。这个映射函数称作散列函数，存放记录的数组称作散列表。

Map 能够**记住键的原始插入顺序**。

Map 对象按键值对迭代，使用 for...of 循环在每次迭代后会返回一个形式为 [key, value] 的数组。迭代按插入顺序进行，即键值对按 set() 方法首次插入到集合中的顺序（也就是说，当调用 set() 时，map 中没有具有相同值的键）进行迭代。

规范要求 map 实现“平均访问时间与集合中的元素数量呈次线性关系”。因此，它可以在内部表示为哈希表（使用 O(1) 查找）、搜索树（使用 O(log(N)) 查找）或任何其他数据结构，只要复杂度小于 O(N)。

[object 和 map 的比较](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map#object_%E5%92%8C_map_%E7%9A%84%E6%AF%94%E8%BE%83)

## 键的比较

键的比较基于零值相等算法。这意味着 NaN 是与 NaN 相等的（虽然 NaN !== NaN），剩下所有其他的值是根据 === 运算符的结果判断是否相等。

# WeakMap

1. WeakMap 只接受对象（null 除外）和 Symbol 值作为键名，不接受其他类型的值作为键名。
2. WeakMap 的键名所指向的对象，不计入垃圾回收机制。

有时我们想在某个对象上面存放一些数据，但是这会形成对于这个对象的引用。

WeakMap 就是为了解决这个问题而诞生的，它的键名所引用的对象都是弱引用，即垃圾回收机制不将该引用考虑在内。

一旦不再需要，WeakMap 里面的**键名对象**和**所对应的键值对**会自动消失，不用手动删除引用。

## 应用

在深拷贝时，用 WeakMap 存储引用类型数据，来标记是否循环引用

# Set

与数组类似，但是成员的值都是唯一的，不重复。所以可以用来去重。

Set 函数可以接受一个数组（或者**具有 iterable 接口的其他数据结构**）作为参数，用来初始化。

```js
new Set([1, 2, 2]); // Set(2) {1, 2}
// 再通过展开运算符转化成数组，实现数组去重
[...new Set([1, 2, 2])]; // [1, 2]
// 字符串也可以
[...new Set("abb")].join(""); // 'ab'
```

传入不符合要求的参数，报错：object is not iterable

```js
new Set({});
/* 
VM602:1 Uncaught TypeError: object is not iterable (cannot read property Symbol(Symbol.iterator))
*/
```

# 运算符

## [?? 空值合并运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

一个逻辑运算符，当左侧的操作数为 null 或者 undefined 时，返回其右侧操作数，否则返回左侧操作数。

```js
1 ?? 2; // 1
null ?? 2; // 2
```
