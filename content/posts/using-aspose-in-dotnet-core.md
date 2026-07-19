---
title: dotNET Core中使用Aspose（部署Docker）
date: 2018-11-22T23:07:45+08:00
categories: [技术]
tags: [dotNET Core,Docker]
---

在`dotnet`下处理过`Office`文档的相信对`Aspose`都不陌生，`Aspose`下面的三大组件：`Aspose.Cells`、`Aspose.Slides`、`Aspose.Words`可以让我们很方便的操作`Office`文档，或者将`Office`导出为`PDF`。

<!--more-->

最近在`netcore2.1`下使用`Aspose`操作`Office`，开发人员在`Windows`下进行开发时没有任何问题，但将程序部署到`Docker`中时出现错误，本文主要介绍下解决方法。

## 环境

* netcore:2.1
* docker:18.03-ce
* CentOS:7.5
* Aspose:18.6

## 问题1

程序部署到`Docker`中，执行到下面代码的时候就会报错

```
Aspose.Cells.PdfSaveOptions xlsSaveOption = new Aspose.Cells.PdfSaveOptions();
xlsSaveOption.SecurityOptions = new Aspose.Cells.Rendering.PdfSecurity.PdfSecurityOptions();
xlsSaveOption.SecurityOptions.ExtractContentPermission = false;
xlsSaveOption.SecurityOptions.PrintPermission = false;
xlsSaveOption.AllColumnsInOnePagePerSheet = true;
wb.Save(pdf, xlsSaveOption); //出错行
```

错误信息：

>The type initializer for 'Gdip' threw an exception

解决方法：

1、下载`libSkiaSharp.so`文件放在程序的根目录；
2、修改`Dockerfile`文件如下：

```
FROM microsoft/dotnet:2.1-aspnetcore-runtime
RUN apt-get update;apt-get install libfontconfig1 -y
RUN apt-get install libgdiplus -y
RUN ln -s /usr/lib/libgdiplus.so /lib/x86_64-linux-gnu/libgdiplus.so
RUN apt-get install -y libc6-dev
COPY . /app
WORKDIR /app
EXPOSE 80/tcp
ENTRYPOINT ["dotnet", "WebAPI.dll"]
```

## 问题2

将`Word`导出为`PDF`后，中文文字不能正常显示，显示为乱码。

解决方法：

此问题的原因是因为`Docker`容器中没有`Windows`系统的字体，只需要将`Windows`系统中的字体文件拷贝到容器的相应目录即可解决。

![](https://img.fwhyy.com/2022/202201270859428.webp)

## 参考

[https://github.com/JanKallman/EPPlus/issues/83](https://github.com/JanKallman/EPPlus/issues/83)
[http://jonesie.kiwi/2018/05/16/skiasharp-on-a-linux-container/](http://jonesie.kiwi/2018/05/16/skiasharp-on-a-linux-container/)

