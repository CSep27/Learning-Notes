需求：项目可以单独运行，也可以以 iframe 的方式嵌入另一个系统运行。嵌入后两个系统需要通信。
window.postMessage 可以实现跨域通信，具体见[MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)

#### 父窗口

- 假设域名为：https://www.main.com
- 接收和发送消息

```
// html
<iframe id="iframe" src="https://www.sub.com" frameborder="0"></iframe>
// js
let iframe = document.getElementById('iframe')
window.addEventListener('message', (event) => {
    if (event.origin !== 'https://www.sub.com') return
    // 接收子窗口的消息
    let dataFromSub = event.data
    console.log(dataFromSub)
    // 给子窗口发送消息
    iframe.contentWindow.postMessage({
        data: 'data from main iframe'
    }, 'https://www.sub.com')
    // 也可以将event.source作为回信对象，将event.origin作为targetOrigin
    /* event.source.postMessage({
        data: 'data from main iframe'
    }, event.origin) */
})
```

#### 子窗口

- 假设域名为：https://www.sub.com
- sub 给 main 发消息

```
window.parent.postMessage({data: 'data from sub iframe'}, 'https://www.main.com')
```

- sub 接收 main 的消息

```
window.addEventListener('message', (event) => {
    if (event.origin !== 'https://www.main.com') return
    // main发过来的消息通过event.data接收
    let dataFromMain = event.data
    console.log(dataFromMain)
})
```

- 判断是否是嵌入使用

```
window.parent !== window // 作为Iframe嵌入时值为true
```

- 效果
  ![捕获.PNG](/img/bVbIZ1i)
