廖雪峰老师 Git 教程学习笔记

# 什么是 Git

分布式版本控制系统。

分布式版本控制系统没有“中央服务器”，每个人的电脑上都是一个完整的版本库。和集中式版本控制系统相比，分布式版本控制系统的安全性要高很多。

分布式版本控制系统通常也有一台充当“中央服务器”的电脑，这个服务器的作用是用来方便“交换”大家的修改。

# 安装

官网下载安装

```
// 每台机器需要标识自己
// --global 表示这台机器上所有仓库都使用这个配置
git config --global user.name "Your Name"
git config --global user.email "email@example.com"
```

# 创建版本库

- `mkdir test`
- `cd test`
- `git init` 初始化，将 test 目录变成 git 可以管理的仓库
- `ls -ah` 查看.git 隐藏目录，该目录是用来跟踪管理版本库的
  - `-a` 显示所有文件及目录 (. 开头的隐藏文件也会列出)
  - `-h` –human-readable ???
- `touch main.js` 新建 main.js

# 工作区、暂存区、版本库

![3.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e5a7d29332e46b781a93ef669f07508~tplv-k3u1fbpfcp-watermark.image?)

# 时光机穿梭

## 提交文件

- `git add main.js` 提交到暂存区
- `git commit -m 'add main.js'` 从暂存区提交到版本库

## 修改文件

- 修改 main.js
- `git status` 查看文件状态 Changes not staged for commit
- `git diff` 查看修改内容
- `git add`
- `git status` Changes to be committed
- `git commit -m 'modify main.js'`
- `git status` nothing to commit, working tree clean

## 重命名文件

- `git mv -v oldfile newfile` 修改完后执行 commit 提交

## 删除文件

- `git rm <file>`
- `git commit -m 'delete <file>'`

## 查看记录

- `git log` 查看提交记录
- `git log --pretty=oneline` 查看提交记录
- `git log --graph --pretty=oneline --abbrev-commit`
- `q` 退出 git log
- `git reflog` 查看所有操作记录，包括回退版本等

## 版本

- HEAD 当前版本
- HEAD^ 上一个版本
- HEAD^^ 上上一个版本
- HEAD~100 往上 100 个版本
- 版本号（commit id） 例：`4e66e5f1b054df5db72aa64dc56b01b1bc1a6b75` 用 SHA1 计算出来的数字，十六进制表示

### 版本回退

