# 资料

- [Jenkins User Documentation](https://www.jenkins.io/doc/)

# 配置示例

```
pipeline {
  agent any

  // 定义的参数
  parameters {
    // repoUrl是参数名
    string(name: "repoUrl", defaultValue: "http://xxx.git", description: "git代码路径")
  }

  stages {
    // stage是串行的，按顺序执行，一步接着一步
    // Pull是当前步骤的名称
    stage('Pull') {
      steps {
        // 通过git插件，拉取指定git地址指定分支的代码
        checkout([
          $class: 'GitSCM',
          branches: [[name: "${params.repoBranch}"]],
          // 无用配置
          // doGenerateSubmoduleConfigurations: false,
          // 不建议使用
          // extensions: [[$class: 'RelativeTargetDirectory', relativeTargetDir: 'cloudops-web']],
          // 无用配置
          submoduleCfg: [],
          userRemoteConfigs: [[credentialsId: "${params.credentialsId}", url: "${params.repoUrl}"]]
        ])
      }
    }

    stage('Build') {
      steps {
        // 执行shell脚本
        // 更改web/build-web.sh权限 user(rwx) group(r-x) other(r-x)
        sh 'chmod 755 web/build-web.sh'
        // 执行脚本
        // -x 进入跟踪方式，shell在执行脚本的过程中把它实际执行的每一个命令行显示出来，并且在行首显示一个"+"号。 "+"号后面显示的是经过了变量替换之后的命令行的内容，有助于分析实际执行的是什么命令。
        sh 'sh -x web/build-web.sh cloudops-web'
      }
    }

    stage('Deploy') {
      when{
          expression {
            return "${params.publishServer}" != "None"
          }
      }
      steps {
        sshPublisher(
          publishers: [
            sshPublisherDesc(
              configName: "${params.publishServer}",
              transfers: [
                sshTransfer(
                  cleanRemote: false,
                  excludes: '',
                  execCommand: 'mv /opt/cloudops/web/server/config/production.js production.js.bak && tar zxf /tmp/security-cloud-web.tar.gz -C /opt/cloudops/web && mv -f production.js.bak /opt/cloudops/web/server/config/production.js && systemctl restart cloudweb',
                  execTimeout: 120000,
                  flatten: false,
                  remoteDirectory: '/tmp/',
                  // sourceFiles中的removePrefix部分不会在目的服务器上创建
                  // jenkins服务器上的包路径是'/tmp/security-cloud-web.tar.gz'
                  removePrefix: 'cloudops-web/',
                  sourceFiles: 'cloudops-web/security-cloud-web.tar.gz'
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

# 名词解释

- [SCM](https://www.jenkins.io/doc/tutorials/build-a-node-js-and-react-app-with-npm/) Source Control Management 源代码管理

# jenkinsfile 参数介绍

- jenkins 配置页面-参数化构建过程
- [agent](https://www.jenkins.io/doc/book/pipeline/syntax/#agent)
- [parameters](https://www.jenkins.io/doc/book/pipeline/syntax/#parameters)
  - 触发流水线时用户应该提供的一系列参数，在流水线过程中可以通过 params 对象获取参数
- [stage](https://www.jenkins.io/doc/book/pipeline/syntax/#stage)
  - stage 指令在 stages 部分中，并且应该包含一个 steps 部分

## steps

### [checkout](https://www.jenkins.io/doc/pipeline/steps/workflow-scm-step/)

Check out from version control

- [`$class: 'GitSCM'`](https://www.jenkins.io/doc/pipeline/steps/params/gitscm/)
  - git 插件为 jenkins 工程提供了基本的 git 操作，可以被 Pipeline 的 checkout 步骤使用
- userRemoteConfigs：指定跟踪的仓库
  - url：git 仓库地址
  - credentialsId：检出源的凭证
- branches：构建的分支列表，每个任务只构建单一分支是最高效的，如果使用多个分支，修改日志比较可能会显示没有修改或者错误的修改
- doGenerateSubmoduleConfigurations：删除了用于测试 git 子模块版本组合的功能，git 插件 4.6.0 版本中移除了该配置，会忽略用户的设置，总是设为 false。
- submoduleCfg：和 doGenerateSubmoduleConfigurations 作用一样。
- extensions: 针对不同的使用方式，扩展添加新行为或者修改现有的插件行为。扩展帮助使用者更准确地调节插件行为以适应他们的需求。
  - `$class: 'RelativeTargetDirectory'`
  - relativeTargetDir 指定一个 git 仓库被检出的本地目录（相对于工作区根目录）。这个插件不应该被使用在 jenkins pipeline 中，使用 [ws](https://www.jenkins.io/doc/pipeline/steps/workflow-durable-task-step/#ws-allocate-workspace) 或者 [dir](https://www.jenkins.io/doc/pipeline/steps/workflow-basic-steps/#dir-change-current-directory)

### [sshPublisher](https://www.jenkins.io/doc/pipeline/steps/publish-over-ssh/#sshpublisher-send-build-artifacts-over-ssh)

#### publishers

- configName：The configuration defines the connection properties and base directory of the SSH server.
- verbose：打印信息到控制台
- transfers
  - sourceFiles: 上传到服务器的文件
  - remoteDirectory：可选的目的文件夹，没有会自动创建
  - remotePrefix：First part of the file path that should not be created on the remote server.
  - execCommand：在远程服务器上执行的命令，在所有文件都被传输之后
- useWorkspaceInPromotion: 设置源文件的根路径为工作区

##### jenkins 页面配置

- 在 Dashbord - Manage Jenkins - Configure System - Publish Over SSH 增加一个 SSH Server 的配置，是需要部署的远程机器
- 在 jenkins 服务器上生成公私钥，私钥上传到 jenkins 网站上一步中的 key，公钥通过 ssh-copy-id 命令发送到远程机器，实现免密登录远程机器

# jenkins 使用学习

- sh 'xxx' 命令执行都是在当前目录下执行

```
stage('Build') {
    steps {
      // 进入docker-web然后执行ls，会打印出docker-web文件夹中的文件列表
      sh 'cd docker-web && ls'
      // 这一句不是在docker-web中执行，又回到外面的目录了
      sh 'docker build -t test-image .'
    }
  }
```
