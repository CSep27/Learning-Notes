# Array.prototype.sort()

1. 就地排序，直接改变原数组
2. 稳定排序，保留原来的相对位置
3. 当没有传入 compareFn 比较函数时，数组元素转换成字符串，默认按照元素的 UTF-16 码元值升序排序。

```js
const months = ["March", "Jan", "Feb", "Dec", "Mar"];
months.sort();
console.log(months);
// Expected output: Array ['Dec', 'Feb', 'Jan', 'Mar', 'March']
console.log("Dec".charCodeAt()); // 68
console.log("D".charCodeAt()); // 68
console.log("Feb".charCodeAt()); // 70
console.log("F".charCodeAt()); // 70
```

字母比较：

1. 先按照首字母对应的 UTF-16 码元值升序排序，最终就是首字母顺序在前的，会排在前面
2. "Mar"和"March"比较，"March"更长，字母更多，会排在后面。

```js
const array1 = [1, 30, 4, 21, 100000, 101];
array1.sort();
console.log(array1);
// Expected output: Array [1, 100000, 101, 21, 30, 4]
console.log("10000".charCodeAt()); // 49
console.log("1".charCodeAt()); // 49
console.log("21".charCodeAt()); // 50
console.log("2".charCodeAt()); // 50
```

数字（实际字符串）比较：

1. 先按照第一个数字对应的 UTF-16 码元值升序排序，第一个数字相同的，再比较第二个。
2. 100000 和 101，比到第三位时，100000 的 0 小于 101 的 1，所以 100000 在前面。
3. 按照首数字比较，100000 在 21 前面，和数字大小的比较规则不同
4. 1 和 100000。首数字相同的，比较后续的数字，最终就是数字更长的在后面。
5. 如果需要比较数字大小，就需要通过比较函数。

## compareFn

> 返回值大于 0，交换 a 和 b 的顺序，否则不交换

定义排序顺序的函数。可以写多重判断。

返回值应该是一个数字，其符号表示两个元素的相对顺序。

在[MDN-sort](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)中有文字描述，但是觉得不太好理解。最后有个表格如下：

| compareFn(a, b) 返回值 | 排序顺序<br />         |
| ---------------------- | ---------------------- |
| >0                     | a 在 b 后，如 [b, a]   |
| <0                     | a 在 b 前，如 [a, b]   |
| === 0                  | 保持 a 和 b 原来的顺序 |

a 和 b 对应数组中的前后两个值，感觉可以这么理解：

- 如果 compareFn(a, b) 返回值为 0，保持 a 和 b 原来的顺序
- 如果 compareFn(a, b) 返回值**大于 0**，**交换** a 和 b 的顺序，也就是[b,a]
- 如果 compareFn(a, b) 返回值小于 0，不交换 a 和 b 的顺序，也就还是[a,b]

正序排列，从小到大：

第一种写法：

- `a - b`就是`3 - 4` 返回负值，不交换位置
- `a - b`就是`4 - 2` 返回正值，交换位置
- 最终就是小的数被换到前面，大的数换到后面

第二种写法：

- 判断`a > b`就是判断`3 > 4`，不满足， 返回-1，不交换位置
- 判断`a > b`就是判断`4 > 2`，满足， 返回 1，交换位置
- 最终就是小的数被换到前面，大的数换到后面

```js
const arr1 = [3, 4, 2];
arr1.sort((a, b) => {
  return a - b;
});
const arr2 = [3, 4, 2];
arr2.sort((a, b) => {
  return a > b ? 1 : -1;
});
// [2, 3, 4]
```

逆序排列，从大到小，分析相同，代码如下：

```js
const arr1 = [3, 4, 2];
arr1.sort((a, b) => {
  return b - a;
});
const arr2 = [3, 4, 2];
arr2.sort((a, b) => {
  return a < b ? 1 : -1;
});
// [4, 3, 2]
```

# Array.prototype.toSorted()

是 sort 方法的复制方法版本，会返回一个排序后的新数组。

# 资料

[v8-sort](https://v8.dev/blog/array-sort)

[v8-sort-译文](https://zhuanlan.zhihu.com/p/55338902)
