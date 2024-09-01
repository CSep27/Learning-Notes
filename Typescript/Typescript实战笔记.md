# ts 格式化

[typescript-eslint](http://typescript-eslint.io)

# 内置声明 & 类型断言

示例来源：/learn-vue3/src/views/TodoMVCViewTS.vue

```vue
<template>
  <input
    id="toggle-all"
    class="toggle-all"
    type="checkbox"
    :checked="remaining === 0"
    @change="toggleAll"
  />
</template>
<script lang="ts">
// Event 接口定义在 node_modules/typescript/lib/lib.dom.d.ts
// e.Target 类型为 EventTarget | null;
function toggleAll(e: Event) {
  todos.value.forEach((todo) => {
    // 在类型定义中，e.Target可能为null
    if (e.target) {
      // Property 'checked' does not exist on type 'EventTarget'
      // todo.completed = e.target.checked;

      // 通过 类型断言 将e.target指定为具体的 HTMLInputElement
      // 解决报错问题
      const target = e.target as HTMLInputElement;
      todo.completed = target.checked;
    }
  });
}
</script>
```

## 内置声明

1. 在 MDN 文档搜索，判定 e 的类型为 Event
2. 在`node_modules/typescript/lib/lib.dom.d.ts`中查看 Event 的定义

## 通过类型断言解决报错

当访问`e.target.checked`时报错：`Property 'checked' does not exist on type 'EventTarget'`

[资料](https://geek-docs.com/typescript/typescript-questions/382_typescript_typescript_property_checked_does_not_exist_on_type_eventtarget_element_why_it_doesnt_exist.html)

[英文版](https://www.designcise.com/web/tutorial/how-to-fix-property-does-not-exist-on-type-eventtarget-typescript-error)

首先，EventTarget 是 Web API 中的一个接口，表示可以接收事件的对象。而 Element 是 EventTarget 的子接口，表示可以具有 DOM 属性和方法的对象。

在 TypeScript 中，当我们使用 DOM 元素时，它们的类型被推断为 EventTarget & Element，表示它们既是 EventTarget 的实例，也是 Element 的实例。而 EventTarget 接口并没有 checked 属性，所以 TypeScript 提示这个属性不存在。

具体来说，checked 是 HTMLInputElement 接口中的属性，它继承自 Element 接口，并且 HTMLInputElement 是 EventTarget & Element 的子接口。因此，当我们直接访问 checked 属性时，TypeScript 碰到了类型错误。

### 解决方案

#### 方法一：类型断言

类型断言是一种告诉 TypeScript 某个变量的具体类型的方式。通过使用类型断言，我们可以手动指定变量的类型，帮助 TypeScript 正确推断出属性存在的情况。

```ts
const checkbox = document.querySelector(
  'input[type="checkbox"]'
) as HTMLInputElement;
console.log(checkbox.checked);
```

在上面的例子中，我们使用了类型断言 as HTMLInputElement，将 checkbox 的类型指定为 HTMLInputElement，这样 TypeScript 就能够正确推断出 checked 属性的存在与值。

#### 方法二：使用类型保护

类型保护是一种在 TypeScript 中使用条件语句来判断变量类型的方式。通过使用类型保护，我们可以在代码中添加条件判断，确保属性存在的情况下再使用。

```ts
const checkbox = document.querySelector('input[type="checkbox"]');
if (checkbox instanceof HTMLInputElement) {
  console.log(checkbox.checked);
}
```

在上面的例子中，我们使用了 instanceof 来判断 checkbox 是不是 HTMLInputElement 的一个实例，只有在它是 HTMLInputElement 的实例时，才会访问 checked 属性。

#### 方法三：使用非空断言

非空断言是一种告诉 TypeScript 变量一定不为空的方式，以帮助 TypeScript 正确推断出属性的存在。

```ts
const checkbox = document.querySelector('input[type="checkbox"]')!;
console.log(checkbox.checked);
```

在上面的例子中，我们使用了 ! 来告诉 TypeScript checkbox 一定不为空，这样 TypeScript 就能够正确推断出 checked 属性的存在与值。

可以发现，不管是类型断言、类型保护还是非空断言，都是通过告诉 TypeScript 更确切的类型信息，以帮助 TypeScript 正确推断出属性的存在与值。

# 空数组

```ts
// 这里todos的类型里 不能声明为 Ref<Array<Todo> | []>
// 后面执行todos.value.push({})就会报错：Array<T>.push(...items: never[]): number
// 因为声明了空数组，就相当于内部元素为never类型，而push了一个对象，因此类型不匹配
const todos: Ref<Array<Todo>> = ref(
  JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
);
function addTodo(e: Event) {
  const target = e.target as HTMLInputElement;
  const value = target.value.trim();
  if (value) {
    // 此处不会报错了
    todos.value.push({
      id: Date.now(),
      title: value,
      completed: false,
    } as Todo);
    target.value = "";
  }
}
```

[TypeScript 中复杂的“is not assignable to type”错误的解释](https://deepinout.com/typescript/typescript-questions/794_typescript_explanation_for_this_complicated_is_not_assignable_to_type_error_in_typescript.html)

# vue3 中报错"Could not find a declaration file for module '../views/AboutView.vue'. "

在 router/index.ts 中，`component: () => import("../views/AboutView.vue"),`代码报错：
Could not find a declaration file for module '../views/AboutView.vue'.

在`env.d.ts`中增加：

```ts
/* 
解决在router/index.ts中
`component: () => import("../views/AboutView.vue"),`代码报错：
Could not find a declaration file for module '../views/AboutView.vue'.
*/
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
```

表示给所有的 vue 文件进行了声明，导出的是一个 vue 组件。

# reduce

声明位置：node_modules/typescript/lib/lib.es5.d.ts

如果在使用过程中，不满足其对于该函数的类型声明，会报错。

在`/learn-vue3/src/plugins/i18nPlugin.ts`插件代码中，使用 reduce 不满足任何一种声明情况，会报错。

待解决：除了更换写法，还有其他办法吗？
