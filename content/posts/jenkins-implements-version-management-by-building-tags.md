---
title: Jenkins 中以构建 Tag 来实现版本管理
date: 2020-04-27T11:44:33+08:00
categories: [技术]
tags: [Jenkins]
---

好的工具和流程能使我们事半功倍，而这个过程是不断迭代和演进的。关于这一块的内容，之前写过几篇文章：


* [在团队中使用GitLab中的Merge Request工作模式](https://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247483697&idx=1&sn=5bb54ebc35bac60b141c8c982159cfdb&chksm=fb56c7f1cc214ee7c671f5a8ddfe50887803dd4a3c62f50f011fa009931622a9fe20ff69cd1b&scene=21#wechat_redirect)
* [敏捷下的需求和代码分支管理](https://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247483790&idx=1&sn=32208bf396e3b4afc9fddb5dcc05a156&chksm=fb56c74ecc214e5811b06711094e1a83ba8bf0770baea06a8c6c420654b3d70536be711817f1&scene=21#wechat_redirect)
* [不断进化的分支和需求管理](https://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247483844&idx=1&sn=b9abb7fe776b4a61fd639c979bc55c0c&chksm=fb56c704cc214e124a4d336a09334169a1bf524f876d525a4f959084f692a00ae33192b0b6d4&token=788167640&lang=zh_CN#rd)

现在又有了些新的变化和改进，之所以需要改进，肯定是遇到问题了，那么就先从问题来开始今天的文章。

<!--more-->

## 问题

问题分为两种：

**方法论的问题**：比如团队采用主干开发，主干发布的模式，但是质量得不到保证，这时通过分析讨论决定采用采用主干开发，分支发布的模式来解决，这属于从方法论层面解决问题。

**落地执行的问题**：已经知道应该采用主干开发，分支发布的模式，但在实际操作的时候，难以执行下去，这属于执行的问题。

在《不断进化的分支和需求管理》一文的最后提到会引入 release 分支和 tag，实际也这么做了，但效果并不理想，原因是执行的不严格，没有做到位，具体原因如下：

* 发布时是对分支进行构建发布，发布后再在 GitLab 中打上 tag，一忙起来很容易忘记；
* 镜像的版本也是如此。

## 解决思路

目的其实很简单，就是让代码的 tag 和镜像的 tag 能够一致，靠人工去做这些事情比想象的要更加困难，所以稍微转换了下思路就能实现自动化，也就可以解决这个问题。

* 之前提到的 release 分支只做最终的集成测试；
* 需要发布时就从 release 分支创建 tag，对 tag 来做发布，通过脚本自动创建镜像 tag 进行 push 。

流程图如下：

![](https://img.fwhyy.com/2022/202201300717594.webp)

## 实际操作

原来在 jenkins 中对分支进行发布，需要设置特定的分支，现在需要对 tag 进行发布，tag 是不断进行创建的，就需要用到 jenkisn 的参数化功能。

jenkins 的参数化需要用到 Git Parameter 插件，可以在 jenkins 的插件管理界面中直接安装，如果安装失败，可以在这个地址进行下载：[http://mirror.xmission.com/jenkins/plugins/git-parameter/latest/](http://mirror.xmission.com/jenkins/plugins/git-parameter/latest/)，更多插件的使用说明参考官网：[https://plugins.jenkins.io/git-parameter/](https://plugins.jenkins.io/git-parameter/)

具体配置步骤如下：

1、在 General 下面勾选 This project is parameterized 。

![](https://img.fwhyy.com/2022/202201300718777.webp)

* Name：参数名称，可以随便填写，在后面配置分支名称时会用到；
* Parameter Type：这里我选择 Tag，你也可以根据需要选择 Branch 或者其他类型。

2、在 Source Code Management 选择 git 进行设置 。

![](https://img.fwhyy.com/2022/202201300718458.webp)

* Branch Specifier：${tag}, tag 为第一步中输入的参数名称。

设置完成后，可以看到在构建界面中由原来的 Build Now 变成了 Build with Parameters 。

![](https://img.fwhyy.com/2022/202201300718477.webp)

3、点击 Build with Parameters 选择需要构建的 tag 就可以了 。

![](https://img.fwhyy.com/15878109099199.webp)

按照 tag 进行构建搞定后，剩下就是需要在构建脚本中获取到最新的 tag 名称，并作为参数设置到容器的环境变量和镜像的 tag 中：

* 首先进入到 jenkins 配置的程序目录，使用 `git describe --abbrev=0 --tags` 获取 tab 名称；
* 前端容器使用环境变量的方式将 tag 名称传入，并最终在界面显示；
* 容器镜像使用参数的方式拼接上 tag 名称。

完整脚本如下：

```
#!/bin/bash

docker rm -f vue_demo
echo "old container vue_demo del success"

echo "begin docker build"
if [ ! -d web ]; then
  mkdir -p web
  echo "web dir created"
fi

# "获取最新tag 名称"
cd /root/code/vue_demo
tagName=`git describe --abbrev=0 --tags`
echo "tag name is：" $tagName

cd /root/build/vue_demo
cp /root/build/vue_demo/Dockerfile ./web
cp /root/build/vue_demo/init.sh ./web
cp -r /root/code/vue_demo/dist/* ./web

echo "begin docker build"
cd web
docker build -t vue_demo .
echo "build end"

docker run -d -p 9500:80 --name vue_demo -e "tag_name=${tagName}" --restart=always  vue_demo

cd ..
rm -rf web

echo "update docker iamges start"
docker tag vue_demo:latest 10.10.10.10:8888/vue_demo:${tagName}
docker push 10.10.10.10:8888/vue_demo:${tagName}
echo "update docker iamges end"                      
```

## 最后

任何时候，如果发现事情做起来别扭，或者流程难以执行，就需要我们停下来进行思考或者和他人讨论，往往一个细小的调整或许就能带来巨大的收益。