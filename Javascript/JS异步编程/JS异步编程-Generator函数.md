# Generator 函数

## 迭代器

有 next 方法，执行返回结果对象（{value:'XX', done:'XX'}）

```
// ES5实现迭代器
function createIterator(items) {
    var i = 0;
    return {
        next: function() {
            var done = i >= items.length;
            var value = !done ? items[i++] : undefined;
            return {
                done: done,
                value: value
            };
        }
    };
}

var iterator = createIterator([1, 2, 3]);

iterator.next(); // {value:1,done:false}
iterator.next(); // {value:2,done:false}
iterator.next(); // {value:3,done:false}
iterator.next(); // {value:undefined,done:true}
```

[可迭代协议](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Iteration_protocols#%E5%8F%AF%E8%BF%AD%E4%BB%A3%E5%8D%8F%E8%AE%AE)
[Symbol.iterator]属性
内置可迭代对象 String Array Map Set 等
迭代器协议
有 next 方法，执行后返回一个对象{value:'XX', done:'XX'}

## 生成器

### Generator 函数（生成器）

ES6 异步编程解决方案，在执行处暂停，又能从暂停处继续执行

- **声明**：通过 function\*声明
- **返回值**：符合可迭代协议和迭代器协议的**生成器对象**

### yield

- 只能出现在 Generator 函数
- 用来暂停和恢复生成器函数

### 生成器对象

生成器对象原型上有三个方法

- next(param)
- return(param)
- throw(param)

#### next

- 执行
  遇 yield 暂停，将紧跟 yield 表达式的值作为返回的对象的 value
  没有 yield，一直执行到 return，将 return 的值作为返回的对象的 value
  没有 return，将 undefined 作为返回的对象的 value
- 参数
  next 方法可以带一个参数，该参数会被当做上一个 yield 表达式的返回值

代码分析：

```
function* createIterator() {
    let first = yield 1;
    let second = yield first + 2;
    yield second + 3;
}
let iterator = createIterator();

iterator.next(); // {value:1, done:false}
iterator.next(4); // {value: 6, done: false}
iterator.next(5); // {value: 8, done: false}
iterator.next(); // {value: undefined, done: true}
```

执行过程：

1. 遇到 yield 暂停，返回 yield 表达式后的 1 作为返回对象的 value，执行还未结束，结果为{value:1, done:false}
2. 因为第一步执行到 yield 就已经暂停了，first 还没有被赋值。第二次 next 执行的时候，first 才开始赋值，因为传入了 4，替换掉第一步中的 1 赋值给了 first，first 是 4。返回 yield 后表达式计算的结果 6 作为返回对象的 value，所以结果为{value: 6, done: false}
3. 同第二步的过程，yield 后表达式计算结果为 8，虽然后面没有代码了，但是相当于有一个默认的 return undefined，所以还没有结束，因此返回{value: 8, done: false}
4. return undefined，代码执行结束，结果为{value: undefined, done: true}

#### return(param)

给定 param 值终结遍历器，param 默认为 undefined

```
function* createIterator() {
    yield 1;
    yield 2;
    yield 3;
}
let iterator = createIterator();

iterator.next();  // {value:1, done:false}
iterator.return(); // {value:undefined, done:true}
iterator.next();  // {value:undefined, done:true}
```

#### throw(param)

让生成器对象内部抛出错误

```
function* createIterator() {
    let first = yield 1;
    let second;
    try {
        second = yield first + 2;
    } catch (e) {
        second = 6;
    }
    yield second + 3;
}
let iterator = createIterator();

iterator.next(); // {value:1, done:false}
iterator.next(10); // {value:12, done:false}
iterator.throw(new Error("error")); // {value:9, done:false}
iterator.next(); // {value:undefined, done:true}
```

1. 遇到 yield 暂停，返回 yield 表达式后的 1 作为返回对象的 value，执行还未结束，结果为{value:1, done:false}
2. 返回{value:12, done:false}
3. iterator.throw(new Error("error"))会进入 try{}catch{}中的 catch，second 赋值为 6，继续往下，遇到 yield 才会停止，返回{value:9, done:false}
4. 返回{value:undefined, done:true}

### yield\* 生成器函数/可迭代对象

- 委托给其他可迭代对象
- 作用：复用生成器
  代码分析

```
function* generator1() {
  yield 1;
  yield 2;
}

function* generator2() {
  yield 100;
  yield* generator1(); // 控制权交出，进入generator1
  yield 200;
}

let g2 = generator2();
g2.next(); // {value:100, done:false}
g2.next(); // {value:1, done:false}
g2.next(); // {value:2, done:false}
g2.next(); // {value:200, done:false}
g2.next(); // {value:undefined, done:true}
```

## Generator 函数的实现原理

### [协程](https://cnodejs.org/topic/58ddd7a303d476b42d34c911)

- 一个线程存在多个协程，但同时只能执行一个
- Generator 函数时协程在 ES6 的实现
- yield 挂起一个协程（交给其他协程），next 唤醒协程

## Generator 函数应用

需求：按照顺序打印文件
直接用回调实现需要多层嵌套
使用 Generator 函数实现如下：

```
function* readFilesByGenerator() {
    const fs = require("fs");
    const files = [
        "/Users/kitty/testgenerator/1.json",
        "/Users/kitty/testgenerator/2.json",
        "/Users/kitty/testgenerator/3.json"
    ];
    let fileStr = "";
    function readFile(filename) {
        fs.readFile(filename, function(err, data) {
            console.log(data.toString());
            f.next(data.toString());
        });
    }
    yield readFile(files[0]);
    yield readFile(files[1]);
    yield readFile(files[2]);
}
// 调用
const f = readFilesByGenerator();
f.next()
```

但是此种方法在 readFilesByGenerator 函数内部用到了在外面定义的生成器对象 f，耦合度太高。

# thunk 函数

- 求值策略
  - 传值调用
    - 以 sum(x+1,x+2)为例，先计算 x+1 和 x+2 的值，再传入 sum 函数进行计算
  - 传名调用
    - 以 sum(x+1,x+2)为例，等到 sum 函数中用到传入的参数时，再去计算 x+1 和 x+2 的值
- thunk 函数是传名调用的实现方式之一
- 可以实现自动执行 Generator 函数

```
const fs = require("fs");
const Thunk = function(fn) {
  return function(...args) {
    return function(callback) {
      return fn.call(this, ...args, callback);
    };
  };
};
const readFileThunk = Thunk(fs.readFile);

function run(fn) {
  var gen = fn();
  function next(err, data) {
    var result = gen.next(data);
    if (result.done) return;
    result.value(next);
  }
  next();
}

const g = function*() {
  const s1 = yield readFileThunk("/Users/kitty/testgenerator/1.json");
  console.log(s1.toString());
  const s2 = yield readFileThunk("/Users/kitty/testgenerator/2.json");
  console.log(s2.toString());
  const s3 = yield readFileThunk("/Users/kitty/testgenerator/3.json");
  console.log(s3.toString());
};

run(g);
```
