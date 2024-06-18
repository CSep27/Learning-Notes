# vue-observer-pattern

vue 实现观察者模式的简易版本

## index.js

data 是目标，普通对象

`observe(data)` 函数内部执行`new Observer(value);`将 data 变为响应式对象

`watch()`
函数内部执行`new Watcher()`，访问 test ，访问值时触发了 test 的 getter，执行 depend 函数，建立目标和观察者双向的联系。然后将初始值保存在 watcher 的 value 属性上。
观察 data 对象上 test 属性的变化，一旦改变，触发回调函数。

通过定时器修改`data.test`的值，修改后回调函数中打印新值和旧值。
