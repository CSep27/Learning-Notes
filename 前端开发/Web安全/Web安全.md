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

# 针对 Web 应用的攻击模式

## 以服务器为目标的主动攻击

主动攻击（active attack）是指攻击者通过直接访问 Web 应用，把攻击代码传入的攻击模式。由于该模式是直接针对服务器上的资源进行攻击，因此攻击者需要能够访问到那些资源。

主动攻击模式里具有代表性的攻击是 SQL 注入攻击和 OS 命令注入攻击。

## 以服务器为目标的被动攻击

被动攻击（passive atack）是指利用圈套策略执行攻击代码的攻击模式。在被动攻击过程中，攻击者不直接对目标 Web 应用访问发起攻击。

被动攻击通常的攻击模式如下所示：

- 步骤 1：攻击者诱使用户触发已设量好的陷阱，而陷阱会启动发送已嵌入攻击代码的 HTTP 请求。
- 步骤 2：当用户不知不觉中招之后，用户的浏览器或邮件客户端就会触发这个陷阱。
- 步骤 3：中招后的用户浏览器会把含有攻击代码的 HTTP 请求发送给作为攻击目标的 Web 应用，运行攻击代码。
- 步骤 4：执行完攻击代码，存在安全漏洞的 Web 应用会成为攻击者的跳板，可能导致用户所持的 Cookie 等个人信息被窃取，登录状态中的用户权限遭恶意滥用等后果。

被动攻击模式中具有代表性的攻击是跨端脚本攻击（XSS）和跨站点请求伪造（CSRF）。
