# 说明

掘金小册《TypeScript 全面进阶指南》学习笔记

第 11-15 节

按照小册的结构学习，运行案例

# 11. 类型系统层级：从 Top Type 到 Bottom Type

## 判断类型兼容性的方式

使用条件类型来判断类型兼容性

```ts
// type Result = 1 说明 'linbudu' 为 string 的子类型，否则说明不成立
type Result = "linbudu" extends string ? 1 : 2;
```

通过赋值来进行兼容性检查

```ts
declare let source: string;

declare let anyType: any;
declare let neverType: never;

// string 是 any的子类型
anyType = source;

// Type 'string' is not assignable to type 'never'.
neverType = source;
```

对于变量 a = 变量 b，如果成立，意味着`<变量 b 的类型> extends <变量 a 的类型>`成立，即 b 类型是 a 类型的子类型

## 从原始类型开始

一个基础类型和它们对应的字面量类型必定存在父子类型关系

**字面量类型 < 对应的原始类型**

```ts
type Result1 = "linbudu" extends string ? 1 : 2; // 1
type Result2 = 1 extends number ? 1 : 2; // 1
type Result3 = true extends boolean ? 1 : 2; // 1
type Result4 = { name: string } extends object ? 1 : 2; // 1
type Result5 = { name: "linbudu" } extends object ? 1 : 2; // 1
// object 代表着所有非原始类型的类型，即数组、对象与函数类型
// []这个字面量类型也可以被认为是 object 的字面量类型
type Result6 = [] extends object ? 1 : 2; // 1
```

## 向上探索

在联合类型中，只需要符合其中一个类型，我们就可以认为实现了这个联合类型

```ts
type Result7 = 1 extends 1 | 2 | 3 ? 1 : 2; // 1
type Result8 = "lin" extends "lin" | "bu" | "du" ? 1 : 2; // 1
type Result9 = true extends true | false ? 1 : 2; // 1
type Result10 = string extends string | false | number ? 1 : 2; // 1
```

结论：字面量类型 < 包含此字面量类型的联合类型，原始类型 < 包含此原始类型的联合类型。

```ts
type Result11 = "lin" | "bu" | "budu" extends string ? 1 : 2; // 1
type Result12 = {} | (() => void) | [] extends object ? 1 : 2; // 1
```

结论：同一基础类型的字面量联合类型 < 此基础类型。

最终结论：字面量类型 < 包含此字面量类型的联合类型（同一基础类型） < 对应的原始类型

### 装箱类型

string 类型是 String 类型的子类型，String 类型是 Object 类型的子类型

从 string 到 Object 的类型层级：

```ts
type Result14 = string extends String ? 1 : 2; // 1
type Result15 = String extends {} ? 1 : 2; // 1
type Result16 = {} extends object ? 1 : 2; // 1
type Result18 = object extends Object ? 1 : 2; // 1
```

假设我们把 String 看作一个普通的对象，上面存在一些方法，如：

```ts
interface String {
  replace: // ...
  replaceAll: // ...
  startsWith: // ...
  endsWith: // ...
  includes: // ...
}
```

这个时候，可以看做 String 继承了 {} 这个空对象，然后自己实现了这些方法。在结构化类型系统的比较下，String 会被认为是 {} 的子类型。这里从 string < {} < object 看起来构建了一个类型链，但实际上 string extends object 并不成立：

```ts
type Tmp = string extends object ? 1 : 2; // 2
```

由于结构化类型系统这一特性，会能得到一些看起来矛盾的结论：

```ts
type Result16 = {} extends object ? 1 : 2; // 1
type Result18 = object extends {} ? 1 : 2; // 1

type Result17 = object extends Object ? 1 : 2; // 1
type Result20 = Object extends object ? 1 : 2; // 1

type Result19 = Object extends {} ? 1 : 2; // 1
type Result21 = {} extends Object ? 1 : 2; // 1
```

这里的 `{} extends` 和 `extends {}` 实际上是两种完全不同的比较方式。`{} extends object` 和 `{} extends Object` 意味着， {} 是 object 和 Object 的字面量类型，是从类型信息的层面出发的，即字面量类型在基础类型之上提供了更详细的类型信息。`object extends {}` 和 `Object extends {}` 则是从结构化类型系统的比较出发的，即 {} 作为一个一无所有的空对象，几乎可以被视作是所有类型的基类，万物的起源。如果混淆了这两种类型比较的方式，就可能会得到 `string extends object` 这样的错误结论。

而 `object extends Object` 和 `Object extends object` 这两者的情况就要特殊一些，它们是因为“系统设定”的问题，Object 包含了所有除 Top Type 以外的类型（基础类型、函数类型等），object 包含了所有非原始类型的类型，即数组、对象与函数类型，这就导致了你中有我、我中有你的神奇现象。

暂时只关注从类型信息层面出发的部分，即结论为：**原始类型 < 原始类型对应的装箱类型 < Object 类型**。

### Top Type

any 与 unknown 是系统中设定为 Top Type 的两个类型，它们无视一切因果律，是类型世界的规则产物。因此， Object 类型自然会是 any 与 unknown 类型的子类型。

```ts
type Result22 = Object extends any ? 1 : 2; // 1
type Result23 = Object extends unknown ? 1 : 2; // 1

type Result24 = any extends Object ? 1 : 2; // 1 | 2
type Result25 = unknown extends Object ? 1 : 2; // 2

type Result26 = any extends "linbudu" ? 1 : 2; // 1 | 2
type Result27 = any extends string ? 1 : 2; // 1 | 2
type Result28 = any extends {} ? 1 : 2; // 1 | 2
type Result29 = any extends never ? 1 : 2; // 1 | 2
```

还是因为“系统设定”的原因。any 代表了任何可能的类型，当我们使用 any extends 时，它包含了“让条件成立的一部分”，以及“让条件不成立的一部分”。而从实现上说，在 TypeScript 内部代码的条件类型处理中，如果接受判断的是 any，那么会直接返回条件类型结果组成的联合类型。

```ts
type Result31 = any extends unknown ? 1 : 2; // 1
type Result32 = unknown extends any ? 1 : 2; // 1
```

只关注类型信息层面的层级，即结论为：**Object < any / unknown**。

## 向下探索

never 类型，因为它代表了“虚无”的类型，一个根本不存在的类型。对于这样的类型，它会是任何类型的子类型，也包括字面量类型

```ts
type Result33 = never extends "linbudu" ? 1 : 2; // 1
```

