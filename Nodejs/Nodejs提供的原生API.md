# Node.js 数据类型

## Buffer

- 处理流式数据（非一次性加载完成的数据），由于产生和使用不一定同速，所以需要缓存区
- buffer 大小通过 highWaterMark 参数指定，默认是 16kb

### 创建 Buffer

- Buffer.from(buffer|array|string)使用堆外内存新增 Buffer
- Buffer.from(arrayBuffer)浅拷贝 arrayBuffer，共享内存
- Buffer.alloc(size)分配一个指定大小的 Buffer，默认为 0，使用 UTF-8 编码
- Buffer.allocUnsafe(size)分配一个未初始化的 Buffer（速度快，但是存在安全风险）
- 流式数据会自动创建 Buffer，手动创建 Buffer 需谨慎

#### 手动创建 Buffer-坑

- 预分配一个内部的大小为[Buffer.poolSize(8K)](http://nodejs.cn/api/buffer.html#buffer_class_property_buffer_poolsize)的 Buffer 实例，作为快速分配的内存池
- 如果 size 小于或等于 Buffer.poolSize 的一半，则 Buffer.allocUnsafe() 和 Buffer.from(array) 返回的 Buffer 实例可能是从共享的内部内存池中分配。
- 绕开 V8 回收机制，使用专用回收奇偶之，提高性能和内存使用效率，但会导致未初始化的数据块投入使用，造成数据泄露的风险
- [官方文档](http://nodejs.cn/api/buffer.html#buffer_buffer_from_buffer_alloc_and_buffer_allocunsafe)

### 正确使用 Buffer

#### 转换格式

- 字符串： 编码 Buffer.from(string) 解码 buf.toString()
- JSON： buf.toJSON()

#### 裁剪和拼接

- 剪裁：buf.slice() 返回 Buffer 与原来的共享内存
- 拼接：buf.copy/buf.concat 返回新的 Buffer

#### 比较和遍历索引

- 判断相等：buf1.equals(buf2) 比较的时二进制的值
- 索引：buf[index] 或 使用 for...of/indexOf/includes 等方法

## Stream

- Stream 模块提供的时抽象接口，有很多模块实现了这个接口
- 解决异步 IO 问题

## event/EventEmitter

## Error

### 错误种类

- 标准的 JavaScript 错误，比如：SyntaxError/ReferenceError
- 底层操作触发的系统错误，比如：文件读写
- 用户自定义错误
- 异常逻辑触发的 AssertionError，通常来自 assert 模块

## URL

- [WHATWG](https://baike.baidu.com/item/WHATWG/5803339?fr=aladdin) URL
- 使用[URLSearchParams](https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams)操作参数

```
Object.fromEnteries(new URLSearchParams('foo=bar&baz=qux'))
// {foo: "bar", baz: "qux"}
```

## 全局变量

- 看上去像是全局变量的存在，实际上仅存在于模块的作用域中
  ```
  __dirname __filename exports module require()
  ```
- 从 JS 继承而来的全局变量
  ```
  console timer全家桶 global（容器）
  ```
- Nodejs 特有的全局变量
  ```
  Buffer process URL WebAssembly
  ```

# Nodejs 工具库

## [util](http://nodejs.cn/api/util.html)

- 本是内置模块开发时的公共工具集，现已开发者使用
- 风格转换
  - promisify <=> callbackify
  - TextEncoder <=> TextDecoder
- 调试工具
  - debuglog
  - inspect
  - format
  - getSystemErrorName
- 类型判断
  - types.isDate(value)

## 断言库-[assert](http://nodejs.cn/api/assert.html)

- 内置断言库，需要配合测试框架使用，主动抛出 AssertionError 错误
- 断言真假
  - assert(value, msg)
  - match(string, reg)
- 断言等价
  - strictEqual/deepStrictEqual
- 断言成功失败
  - fail/throws/doesNotThrow/ifError/rejects

## querystring

- 官方提供的解析和格式化 URL 查询字符串的实用工具
- querystring.parse()
- querystring.stringify()

# Nodejs 的文件操作能力

## os 操作系统

- 提供了与操作系统相关的实用方法和属性
- 通过兼容的方式调用不同平台的底层命令，形成系统快照
  ```
  cpus platform type uptime userInfo
  ```
- 定义操作系统级别的[枚举常量](http://nodejs.cn/api/os.html#os_signal_constants)
  ```
  信号常量SIG*
  错误常量E*   （抛错误时 E后面是错误内容）
  Windows特有WSA*
  优先级PRIORITY_*
  ```

## fs 文件系统

- fs 模块模拟 Linux 环境，提供了与文件系统进行交互的 API
- 所有文件系统操作都有同步和异步的形式
- URI 作为特殊的文件也可以被 fs 模块使用

# Nodejs 的模块机制及原理

## CommonJS 规范

- 模块引用
  - 通过 require(module)来引入 module
- 模块定义
  - 通过挂载在 module.exports 对象上实现定义
- 模块标识
  - 通过路径标识引入的是哪个模块

## Node 实现模块的过程

- 路径分析 => 文件定位 => 编译执行 => 加入缓存

### 路径分析

- 内置模块
  - 在 node 进程开始时就预加载了
  - 加载的是二进制文件，无需定位和编译
- 文件模块
  - 包括通过 npm 安装的第三方模块
  - 和自己定义的本地模块
- 模块内容可以是函数、对象或属性

### 模块加载优先级

- 已缓存模块 => 内置模块 => 文件模块 => 文件目录模块 => node_modules 模块

### 模块文件定位

1. 扩展名判断
   - .js 文件
   - .json 文件
   - .node 文件
2. 解析 package.json
   - 解析为对象
   - 读取 main 属性指定的路径 （入口文件）
3. 如果 main 没有指定入口文件，按下列规则查找入口文件
   - 将 index 作为默认值
   - 查找 index.js
   - 没有就查找 index.json
   - 再没有就查找 index.node
4. 进入下一个模块路径
   - 在父目录中重复以上逻辑
   - 轮询后依旧失败则报错

### 模块编译执行

- .js 文件
  - 通过 fs 模块同步读取后编译执行，未识别类型也会当做 js 处理
- .json 文件
  - 通过 fs 模块同步读取后，用 JSON.parse()解析并返回结果
- .node 文件
  - 用 C/C++写的扩展文件，通过 process.dlopen()方法加载最后编译生成的

### 模块 js 文件的编译

- 注入全局变量
  - 以参数形式，注入 module/exports/require 方法
  - 同时注入路径解析时得到的**filename/**dirname
- 构造上下文执行环境
  - 底层通过闭包产生作用域，通过 runInThisContext()执行
  - 将 function 对象挂载到 exports 对象上，并导出

### 加入缓存以及清除缓存

- 核心模块
  - 登记在 NativeModule.\_cache 上
- 文件模块
  - 封装后的方法以字符串的形式存储，等待调用
- 清除缓存
  - 通过 delete require.cache[require.resolve(module)]
  - 一般模块内部已经实现

### require vs import

- import
  - ES6 的规范
  - 静态加载模块
  - 编译的时候执行代码
  - 缓存执行结果
  - 按需引入，节省内存
- require
  - CommonJS 规范
  - 动态加载模块
  - 调用的时候加载源码
  - 加载全部代码
- node 环境也支持使用 import

# Nodejs 的网络编程能力

## Socket 套接字

- 实现底层通信，几乎所有的应用层都是通过 socket 进行通信
- 对 TCP/IP 协议进行封装，向应用层协议暴露接口调用
- 传输层的两种协议 TCP、UDP 不同时因为不同参数的 socket 实现过程不同

## Nodejs 网络基础模块 net/dgram

- net 模块是 TCP/IP 的 node 实现，提供了一些用于底层的网络通信的工具
- http.Server 继承自 net.Server
- http 客户端与 http 服务端的通信均依赖于 socket(net.Socket)
  - net.Server: TCP server,内部通过 socket 来实现与客户端的通信
  - net.socket: 本地 socket 的 node 版实现，它实现了全双工的 stream 接口

### net.Socket

- net.Socket 对象是 TCP 或 UNIX Socket 的抽象
- net.Socket 实例实现了一个双工流接口
- API
  - 连接相关 connect
  - 数据读写 write
  - 数据属性 bufferSize
  - 地址相关 address

### 案例

- 服务器 A(Server)启动服务，等待连接
- 基于事件驱动，服务器 B(client)访问 A 提供的服务
- 关闭数据请求，结束服务

```
// Server
const net = require('net')
const port = 3000
const host = '127.0.0.1'
// 创建服务
const server = net.createServer(socket => {
  console.log('server is connected')
  // 通过socket通信
  socket.on('data', (data) => {
    console.log('server get client data:', data.toString())
    // 发送数据
    socket.write('this is server')
  })
  socket.on('close', () => {
    console.log('server is closed.')
  })
})

server.listen(port, host, () => {
  console.log('server is running')
})
```

```
// client
const net = require('net')
const port = 3000
const host = '127.0.0.1'
// 建立连接
const client = net.createConnection(port, host)

client.on('connect', () => {
  console.log('client is connected')
})
// 接收数据
client.on('data', (data) => {
  console.log('client get server data: ', data.toString())
})
// 发送数据
client.end('this is client')

// 连接结束时
client.on('close', () => {
  console.log('client is closed.')
})
```

## http/https/http2

- Server 部分继承自 net.Server，并对请求和响应数据进行了封装
- 也提供了 request/get 的能力，允许向其他服务端发起 HTTP 请求
- Node 封装了 HTTPS/HTTP2 的实现，可以创建类 HTTP 服务

# Nodejs 的进程管理

## 操作系统的进程和线程

- 图片-多进程和多线程

## Nodejs 进程-process

- Process 是一个全局对象，无需 require 直接使用，提供进程描述
- process 对象是 EventEmiter 的实例，暴露了进程事件的钩子
  - exit 监听进程退出
  - uncaughtException 监听异常
- 提供标准流输出，对应的是进程的 I/O 操作
  - node 版本的 console 底层是由 stdio 实现的
  - 数据流与其他双工数据流不同，同步写会阻塞进程导致性能开销

## Nodejs 进程创建-child_process/cluster

- child_process 子进程
  - spawn 适用于返回大量数据，例如图像处理，二进制数据处理
  - exec 适用于少量数据，maxBuffer 默认值为 1024\*1024，超出崩溃
- cluster 集群
  - Worker 对象包含了关于工作进程的所有公共的信息和方法
  - fork 衍生新的进程，进程之间相互独立
  - 使用主从模型轮询处理服务的负载均衡任务，通过 IPC 通信

## 进程守护

- 最佳实践：该挂就挂，挂了怎么自启动
  - 使用工具实现进程守护[PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) forever
- 进程并发：以多进程形式，允许多个任务同时运行
- 线程并发：以多线程形式，允许单个任务分成不同的部分执行
- 操作系统提供协调机制，防止冲突，共享资源
- JavaScript 是单线程语言，所以多个任务只能排队进行

## 资料

[浏览器与 Node 的事件循环(Event Loop)有何区别?](https://blog.fundebug.com/2019/01/15/diffrences-of-browser-and-node-in-event-loop/)

[Nodejs 原生模块整理](https://itbilu.com/nodejs/core/N1tv0Pgd-.html)

[Nodejs 中的模块机制](https://juejin.im/entry/5b4b5081e51d451984696cb7)

[深入理解 Nodejs 中的进程与线程](https://juejin.im/post/5d43017be51d4561f40adcf9)

[Nodejs 中文文档站点](http://nodejs.cn/)
