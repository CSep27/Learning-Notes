# 基本方法

## GET

- 从服务器获取资源

## POST

- 在服务器创建资源

## PUT

- 在服务器修改资源（幂等性-任意多次执行所产生的影响均与一次执行的影响相同）

## DELETE

- 在服务器删除资源

## OPTION

- 和跨域相关

## TRACE

- 用于显示调试信息，追溯 HTTP 请求链路
- 多数网站不支持

## CONNECT

- 与代理相关

## PATCH

- 对资源进行部分更新（极少用）

# 状态码

## 1xx 提供信息

- 100 continue
- 101 切换协议

## 2xx 成功

- 200 OK
- 201 Created 已创建
- 202 Accepted 已接收
- 203 Non-Authoritative Information 非权威内容
- 204 No Content 没有内容
- 205 Reset Content 重置内容
- 206 Partial Content 服务器下发了部分内容（range header）

## 3xx 重定向

- 300 Multiple Choices 用户请求了多个选项的资源（返回选项列表）
- 301 Moved Permanently 永久转移
- 302 Found 资源被找到（以前是临时转移）
- 303 See Other 可以使用 GET 方法在另一个 URL 找到资源
- 304 Not Modified 没有修改
- 305 Use Proxy 需要代理
- 307 Temporary Redirect 临时重定向
- 308 Permanent Redirect 永久重定向

### 301/308

- 共同点
  - 资源被永久移动到新地址
- 差异
  - 308 会沿用之前的 method 发送到新地址
  - 301 向新地址发起 GET 请求

### 302/303/307

- 同
  - 资源临时放到新地址（请不要缓存）
- 异
  - 302 http1.0 提出，所有请求重定向为 GET
  - 1999 年增加 303 和 307，将 302 重定义为 Found

## 4xx 客户端错误

- 400 Bad Request 请求格式错误
- 401 Unauthiorized 没有授权
- 402 Payment Required 请先付费
- 403 Forbidden 禁止访问
- 404 Not Found 没有找到
- 405 Method Not Allowed 方法不被允许
- 406 Not Acceptable 服务端可以提供的内容和客户端期待的不一样

## 5xx 服务端错误

- 500 Internal Server Error Neibu fwq cuowu
- 501 Not Implemented 没有实现
- 502 Bad Gateway 网关错误
- 503 Service Unavailable 服务不可用
- 504 Gateway Timeout 网关超时
- 505 HTTP Version Not Supported 版本不支持

# Content-Length

- 发送给接受者的 Body 内容长度（字节）
  - 一个 byte 是 8bit
  - utf-8 编码的字符 1-4 个字节

# User-Agent

- 区分客户端特性的字符
  - 操作系统
  - 浏览器
  - 制造商（手机类型等）
  - 内核类型
  - 版本号

# Content-Type

- 区分资源的媒体类型（Media Type/MIME Type）
  - text/html

# Origin

- 描述请求来源地址
  - scheme://host:port
  - 不含路径
  - 可以是 null

# Accept

- 建议服务端返回何种媒体类型
  - */*代表所有类型（默认）
  - 多个类型用逗号隔开，例如：text/html,application/json
- Accept-Encoding：建议服务端发送哪种编码（压缩算法）
  - deflate,gzip;q=1.0,\*;q=0.5
  - 压缩算法（逗号分隔）分号后面表示权重
  - deflate,gzip 两种权重为 1.0
  - - 任意权重为 0.5
- Accept-Language:建议服务端传递哪种语言
  - fr;q=0.9,en;q=0.8,de;q=0.7,\*;q=0.5

# Referer

- 告诉服务端打开当前页面的上一个页面的 url；如果是 ajax 请求那么就告诉服务端发送请求的 url 是什么
  - 非浏览器环境有时候不发送 referer（或者虚拟 referer，通常是爬虫）
  - 常用于用户行为分析（是从哪个页面跳转到当前页面）

# Connection

- 决定连接是否在当前事务完成后关闭
  - http1.0 默认是 close
  - http1.1 后默认是 keep-alive
