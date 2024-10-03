# cookie 问题

## 现象

后端设置 `Set-Cookie: domain=192.168.0.10;samesite=lax;secure;httponly`

- domain 设置为指定的 IP
- secure 表示仅当通过 https 访问时才会发送 cookie
- samesite cookie 不会在跨站请求中被发送

联调接口为 https，开发环境联调由于跨站，即使开启代理也无法解决 cookie 设置不上的问题

## 解决

参考：[聊聊 Cookie 的 SameSite 属性](https://juejin.cn/post/7171349320904474632)

思路：将开发环境访问地址和联调接口访问地址通过域名配置映射改成同站，满足 samesite 需求，并且开发环境要配置成 https 访问，满足 secure 需求

1. 修改为同站

- 在 host 文件中，将开发环境的 127.0.0.1 指向域名 a.com
- 服务 ip ，假如为 10.12.3.4 也指向域名 a.com
- vue3 项目中，在`vite.config.ts`中将 server.proxy 代理配置为 `https://a.com`

2. 开发环境配置 https 访问

- 下载`@vitejs/plugin-basic-ssl`插件，在 plugin 中加一下，不需要传配置，会生成自签名证书
- 配置`secure:false`表示有证书但是不校验

再用https://a.com:5137访问开发环境，由于开发服务和接口服务域名都为 a.com，仅仅端口不同，属于同站，因此可以成功设置 cookie
