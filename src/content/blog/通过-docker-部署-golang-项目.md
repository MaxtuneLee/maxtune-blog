---
title: "通过 Docker 部署 Golang 项目"
pubDatetime: 2022-04-23
categories:
  - "study"
  - "运维"
tags:
  - "docker"
  - "golang"
  - "部署"
description: "前段时间开始学习 Golang 然后写了一个留言板后端的小项目（后面再写博客记录一下），在部署的时候第一次用了 Docker ，写个博客防止自己忘掉了部署的方法。"
---

前段时间开始学习 Golang 然后写了一个留言板后端的小项目（后面再写博客记录一下），在部署的时候第一次用了 Docker ，写个博客防止自己忘掉了部署的方法。

## 为什么需要用 Docker？

有人说，Docker 的出现就像集装箱一样，所谓的穿着马甲的“标准化”。想要搞懂 Docker，需要明白它的两句口号。

1. **Build, Ship and Run** 搭建、发送、运行三板斧

2. **Build once，Run anywhere** 一次构建，随处运行

从这个口号我们就能够得到几个信息：

1. 使用 Docker 时候，我们就可以避免配置文件的问题；

2. 我们可以构建自己的镜像，并且将其打包到 Docker hub 上。这样别人就可以使用你的镜像了；

3. 运行的容器可以随时进行更改或者停止。

Docker 技术的核心概念分别是

> 镜像（Image）别人存放好文档/环境的地方，只需要在 Docker hub 搜索并且下载，就即将可以使用。和 GitHub 共享代码类似，别人也会共享自己配置的镜像；
>
> 容器（Container）实现具体操作程序的地方，将本地的镜像放在容器中运行；
>
> 仓库（Repository） 自己本地下载别人的镜像，也可以把自己打包的镜像上传到 Docker hub。

就以运维中举例，我们可能会看到多种语言写出来的各种各样的东西，并且可能还有历史遗留的不同版本导致的错误。

这个时候，标准化管理显得尤其重要，这个时候就需要一个统一的操作方法。就算你只用 PHP/Java 写程序，PHP/JDK 的版本不同，加上 SQL 的不同，使用容器的不同，Nginx 或者 Apache，甚至有不知名的 Web 容器，还有自己写的 Web 容器。这样你就不可能在原生的 Linux 服务器中管理多个版本的环境。

## 部署的准备

假设我们已经完成了 Go 项目编写

