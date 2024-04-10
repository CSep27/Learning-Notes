# 理解发布/订阅

## 异步编程方法

- 回调函数
- 事件发布/订阅
- Promise
- generator 函数
- async 函数

回调函数缺点：嵌套过多

```
function ajax(url, callback) {
    // 发送ajax请求
}
ajax("./test1.json", function(data) {
    console.log(data);
    ajax("./test2.json", function(data) {
        console.log(data);
        ajax("./test3.json", function(data) {
            console.log(data);
        });
    });
});
```

发布/订阅模式

```
class PubSub {
    constructor() {
        this.events = {}; // 存放事件
    }
    publish(eventName, data) {
        // this.events[eventName]为数组，因为可以多次订阅事件
        if(this.events[eventName]){
            this.events[eventName].forEach(cb => {
                cb.apply(this, data)
            });
        }
    }
    subscribe(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName].push(callback);
        } else {
            this.events[eventName] = [callback];
        }
    }
    unSubcribe(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(
                cb => cb !== callback
            );
        }
    }
}

function ajax(url, callback) {
    // 发送ajax请求
}

// 发布订阅示例
const pbb = new PubSub();
ajax("./test1.json", function(data) {
    pbb.publish("test1Success", data);
});
pbb.subscribe("test1Success", function(data) {
    console.log(data);
    ajax("./test2.json", function(data) {
        pbb.publish("test2Success", data);
    });
});
pbb.subscribe("test2Success", function(data) {
    console.log(data);
    ajax("./test3.json", function(data) {
        pbb.publish("test3Success", data);
    });
});
pbb.subscribe("test2Success", function(data) {
    console.log(data);
});

```

![截屏2020-07-18 19.29.14.png](/img/bVbJR93)

优点：松耦合 灵活
缺点：无法确保消息被触发，不清楚触发了几次

# Node.js 的发布/订阅

## EventEmitter

- 是事件触发与事件监听器功能的封装
- const {EventEmitter} = require('events')
- 产生事件的对象都是 events.EventEmitter 的实例
- 通过继承的方式使用
- emit on once addListener removeListener

[EventEmitter 实现源码](https://github.com/nodejs/node/blob/master/lib/events.js)
