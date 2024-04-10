# Docker 实战学习

## 旧项目 Docker 自动化打包文件解析

- 旧项目 docker 版本旧，不支持`as`阶段语法
- 先在外面将 npm 的 install 和 build 操作完成，再`docker build`生成镜像
- 将镜像`docker save`打包后传到部署目标服务器
- 目标服务器`docker load`镜像，再`docker run`运行一个容器
- 但是 npm 的操作也应该在 docker 中进行，因为 docker 保证 node 环境一致

### Dockerfile

```
# Dockerfile的指令每执行一次都会在docker上新建一层
# 需要避免过多无意义的层

# 基于node:16.15.0基础镜像
FROM node:16.15.0

# 指定执行后续命令的用户和用户组
USER root

# ADD 命令会将上下文路径（docker文件夹）下的security-cloud-web.tar.gz（源路径）复制到容器内的指定路径（/home/portal）下
# 源文件是tar压缩文件，自动复制并解压到目标路径
# 容器内的/home/portal下就是前端代码
ADD security-cloud-web.tar.gz /home/portal

# 声明端口
EXPOSE 8282

# pipeline中的步骤可以放到这里？
# 可以通过RUN命令执行 使用&&简化 不要有过多的层
# RUN npm install && npm run build

# 也可以执行一个可执行文件
# RUN ['./deploy.sh', 'params1', 'params2']

# CMD命令在docker run时运行
# RUN命令在docker build时运行
# 类似于CMD命令，不会被docker run的命令行参数指定的指令所覆盖
# 命令行参数会被当做参数送给ENTRYPOINT指令指定的程序
# docker run运行容器时，node入口执行 日志输入到/root/portal.log
ENTRYPOINT node /home/portal/server/pro_index.js > /root/portal.log
```

### Jenkinsfile

- npm install 步骤不完全，仅示意

```
pipeline {
  agent any

  stages {
      stage('npm install') {
          steps {
            // 这一步里npm install
            // npm build
            // 需要的文件放到docker文件夹下
            // 进入docker文件夹，将需要的所有文件打包成security-cloud-web.tar.gz压缩包 并删除掉原始打包文件
            // 现在docker文件夹下只有一个压缩包
            sh 'npm install'
            sh 'npm run build'
          }
      }
  }

  stages {
      // 通过Dockerfile构建镜像
      stage('Build docker') {
          steps {
            // 通过目录下的Dockerfile构建一个security-pool-portal:1.0镜像（镜像名称:镜像标签）
            // docker是本次执行的上下文路径，会将该路径下的所有文件打包发送给docker引擎
            sh 'docker build -t security-pool-portal:1.0 docker'
          }
      }
  }

  stages {
      stage('Deploy') {
          steps {
            // 将制作好的镜像保存成security-pool-portal.tar文件
            sh 'docker save security-pool-portal:1.0 -o security-pool-portal.tar'
            // 将tar文件传输到部署服务器上
            sshPublisher(
              publishers: [
                sshPublisherDesc(
                  configName: "${params.publishServer}",
                  transfers: [
                    sshTransfer(
                      cleanRemote: false,
                      excludes: '',
                      // 执行docker load 导入docker save 生成的镜像
                      execCommand: 'sh /opt/load_images.sh portal',
                      execTimeout: 120000,
                      flatten: false,
                      remoteDirectory: '/tmp/',
                      removePrefix: '',
                      sourceFiles: 'security-pool-portal.tar'
                    )
                  ],
                  usePromotionTimestamp: false,
                  useWorkspaceInPromotion: false,
                  verbose: true,
                )
              ]
            )
          }
      }
  }
}
```

### load-image.sh

```
#!/bin/bash

case $1 in
product)
  # 导入镜像
  docker load -i /tmp/security-pool-product.tar
  # 删除旧的portal容器
  docker rm -f portal
  # 通过镜像security-pool-portal:1.0 运行一个新的容器 名称为portal
  # -d 后台运行 指定网络连接类型为host
  # -v 绑定容器卷 宿主机目录:容器目录
  # docker中产生的数据同步到本地；容器数据持久化和同步，容器间共享数据
  docker run -d --name product --network=host -v /opt/securitypool/product:/home/seccloud/logs security-pool-product:1.0
  ;;

portal)
  # 导入镜像
  docker load -i /tmp/security-pool-portal.tar
  docker rm -f portal
  # 通过镜像security-pool-portal:1.0 运行一个新的容器 名称为portal
  # -d 后台运行 指定网络连接类型为host
  docker run -d --name portal --network=host security-pool-portal:1.0
  ;;

*)
  echo "usage"
  ;;
esac

# 清理dangling images 删除旧的
docker images | grep none | awk '{print $3}' | xargs docker rmi -f
```

