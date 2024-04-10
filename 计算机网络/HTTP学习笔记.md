# 文档地址

- [IETF 官网](https://datatracker.ietf.org/)，制定各种协议标准规范

- [RFC 官网](https://www.rfc-editor.org/)
- [RFC 中文网](https://docs.huihoo.com/rfc/)

- [HTTP1.1 - rfc7235](https://datatracker.ietf.org/doc/html/rfc7235)

- [HTTP2 - rfc7520](https://www.rfc-editor.org/rfc/rfc7540.txt)
- [HTTP2 中文翻译](https://github.com/abbshr/rfc7540-translation-zh_cn)

## 如何找到 http 协议配置项的解释

- 在[RFC7235 规范](https://datatracker.ietf.org/doc/html/rfc7235)页面搜索关键词，未搜索到的话，在右边的 Select version 选择最早的 00 版本，再进行关键词搜索

# 跨域 Access-Control-Allow-Origin

## 配置允许多个域名

- [Cors 跨域(三)：Access-Control-Allow-Origin 多域名？](https://www.51cto.com/article/666906.html)
- [条件型 CORS 响应下因缺失 Vary: Origin 导致的缓存错乱问题](https://zhuanlan.zhihu.com/p/38972475?utm_source=qq&utm_medium=social&utm_oi=26757239406592)
- 思路：将允许的多个域名放到集合中，根据请求的 origin 判断是否在集合中，在的话就设置为相应的 origin
- 使用`Vary: Origin`来保证不同网站发起的请求使用各自的缓存
- [Vary rfc 定义](https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-p6-cache-00#section-3.5)

## 在 nginx 中配置

```bash
location / {
    # 枚举列出允许跨域的domian(可以使用nginx支持的匹配方式)
    set $cors_origin "";
    if ($http_origin ~* "^http://foo.baidu.com$") {
            set $cors_origin $http_origin;
    }
    if ($http_origin ~* "^http://bar.baidu.com$") {
            set $cors_origin $http_origin;
    }
    add_header Access-Control-Allow-Origin $cors_origin;
}
```

# 如何开启 http2

[http2 配置实战](https://juejin.cn/post/6925387456439123982)

nginx 支持 http2

然后撤销一些针对 http1.1 的优化

# 状态码

## 重定向

- 301 308 永久重定向
- 302 307 临时重定向

注：对于不希望修改 http method 和 body 的场景下，使用 308 和 307

### 永久重定向

301 moved permanently 永久重定向，请求的资源已经被移动到了由 Location 头部指定的 url 上，是固定的不会再改变。搜索引擎会根据该响应修正。

规范要求重定向时不应该修改 http method 和 body，但并非所有用户代理都符合此要求。最好将 301 作为 GET 或 HEAD 方法的响应，对于 POST 改用 308 Permanent redirect（此状态码会禁止更改请求方法）

### 临时重定向

302 Found 表明请求的资源被暂时的移动到了由 Location 头部指定的 url 上，浏览器会重定向到这个 URL，但是搜索引擎不会对该资源的链接进行更新。

同样，推荐仅在响应 GET 和 HEAD 时使用 302 状态码，其他时候使用 307 Temporary Redirect 代替

# 请求方法

## HEAD

请求资源的标头（header）信息，并且这些标头与 HTTP 的 GET 方法请求时返回的一致。

一个使用场景：在下载一个大文件前先通过 HEAD 请求读取 Content-length 的值获取文件的大小，无需实际下载文件，以此可以节约带宽资源。

HEAD 方法的响应不应该包含响应主体，有也会被忽略。

## OPTIONS

请求给定的 URL 或服务器，获取允许通信的选项。

- 检测服务器支持哪些 HTTP 方法；
- 在 CORS 中发送预检请求，检测实际请求是否可以被服务器所接受

## 复杂请求和简单请求

[CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS#%E7%AE%80%E5%8D%95%E8%AF%B7%E6%B1%82)中介绍了简单请求

### 简单请求

1. method 是 GET、POST、HEAD
2. 没有帶自定义的 header
3. Content-Type 在以下几个值范围内：application/x-www-form-urlencoded、multipart/form-data 或是 text/plain

满足以上条件基本上就可以被视为是「简单请求」

### 非简单请求

除简单请求之外的请求，浏览器会发送预检请求（preflight request），method 为 OPTIONS，预检请求浏览器会自动加上请求头 Access-Control-Request-Headers 和 Access-Control-Request-Method。

# HTTP 缓存

![http-cache](./images/http-cache.awebp)

## 强缓存

- 强缓存，Expires 和 Cache-Control ，命中后不会再与服务端通信
- expires 绝对的时间戳
- Cache-Control 中的 max-age 相对的时间长度

## 协商缓存

浏览器需要向服务器去询问缓存的相关信息，进而判断是重新发起请求、下载完整的响应，还是从本地获取缓存的资源。

如果服务端提示缓存资源未改动（Not Modified），资源会被重定向到浏览器缓存，这种情况下网络请求对应的状态码是 304

Last-Modified If-Modified-Since 按照修改时间判断

ETag If-None-Match 资源标识字符串
