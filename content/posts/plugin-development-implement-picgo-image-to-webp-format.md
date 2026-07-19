---
title: 插件开发：实现 PicGo 图片转 webp 格式
date: 2023-08-28T09:18:14+08:00
categories: [技术]
tags: [插件开发, PicGo]
---

我写一些文档或者公众号文章使用的是  Typora，如果涉及到文章中有图片时，直接复制图片粘贴到 Typora 中，然后使用  PicGo 上传到图床。

<!--more-->

这样不管是发布公众号（公众号会从图床下载然后上传）还是博客，图片地址的问题就解决了。但会有另外一个问题，网上下载的图片或者截图的图片通常比较大，现在我都是手动将文件转为 webp 格式，然后重新复制到 Typora 中，非常麻烦。

后来发现  PicGo 有插件机制，一个想法就诞生了：

* 在 Typora 点击右键上传图片时，PicGo  插件接收到图片地址并将图片转为 webp 格式，存储到本地，返回给  PicGo  新的 webp 文件的地址；
* PicGo 接收到新的地址进行图床的上传。

下面就来讲解下怎样来实现这个插件的开发。

## 环境

* node：v16.18.1
* npm：9.1.2
* PicGo：2.3.1
* TypeScript：5.1.6

## 写代码前的准备

1、全局安装  picgo

```
sudo npm install picgo -g
```

2、使用  picgo  命令创建一个插件项目

```
picgo init plugin convert-to-webp
```

PicGo 的插件名称要求必须带有前缀：`picgo-plugin` ，否则不能识别，使用  picgo 脚手架创建插件项目时，后面的名称只需写真实名称即可，否则前缀会重复。

执行上面命令后，会有命令行的向导，需要填写一些关键信息，代码如下：

```
? Plugin name: convert-to-webp
? Plugin description: convert image to webp
? author: oec2003
? Choose modules you want to develop:
 ◯ uploader
 ◯ transformer
❯◯ beforeTransformPlugins
 ◯ beforeUploadPlugins
 ◯ afterUploadPlugins
 
Your plugin is just used in CLI? (Y/n) n
? Use TS or JS? (Use arrow keys)
❯ Yes, use TS Project(recommended) 
  Yes, use JS Project 
? Your plugin has some shortcut for GUI? (Y/n) n
```

3、向导中推荐使用  TS  语言，我这里使用的就是默认选项，所以需要全局安装  typescript：

```
npm install -g typescript
```

4、本插件的目的需要将上传的图片转为  webp  格式，需要  sharp 库，安装命令如下：

```
npm install -g sharp
npm install @types/sharp --save-dev
```

## 编写代码

1、使用脚手架创建的代码只有一个 index.ts 文件，如下图：

![](https://img.fwhyy.com/2023/202308272138599.webp)

2、在根目录中执行`npm install` 安装依赖。

3、index.ts 代码如下：

```typescript
import path from 'path';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import { PicGo } from 'picgo'

export = (ctx: PicGo) => {
  const handle = async (ctx: PicGo): Promise<PicGo> => {
    // ctx.input 是一个数组，因为都是单个文件上传，所以取数组中第一个数据就行
    // imgPath 得到的就是文件的本地路径
    let [imgPath] = ctx.input;
    let imgExt= path.extname(imgPath);
    //如果上传的就是 webp 格式的文件直接返回
    if (imgExt === '.webp') {
      return ctx;
    }
    //将文件转为 webp 格式的流
    let imgBuffer = await sharp(imgPath)
      .webp()
      .toBuffer();

    //得到 webp 文件的本地路径
    const webpPath =path.join(path.dirname(imgPath), path.basename(imgPath, imgExt) + '.webp');
    //将 webp 文件写入本地，我是想要在本地保留 webp 文件的备份
    // 如果不需要，也可以在 afterUploadPlugins 事件中将本地文件删除
    await fs.writeFile(webpPath, imgBuffer);

    //将新的 webp 地址包装为数组返回给  ctx 的 input 对象 
    ctx.input = [webpPath]

    return ctx;
  };

  const register = () => {
    //注意：此处需要使用 beforeTransformPlugins 事件
    ctx.helper.beforeTransformPlugins.register('picgo-plugin-convert-to-webp', {
      handle
    });
  }
  
  return {
    register
  }
}
```

4、执行命令 `npm run build` 进行打包，打包后会生成 dist 目录，如下图：

![](https://img.fwhyy.com/2023/202308272138899.webp)

## 安装

1、在 PicGo 的插件设置中，导入本地插件：

![](https://img.fwhyy.com/2023/202308272139541.webp)

2、目录选择 dist 目录所在的目录：

![](https://img.fwhyy.com/2023/202308272139700.webp)

3、安装成功后如下图：

![](https://img.fwhyy.com/2023/202308272139512.webp)

4、这时可以截图粘贴到 Typora 中，点击右键上传图片：

![](https://img.fwhyy.com/2023/202308272139551.webp)

上传成功后，会发现已经变成了 webp 格式：

![](https://img.fwhyy.com/2023/202308272139762.webp)

## 更新插件

1、如果插件的代码有修改，可以在 package.json 文件中升级一个版本，重新打包：

![](https://img.fwhyy.com/2023/202308272141636.webp)

2、卸载插件，不卸载进行本地插件导入，会提示成功，但实际没有成功：

![](https://img.fwhyy.com/2023/202308272143098.webp)

3、重新本地导入插件。

4、导入成功后，需要更新插件：

![](https://img.fwhyy.com/2023/202308272139721.webp)

5、更新成功后，需要重启才能生效：

![](https://img.fwhyy.com/2023/202308272140389.webp)

6、重启后，如果看到版本变为 1.0.1 表示更新成功：

![](https://img.fwhyy.com/2023/202308272140314.webp)

## 调试

在导入本地插件或者进行图片上传的过程中，有可能会出现错误，错误日志会记录在 picgo.log 文件中，在 Mac 系统中，该文件的路径如下：

```
~/Library/Application\ Support/picgo/picgo.log
```

比如：我们在代码中可以通过下面的代码来输出日志：

```
ctx.log.info('ctx.input.path'+imgPath)
```

在 picgo.log 中就会输出日志：

![](https://img.fwhyy.com/2023/202308272140648.webp)

通过这个日志文件的内容，可以进行错误的排查。

## 源码

本插件的源码已经上传到 Github，地址如下：

https://github.com/oec2003/picgo-plugin-convert-to-webp

















