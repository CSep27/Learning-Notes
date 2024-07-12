- 查阅官方文档记录笔记

# VSCode

## settings & workspace

- [vscode - workspace](https://code.visualstudio.com/docs/editor/workspaces)
- [中文版文档资料](https://vscode.github.net.cn/docs/editor/workspaces)

- File > Preferences > Settings 查看配置，以下配置优先级逐渐增加
- user 当前用户的配置 通过界面操作或者打开配置文件`C:\Users\w14700\AppData\Roaming\Code\User\settings.json`
  - 在可视化配置项界面，鼠标移动到配置项上， 出现一个设置图标，可以`Copy Setting ID`或者`Copy Setting as json`，可以拿到配置项 ID，可以再以 json 配置的格式进行修改
- workspace 工作区的配置 普通情况在.vscode 文件夹的 settings.json；Multi-root Workspace 在 workspace 配置文件（<name>.code-workspace）中

  - The workspace settings file is located under the .vscode folder in your root folder.
  - For a Multi-root Workspace, workspace settings are located inside the workspace configuration file.

- folder 文件夹的配置 在.vscode 文件夹下增加 settings.json

  - 优先级原文：Workspace settings enable you to configure settings in the context of the workspace you have opened and always override global user settings.
  - Settings configured per folder will override settings defined in the .code-workspace

- 指定语言（例如 css、js 等）的配置总是会覆盖未指定语言的配置，即使未指定语言的配置有更小的作用域，比如指定语言的用户配置会覆盖未指定语言的工作区配置

  - 原文：Language-specific editor settings always override non-language-specific editor settings, even if the non-language-specific setting has a narrower scope. For example, language-specific user settings override non-language-specific workspace settings.

- 如果在 user 和 workspce 作用域指定了同样语言的配置，他们会被合并，并且在 workspace 中定义的配置优先级更高

  - If you have settings defined for the same language in both user and workspace scopes, then they are merged by giving precedence to the ones defined in the workspace.

- 在多种编程语言中生效
  ```json
  "[javascript][typescript]": {
    "editor.maxTokenizationLineLength": 2500
  }
  ```

### workspace 配置

element-2.6.3.code-workspace 配置内容如下，覆盖掉用户配置。

'File > Open Workspace from file'，打开工作区配置。

'File > Add Folder to Workspace'，将项目文件夹在工作区打开。这个项目就会应用工作区的配置（这里所有的自动格式化全部关掉了，项目中的与用户配置的有冲突）

```json
{
  "folders": [
    {
      "path": "."
    }
  ],
  "settings": {
    "editor.fontSize": 18,
    "editor.tabSize": 4,
    // 保存自动格式化代码
    "editor.formatOnSave": false,
    // 粘贴自动格式化
    "editor.formatOnPaste": false,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    // 可以为不同语言或文档单独配置
    "[typescript]": {
      "editor.formatOnSave": false
    },
    "[markdown]": {
      "editor.formatOnSave": false
    },
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "eslint.enable": false
  }
}
```

### 配置优先级

- 详细的[Settings precedence](https://code.visualstudio.com/docs/getstarted/settings#_settings-precedence)，越靠后的优先级越高

- 原始类型和数组类型的值会被更高优先级的配置直接覆盖，对象类型的会被合并

  - Values with primitive types and Array types are overridden, meaning a configured value in a scope that takes precedence over another scope is used instead of the value in the other scope. But, values with Object types are merged.

- 注意多语言配置，多语言配置不会覆盖其中一种单语言配置

  - a "[typescript][javascript]" workspace setting will not override a "[javascript]" user setting

- 左下角登录 vscode 账号 在不同机器之间共享配置

## extensions

- Ctrl+Shift+X 打开 extensions 列表
- 插件页面的 Feature Contributions 看到插件的配置项

# json 文件支持加注释

- 打开.json 文件，在 vscode 右下角，有个`{} json`，点击后，输入 json with comments 格式

# 常用插件

- koroFileHeader 生成头部和函数注释
- auto rename tag
- px to rem & rpx & vw(cssrem)
- git history
- Markdown Preview Enhanced 预览 markdown 文件，快捷键`cmd-k v`
