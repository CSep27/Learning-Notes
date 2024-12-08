# cookie 问题

## 现象
联调接口为 `https://10.12.3.4`

后端响应 `Set-Cookie: domain=10.12.3.4;samesite=lax;secure;httponly`

- domain 表示cookie会发送给指定的 host
- secure 表示仅当通过 https 访问时才会发送 cookie
- samesite 表示 cookie 不会在跨站请求中被发送

开发环境访问地址为`http://127.0.0.1:5137`，由于上面配置的限制，因此 cookie 设置不上

## 解决方案

参考：[聊聊 Cookie 的 SameSite 属性](https://juejin.cn/post/7171349320904474632)

### 思路
- 将开发环境访问地址和联调接口地址通过域名配置映射改成同站，满足 samesite 需求
- 开发环境要配置成 https 访问，满足 secure 需求

### 步骤
1. 修改 host 文件，将页面访问地址和服务地址修改为同站
    - 将开发环境的 127.0.0.1 指向域名 a.com
    - 服务 ip ，假如为 10.12.3.4 也指向域名 a.com
```
127.0.0.1 a.com
10.12.3.4 a.com
```

2. 修改开发环境配置（vue3 项目）
    - 修改服务器代理配置
        - 在`vite.config.ts`中将 server.proxy 代理配置为 `https://a.com`
        - 如果服务器不是默认的443端口，需要加上端口号，如：`https://a.com:10443`
    - 配置 https 访问
        - 下载`@vitejs/plugin-basic-ssl`插件，在 plugin 中加一下，不需要传配置，会生成自签名证书
        - 配置`secure:false`表示有证书但是不校验

再用`https://a.com:5137`（5173为开发环境服务端口号）访问开发环境，由于开发服务和接口服务域名都为 a.com，仅仅端口不同，属于同站，因此可以成功设置 cookie
