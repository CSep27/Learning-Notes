# jenkins 离线安装 nodejs 插件

- 内网环境需要离线安装插件
- 使用 Jenkins 版本：2.290

1. 打开[jenkins 插件官网](https://plugins.jenkins.io/)，搜索 nodejs，进入[jenkins-nodejs 插件](https://plugins.jenkins.io/nodejs/)页面
2. 在 releases 页面找到需要下载的版本，下载下来 nodejs.hpi 文件
3. 打开 jenkins 页面，点击 Mansge Jenkins（系统管理） => Manage Plugins（插件管理），进入`JENKINS_URL/pluginManager/`（JENKINS_URL 表示 jenkins 访问地址，下同）页面
4. 在 Advanced（高级）中找到<上传插件>将 nodejs.hpi 上传安装
   - 我上传时出现报错`java.net.MalformedURLException:no protocol`，看不出原因
   - 后面进入`JENKINS_URL/pluginManager/`插件页面发现显示报错信息
   ```
   Failed to load: NodeJS Plugin（1.5.1）
    - Plugin is missing: config-file-provider（3.6.3）
    - Update required: Structs Plugin(1.20) to be updated to 3.8.v852b473a2b8c or higher
    - Update required: Plain Credentials Plugin(1.5) to be updated to 1.7 or higher
   ```
5. 再去下载相应版本的插件（config-file-provider、Structs Plugin、Plain Credentials Plugin），上传安装
6. 都安装成功后，浏览器访问`JENKINS_URL/restart`页面，重启 jenkins
7. 重启完成之后在“插件管理-已安装”中能看到 nodejs 插件已安装成功

# nodejs 插件配置

1. 点击 Mansge Jenkins（系统管理） => Global Tool Configuration（全局工具配置）进入`JENKINS_URL/configureTools` 页面，点击 Nodejs 安装按钮
2. 给 Node.js 版本取个别名，例如`nodejs-16.15.0`
3. `Install automatically` 是配置在线下载 nodejs，去掉勾选，会出现“安装目录”项，可以填写 Node.js 安装包解压缩后的地址，例如`/opt/software/node-v16.15.0-linux-x64`
4. 需要多个版本就继续增加

# 修改 jenkinsfile

- 如果是流水线方式打包，将原来的 jenkinsfile

```
pipeline {
  agent any

  stages {
      stage('Build') {
          steps {
            sh 'deploy.sh'
          }
      }
  }

}
```

- 修改成如下格式：

```
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                // nodejs-16.15.0 就是前面配置时取得名称
                nodejs('nodejs-16.15.0') {
                    // 打印npm相关配置信息
                    sh 'npm config ls'
                    // 执行部署脚本
                    sh 'deploy.sh'
                }
            }
        }
    }
}
```

- 其他方式可以参考[jenkins-nodejs 插件](https://plugins.jenkins.io/nodejs/)页面中的 Usage

# 参考资料

- [jenkins 的 pipeline 脚本中进行 nodejs 构建](https://blog.51cto.com/u_1472521/3714383)
