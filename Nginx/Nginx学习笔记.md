# nginx 文档

- nginx -h 查看帮助
- [Nginx 学习和用法中文文档](https://github.com/DocsHome/nginx-docs/blob/master/SUMMARY.md)
- [Nginx 中文站-Nginx 中文文档](https://blog.redis.com.cn/doc/)

# nginx 日志

- 日志默认路径 `/var/log/nginx`

```
http {
    # 日志格式 名称main
    log_format main '$remote_addr - $remote_user'
    # 可以配置成其他路径
    access_log /var/log/nginx/access.log main;
}
```

# 报错

- `nginx: [error] open() "/usr/local/var/run/nginx.pid" failed (2: No such file or directory)`
- 找到你的 nginx.conf 的文件夹目录，然后运行这个`nginx -c /usr/local/etc/nginx/nginx.conf`命令，再运行`nginx -s reload`
- `nginx -c file` 使用指定的配置文件替代默认的配置文件

# location

- [一文理清 nginx 中的 location 配置（系列一）](https://segmentfault.com/a/1190000022315733)
- [一文理清 nginx 中的 rewrite 配置（系列二）](https://segmentfault.com/a/1190000022407797)
- 案例：微前端实战笔记 —— nginx 配置

# proxy_pass

- [nginx 之 proxy_pass 详解](https://www.jianshu.com/p/b010c9302cd0)

# root

```
Syntax: 	root path;
Default: 	root html;
Context: 	http, server, location, if in location
```

- 设置请求的根路径，例如

```
location /i/ {
    root /data/w3;
}
```

- 对于“/i/top.gif”，会响应“/data/w3/i/top.gif”文件
- path 值可以包含变量，除了`$document_root`和`$realpath_root`

# index

- [Nginx 之坑：完全理解 location 中的 index，配置网站初始页](https://blog.csdn.net/qq_32331073/article/details/81945134)

# nginx 内部变量

## $uri

- nginx 中的$uri 记录的是执行一系列内部重定向操作后最终传递到后端服务器的 URL

- 包含请求的文件名和路径，不包含包含“?”或“#”等参数。

```
完整URL链接：http://www.alipay.com/alipay/index.html
$uri：/alipay/index.html
```

## $request_uri

- $request_uri 记录的是当前请求的原始 URL（包含请求的文件名和路径及所有参数）
- 如果没有执行内部重定向操作，request_uri 去掉参数后的值和 uri 的值是一样的。
- 在线上环境中排查问题时，如果在后端服务器中看到的请求和 Nginx 中存放的 request_uri 无法匹配，可以考虑去 uri 里边进行查找。

```
完整URL链接：http://www.alipay.com/alipay/index.html#/table
$request_uri：/alipay/index.html#/table
```

# 设置访问目录

## 使用 alias

- 将 element 库作为静态文件放到服务器上
- 服务器上文件路径：`/opt/npm-package/my-element`，my-element 文件夹下放的就是库代码
- nginx 配置：

  ```
  location /my-element-package {
      alias /opt/npm-package/;
      autoindex on;
      add_header Access-Control-Allow-Origin *;
  }
  ```

- 使用：`<link rel="stylesheet" href="http://IP:PORT/my-element-package/my-element/lib/theme-chalk/index.css">`
- alias 会把指定路径当做文件路径，`http://IP:PORT/my-element-package`等价于`http://IP:PORT/opt/npm-package/`，再找到 my-element 文件夹

## 使用 root

- 服务器静态文件路径：`/opt/my-project/static`
- nginx 配置：

  ```
  location /static {
      root /opt/my-project/;
      autoindex on;
  }
  ```

- 使用：`<link rel="stylesheet" href="http://IP:PORT/static/css/index.css">`
- 访问路径拼接 root 是文件路径，`/static/css/index.css`=>`/opt/my-project/static/css/index.css`文件夹下
