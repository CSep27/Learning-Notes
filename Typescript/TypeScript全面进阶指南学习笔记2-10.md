# 说明

掘金小册《TypeScript 全面进阶指南》学习笔记

第 2-10 节

按照小册的结构学习，运行案例

# 2. 工欲善其事：打造最舒适的 TypeScript 开发环境

## VS Code 配置与插件

### 推荐插件

- TypeScript Importer
- Move TS
- ErrorLens 把 VSCode 底部问题栏的错误下直接显示到代码文件中的对应位置

### 内置配置

1. Ctrl(Command) + Shift + P 打开命令面板
2. Open Workspace Settings
3. 搜索 'typescript Inlay Hints'
4. 按需开启配置，推荐如下配置：
   - Function Like Return Types，显示推导得到的函数返回值类型；
   - Parameter Names，显示函数入参的名称；
   - Parameter Types，显示函数入参的类型；
   - Variable Types，显示变量的类型。

## TS 文件的快速执行：ts-node 与 ts-node-dev

### ts-node

- 全局安装 ts-node 和 typescript：`npm i ts-node typescript -g`
- 在项目中执行以下命令创建 TypeScript 的项目配置文件： tsconfig.json。
  ```ts
  npx --package typescript tsc --init
  // 如果全局安装了 TypeScript，可以这么做
  tsc --init
  ```
- ts-node 执行文件：`ts-node index.ts`
- 通过命令行进行常用配置的方式：
  - -P,--project：指定你的 tsconfig 文件位置。默认情况下 ts-node 会查找项目下的 tsconfig.json 文件，如果你的配置文件是 tsconfig.script.json、tsconfig.base.json 这种，就需要使用这一参数来进行配置了。
  - -T, --transpileOnly：禁用掉执行过程中的类型检查过程，这能让你的文件执行速度更快，且不会被类型报错卡住。这一选项的实质是使用了 TypeScript Compiler API 中的 transpileModule 方法，我们会在后面的章节详细讲解。
  - --swc：在 transpileOnly 的基础上，还会使用 swc 来进行文件的编译，进一步提升执行速度。
  - --emit：如果你不仅是想要执行，还想顺便查看下产物，可以使用这一选项来把编译产物输出到 .ts-node 文件夹下（需要同时与 --compilerHost 选项一同使用）。

### ts-node-dev

- 自动地监听文件变更然后重新执行，类似于 nodemon
- `npm i ts-node-dev -g`
- `ts-node-dev --respawn --transpile-only app.ts` respawn 选项启用了监听重启的能力，而 transpileOnly 提供了更快的编译速度。

## 更方便的类型兼容性检查

- 通过类型声明（declare）
- tsd 库

## require extension

- require.extension node.js 提供的一个功能，但是已废弃
- node 中还支持以扩展的形式来提供自定义扩展名的模块加载机制，这也是 ts-node、require-ts （允许你去 require 一个 TS 文件）这些工具库的工作原理，它们的核心逻辑其实都是通过 require.extension，注册了 .ts 文件的处理逻辑

# 3. 理解原始类型与对象类型

## 原始类型的类型标注

