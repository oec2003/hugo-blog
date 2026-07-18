---
title: dotNet 5 中执行 Node.js
date: 2021-08-09T08:05:00+08:00
categories: [技术]
tags: [dotNET,nodejs]
---

在[低代码产品](http://mp.weixin.qq.com/s?__biz=MzU0NjgzNzQyMw==&mid=2247484621&idx=1&sn=e23179a553c2cf80f5b2d0d351c75065&chksm=fb56c20dcc214b1b17894f1afb6070024cd1321811182d202437cea4baaecf34e69f27ad0978&scene=21#wechat_redirect)中为了扩展功能，我们在业务编排中会扩展代码块的功能，允许用户直接在界面中进行代码（Node.js、 Python）的编写，来实现取数或者赋值的一些功能。本文简单介绍下在 dotNET 5 中怎么样进行 Node.js 的调用以及怎样部署到 CentOS 和 Docker 容器中。

## 环境

- dotNET ：5
- Node.js：14.17.4
- CentOS：7.6
- Docker：19.03.13

## dotNET 5 中的代码实现

1、在 VS 中创建 WebAPI 示例项目 nodejs-demo 项目，目标框架选择 .NET 5.0。

![iShot2022-02-02 08.12.23](/Users/fengwei/Documents/my/typora-img/dotnet5-exec-node-js/iShot2022-02-02 08.12.23.jpg)

2、在项目中引入 NuGet 包：Microsoft.AspNetCore.NodeServices ,这里我使用的是 5.0 的预览版本。

![iShot2022-02-02 08.13.07](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020813752.jpg)

3、修改 Startup 类，在 ConfigureServices 方法中添加下面代码：

```
services.AddNodeServices();
```

4、在项目的根目录中创建一个名为 hello.js 的脚本文件，文件的属性中的「复制到输出目录」设置为「始终复制」，文件的内容如下：

```
module.exports = function (callback, name) {
    var msg = 'Hello,' + name;
    callback(null, msg);
};
```

5、编写一个 API 接口方法：

```
[HttpGet]
public async Task<IActionResult> Get([FromServices] INodeServices nodeServices)
{
    var result = await nodeServices.InvokeAsync<string>("hello.js", "oec2003");
    return Ok(result);
}
```

6、如果正常运行，结果如下：

![iShot2022-02-02 08.13.29](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202020813556.jpg)

## 部署到 CentOS 中

1、在 Node.js 的中文官网 (http://nodejs.cn/download/current/) 下载 Linux 二进制文件 (x64) 的安装包；

2、将下载的安装包 node-v14.17.4-linux-x64.tar.xz 复制到 CentOS 系统的 root 目录中；

3、执行命令 `tar -xvf node-v14.17.4-linux-x64.tar.xz` 解压安装文件；

4、执行命令 `mv node-v14.17.4-linux-x64 nodejs` 将解压后的文件夹命名为 nodejs；

5、执行命令 `cp -r nodejs /usr/local` 将 nodejs 目录复制到 /usr/local ；

6、执行下面的命令进行软链接：

```
ln -s /usr/local/nodejs/bin/npm /usr/local/bin/
ln -s /usr/local/nodejs/bin/node /usr/local/bin/
```

7、输入 `node -v` 进行检查，如果有版本号出现说明安装成功；

8、执行下面的命令进行 dotNET 5 安装：

```
sudo rpm -Uvh https://packages.microsoft.com/config/centos/7/packages-microsoft-prod.rpm
sudo yum install dotnet-sdk-5.0
```

9、将示例程序 nodejs-demo 发布到 pub-nodejs 目录，将发布后的目录拷贝到 CentOS 服务器的 root 目录中；

10、进入到 /root/pub-nodejs 目录，执行命令 `dotnet nodejs-demo.dll` 运行。

## 在 Docker 容器中部署

1、在 /root/pub-nodejs 目录中创建 Dockerfile 文件，内容如下：

```
FROM mcr.microsoft.com/dotnet/aspnet:5.0-buster-slim
COPY . /app
WORKDIR /app
EXPOSE 80/tcp
ENTRYPOINT ["dotnet", "nodejs-demo.dll"]
```

2、进入到 /root/pub-nodejs 目录中执行命令 `docker build -t nodejs-demo .` 进行镜像的构建；

3、执行命令 `docker run -d -p 5000:5000 --name nodejs-demo nodejs-demo` 进行容器的创建，创建成功后，还不能正常运行，因为现在容器中还没有安装 Node.js 环境；

4、容器中安装 Node.js 的方式和在 CentOS 中相同，执行命令 `docker cp nodejs 容器id:/usr/local` 将 Node.js 的包复制到容器中的 /usr/local 目录中；

5、执行 `docker exec -it 容器id bash` 进入到容器中；

6、执行下面的命令进行软链接：

```
ln -s /usr/local/nodejs/bin/npm /usr/local/bin/
ln -s /usr/local/nodejs/bin/node /usr/local/bin/
```

7、在网页中或用 Postman 进行接口的访问进行测试；

## 构建包含 Node 运行环境的基础镜像

1、通过构建镜像是使用 Dockerfile，下面使用另一种方式来构建；

2、因为在容器中部署后，容器中已经有 Node 环境了，执行下面的命令就可以将运行的容器构建成一个新的镜像：

```
docker commit -a "oec2003" -m "add nodejs" 容器id aspnet-nodejs:5.0
```

3、执行完成后，使用 `docker images` 命令可以看到新创建的 `aspnet-nodejs:5.0` ；

4、再进行镜像构建时就可以将 Dockerfile 文件内容修改如下：

```
FROM aspnet-nodejs:5.0
COPY . /app
WORKDIR /app
EXPOSE 80/tcp
ENTRYPOINT ["dotnet", "nodejs-demo.dll"]
```

5、这样构建出来的镜像中就包含了 Node 环境。