在 TypeScript 中，void、undefined、null 都是切实存在、有实际意义的类型，它们和 string、number、object 并没有什么本质区别。所以以下都不成立：

```ts
type Result34 = undefined extends "linbudu" ? 1 : 2; // 2
type Result35 = null extends "linbudu" ? 1 : 2; // 2
type Result36 = void extends "linbudu" ? 1 : 2; // 2
```

结论是，**never < 字面量类型**。

## 类型层级链

全部成立，结果为 8

```ts
type TypeChain = never extends "linbudu"
  ? "linbudu" extends "linbudu" | "599"
    ? "linbudu" | "599" extends string
      ? string extends String
        ? String extends Object
          ? Object extends any
            ? any extends unknown
              ? unknown extends any
                ? 8
                : 7
              : 6
            : 5
          : 4
        : 3
      : 2
    : 1
  : 0;
```

结合上面的结构化类型系统与类型系统设定，还可以构造出一条更长的类型层级链：

```ts
type VerboseTypeChain = never extends "linbudu"
  ? "linbudu" extends "linbudu" | "budulin"
    ? "linbudu" | "budulin" extends string
      ? string extends {}
        ? string extends String
          ? String extends {}
            ? {} extends object
              ? object extends {}
                ? {} extends Object
                  ? Object extends {}
                    ? object extends Object
                      ? Object extends object
                        ? Object extends any
                          ? Object extends unknown
                            ? any extends unknown
                              ? unknown extends any
                                ? 8
                                : 7
                              : 6
                            : 5
                          : 4
                        : 3
                      : 2
                    : 1
                  : 0
                : -1
              : -2
            : -3
          : -4
        : -5
      : -6
    : -7
  : -8;
```

## 其他比较场景

- 对于基类和派生类，通常情况下派生类会完全保留基类的结构，而只是自己新增新的属性与方法。在结构化类型的比较下，其类型自然会存在子类型关系。更不用说派生类本身就是 extends 基类得到的。

- 对于联合类型地类型层级比较，我们只需要比较**一个联合类型是否可被视为另一个联合类型的子集**，即**这个联合类型中所有成员在另一个联合类型中都能找到**。

- 特殊的数组和元组：

  ```ts
  type Result40 = [number, number] extends number[] ? 1 : 2; // 1
  type Result41 = [number, string] extends number[] ? 1 : 2; // 2
  type Result42 = [number, string] extends (number | string)[] ? 1 : 2; // 1
  type Result43 = [] extends number[] ? 1 : 2; // 1
  type Result44 = [] extends unknown[] ? 1 : 2; // 1
  type Result45 = number[] extends (number | string)[] ? 1 : 2; // 1
  type Result46 = any[] extends number[] ? 1 : 2; // 1
  type Result47 = unknown[] extends number[] ? 1 : 2; // 2
  type Result48 = never[] extends number[] ? 1 : 2; // 1
  ```

  解释：

  - 40，这个元组类型实际上能确定其内部成员全部为 number 类型，因此是 number[] 的子类型。而 41 中混入了别的类型元素，因此认为不成立。
  - 42 混入了别的类型，但其判断条件为 (number | string)[] ，即其成员需要为 number 或 string 类型。
  - 43 的成员是未确定的，等价于 never[] extends number[]，44 同理。
  - 45 类似于 41，即可能存在的元素类型是符合要求的。
  - 46、47，还记得身化万千的 any 类型和小心谨慎的 unknown 类型嘛？
  - 48，类似于 43、44，由于 never 类型本就位于最下方，这里显然成立。只不过 never[] 类型的数组也就无法再填充值了。

# 12. 类型里的逻辑运算：条件类型与 infer

## 条件类型基础

条件类型的语法类似于我们平时常用的三元表达式，它的基本语法如下（伪代码）：

```js
ValueA === ValueB ? Result1 : Result2;
TypeA extends TypeB ? Result1 : Result2;
```

extends 判断类型的兼容性而不是全等性，对于能够进行赋值操作的两个变量的类型只需要具有兼容性

```ts
type LiteralType<T> = T extends string ? "string" : "other";
type s = LiteralType<"lin">;
type n = LiteralType<0>;
```

## infer 关键字

通过 infer 关键字来**在条件类型中提取类型的某一部分信息**

```ts
type FunctionReturType<T extends Func> = T extends (...args: any[]) => infer R
  ? R
  : never;
// string
type stringReturnType = FunctionReturType<(...args: string[]) => string>;
// number
type numberReturnType = FunctionReturType<(...args: number[]) => number>;
```

当传入的类型参数满足`T extends (...args: any[]) => infer R`这样一个结构（不用管 infer R，当它是 any 就行），返回 infer R 位置的值，即 R。否则，返回 never。

infer 是 inference 的缩写，意为推断，如 infer R 中 R 就表示 待推断的类型。 **infer 只能在条件类型中使用**，因为我们实际上仍然需要类型结构是一致的，比如上例中类型信息需要是一个函数类型结构，我们才能提取出它的返回值类型。如果连函数类型都不是，那我只会给你一个 never 。

```ts
type Swap<T extends any[]> = T extends [infer A, infer B] ? [B, A] : T;

type SwapResult1 = Swap<[1, 2]>; // 符合元组结构，首尾元素替换[2, 1]
type SwapResult2 = Swap<[1, 2, 3]>; // 不符合结构，没有发生替换，仍是 [1, 2, 3]
```

结合 rest 可以处理不定长数组的情况

```ts
// 提取首尾两个
type ExtractStartAndEnd<T extends any[]> = T extends [
  infer Start,
  ...any[],
  infer End
]
  ? [Start, End]
  : T;

// 调换首尾两个
type SwapStartAndEnd<T extends any[]> = T extends [
  infer Start,
  ...infer Left,
  infer End
]
  ? [End, ...Left, Start]
  : T;

// 调换开头两个
type SwapFirstTwo<T extends any[]> = T extends [
  infer Start1,
  infer Start2,
  ...infer Left
]
  ? [Start2, Start1, ...Left]
  : T;
```

还可以进行结构层面的转换，从数组到联合类型：

```ts
type ArrayItemType<T> = T extends Array<infer ElementType>
  ? ElementType
  : never;

type ArrayItemTypeResult1 = ArrayItemType<[]>; // never
type ArrayItemTypeResult2 = ArrayItemType<string[]>; // string
// [string, number] 等价于 (string | number)[]
type ArrayItemTypeResult3 = ArrayItemType<[string, number]>; // string | number
type ArrayItemTypeResult4 = ArrayItemType<Array<string | number>>; // string | number
```