[原始类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures#%E5%8E%9F%E5%A7%8B%E5%80%BC_primitive_values)

```ts
const name: string = "linbudu";
const age: number = 24;
const male: boolean = false;
const undef: undefined = undefined;
const nul: null = null;
const bigintVar1: bigint = 9007199254740991n;
const bigintVar2: bigint = BigInt(9007199254740991);
const symbolVar: symbol = Symbol("unique");
```

### null 与 undefined

JS 中，null 与 undefined 分别表示“这里有值，但是个空值”和“这里没有值”。

TS 中，null 与 undefined 类型都是有具体意义的类型。在没有开启 strictNullChecks 检查的情况下，会被视作其他类型的子类型

### void

JS 中，void 操作符会执行后面跟着的表达式并返回一个 undefined

TS 中，void 用于描述一个内部没有 return 语句，或者没有显式 return 一个值的函数的返回值

## 数组的类型标注

某些情况下，使用 元组（Tuple） 来代替数组要更加妥当。比如能确定这个数组中只有三个成员，并希望在越界访问时给出类型报错。

```ts
const arr4: [string, string, string] = ["lin", "bu", "du"];
// Tuple type '[string, string, string]' of length '3' has no element at index '599'.
console.log(arr4[599]);
```

- 元组内部可以声明多个与其位置强绑定的，不同类型的元素
- 元组支持在某一个位置上的可选成员
- 支持具名元组（Labeled Tuple Elements）
- 隐式的越界访问也会警告

```ts
const arr6: [string, number?, boolean?] = ["linbudu"];
type TupleLength = typeof arr6.length; // 1 | 2 | 3

const arr7: [name: string, age: number, male?: boolean] = [
  "linbudu",
  599,
  true,
];

const arr5: [string, number, boolean] = ["linbudu", 599, true];

// Tuple type '[string, (number | undefined)?, (boolean | undefined)?]' of length '3' has no element at index '3'.
const [name, age, male, other] = arr5;
```

### 只读数组/元组

- 只能将整个数组/元组标记为只读，
- 只读数组/元组的类型上，将不再具有 push、pop 等方法（即会修改原数组的方法）
- 只读数组/元组的类型实际上变成了 ReadonlyArray，而不再是 Array

## 对象的类型标注

TS 中，使用 interface 描述对象类型

- 每一个属性的值必须一一对应到接口的属性类型
- 不能有多的属性，也不能有少的属性，包括直接在对象内部声明，或是 obj1.other = 'xxx' 这样属性访问赋值的形式

### 修饰接口属性

- ? 来标记一个属性为可选
- readonly 只读，防止对象的属性被再次赋值

### type 与 interface

- interface 用来描述对象、类的结构，
- type 类型别名用来将一个函数签名、一组联合类型、一个工具类型等等抽离成一个完整独立的类型。
- 但大部分场景下接口结构都可以被类型别名所取代

### object、Object 以及 {}（一个空对象）

#### Object

JS 中，原型链的顶端是 Object 以及 Function，这也就意味着所有的原始类型与对象类型最终都指向 Object

TS 中，就表现为 Object 包含了所有的类型

和 Object 类似的还有 Boolean、Number、String、Symbol，这几个装箱类型（Boxed Types） 同样包含了一些超出预期的类型。以 String 为例，它同样包括 undefined、null、void，以及代表的 拆箱类型（Unboxed Types） string，但并不包括其他装箱类型对应的拆箱类型，如 boolean 与 基本对象类型

```ts
const tmp9: String = undefined;
const tmp10: String = null;
const tmp11: String = void 0;
const tmp12: String = "linbudu";

// 以下不成立，因为不是字符串类型的拆箱类型
const tmp13: String = 599; // X
const tmp14: String = { name: "linbudu" }; // X
const tmp15: String = () => {}; // X
const tmp16: String = []; // X
```

**在任何情况下，你都不应该使用这些装箱类型。**

#### object

object 的引入就是为了解决对 Object 类型的错误使用，它代表所有非原始类型的类型，即数组、对象与函数类型这些：

#### {}（一个空对象）

可以认为{}就是一个对象字面量类型（对应到字符串字面量类型这样）。否则，你可以认为使用{}作为类型签名就是一个合法的，但内部无属性定义的空对象，这类似于 Object（想想 new Object()），它意味着任何非 null / undefined 的值

虽然能够将其作为变量的类型，但你实际上无法对这个变量进行任何赋值操作：

#### 总结

- 在任何时候都不要，不要，不要使用 Object 以及类似的装箱类型。
- 当你不确定某个变量的具体类型，但能确定它不是原始类型，可以使用 object。但我更推荐进一步区分，也就是使用 Record<string, unknown> 或 Record<string, any> 表示对象，unknown[] 或 any[] 表示数组，(...args: any[]) => any 表示函数这样。
- 我们同样要避免使用{}。{}意味着任何非 null / undefined 的值，从这个层面上看，使用它和使用 any 一样恶劣。

## 扩展阅读 —— unique symbol

- Symbol 在 JavaScript 中代表着一个唯一的值类型，它类似于字符串类型，可以作为对象的属性名，并用于避免错误修改 对象 / Class 内部属性的情况。
- 而在 TypeScript 中，symbol 类型并不具有这一特性，一百个具有 symbol 类型的对象，它们的 symbol 类型指的都是 TypeScript 中的同一个类型。
- 为了实现“独一无二”这个特性，TypeScript 中支持了 unique symbol 这一类型声明，它是 symbol 类型的子类型，每一个 unique symbol 类型都是独一无二的。

# 4. 掌握字面量类型与枚举，让你的类型再精确一些

## 字面量类型与联合类型

```ts
interface Res {
  code: 10000 | 10001 | 50000;
  status: "success" | "failure";
  data: any;
}
```

## 字面量类型

字面量类型主要包括字符串字面量类型、数字字面量类型、布尔字面量类型和对象字面量类型，它们可以直接作为类型标注：

```ts
// 报错！不能将类型“"linbudu599"”分配给类型“"linbudu"”。
const str1: "linbudu" = "linbudu599";

const str2: string = "linbudu";
const str3: string = "linbudu599";
```

原始类型的值可以包括任意的同类型值，而字面量类型要求的是值级别的字面量一致。

### 对象字面量类型

对象字面量类型就是一个对象类型的值。当然，这也就意味着这个对象的值全都为字面量值：
使用较少

```ts
interface Tmp {
  obj: {
    name: "linbudu";
    age: 18;
  };
}

const tmp: Tmp = {
  obj: {
    name: "linbudu",
    age: 18,
  },
};
```

## 联合类型

一组类型的可用集合，只要最终赋值的类型属于联合类型的成员之一，就可以认为符合这个联合类型。

- 对于联合类型中的函数类型，需要使用括号()包裹起来
- 函数类型并不存在字面量类型，因此这里的 (() => {}) 就是一个合法的函数类型
- 你可以在联合类型中进一步嵌套联合类型，但这些嵌套的联合类型最终都会被展平到第一级中

常用场景之一是通过多个对象类型的联合，来实现手动的互斥属性，即这一属性如果有字段 1，那就没有字段 2：

```ts
interface Tmp {
  user:
    | {
        vip: true;
        expires: string;
      }
    | {
        vip: false;
        promotion: string;
      };
}

declare var tmp: Tmp;

if (tmp.user.vip) {
  console.log(tmp.user.expires);
}
```

## 枚举

```ts
enum PageUrl {
  Home_Page_Url = "url1",
  Setting_Page_Url = "url2",
  Share_Page_Url = "url3",
}

const home = PageUrl.Home_Page_Url;
```

枚举和对象的重要差异在于，对象是单向映射的，我们只能从键映射到键值。而枚举是双向映射的，即你可以从枚举成员映射到枚举值，也可以从枚举值映射到枚举成员。

注意：仅有值为数字的枚举成员才能够进行这样的双向枚举，字符串枚举成员仍然只会进行单次映射。

```ts
// 没有给定值得话，默认值从0开始依次递增
enum Items {
  Foo,
  Bar,
  Baz,
}

const fooValue = Items.Foo; // 0
const fooKey = Items[0]; // "Foo"
```

### 常量枚举

常量枚举和枚举相似，只是其声明多了一个 const：

```ts
const enum Items {
  Foo,
  Bar,
  Baz,
}

const fooValue = Items.Foo; // 0
```

对于常量枚举，只能通过枚举成员访问枚举值（而不能通过值访问成员）。同时，在编译产物中并不会存在一个额外的辅助对象（如上面的 Items 对象），对枚举成员的访问会被直接内联替换为枚举的值。

# 函数与 Class 中的类型：详解函数重载与面向对象

## 函数

### 函数的类型签名

函数的类型就是描述了函数入参类型与函数返回值类型

要么直接在函数中进行参数和返回值的类型声明，要么使用类型别名将函数声明抽离出来

如果只是为了描述这个函数的类型结构，还可以使用 interface 来进行函数声明，这时的 interface 被称为 Callable Interface

```ts
function foo(str: string): number {
  return name.length;
}

// 这里的箭头函数是TS中的函数类型签名
type FuncFoo = (name: string) => number;
const foo: FuncFoo = (name) => {
  return name.length;
};

interface FuncFooStruct {
  (name: string): number;
}
const foo: FuncFooStruct = (name) => {
  return name.length;
};
```

### void 类型

在 TypeScript 中，一个没有返回值（即没有调用 return 语句）的函数，其返回类型应当被标记为 void 而不是 undefined，即使它实际的值是 undefined。

在 TypeScript 中，undefined 类型是一个实际的、有意义的类型值，而 void 才代表着空的、没有意义的类型值。

```ts
// 没有调用 return 语句使用void
function foo(): void {}

// 调用了 return 语句，但没有返回值
// 这里更好的方式是使用undefined
function bar(): void {
  return;
}
```

### 可选参数与 rest 参数

`?`表示可选参数，可选参数必须位于必选参数之后

```ts
// age有默认值，肯定是可选参数，也可以不用?了
function foo(name: string, age: number = 18): number {
  const inputAge = age || 18;
  return name.length + inputAge;
}
```

rest 实际上是一个数组，应该使用数组或者元组类型进行标注

```ts
function foo2(arg1: string, ...rest: [number, string]) {
  console.log(arg1, rest);
}
foo2("1", 2, "3");
```

### 重载

当函数的返回类型基于其入参的值时，可以使用函数重载签名（Overload Signature）

```ts
// 重载签名一，传入 bar 的值为 true 时，函数返回值为 string 类型。
function func(foo: number, bar: true): string;
// 重载签名二，不传入 bar，或传入 bar 的值为 false 时，函数返回值为 number 类型。
function func(foo: number, bar?: false): number;
// 函数的实现签名，会包含重载签名的所有可能情况。
function func(foo: number, bar?: boolean): string | number {
  if (bar) {
    return String(foo);
  } else {
    return foo * 599;
  }
}
console.log(func(599)); // number
console.log(func(599, true)); // string
console.log(func(599, false)); // number
```

这里有一个需要注意的地方，拥有多个重载声明的函数在被调用时，是按照重载的声明顺序往下查找的。因此在第一个重载声明中，为了与逻辑中保持一致，即在 bar 为 true 时返回 string 类型，这里我们需要将第一个重载声明的 bar 声明为必选的字面量类型。

实际上，TypeScript 中的重载更像是伪重载，它只有一个具体实现，其重载体现在方法调用的签名上而非具体实现上。而在如 C++ 等语言中，重载体现在多个名称一致但入参不同的函数实现上，这才是更广义上的函数重载。

### 异步函数、Generator 函数等类型签名

参数签名基本一致，而返回值类型则稍微有些区别

对于异步函数（即标记为 async 的函数），其返回值必定为一个 Promise 类型，而 Promise 内部包含的类型则通过泛型的形式书写，即 Promise<T>

```ts
async function asyncFunc(): Promise<void> {}

// 了解即可
function* genFunc(): Iterable<void> {}
async function* asyncGenFunc(): AsyncIterable<void> {}
```

## Class

### 类与类成员的类型签名

主要结构只有构造函数、属性、方法和访问符（Accessor）

```ts
class Foo {
  prop: string;

  constructor(inputProp: string) {
    this.prop = inputProp;
  }

  print(addon: string): void {
    console.log(`${this.prop} and ${addon}`);
  }

  get propA(): string {
    return `${this.prop}+A`;
  }

  set propA(value: string) {
    this.prop = `${value}+A`;
  }
}
```

setter 方法不允许进行返回值的类型标注，可以理解为 setter 的返回值并不会被消费，它是一个只关注过程的函数。

类的方法同样可以进行函数那样的重载，且语法基本一致

### 修饰符

能够为 Class 成员添加这些修饰符：public / private / protected / readonly。除 readonly 以外，其他三位都属于访问性修饰符，而 readonly 属于操作性修饰符

```ts
class Foo {
  private prop: string;

  constructor(inputProp: string) {
    this.prop = inputProp;
  }

  protected print(addon: string): void {
    console.log(`${this.prop} and ${addon}`);
  }

  public get propA(): string {
    return `${this.prop}+A`;
  }

  public set propA(value: string) {
    this.propA = `${value}+A`;
  }
}
```

- public：此类成员在类、类的实例、子类中都能被访问。
- private：此类成员仅能在类的内部被访问。
- protected：此类成员仅能在类与子类中被访问，你可以将类和类的实例当成两种概念，即一旦实例化完毕（出厂零件），那就和类（工厂）没关系了，即不允许再访问受保护的成员。

> 通常不会对类的构造函数 constructor 添加修饰符，而是让它保持默认的 public。

当你不显式使用访问性修饰符，成员的访问性默认会被标记为 public

可以在构造函数中对参数应用访问性修饰符

```ts
class Foo {
  /* prop: string

  constructor (inputProp: string) {
    this.prop = inputProp
  } */

  // 注释的部分，通过访问性修饰符可以简写成如下格式
  constructor(public prop: string) {}
}

new Foo("linbudu");
```

### 静态成员

static 关键字来标识一个成员为静态成员

静态成员不会被实例继承，它始终只属于当前定义的这个类（以及其子类）

### 继承、实现、抽象类

extends 继承

基类（Base）、派生类（Derived）

```ts
class Base {}

class Derived extends Base {}
```

派生类中可以访问到使用 public 或 protected 修饰符的基类成员。除了访问以外，基类中的方法也可以在派生类中被覆盖，但我们仍然可以通过 super 访问到基类中的方法

在派生类中覆盖基类方法时，并不能确保派生类的这一方法能覆盖基类方法，万一基类中不存在这个方法呢？所以，TypeScript 4.3 新增了 override 关键字，来确保派生类尝试覆盖的方法一定在基类中存在定义

```ts
class Base {
  printWithLove() {}
}

class Derived extends Base {
  // 使用了override 关键字，表示要覆盖基类方法
  // 此时如果基类中不存在这个方法，就会报错
  // This member cannot have an 'override' modifier because it is not declared in the base class 'Base'.
  override print() {
    // ...
  }
}
```

抽象类是对类结构与方法的抽象，简单来说，**一个抽象类描述了一个类中应当有哪些成员（属性、方法等），一个抽象方法描述了这一方法在实际实现中的结构**。我们知道类的方法和函数非常相似，包括结构，因此抽象方法其实描述的就是这个方法的入参类型与返回值类型。

抽象类使用 abstract 关键字声明，抽象类中的成员也需要使用 abstract 关键字才能被视为抽象类成员

```ts
abstract class AbsFoo {
  abstract absProp: string;
  abstract get absGetter(): string;
  abstract absMethod(name: string): string;
}
```

可以实现（implements）一个抽象类，此时，我们**必须完全实现这个抽象类的每一个抽象成员**。需要注意的是，在 TypeScript 中无法声明静态的抽象成员。

```ts
class Foo implements AbsFoo {
  absProp: string = "linbudu";

  get absGetter() {
    return "linbudu";
  }

  absMethod(name: string) {
    return name;
  }
}
```

interface 也可以声明类的结构

这里接口的作用和抽象类一样，都是描述这个类的结构。

```ts
interface FooStruct {
  absProp: string;
  get absGetter(): string;
  absMethod(input: string): string;
}

class Foo implements FooStruct {
  absProp: string = "linbudu";

  get absGetter() {
    return "linbudu";
  }

  absMethod(name: string) {
    return name;
  }
}
```

可以使用 Newable Interface 来描述一个类的结构（类似于描述函数结构的 Callable Interface）

```ts
class Foo {}

interface FooStruct {
  new (): Foo;
}

declare const NewableFoo: FooStruct;

const foo = new NewableFoo();
```

## 扩展 —— SOLID 原则

学过了，但是没有实践过！！！已经忘了！！！

# 6. 探秘内置类型：any、unknown、never 与类型断言

## 内置类型：any 、unknown 与 never

### any

any 任意类型

- 可以在声明后再次接受任意类型的值
- 可以被赋值给任意其它类型的变量
- 可以在 any 类型变量上任意地进行操作，包括赋值、访问、方法调用等等，此时可以认为类型推导与检查是被完全禁用的

```ts
let anyVar: any = "str";
// 声明后修改为其他类型
anyVar = false;
// val1标记为number类型了，但是也可以将any类型的变量赋值给它
const val1: number = anyVar;
console.log(val1);
// 方法调用
anyVar.foo.bar.baz();
```

any 类型的主要意义，其实就是为了表示一个无拘无束的“任意类型”，它能兼容所有类型，也能够被所有类型兼容。

> any 的本质是类型系统中的顶级类型，即 Top Type，这是许多类型语言中的重要概念。

使用技巧：

- 如果是类型不兼容报错导致你使用 any，考虑用类型断言替代，我们下面就会开始介绍类型断言的作用。
- 如果是类型太复杂导致你不想全部声明而使用 any，考虑将这一处的类型去断言为你需要的最简类型。如你需要调用 foo.bar.baz()，就可以先将 foo 断言为一个具有 bar 方法的类型。
- 如果你是想表达一个未知类型，更合理的方式是使用 unknown。

### unknown

与 any 类似，但是并没有放弃所有的类型检查

- 可以再次赋值为任意其它类型
- 只能赋值给 any 与 unknown 类型的变量

```ts
let unknownVar: unknown = "999";
// 再次赋值为其他类型
unknownVar = 888;
console.log(unknownVar);
// 只能赋值给 any 与 unknown 类型的变量
const val2: () => {} = unknownVar; // Error
const val3: any = unknownVar;

// 要对 unknown 类型进行属性访问，需要进行类型断言
unknownVar.foo(); // 报错：对象类型为 unknown
```

在类型未知的情况下，更推荐使用 unknown 标注

### 虚无的 never 类型

never 类型不携带任何的类型信息

void 类型就像 JavaScript 中的 null 一样代表“这里有类型，但是个空类型”。

```ts
// 鼠标移动到UnionWithNever上，只会显示
// type UnionWithNever = true | void | 599 | "linbudu"
type UnionWithNever = "linbudu" | 599 | true | void | never;

declare let v1: never;
declare let v2: void;

v1 = v2; // X 类型 void 不能赋值给类型 never

v2 = v1;
```

在编程语言的类型系统中，never 类型被称为 Bottom Type，是整个类型系统层级中最底层的类型。和 null、undefined 一样，它是所有类型的子类型，但只有 never 类型的变量能够赋值给另一个 never 类型变量。

通常我们不会显式地声明一个 never 类型，它主要被类型检查所使用。但在某些情况下使用 never 确实是符合逻辑的，比如一个只负责抛出错误的函数。

在类型流的分析中，一旦一个返回值类型为 never 的函数被调用，那么下方的代码都会被视为无效的代码（即无法执行到）：

```ts
function justThrow(): never {
  throw new Error();
}

function foo(input: number) {
  if (input > 1) {
    justThrow();
    // 等同于 return 语句后的代码，即 Dead Code
    const name = "linbudu";
  }
}
```

## 类型层级总结

从上层到底层，意味着包含类型信息的多少。顶层的 any 类型包含了任意类型。字符串类型包括任意的字符串字面量类型，字面量类型只表示一个精确的值类型。最底层的 never 就是什么都没有

any/unknown -> 原始类型、对象类型 -> 字面量类型 -> never 类型

## 类型断言：警告编译器不准报错

类型断言能够显式告知类型检查程序当前这个变量的类型，可以进行类型分析地修正、类型。它其实就是一个**将变量的已有类型更改为新指定类型的操作**，它的基本语法是 `as NewType`。

- 可以将 any / unknown 类型断言到一个具体的类型
- 也可以将其他按类型断言为 any
- 可以在联合类型中断言一个具体的分支
- 正确用法：在 TypeScript 类型分析不正确或不符合预期时，将其断言为此处的正确类型
- 需要注意的是，类型断言应当是在迫不得己的情况下使用的

```ts
const str: string = "linbudu";
(str as any).func();

let unknownVar1: unknown;
interface Obj {
  foo: () => void;
}
(unknownVar1 as Obj).foo();
```

### 双重断言

如果在使用类型断言时，原类型与断言类型之间差异过大，TypeScript 会给你一个类型报错。此时它会提醒你先断言到 unknown 类型，再断言到预期类型。

```ts
const str: string = "lin";
// 报错：Conversion of type 'string' to type '{ handler: () => {}; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
(str as { handler: () => {} }).handler();

// 先断言为unknown
(str as unknown as { handler: () => {} }).handler();

// 使用尖括号断言
(<{ handler: () => {} }>(<unknown>str)).handler();
```

### 非空断言

类型断言的简化，使用`!`语法标记前面的一个声明一定是非空的（实际上就是剔除了 null 和 undefined 类型）

```ts
declare const foo7: {
  func?: () => {
    prop?: number | null;
  };
};
// 报错有可能为空
// Cannot invoke an object which is possibly 'undefined'.ts(2722)
// Object is possibly 'null' or 'undefined'.ts(2533)
foo7.func().prop.toFixed();

// 如果仍要调用，使用非空断言
foo7.func!().prop!.toFixed();
```

非空断言应用的位置类似于可选链。但不同的是，非空断言的运行时仍然会保持调用链，因此在运行时可能会报错。而可选链则会在某一个部分收到 undefined 或 null 时直接短路掉，不会再发生后面的调用。

类型断言还有一种用法是作为代码提示的辅助工具：

```ts
interface IStruct {
  foo: string;
  bar: {
    barPropA: string;
    barPropB: number;
    barMethod: () => void;
    baz: {
      handler: () => Promise<void>;
    };
  };
}
// 会提示类型报错，必须实现整个22222222222222222结构
const obj: IStruct = {};

// 如果想保留类型提示，不那么完整的实现结构
// 但是如果配置了eslint规则："@typescript-eslint/consistent-type-assertions": "error",
// 那么还是会报错，会推荐使用上面一种写法
const obj = <IStruct>{
  bar: {},
};
```

# 7. 类型编程好帮手：TypeScript 类型工具（上）

## 类型别名

类型别名的作用主要是对一组类型或一个特定类型结构进行封装，以便于在其它地方复用

```ts
// 联合类型
type StatusCode = 200 | 301 | 400 | 500 | 502;
type PossibleDataTypes = string | number | (() => unknown);

const code: StatusCode = 200;
console.log(code);

// 函数类型
type Handler = (e: Event) => void;
const click: Handler = (e) => {};

// 对象类型
type ObjType = {
  name: string;
  age: string;
};
```

**工具类基于类型别名，只是多了个泛型**，能实现更灵活的类型创建功能。

从这个角度看，工具类型就像一个函数一样，泛型是入参，内部逻辑基于入参进行某些操作，再返回一个新的类型。

泛型参数的名称通常使用大写字母（T / K / U / V / M / O ...）表示，或者写成大驼峰形式（如：NewType）。

```ts
type Factory<T> = T | number | string;
const foo9: Factory<boolean> = true;

// 一般会再度声明一个新的类型别名
type FactoryWithBool = Factory<boolean>;
const foo10: FactoryWithBool = true;

// 声明一个简单、有实际意义的工具类型
// 接受一个类型，并返回一个包括 null 的联合类型
type MaybeNull<T> = T | null;
```

## 联合类型与交叉类型

交叉类型，符号&，`A & B`，需要同时满足 A 与 B 两个类型

```ts
type StrAndNum = string & number; // never

interface Struct1 {
  primitiveProp: string;
  objectProp: {
    name: string;
  };
}

interface Struct2 {
  primitiveProp: number;
  objectProp: {
    age: number;
  };
}

type Composed = Struct1 & Struct2;
type PrimitivePropType = Composed["primitiveProp"];
type ObjectPropType = Composed["objectProp"];
```

## 索引类型

索引类型指的不是某一个特定的类型工具，它其实包含三个部分：索引签名类型、索引类型查询与索引类型访问。

唯一共同点是，它们都通过索引的形式来进行类型操作，但索引签名类型是声明，后两者则是读取。

### 索引签名类型（没太看明白）

索引签名类型主要指的是在接口或类型别名中，通过以下语法来**快速声明一个键值类型一致**的类型结构：

```ts
interface AllStringTypes {
  [key: string]: string;
}

type AllStringTypes = {
  [key: string]: string;
};

type PropType1 = AllStringTypes["lin"]; // string
```

### 索引类型查询

索引类型查询，也就是 keyof 操作符

它可以将对象中的所有键转换为对应字面量类型，然后再组合成联合类型。注意，这里并不会将数字类型的键名转换为字符串类型字面量，而是仍然保持为数字类型字面量。

```ts
interface Foo66 {
  lin: 1;
  599: 2;
}
// 在 VS Code 中悬浮鼠标只能看到 'keyof Foo66'
type FooKeys = keyof Foo66;
// 看不到其中的实际值，你可以这么做：
// 599 | "lin"
type FooKeys2 = keyof Foo66 & {};
```

伪代码模拟 “从键名到联合类型” 的过程：

```ts
type FooKeys = Object.keys(Foo).join(" | ");
```

直接 keyof any 来生产一个联合类型，它会由所有可用作对象键值的类型组成：string | number | symbol。也就是说，它是由无数字面量类型组成的，所以，keyof 的产物必定是一个联合类型。

### 索引类型访问

```ts
interface NumberRecord {
  [key: string]: number;
}
// 其访问方式与返回值均是类型。
// number 类型
type PropType = NumberRecord[string];
```

使用 string 这个类型来访问 NumberRecord。由于其内部声明了数字类型的索引签名，这里访问到的结果即是 number 类型。注意，其访问方式与返回值均是类型。

```ts
interface Foo {
  propA: number;
  propB: boolean;
}

type PropAType = Foo["propA"]; // number
type PropBType = Foo["propB"]; // boolean
```

这里的'propA'和'propB'都是字符串字面量类型，而不是一个 JavaScript 字符串值。索引类型查询的本质其实就是，通过键的字面量类型（'propA'）访问这个键对应的键值类型（number）。

```ts
interface Foo77 {
  propA: number;
  propB: boolean;
  propC: string;
}

type PropTypeUnion = Foo77[keyof Foo77];
```

## 映射类型：类型编程的第一步

映射类型的主要作用即是基于键名映射到键值类型。

```ts
type Stringify<T> = {
  [K in keyof T]: string;
};
interface Foo {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: () => void;
}

type StringifiedFoo = Stringify<Foo>;

// 等价于
interface StringifiedFoo {
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
}
```

伪代码说明：

```ts
const StringifiedFoo = {};
for (const k of Object.keys(Foo)) {
  StringifiedFoo[k] = string;
}
```

这里的 T[K]其实就是上面说到的索引类型访问，我们使用键的字面量类型访问到了键值的类型，这里就相当于克隆了一个接口。需要注意的是，这里其实只有 K in 属于映射类型的语法，keyof T 属于 keyof 操作符，[K in keyof T]的[]属于索引签名类型，T[K]属于索引类型访问。

```ts
type Clone<T> = {
  [K in keyof T]: T[K];
};
```

# 8. 类型编程好帮手：TypeScript 类型工具（下）

## 类型查询操作符：typeof

类型查询操作符（Type Query Operator）：typeof，返回一个 TypeScript 类型

绝大部分情况下，typeof 返回的类型就是当你把鼠标悬浮在变量名上时出现的推导后的类型，并且是最窄的推导程度（即到字面量类型的级别）。

```ts
const obj11 = { name: "lin" };
/*
type Obj11 = {
    name: string;
}
*/
// typeof 返回obj11变量的类型，赋值给Obj11
type Obj11 = typeof obj11;

const str44 = "lin";
// type Str44 = "lin"
type Str44 = typeof str44;

// 在工具类型中使用typeof
const func11 = (input: string): boolean => {
  return input.length > 10;
};
// func12函数的类型就是typeof func11
// 也就是和func11一样，入参和出参不写类型也可以了
const func12: typeof func11 = (name) => {
  return name === "lin";
};
// 定义一个类型Func11ReturnType 是func11函数的返回值的类型，也就是boolean
// ReturnType工具类型，会返回一个函数类型中返回值位置的类型
type Func11ReturnType = ReturnType<typeof func11>;
```

## 类型守卫

TypeScript 中提供了非常强大的类型推导能力，它会随着你的代码逻辑不断尝试收窄类型，这一能力称之为类型的控制流分析（也可以简单理解为类型推导）。

```ts
function isString(input: unknown): boolean {
  return typeof input === "string";
}

function foo55(input: string | number): void {
  if (isString(input)) {
    // 错误：类型“string | number”上不存在属性“replace”。
    input.replace("linbudu", "linbudu599");
  }
  if (typeof input === "number") {
    input.toFixed(2);
  }
  // ...
}
```

以上代码中，将判断是否字符串的逻辑提取出来后，就会报错。类型控制流分析时做不到跨函数上下文来分析。因此 TypeScript 引入了 is 关键字来显式地提供类型信息。

```ts
// input is string 改为 input is number 这里不会报错
// 但是 input.replace()会报错
function isString(input: unknown): input is string {
  return typeof input === "string";
}

function foo55(input: string | number): void {
  if (isString(input)) {
    // 类型“string | number”上不存在属性“replace”。
    input.replace("linbudu", "linbudu599");
  }
  if (typeof input === "number") {
    input.toFixed(2);
  }
  // ...
}
```

isString 函数的返回值改用`input is string`来进行类型标注：

- input 时函数的参数
- is string，即 is 关键字 + 预期类型。即如果这个函数成功返回为 true，那么 is 关键字前这个入参的类型，就会被这个类型守卫调用方后续的类型控制流分析收集到。

但是类型守卫函数中并不会对判断逻辑和实际类型的关联进行检查。

### 基于 in 与 instanceof 的类型保护

```ts
interface Foo {
  foo: string;
  fooOnly: boolean;
  shared: number;
}

interface Bar {
  bar: string;
  barOnly: boolean;
  shared: number;
}

function handle(input: Foo | Bar): void {
  if ("foo" in input) {
    console.log(input.fooOnly);
  } else {
    console.log(input.barOnly);
  }
}
```

foo / bar 和 fooOnly / barOnly 是各个类型独有的属性，因此可以作为可辨识属性（Discriminant Property 或 Tagged Property）。Foo 与 Bar 又因为存在这样具有区分能力的辨识属性，可以称为**可辨识联合类型（Discriminated Unions 或 Tagged Union）**。虽然它们是一堆类型的联合体，但其中每一个类型都具有一个独一无二的，能让它鹤立鸡群的属性。

### 类型断言守卫

未完成，先往后，状态不好可以跳过去，把主要内容学完

# 9. 类型编程基石：TypeScript 中的泛型

```ts
type Factory<T> = T | number | string;
```

上面这个类型别名的本质就是一个函数，T 就是它的变量，返回值则是一个包含 T 的联合类型，伪代码如下：

```ts
function Factory(typeArg) {
  return [typeArg, number, string];
}
```

```ts
// Stringify 会将一个对象类型的所有属性类型置为 string
type Stringify<T> = {
  [K in keyof T]: string;
};

// Clone 则会进行类型的完全复制
type Clone<T> = {
  [K in keyof T]: T[K];
};
```

```ts
// TypeScript 的内置工具类型Partial的实现
type Partial<T> = {
    [P in keyof T]?: T[P];
};

interface IFoo {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: () => void;
}

typeof ParticalIFoo = Partial<IFoo>

// 等价于
interface PartialIFoo {
  prop1?: string;
  prop2?: number;
  prop3?: boolean;
  prop4?: () => void;
}
```

### 泛型约束与默认值

默认值：

```ts
type Factory<T = boolean> = T | number | string;

const foo: Factory = false;
```

使用 extends 关键字来约束传入的泛型参数必须符合要求。

关于 extends，A extends B 意味着 A 是 B 的子类型，也就是说 A 比 B 的类型更精确，或者说更复杂。

```ts
// 类型ResStatus，有个泛型ResCode变量，该变量是number的子类型，默认值为10000
// 当ResCode变量是 10000 | 10001 | 10002 的子类型时，也就是是三者其一时，ResStatus类型对应"success"，否则对应"failure"
type ResStatus<ResCode extends number = 10000> = ResCode extends
  | 10000
  | 10001
  | 10002
  ? "success"
  : "failure";

type Res1 = ResStatus<10000>; // "success"
type Res2 = ResStatus<20000>; // "failure"

type Res3 = ResStatus<"10000">; // 类型“string”不满足约束“number”。
```

### 多泛型关联

可以同时传入多个泛型参数，还可以让这几个泛型参数之间也存在联系。

```ts
type Conditional<Type, Condition, TruthyResult, FalsyResult> =
  Type extends Condition ? TruthyResult : FalsyResult;

//  "passed!"
type Result1 = Conditional<"linbudu", string, "passed!", "rejected!">;

// "rejected!"
type Result2 = Conditional<"linbudu", boolean, "passed!", "rejected!">;
```

多泛型参数其实就像接受更多参数的函数，其内部的运行逻辑（类型操作）会更加抽象，表现在参数（泛型参数）需要进行的逻辑运算（类型操作）会更加复杂。

## 对象类型中的泛型

```ts
// 一个通用的响应类型结构，预留出了实际响应数据的泛型坑位
interface IRes<TData = unknown> {
  code: number;
  error?: string;
  data: TData;
}

interface IUserProfileRes {
  name: string;
  homepage: string;
  avatar: string;
}

function fetchUserProfile(): Promise<IRes<IUserProfileRes>> {}

type StatusSucceed = boolean;
function handleOperation(): Promise<IRes<StatusSucceed>> {}

interface IPaginationRes<TItem = unknown> {
  data: TItem[];
  page: number;
  totalCount: number;
  hasNextPage: boolean;
}

function fetchUserProfileList(): Promise<
  IRes<IPaginationRes<IUserProfileRes>>
> {}
```

## 函数中的泛型

lodash 的 pick 函数，这个函数首先接受一个对象，然后接受一个对象属性名组成的数组，并从这个对象中截取选择的属性部分。

数组中的元素只能来自于对象的属性名（组成的字面量联合类型），这里就用到了 keyof！

第一个参数 T 声明约束为对象类型，第二个参数时一个数组，数组元素 U 声明约束为 keyof T

返回类型：`Pick<T, U>` 待学习

```ts
const object = { 'a': 1, 'b': '2', 'c': 3 };

_.pick(object, ['a', 'c']);
// => { 'a': 1, 'c': 3 }

pick<T extends object, U extends keyof T>(object: T, ...props: Array<U>): Pick<T, U>;
```

## Class 中的泛型

Class 中的泛型消费方是属性、方法、乃至装饰器等

```ts
class Queue<TElementType> {
  private _list: TElementType[];

  constructor(initial: TElementType[]) {
    this._list = initial;
  }

  // 入队一个队列泛型子类型的元素
  enqueue<TType extends TElementType>(ele: TType): TElementType[] {
    this._list.push(ele);
    return this._list;
  }

  // 入队一个任意类型元素（无需为队列泛型子类型）
  enqueueWithUnknownType<TType>(element: TType): (TElementType | TType)[] {
    return [...this._list, element];
  }

  // 出队
  dequeue(): TElementType[] {
    this._list.shift();
    return this._list;
  }
}
```

# 10. 结构化类型系统：类型兼容性判断的幕后

## 结构化类型系统

Cat 和 Dog 的结构相同，此时下面这段代码也能正常工作

```ts
class Cat {
  eat() {}
  // eat(): boolean { return true } // 若实现不同，会报错
}

class Dog {
  eat() {}
  // eat(): number { return 9 }
  bark() {} // 新增bark方法 也不影响
}

function feedCat(cat: Cat) {}

feedCat(new Dog());
```

TypeScript 比较两个类型并非通过类型的名称（即 feedCat 函数只能通过 Cat 类型调用），而是比较这两个类型实际拥有的属性和方法。

Dog 没有添加`bark() { }`方法前，结构化类型系统任务两者类型一致，Dog 添加`bark() { }`方法后，结构化类型系统认为 Dog 类型完全实现了 Cat 类型，继承后添加了新方法。这两种情况下都不会报错。

但是如果两个 eat 方法的实现不同，还是会报错。

## 标称类型系统

标称类型系统（Nominal Typing System）要求，两个可兼容的类型，其名称必须是完全一致的。也就是上面那种结构同名称不同的情况，在这种系统中是会报错的。

**类型的重要意义之一是限制了数据的可用操作与实际意义**，这一点在标称类型系统中的体现要更加明显。也就是不仅仅看起来一样，而是含义相同。

比如，上面我们可以通过类型的结构，来让结构化类型系统认为两个类型具有父子类型关系，而对于标称类型系统，父子类型关系只能通过显式的继承来实现，称为标称子类型（Nominal Subtyping）。

## 在 TypeScript 中模拟标称类型系统

通过为类型额外附加元数据来模拟标称类型系统。

下面例子通过交叉类型实现附加信息，CNY 和 USD 类型如果仅仅用 number 类型表示，会被结构类型系统认为是相同的，而实际两者表示不同的货币计量类型。因此需要附加上单位信息，这样就能让结构类型系统也能够区分出来两者的不同。

```ts
// declare 关键字用来告诉编译器，某个类型是存在的，可以在当前文件中使用。
// declare 关键字的重要特点是，它只是通知编译器某个类型是存在的，不用给出具体实现。比如，只描述函数的类型，不给出函数的实现，如果不使用declare，这是做不到的。
// 如果没有用declare关键字，那么 __tag__ 就会报错：
// Property '__tag__' has no initializer and is not definitely assigned in the constructor.
// 暂时还不明白

// 工具类型就像一个函数一样，泛型是入参，内部逻辑基于入参进行某些操作，再返回一个新的类型。
// 使用 TagProtector 声明了一个具有 protected 属性的类，使用它来携带额外的信息
export declare class TagProtector<T extends string> {
  protected __tag__: T;
}
// 交叉类型，符号&，`A & B`，需要同时满足 A 与 B 两个类型
// 将 TagProtector 类和原本的类型合并到一起，就得到了 Nominal 工具类型
export type Nominal<T, U extends string> = T & TagProtector<U>;

export type CNY = Nominal<number, "CNY">;
export type USD = Nominal<number, "USD">;

// as 类型断言
const CNYCount = 100 as CNY;
const USDCount = 100 as USD;

function addCNY(source: CNY, input: CNY): CNY {
  return (source + input) as CNY;
}

console.log(addCNY(CNYCount, CNYCount)); // 正常
// console.log(addCNY(CNYCount, USDCount)) // 出错
```

上面这一实现方式本质上只在类型层面做了数据的处理，在运行时无法进行进一步的限制。还可以从逻辑层面入手进一步确保安全性：

```ts
class CNY {
  // 使用`!`语法标记前面的一个声明一定是非空的
  // 小册代码中用void会提示错误，改成string
  private readonly __tag!: string;
  constructor(public value: number) {}
}
class USD {
  // 使用`!`语法标记前面的一个声明一定是非空的
  private readonly __tag!: string;
  constructor(public value: number) {}
}

const CNYCount = new CNY(100);
const USDCount = new USD(100);

function addCNY(source: CNY, input: CNY): number {
  return source.value + input.value;
}

console.log(addCNY(CNYCount, CNYCount));
// 报错
// Argument of type 'USD' is not assignable to parameter of type 'CNY'.
// Types have separate declarations of a private property '__tag'.
console.log(addCNY(CNYCount, USDCount));
```

这两种方式的本质都是**通过额外属性实现了类型信息的附加**，从而使得结构化类型系统将结构一致的两个类型也判断为不可兼容。将其标记为 private / protected 其实不是必须的，只是为了避免类型信息被错误消费。

## 扩展 —— 类型、类型系统与类型检查

- 类型：限制了数据的可用操作、意义、允许的值的集合，总的来说就是访问限制与赋值限制。在 TypeScript 中即是原始类型、对象类型、函数类型、字面量类型等基础类型，以及类型别名、联合类型等经过类型编程后得到的类型。
- 类型系统：一组为变量、函数等结构分配、实施类型的规则，通过显式地指定或类型推导来分配类型。同时类型系统也定义了如何判断类型之间的兼容性：在 TypeScript 中即是结构化类型系统。
- 类型检查：**确保类型遵循类型系统下的类型兼容性**，对于静态类型语言，在编译时进行，而对于动态语言，则在运行时进行。**TypeScript 就是在编译时进行类型检查的**。

一个需要注意的地方是，静态类型与动态类型指的是类型检查发生的时机，并不等于这门语言的类型能力。比如 **JavaScript 实际上是动态类型语言**，它的类型检查发生在运行时。