[![](@assets/images/1650686231-image-1024x635.png)](https://mxte.cc/?attachment_id=271)

### 创建 Docker Image

> 镜像（image）包含运行应用程序所需的所有东西——代码或二进制文件、运行时、依赖项以及所需的任何其他文件系统对象。

总的来说，镜像（image）是定义应用程序及其运行所需的一切。

### 编写 DockerFile

要创建 Docker Image 我们必须在配置文件中指定步骤，而指定步骤的文件就是 Dockerfile

```dockerfile
#定制的镜像都是基于 FROM 的镜像，第一行是必须的
FROM golang:alpine

#这一行写的是镜像维护者的信息
MAINTAINER "Maxtune <max@xox.im>"

#指定工作目录。用 WORKDIR 指定的工作目录，会在构建镜像的每一层中都存在
WORKDIR /build

#把项目中的所有东西都复制到工作目录下面
COPY . .

#指定必要的环境变量
ENV GO111MODULE=on\
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    GOPROXY=https://goproxy.cn

# 将我们的代码编译成二进制可执行文件app
RUN go build -o app .

# 移动到用于存放生成的二进制文件的 /dist 目录
WORKDIR /dist

# 将二进制文件从 /build 目录复制到这里
RUN cp /build/app .

# 声明服务端口
EXPOSE 14514

#也可以使用 cmd 命令
#如果 Dockerfile 中如果存在多个 CMD 指令，仅最后一个生效。ENTRYPOINT 同理
ENTRYPOINT ["/dist/app"]
```

##### From

我们正在使用基础镜像`golang:alpine`来创建我们的镜像。这和我们要创建的镜像一样是一个我们能够访问的存储在Docker仓库的基础镜像。这个镜像运行的是alpine Linux发行版，该发行版的大小很小并且内置了Go，非常适合我们的用例。有大量公开可用的Docker镜像，请查看[https://hub.docker.com/\_/golang](https://hub.docker.com/_/golang)

##### Env

用来设置我们编译阶段需要用的环境变量。

##### WORKDIR，COPY，RUN

这几个命令做的事都写在注释里了，很好理解。

##### EXPORT，CMD

最后，我们声明服务端口，因为我们的应用程序监听的是这个端口并通过这个端口对外提供服务。并且我们还定义了在我们运行镜像的时候默认执行的命令`CMD ["/dist/app"]`。

### 构建Docker Image

通过下面的命令构建 Docker 镜像

```bash
docker build . -t maxtunelee/message_board
```

构建完会显示

```bash
[+] Building 40.8s (11/11) FINISHED
 => [internal] load build definition from Dockerfile                                                                                    0.1s
 => => transferring dockerfile: 32B                                                                                                     0.0s
 => [internal] load .dockerignore                                                                                                       0.1s
 => => transferring context: 2B                                                                                                         0.0s
 => [internal] load metadata for docker.io/library/golang:alpine                                                                       20.6s
 => [1/6] FROM docker.io/library/golang:alpine@sha256:4918412049183afe42f1ecaf8f5c2a88917c2eab153ce5ecf4bf2d55c1507b74                  0.0s
 => [internal] load build context                                                                                                       0.0s
 => => transferring context: 12.23kB                                                                                                    0.0s
 => CACHED [2/6] WORKDIR /build                                                                                                         0.0s
 => [3/6] COPY . .                                                                                                                      0.1s
 => [4/6] RUN go build -o app .                                                                                                        17.8s
 => [5/6] WORKDIR /dist                                                                                                                 0.2s
 => [6/6] RUN cp /build/app .                                                                                                           0.6s
 => exporting to image                                                                                                                  1.3s
 => => exporting layers                                                                                                                 1.2s
 => => writing image sha256:b301383eb9022dbf7c30b3e820e291f340a155c94d39d6f5c3bf71812022077a                                            0.0s
 => => naming to docker.io/maxtunelee/message_board
```

## 将 Docker Image 推送上制品库

我采用的是 coding 的仓库来管理 Docker 镜像

先新建一个制品仓库

[![](@assets/images/1650687214-image-1024x620.png)](https://mxte.cc/?attachment_id=272)

选择 Docker 并填写相关信息

[![](@assets/images/1650687322-image-1024x620.png)](https://mxte.cc/?attachment_id=273)

选择仓库管理

[![](@assets/images/1650687357-image-1024x620.png)](https://mxte.cc/?attachment_id=274)

选择你刚刚创建的仓库并打开操作指引

[![](@assets/images/1650687387-image-1024x620.png)](https://mxte.cc/?attachment_id=275)

填写密码并生成个人令牌复制到终端

[![](@assets/images/1650687669-image-1024x703.png)](https://mxte.cc/?attachment_id=277)

[![](@assets/images/1650687769-image-1024x134.png)](https://mxte.cc/?attachment_id=278)

回到coding，选择推送并填写相关信息，复制命令到terminal

[![](@assets/images/1650687906-image-1024x703.png)](https://mxte.cc/?attachment_id=279)

执行完成后我们再看coding的仓库，已经有镜像

[![](@assets/images/1650688007-image-1024x703.png)](https://mxte.cc/?attachment_id=280)

再次打开操作指引，选择拉取并填写相关信息

[![](@assets/images/1650688170-image-1024x621.png)](https://mxte.cc/?attachment_id=281)

通过ssh登录vps，执行拉取命令

当拉取会显示pull complete

[![](@assets/images/1650688411-image-1024x282.png)](https://mxte.cc/?attachment_id=284)

使用 `docker images` 命令查看可以看到刚刚pull新的镜像已经存在

[![](@assets/images/1650688373-image-1024x89.png)](https://mxte.cc/?attachment_id=283)

### docker run 运行镜像

使用 `docker run` 运行镜像

```bash
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
```

- **\-a stdin:** 指定标准输入输出内容类型，可选 STDIN/STDOUT/STDERR 三项；

- **\-d:** 后台运行容器，并返回容器ID；

- **\-i:** 以交互模式运行容器，通常与 -t 同时使用；

- **\-P:** 随机端口映射，容器内部端口**随机**映射到主机的端口

- **\-p:** 指定端口映射，格式为：**主机(宿主)端口:容器端口**

- **\-t:** 为容器重新分配一个伪输入终端，通常与 -i 同时使用；

- **\--name="nginx-lb":** 为容器指定一个名称；

- **\--dns 8.8.8.8:** 指定容器使用的DNS服务器，默认和宿主一致；

- **\--dns-search example.com:** 指定容器DNS搜索域名，默认和宿主一致；

- **\-h "mars":** 指定容器的hostname；

- **\-e username="ritchie":** 设置环境变量；

- **\--env-file=\[\]:** 从指定文件读入环境变量；

- **\--cpuset="0-2" or --cpuset="0,1,2":** 绑定容器到指定CPU运行；

- **\-m :**设置容器使用内存最大值；

- **\--net="bridge":** 指定容器的网络连接类型，支持 bridge/host/none/container: 四种类型；

- **\--link=\[\]:** 添加链接到另一个容器；

- **\--expose=\[\]:** 开放一个端口或一组端口；

- **\--volume , -v:** 绑定一个卷

`docker run -itd -p 14514:14514 b301`

[![](@assets/images/1700571339-image.png)](https://mxte.cc/270.html/1700571339-image)

使用apifox调试一下

[![](@assets/images/1650688704-image-1024x640.png)](https://mxte.cc/?attachment_id=287)

已经在需要的端口运行啦～

参考文章：

[Docker 学习 | 经验分享博客 (cxy621.top)](https://hexo.cxy621.top/2022/03/03/docker-xue-xi/)
