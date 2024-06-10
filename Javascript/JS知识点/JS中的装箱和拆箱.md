装箱和拆箱（Boxing 和 UnBoxing）的名词来自于其他语言

# JS 装箱

当读取/调用一个基础类型时，会创建它的基础包装类型。

除了 null 和 undefined，**所有原始类型都有它们相应的对象包装类型**，这为处理原始值提供可用的方法。当在原始值上访问属性时，JavaScript 会自动将值包装到相应的包装对象中，并访问对象上的属性。

## 隐式装箱

当读取一个基本类型值时，后台会创建一个该基本类型所对应的基本包装类型对象。其实就是在这个基本类型对象上调用方法。这个基本类型的对象是临时的，它只存在于方法调用那一行代码执行的瞬间，执行方法后立即被销毁。这也是在基本类型上添加属性和方法会不识别或报错的原因了，

```js
var s1 = "call_me_R"; // 隐式装箱
var s2 = s1.substring(2);

// 不能给s1添加属性
s1.job = "frontend engineer";
s1.sayHello = function () {
  console.log("hello kitty");
};
console.log(s1.job); // undefined
s1.sayHello(); // Uncaught TypeError: s1.sayHello is not a function
```

上面代码的执行步骤其实是这样的：

1. 创建 String 类型的一个实例；
2. 在实例中调用指定的方法；
3. 销毁这个实例。

上面的三个步骤转换为代码，如下：

```js
var s1 = new String("call_me_R");
// # 2
var s2 = s1.substring(2);
// # 3
s1 = null;
```

## 显式装箱

通过基本包装类型对象对基本类型进行显式装箱，可以对 new 出来的对象进行属性和方法的添加，因为通过 new 操作符创建的引用类型的实例，在执行流离开当前作用域之前一直保留在内存中。

```js
var objStr = new String("call_me_R");
objStr.job = "frontend engineer";
objStr.sayHi = function () {
  console.log("hello kitty");
};
console.log(objStr.job); // frontend engineer
objStr.sayHi(); // hello kitty
```

# 拆箱操作

拆箱是指把引用类型转换成基本的数据类型。通常通过引用类型的 valueOf()和 toString()方法来实现。

```js
var objNum = new Number(64);
var objStr = new String("64");
console.log(typeof objNum); // object
console.log(typeof objStr); // object
// 拆箱
console.log(typeof objNum.valueOf()); // number 基本的数字类型
console.log(typeof objNum.toString()); // string 基本的字符类型
console.log(typeof objStr.valueOf()); // string 基本的字符类型
console.log(typeof objStr.toString()); // string 基本的字符类型
```

## Object.prototype.valueOf()

JavaScript 调用 valueOf 方法来将对象转换成基本类型值。你很少需要自己调用 valueOf 方法；当遇到需要基本类型值的对象时，JavaScript 会自动的调用该方法。

强制数字类型转换和强制基本类型转换优先会调用该方法，而强制字符串转换会优先调用 toString()，并且 toString() 很可能返回字符串值（甚至对于 Object.prototype.toString() 基本实现也是如此），因此在这种情况下不会调用 valueOf()。

# 资料

[JavaScript 中装箱和拆箱是什么？](https://blog.csdn.net/HuoYiHengYuan/article/details/104623046)

待看：[JavaScript 数据类型和数据结构](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)

## undefined 类型

从概念上讲，**undefined 表示值的缺失**，**null 表示对象的缺失**（这也可以说明 typeof null === "object" 的原因）。当某些东西没有值时，该语言通常默认为 undefined
