注：学习[B 站视频 linux 教程中 shell 教程](https://www.bilibili.com/video/BV16Q4y1y7xS?p=97&vd_source=1e7b376e808b1c65c1698e6665a195bf)部分记录的笔记

# 概述

## 名词解释

- kernel
  - linux 内核，主要和硬件打交道
- shell
  - 命令解释器
  - 一个用 C 语言编写的程序，既是一种命令语言，又是一种程序设计语言
  - 一种应用程序，提供了一个界面，用户通过这个界面访问操作系统内核的服务
- 两大主流 shell
  - sh
    - Bourne shell 简称 sh solaris 和 hpux 默认 shell
    - Bourne again shell 简称 bash linux 系统默认 shell
  - csh
    - C shell 简称 csh
    - tc shell 简称 tcsh
- 声明
  - #! 告诉系统其后路径所指定的程序即使解释此脚本文件的 shell 程序
  ```
  #!/bin/bash
  echo "hello"
  ```

## shell 脚本的执行

- 输入脚本的绝对路径或相对路径
  - /root/hello.sh
  - ./hello.sh
  - 执行的必须是一个可执行的文件
- bash 或 sh 加 脚本名称
  - sh hello.sh
  - 当脚本没有 x 权限时，root 用户和文件所有者可以通过该方式执行脚本
- 在脚本的路径前再加'.'或者 source
  - source 命令作用：在当前 bash 环境下读取并执行 FileName 中的命令。
- 区别
  - 第一种和第二种会新开一个 bash，不同 bash 中的变量无法共享
  - 第三种 是在同一个 shell 里运行的
  - 在控制台声明变量 name=libai，在脚本里 echo $name；第一二中方式执行拿不到 name，第三种可以
- export 可以将当前进程的变量传递给子进程去使用
  - 配置 profile 时 所有变量前必须加 export
  - 在控制台声明变量 export name=libai，这样三种方式执行时都可以拿到了

# shell 基础

## 变量

- 定义变量时，不加$
  - 英文字母、数字和下划线，不能以数字开头
  - 不能使用关键字
- 变量类型
  - 局部变量，在脚本或命令中定义，仅在当前 shell 实例中有效，其他 shell 启动的程序不能访问局部变量
  - 环境变量，所有程序，包括 shell 启动的程序，都能访问环境变量，有些程序需要环境变量保证正常运行
  - shell 变量，由 shell 程序设置的特殊变量。一部分是环境变量，一部分是局部变量。

```
# 变量的声明
name="zhangsan"
for file in `ls /etc`
for file in $(ls /etc)
do
  echo $file
done

# 变量的调用
echo $name
echo ${name}

# 只读变量
readonly url="www.baidu.com"

# 删除变量
unset name
```

## shell 字符串

- 最常用，可以用单引号、双引号或不用引号
- 单引号
  - 字符原样输出，变量无效
  - 成对出现，字符串拼接
- 双引号
  - 可以有变量
  - 可以出现转义字符

```
#!/bin/bash
# 声明字符串
str1="hello world"

# 字符串拼接
name='zhangsan'
hello="hello, ${name}!"
hi='hi, '${name}'!'

# 字符串长度
email="123@qq.com"
# 输出 10 字符串长度
echo ${#email}
# 输出 23@q 1-4字符
echo ${email:1:4}
```

## shell 数组

- bash 支持一位数组，不支持多维数组，不限定数组大小
- 是伪数组，模拟出来的，底层不是一块连续的空间
- 下标从 0 开始

```
# 定义数组 括号表示数组，元素用空格分割
favs=("football" "basketball")

# 读取数组 ${数组名[下标]}
echo ${favs[0]}

# @ 获取数组所有元素
echo ${favs[@]}

# 获取数组长度
echo ${#favs[@]}
echo ${#favs[*]}
```

## 注释

- \# 开头的行，会被解释器忽略

```
# 特殊的多行注释 EOF是约定俗称的写法，只要前后是一致的就可以
:<<EOF
注释内容...
注释内容...
注释内容...
EOF
```

## 参数传递

- 执行 shell 脚本时，向脚本传递参数，脚本内获取参数的格式为$n，n 是数字

| 参数 | 说明                                                     |
| ---- | -------------------------------------------------------- |
| $#   | 传递到脚本的参数个数                                     |
| $\*  | 以一个单字符串显示所有向脚本传递的参数                   |
| $$   | 脚本运行的当前进程的 ID 号                               |
| $!   | 后台运行的最后一个进程的 ID 号                           |
| $?   | 显示最后命令的退出状态。0 表示没有错误，其他值表示有错误 |
| $0   | 执行的文件名                                             |

```
#!/bin/bash
echo "传递参数";
echo "文件名 $0";
echo "参数1 $1";
echo "参数2 $2";
echo "参数个数 $#";
echo "参数 $*";
echo "ID $$";
echo "最后一个进程ID $!";
echo "退出状态 $?";
```

# shell 进阶

## 运算符

- [shell 运算符](https://www.runoob.com/linux/linux-shell-basic-operators.html)

### 算数运算符

- expr 是一款表达式计算工具，使用它能完成表达式的求值操作。

| 运算符 | 说明 | 举例                     |
| ------ | ---- | ------------------------ |
| +      |      | `expr $a + $b`           |
| -      |      |                          |
| \*     |      |                          |
| /      |      |                          |
| %      |      |                          |
| =      | 赋值 | a=$b 变量 b 的值赋值给 a |
| ==     | 相等 | [$a == $b]               |
| !=     | 不等 |                          |

- 注意：条件表达式要放在方括号之间，并且要有空格，例如: [$a==$b] 是错误的，必须写成 [ $a == $b ]。

### 关系运算符

| 运算符 | 说明     |
| ------ | -------- |
| -eq    | 等于     |
| -ne    | 不等于   |
| -gt    | 大于     |
| -lt    | 小于     |
| -ge    | 大于等于 |
| -le    | 小于等于 |

### 布尔运算符

| 运算符 | 说明 |
| ------ | ---- |
| -a     | 与   |
| -o     | 或   |
| !      | 非   |

### 逻辑运算符

| 运算符 | 说明       |
| ------ | ---------- |
| &&     | 逻辑的 AND |
| \|\|   | 逻辑的 OR  |

### 字符串运算符

| 运算符 | 说明                                         |
| ------ | -------------------------------------------- |
| -z     | 检测字符串长度是否为 0，为 0 返回 true       |
| -n     | 检测字符串长度是否不为 0，不为 0 返回 true。 |
| $      | 检测字符串是否不为空，不为空返回 true。      |

# 资料

- [字符设备](https://ty-chen.github.io/linux-kernel-char-device/)
- [块设备](https://zhuanlan.zhihu.com/p/70364688)
- [shell 运算符](https://www.runoob.com/linux/linux-shell-basic-operators.html)

# shell 解析 json

- [shell 解析 json](https://cloud.tencent.com/developer/article/1795499)

## 实战案例——微前端项目

- 由于子应用独立打包部署，因此选择方案为：在主应用 importmap.json 中写死路径，主应用配置 nginx 指向子应用，子应用再配置 nginx 跳转到真正的地址，这个真正的地址是随着每次打包动态从 microProject.json 中获取写入子应用 nginx 配置中，这样子应用打包入口文件变化，主应用不需要改动。

- 主应用 importmap.json

```
{
  "imports": {
    "@organization-name/navbar": "https://IP:PORT/navbar/js/app.75895623.js",
    "@organization-name/child-project-name": "http://IP:PORT/child-project-entry"
  }
}
```

- 主应用 nginx

```
# 匹配固定的/child-project-entry，跳转到子应用/entry
location /child-project-entry {
  proxy_pass http://child-project-IP:child-project-PORT/entry
}
```

- 子应用 nginx

```
# 匹配/entry，跳转到子应用真正的入口页面
location /entry {
  # ENTRYNAME是标记用来动态替换的
  set $entry ENTRYNAME;
  default_type application/javascript;
  # 子应用服务器上入口文件的真实路径
  alias /child-project-path/$entry;
}
```

- 子应用生成的 microProject.json，内容为子应用名称和入口文件地址，用于给主应用生成的 importmap.json 使用

```
{"name":"child-project-name","entry":"static\\/js\\/app.7fhjgv8699iusag.js"}
```

- 子应用 replace-conf.sh 读取 microProject.json 文件中的 entry 替换 nginx 配置中的 ENTRYNAME

```
### 方法简要说明：
### 1. 是先查找一个字符串：带双引号的key。如果没找到，则直接返回defaultValue。
### 2. 查找最近的冒号，找到后认为值的部分开始了，直到在层数上等于0时找到这3个字符：,}]。
### 3. 如果有多个同名key，则依次全部打印（不论层级，只按出现顺序）
### @author lux feary
###
### 3 params: json, key, defaultValue
function getJsonValuesByAwk() {
  awk -v json="$1" -v key="$2" -v defaultValue="$3" 'BEGIN{
        foundKeyCount = 0
        while (length(json) > 0) {
            # pos = index(json, "\""key"\""); ## 这行更快一些，但是如果有value是字符串，且刚好与要查找的key相同，会被误认为是key而导致值获取错误
            pos = match(json, "\""key"\"[ \\t]*?:[ \\t]*");
            if (pos == 0) {if (foundKeyCount == 0) {print defaultValue;} exit 0;}

            ++foundKeyCount;
            start = 0; stop = 0; layer = 0;
            for (i = pos + length(key) + 1; i <= length(json); ++i) {
                lastChar = substr(json, i - 1, 1)
                currChar = substr(json, i, 1)

                if (start <= 0) {
                    if (lastChar == ":") {
                        start = currChar == " " ? i + 1: i;
                        if (currChar == "{" || currChar == "[") {
                            layer = 1;
                        }
                    }
                } else {
                    if (currChar == "{" || currChar == "[") {
                        ++layer;
                    }
                    if (currChar == "}" || currChar == "]") {
                        --layer;
                    }
                    if ((currChar == "," || currChar == "}" || currChar == "]") && layer <= 0) {
                        stop = currChar == "," ? i : i + 1 + layer;
                        break;
                    }
                }
            }

            if (start <= 0 || stop <= 0 || start > length(json) || stop > length(json) || start >= stop) {
                if (foundKeyCount == 0) {print defaultValue;} exit 0;
            } else {
                print substr(json, start, stop - start);
            }

            json = substr(json, stop + 1, length(json) - stop)
        }
    }'
}

for line in $(cat microProject.json); do
  result=$(getJsonValuesByAwk "$line" "$entry" "defaultValue")
done

sed -i "s/ENTRYNAME/${result}/g" default.conf

```

- 注意：entry 的值为"static/js/app.js"时，有"/"，sed 处理时会报错，改成"static\\/js\\/app.js"，就可以了，需要添加两个"\"进行转义

# shell 判断字符串是否在数组中

```
#!/bin/sh
##数组
array=(
address
base
cart
company
store
)


# $1 如果存在，输出 $1 exists，$1 如果不存在，输出 $1 not exists
if [ "$1" != null ];then
 if [[ "${array[@]}" =~ "${1}" ]]; then
 echo "$1 exists"
 elif [[ ! "${array[@]}" =~ "${1}" ]]; then
 echo "$1 not exists"
 fi
else
 echo "请传入一个参数"
fi
```
