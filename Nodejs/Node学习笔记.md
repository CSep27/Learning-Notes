注：Node.js 相关的知识点记录

# 文件描述符

- [POSIX 可移植操作系统接口](https://zhuanlan.zhihu.com/p/392588996)
- [理解 linux 中的 file descriptor(文件描述符)](https://wiyi.org/linux-file-descriptor.html)
- [Node.js 文档 - File descriptors](https://nodejs.org/docs/latest-v16.x/api/fs.html#file-descriptors_1)

```js
// node v13+ 写法
const fs = require("fs");
// 分配一个新文件描述符
fs.open("1.js", "r", (err, fd) => {
  if (err) throw err;
  console.log(fd); // 打印一个数字
  fs.fstat(fd, (err, stat) => {
    if (err) throw err;
    console.log(stat); // 文件的信息
    // 需要关闭文件描述符 否则会造成内存泄漏
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  });
});
```

# linux 安装 node

- 官网下载地址：https://nodejs.org/download/release/v18.16.1/；修改版本号可以下载不同版本
- 执行`uname -m`查看服务器架构
- 'x86_64'下载对应的`node-v18.16.1-linux-x64.tar.gz`压缩包
- /usr/local/src 软件放在这里
- tar -zxvf node-v18.16.1-linux-x64.tar.gz 解压缩安装
- 添加软链接
  - ln -s /usr/local/src/node-v18.16.1-linux-x64/bin/node /usr/bin
  - ln -s /usr/local/src/node-v18.16.1-linux-x64/bin/npm /usr/bin
- 删除软链接
  - cd /usr/bin
  - ls -l | grep node
  - rm node 删除 node 软链接，node 是软链接名称，会提示：rm: remove symbolic link 'npm'?
  - rm npm
- 执行`node -v`查看版本

## linux 安装@vue/cli

- 安装完 node 和 npm
- npm install -g @vue/cli
- ln -s /usr/local/src/node-v18.16.1-linux-x64/bin/vue /usr/bin
- vue -V

# burpsuite 工具攻击项目后 node CPU 爆满后服务不可用

## 攻击过程

- 下载安装 burpsuite 工具：https://www.ddosi.org/burpsuite-pro-2022-12-4/
- 操作过程如下：

## 定位过程

- [易于分析的 Node.js 应用程序](https://nodejs.org/zh-cn/docs/guides/simple-profiling)
- [火焰图](https://nodejs.org/zh-cn/docs/guides/diagnostics-flamegraph)
- [Node.js 性能分析之火焰图](https://blog.xizhibei.me/2017/09/09/node-js-profiling-tool-flamegraph/)
- [v8-profiler](https://www.bookstack.cn/read/node-in-debugging/v8-profiler.md)

- `node --prof app.js`启动服务
- 使用工具扫描
- `node --prof-process xxx.log > processed.txt`生成分析文件
- 找到原因修改即可

# 捕获未处理的异常

- 服务入口文件 增加监听 unhandledRejection，防止其他代码中写法有问题，没有正确捕获异常，记录日志

```js
process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason: ", reason);
});
```

# 实时查看 console.log 打印的日志

## 普通部署方式

- 将日志写入了指定路径下的文件中，假设就叫 console.log
- `tail -f console.log`

## docker 部署

- `docker ps -a | grep <容器名>` 查看容器
- `docker logs -f <容器号>`

## k8s 部署

- `kubectl get pod | grep <pod名>`
- `kubectl get pod -n seccloud | grep <pod名>` 设置了命名空间为 seccloud，所有操作需要加上`-n seccloud`
- `kubectl logs -f <pod>`

# 服务异常重启定位

- 添加日志打印代码
- 控制台实时查看日志`tail -f console.log`
- 执行会导致重启的操作
- 控制台打印错误日志，查看日志，定位问题

# 增加超时设置

1. `request.setTimeout(timeout[, callback])`，设置 HTTP 请求的超时时间，在指定的时间内**未能收到响应**
2. `response.setTimeout(msecs[, callback])`，设置 HTTP 响应的超时时间，在指定的时间内未能接收到**完整的 HTTP 响应**，则该响应将被视为超时，timeout 时间将被触发，服务器会尝试关闭连接
3. socket.setTimeout 设置 TCP 套接字的超时时间，服务器连接的套接字在指定时间内没有任何消息传递
4. server.setTimeout 设置 TCP 服务器的超时时间，服务器在指定的时间内未接收到来自客户端的连接请求

## 如果请求长时间未响应（chatgbt 回答）

1. 堆积请求数
2. 影响程序伸缩性并危及程序的可用性
3. 阻塞事件循环，伤及系统性能和吞吐量

## 项目中出现的问题

1. 云运维项目反向连接上传大文件需要等待服务的响应，响应文件内容大，响应时间超过了 node 默认的 2 分钟（找不到来源了，最新的文档表示没有默认超时时间），导致没有获取到完整的文件数据，设置了更长的 response 响应超时时间
2. 独立资源池项目 node.js 写的中间层请求后端服务，配置了错误的端口号，请求长时间未响应。使用了 k8s 管理容器，出现服务自动重启现象。（目前认为是这个原因），那么就需要给 request 增加响应超时

# 新版本 node 在 Linux 环境执行报错的问题

- jenkins 服务器上使用 node.js v18.16.1 版本执行`npm install`操作，报错：

```
node: /lib64/libm.so.6: version 'GLBC_2.27' not found (required by node)
node: /lib64/libc.so.6: version 'GLBC_2.25' not found (required by node)
node: /lib64/libc.so.6: version 'GLBC_2.28' not found (required by node)
node: /lib64/libcstdc++.so.6: version 'CXXABI_1.3.9' not found (required by node)
node: /lib64/libcstdc++.so.6: version 'GLBCXX_3.4.20' not found (required by node)
node: /lib64/libcstdc++.so.6: version 'GLBCXX_3.4.21' not found (required by node)
```

- 该报错意思为 GLIBC 库版本与 Node.js 所需的版本不兼容
- GLIBC 是一个在 Linux 系统上提供程序运行所需功能的 C 语言库
- 执行`ldd --version`查看 jenkins 服务器上 GLIBC 版本为 2.17，错误信息中显示至少需要 2.28 版本
- 如何查看 node 版本需要的库版本
- 在[Node.js 主页](https://nodejs.org/en)点击 changelog，看 v18 版本的[changelogs](https://raw.githubusercontent.com/nodejs/node/main/doc/changelogs/CHANGELOG_V18.md)，搜索 glibc 关键词可以看到至少需要 2.28 版本，与报错信息一致
- [nodejs 以往的版本列表](https://nodejs.org/zh-cn/download/releases)

## 解决方案

- [Linux-编译器 gcc/glibc 升级](https://blog.csdn.net/lc1025082182/article/details/129554635)
- 重新搭建一个 Jenkins 服务器，使用更新版本的 Linux

# node 使用 ESModule 写法

- 以下两种方式二选一，第一种会影响到整个项目的文件，第二种只修改当前文件
  1. package.json 中将 type 设置为"module"
  2. 将文件后缀修改为.mjs

## 引入 json 文件时报错

- `import manifest from "./manifest.json"`引入 json 文件时报错：
  `typeerror [err_import_assertion_type_missing] module 'menu.json' needs an import assertion of type 'json`
- 参考资料：https://github.com/crxjs/chrome-extension-tools/issues/450
- 修改写法为：

  ```js
  // gen-route.mjs
  import manifest from "./manifest.json" assert { type: "json" };
  ```

- 此种写法如果 eslint 报错：Parsing error: This experimental syntax requires enabling one of the following parser plugin(s): "importAttributes", "importAssertions".
- 安装 @babel/eslint-parser 和@babel/plugin-syntax-import-assertions
  - `npm i -D eslint @babel/eslint-parser @babel/plugin-syntax-import-assertions`
  - 使用 @babel/eslint-parser 作为解析器，并启用"@babel/plugin-syntax-import-assertions"插件
  ```js
  // .eslintrc.js
  module.export = {
    parser: "@babel/eslint-parser",
    babelOptions: {
      plugins: ["@babel/plugin-syntax-import-assertions"],
    },
    rules: {},
  };
  ```

## 无法直接使用\_\_dirname

- 需要通过[`import.meta`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)拿到，封装成工具方法调用

```js
// utils.mjs
import { fileURLToPath } from "url";
import path from "path";

const getDirname = (url) => {
  const __filename = fileURLToPath(url);
  return path.dirname(__filename);
};

export { getDirname };

// test.mjs
import { getDirname } from "./utils.mjs";
const __dirname = getDirname(import.meta.url);
```

# process.cwd()和\_\_dirname 的区别

- `process.cwd()`当前 Node.js 进程执行时的工作目录
- `__dirname`当前模块的目录名，即当前执行的 JS 文件的目录名

- 例如，在`D:\code\test\learn-node\process.js`中增加如下代码

  ```js
  console.log(process.cwd());
  console.log(__dirname);
  ```

  - 分别在在 code 目录和 learn-node 目录下执行：第二种情况下打印出来的结果相同

  ```
  PS D:\code> node .\test\learn-node\process.js
  D:\code
  D:\code\test\learn-node

  PS D:\code> cd .\test\learn-node
  PS D:\code\test\learn-node> node .\process.js
  D:\code\test\learn-node
  D:\code\test\learn-node
  ```

# CommonJS

[nodejs 中文网-CommonJS 模块](https://nodejs.cn/api/modules.html)

## require 加载模块

- require()总会优先加载核心模块。例如 require('http')
- 如果不是核心模块，也没有以"/"、"../"、"./"开头，nodejs 会从当前模块的父目录开始，从/node_modules 目录里加载，找不到再逐级向上直到根目录
- 当循环调用 require()时，一个模块可能在未完成执行时被返回。

## exports 和 module.exports 的区别

- 都可以对外暴露对象，exports 和 module.exports 开始时指向的是同一个引用
- `exports = {}` 不能这样使用，会改变它的引用。只能通过点语法增加
- `module.exports = {}` 可以这样使用

## 模块缓存

- 模块在第一次加载后会被缓存，每次调用 `require('foo')`，都解析同一文件，返回相同的对象。
- 多次调用不会导致模块的代码被执行多次。
- 如果想要多次执行一个模块，可以导出一个函数，然后调用该函数。
- 模块是基于解析的文件名进行缓存的

```js
var a = require("./test.js");
var b = require("./test.js");
console.log(a === b); // true 是从缓存中获取的，拿到的是同一个对象
```
