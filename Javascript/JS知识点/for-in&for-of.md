# [for...of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of)

执行一个循环，循环的是**可迭代对象**。

用于迭代可迭代对象定义的要进行迭代的**值**。

语法：

```txt
for (variable of iterable)
  statement;
```

基础示例：

```js
const array1 = ["a", "b", "c"];

// 要进行迭代的值是每个数组的元素
for (const element of array1) {
  console.log(element);
}
// "a", "b", "c"
```

## 可迭代对象

1. 内置对象的实例，如：

- Array、String、TypedArray、Map、Set
- NodeList（以及其他 DOM 集合），
- arguments 对象
- 由生成器函数生成的生成器
- 用户定义的可迭代对象

## 迭代 Map

```js
const iterable = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3],
]);

for (const entry of iterable) {
  console.log(entry);
}
// ['a', 1]
// ['b', 2]
// ['c', 3]

// 还可以结构赋值，拿到每个值，内部具体的值
// 比如值['a', 1]这个数组中，对应[key, value]结构
// key 为 'a'， value 为 1
for (const [key, value] of iterable) {
  console.log(value);
}
// 1
// 2
// 3
```

# [for...in](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...in)

迭代一个对象的所有**可枚举字符串属性**（除 Symbol 以外），包括继承的可枚举属性。

# 两者区别示例

以迭代数组为例

```js
// 原型上的属性
Object.prototype.objCustom = function () {};
Array.prototype.arrCustom = function () {};

const iterable = [3, 5, 7];
// 数组的自定义属性
iterable.foo = "hello";

// 打印具有整数名称的可枚举属性，也就是数组的键，可枚举的字符串属性foo，继承的可枚举属性
for (const i in iterable) {
  console.log(i);
}
// "0"、"1"、"2"、"foo"、"arrCustom"、"objCustom"

// 通过hasOwn进行了判断，那么继承的可枚举属性不会打印
for (const i in iterable) {
  if (Object.hasOwn(iterable, i)) {
    console.log(i);
  }
}
// "0" "1" "2" "foo"

// 数组迭代器要迭代的值，是数组中的每个元素的值
// 不是属性
for (const i of iterable) {
  console.log(i);
}
// 3 5 7
```
