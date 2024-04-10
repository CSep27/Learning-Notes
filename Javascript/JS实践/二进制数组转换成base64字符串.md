# 二进制数组转换成 base64 字符串

- 需求：后端返回验证码图片，格式是二进制数组 ArrayBuffer，前端转换成 base64 字符串在页面显示

```
const getImageCode = async () => {
  let codeImage = "";
  const { data } = axios({
    url: "/imagecode",
    // 指定响应数据格式
    responseType: "arraybuffer",
  });
  console(data); // 二进制数组，对固定长度的连续内存空间的引用
  console(data instanceof ArrayBuffer); // true
  // 需要操作ArrayBuffer，需要“视图”对象
  console.log(new Uint8Array(buffer));
  // 将二进制数组转换成二进制字符串再转换成base64字符串
  const base64Str = window.btoa(
    new Uint8Array(buffer).reduce((preByte, curByte) => preByte + String.fromCharCode(curByte), "")
  )
  codeImage = `data:image/gif;base64,${base64Str}`
};
```

# 参考资料

- [ArrayBuffer 和 TypedArray](https://zh.javascript.info/arraybuffer-binary-arrays)
- [String.fromCharCode](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode)
  - 参数是一系列 UTF-16 代码单元的数字。范围介于 0 到 65535（0xFFFF）之间。返回由指定的 UTF-16 代码单元序列创建的字符串。
  - fromCharCode 也可以处理`new Uint16Array(buffer)`，但是在这里后续的 window.btoa 方法会报错`The string to be contains characters outside of the Latin1 range`。
- [window.btoa](https://developer.mozilla.org/zh-CN/docs/Web/API/btoa)将一个二进制字符串编码为 Base64 编码的 ASCII 字符串
- [Base64](https://developer.mozilla.org/zh-CN/docs/Glossary/Base64)
- [后端通过接口返回验证码图片处理](https://www.jianshu.com/p/3cce2fc7b5e6)
