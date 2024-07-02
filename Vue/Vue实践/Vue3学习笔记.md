# 多个应用实例

- createApp API 允许你在同一个页面中创建多个共存的 Vue 应用，而且每个应用都拥有自己的用于配置和全局资源的作用域。

# 原始 HTML

- 你不能使用 v-html 来拼接组合模板，因为 Vue 不是一个基于字符串的模板引擎。在使用 Vue 时，应当使用**组件**作为 UI 重用和组合的基本单元。

# 优化点

1. [更新类型标记](https://cn.vuejs.org/guide/extras/rendering-mechanism.html#patch-flags)

- 在为这些元素生成渲染函数时，Vue 在 vnode 创建调用中直接编码了每个元素所需的更新类型
- 运行时渲染器也将会使用位运算来检查这些标记，确定相应的更新操作

2. [树结构打平](https://cn.vuejs.org/guide/extras/rendering-mechanism.html#tree-flattening)

- 只需要变遍历打平的树，忽略模板中的静态部分

3. shallowRef 等方法，可以设置对大数据不进行深度监听

# 组合式 API

组合式 API 并不是函数式编程。组合式 API 是以 Vue 中数据可变的、细粒度的响应性系统为基础的，而函数式编程通常强调数据不可变。

# defineProps() 宏函数

## C 语言中的宏替换

定义：`#define 名字 替换文本` 。后续所有出现<名字>记号的地方都将被替换为<替换文本>

示例，为无限循环定义了一个新名字 forever：

```c
#define forever for(;;)
```

宏定义也可以带参数，比如：

```c
#define max(A, B) ((A) > (B) ? (A) : (B))
```

宏的使用看起来很像是函数调用。但宏调用直接将替换文本插入代码中。形式参数（在此为 A 或 B）的每次出现都将被替换成对应的实际参数。因此语句

```c
x = max(p+q, r+s)
```

将被替换为下列形式：

```c
x = ((p+q) > (r+s) ? (p+q) : (r+s))
```

## vue3 源码中定义

packages/runtime-core/src/apiSetupHelpers.ts

注：ts 中 overload 重载见笔记《TypeScript 全面进阶指南学习笔记 2-10》

````ts
/**
 * Vue `<script setup>` compiler macro for declaring component props. The
 * expected argument is the same as the component `props` option.
 *
 * Example runtime declaration:
 * ```js
 * // using Array syntax
 * const props = defineProps(['foo', 'bar'])
 * // using Object syntax
 * const props = defineProps({
 *   foo: String,
 *   bar: {
 *     type: Number,
 *     required: true
 *   }
 * })
 * ```
 *
 * Equivalent type-based declaration:
 * ```ts
 * // will be compiled into equivalent runtime declarations
 * const props = defineProps<{
 *   foo?: string
 *   bar: number
 * }>()
 * ```
 *
 * @see {@link https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits}
 *
 * This is only usable inside `<script setup>`, is compiled away in the
 * output and should **not** be actually called at runtime.
 */
// overload 1: runtime props w/ array
export function defineProps<PropNames extends string = string>(
  props: PropNames[]
): Prettify<Readonly<{ [key in PropNames]?: any }>>;
// overload 2: runtime props w/ object
export function defineProps<
  PP extends ComponentObjectPropsOptions = ComponentObjectPropsOptions
>(props: PP): Prettify<Readonly<ExtractPropTypes<PP>>>;
// overload 3: typed-based declaration
export function defineProps<TypeProps>(): DefineProps<
  LooseRequired<TypeProps>,
  BooleanKey<TypeProps>
>;
// implementation
export function defineProps() {
  if (__DEV__) {
    warnRuntimeUsage(`defineProps`);
  }
  return null as any;
}

export type DefineProps<T, BKeys extends keyof T> = Readonly<T> & {
  readonly [K in BKeys]-?: boolean;
};

type BooleanKey<T, K extends keyof T = keyof T> = K extends any
  ? [T[K]] extends [boolean | undefined]
    ? K
    : never
  : never;
````

extends 关键字用来约束传入的泛型参数必须符合要求。

关于 extends，A extends B 意味着 A 是 B 的子类型，也就是说 A 比 B 的类型更精确，或者说更复杂。

Prettify 工具类型，定义在 packages/shared/src/typeUtils.ts

工具类型就像一个函数一样，泛型是入参，内部逻辑基于入参进行某些操作，再返回一个新的类型。

keyof 操作符，索引类型查询，将对象中的所有键转换为对应字面量类型，然后再组合成联合类型。

`A & B`，需要同时满足 A 与 B 两个类型

Prettify 工具类型，入参是泛型 T，返回对象，对象的键是 T 的索引组成的联合类型，对象的值是键对应值的类型

```ts
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
```

ComponentObjectPropsOptions 工具类型，packages/runtime-core/src/componentProps.ts

泛型 P 的默认值为 Data，Data 是一个对象类型。

Prop 工具类型有两个泛型入参，第二个入参的默认值等于第一个入参，返回 PropOptions 或者 PropType

```ts
export type Data = Record<string, unknown>;

export type ComponentObjectPropsOptions<P = Data> = {
  [K in keyof P]: Prop<P[K]> | null;
};

export type Prop<T, D = T> = PropOptions<T, D> | PropType<T>;
```