infer 结构也可以是接口

```ts
// 提取对象的属性类型
type PropType<T, K extends keyof T> = T extends { [Key in K]: infer R }
  ? R
  : never;

type PropTypeResult1 = PropType<{ name: string }, "name">; // string
type PropTypeResult2 = PropType<{ name: string; age: number }, "name" | "age">; // string | number

// 反转键名与键值
// V & string 确保属性名为 string 类型
type ReverseKeyValue<T extends Record<string, unknown>> = T extends Record<
  infer K,
  infer V
>
  ? Record<V & string, K>
  : never;

type ReverseKeyValueResult1 = ReverseKeyValue<{ key: "value" }>; // { "value": "key" }
```

使用`V & string`确保属性名为 string 类型。如果不加会报错，是因为，泛型参数 V 的来源是从键值类型推导出来的，TypeScript 中这样对键值类型进行 infer 推导，将导致类型信息丢失，而不满足索引签名类型只允许 string | number | symbol 的要求。

映射类型的判断条件是需要同时满足其两端的类型，使用 V & string 这一形式，就确保了最终符合条件的类型参数 V 一定会满足 string | never 这个类型，因此可以被视为合法的索引签名类型。

infer 结构还可以是 Promise 结构

```ts
type PromiseValue<T> = T extends Promise<infer V> ? V : T;

type PromiseValueResult1 = PromiseValue<Promise<number>>; // number
type PromiseValueResult2 = PromiseValue<number>; // number，但并没有发生提取

// 如果嵌套使用，是无法拿到boolean的
type PromiseValueResult3 = PromiseValue<Promise<Promise<boolean>>>; // Promise<boolean>，只提取了一层
```

infer 关键字可以用在嵌套的场景中，包括对类型结构深层信息地提取，以及对提取到类型信息的筛选等

```ts
type PromiseValue<T> = T extends Promise<infer V>
  ? V extends Promise<infer N>
    ? N
    : V
  : T;

// 使用递归写法实现
type PromiseValue<T> = T extends Promise<infer V> ? PromiseValue<V> : T;

// boolean
type PromiseValueResult3 = PromiseValue<Promise<Promise<boolean>>>;
```

## 分布式条件类型

分布式条件类型（Distributive Conditional Type），也称条件类型的分布式特性，只不过是条件类型在满足一定情况下会执行的逻辑而已。

```ts
type Condition<T> = T extends 1 | 2 | 3 ? T : never;

// 这种可以理解为 1 | 2 | 3 | 4 | 5 每个值 依次执行 extends 1 | 2 | 3
// 再将返回结果拼接到一起
// 1 | 2 | 3
type Res1 = Condition<1 | 2 | 3 | 4 | 5>;

// never
type Res2 = 1 | 2 | 3 | 4 | 5 extends 1 | 2 | 3 ? 1 | 2 | 3 | 4 | 5 : never;
```

看起来一样的但是结果不一样，区别在于，在 Res1 中，进行判断的联合类型被作为泛型参数传入给另一个独立的类型别名，而 Res2 中直接对这两者进行判断。

第一个差异：**是否通过泛型参数传入**。

```ts
type Naked<T> = T extends boolean ? "Y" : "N";
type Wrapped<T> = [T] extends [boolean] ? "Y" : "N";

// "N" | "Y"
type Res3 = Naked<number | boolean>;

// "N"
type Res4 = Wrapped<number | boolean>;
```

区别在于 Res4 中 Wrapped 类型的**参数被数组包裹了**。

Res3 的判断中，其联合类型的两个分支，恰好对应于分别使用 number 和 boolean 去作为条件类型判断时的结果。

总结一下条件类型分布式起作用的条件：

1. 类型参数需要是一个联合类型
2. 类型参数需要通过泛型参数的方式传入，而不能直接进行条件类型判断（如 Res2 中）
3. 条件类型中的泛型参数不能被包裹（也就是裸类型参数）

效果：将这个联合类型拆开来，每个分支分别进行一次条件类型判断，再将最后的结果合并起来（如 Naked 中）。

官方解释：对于属于裸类型参数的检查类型，条件类型会在实例化时期自动分发到联合类型上。（Conditional types in which the checked type is a naked type parameter are called distributive conditional types. Distributive conditional types are automatically distributed over union types during instantiation.）

对于自动分发，伪代码如下：

```ts
type Naked<T> = T extends boolean ? "Y" : "N";

// (number extends boolean ? "Y" : "N") | (boolean extends boolean ? "Y" : "N")
// "N" | "Y"
type Res3 = Naked<number | boolean>;

// 过程
const Res3 = [];

for(const input of [number, boolean]){
  if(input extends boolean){
    Res3.push("Y");
  } else {
    Res.push("N");
  }
}
```

数组包裹泛型参数是使泛型参数不裸露的一种方式，下面这种 T 也不是裸类型参数：

```ts
// T & {} 将T进行了包裹，并且不会影响类型信息
export type NoDistribute<T> = T & {};

type Wrapped<T> = NoDistribute<T> extends boolean ? "Y" : "N";

type Res1 = Wrapped<number | boolean>; // "N"
type Res2 = Wrapped<true | false>; // "Y"
type Res3 = Wrapped<true | false | 599>; // "N"
```

当不需要分布式特性时，就可以通过包裹泛型参数来实现。

包裹泛型参数还可以用来判断一个类型是否为 never：

```ts
// 包裹参数后，会执行条件判断
type IsNever<T> = [T] extends [never] ? true : false;

type IsNeverRes1 = IsNever<never>; // true
type IsNeverRes2 = IsNever<"linbudu">; // false

type IsNever2<T> = T extends never ? true : false;

// 没有包裹，当参数为never时，会跳过判断，返回never
type IsNever2Res1 = IsNever2<never>; // never
type IsNever2Res2 = IsNever2<"linbudu">; // false
```

当条件类型的判断参数为 any，会直接返回条件类型两个结果的联合类型。当通过泛型传入的参数为 never，则会直接返回 never。

```ts
// 直接使用，返回联合类型
type Tmp1 = any extends string ? 1 : 2; // 1 | 2

type Tmp2<T> = T extends string ? 1 : 2;
// 通过泛型参数传入，同样返回联合类型
type Tmp2Res = Tmp2<any>; // 1 | 2

// 如果判断条件是 any，那么仍然会进行判断
type Special1 = any extends any ? 1 : 2; // 1
type Special2<T> = T extends any ? 1 : 2;
type Special2Res = Special2<any>; // 1
```

never 与 any 情况有所不同：

