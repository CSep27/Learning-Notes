# windows 下删除文件夹

- windows 下删除文件夹时报需要 administrator 权限才能删除
- 以管理员身份打开 cmd
- 输入`d:`进入 D 盘
- `cd dir` 进入目标文件夹中
- `rmdir /s/q node_modules` 删除 node_modules 及其子文件夹
- `/s` 删除所有子目录
- `/q` 删除不询问
- `del "<filename>"`删除文件
