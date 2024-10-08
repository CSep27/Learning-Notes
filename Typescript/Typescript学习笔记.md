# 说明

- 本笔记记录一些学习 Typescript 时的基础知识点

## 教程

- [Typescript 入门教程](https://ts.xcatliu.com/) —— 已看完
- [深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/) —— 还没看
- [TypeScript 教程 ——阮一峰](https://wangdoc.com/typescript/) —— 没看，可以用来查询
- [TypeScript 中文文档](https://www.tslang.cn/docs/home.html)

# 学习笔记

## 知识点

### 接口（Interfaces）

- 用接口（Interfaces）来定义对象的类型。
- 可以用于对「对象的形状（Shape）」进行描述

#### 示例

- 定义一个接口 Person，其中有两个属性，name 类型为 string，并且必须要有；可选属性 age，类型为 number
- `[propName: string]: any;` 表示属性名为 string，属性值为任意类型。这个接口可以有任意的属性
- **如果定义了任意属性，那么确定属性和可选属性的类型都必须是它的类型的子集：**

```ts
interface Person {
  name: string;
  age?: number;
  [propName: string]: string | number; // 属性值类型必须包含以上属性值的类型
  // [propName: string]: any;
  readonly id: number; // 只读属性
}
let tom: Person = {
  name: "Tom",
};
```

### 函数的类型

- 函数声明：sum 函数，参数 x 和 y 都是 number，返回值为 number

```ts
// 函数声明
function sum(x: number, y: number): number {
  return x + y;
}
```

- 函数表达式，手动给 mySum 添加类型
- `(x: number, y: number) => number`，是一个函数定义，=>左边是输入类型，用括号括起来，右边是输出类型

```ts
let mySum: (x: number, y: number) => number = function (
  x: number,
  y: number
): number {
  return x + y;
};
```

#### 接口中定义函数

- SearchFunc 接口中有一个函数，函数有两个 string 参数，返回值为 boolean 类型

```ts
interface SearchFunc {
  (source: string, subString: string): boolean;
}

let mySearch: SearchFunc;
mySearch = function (source: string, subString: string) {
  return source.search(subString) !== -1;
};
```

#### 函数重载

指在同一个作用域内定义了多个同名函数，这些同名函数的参数类型或数量不同。当调用这个同名函数时，编译器会根据传入的参数类型或数量来决定应该调用哪个函数。

1. 声明两个同名函数

```ts
declare function func(name: string): string;
declare function func(name: number): number;
```

2. 用 interface 的方式声明函数重载：

```ts
interface Func2 {
  (name: string): string;
  (name: number): number;
}

declare const func2: Func2;
```

3. 函数类型取交叉类型，也就是函数重载的意思

```ts
type Func3 = ((name: string) => string) & ((name: number) => number);
declare const func3: Func3;
```

资料：[TS 函数类型重载还可以动态生成](zhuanlan.zhihu.com/p/496792140)

### 数组的类型

```ts
// 「类型 + 方括号」表示法
let fibonacci: number[] = [1, 1, 2, 3, 5];
// 数组泛型（Array Generic） Array<elemType>
let fibonacci: Array<number> = [1, 1, 2, 3, 5];
// 用接口表示数组
interface NumberArray {
  [index: number]: number;
}
let fibonacci: NumberArray = [1, 1, 2, 3, 5];
```

### 类型断言（Type Assertion）

- 语法：`值 as 类型`
- 可以用来手动指定一个值的类型。

### 声明

- 当使用第三方库时，我们需要引用它的声明文件，才能获得对应的代码补全、接口提示等功能。

### 类

- TS 中三种访问修饰符`public`、`private` 和 `protected`；用来修饰属性或方法
- 抽象类`abstract`，抽象类不允许被实例化，抽象类中的抽象方法必须被子类实现

### 类和接口

- 实现（implements），一般来讲，一个类只能继承自另一个类，有时候不同类之间可以有一些共有的特性，这时候就可以把特性提取成接口（interfaces），用 `implements` 关键字来实现。
- 举例来说，门是一个类，防盗门是门的子类。如果防盗门有一个报警器的功能，我们可以简单的给防盗门添加一个报警方法。这时候如果有另一个类，车，也有报警器的功能，就可以考虑把报警器提取出来，作为一个接口，防盗门和车都去实现它
- 一个类可以实现多个接口
- 接口与接口之间可以是继承关系
- TS 中接口可以继承类。当我们在声明 `class Point` 时，除了会创建一个名为 `Point` 的类之外，同时也创建了一个名为 `Point` 的类型（实例的类型）。所以实际上接口继承的是类实例的类型（实例的类型不包含构造函数、静态属性和方法，只包含实例属性和方法）。

### 泛型

- 在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性

#### 示例

- 函数 createArray，它可以创建一个指定长度的数组，同时将每一项都填充一个默认值，
- 返回值是一个数组，但是数组中元素的类型是不确定的，可以用`Array<any>`。但是实际上数组中元素的类型和输入 value 类型是一致的，这时候就需要使用泛型。
- 在函数名后添加了 <T>，其中 T 用来指代任意输入的类型，在后面的输入 value: T 和输出 Array<T> 中即可使用了。

- 函数第一个参数 length 是 number 类型，第二个参数 value 类型不固定，指定为泛型 T。返回的值类型为 Array，其中的值类型与 value 一致，为泛型 T。在函数内部，定义 result 时，指定类型为 T
- 调用 createArray 时，此时确定了 value 的类型为 string

```ts
function createArray<T>(length: number, value: T): Array<T> {
  let result: T[] = [];
  for (let i = 0; i < length; i++) {
    result[i] = value;
  }
  return result;
}

createArray<string>(3, "x"); // ['x', 'x', 'x']
```

### 声明合并

- 函数的合并，使用重载定义多个函数类型
- 接口的合并，接口属性会简单合并到一个接口中，合并的属性的类型必须是唯一的。接口中方法的合并和函数的合并一样
- 类的合并和接口合并规则一致

## vue 中的声明

```ts
interface Vue {
  // 只读属性$el，类型为Element
  readonly $el: Element;
  // ?
  readonly $options: ComponentOptions<Vue>;
  readonly $parent: Vue;
  readonly $root: Vue;
  readonly $children: Vue[];
  // 只读属性$refs，类型为对象，对象属性名为string，属性值为Vue或Element或数组（元素类型为Vue或Element）或undefined
  readonly $refs: {
    [key: string]: Vue | Element | (Vue | Element)[] | undefined;
  };
  readonly $slots: { [key: string]: VNode[] | undefined };
  readonly $scopedSlots: { [key: string]: NormalizedScopedSlot | undefined };
  readonly $isServer: boolean;
  // ?
  readonly $data: Record<string, any>;
  readonly $props: Record<string, any>;
  readonly $ssrContext: any;
  readonly $vnode: VNode;
  readonly $attrs: Record<string, string>;
  readonly $listeners: Record<string, Function | Function[]>;

  // $mount函数，可选参数elementOrSelector类型为Element或 string，返回this
  $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
  // 函数没有返回值
  $forceUpdate(): void;
  $destroy(): void;
  $set: typeof Vue.set;
  $delete: typeof Vue.delete;
  // 返回函数，函数没有返回值
  $watch(
    expOrFn: string,
    callback: (this: this, n: any, o: any) => void,
    options?: WatchOptions
  ): () => void;
  $watch<T>(
    expOrFn: (this: this) => T,
    callback: (this: this, n: T, o: T) => void,
    options?: WatchOptions
  ): () => void;
  $on(event: string | string[], callback: Function): this;
  $once(event: string | string[], callback: Function): this;
  $off(event?: string | string[], callback?: Function): this;
  $emit(event: string, ...args: any[]): this;
  $nextTick(callback: (this: this) => void): void;
  $nextTick(): Promise<void>;
  $createElement: CreateElement;
}
```

## tsconfig.json

typescript 的编译配置文件

### declaration

- `"declaration": true,`，编译时自动生成.d.ts。
- `"declarationDir": "dist"`指定.d.ts 文件的输出地址。

# [三斜线指令](https://wangdoc.com/typescript/d.ts#%E4%B8%89%E6%96%9C%E6%9D%A0%E5%91%BD%E4%BB%A4)

三斜线指令是包含单个 XML 标签的单行注释。 注释的内容会做为编译器指令使用。

三斜线指令仅可放在包含它的文件的最顶端。 一个三斜线指令的前面只能出现单行或多行注释，或其它的三斜线指令。

如果它们出现在一个语句或声明之后，那么它们会被当做普通的单行注释，并且不具有特殊的涵义。

`/// <reference path="..." />`指令它用于声明文件间的依赖。

`/// <reference types="..." />`指令声明了对某个包的依赖。

对这些包的名字的解析与在 import 语句里对模块名的解析类似。可以简单地把三斜线类型引用指令当做 import 声明的包。

例如，把 `/// <reference types="node" />`引入到声明文件，表明这个文件使用了 @types/node/index.d.ts 里面声明的名字；并且，这个包需要在编译阶段与声明文件一起被包含进来。

仅当在你需要写一个 d.ts 文件时才使用这个指令。

## 应用在 vue3 中

Vite 默认的类型定义是写给它的 Node.js API 的。要将其补充到一个 Vite 应用的客户端代码环境中，请添加一个 d.ts 声明文件：

```ts
/// <reference types="vite/client" />
```

[vite-typescript](https://vitejs.cn/vite3-cn/guide/features.html#typescript)

types 参数用来告诉编译器当前脚本依赖某个 DefinitelyTyped 类型库，通常安装在 node_modules/@types 目录。

types 参数的值是类型库的名称，也就是安装到 node_modules/@types 目录中的子目录的名字。

# d.ts 类型声明文件

单独使用的模块，一般会同时提供一个单独的类型声明文件（declaration file），把本模块的外部接口的所有类型都写在这个文件里面，便于模块使用者了解接口，也便于编译器检查使用者的用法是否正确。

类型声明文件里面只有类型代码，没有具体的代码实现。它的文件名一般为[模块名].d.ts 的形式，其中的 d 表示 declaration（声明）。

## 类型声明文件来源

类型声明文件主要有以下三种来源。

- TypeScript 编译器自动生成。
- TypeScript 内置类型文件。
- 外部模块的类型声明文件，需要自己安装。

### 自动生成

在 tsconfig.json 文件里配置。

```json
{
  "compilerOptions": {
    "declaration": true, // 编译时自动生成.d.ts。
    "declarationDir": "dist" // 指定.d.ts 文件的输出地址。
  }
}
```

### 内置声明文件

安装 TypeScript 语言时，会同时安装一些内置的类型声明文件，主要是内置的全局对象（JavaScript 语言接口和运行环境 API）的类型声明。

这些内置声明文件位于 TypeScript 语言安装目录的 lib 文件夹内

使用编译选项 lib，指定加载哪些内置声明文件。

```ts
{
  "compilerOptions": {
    "lib": ["dom", "es2021"]
  }
}
```

### 外部类型声明文件

https://wangdoc.com/typescript/d.ts#%E5%A4%96%E9%83%A8%E7%B1%BB%E5%9E%8B%E5%A3%B0%E6%98%8E%E6%96%87%E4%BB%B6