```ts
// 直接使用，仍然会进行判断
type Tmp3 = never extends string ? 1 : 2; // 1

type Tmp4<T> = T extends string ? 1 : 2;
// 通过泛型参数传入，会跳过判断
type Tmp4Res = Tmp4<never>; // never

// 如果判断条件是 never，还是仅在作为泛型参数时才跳过判断
type Special3 = never extends never ? 1 : 2; // 1
type Special4<T> = T extends never ? 1 : 2;
type Special4Res = Special4<never>; // never
```

这里的 any、never 两种情况都不会实际地执行条件类型，而在这里我们通过包裹的方式让它不再是一个孤零零的 never，也就能够去执行判断了。

(情况多到我都混乱了，结论就是包裹参数后会执行判断，即使参数是 never 和 any。如果不包裹，never 和 any 的实际效果具体看例子里列举的)

在类型世界中联合类型就像是一个集合一样。通过使用分布式条件类型，我们能轻易地进行集合之间的运算，比如交集：

```ts
type Intersection<A, B> = A extends B ? A : never;

type IntersectionRes = Intersection<1 | 2 | 3, 2 | 3 | 4>; // 2 | 3
```

情况好多，要晕了，关键是现在没有实践，只是学习，肯定是学完就忘了！！！

## 扩展：IsAny 与 IsUnknown

```ts
type IsAny<T> = 0 extends 1 & T ? true : false;

type IsUnknown<T> = unknown extends T
  ? IsAny<T> extends true
    ? false
    : true
  : false;
```

对于 1 这样的字面量类型，只有传入其本身、对应的原始类型、包含其本身的联合类型，才能得到一个有意义的值，并且这个值一定只可能是它本身：

```ts
type Tmp1 = 1 & (0 | 1); // 1
type Tmp2 = 1 & number; // 1
type Tmp3 = 1 & 1; // 1
```

& 交叉类型就像短板效应一样，其最终计算的类型是由最短的那根木板，也就是最精确的那个类型决定的。这样看，无论如何 0 extends 1 都不会成立。

但作为代表任意类型的 any ，它的存在就像是开天辟地的基本规则一样，如果交叉类型的其中一个成员是 any，那短板效应就失效了，此时最终类型必然是 any 。

```ts
type Tmp4 = 1 & any; // any
```

利用 unknown extends T 时仅有 T 为 any 或 unknown 时成立这一点，我们可以直接将类型收窄到 any 与 unknown，然后在去掉 any 类型时，我们仍然可以利用 any 的身化万千特性。

# 第 13 章 内置工具类型基础

## 工具类型的分类

内置的工具类型按照类型操作的不同，其实也可以大致划分为这么几类：

- 对属性的修饰，包括对象属性和数组元素的可选/必选、只读/可写。我们将这一类统称为**属性修饰工具类型**。
- 对既有类型的裁剪、拼接、转换等，比如使用对一个对象类型裁剪得到一个新的对象类型，将联合类型结构转换到交叉类型结构。我们将这一类统称为**结构工具类型**。
  对集合（即联合类型）的处理，即交集、并集、差集、补集。我们将这一类统称为**集合工具类型**。
- 基于 infer 的模式匹配，即对一个既有类型特定位置类型的提取，比如提取函数类型签名中的返回值类型。我们将其统称为**模式匹配工具类型**。
- 模板字符串专属的工具类型，比如神奇地将一个对象类型中的所有属性名转换为大驼峰的形式。这一类当然就统称为**模板字符串工具类型**了。

## 属性修饰工具类型

在内置工具类型中，访问性修饰工具类型包括以下三位：

```ts
// ? 标记属性为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// -? 去掉标记属性为可选
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// readonly 标记属性为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

## 结构工具类型

这一部分的工具类型主要使用条件类型以及映射类型、索引类型。

结构工具类型其实又可以分为两类，结构声明和结构处理。

结构声明工具类型即快速声明一个结构，比如**内置类型中的 Record**：

```ts
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

其中，K extends keyof any 即为键的类型，这里使用 extends keyof any 标明，传入的 K 可以是单个类型，也可以是联合类型，而 T 即为属性的类型。

```ts
// 键名均为字符串，键值类型未知
type Record1 = Record<string, unknown>;
// 键名均为字符串，键值类型任意
type Record2 = Record<string, any>;
// 键名为字符串或数字，键值类型任意
type Record3 = Record<string | number, any>;
```

其中，Record<string, unknown> 和 Record<string, any> 是日常使用较多的形式，通常我们使用这两者来代替 object 。

而对于结构处理工具类型，在 TypeScript 中主要是 Pick、Omit 两位选手：

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

首先来看 Pick，它接受两个泛型参数，T 即是我们会进行结构处理的原类型（一般是对象类型），而 K 则被约束为 T 类型的键名联合类型。由于泛型约束是立即填充推导的，即你为第一个泛型参数传入 Foo 类型以后，K 的约束条件会立刻被填充，因此在你输入 K 时会获得代码提示：

```ts
// T 就是Foo， K被约束为T类型的键名联合类型
// 也就是 'name' 'age' 'job'
// 示例中传入"name" | "age"，那么最终得到的 PickedFoo类型就是
// name 对应的 string 和 age 对应的 number
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type JobUnionType = [] | boolean;

interface Foo {
  name: string;
  age: number;
  job: JobUnionType;
}

/* 
type PickedFoo = {
    name: string;
    age: number;
}
*/
type PickedFoo = Pick<Foo, "name" | "age">;
```

然后 Pick 会将传入的联合类型作为需要保留的属性，使用这一联合类型配合映射类型，即上面的例子等价于：

```ts
type Pick<T> = {
  [P in "name" | "age"]: T[P];
};
```

联合类型的成员会被依次映射，并通过索引类型访问来获取到它们原本的类型。

而对于 Omit 类型，看名字其实能 get 到它就是 Pick 的反向实现：Pick 是保留这些传入的键，比如从一个庞大的结构中选择少数字段保留，需要的是这些少数字段，而 Omit 则是移除这些传入的键，也就是从一个庞大的结构中剔除少数字段，需要的是剩余的多数部分。

Omit 是基于 Pick 实现的，这也是 TypeScript 中成对工具类型的另一种实现方式。上面的 Partial 与 Required 使用类似的结构，在关键位置使用一个相反操作来实现反向，而这里的 Omit 类型则是基于 Pick 类型实现，也就是反向工具类型基于正向工具类型实现。