- `git reset --hard HEAD^` 回退到上个版本
  - `--hard` Resets the index and working tree. Any changes to tracked files in the working tree since `<commit>` are discarded. Any untracked files or directories in the way of writing any tracked files are simply deleted.
  - `--soft` Does not touch the index file or the working tree at all (but resets the head to `<commit>`, just like all modes do). This leaves all your changed files "Changes to be committed", as `git status` would put it.
  - `--mixed` Resets the index but not the working tree (i.e., the changed files are preserved but not marked for commit) and reports what has not been updated. This is the default action. If `-N` is specified, removed paths are marked as intent-to-add (see [git-add[1]](https://git-scm.com/docs/git-add)).
- `git reset --hard 版本号` 回退到指定版本

#### 版本回退后并推送

- 本地修改提交后，如果 push 到了远程分支。此时先在本地执行`git reset ...`操作后，直接 push 到远程可能会报错，需要强制 push，`git push 仓库名 分支名 --force`

## 管理修改

git 管理的是修改而不是文件

- `git checkout -- <file>` 撤销工作区的修改
- `git restore --staged <file>` 撤销暂存区的修改

# 远程仓库

## 生成秘钥对

- 将 GitHub 作为远程仓库
- 本地仓库与远程仓库之间通过 SSH 加密传输，因此需要进行设置
- `ssh-keygen -t rsa -C "youremail@example.com"`生成秘钥对
- PuTTYgen 加载私钥 id_rsa，导出 ppk 私钥文件，后续拉取代码时加载该私钥文件
- id_rsa.pub 公钥上传到 GitHub

## 本地关联远程仓库

- `git remote add 远程库名称 远程库地址` 关联仓库
- `git push -u 远程库名称 远程库分支` 将本地内容推送到远程并关联分支
- `git push 远程库名称 远程库分支` 推送内容
- `git remote rm 远程库名称` 解除关联已有的远程库

## 克隆远程库

- 先创建远程库，再克隆到本地
- `git clone 远程库地址`

## 创建远程分支到本地

- `git checkout -b dev origin/dev` 创建本地 dev 分支，关联的是远程 origin 库的 dev 分支

## 远程库地址

- 默认使用 ssh `git://xxx/xxx`
- 也可以使用 https `https://github.com/michaelliao/gitskills.git`
- `git remote` 查看远程库地址
- `git remote -v` 查看远程库详细信息
- `git remote set-url origin 新地址`修改远程库地址

## fork

- 通过 fork 操作可以复制一份其他官方仓库代码到自己的仓库
- fork 后自己的仓库有读写权限
- 可以 pull request 推送给官方仓库

# 分支管理

## 创建并切换分支

- `git checkout -b dev` 相当于两条命令
  - `git branch dev` 创建 dev 分支
  - `git checkout dev` 切换到 dev 分支
- `git branch` 查看当前有哪些分支

## switch 命令切换分支

- `git switch -c dev` 创建并切换到新的 dev 分支
- `git switch master` 切换到已有的 master 分支

## 合并分支

- `git merge 分支名` 合并指定分支到当前分支
- 在 master 分支上 `git merge dev`，即把 dev 分支上的内容合并到 master 分支

## 删除分支

- `git branch -d <branchname>` 删除本地分支（合并过的分支）
- `git branch -D <branchname>` 强行删除本地没有合并过的分支
- `git push <remote> --delete <branchname>` 删除远程分支

## 给分支添加描述

- `git config branch.<branchname>.description '描述内容'` 添加描述
- `git config branch.<branchname>.description` 查看描述

## 比较两个分支差异

- `git diff branch1 branch2 --stat` 列出所有有差异的文件列表，+表示 branch2 相对于 branch1 多出的内容，-表示 branch2 相对于 branch1 减少的内容
- `git diff branch1 branch2 文件名（带路径）` 显示指定文件的详细差异
- `git diff branch1 branch2` 显示所有有差异文件的详细差异

## 重命名分支

- `git branch -M main` 将当前分支重命名为 main

# 解决冲突

## 通过命令行解决冲突

- `git merge feature` 将 feature 分支合并到当前时冲突
- 手动解决冲突，然后再执行`git add`和`git commit`提交
- `git log --graph --pretty=oneline --abbrev-commit` 查看分支合并情况
- 然后删除 feature 分支，默认使用的`Fast forward`模式，会丢失掉 feature 分支的信息

### 合并时禁用`Fast forward`模式

- 使用`--no-ff`参数 强制禁用`Fast forward`模式，会在 merge 时生成一个新的 commit，可以在分支历史上看出历史信息
- `git merge --no-ff -m "merge with no-ff" dev`

## 使用 TortoiseGit 工具解决冲突

- 使用`git pull <remote> <branchname>`从远程仓库拉取时与其他人提交的代码发生冲突
- 使用 TortoiseGit 工具的 EditConflicts 工具可以直观看到冲突的位置
- 并且还会生成`filename.ext.BASE.ext`, `filename.ext.LOCAL.ext` and `filename.ext.REMOTE.ext` 3 个文件
- MERGE_HEAD 表示远程文件内容，HEAD 表示当前我的分支的内容，Merged 表示解决冲突后的内容。在冲突处右键可以选择使用远程的，我的，或者合并两者。
- 将文件标记为 resolved 然后提交，提交时会提示这是一次解决冲突的提交，里面可能会包含本地修改的一些其他代码
- 手动解决冲突后，执行的 TortoiseGit 的 resolve 命令，实际是`git add`操作
  - 官方文档：Please note that the Resolve command does not really resolve the conflict. It uses "git add" to mark file status as resolved to allow you to commit your changes and it removes the `filename.ext.BASE.ext`, `filename.ext.LOCAL.ext` and `filename.ext.REMOTE.ext` files.
- 最后再 commit 进行提交

# stash 临时存储

- 保存
  - `git stash` 会自动使用一串字符作为标识
  - `git stash save “修改的信息”` 保存并记录修改内容（推荐）
- 展示所有保存的版本
  - `git stash list`
- 查看保存版本的内容
  - `git stash show -p stash@{0}` 查看序号为 0 的 stash 的内容
- 恢复版本
  - `git stash pop` 取最后一个版本，并删除该版本
  - `git stash apply stash@{0}` 恢复需要的某个版本 版本号通过展示版本命令获取
- 删除版本
  - `git stash drop stash@{0}` 删除某个版本
  - `git stash clear` 清除所有版本

# cherry-pick 复制特定提交到当前分支

- 在 dev 分支做了一次修改提交，记录下版本号
- 在 master 分支上同样需要修改，执行`git cherry-pick 版本号`，将该次修改合并到 master 分支

# 推送分支

- `git push 远程库名称 远程分支名称` 将本地当前分支推送到远程库特定分支

## 分支是否要推送

- 主分支与开发分支需要与远程同步；
- **bug 分支只用于在本地修复 bug，就没必要推到远程了**
- feature 分支是否推到远程，取决于是否需要合作开发。

# 抓取分支

- `git pull` 从远程抓取分支，有冲突要先解决冲突
- 如果拉取时没有指定从哪个分支拉取，希望默认关联分支拉取
  - 执行`git branch --set-upstream-to=<remote>/<branch> <branch>` 建立远程分支和本地分支的关联

# rebase

- `git rebase` 将本地未 push 的分叉提交历史整理成直线，看上去更直观。缺点是本地的分叉提交已经被修改过了。
- 总的原则是，**只对尚未推送或分享给别人的本地修改执行变基操作清理历史，从不对已推送至别处的提交执行变基操作。**

## rebase 参考资料

- [git-book 资料](https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%8F%98%E5%9F%BA)
- [教程 1](https://backlog.com/git-tutorial/cn/stepup/stepup2_8.html)
- [教程 2](http://jartto.wang/2018/12/11/git-rebase/)

# 标签管理

## 新建标签

- `git tag <tagname>` 当前状态打标签
- `git tag <tagname> <commit id>` 某个版本打标签
- `git tag -a <tagname> <commit id> -m "标签信息"` 指定标签信息
- `git tag` 查看所有标签
- `git show <tagname>`查看指定标签的详细信息

## 操作标签

- `git tag -d <tagname>` 删除本地标签
- `git push <remote> <tagname>` 推送标签
- `git push <remote> --tags` 一次性推送所有未推送的标签
- 如果标签已经推送，需要删除的话，首先需要从本地删除，然后从远程删除`git push <remote> :refs/tags/<tagname>`

# 自定义 Git

## 让 Git 显示颜色

- `git config --global color.ui true`

## 忽略特殊文件

- 在`.gitignore` 文件中，将要忽略的文件名填进去，并将该文件提交到仓库中

### 忽略文件原则

1. 忽略操作系统自动生成的文件，比如缩略图等
2. 忽略编译生成的中间文件、可执行文件等
3. 忽略带有敏感信息的配置文件

## 忽略所有层级文件夹下的 node_modules 文件夹

- `**/node_modules/`

## 强制添加文件

- `git add -f <file>` 强制添加被忽略的文件
- `git check-ignore -v <file>` 检查忽略规则，哪条规则导致该文件被忽略（在强制添加之前检查）

## 不忽略某些文件（增加特例）

- `!<file>` 不忽略指定文件

```
# 忽略所有.开头的隐藏文件:
.*
# 忽略所有.class文件:
*.class

# 不忽略.gitignore和App.class:
!.gitignore
!App.class
```

# .gitattribute

- git 配置文件换行符
- `*.* text eol=lf` 所有类型文件换行符都是 lf

# 配置别名

- `git config --global alias.st status` 将 st 配置为 status 的别名
- `git config --global alias.unstage 'reset HEAD'` 将 unstage 配置为'reset HEAD'的别名
- `git config --global alias.last 'log -1'` 显示最后一次提交信息
- `git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"`
- 不加--global 的配置只对当前仓库生效
- 每个仓库的配置文件都放在.git/config 文件中
- 当前用户的配置文件放在用户主目录下的一个隐藏文件.gitconfig 中
- 可以通过修改配置文件内容直接修改别名配置

# git pull 和 git fetch 的区别

- [参考资料](https://www.zhihu.com/question/38305012)

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5494710045a94a1dbf70bde0af41599f~tplv-k3u1fbpfcp-watermark.image?)

- pull 根据不同的配置，可等于 fetch + merge 或 fetch + rebase

# 解决问题

## refusing to merge unrelated histories

- 合并两个不同的 git 仓库，两个不同的 git 库之间存在不相关的历史时出现
- 现象

```shell
$ git pull origin main
From https://github.com/CSep27/my-file-upload
 * branch            main       -> FETCH_HEAD
fatal: refusing to merge unrelated histories
```

- 解决：通过`--allow-unrelated-histories`合并不相关的历史记录

```shell
# 新建Temp
git checkout -b temp
# 拉取main分支，然后解决冲突
git pull origin main --allow-unrelated-histories
# 切换到main
git checkout main
# 合并分支
git merge temp
# 再继续之前要在main分支进行的操作
```

# 资料

[GitHub 入门文档](https://docs.github.com/zh/get-started)
