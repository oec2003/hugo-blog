---
title: Go 学习：从环境搭建到写一个 Web 服务
date: 2022-09-19T08:20:20+08:00
categories: [技术]
tags: [golang]
topic: programming-language
series_chapter: 第四章 Go 语言
series_section: 入门与语法
series_order: 410
---

最近学习了 Go 语言，做下记录。

## Go 的来历

和 C、C++ 相比， Go 是一门很年轻的语言。2007 年，在 Google 的内部，有三位大佬因为 C++ 的复杂性、构建编译速度很慢和对并发支持不好等原因，便决定开发一门新的语言，于是他们基于 C 语言，做了功能的删减和新增，便有了 Go 的诞生。

<!--more-->

2009 年 10 月 30 日，在 Google Techtalk 上，Go 语言的初始三位创始人之一的罗伯·派克做了一次关于 Go 语言的演讲，这也是 Go 语言第一次公开露面。十天后，谷歌正式宣布 Go 语言项目开源。

2012 年 3 月 28 日，Go 1.0 版本正式发布，同时 Go 官方发布了 “Go 1 兼容性” 承诺：只要符合 Go 1 语言规范的源代码，Go 编译器将保证向后兼容（backwards compatible），这给开发者带来了安全感。

## Go 的特点

- 只有 25 个关键字，主流编程语言最少；
- 内置垃圾收集，这是相比较 C 语言而言，（C# 和 Java 也有垃圾收集）；
- 方法或变量的首字母大小写决定可见性，无需通过额外的访问修饰符，太喜欢这个了；
- 内置接口类型，为程序的组合带来方便；
- 变量初始为类型零值，避免以随机值作为初值的问题；
- 函数或方法中的错误会通过 return 语句显式地返回，调用者不能忽略对返回的错误的处理；
- 内置数组边界检查，减少越界访问带来的安全隐患；
- 内置并发支持，简化并发程序设计，这也是很多人使用 Go 语言的一个原因；
- 为了提升可读性，Go 不支持默认函数参数。
- 每个类型有自己的方法集，类型定义和方法实现是独立的。

## 相关网站

- https://golang.org : Go 原来的官网，现在访问会跳转到 go.dev ;
- https://go.dev :  Go 现在的官网；
- https://pkg.go.dev/ ：包管理；
- https://goproxy.cn/ ：傲飞开发的 Go 模块代理站，现在由七牛云托管；
- http://goproxy.io/ : 李保坤开发的 Go 模块代理站。


## 环境准备

### 版本

- Mac：10.15.7
- Go：1.19 ，目前最新的版本
- VS Code：1.71.0

### 安装

1、在 https://go.dev/dl 页面下载 Mac 版本的 pkg 安装文件：