首先接受的泛型参数类似，也是一个类型与联合类型（要剔除的属性），但是在将这个联合类型传入给 Pick 时多了一个 Exclude，这一工具类型属于工具类型，我们可以暂时理解为 Exclude<A, B> 的结果就是存在于联合类型 A 中，但是不存在于 B 中的部分：

```ts
type Tmp1 = Exclude<1, 2>; // 1
type Tmp2 = Exclude<1 | 2, 2>; // 1
type Tmp3 = Exclude<1 | 2 | 3, 2 | 3>; // 1
type Tmp4 = Exclude<1 | 2 | 3, 2 | 4>; // 1 | 3
```

因此，在这里 Exclude<keyof T, K> 其实就是 T 的键名联合类型中剔除了 K 的部分，将其作为 Pick 的键名，就实现了剔除一部分类型的效果。

另外，你可能发现 Pick 会约束第二个参数的联合类型来自于对象属性，而 Omit 并不这么要求？官方团队的考量是，可能存在这么一种情况：

```ts
type Omit1<T, K> = Pick<T, Exclude<keyof T, K>>;
type Omit2<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 这里就不能用严格 Omit 了
declare function combineSpread<T1, T2>(
  obj: T1,
  otherObj: T2,
  rest: Omit1<T1, keyof T2>
): void;

type Point3d = { x: number; y: number; z: number };

declare const p1: Point3d;

// 能够检测出错误，rest 中缺少了 y
combineSpread(p1, { x: 10 }, { z: 2 });
```

这里我们使用 keyof Obj2 去剔除 Obj1，此时如果声明约束反而不符合预期。

## 集合工具类型

数学中的集合概念：

- 并集，两个集合的合并，合并时重复的元素只会保留一份（这也是联合类型的表现行为）。
- 交集，两个集合的相交部分，即同时存在于这两个集合内的元素组成的集合。
- 差集，对于 A、B 两个集合来说，A 相对于 B 的差集即为 A 中独有而 B 中不存在的元素 的组成的集合，或者说 A 中剔除了 B 中也存在的元素以后，还剩下的部分。
- 补集，补集是差集的特殊情况，此时集合 B 为集合 A 的子集，在这种情况下 A 相对于 B 的差集 + B = 完整的集合 A。

内置工具类型中提供了交集与差集的实现：

```ts
type Extract<T, U> = T extends U ? T : never;

type Exclude<T, U> = T extends U ? never : T;
```

这里的具体实现其实就是条件类型的分布式特性，即当 T、U 都是联合类型（视为一个集合）时，T 的成员会依次被拿出来进行 extends U ? T1 : T2 的计算，然后将最终的结果再合并成联合类型。

比如对于交集 Extract ，其运行逻辑是这样的：

```ts
type AExtractB = Extract<1 | 2 | 3, 1 | 2 | 4>; // 1 | 2

type _AExtractB =
  | (1 extends 1 | 2 | 4 ? 1 : never) // 1
  | (2 extends 1 | 2 | 4 ? 2 : never) // 2
  | (3 extends 1 | 2 | 4 ? 3 : never); // never
```

而差集 Exclude 也是类似，但需要注意的是，差集存在相对的概念，即 A 相对于 B 的差集与 B 相对于 A 的差集并不一定相同，而交集则一定相同。

为了便于理解，我们也将差集展开：

```ts
type SetA = 1 | 2 | 3 | 5;

type SetB = 0 | 1 | 2 | 4;

type AExcludeB = Exclude<SetA, SetB>; // 3 | 5
type BExcludeA = Exclude<SetB, SetA>; // 0 | 4

type _AExcludeB =
  | (1 extends 0 | 1 | 2 | 4 ? never : 1) // never
  | (2 extends 0 | 1 | 2 | 4 ? never : 2) // never
  | (3 extends 0 | 1 | 2 | 4 ? never : 3) // 3
  | (5 extends 0 | 1 | 2 | 4 ? never : 5); // 5

type _BExcludeA =
  | (0 extends 1 | 2 | 3 | 5 ? never : 0) // 0
  | (1 extends 1 | 2 | 3 | 5 ? never : 1) // never
  | (2 extends 1 | 2 | 3 | 5 ? never : 2) // never
  | (4 extends 1 | 2 | 3 | 5 ? never : 4); // 4
```

实现并集与补集:

```ts
// 并集
export type Concurrence<A, B> = A | B;

// 交集
export type Intersection<A, B> = A extends B ? A : never;

// 差集
export type Difference<A, B> = A extends B ? never : A;

// 补集
export type Complement<A, B extends A> = Difference<A, B>;
```

补集基于差集实现，我们只需要约束集合 B 为集合 A 的子集即可。

内置工具类型中还有一个场景比较明确的集合工具类型：

```ts
// 去掉集合中的 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T;
// 那么可以理解为 集合 T 和 联合类型 null | undefined 的差集
type _NonNullable<T> = Difference<T, null | undefined>;

// 例子
type SetC = 1 | "2" | null;
// 1 | '2'
type nn1 = NonNullable<SetC>;
```

在基于分布式条件类型的工具类型中，其实也存在着正反工具类型，但并不都是简单地替换条件类型结果的两端，如交集与补集就只是简单调换了结果，但二者作用却完全不同。

**联合类型中会自动合并相同的元素**，因此我们可以默认这里指的类型集合全部都是类似 Set 那样的结构，不存在重复元素。

## 模式匹配工具类型

这一部分的工具类型主要使用条件类型与 infer 关键字。

更严格地说 infer 其实代表了一种 模式匹配（pattern matching） 的思路，如正则表达式、Glob 中等都体现了这一概念。

首先是对函数类型签名的模式匹配：

```ts
type FunctionType = (...args: any) => any;

type Parameters<T extends FunctionType> = T extends (...args: infer P) => any
  ? P
  : never;

type ReturnType<T extends FunctionType> = T extends (...args: any) => infer R
  ? R
  : any;
```

根据 infer 的位置不同，我们就能够获取到不同位置的类型，在函数这里则是参数类型与返回值类型。

还可以只匹配第一个参数类型：

```ts
type FirstParameter<T extends FunctionType> = T extends (
  arg: infer P,
  ...args: any
) => any
  ? P
  : never;

type FuncFoo = (arg: number) => void;
type FuncBar = (...args: string[]) => void;

type FooFirstParameter = FirstParameter<FuncFoo>; // number

type BarFirstParameter = FirstParameter<FuncBar>; // string
```

除了对函数类型进行模式匹配，内置工具类型中还有一组对 Class 进行模式匹配的工具类型：

