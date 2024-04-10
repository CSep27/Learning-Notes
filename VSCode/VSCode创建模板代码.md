1. File -> Preferences -> User Snippets -> 选择创建全局模板/当前模板 -> 输入模板的名字
2. 输入模板快捷键和模板描述

```json
{
  // Place your test workspace snippets here. Each snippet is defined under a snippet name and has a scope, prefix, body and
  // description. Add comma separated ids of the languages where the snippet is applicable in the scope field. If scope
  // is left empty or omitted, the snippet gets applied to all languages. The prefix is what is
  // used to trigger the snippet and the body will be expanded and inserted. Possible variables are:
  // $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders.
  // Placeholders with the same ids are connected.
  // Example:
  // "Print to console": {
  // 	"scope": "javascript,typescript",
  // 	"prefix": "log",
  // 	"body": [
  // 		"console.log('$1');",
  // 		"$2"
  // 	],
  // 	"description": "Log output to console"
  // }
  "Print to console": {
    "scope": "javascript,typescript",
    "prefix": "log", // 模板快捷键
    // 模板内容
    "body": ["console.log('$1');", "$2"],
    // 模板描述
    "description": "Log output to console"
  }
}
```

3. 创建一个模板文件，例如
   ```js
   function hash(...args) {
     return args.join(",");
   }
   ```
4. 部分符号需要转义
   - " => \"
   - $ => $$
5. 所有行前添加双引号，行后添加双引号和逗号
   - 摁住鼠标滚轮往下在所有行前显示光标
   - 选中需要的部分，快捷键 shift + alt + i ，所有行后显示光标
6. 模板生成后需要通过 Tab 键跳转光标输入替换值的，可以输入$1，需要默认值的，输入${1:默认值}
   - $1, $2 for tab stops, $0 for the final cursor position, and ${1:label}, ${2:another} for placeholders.
7. 将准备好的模板复制到 body 数组中
