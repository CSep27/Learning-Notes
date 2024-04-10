注：B 站 Docker 视频学习笔记

# docker 镜像

- 镜像是一种轻量级、可执行的独立软件包，用来打包软件运行环境和基于运行环境开发的软件，它包含运行某个软件所需的所有内容，包括代码、运行时、库、环境变量和配置文件

- 如何得到镜像
  - 从远程仓库下载
  - 拷贝一份
  - 自己制作一个镜像 DockerFile

## 联合文件系统

- UnionFS（联合文件系统）是一种分层、轻量级并且高性能的文件系统，它支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下。UnionFS 是 Docker 镜像的基础，镜像可以通过分层来进行继承，基于基础镜像（没有父镜像），可以制作各种具体的应用镜像

## Docker 镜像加载原理

- docker 镜像实际上由一层层的文件系统组成，这种文件系统就是 UnionFS。
- bootfs（boot file system）主要包含 bootloader 和 kernel，bootloader 主要是引导加载 kernel，Linux 刚启动时会加载 bootfs，当 boot 加载完成之后整个内核就在内存中了，此时内存的使用权已经由 bootfs 转交给内核，此时系统也会卸载 bootfs。在 docker 镜像的最底层是 bootfs。
- rootfs（root file system），在 bootfs 之上。包括典型的 Linux 系统中的/dev 等标准目录和文件。rootfs 就是各种不同操作系统发行版。

- docker 镜像都是只读的，当容器启动时，一个新的可写层被加载到镜像的顶部。这一层就是通常说的容器层，容器之下的都叫镜像层。
- 修改容器层之后，和镜像层一起打包成一个新的自己的镜像

# B 站视频

- `docker --help`查看帮助信息，具体的命令可以继续在后面加，`docker run --help`
- 地址：https://www.bilibili.com/video/BV1og4y1q7M4?p=25&vd_source=1e7b376e808b1c65c1698e6665a195bf
- 有道云笔记 Docker 学习笔记-2
- P30 正在看
- 中间跳过 从 P34 看到了结尾

# 快捷键

- Ctrl + P + Q 快捷键退出当前容器

## 数据卷容器

- 一个父容器 centos1，一个子容器 centos2，通过命令--volumes-from，在两个或多个容器之间实现数据共享

```
# 以镜像wtt/centos:1.0生成容器docker01，默认会有volumes01和volumes02
docker run -it --name docker01 wtt/centos:1.0

# 再生成容器docker02 并且--volumes-from docker01，同样默认会有volumes01和volumes02
docker run -it --name docker02 --volumes-from docker01 wtt/centos:1.0

# 进入docker01容器
docker attach docker01
cd volumes01
touch docker01.js

# 进入docker02容器 发现volumes01下有docker01.js这个文件，内容同步了
docker attach docker02
cd volumes01
ll

# 再生成容器docker03 并且--volumes-from docker01，volumes01数据同步
docker run -it --name docker02 --volumes-from docker01 wtt/centos:1.0

# 在docker03创建数据，docker01和docker02也可以看到
# 停止docker01，或者删除，数据还在，只要还有容器在用，数据就还在
```

## Dockerfile

### 基础知识

1. 每个指令必须大写
2. 从上到下执行
3. #为注释
4. 每一个指令都会创建提交一个新的镜像层

### 指令

```
FROM          # 基础镜像
RUN           # 构建镜像时运行
COPY          # 复制
ADD           # 类似COPY，并且会自动解压
WORKDIR       # 镜像工作目录
VOLUME        # 挂载目录
EXPOSE        # 暴露的端口
CMD           # 容器启动时执行的命令，最后一个生效，可被替代
ENTRYPOINT    # 容器启动时执行的命令，最后一个生效，可以追加
ONBUILD       #
ENV           # 构建的时候设置环境变量
```

- [ONBUILD](https://yeasy.gitbook.io/docker_practice/image/dockerfile/onbuild)待看

- `docker history 镜像ID` 查看镜像生成的过程

# Docker 网络

- Docker 中所有网络都是虚拟的

## --link

- 通过容器名无法直接 ping 通
- 启动 tomcat03 容器，通过--link 连接 tomcat02 之后`docker run -d -P --name tomcat03 --link tomcat02 tomcat`
- 再通过容器名 ping`docker exec -it tomcat03 ping tomcat02`
- 查看 tomcat03 容器内的配置`/etc/host`，就是增加一个映射
- 真实不建议使用，使用自定义网络

## 自定义网络

### 网络模式

- bridge: 桥接网络
- none: 不配置网络
- host: 和宿主机共享网咯
- container: 容器网络连通（用得少，局限性大）

### 创建网络

- `docker network create --driver bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 mynet`
- `docker run -d -P --name tomcat-net-01 --network mynet tomcat`启动容器加入 mynet，在 mynet 中的可以通过容器名连通
- 好处：不同的集群使用不同的网络，保证集群是安全和健康的

## 网络连通

- tomcat01 容器接入默认的 docker0 网络，tomcat-net-01 接入 mynet 网络，如果 tomcat01 容器需要连通 tomcat-net-01
- 通过`docker network connect [OPTIONS] NETWORK CONTAINER`
- 将 tomcat01 容器连接到 mynet 网络`docker network connect mynet tomcat01`，tomcat01 一个容器有两个 IP

# 部署 redis 集群

- 6 个容器，3 主 3 从，主机挂掉从机替代

```
# redis集群
redis-cli -c
# 查看集群节点
cluster nodes
```
