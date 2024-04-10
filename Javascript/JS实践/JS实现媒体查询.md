项目中用到 rem 做单位，需要设置根元素 html 的 fontSize，并且需要媒体查询适配不同屏幕。
有个特殊需求，需要将项目嵌入其他项目，并且此时去掉媒体查询，独立运行时仍然需要。因此不能直接用 CSS 写媒体查询，需要用 JS 控制添加。
CSS 实现：

```
@media screen and (max-width: 1280px) {
    html {
        font-size: 16px;
    }
}
@media screen and (max-width: 1366px) {
    html {
        font-size: 18px;
    }
}
@media screen and (max-width: 1580px) {
    html {
        /*开发/常用屏幕下设置为20px，方便换算*/
        font-size: 20px;
    }
}
@media screen and (min-width: 1581px) {
    html {
        font-size: 22px;
    }
}
```

JS 实现

```
// 创建查询列表
let mql = [
    window.matchMedia('(max-width: 1280px)'),
    window.matchMedia('(max-width: 1366px)'),
    window.matchMedia('(max-width: 1580px)')
]
// 定义回调函数
function mediaMatchs () {
    let html = document.getElementsByTagName('html')[0]
    if (mql[0].matches) {
        html.style.fontSize = '16px'
    } else if (mql[1].matches) {
        html.style.fontSize = '18px'
    } else if (mql[2].matches) {
        html.style.fontSize = '20px'
    } else {
        html.style.fontSize = '22px'
    }
}
// 先运行一次回调函数
mediaMatchs()
// 为查询列表注册监听器，同时将回调函数传给监听器
for (var i = 0; i < mql.length; i++) {
    mql[i].addListener(mediaMatchs)
}
```

参考：[MDN 文档 matchMedia](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/matchMedia)
