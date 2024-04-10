## Vue3.0 composition API

- reactive 和 ref 类似，不同的是接受一个对象作为参数，并且会深度遍历这个对象，对各个属性进行拦截
- ref 将一个基本类型的值作为入参，然后返回一个响应式并包含一个 value 属性的对象
- readonly 只读，set 操作时返回警告，不能进行写操作

- computed 计算属性，基于内部的响应式依赖进行缓存，只有在相关响应式依赖发生改变时才会重新求值
  ```
  let x= computed (()=> count.value + 3)
  ```
- watchEffect 数据变化时立即变化，执行后返回一个函数（stop：停止监听数据变化）
- watch 监听数据变化，并在回调函数中返回数据变更前后的两个值；用于在数据变化后执行异步操作或者开销较大的操作

## computed

computed 的使用，传入一个函数：
`let x = computed(() => count.value + 3)`

新增 computed 函数

1. 增加一个 computed 函数，传入一个函数 fn，返回一个包含可监听 value 值的对象
2. value 值置为传入函数执行的结果，再将 value 返回
3. 由于需要实现缓存，增加 dirty 标记记录依赖的值是否变化，只有变化了才重新计算
4. 计算赋值之后将标记置为 false。只要数据没有变化，就不会再重新计算。
5. 何时将 dirty 重置为 true？在执行传入函数 fn 时，监听的响应式数据变化之后将 dirty 重置为 true。
6. 就是在执行 notify()时，将所有的依赖进行一次广播，将任务加入队列，之后执行。notify 中的 dep 对应的为 watchEffect 传入的 cb，因此需要改造 watchEffect。

```
  // 传入一个函数，返回一个包含可监听value值的对象
  let computed = (fn) => {
    let value
    // 需要设置一个标记记录依赖的值是否变化，只有变化了才重新计算
    let dirty = true
    return {
      get value() {
        if (dirty) {
          // 何时将dirty重置为true
          // 在执行fn时，监听的响应式数据变化之后将dirty重置为true
          // 就是在执行notify()时
          // notify中的dep对应的为watchEffect传入的cb，因此需要改造watchEffect
          value = fn() // value值置为传入函数执行的结果
          // 计算之后将标记置为false。只要数据没有变化，就不会再重新计算
          dirty = false
        }
        return value
      }
    }
  }
```

改造 watchEffect

1. 新增 effect 函数，将原来 watchEffect 中的内容放进去
2. effect 中新建一个`_effect`函数，将 fn 额外包装了一层，用于给它添加属性，为了保证 fn 函数的纯粹性

```
  let active

  let effect = (fn, options = {}) => {
    // _effect 额外包装了一层，用于给它添加属性
    // 为了保证fn函数的纯粹性
    let _effect = (...args) => {
      try {
        active = _effect
        return fn(...args) // 需要添加return语句用于computed函数中拿到变化之后的值
      } finally {
        // 无论是否抛出异常最后finally都会执行
        // 这句代码是在`return fn(...args)`后需要执行，因此需要放进try{}finally{}中
        active = null
      }
    }
    _effect.options = options
    return _effect
  }

  // 之前的watch实现的即是watchEffect函数的功能
  let watchEffect = (cb) => {
    /* active = cb
    active()
    active = null */
    // 将原来部分的逻辑提取到effect函数中
    let runner = effect(cb)
    runner()
  }
```

`notify`函数中触发

1. computed 函数中需要用 effect 去替代 fn，这样可以添加钩子函数，即传入 effect 中的 options 参数
2. notify 中执行钩子函数

