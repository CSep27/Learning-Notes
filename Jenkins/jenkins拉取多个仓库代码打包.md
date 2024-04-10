# Jenkins 拉取多个仓库代码打包

- 场景：微前端项目，主应用和两个子应用分别在三个仓库中，需要将代码一次性打包到一起

- 准备：

  1. Jenkins 安装[Git 插件](https://plugins.jenkins.io/git/)和[Git Client 插件](https://plugins.jenkins.io/git-client/)
  2. 新建一个 git 仓库，专门存放打包脚本 Jenkinsfile 和 make-package.sh

- 编写 Jenkinfile：

```groovy
pipeline {
  agent any

  // 环境变量 三个仓库的git地址
  environment {
    navAppGitUrl = "http://navgiturl.git"
    loginAppGitUrl = "http://logingiturl.git"
    mainAppGitUrl = "http://maingiturl.git"
  }

  // 定义的参数，三个仓库的分支
  parameters {
    choice choices: ['nav-branch'], name: 'navBranch', description: "nav应用分支"
    choice choices: ['login-branch'], name: 'loginBranch', description: "login应用分支"
    choice choices: ['main-branch'], name: 'mainBranch', description: "main应用分支"
  }

  stages {
    // stage是串行的，按顺序执行，一步接着一步
    stage('Build Nav') {
      steps {
        // 通过git插件，拉取指定git地址指定分支的代码
        checkout([
          $class: 'GitSCM',
          branches: [[name: "${params.navBranch}"]],
          // 在脚本所在的当前workspace路径下会新建一个文件夹nav，用来存放从nav应用仓库拉取的代码
          extensions: [
            [$class: 'CloneOption', depth: 1],
            [$class: 'CheckoutOption', timeout: '30'],
            [$class: 'RelativeTargetDirectory', relativeTargetDir: 'nav']
          ],
          // credentialsId 是在Configuration页面配置的git凭证参数名（添加参数时选择Credentials Parameter类型）
          userRemoteConfigs: [[credentialsId: "${params.credentialsId}", url: "${navAppGitUrl}"]]
        ])
        // 拉取完代码后，进入nav文件夹，执行该仓库下的打包脚本
        sh 'cd nav && sh build.sh'
      }
    }

    stage('Build Login') {
      steps {
        // 通过git插件，拉取指定git地址指定分支的代码
        checkout([
          $class: 'GitSCM',
          branches: [[name: "${params.loginBranch}"]],
          // 在脚本所在的当前workspace路径下会新建一个文件夹login，用来存放从login应用仓库拉取的代码
          extensions: [
            [$class: 'CloneOption', depth: 1],
            [$class: 'CheckoutOption', timeout: '30'],
            [$class: 'RelativeTargetDirectory', relativeTargetDir: 'login']
          ],
          userRemoteConfigs: [[credentialsId: "${params.credentialsId}", url: "${loginAppGitUrl}"]]
        ])
        // 拉取完代码后，进入login文件夹，执行该仓库下的打包脚本
        sh 'cd login && sh build.sh'
      }
    }

    stage('Build Main') {
      steps {
        // 通过git插件，拉取指定git地址指定分支的代码
        checkout([
          $class: 'GitSCM',
          branches: [[name: "${params.mainBranch}"]],
          // 在脚本所在的当前workspace路径下会新建一个文件夹main，用来存放从main应用仓库拉取的代码
          extensions: [
            [$class: 'CloneOption', depth: 1],
            [$class: 'CheckoutOption', timeout: '30'],
            [$class: 'RelativeTargetDirectory', relativeTargetDir: 'main']
          ],
          userRemoteConfigs: [[credentialsId: "${params.credentialsId}", url: "${mainAppGitUrl}"]]
        ])
        // 拉取完代码后，进入main文件夹，执行该仓库下的打包脚本
        sh 'cd main && sh build.sh'
      }
    }

    stage('Deploy') {
      steps {
        // 三个应用的代码都生成完成，执行当前仓库下的脚本，将三个仓库的代码打包到一起，生成web.tar压缩包
        sh 'sh make-package.sh'
        sshPublisher(
          publishers: [
            sshPublisherDesc(
              transfers: [
                sshTransfer(
                  cleanRemote: false,
                  // 到目标服务器上对包进行操作
                  execCommand: 'cd /tmp',
                  execTimeout: 120000,
                  flatten: false,
                  remoteDirectory: '/tmp/',
                  sourceFiles: 'web.tar'
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

## $class 作用

- 在 Jenkins 的 Pipeline 脚本中，$class 用来指定 Pipeline Steps 中的 Step Extension 的类型。Step Extension 通常是用来扩展 Pipeline 中的步骤的，比如可以添加一些超时控制、触发器等。每个扩展都有自己的参数，用于控制其功能。
- 上述例子中，extensions 参数中使用了三个不同类型的 Step Extension
  - CloneOption：克隆操作选项。depth 控制克隆深度
  - CheckoutOption：checkout 操作选项。timeout 参数指定了 checkout 的超时时间
  - RelativeTargetDirectory：相对目标目录。relativeTargetDir 参数指定拉取得代码所在的相对目录路径
