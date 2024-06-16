# Web 安全

- 三要素：机密性，完整性，可用性

## 1. 身份认证和授权

1. 密码强度限制，动态验证码，输入次数限制
2. 公钥加密进行密码传输

## 2. 输入验证，防止跨站脚本攻击（XSS）

1. 不要相信用户输入的东西，要进行转义，现代 Web 框架基本都会实现
2. 使用 cookie 时设置 http-only，用户不能操作 cookie
3. 使用 cookie 时设置 secure，cookie 在 https 中才有效

## 3. 安全的传输，通过加密技术保护信息传输

1. HTTPS 安全传输 HTTP+SSL/TLS 证书

## 4. 防止跨站请求伪造（CSRF），只接受应用程序认可的请求

1. 使用 JWT（JSON Web Token），放在自定义 HTTP 请求头中。
2. token 默认是不加密的，使用秘钥加密，有效期设置较短，使用 HTTPS 传输
3. 使用 cookie 时按需求设置 samesite（strict、lax、none）
   - Set-Cookie: SameSite=Strict
4. 检查 HTTP 头部中的源（source origin）和目标（target origin）是否匹配
   - 源：Origin、Referer
   - 目标：Host、X-Forwarded-Host（有代理的情况）
5. 特殊前缀的 [cookie-name](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie#%E5%B1%9E%E6%80%A7)（Set-Cookie: <cookie-name>=<cookie-value>）
   - `__Secure-` 前缀
   - `__Host-` 前缀

## 5. 其他措施

1. 内容安全策略（CSP）
2. web 应用防火墙（WAF）