```
  // 传入一个函数，返回一个包含可监听value值的对象
  let computed = (fn) => {
    let value
    // 需要设置一个标记记录依赖的值是否变化，只有变化了才重新计算
    let dirty = true
    let runner = effect(fn, {
      schedular() {
        if (!dirty) {
          dirty = true
        }
      }
    })
    return {
      get value() {
        if (dirty) {
          // 何时将dirty重置为true
          // 在执行fn时，监听的响应式数据变化之后将dirty重置为true
          // 就是在执行notify()时
          // notify中的dep对应的为watchEffect传入的cb，因此需要改造watchEffect
          // value = fn() // value值置为传入函数执行的结果
          value = runner()
          // 计算之后将标记置为false。只要数据没有变化，就不会再重新计算
          dirty = false
        }
        return value
      }
    }
  }

  let ref = initValue => {
    let value = initValue
    let dep = new Dep()
    return Object.defineProperty({}, 'value', {
      get() {
        dep.depend()
        return value
      },
      set(newValue) {
        value = newValue
        // active()
        dep.notify()
      }
    })
  }
```

```
  // 触发
    notify() {
      this.deps.forEach(dep => {
        queueJob(dep)
        // 执行钩子函数
        dep.options && dep.options.schedular && dep.options.schedular()
      })
    }
```

完整代码：

```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>

<body>
  <button id="add">add</button>
  <div id="app"></div>
</body>
<script>
  let active

  let effect = (fn, options = {}) => {
    // _effect 额外包装了一层，用于给它添加属性
    // 为了保证fn函数的纯粹性
    let _effect = (...args) => {
      try {
        active = _effect
        return fn(...args) // 需要添加return语句用于computed函数中拿到变化之后的值
      } finally {
        // 无论是否抛出异常最后finally都会执行
        // 这句代码是在`return fn(...args)`后需要执行，因此需要放进try{}finally{}中
        active = null
      }
    }
    _effect.options = options
    return _effect
  }

  // 之前的watch实现的即是watchEffect函数的功能
  let watchEffect = (cb) => {
    /* active = cb
    active()
    active = null */
    // 将原来部分的逻辑提取到effect函数中
    let runner = effect(cb)
    runner()
  }

  let nextTick = (cb) => Promise.resolve().then(cb)

  // 队列
  let queue = []

  // 添加队列
  let queueJob = (job) => {
    if (!queue.includes(job)) {
      queue.push(job)
      // 添加之后，将执行放到异步任务中
      nextTick(flushJob)
    }
  }

  // 执行队列
  let flushJob = () => {
    while (queue.length > 0) {
      let job = queue.shift()
      job && job()
    }
  }


  let Dep = class {
    constructor() {
      // 存放收集的active
      this.deps = new Set()
    }
    // 依赖收集
    depend() {
      if (active) {
        this.deps.add(active)
      }
    }
    // 触发
    notify() {
      this.deps.forEach(dep => {
        queueJob(dep)
        // 执行钩子函数
        dep.options && dep.options.schedular && dep.options.schedular()
      })
    }
  }

  // 传入一个函数，返回一个包含可监听value值的对象
  let computed = (fn) => {
    let value
    // 需要设置一个标记记录依赖的值是否变化，只有变化了才重新计算
    let dirty = true
    let runner = effect(fn, {
      schedular() {
        if (!dirty) {
          dirty = true
        }
      }
    })
    return {
      get value() {
        if (dirty) {
          // 何时将dirty重置为true
          // 在执行fn时，监听的响应式数据变化之后将dirty重置为true
          // 就是在执行notify()时
          // notify中的dep对应的为watchEffect传入的cb，因此需要改造watchEffect
          // value = fn() // value值置为传入函数执行的结果
          value = runner()
          // 计算之后将标记置为false。只要数据没有变化，就不会再重新计算
          dirty = false
        }
        return value
      }
    }
  }

  let ref = initValue => {
    let value = initValue
    let dep = new Dep()
    return Object.defineProperty({}, 'value', {
      get() {
        dep.depend()
        return value
      },
      set(newValue) {
        value = newValue
        // active()
        dep.notify()
      }
    })
  }

  // 使用：
  let count = ref(0)
  // computedValue 当count.value的值改变时才变化
  let computedValue = computed(() => count.value + 3)
  document.getElementById('add').addEventListener('click', function () {
    count.value++
  })

  let str
  watchEffect(() => {
    str = `hello ${count.value} ${computedValue.value}`
    document.getElementById('app').innerText = str
  })

</script>

</html>
```
