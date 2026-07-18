---
title: Net4.0—Web部署工具
date: 2010-06-03
categories: [技术]
tags: [AspNet, DotNet4, 部署]
---

## VS2008的Web部署和VS2010的Web部署

VS2010的Web部署工具相较于以前的版本做了很大的改进，下面先来看看VS2010和VS2008的Web部署工具的图片：

### VS2008

![2010-05-27_143737](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300732166.png)

在VS2008种首先是弹出Publish Web对话框，点击选择路径按钮后弹出下图的对话框

![2010-05-27_143831](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300732168.png)

在这个对话框中可以选择任意一种的发布方式。

在VS2010中做了改进，将多个步骤封装在了一起，也称之为“一键部署”，让部署变得更加容易。如下图：

### VS2010

![2010-05-27_155506](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300732962.png)

在VS2010的Web项目上点击右键选择Publish或是点击VS的工具条中的Publish（如下图）都可以弹出一键部署的对话框

![2010-06-03_141655](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300732949.png)

在Publish Web对话框中，通常我们需要填写下面几项内容

* Publish profile:这个是发布的名称
* Publish method：选择发布方式，有四种（Web Deploy、FTP、File System、FPSE）
* Server Url：如果在本地可以直接填写localhost
* Site/application：发布的站点的名称，在这里我们选择发布到本机的默认站点（Default Web Site）

输入完成的对话框如下图：

![2010-06-03_143525](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300732196.png)

点击右上角的Save按钮可以将当前设置保存以便以后使用，这些配置的信息存放在项目的根目录下的一个后缀为.Publish.xml的文件中，该文件的内容如下图：

![2010-06-03_150947](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300732680.png)

点击Publish按钮后会出现错误，原因是应用程序池的运行时版本不是4.0，如下图：

![2010-05-27_142656](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300733208.png)

打开IIS7，修改默认站点的应用程序池的版本为4.0即可，如下图：

![2010-05-27_143028](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300733423.png)
![2010-05-27_143107](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300733426.png)

修改完成后，重新发布就可以看到发布成功的提示。

## VS2010Web项目中的WebConfig文件

在VS2010中的Web项目的webconfig文件和以前版本不同，会多出来debug和release两个文件，如下图：

![2010-06-03_151753](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300733922.png)

这两个文件时对应我们在编译项目时是选择的Debug还是Release，可以适应Debug和Release两种模式不同的需求。并且我们还可以自己添加新的配置文件来适应不同的需求，比如说现在需要一个测试环境下的配置文件，可以按下面步骤做：

1 打开Build-Configuration Manager对话框，如下图：

![2010-06-03_152700](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300733480.png)

2 点击New在弹出的对话框中输入文件名称Testing

![2010-06-03_153418](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300733835.png)

3 点击OK按钮Testing就会出现在下拉框中，这时再看项目中的webconfig文件下仍然只有Debug和Release两个文件，新加的Testing没有出现。在webconfig文件上点击右键，选择Add Config Transforms，Testing配置文件就会出现了，如下图：

![2010-06-03_153720](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300734304.png)
![2010-06-03_153834](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300734204.png)

4 我们可以通过修改不同的配置文件来达到在不同环境下的需求

## 构建部署包

除了通过上面介绍的传统的方式发布Web程序外，还可以通过构建部署包的形式，在Web项目右击，会发现菜单中比以前版本多出来两项：

1 Build Deployment Package：创建部署包

2 Package/Publish Settings：创建部署包的设置

![2010-06-03_155336_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300734292.png)

点击Package/Publish Settings 和打开项目的属性然后选择Package/Publish Web的效果是一样的，如下图：

![2010-06-03_155724](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300734551.png)

关于该界面中的各种配置选项，自行实验一下就都清楚了。配置好这些后，点击Build Deployment Package，就可以生成部署包了，部署包最终生成为一个zip文件，名称为项目名称。文件存放在项目下的obj\Testing\Package、obj\Debug\Package或obj\Release\Package下，这个要看是用那种模式进行发布的。

构建了部署包之后只需要生成的zip文件就可以进行部署了，有两种方式可以部署：

1 在zip文件的同目录下有个和项目同名，后缀为.deploy.cmd的文件，这是一个命令行的文件，执行文件中的一些脚本命令来进行部署，关于这种方式的部署设置在同目录下的ReadMe文件里有详细说明。这种方式的难度较大。

2 第二种方式需要借助一个名为Web Deploy的第三方软件，可以点击此处[下载](http://www.iis.net/download/webdeploy)，下载安装后，在IIS7的的站点上右击会多出“部署…”选项，如下图：

![2010-06-03_164834](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300734839.png)

我们选择导入应用程序，弹出对话框中选择之前生成的zip文件，然后顺着下一步就行了，如下图：

![2010-06-03_165355](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300734339.png)
![2010-06-03_165830_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300735229.png)
![2010-06-03_170326](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300735872.png)
![2010-06-03_170442_thumb](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300735255.png)

完成后Web程序就会部署在IIS7中了。