#### 删除旧镜像解析

- 将制作好的镜像复制到部署服务器上，会出现和上次镜像重复的问题，会自动将旧的重命名，然后需要删除旧的
- 通过`docker images | grep none | awk '{print $}' | xargs docker rmi -f`可以删除旧的镜像
- 资料：[Docker 镜像列表中的 none:none 是什么](https://blog.csdn.net/boling_cavalry/article/details/90727359)

##### 删除旧镜像命令解析

- `docker images | grep none` 通过'none'筛选镜像
- `docker images | grep none | awk '{print $}'` 打印出的文本以空格分隔，打印第三个字符串，也就是镜像 ID
- `docker images | grep none | awk '{print $}' | xargs docker rmi -f` xargs 把前一个命令的输出作为后面命令的输入，docker rmi [IMAGE] 删除镜像，这里 IMAGE 就是前面拿到的镜像 ID，

```
$ docker images | grep none
$ <none> <none> 65896addc747 33 minutes ago 911MB
$ docker images | grep none | awk '{print $}'
$ 65896addc747
$ docker images | grep none | awk '{print $}' | xargs docker rmi -f
```

## 纯前端项目 docker 打包

- 按照[Docker 是怎么实现的？前端怎么用 Docker 做部署？](https://juejin.cn/post/7137621606469222414)实现纯前端打包，使用 nginx 部署

### Dockerfile

```
# build stage
FROM node:16.15.0 AS build_image
# 指定工作路径，之后执行命令的路径是/app
WORKDIR /app
# 先复制package*.json过去
COPY package*.json /app/
RUN npm install --registry=http://xxx
# 再复制其他文件
# 第一个.表示Dockerfile文件所在路径，是jenkins服务器上的路径
# 第二个.表示docker工作路径/app
COPY . .
npm run build

# production stage
FROM nginx:1.21.0 as production-stage
COPY --from=build-stage /app/build/ /usr/share/nginx/html
COPY --from=build-stage /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# 指定在容器开启运行时，通过运行以下命令行指令开启nignx
CMD ["nginx", "-g", "daemon off;"]
```

- 最终的镜像只包含 production-stage 的产物，有 nginx，没有 node

### Jenkinsfile

- `npm install`步骤不需要，在`docker build`步骤执行

### load-image.sh

```
#!/bin/bash
docker load -i /tmp/test-vue-package.tar
docker rm -f nginx-vue
docker run -d --name nginx-vue -p 9000:80 test-vue:1.0
docker images | grep none | awk '{print $3}' | xargs docker rmi -f

```

- 访问`SERVERIP:9000`，即可访问 web 页面

## 创建自定义网络

```
# 新建project-network网络
docker network create project-network
docker network ls
# node-server容器的网络别名node-mock-server，接入project-network
docker network connect --alias node-mock-server project-network node-server
docker network connect --alias web-main project-network web-project
# 查看网络内容
docker network inspect project-network

```

- 修改 web-project 容器的 nginx 配置

```
server {
  # 数据请求
  location /api/ {
    # 宿主机地址
    # proxy_pass http://180.8.1.179:3000/;
    # 容器的IPv4Address 默认bridge网络
    # proxy_pass http://172.17.0.3:3000/;
    # 自定义网络 容器网络别名
    proxy_pass http://node-mock-server:3000/;
  }
}
```

## docker run

```
docker run -it --name dockerContainerName -p 80:80 -v /home/localDir:/home/localDir dockerImageName
```

## docker 环境变量

### 查看

- `docker inspect 容器` 输出的信息中有个 Env 数组
- `docker exec env`

### 设置

1. 在 Dockerfile 中设置`ENV SERVER_PORT 80`
2. docker 运行容器时设置 `-e`或者`--env`

   - `docker run -itd --name=centos -e SERVER_PORT=80 --env APP_NAME=pkslow centos:7`
   - 直接使用宿主机环境变量 SERVER_PORT `docker run -itd --name=centos -e SERVER_PORT centos:7`

3. 启动时加载文件

   - 先将配置文件放在 env.list 中
   - 启动时传入文件`docker run -itd --name=centos --env-file env.list centos:7`

# 使用过的 docker 命令

## 进入 redis 容器修改

```shell
docker exec -it redis bash
redis-cli
AUTH 密码
SET 键 值
```
