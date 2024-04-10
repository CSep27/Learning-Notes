node+express

项目在全局使用了 bodyParser.json()和 bodyParser.urlencoded()。
但现在碰到个需求，对某些特定前缀的 url 请求，需要拿到 Buffer 格式的请求体，而不是 json 格式化后的。

[body-parser 官方文档](https://www.npmjs.com/package/body-parser)中有写如何针对不同请求使用不同的解析：

```
var express = require('express')
var bodyParser = require('body-parser')

var app = express()

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// POST /login gets urlencoded bodies
app.post('/login', urlencodedParser, function (req, res) {
  res.send('welcome, ' + req.body.username)
})

// POST /api/users gets JSON bodies
app.post('/api/users', jsonParser, function (req, res) {
  // create user in req.body
})
```

但是项目中用到了 express 的路由，没找到如何直接针对特定路由改写的方法，看到一篇[文章](https://segmentfault.com/a/1190000003061925)，里面配置项中的 verify(req, res, buf, encoding)函数的第三个参数可以拿到 raw body，但是缺点文章中也说了，并且对所有请求都生效了。

配置项中还有个 type 函数，官方文档说：

##### type

The `type` option is used to determine what media type the middleware will parse. This option can be a string, array of strings, or a function. If not a function, `type` option is passed directly to the [type-is](https://www.npmjs.org/package/type-is#readme) library and this can be an extension name (like `bin`), a mime type (like `application/octet-stream`), or a mime type with a wildcard (like `*/*` or `application/*`). If a function, the `type` option is called as `fn(req)` and the request is parsed if it returns a truthy value. Defaults to `application/octet-stream`.

参数是非函数时，可以是一个 mime type (类似于 `application/octet-stream`)，可以设置哪种类型的数据被解析。如果是个函数，req 会作为参数，返回是[truthy value（真值）](https://developer.mozilla.org/zh-CN/docs/Glossary/Truthy)的请求才会被解析。所以可以在该函数中判断 req.url 是否匹配特定前缀，匹配了就用`bodyParser.raw`解析
代码：

- index.js

```
const express = require('express')
const app = express()
const routers = require('./router/index')
const deviceRouters = require('./router/device/index')

const bodyParser = require('body-parser')

// 以'/device/web/'开头的url使用bodyParser.raw获取Buffer格式的数据
app.use(bodyParser.raw(
    {
        type (req) {
            return /^\/device\/web\/.*/.test(req.url)
        }
    }
))

app.use(bodyParser.json({limit: '256mb', extended: true}))
app.use(bodyParser.urlencoded())

app.use(routers)
app.use(deviceRouters)

app.listen(3000, () => {})
```

- router/index.js

```
const express = require('express')
const router = express.Router()

// 路由
router.post('/', () => {})

module.exports = router
```
