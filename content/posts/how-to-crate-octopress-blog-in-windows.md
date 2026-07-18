---
title: Windows下搭建Octopress博客
date: 2013-05-27
categories: [成长]
tags: [Octopress,博客]
---

## 您需要掌握的

使用Octopress来搭建博客，还是有一定门槛的，看完本文后，希望您不会觉得很难。

[Octopress](http://octopress.org/) 是一款基于 [Jekyll](http://jekyllrb.com/) 的静态站点生成系统，使用Ruby实现，所以您需要懂点Ruby的知识，其实会几个命令就行；

Octopress的博客内容是通过Markdown来书写，所以您需要了解Markdown的编写规则，[Markdown 语法说明](http://wowubuntu.com/markdown/)可以让你在几分钟之内熟悉Markdown的语法，在Windows下可以使用MarkDown Pad或是使用在线的编辑器[http://mahua.jser.me/](http://mahua.jser.me/)进行编辑；

Octopress通常会部署在[GitHub](https://github.com/)上，所以您需要会一些简单的Git命令以及Gtihub的使用。

## 准备

系统：Windows 2003 Server、Windows 7、Windows 2008R2 Server，这三个系统用下面的版本都安装成功过；

Git：[http://msysgit.googlecode.com/files/Git-1.8.1.2-preview20130201.exe](http://msysgit.googlecode.com/files/Git-1.8.1.2-preview20130201.exe)

Ruby：[http://files.rubyforge.vm.bytemark.co.uk/rubyinstaller/rubyinstaller-1.9.3-p429.exe](http://files.rubyforge.vm.bytemark.co.uk/rubyinstaller/rubyinstaller-1.9.3-p429.exe)

DevKit：[http://cloud.github.com/downloads/oneclick/rubyinstaller/DevKit-tdm-32-4.5.2-20111229-1559-sfx.exe](http://cloud.github.com/downloads/oneclick/rubyinstaller/DevKit-tdm-32-4.5.2-20111229-1559-sfx.exe)

Python：[http://www.python.org/ftp/python/2.7.5/python-2.7.5.msi](http://www.python.org/ftp/python/2.7.5/python-2.7.5.msi)

Octopress：[git://github.com/imathis/octopress.git](git://github.com/imathis/octopress.git)

## 安装

### 安装Git

Windows下安装Git很简单，一路next就可以了。

### 安装Ruby

Ruby的安装也是一路next就可以，不过记得勾选“Add Ruby executables to your PATH”，将Ruby的执行路径加入到环境变量中，如果忘记勾选，也可以手动设置。安装完后可以在命令提示符中输入ruby –version 来确认是否安装成功。

### 安装DevKit

DevKit下载下来的是一个自压缩文件，我们将其解压到D:/DevKit，有两点需要注意：

* 解压目录中没有有中文和空格；
* 必须先安装Ruby，而且Ruby需要是RubyInstallser安装。

解压DevKit后，在命令行输入以下命令来进行安装：

```
d: 
cd DevKit
ruby dk.rb init 
ruby dk.rb install
```

### 安装Python

安装Python,也是一路next就可以，博客的代码高亮用到了Python的Pygments模块，在Python中安装第三方库需要使用easy_install，在下面地址下载跟Python相对应的安装程序安装后就可以使用easy_install了。

[https://pypi.python.org/pypi/setuptools](https://pypi.python.org/pypi/setuptools)

easy_install会安装在Python安装目录的Scripts目录中，例如我的Python目录是C:\Python27，所以需要将C:\Python27\Scripts目录加入到环境变量中才能在命令提示符中使用easy_install命令。

在命令提示符中输入如下命令就可以安装Pygments了。

```
easy_install pygments
```

### 安装Octopress

首先在GitBash中输入如下命令将Octopress代码拉到本地，

```
cd d:/GitProject
git clone git://github.com/imathis/octopress.git octopress
```

然后需要安装Octopress的依赖项，安装依赖项需要用到Ruby的gem，使用下面的命令可以更换gem的更新源，使用国内的淘宝镜像速度相对快点。

```
gem sources -a http://ruby.taobao.org/
gem sources -r http://rubygems.org/
gem sources -l
```

修改Octopress目录下的Gemfile文件，将第一行的[http://rubygems.org/](http://rubygems.org/) 修改为[http://ruby.taobao.org/](http://ruby.taobao.org/)

在命令提示符中进入到Octopress目录，输入下面命令进行依赖项的安装

```
gem install bundler
bundle install
```

输入下面的命令来安装Octopress的默认主题

```
rake install
```

到此所有的安装工作已经结束，输入下面的命令可以在本地进行预览。

```
rake preview
```

预览效果如下：

![27113147-1ad59a8165304434a89f6573bbc1cdb8](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300659290.png)

## 解决中文问题

如果博客中包含中文，需要进行如下设置：

1.在环境变量中设置下面的键值对

```
LANG=zh_CN.UTF-8
LC_ALL=zh_CN.UTF-8
```

2.含有中文的文件需要保存为UTF-8无BOM格式编码。

3.在Ruby的安装路径找到 文件convertible.rb

```
C:\Ruby193\lib\ruby\gems\1.9.1\gems\jekyll-0.12.0\lib\jekyll\convertible.rb
```

将27行修改为：`self.content = File.read(File.join(base, name), :encoding =&gt; 'utf-8')`

## 在Octopress中添加文章

使用下面命令可以在Octopress中添加文章

![27113202-1205db84b8574b35b872a518d77a6c03](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300700883.png)

注意，rake new_post['my first octopress blog']中的my first octopress blog 并不是博客标题，而是和生成的文件名以及url地址有关，该名称不支持中文。博客标题可以在生成的markdown文件中修改。生成的markdown文件在octopress/source/_posts目录中。

编辑markdown文件，将标题可以修改为中文标题，还可以设置分类等信息以及编写正文部分

![27113213-106d9af8489a4dcf9a1acb031ffdfd41](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300700367.png)

每次执行了添加博客的命令，或是修改了现有博客的内容后，都要执行下面命令进行重新生成

```
rake generate
```

如果之前有输入rake preview的命令提示符窗口没关，可以直接localhost:4000来进行预览，否则需要重新执行下rake preview才能进行预览。

## 将Octopress发布到Github

首先需要您有一个Github的账号，并且知道怎么样将Git项目推送到Github上，具体配置可以参考我之前的博文《[Windows 下使用Git管理Github项目](http://blog.fwhyy.com/2012/02/use-git-manage-github-project-on-windows/)》

登录到Github，创建一个名为username.github.com的repository，例如我创建的为oec2003.github.com；

在命令提示符中进入到Octopress目录，输入下面命令：

```
rake setup_github_pages
```

按照提示输入新建的repository的地址，例如我的地址为：

```
git@github.com:oec2003/oec2003.github.com.git
```

执行命令rake deploy 就可以将本地的内容发布到Github上。

最后需要将Octopress的源文件推送到Github的Source分支上，执行下面命令即可：

```
git add .
git commit -m “your message”
git push origin source
```

## 总结

如果喜欢写博客有很多的平台可以选择，像博客园就是Net平台下很好的博客平台，如果想搭建自己的个人博客有独立的域名，WordPress是不错的选择，如果您喜欢折腾，不妨试试Octopress。在环境搭建好的情况下，使用Octopress写博客大致有一下几个步骤：

* 执行rake new_post[‘title’]来生成一个博文；

* 找对生成的markdown文件，编辑内容，当然是使用markdown语法来编辑；

* 执行rake generate来生成文章；

* 执行rake preview在本地预览；

* 执行rake deploy发布到Github中。

* 执行下面命令将修改的源码推送到source分支：

```
git add .
git commit -m “your message”
git push origin source
```

在安装的过程中可能会碰到各种问题，根据错误提示信息google，肯定会找到答案。

最后推荐一个安装Octopress的视频：

[http://happycasts.net/episodes/36?autoplay=true](http://happycasts.net/episodes/36?autoplay=true)

