# async 函数

- Generator 函数的语法糖 使异步操作更简单
- `async`表示函数里有异步操作，`await`表示紧跟在后面的表达式需要等待结果。
- 返回值 一个 Promise 对象，可以用 then 方法指定下一步操作
  - async 函数 return 的值通过 Promise 对象 resolved 时候的 data 获取
  - async 函数 throw 的错误通过 Promise 对象 rejected 时候的 error 获取

```
async function test() {
    return 1;
}
const p = test();
console.log(p); // Promise {<resolved>: 1}__proto__: Promise[[PromiseStatus]]: "resolved"[[PromiseValue]]: 1

p.then(function(data) {
    console.log(data); // 1
});
```

```
async function test() {
    throw new Error("error");
}
const p = test();
console.log(p);  // Promise {<rejected>: Error: error...}
p.catch(function(err) {
    console.log(err); // Error: error
});
```

## await

- await 命令只能用在 async 函数之中
- await 后可以是 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时会自动转成立即 resolved 的 Promise 对象）
- await 后 Promise 对象状态变为 rejected，后续执行中断
  ![截屏2020-07-19 11.31.44.png](/img/bVbJSVx)

### await 后 Promise 对象状态为 resolved

```
async function async1() {
    console.log("async1 start");
    let r = await async2();
    console.log(r)
    console.log("async1 end");
}
async function async2() {
    return Promise.resolve().then(_ => {
        console.log("async2 promise");
        return "value from async2"
    });
}
async1();
```

1. 执行 async1，打印"async1 start"
2. 执行 await async2()，await 会等待 Promise 变成 resolved 状态，然后拿到返回值，因此会执行 Promise.resolve().then()，打印"async2 promise"
3. async2 中 then 函数返回的值被赋值给 r，打印"value from async2"
4. 打印"async1 end"

### await 后 Promise 对象状态为 reject

await Promise.reject("error")后的代码不会被执行

```
async function f() {
    await Promise.reject("error");
    console.log(1);
    await 100;
}
f();
```

处理异常后，后面的代码就会执行了

- 通过 Promise 对象的`catch`方法
  ```
  async function f() {
      await Promise.reject("error").catch(err => {
          // 处理异常
      });
      console.log(1);
      await 100;
  }
  f();
  ```
- 通过 try{}catch{}捕获异常
  ```
  async function f() {
      try {
          await Promise.reject("error");
      } catch {
          // 处理异常
      }
      console.log(1);
      await 100;
  }
  f();
  ```

# 实现原理

Generator + 自动执行器

```
// 使用async函数 返回Promise对象
async function example(params) {
    // ...
}

// 实现
function example(params) {
    return spawn(function*() {
        // ...
    });
}

function spawn(genF) {
    return new Promise(function(resolve, reject) {
        const gen = genF(); // 生成器对象
        function step(nextF) {
            let next;
            try {
                next = nextF(); // 执行gen.next
            } catch (e) {
                return reject(e);
            }
            if (next.done) {
                return resolve(next.value);
            }
            Promise.resolve(next.value).then(
                function(v) {
                    step(function() {
                        return gen.next(v);
                    });
                },
                function(e) {
                    step(function() {
                        return gen.throw(e);
                    });
                }
            );
        }
        step(function() {
            return gen.next(undefined);
        });
    });
}
```

# 应用

按顺序打印文件
Promise 实现

```
function readFilesByPromise() {
    const fs = require('fs')
    const path = require('path')

    const files = [
        './file/a.json',
        './file/b.json',
        './file/c.json'
    ]

    function readFile(url) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, url), function (err, data) {
                if (err) { reject(err) }
                resolve(data)
            })
        })
    }

    readFile(files[0])
        .then((data) => {
            console.log(data.toString())
            return readFile(files[1])
        })
        .then((data) => {
            console.log(data.toString())
            return readFile(files[2])
        })
        .then((data) => {
            console.log(data.toString())
        })
}

readFilesByPromise()
```

async/await 实现

```
async function readFilesByAsync() {
    const fs = require('fs')
    const path = require('path')

    const files = [
        './file/a.json',
        './file/b.json',
        './file/c.json'
    ]

    function readFile(url) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, url), function (err, data) {
                if (err) { reject(err) }
                resolve(data)
            })
        })
    }

    const str1 = await readFile(files[0])
    console.log(str1.toString())
    const str2 = await readFile(files[1])
    console.log(str2.toString())
    const str3 = await readFile(files[2])
    console.log(str3.toString())
}

readFilesByAsync()
```
