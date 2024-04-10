# 学习资料

- [嗨客网](https://haicoder.net/linux/linux-env-var.html)

# 基础知识

## 网络连接模式

- host-onboy（主机模式）
  - 虚拟系统和真实环境是隔离开的
  - 所有虚拟系统之间可以相互通信
  - 虚拟系统的 TCP/IP 配置信息都是由**VMnet1(host-onboy)**虚拟网络的 DHCP 服务器来动态分配的
- birdged（桥接模式）
  - 虚拟系统就像是局域网中一台独立的主机，可以访问网内任何一台机器
  - 虚拟系统和宿主机的关系就像连接在同一个 Hub 上的两台电脑
  - 假设当前主机 IP 为 192.168.8.100，虚拟机为 192.168.8.xxx
  - 联网过程：虚拟机-路由器-互联网
- NAT（网络地址转换模式）
  - 虚拟系统借助 NAT 功能，通过宿主机所在的网络来访问公网
  - 虚拟系统的 TCP/IP 配置信息都是由**VMnet8**虚拟网络的 DHCP 服务器来动态分配的
  - 虚拟系统无法和本局域网中其他真实主机通讯
  - 联网过程：虚拟机-宿主机-路由器-互联网

# 安装 VMware

- 编辑-首选项-工作区-虚拟机的默认位置 改成 在空间大的磁盘，例：D:\Virtual Machines
- ctrl + alt 鼠标在虚拟机和外面之间切换

# 安装虚拟机

- 虚拟机内存不低于 1G
- 使用下载的 iso 文件安装
-
- 硬盘大小设置为 64GB
- system - installation destination 虚拟机分区
  - /boot 256M
  - swap 内存的 2 倍 2G
  - / 剩下的部分
- 修改主机名
- 网络使用 NAT 模式

# 配置

## 1. 修改网络配置

- 资料：MAC 上配置网络，需要先修改 VMware Fusion 的配置https://blog.csdn.net/weixin_43675835/article/details/127013422
- `vi /etc/sysconfig/network-scripts/ifcfg-ens33`
- 删除 uuid 行

```
BOOTPROTO=static
ONBOOT=yes
IPADDR=192.168.188.100
NETMASK=255.255.255.0
GATEWAY=192.168.188.1
DNS1=114.114.114.114
```

- 重启网络服务 systemctl restart network.service
- ip addr 查看网络地址
- ping baidu.com 成功

## 2. 修改防火墙配置

- 本次开机状态下防火墙关闭 systemctl stop firewalld
- 服务器重启后防火墙禁用 systemctl disable firewalld
- 查看防火墙状态 systemctl status firewalld
- 开启防火墙 systemctl start firewalld

## 3. 软件安装限制

- vi /etc/selinux/config
- SELINUX=disabled 解除限制

## 4. 关闭计算机

- poweroff
- shutdown -h now

## 5. 拍摄快照

- 虚拟机名称上右键=》快照管理器
- 当前位置拍摄快照，后续可以恢复
- 关机状态下拍摄

## 6.克隆快照

- 选中快照-克隆
- 链接克隆，只保存不同的配置，必须能访问原始虚拟机
- 完整克隆，占用空间大

# 本地连接工具 xshell xftp

- putty 帮助连接虚拟机

## xshell

- 安装 xshell
- ssh 用户名@192.168.188.100(地址) 连接虚拟机
- xshell 工具右下角选择全部会话，敲一个命令会应用在所有会话

## xftp

- 用于系统之间传文件

# linux 命令

- 命令和参数之间用空格隔开
- 命令区分大小写
- `type 命令` 查看命令的类型
- `help cd` 查看内部命令的帮助文档
- `man ping` 查看外部命令的帮助文档

## 常用命令

- whereis 查询命令的位置
- file 查看文件的类型
- who 查看当前在线的用户
- whoami 查看当前用户
- pwd 当前路径
- uname -a 查看内核信息 系统信息
- echo 打印
- clear 清屏
- history 历史命令

## 特殊字符

- . 隐藏文件以.开头
- $ 变量
- - 通配符
- ~ 家目录 超级管理员家目录/root，普通用户/home/用户名
- / linux 根目录
- 命令的参数
  - 如果是单词 一般加 --
  - 如果是字母或者缩写 一般加 -

# linux 的文件系统

- 不要更改二级目录
- 自定义的文件从三级目录开始

## linux 中一切皆文件

- 可以通过 mount 挂载磁盘进行扩容
- 包括进程
  - ps -ef 查看进程
  - echo $$ 打印当前进程号
  - cd 进程号
- bin 可执行文件
- boot 引导分区
- dev 设备信息
- etc 系统配置文件 类似 System32
- home 家目录 类型 用户
- lib 类库
- lib64
- media 媒体设备
- mnt 硬盘挂载时
- opt 自定义软件安装
- proc 进程信息
- root root 用户的家目录
- run 系统运行时环境变量
- sbin s 表示 super user 系统管理员使用的系统管理机制
- srv 系统相关
- sys 系统相关
- tmp 临时文件 重启后可能会被清掉
- usr 用户共享的区域，很多软件会装在里面
- var 临时文件 经常放日志文件 重启后不会被清掉

## linux 中文件类型

1. 普通类型文件 [-]

   - Linux 中最多的一种文件类型, 包括 纯文本文件(ASCII)；二进制文件(binary)；数据格式的文件(data);各种压缩文件。

2. 目录文件类型 [d]
3. 字符设备文件 [c]

   - character device，串行端口的接口设备，例如键盘、鼠标等，支持以 character 为单位进行线性访问。

4. 块设备文件 [b]

   - block device，存储数据以供系统存取的接口设备，如硬盘，支持以 block 为单位进行随机访问。

5. 套接字文件 [s]

   - socket，这类文件通常用在网络数据连接。可以启动一个程序来监听客户端的要求，客户端就可以通过套接字来进行数据通信。最常在 /var/run 目录中看到这种文件类型。
   - 使用套接字除了可以实现网络间不同主机间的通信外，还可以实现同一主机的不同进程间的通信，且建立的通信是双向的通信。

6. 命名管道文件 [p]

   - pipe，命名管道文件负责将一个进程的信息传递给另一个进程，从而使该进程的输出成为一个另一个进程的输入的内存部分。

7. 符号链接文件 [l]
   - symbolic link，类似 Windows 下面的快捷方式

### 查看文件类型的三种方式

1. 使用 ll 或者 ls -l，看第一个字符

2. 使用 file 命令，如 file jason.txt

3. 使用 stat 命令，查看文件的详细信息。

4. 查看文件或目录的大小：du filename，例如 du jason.text

## linux 常用文件命令

- ls
- ll is aliased to `ls -l --color=auto'
- mkdir -p /a/b/c 创建多级目录
- mkdir -p prefix{a,b,c} 创建 prefixa, prefixb, prefixc {}表示并列
- rmdir 删除空文件夹
- cp 复制 -a 复制目录，保留链接、文件属性，并复制目录下的所有内容
- mv 剪切 可以用来重命名
- rm -rf 删除 -f 强制删除 -r 递归
- touch 创建文件 如果没有文件就创建，有的话会修改三个时间（具体见下面 stat）
- stat 查看文件状态
  - Inode
  - Links: 1 硬链接数量
  - Access 权限
  - Uid 所属用户
  - Gid 所属组
  - 时间，创建时下列三个时间相同
    - Access: time 访问文件后变化 比如用 vi 打开，不做改动就会变化
    - Modify: time 用 vi 打开（access），修改内容（modify），文件大小改变（change），三个时间都会变化
    - Change: time 改变元数据信息（属性：如文件大小、所有者、群贤、描述信息），比如 chmod a+x file，改变了文件的可执行权限

### 链接 ln

- 创建文件的链接
- 软（符号）链接
  - ln -s 源文件 软链接
  - ln -s file1 sfile1
  - ll sfile1 第一位 l 表示是链接
  - 软链接和原始文件不是同一个文件，inode 不一样
  - 删除源文件后，sfile1 无法知道自己指向了谁，提示没有文件
- 硬链接
  - ln file2 hfile2
  - 硬链接和原始文件使用文件系统中的同一个文件
  - 删除源文件后，hfile2 还是有的
  - 可以预防别人误删文件
- 源文件 file，inode:887，软链接：sfile，inode:234，inode234 指向 file，通过软链接 sfile 就可以找到 inode887。删除 file 的话，inode234 无法找到 file。硬链接：hfile，inode:887，删除 file 删除的是其对于 inode887 的指向，并没有删除 inode887 本身，通过 hfile 还是可以找到 inode887。
- 软硬链接在链接文件时，推荐使用文件的绝对路径，否则可能有问题

### 查看文件命令

- cat 查看内容
- tac 倒着查看内容
- more 先整屏显示，空格显示下一页，B 返回上一页，H 显示命令提示信息
- less 与 more 类似，更强大
- head -10 显示文件的前 10 行
- tail -3 显示文件后 3 行
- tail -f log 动态监控文件变化
  - 参数 f 监听指定 inode 的文件数据变化，文件被删除后即使重新创建，由于 inode 已经变化，继续监听会失败
  - 参数 F 监听指定名称的文件，文件被删除后重新创建，能继续监听
- head -8 fileName | tail -1 显示第 8 行 |把前面查询的结果传递给后面
- find / -name fileName 查找 范围（包含子目录） 指定名称

# vi 编辑器

## 打开文件

- vi filename
- vi +8 filename 打开文件定位到第八行
- vi + filename 打开文件定位到最后一行
- vi +/if filename 定位到 if，进去后按字母 n，找到下一个 if

## 三种模式

### 编辑模式

- vi 之后默认进入编辑模式
- 每个按键都是快捷键
  - G 最后一行
  - gg 跳转到第一行
  - 10 gg 跳转到第 10 行
  - w 下个单词
  - 3 w 往后数第三个单词
  - dd 删除一行
  - 3 dd 删除三行
  - u 操作回退
  - . 回退 u 执行的操作
  - yw 复制一个单词，光标要在单词起始位置
  - 3 yw 复制三个单词
  - yy 复制一行
  - 3 yy
  - p 粘贴
  - 100 p 粘贴 100 次
  - x 剪切
  - 3x 剪切 3 个字符
  - r 替换，然后输入一个字符进行替换
  - 3r 替换 3 个字符，然后输入一个字符进行替换
  - hjkl 左下上右方向键
  - zz 保存并退出
  - ctrl + s 锁屏；ctrl + p 解锁

### 输入模式

- 按什么输入什么
- 从编辑模式进入输入模式
  - i 在光标位置插入
  - a 在光标后一位追加
  - o 下一行
  - I 光标移动到行首
  - A 光标移动到行尾
  - O 上一行
- ESC 返回编辑模式

### 末行（命令行）模式

- 从编辑模式按 : 进入末行模式，在状态行输入命令
- ESC 返回编辑模式
  - set nu 显示行号
  - set nonu 取消行号
  - w 保存
  - q 退出
  - q! 强制退出，不保存
    - 如果上次异常退出会保留同名隐藏文件，每次启动会提示，如果当前文件没问题，可以删除隐藏文件
  - /pattern 指定搜索的字符串，n 向下找到下一个匹配的，N 向上找
  - s/p1/p2/g 替换字符串，g 替换当前行所有，否则只替换当前行第一个
    - 3,8s/p1/p2/g 第 3 和第 8 行的 p1 全部替换为 p2
    - g/p1/s//p2/g 将全部的 p1 替换为 p2

# 计算机间数据传输

## windows - linux

- lrzsx
  - yum install lrzsz -y 安装
  - rz 敲完命令回车，会弹出 windows 资源管理器，选中文件之后立即上传 将文件从 windows 传到 linux
  - sz 将文件从 linux 传到 windows
- xftp 通用的文件传输方式，安装 xftp

## linux - linux

- scp 源数据地址 目标数据地址
  - scp file root@192.6.2.100:/opt/

# 文件大小

- 查看分区信息 df -h
- 查看指定文件目录的大小 指定最大深度为 1
  - du -h --max-depth=1 /etc
- swap
  - 一个特殊分区，以硬盘代替内存
  - 当内存使用满的时候，可以将一部分数据写出到 swap 分区

# 文件压缩

## tar

- tar（英文全拼：tape archive ）命令用于备份文件。
- tar 是用来建立，还原备份文件的工具程序，它可以加入，解开备份文件内的文件。
- 解压缩
  - tar -zx(解压)v(过程)f(文件) lucky.tar.gz(待解压文件) -C /opt/(指定解压缩的文件目录)
- 压缩
  - tar -zc(压缩)f(文件) lucky.tar.gz(压缩后的名字) apache-tomcat(源文件)
- -z 或--gzip 或--ungzip 通过 gzip 指令处理备份文件。
- -x 或--extract 或--get 从备份文件中还原文件。=> 解压
- -c 或--create 建立新的备份文件。=> 压缩
- -v 或--verbose 显示指令执行过程。
- -f<备份文件>或--file=<备份文件> 指定备份文件。
- -C<目的目录>或--directory=<目的目录> 切换到指定的目录。

## zip

- 安装 yum install zip unzip -y
- 压缩 zip -r 压缩后的文件名称 要压缩的文件
- 解压缩 unzip 要解压的文件

# linux 的网络信息

## 主机名称

- hostname 主机名 临时修改，打开一个新页面能看到主机名变成了新的
- vi /etc/hostname 永久修改

## DNS 解析

- windows C:\Windows\System32\drivers\etc\hosts
- linux `vi /etc/hosts`

# 网络相关命令

- ifconfig 查看当前网卡的配置信息

  - 属于 net-tools 中的命令，没有时需要安装
  - ip addr 也可以查看

- netstat 查看当前网络状态

  - [菜鸟教程](https://www.runoob.com/linux/linux-comm-netstat.html)
  - 一台机器默认有 65536 个端口号 0-65535
  - 逻辑概念，需要使用程序监听指定的端口，等待别人访问
  - netstat -anp
  - netstat -r 查看 kernel IP routing table

- ping 查看与目标 IP 能否联通

- telnet 查看与目标 IP 的指定端口能否联通

  - telnet 192.168.31.44 22

- curl 客户端（client）的 URL 工具，用来请求 web 服务器
  - [curl 用法指南](https://www.ruanyifeng.com/blog/2019/09/curl-reference.html)

# 防火墙

- systemctl start firewalld 开启防火墙
- systemctl status firewalld.service 查看防火墙状态
- systemctl stop firewalld.service 临时停止
- systemctl disable firewalld.service 禁止开机启动防火墙
- systemctl enable firewalld.service 开机启动防火墙

## 开启端口

- firewall-cmd --version 查看防火墙版本
- firewall-cmd --state 查看防火墙状态（确保防火墙开启）
- firewall-cmd --zone=public --list-ports 查看所有打开的端口
- firewall-cmd --zone=public --add-port=80/tcp --permanent 添加端口（--permanent 表示开放端口永久生效，无该参数则重启防火墙会失效）
- firewall-cmd --reload 重新载入防火墙配置
- firewall-cmd --zone=public --query-port=80/tcp 查看指定端口
- firewall-cmd --zone=public --remove-port=80/tcp --permanent 删除指定端口

## 区域 zone

区域就是对各种内置服务预分组的集合。

`ls -l /usr/lib/firewalld/zones` 命令查看所有区域。区域是以 XML 文档内容预定义在 Linux 系统中的。

`firewall-cmd --get-zones` 获取所有可用区域

- block–拒绝所有传入的网络连接。仅从系统内部启动的网络连接是可能的。
- dmz –经典非军事区（DMZ）区域，它提供对 LAN 的有限访问，并且仅允许选定的传入端口。
- drop –丢弃所有传入网络连接，并且仅允许传出网络连接。
- external-对于路由器连接类型很有用。您还需要 LAN 和 WAN 接口，以使伪装（NAT）正常工作。
- home –适用于您信任其他计算机的局域网内的家用计算机，例如笔记本电脑和台式机。仅允许选择的 TCP / IP 端口。
- internal–当您主要信任 LAN 上的其他服务器或计算机时，用于内部网络。
- public–您不信任网络上的任何其他计算机和服务器。您仅允许所需的端口和服务。对于云服务器或您所托管的服务器，请始终使用公共区域。
- trust–接受所有网络连接。我不建议将该区域用于连接到 WAN 的专用服务器或 VM。
- work–在信任同事和其他服务器的工作场所中使用。

`firewall-cmd --get-default-zone` 查看默认区域，默认区域为 public

`firewall-cmd --get-active-zones` 查看活跃的区域

# 主机间相互免密钥

- 从 basenode 登陆到 node01 需要输入密码
- 将 basenode 的公钥发送给 node01 保存即可，存放路径：/root/.ssh/authorized_keys

## 免密钥步骤

- 首先 basenode 生成密钥对
  - ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa
  - -t rsa 使用 rsa 加密算法
  - -P '' 密码为空 默认方式生成
  - -f ~/.ssh/id_rsa 生成路径
  - 执行后会生成密钥对
- 然后将公钥发送给 node01，在 basenode 上登录 node01 可以免密钥
  - ssh-copy-id -i ~/.ssh/id_rsa.pub root@192.168.58.201
  - 公钥被写入到了远程机器上的~/.ssh/authorized_keys 文件下
- node01 上重复上述步骤，实现登录 basenode 免密钥
- 密钥自己拷贝给自己可以实现给自己免密钥

## 主机名校验

- ssh node01 也可以进 node01，node01 相当于 DNS，做过相关配置，指向主机 IP
- 需要输入 yes 确认后连接
- 如何去掉确认步骤：

  - 修改/etc/ssh/ssh_config
  - 最后面添加

  ```
  strictHostKeyChecking no
  UserKnownHostsFile /dev/null
  ```

- 创建 3 台主机实现相互之间免密钥？？？

# 日期与时间

## 时间命令

- date 查看当前系统时间
- cal 查看日历 显示当前月
  - cal 2020 显示 2020 年
- 修改时间
  - date -s 11:11:11
  - date -s 2019-11-11
  - date -s "2019-11-11 11:11:11"

## 时间自动同步

- 自动同步时间

```
# 安装ntp
yum install ntp -y
# 从cn.ntp.org.cn同步时间，这个命令可以每天运行一次
ntpdate cn.ntp.org.cn
```

- 本地搭建 NTP 服务器
  - 内网环境中，指定一台服务器作为 NTP 服务器与它同步
  - 在 NTP 服务器上开启 ntp 服务 service ntpd start
  - ntp 配置地址： /etc/ntpd.conf 可以进行一些配置授权哪些服务器可以访问
  - 其他服务器上执行 ntpdate NTP 服务器地址

## 命令执行时间统计

```
#!/bin/bash
start=$(date +%s)
nmap man.linuxde.net &> /dev/null

end=$(date +%s)
difference=$((end - start))
echo $difference seconds
```

# 用户-组-权限

## 用户

- 新增用户
  - useradd luckyboy
  - 会创建同名的组和家目录（/home/lucky）
- 设置密码
  - passwd luckyboy
- 删除用户
  - userdel -r luckyboy 级联删除家目录和组
- 修改用户信息
  - usermod -l lucky（新） luckyboy（旧） 修改用户名，家目录和组名称不会被修改
  - usermod -L lucky 锁定用户名
  - usermod -U lucky 解锁用户名
- 常用文件
  - /etc/shadow 用户名和密码
  - /etc/passwd
    - 用户名 编号 组编号 家目录 命令
    - 6.5 版本中：系统用户编号：0-499；普通用户：500+
    - 7.6 版本中：系统用户编号：0-999；普通用户：1000+
- 切换账户
  - su lucky
  - exit 退出

## 组

- groupadd lucky
- groupdel lucky
- groupmod -n school（新） lucky（旧） 修改组名
- groups 查看当前用户对应的组
  - 显示 用户名：组名（属于多个组会显示多个，主组在前，附属组在后）
  - groups user1 查看 user1 的组
- 修改用户的组
  - usermod -g group1 user1（修改 user1 的主组为 group1）
  - usermod -G group2 user1（修改 user1 的附属组为 group2）

## 权限

- r 读取权限 4
- w 写入权限 2
- x 执行权限 1
- - 没有权限
- 文件类型；文件所有者 U；文件所属组用户 G；其他用户 O

### 修改文件的权限

1. 给其他用户增加权限
   - chmod o+w file 将 file 文件的其他用户增加写入权限
2. 变更文件所有者
   - chown user1 file 将 file 文件所属者变更为 user1
   - chgrp group1 file 将 file 文件所属组变更为 group1

# 管道与重定向

## 管道

- | 将前面命令的结果作为参数传递给后面的命令
- grep 强大的文本搜索工具
- cat profile | grep if 从 profile 里搜索 if 打印出来

## 重定向

- 改变数据输出的位置、方向
- `>` 写入到文件中，覆盖原来的内容
- `>>` 写入到文件中，追加内容
- 0 表示 in；1 表示 out，默认值，正确信息；2 表示 err，错误信息
- `ll /opt > test` 不会在控制台打印，而是会输出到 test 文件中，正确信息写入 test
- `ll /op 2> test` 没有/op 这个文件夹，会报错，此时加上 2 表示将出错信息写入 test，如果没有加就会在控制台打印错误，而不会写入 test 文件
- `ll /opt/a > test 2>&1` 不确定/opt/a 这个路径是否存在是使用，可能正确可能错误
- `ll /opt/a >> /dev/null 2>&1` 信息黑洞，放进去拿不出来了，不希望打印到屏幕上的信息，后面也不需要用了，可以放到/dev/null 中

# linux 的系统进程

## 进程信息

- ps -ef 查看进程（process status）
  - UID 所属用户
  - PID 当前进程编号
  - PPID 当前进程编号的父进程编号
- ps -aux 显示所有包含其他使用者的进程
- top 当前服务器内存使用率

## 后台进程

- 在命令后面加一个&符号
  - ping baidu.com >> baidu &
  - 不加&会在当前窗口执行，加了&之后会在后台执行
- jobs -l 可以查看当前的后台进程，只有当前用户界面可以获取到
- nohup 用于在系统后台不挂断地运行命令，退出终端不会影响程序的运行。
  - nohup ping baidu.com >> baidu 2>&1 &
- /proc 伪文件系统（也即虚拟文件系统），存储的是当前内核运行状态的一系列特殊文件

## 杀死进程

- kill -9 PID（进程编号）

# linux 的软件安装

## 环境变量

- 系统环境变量存放路径：`/etc/profile`
  - 永久设置环境变量，需要修改 profile 文件，修改完成后重新加载文件 `source /etc/profile`，修改才会生效
    - profile 文件中有段注释，推荐在/etc/profile.d/文件夹下新增自定义文件存放自定义的环境变量
  - 临时设置环境变量：执行`ENV_NAME=value`
- 用户环境变量存放路径：`$HOME/.bash_profile(用户环境变量文件)`
  - 在用户家目录下，通过`ll -a`查看该隐藏文件
- 查看当前系统所有环境变量：`env`
- 查看某个环境变量：`echo 变量名`
  - echo $PATH 查看设置的环境变量，打印出来的路径用冒号连接（windows 系统路径之间用;分号连接）
  - PATH：定义命令行解释器搜索用户执行命令的路径；执行命令时，默认从当前路径开始查找，找不到时，从环境变量$PATH 查找

## 软件的安装方式

- 解压安装，将压缩包解压之后就可以使用
- 通过源码安装，安装过程繁琐

## RPM 安装

- RedHat Package Manager 红帽的一种包管理方式
- 通过 RPM 命令安装软件，将.rpm 后缀的安装包拷贝到 linux 系统之后执行
  - rpm -ivh jdk-7u67-linux-x64.rpm
- 查询已安装的软件 要知道软件真实的名字，安装包的名字是可以被修改的
  - rpm -qa | grep XXX
- 卸载软件
  - rpm -e XXX（真实名）
- 添加环境变量
  - whereis java 找到 java 安装的路径
  - find / -name java 或者在根目录下通过 find 命令找
  - vi /etc/profile 在文件最后添加
  ```
  export JAVA_HOME=/usr/java/jdk1.8.0_231-amd64
  export PATH=$JAVA_HOME/bin:$PATH
  ```

## 压缩包解压安装

- 解压文件 tar -zxf apache-tomcat-7.0.61.tar.gz
- 拷贝到/opt 目录下
- 启动 tomcat
  - cd /opt/apache-tomcat-7.0.61/bin/
  - ./startup.sh

## yum 安装

yum 是一个在 Fedora、RedHat 和 CentOS 中的 Shell 软件包管理器。

其基于 Rpm 包管理，可从指定的服务器自动安装 Rpm 包。

可自动处理依赖关系并一次性地安装所有依赖的软件包

### yum 命令

- yum install <pkg> 安装软件包
- yum remove <pkg> 卸载软件包
- yum upgrade <pkg> 升级软件包
- yum downgrade <pkg> 降级软件包
- yum search <pkg> 搜索软件包
- yum reinstall <pkg> 重装软件包
- yum list <pkg> 罗列软件包
- yum info <pkg> 展示软件包信息
- yum clean <pkg> 清理软件包缓存

### 更换 yum 源

- 安装 wget
  - yum install wget -y
- 将系统原始配置文件备份（失效）
  - mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
- 通过 wget 获取阿里 yum 源配置文件
  - wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/CentOS-7.repo
- 清空以前 yum 源的缓存
  - yum clean all
- 获取阿里云的缓存
  - yum makecache

## 安装 Mysql 数据库

```bash
# 安装依赖perl net-tools
yum install perl net-tools
# 卸载自带的mariadb数据库
rpm -qa | grep mariadb
rpm -e --nodeps mariadb-xxx
# 安装mysql
# 解压缩tar包
tar -xvf mysql-xxx.tar
# 依次安装rpm包
rpm -ivh mysql-community-common-xxx.rpm
rpm -ivh mysql-community-libs-xxx.rpm
rpm -ivh mysql-community-client-xxx.rpm
rpm -ivh mysql-community-server-xxx.rpm
# 启动Mysql
systemctl start mysqld
# 查找密码 安装时默认生成了密码
cat /var/log/mysqld.log | grep password
# 登陆 输入前面找到的密码
mysql -u root -p
```

# linux 三剑客

## 普通剑客

- cut 用指定规则切分文本
- sort 排序
- wc 统计单词的数量

## grep

- 对文本进行搜索
- grep 查找的内容 查找的文件
- grep -n 显示行号
- grep -i 忽略大小写
- grep -v 显示不匹配的部分
- grep -E "[1-9]+" file 使用正则

## sed

- 是 stream editor 字符流编辑器的缩写
- 从文件或管道中读取一行，处理一行，输出一行，再重复
- 一次一行性能很高

## awk

- 是一门语言

# dos2unix - unix2dos

- [dos2unix](https://dos2unix.sourceforge.io/)是一个开源免费的可执行程序包，支持多个平台，不仅可以将文本文件的换行符编码在 Windows、macOS 和 UNIX/Linux 操作系统之间进行转换，还能转换文件的编码方式。
- https://linux.die.net/man/1/dos2unix
- https://www.gnss.help/2017/07/24/dos2unix-install-usage/

# linux 免密登录

- 客户机 A IP 192.168.10.120
- 服务器 B IP 192.168.10.110
- 在客户机 A 上远程服务器 B 需要输入密码
- 在客户机 A 上通过`ssh-keygen -t rsa`生成秘钥对，生成的文件位置为`~/.ssh/`
- 通过命令将公钥发送到服务器上`ssh-copy-id -i ~/.ssh/id_rsa.pub 192.168.10.110`，需要输入服务器的密码
- 之后在客户机上执行`ssh root@192.168.10.110`可以直接免密登录到服务器
- 如果需要服务器免密到客户机，在服务器上同样操作一遍即可
- 资料：[linux 服务器间免密登录](https://cloud.tencent.com/developer/article/1661095)

# linux 查看端口占用情况

- https://www.runoob.com/w3cnote/linux-check-port-usage.html

# crontab

- [Linux crontab](https://www.runoob.com/linux/linux-comm-crontab.html) 是用来定期执行程序的命令。
- [crontab guru](https://crontab.guru/)

# 资料

- [CentOS7 使用 firewall-cmd 打开关闭防火墙与端口 以开放 8080 端口为例](https://blog.csdn.net/qq754772661/article/details/115233110)

# 扩展学习

- [深入了解 epoll 模型（特别详细）](https://zhuanlan.zhihu.com/p/427512269) - 未看
