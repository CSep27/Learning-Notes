# Map

JS 中的对象，是键值对的集合，最早只能用字符串作为键。是“字符串-值”的对应。

Map 可以**用任何类型的值（包括对象）作为键**。是“**值-值**”的对应。

两者都是 hash 结构实现，Map 是一种更完善的 hash 结构实现。

> 散列表（hash table，也叫做哈希表），是根据键（key）而直接访问在内存存储位置的数据结构。也就是说，它通过计算一个关于键值的函数，将所需查询的数据映射到表中的一个位置来记录访问，这加快了查找速度。这个映射函数称作散列函数，存放记录的数组称作散列表。

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
