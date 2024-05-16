[MDN Web 文档术语表](https://developer.mozilla.org/zh-CN/docs/Glossary)

# 码元（Code unit）

[码元](https://developer.mozilla.org/zh-CN/docs/Glossary/Code_unit)是字符编码系统（例如 UTF-8 或 UTF-16）使用的基本组成部分。字符编码系统将一个 Unicode 码位编码为一个或者多个码元。

在 UTF-16（JavaScript 字符串使用的编码系统）中，码元是 16 位值。这意味着索引到字符串或者获取字符串长度等操作将在这些 16 位单元上进行。这些单元不总是一对一地映射到我们可能认为的字符上。

## 字符串与对应码元数值相互转换

字符串转换为码元数值：

- String 的 charCodeAt() 方法返回一个整数，表示给定索引处的 UTF-16 码元，其值介于 0 和 65535 之间。

码元数值转换为字符串：

- String.fromCharCode() 静态方法返回由指定的 UTF-16 码元序列创建的字符串。

```js
"a".charCodeAt(); // 97
"A".charCodeAt(); // 65
"a".codePointAt(); // 97
String.fromCharCode(97); // a
```
