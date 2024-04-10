# try_files

- [nginx 官网-try_files](http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)

## 语法

```
# 至少两个参数 file uri 或者 file =code
# ... 表示可以有多个 file，会依次检查

Syntax: try_files file ... uri;
        try_files file ... =code;
Default: —
Context: server, location
```

## 解释（翻译）

- 以指定的顺序检查文件存在与否，并且使用第一个找到的文件进行请求处理，处理会在**当前上下文**中执行；
- 文件的路径是根据 root 和 alias 指令，由 file 参数构造的。
- 通过在名称结尾指定斜线来检查是否存在目录，例如“$uri/”。
- 如果没有文件被找到，会**内部重定向**到最后一个参数中指定的 uri
- 例如：

```
# 先找$uri 也就是当前请求的 URI，/images/
# 找不到会内部重定向到/images/default.gif
location /images/ {
  try_files $uri /images/default.gif;
}

# 重定向匹配到本条规则
location = /images/default.gif {
  expires 30s;
}
```

- 最后一个参数也可以指向一个命名的 location，像上面的例子展示的那样。
- 从版本 0.7.51 开始，最后一个参数可以是一个 code

```
location / {
  try_files $uri $uri/index.html $uri.html =404;
}
```

## 示例

### 示例用法总结

- 从左到右逐个匹配寻找，哪个匹配到了就返回结果
- file 表示文件，加/表示目录
- 其中 file 和 file/都会拼接 root 配置后返回
- uri 会内部重定向
- 都没找到返回 404

### 例 1

- 文件结构

```

+ /opt
  + project
    - index.html
    + main
      - index.html

```

- nginx 配置

```
location / {
  root /opt/project/;
  index index.html index.htm;
}
location /main {
  root /opt/project/;
  try_files $uri /index.html;
}
```

- 第一种情况`main/index.html`存在

  - 访问`http://IP:PORT/main/index.html`
  - 匹配到`location /main`规则
  - $uri = /main/index.html
  - try_files 查找 root + $uri => /opt/project/main/index.html
  - 找到内容，返回结果

- 第二种情况假如`main/index.html`不存在
  - \$uri 规则查找失败，查找`/index.html`
  - 内部重定向到`location /`规则，返回`/opt/project/index.html`

### 例 2

`try_files $uri/index.html /index.html;`

- 文件结构

```

+ /opt
  + project
    - index.html
    + main
      - index.html

```

- nginx 配置

```
location / {
  root /opt/project/;
  index index.html index.htm;
}
location /main {
  root /opt/project/;
  try_files $uri/index.html /index.html;
}
```

- 访问`http://IP:PORT/main`
- 匹配到`location /main`规则
- $uri = /main
- try_files 查找 root + $uri/index.html => /opt/project/main/index.html
- 找到内容，返回结果
- 如果访问`http://IP:PORT/main/index.html`匹配到的是`/index.html`

---

例 3 和例 4 用来测试 root 的使用

### 例 3

`try_files $uri/index.html /index.html;`

- 文件结构

```

+ /opt
  + project
    - index.html
  + main
    - index.html

```

- nginx 配置
  - server 内指定 root
  - 去掉`location /main`中的 root 配置

```
server {
  listen 3000;
  root /opt;
  location / {
    root /opt/project/;
    index index.html index.htm;
  }
  location /main {
    try_files $uri/index.html /index.html;
  }
}
```

- 访问`http://IP:PORT/main`
- 匹配到`location /main`规则
- $uri = /main
- 当前 location 内没有 root 配置，向上找到 server 内的 root
- try_files 查找 server-root + $uri/index.html => /opt/main/index.html
- 找到内容，返回结果

### 例 4

`try_files $uri/index.html /index.html;`

- 文件结构
  - /opt 下新增 index.html

```

+ /opt
  - index.html
  + project
    - index.html

```

- nginx 配置
  - server 内指定 root
  - 去掉`location /`中的 root 配置

```
server {
  listen 3000;
  root /opt;
  location / {
    index index.html index.htm;
  }
  location /main {
    root /opt/project/;
    try_files $uri/index.html /index.html;
  }
}
```

- 访问`http://IP:PORT/main`
- 匹配到`location /main`规则
- $uri = /main
- try_files 查找 root + $uri/index.html => /opt/project/main/index.html
- 没找到，匹配到/index.html，进行内部重定向到`location /`规则
- 该规则返回 server-root + index.html => /opt/index.html
