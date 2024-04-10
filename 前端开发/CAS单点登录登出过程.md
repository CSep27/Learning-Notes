# 参考资料
[单点登录（SSO）](https://developer.aliyun.com/article/636281) 有登录过程详细图解，非常详细

[单点登录原理与简单实现](https://www.cnblogs.com/ywlaker/p/6113927.html) 登录登出过程都有图解，但是没有注明ticket cookie session

[CAS 官网](https://www.apereo.org/projects/cas)

# 登录登出过程详解

## 角色

- User 用户
- Browser 浏览器
- CAS Server  地址：https://cas.example.com
- App1 Server (CAS Client1) 地址：https://app1.com
- App2 Server (CAS Client2) 地址：https://app2.com

## 单点登录

详细图解：
![CAS.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/82410e70abc84732997c17210f996da1~tplv-k3u1fbpfcp-watermark.image?)

过程解析：

- 第一次登录App1过程：
	1. user打开Browser输入地址：`https://app1.com`， Browser发送get请求到App1 Server
	2. App1 Server发现user未登录，发送响应，status:302; location：`https://cas.example.com/cas/login?service=https://app1.com/cas/validate`  (实际是url encode后的)，即重定向到CAS Server的 `/cas/login` 指向的登录页，携带参数service表明是来自于 App1 的请求
	3. browser拿到响应后马上请求location指向的地址，CAS Server同样发现user未登录，返回登录页内容
	4. browser展示登录页内容，user输入用户名密码信息，提交。browser发送POST请求到`https://cas.example.com/cas/login?service=https://app1.com/cas/validate`
	5. CAS Server验证用户名密码通过，创建一个SSO session（全局session）,对应的CASTGC cookie，cookie内容是Ticket Granting Ticket（TGT）。这个TGT就是SSO session的key，用于后续验证用的。
	6. CAS Server发送响应，`Set-Cookie:CASTGC=TGT-2345678 302 Location:https://app1.com/cas/validate?ticket=ST-12345678`
	7. browser请求`https://app1.com/cas/validate?ticket=ST-12345678`，这个地址是CAS Client侧校验ticket的地址，这个请求就意味着App1需要给CAS Server发送验证ticket的请求，地址是：`https://cas.example.com/serviceValidate?service=https://app1.com&ticket=ST-12345678`，参数里带上ticket和App1地址
	8. CAS Server拿到ticket验证通过，返回XML文档，包含了成功提示，授权信息，还有一些可选的属性
	9. App1拿到CAS Server返回的状态为200的成功信息，设置一个局部的session，给browser发送响应：`Set-Cookie: JSESSIONID=ABC1234567 302 Location:https://app1.com/`
	10. browser根据响应头设置上`cookie:JSESSIONID=ABC1234567`，发送重定向请求`https://app1.com/`，App1响应内容

- 之后访问App1
	1. browser直接携带`cookie:JSESSIONID=ABC1234567`再次访问`https://app1.com/xxx`，App1验证cookie对应的session存在且有效，返回对应内容

- App1已登录，第一次访问App2
	1. Browser发送 `get https://app2.com` 到App2，发送响应 `status:302; location：https://cas.example.com/cas/login?service=https://app2.com/cas/validate`
	2. Browser携带`cookie:CASTGC=TGT-2345678 GET https://cas.example.com/cas/login?service=https://app2.com/cas/validate`
		a. 这个cookie是在cas.example.com域下的cookie，是第一次登陆时第六步中响应的Set-Cookie:CASTGC=TGT-2345678时设置的
	3. CAS Sevrer 验证TGT，已经登录了，直接开始校验ticket，响应`302 Location:https://app2.com/cas/validate?ticket=ST-45678`
	4. Browser请求App2，App2到CAS Sever 验证ticket `https://cas.example.com/serviceValidate?service=https://app2.com&ticket=ST-45678`，CAS Server返回认证成功的XML内容
	5. App2设置局部session，响应`302 Set-Cookie:MOD_AUTH_CAS_S=XYZ123456789 Location: https://app2.com`
	6. 浏览器 `cookie=MOD_AUTH_CAS_S=XYZ123456789`，访问`https://app2.com`
	7. App2验证cookie后，返回内容

- 补充说明
    - CAS Server存储全局Session，给cas.example.com域名下设置了cookie:CASTGC=TGT，这个是cas系统的cookie-session验证
    - CAS Client重定向到`cas.example.com/cas/login`，携带了cookie:CASTGC=TGT去验证，CAS Server会返回ticket到CAS Client的ticket验证地址，又会再携带ticket去CAS Server的ticket验证地址进行验证，验证通过后再返回用户信息。
    - CAS Server会存储有哪些CAS Client（也就是请求url参数中的service）注册了系统
    - 每个CAS Client会有局部的cookie-session

## 单点登出（SLO）

图解：
![登出.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6abeea4dbb1840febd502ec87fa2b713~tplv-k3u1fbpfcp-watermark.image?)

过程：

- App1主动点击登出
    1. user主动在browser上点击退出App1
    2. App1收到退出请求，销毁局部session，再携带相应参数（令牌，服务信息）请求`https://cas.example.com/cas/logout`
    3. CAS Server校验令牌有效，销毁全局会话，再查找出所有注册过的系统，**主动给这些系统发消息注销局部会话**，最后将登录页内容返回给App1

- App2请求内容
    1. 携带cookie请求App2，由于session已失效，返回401，跳转到登录页 

## connect-cas2
- [中文文档](https://github.com/TencentWSRD/connect-cas2/blob/master/README.zh.md)
- CAS Client的配置
```
serverPath: 'https://cas.example.com' // CAS Server地址
servicePrefix: 'https://app1.com App1 Server' // CAS Client 地址
paths.validate: '/cas/validate' // CAS Client 校验ticket的地址，登录第二步中参数里拼接在servicePrefix后的，还有登录第七步
paths.serviceValidate: '/serviceValidate' // CAS Server 校验ticket的地址
paths.login: '/cas/login'  // 登录地址 第二步中拼接在CAS Server后的path 
paths.logout: '/cas/logout' // CAS Server退出地址
```