![](https://img.fwhyy.com/2022/202209252138347.webp)

2、根据向导进行 Go 的安装，程序会安装到 /usr/local/go 目录中；

3、重启终端、输入命令 `go version` ，如果能正确显示版本号说明安装成功；

4、在 VS Code 中安装 go 扩展：

![](https://img.fwhyy.com/2022/202209252138983.webp)

5、在 VS Code 中敲 cmd+shift+p ，然后输入 Go:Install ，选择下图红框部分进行扩展工具的安装；

![](https://img.fwhyy.com/2022/202209252138893.webp)

6、全选所有的扩展工具，点击确定，但这时通常会出现错误，不能正常安装，采用下面第七步的方式可以解决这个问题：

![](https://img.fwhyy.com/2022/202209252139757.webp)

7、在 ~/.bash_profile 文件中添加：

```
export GO111MODULE=on
export GOPROXY=https://goproxy.cn
```

执行 `source ~/.bash_profile` 使配置生效，然后重新执行第六步的扩展工具安装。

8、到这环境就准备好了，可以开始写代码。

## 代码示例

### hello world

1、在 go-study 目录中创建 helloworld 目录，go-study 是我用来学习 Go 语言存放代码的一个根目录；

2、使用 VS Code 打开 helloworld 目录，并在目录中创建 main.go 文件，内容如下：

```
package main

import (
	"fmt"
)

func main() {
	fmt.Println("hello oec2003!")
}
```

3、使用 `go run main.go` 运行程序：

![](https://img.fwhyy.com/2022/202209252139306.webp)

### 一个 web 服务

假设有这样一个场景：

零代码平台涉及到很多不同的服务和中间件，在客户服务器私有化部署时需要运维人员在服务器上进行各种配置才能搞定。

如果用 go 写一个 web 程序，通过界面的简单配置和 shell 脚本的相结合，可以打打降低部署的难度。

下面就来看看怎样来做这个简单配置的 web 程序。

1、创建 deploy-app 目录，在目录中创建 main.go 文件，内容如下：

```go
package main

import (
	"embed"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
)

func main() {
	http.Handle("/", http.FileServer(getFileSystem()))
	ip, err := getLocalIP()
	if err != nil {
		return
	}
	log.Println("启动成功，通过 http://" + ip + ":10002 访问")

	server := http.Server{
		Addr: ":10002",
		Handler: nil,
	}
	server.ListenAndServe()
}

//go:embed wwwroot
var embededFiles embed.FS

func getFileSystem(useOS bool) http.FileSystem {
	if useOS {
		return http.FS(os.DirFS("wwwroot"))
	}
	fsys, err := fs.Sub(embededFiles, "wwwroot")
	if err != nil {
		panic(err)
	}
	return http.FS(fsys)
}

func getLocalIP() (ip string, err error) {
    addrs, err := net.InterfaceAddrs()
	if err != nil {
		return
	}

	for _, addr := range addrs {
		ipAddr, ok := addr.(*net.IPNet)
		if !ok {
			continue
		}
		if ipAddr.IP.IsLoopback() {
			continue
		}
		if !ipAddr.IP.IsGlobalUnicast() {
			continue
		}
		return ipAddr.IP.String(), nil
	}
	return
}
```

- package ：定义名为 main 的包，包名为 main 的包为应用程序的入口包；
- import ：导入需要使用的包;
- go:embed : embed 是在 Go 1.16 中新加的功能，通过 //go:embed 指令，可以在编译阶段将静态资源文件打包进编译好的程序中，并提供访问这些文件的能力；
- getLocalIP ：获取 IP 的一个函数；
- server.ListenAndServe() ：使用该方法可以启动一个 http 的服务器监听。

2、在 deploy-app 目录中创建 wwwroot 目录，在 wwwroot 中创建 idnex.html 文件：

```html
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>瞬翕云私有部署版</title>
<link href="css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
</style>
</head>
<body>
<div>
<div class="text">私有化部署</div>
</div>
<div>
<h2 class="ant-typography">访问地址设置</h2>
<div>例：http://fwhyy.com、http://10.211.55.3:9000（支持设置 域名、域名+端口、IP+端口）</div>
<div>访问地址</div>
<div class="input-group mb-3">
<span class="input-group-text" id="inputGroup-sizing-default">http://</span>
<input type="text" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" value="">
</div>
<button type="button" class="btn btn-primary">下一步</button>
</div>
</body>
</html>
```

3、使用 `go run main.go` 运行看看效果：

![](https://img.fwhyy.com/2022/202209252140037.webp)

在浏览器中使用 http://192.168.1.7:10002 进行访问，如下图：

![](https://img.fwhyy.com/2022/202209252140450.webp)

4、使用命令 `GOOS=linux GOARCH=amd64 go build main.go ` 进行编译构建，构建完成后会在 deploy-app 目录中生成一个名为 main 的二进制文件，如下图：

![](https://img.fwhyy.com/2022/202209252140700.webp)

5、将 main 文件拷贝到 CentOS 虚拟机中，使用 `./main` 命令运行，如下图：

![](https://img.fwhyy.com/2022/202209252140905.webp)

可以看到运行效果和本机运行的效果相同：

![](https://img.fwhyy.com/2022/202209252140135.webp)

## 总结

1、使用 embed 功能可以将静态资源打包到二进制的包中；

2、Go 语言编译后的是一个二进制文件，在服务器上不需要进行运行时的安装即可运行；

3、学习任何语言，语法部分可以通过刷刷力扣的题来进行熟悉，一个比较实用的小技巧。