```ts
type ClassType = abstract new (...args: any) => any;

type ConstructorParameters<T extends ClassType> = T extends abstract new (
  ...args: infer P
) => any
  ? P
  : never;

type InstanceType<T extends ClassType> = T extends abstract new (
  ...args: any
) => infer R
  ? R
  : any;
```

Class 的通用类型签名可能看起来比较奇怪，但实际上它就是声明了可实例化（new）与可抽象（abstract）罢了。我们也可以使用接口来进行声明：

```ts
export interface ClassType<TInstanceType = any> {
  new (...args: any[]): TInstanceType;
}
```

对 Class 的模式匹配思路类似于函数，或者说这是一个通用的思路，即基于放置位置的匹配。放在参数部分，那就是构造函数的参数类型，放在返回值部分，那当然就是 Class 的实例类型了。

Class 这部分没有举例没看懂

## 扩展-infer 约束

在某些时候，我们可能对 infer 提取的类型值有些要求，比如我只想要数组第一个为字符串的成员，如果第一个成员不是字符串，那我就不要了。

先写一个提取数组第一个成员的工具类型：

```ts
type FirstArrayItemType<T extends any[]> = T extends [infer P, ...any[]]
  ? P
  : never;
加上对提取字符串的条件类型：

type FirstArrayItemType<T extends any[]> = T extends [infer P, ...any[]]
  ? P extends string
    ? P
    : never
  : never;
```

试用一下：

```ts
type Tmp1 = FirstArrayItemType<[599, "linbudu"]>; // never
type Tmp2 = FirstArrayItemType<["linbudu", 599]>; // 'linbudu'
type Tmp3 = FirstArrayItemType<["linbudu"]>; // 'linbudu'
```

看起来好像能满足需求，但程序员总是精益求精的。泛型可以声明约束，只允许传入特定的类型，那 infer 中能否也添加约束，只提取特定的类型？

TypeScript 4.7 就支持了 infer 约束功能来实现对特定类型地提取，比如上面的例子可以改写为这样：

```ts
type FirstArrayItemType<T extends any[]> = T extends [
  infer P extends string,
  ...any[]
]
  ? P
  : never;
```

实际上，infer + 约束的场景是非常常见的，尤其是在某些连续嵌套的情况下，一层层的 infer 提取再筛选会严重地影响代码的可读性，而 infer 约束这一功能无疑带来了更简洁直观的类型编程代码。

# 14. 反方向类型推导：用好上下文相关类型

TypeScript 拥有非常强大的类型推导能力，不仅会在你声明一个变量时自动推导其类型，也会基于函数内部逻辑自动推导其返回值类型，还会在你使用 typeof 、instanceof 等工具时自动地收窄类型（可辨识联合类型）等等。这些类型推导其实有一个共同点：**它们的推导依赖开发者的输入**，比如变量声明、函数逻辑、类型保护都需要开发者的输入。

## 无处不在的上下文类型

```ts
window.onerror = (event, source, line, col, err) => {};
```

在这个例子里，虽然我们并没有为 onerror 的各个参数声明类型，但是它们也已经获得了正确的类型。

这是因为 onerror 的类型声明已经内置了：

```ts
interface Handler {
  // 简化
  onerror: OnErrorEventHandlerNonNull;
}

interface OnErrorEventHandlerNonNull {
  (
    event: Event | string,
    source?: string,
    lineno?: number,
    colno?: number,
    error?: Error
  ): any;
}
```

自定义函数类型：

```ts
type CustomHandler = (name: string, age: number) => boolean;

// 也推导出了参数类型
// arg1 是 string， arg2 是 number
const handler: CustomHandler = (arg1, arg2) => true;
```

在这里，参数的类型基于其上下文类型中的参数类型位置来进行匹配，arg1 对应到 name ，所以是 string 类型，arg2 对应到 age，所以是 number 类型。这就是**上下文类型的核心理念：基于位置的类型推导**。同时，相对于我们上面提到的基于开发者输入进行的类型推导，上下文类型更像是**反方向的类型推导，也就是基于已定义的类型来规范开发者的使用**。

在上下文类型中，我们实现的表达式可以只使用更少的参数，而不能使用更多，这还是因为上下文类型基于位置的匹配，一旦参数个数超过定义的数量，那就没法进行匹配了。

```ts
// 正常
window.onerror = (event) => {};
// 报错
window.onerror = (event, source, line, col, err, extra) => {};
```

上下文类型也可以进行”嵌套“情况下的类型推导，如以下这个例子：

```ts
declare let func: (raw: number) => (input: string) => any;

// raw → number
func = (raw) => {
  // input → string
  return (input) => {};
};
```

在某些情况下，上下文类型的推导能力也会失效，比如这里我们使用一个由函数类型组成的联合类型：

```ts
// ! 是非空断言，标记前面的一个声明一定是非空的
class Foo {
  foo!: number;
}

class Bar extends Foo {
  bar!: number;
}

// 两个函数类型组成的联合类型
let f1: ((input: Foo) => void) | ((input: Bar) => void);
// 参数“input”隐式具有“any”类型。
f1 = (input) => {};
```

我们预期的结果是 input 被推导为 Foo | Bar 类型，也就是所有符合结构的函数类型的参数，但却失败了。这是因为 TypeScript 中的上下文类型目前暂时不支持这一判断方式（而不是这不属于上下文类型的能力范畴）。

你可以直接使用一个联合类型参数的函数签名：

```ts
let f2: (input: Foo | Bar) => void;
// Foo | Bar
f2 = (input) => {};
```

而如果联合类型中将这两个类型再嵌套一层，此时上下文类型反而正常了：

```ts
let f3:
  | ((raw: number) => (input: Foo) => void)
  | ((raw: number) => (input: Bar) => void);

// raw → number
f3 = (raw) => {
  // input → Bar
  return (input) => {};
};
```

这里被推导为 Bar 的原因，其实还和我们此前了解的协变、逆变有关。任何接收 Foo 类型参数的地方，都可以接收一个 Bar 类型参数，因此推导到 Bar 类型要更加安全。

协变、逆变还没有学到，这里 `class Bar extends Foo`，Bar 继承自 Foo

## void 返回值类型下的特殊情况

前面说到，上下文类型同样会推导并约束函数的返回值类型，但存在这么个特殊的情况，当内置函数类型的返回值类型为 void 时：

