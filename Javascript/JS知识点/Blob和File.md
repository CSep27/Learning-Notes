# Blob

- 一个 Blob 对象表示一个不可变的，原始数据的类似文件对象。Blob 表示的数据不一定是一个 JavaScript 原生格式。File 接口基于 Blob，继承 blob 功能并将其扩展为支持用户系统上的文件。
- 使用 Blob()构造函数，从其他非 blob 对象和数据构造 Blob
- 创建一个包含另一个 blob 的数据子集的 blob，使用 slice()方法。要从用户文件系统上的一个文件中获取一个 Blob 对象，参阅 File 文档
- 注：slice()一开始的时候是接受 length 作为第二个参数，以表示复制到新 Blob 对象的字节数。如果设置其为 start+length，超出了源 Blob 对象的大小，那返回的 Blob 则是整个源 Blob 的数据

### 构造函数

- `Blob(blobParts[, options])`
- 返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成

### 属性

- Blob.isClosed (只读)
  - 布尔值，指示 Blob.close()是否在该对象上调用过。关闭的 blob 对象不可读。
- Blob.size (只读)
  - Blob 对象中所包含数据的大小（字节）
- Blob.type (只读)
  - 一个字符串，表明该 Blob 对象所包含数据的 MIME 类型。如果类型未知，则该值为空字符串

### 方法

- Blob.close()
  - 关闭 Blob 对象，以便能释放底层资源
- Blob.slice(\[start\[,end\[,contentType]]])
  - 返回一个新的 Blob 对象，包含了源 Blob 对象中指定范围内的数据

### 示例

#### Blob 构造函数用法举例

- Blob 构造函数允许用其他对象创建一个 Blob 对象。比如，用字符串构建一个 blob

```js
var debug = { hello: "world" };
var blob = new Blob([JSON.stringify(debug, null, 2)], {
  type: "application/json",
});
```

#### 使用类型数组和 Blob 创建一个 URL

```js
var typedArray = GetTheTypedArraySomehow();
// 传入一个合适的MIME类型
var blob = new Blob([typedArray], { type: "application/octet-binary" });

// 会产生一个类似blob:d3958f5c-0777-0845-9dcf-2cb28783acaf这样的URL字符串
// 可以像使用一个普通URL那样使用它，比如用在img.src上
var url = URL.createObjectURL(blob);
```

#### 从 Blob 中提取数据

- 从 Blob 中读取内容的唯一方法是使用 FileReader
- 使用 FileReader 以外的方法读取到的内容可能会是字符串或是数据 URL

```js
// 将Blob的内容作为类型数组读取
var reader = new FileReader();
reader.addEventListener("loadend", function () {
  // reader.result contains the contents of blob as a typed array
});
reader.readAsArrayBuffer(blob);
```

# File

- File 接口提供有关文件的信息，并允许网页中的 JavaScript 访问其内容
- 通常情况下，File 对象时来自用户在一个&lt;input&gt;元素上选择文件后返回的 FileList 对象，也可以是来自由拖放操作生成的 DataTransfer 对象，或者来自 HTMLCanvasElement 上的 mozGetAsFile()API。
- File 对象时特殊类型的 Blob，且可以用在任意的 Blob 类型的 context 中。且可以用在任意的 Blob 类型的 context 中。比如说，FileReader，URL.createObjectURL()，createImageBitmap()，及 XMLHttpRequest.send()都能处理 Blob 和 File。

### Constructor

- File()
  - 返回一个新构建的 File

### 属性

- File 接口也继承了 Blob 接口的属性
- File.lastModified （只读）
  - 返回当前 File 对象所引用文件最后修改时间，自 1970 年 1 月 1 日 00：00 以来的毫秒数
- File.lastModifiedDate （只读）
  - 返回当前 File 对象所引用文件最后修改时间的 Date 对象
- File.name （只读）
  - 返回当前 File 对象所引用文件的名字
- File.size （只读）
  - 返回文件的大小
- File.webkitRelativePath （只读）
  - 返回 File 相关的 path 或 URL
- File.type
  - 返回文件的 MIME 类型

### 方法

- File 接口没有定义任何方法，但是继承了 Blob 接口的方法

### 兼容性

[MDN-File](https://developer.mozilla.org/zh-CN/docs/Web/API/File)
