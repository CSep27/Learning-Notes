可以通过 toString() 来获取每个对象的类型。为了每个对象都能通过 Object.prototype.toString() 来检测，需要以 Function.prototype.call() 或者 Function.prototype.apply() 的形式来调用，把需要检测的对象作为第一个参数传入。

```js
var toString = Object.prototype.toString;

toString.call(new Date()); // [object Date]
toString.call(new String()); // [object String]
toString.call(Math); // [object Math]
toString.call(function () {}); // [object Function]
toString.call({}); // [object Object]

// ES5新增
toString.call(undefined); // [object Undefined]
toString.call(null); // [object Null]
```