```ts
type CustomHandler1 = (name: string, age: number) => void;

const handler1: CustomHandler1 = (name, age) => true;
const handler2: CustomHandler1 = (name, age) => "linbudu";
const handler3: CustomHandler1 = (name, age) => null;
const handler4: CustomHandler1 = (name, age) => undefined;

// Placing a void expression inside another expression is forbidden. Move it to its own statement instead.eslint@typescript-eslint/no-confusing-void-expression
const result1 = handler1("linbudu", 599); // void
const result2 = handler2("linbudu", 599); // void
const result3 = handler3("linbudu", 599); // void
const result4 = handler4("linbudu", 599); // void
```

这个时候，我们的函数实现返回值类型变成了五花八门的样子，而且还都不会报错？同样的，这也是一条世界底层的规则，**上下文类型对于 void 返回值类型的函数，并不会真的要求它啥都不能返回**。然而，虽然这些函数实现可以返回任意类型的值，**但对于调用结果的类型，仍然是 void**

看起来这是一种很奇怪的、错误的行为，但实际上，我们日常开发中的很多代码都需要这一“不正确的”行为才不会报错，比如以下这个例子：

```ts
const arr: number[] = [];
const list: number[] = [1, 2, 3];

list.forEach((item) => arr.push(item));
```

这是我们常用的简写方式，然而，push 方法的返回值是一个 number 类型（push 后数组的长度），而 forEach 的上下文类型声明中要求返回值是 void 类型。如果此时 void 类型真的不允许任何返回值，那这里我们就需要多套一个代码块才能确保类型符合了。

对于一个 void 类型的函数，我们真的会去消费它的返回值吗？既然不会，那么它想返回什么，全凭它乐意就好了。我们还可以用另一种方式来描述这个概念：你可以**将返回值非 void 类型的函数（() => list.push()）作为返回值类型为 void 类型（arr.forEach）的函数类型参数**。

## 扩展

### 将更少参数的函数赋值给具有更多参数的函数类型

看完了

# 15. 函数类型：协变与逆变的比较

函数类型有类型层级吗？ 如果有，它的类型层级又是怎么样的？

## 如何比较函数的类型

示例，给出三个具有层级关系的类，分别代表动物、狗、柯基。

```ts
class Animal {
  asPet() {}
}

class Dog extends Animal {
  bark() {}
}

class Corgi extends Dog {
  cute() {}
}
```

对于一个接受 Dog 类型并返回 Dog 类型的函数，我们可以这样表示：

```ts
type DogFactory = (args: Dog) => Dog;
```

在本文中，我们进一步将其简化为：`Dog -> Dog` 的表达形式。

对于函数类型比较，实际上我们要比较的即是参数类型与返回值类型（也只能是这俩位置的类型）。对于 Animal、Dog、Corgi 这三个类，如果将它们分别可重复地放置在参数类型与返回值类型处（相当于排列组合），就可以得到以下这些函数签名类型：

这里的结果中不包括 Dog -> Dog，因为我们要用它作为基础来被比较

```
Animal -> Animal

Animal -> Dog

Animal -> Corgi

Dog -> Dog

Dog -> Animal

Dog -> Corgi

Corgi -> Animal

Corgi -> Dog

Corgi -> Corgi
```

直接比较完整的函数类型并不符合我们的思维直觉，因此我们需要引入一个辅助函数：它接收一个 Dog -> Dog 类型的参数：

```ts
function transformDogAndBark(dogFactory: DogFactory) {
  const dog = dogFactory(new Dog());
  dog.bark();
}
```

对于函数参数，实际上类似于我们在类型系统层级时讲到的，**如果一个值能够被赋值给某个类型的变量，那么可以认为这个值的类型为此变量类型的子类型**。

如一个简单接受 Dog 类型参数的函数：

```ts
function makeDogBark(dog: Dog) {
  dog.bark();
}
```

它在调用时只可能接受 Dog 类型或 Dog 类型的子类型，而不能接受 Dog 类型的父类型：

```ts
makeDogBark(new Corgi()); // 没问题
makeDogBark(new Animal()); // 不行
```

相对严谨地说，这是因为派生类（即子类）会保留基类的属性与方法，因此说其与基类兼容，但基类并不能未卜先知的拥有子类的方法。

> 里氏替换原则：子类可以扩展父类的功能，但不能改变父类原有的功能，子类型（subtype）必须能够替换掉他们的基类型（base type）。

回到这个函数，这个函数会实例化一只狗狗，并传入 Factory（就像宠物美容），然后让它叫唤两声。实际上，这个函数同时约束了此类型的参数与返回值。首先，我只会传入一只正常的狗狗，但它不一定是什么品种。其次，你返回的必须也是一只狗狗，我并不在意它是什么品种。

观察以上排除方式的结论：

- 参数类型允许为 Dog 的父类型，不允许为 Dog 的子类型。
- 返回值类型允许为 Dog 的子类型，不允许为 Dog 的父类型。

这里用来比较的两个函数类型，其实就是把具有父子关系的类型放置在参数位置以及返回值位置上，**最终函数类型的关系直接取决于类型的父子关系**。

## 协变与逆变

考虑 Corgi ≼ Dog ≼ Animal，当有函数类型 Dog -> Dog，仅有 (Animal → Corgi) ≼ (Dog → Dog) 成立（即能被视作此函数的子类型，）。这里的参数类型与返回值类型实际上可以各自独立出来看：

考虑 Corgi ≼ Dog，假设我们对其进行返回值类型的函数签名类型包装，则有 (T → Corgi) ≼ (T → Dog)，也即是说，在我需要狗狗的地方，柯基都是可用的。**即不考虑参数类型的情况，在包装为函数签名的返回值类型后，其子类型层级关系保持一致。**

考虑 Dog ≼ Animal，如果换成参数类型的函数签名类型包装，则有 (Animal -> T) ≼ (Dog -> T)，也即是说，在我需要条件满足是动物时，狗狗都是可用的。**即不考虑返回值类型的情况，在包装为函数签名的参数类型后，其子类型层级关系发生了逆转。**

实际上，这就是 TypeScript 中的**协变（ covariance ）** 与**逆变（ contravariance ）**在函数签名类型中的表现形式。这两个单词最初来自于几何学领域中：**随着某一个量的变化，随之变化一致的即称为协变，而变化相反的即称为逆变**。

用 TypeScript 的思路进行转换，即如果有 A ≼ B ，协变意味着 Wrapper<A> ≼ Wrapper<B>，而逆变意味着 Wrapper<B> ≼ Wrapper<A>。

而在这里的示例中，变化（Wrapper）即指从单个类型到函数类型的包装过程，我们可以使用工具类型来实现独立的包装类型（独立指对参数类型与返回值类型）：

