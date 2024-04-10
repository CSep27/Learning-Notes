`pop()`方法从数组中删除**最后一个**元素，并返回该元素的值。此方法更改数组的长度
`shift()` 方法从数组中删除**第一个**元素，并返回该元素的值。此方法更改数组的长度。

测试使用 pop 方法删除数组元素

```
let arr = []
let i = 0
let num = 1000000
while (i < num) {
    arr.push(i)
    i++
}
let start = (new Date()).getTime()
console.log('start: ', new Date())
let j = 0
while (j < num) {
    arr.pop(arr[i])
    j++
}
let end = (new Date()).getTime()
console.log('end: ', new Date())
console.log(end - start)
console.log(arr)
```

结果如图：
![截屏2020-05-23 10.07.46.png](/img/bVbHvkZ)

测试使用 shift 方法删除数组元素，开始结束时间差为 60399

```
let arr = []
let i = 0
let num = 1000000
while (i < num) {
    arr.push(i)
    i++
}
let start = (new Date()).getTime()
console.log('start: ', new Date())
let j = 0
while (j < num) {
    arr.shift(arr[i])
    j++
}
let end = (new Date()).getTime()
console.log('end: ', new Date())
console.log(end - start)
console.log(arr)
```

结果如图：
![截屏2020-05-23 10.07.55.png](/img/bVbHvk1)

[push 比 unshift 效率高](https://blog.csdn.net/generon/article/details/72461488)
