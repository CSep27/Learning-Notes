路由页面

```
{
    path: 'task_detail/:routepath/:backRoute',
    name: 'policy_task_detail',
    component: () => import('/page/task/detail')
}
```

传参页面

```
let backRouteStr = JSON.stringify({
    name: 'ipsec_policy',
    params: {name: 'task'}
})
this.$router.push({
    name: 'policy_task_detail',
    params: {
        routepath: '/ipsec/policy',
        backRoute: backRouteStr
    }
})
```

接收参数

```
this.routepath = this.$route.params.routepath
this.backRoute = JSON.parse(this.$route.params.backRoute)
```

效果就和用 query 一样了，都会在 url 中显示。