```ts
type AsFuncArgType<T> = (arg: T) => void;
type AsFuncReturnType<T> = (arg: unknown) => T;
```

再使用这两个包装类型演示我们上面的例子：

```ts
// 1 成立：(T -> Corgi) ≼ (T -> Dog)
type CheckReturnType = AsFuncReturnType<Corgi> extends AsFuncReturnType<Dog>
  ? 1
  : 2;

// 2 不成立：(Dog -> T) ≼ (Animal -> T)
type CheckArgType = AsFuncArgType<Dog> extends AsFuncArgType<Animal> ? 1 : 2;
```

进行一个总结：**函数类型的参数类型使用子类型逆变的方式确定是否成立，而返回值类型使用子类型协变的方式确定**。

基于协变逆变地检查并不是始终启用的（毕竟 TypeScript 在严格检查全关与全开的情况下，简直像是两门语言），我们需要通过配置来开启。

## TSConfig 中的 StrictFunctionTypes

**在比较两个函数类型是否兼容时，将对函数参数进行更严格的检查（When enabled, this flag causes functions parameters to be checked more correctly）**，而实际上，这里的更严格指的即是 对函数参数类型启用逆变检查

在默认情况下，对函数参数的检查采用 **双变（ bivariant ）** ，即**逆变与协变都被认为是可接受的**

还是以我们的三个类为例，首先是一个函数以及两个函数类型签名：

```ts
function fn(dog: Dog) {
  dog.bark();
}

type CorgiFunc = (input: Corgi) => void;
type AnimalFunc = (input: Animal) => void;
```

我们通过赋值的方式来实现对函数类型的比较：

```ts
const func1: CorgiFunc = fn;
const func2: AnimalFunc = fn;
```

还记得吗？如果赋值成立，说明 fn 的类型是 CorgiFunc / AnimalFunc 的子类型

这两个赋值实际上等价于：

```
(Dog -> T) ≼ (Corgi -> T)
(Dog -> T) ≼ (Animal -> T)
```

结合上面所学，我们很明显能够发现第二种应当是不成立的。但在禁用了 strictFunctionTypes 的情况下，TypeScript 并不会抛出错误。这是因为，在默认情况下，对函数参数的检查采用 双变（ bivariant ） ，即逆变与协变都被认为是可接受的。

在 TypeScript ESLint 中，有这么一条规则：method-signature-style，它的意图是约束在接口中声明方法时，需要使用 property 而非 method 形式：

```ts
// method 声明
interface T1 {
  func(arg: string): number;
}

// property 声明
interface T2 {
  func: (arg: string) => number;
}
```

进行如此约束的原因即，对于 property 声明，才能在开启严格函数类型检查的情况下享受到基于逆变的参数类型检查。

对于 method 声明（以及构造函数声明），其无法享受到这一更严格的检查的原因则是对于如 Array 这样的内置定义，我们希望它的函数方法就是以协变的方式进行检查，举个栗子，Dog[] ≼ Animal[] 是否成立？

我们并不能简单的比较 Dog 与 Animal，而是要将它们视为两个完整的类型比较，即 Dog[] 的每一个成员（属性、方法）是否都能对应的赋值给 Animal[] ？

`Dog[].push ≼ Animal[].push` 是否成立？

由 push 方法的类型签名进一步推导，`Dog -> void ≼ Animal -> void` 是否成立？

`Dog -> void ≼ Animal -> void` 在逆变的情况下意味着 `Animal ≼ Dog`，而这很明显是不对的！

简单来说， `Dog -> void ≼ Animal -> void` 是否成立本身就为 `Dog[] ≼ Animal[]` 提供了一个前提答案。

因此，如果 TypeScript 在此时仍然强制使用参数逆变的规则进行检查，那么` Dog[] ≼ Animal[]` 就无法成立，也就意味着无法将 Dog 赋值给 Animal，这不就前后矛盾了吗？所以在大部分情况下，我们确实希望方法参数类型的检查可以是双变的，这也是为什么它们的声明中类型结构使用 method 方式来声明：

```ts
interface Array<T> {
  push(...items: T[]): number;
}
```

大概懂，没完全明白。函数参数逆变，函数返回值协变。有时候需要是双变的。

## 总结

如何对两个函数类型进行兼容性比较这一问题：比较它们的参数类型是否是反向的父子类型关系，返回值是否是正向的父子类型关系。

判断参数类型是否遵循类型逆变，返回值类型是否遵循类型协变

## 扩展

### 联合类型与兄弟类型下的比较

在上面我们只关注了显式的父子类型关系，实际上在类型层级中还有隐式的父子类型关系（联合类型）以及兄弟类型（同一基类的两个派生类）。

对于隐式的父子类型其可以仍然沿用显式的父子类型协变与逆变判断。

对于兄弟类型，比如 Dog 与 Cat，需要注意的是**它们根本就不满足逆变与协变的发生条件（父子类型）**，因此 (Cat -> void) ≼ (Dog -> void) （或者反过来）无论在严格检查与默认情况下均不成立。

### 非函数签名包装类型的变换

如果我们考虑类似数组这种包装类型呢？比如直接一个简单的笼子 Cage ？

先不考虑 Cage 内部的实现，只知道它同时只能放一个物种的动物，Cage<Dog> 能被作为 Cage<Animal> 的子类型吗？对于这一类型的比较，我们可以直接用实际场景来代入：

- 假设我需要一笼动物，但并不会对它们进行除了读以外的操作，那么你给我一笼狗我也是没问题的，但你不能给我一笼植物。也就意味着，此时 List 是 readonly 的，而 Cage<Dog> ≼ Cage<Animal> 成立。**即在不可变的 Wrapper 中，我们允许其遵循协变**。

- 假设我需要一笼动物，并且会在其中新增其他物种，比如兔子啊王八，这个时候你给我一笼兔子就不行了，因为这个笼子只能放狗，放兔子进行可能会变异（？）。也就意味着，此时 List 是 writable 的，而 Cage<Dog> Cage<Rabit> Cage<Turtle> 彼此之间是互斥的，我们称为 **不变（invariant）**，用来放狗的笼子绝不能用来放兔子，即无法进行分配。

- 如果我们再修改下规则，现在一个笼子可以放任意物种的动物，狗和兔子可以放一个笼子里，这个时候任意的笼子都可以放任意的物种，放狗的可以放兔子，放兔子的也可以放狗，即可以互相分配，我们称之为**双变（Bivariant）**。

也就是说，包装类型的表现与我们实际需要的效果是紧密关联的。
