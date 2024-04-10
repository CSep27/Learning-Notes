# 资料

- [Systemd 入门教程：命令篇](https://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)
- [Systemd 入门教程：实战篇](https://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-part-two.html)

# 命令

- 修改配置文件，就要让 systemd 重新加载配置文件，然后重新启动

```
# 重新加载所有修改过的配置文件
sudo systemctl daemon-reload
# 重启服务
sudo systemctl restart httpd.service
```

# 配置文件

- `man systemd.exec`linux 查看 systemd.exec 帮助文档，进入帮助文档页面后输入/，加上要查询的关键字查看某个配置的含义
- [systemd.unit 官方文档](https://www.freedesktop.org/software/systemd/man/systemd.unit.html)
- [systemd.exec 官方文档](https://www.freedesktop.org/software/systemd/man/systemd.exec.html#)
- [ulimit](https://ss64.com/bash/ulimit.html) User limits - limit the use of system-wide resources.

## 示例

```
[Unit]
Description=H3C CloudWeb Service
After=cloudops.service

[Service]
Type=forking
ExecStart=/opt/cloudops/web/cloudweb.sh start
ExecStop=/opt/cloudops/web/cloudweb.sh stop
PrivateTmp=true

LimitNPROC=65536
LimitNOFILE=1048576
LimitCORE=infinity

[Install]
WantedBy=multi-user.target
```

## [Unit]区块

- 通常是配置文件的第一个区块，用来定义 Unit 的元数据，以及配置与其他 Unit 的关系。

```
Description：简短描述
After：如果该字段指定的 Unit 也要启动，那么必须在当前 Unit 之前启动
```

## [Install]

- 通常是配置文件的最后一个区块，用来定义如何启动，以及是否开机启动

```
WantedBy：它的值是一个或多个 Target，当前 Unit 激活时（enable）符号链接会放入/etc/systemd/system目录下面以 Target 名 + .wants后缀构成的子目录中
```

- 示例中的`WantedBy=multi-user.target`配置，通过`ll /etc/systemd/system/multi-user.target.wants`查看文件夹内容会显示多个软链接，其中包括`cloudweb.service -> /usr/lib/systemd/system/cloudweb.service`

## [Service]

- Service 的配置，只有 Service 类型的 Unit 才有这个区块。

```
Type：定义启动时的进程行为。它有以下几种值。
  Type=simple：默认值，执行ExecStart指定的命令，启动主进程
  Type=forking：以 fork 方式从父进程创建子进程，创建后父进程会立即退出

ExecStart：启动当前服务的命令
ExecStop：停止当前服务时执行的命令

PrivateTmp：对于每个service的tmp目录，会在服务启动(start)时创建该目录，并且在关闭(stop)服务时删除该目录。

LimitNPROC: 等价于 ulimit -u	Number of Processes 用户最多可开启的进程数量 使用TasksMax更好
  This limit is enforced based on the number of processes belonging to the user. Typically it's better to track processes per service, i.e. use TasksMax=, see systemd.resource-control(5).

LimitNOFILE: ulimit -n	Number of File Descriptors 同一时间最多可开启的文件数
  Don't use.

LimitCORE：ulimit -c	Bytes 设定core文件的最大值，单位为区块
```

- [PrivateTmp](https://www.cnblogs.com/lihuobao/p/5624071.html)

# Target

- Target 就是一个 Unit 组，包含许多相关的 Unit 。启动某个 Target 的时候，Systemd 就会启动里面所有的 Unit。从这个意义上说，Target 这个概念类似于"状态点"，启动某个 Target 就好比启动到某种状态。

```
# 查看一个 Target 包含的所有 Unit
# 看到其中包含了cloudweb.service
$ systemctl list-dependencies multi-user.target

# 查看启动时的默认 Target
# 显示 multi-user.target
$ systemctl get-default

# 设置启动时的默认 Target
$ sudo systemctl set-default multi-user.target
```

# 开机启动

- `systemctl enable httpd` 开机启动 httpd.service
- 上面的命令相当于在/etc/systemd/system 目录添加一个符号链接，指向/usr/lib/systemd/system 里面的 httpd.service 文件。
- 这是因为开机时，Systemd 只执行/etc/systemd/system 目录里面的配置文件。这也意味着，如果把修改后的配置文件放在该目录，就可以达到覆盖原始配置的效果。
- 执行之后下次开机才会自动启动

# 启动服务

- `systemctl start httpd` 现在立即启动
- `systemctl status httpd` 查看服务状态

# 停止服务

- `systemctl stop httpd` 停止
- `systemctl kill httpd` 上面停止没有响应就用 Kill'杀进程'
- `systemctl restart httpd` 重启
