---
title: 免费的东西最贵
date: 2018-10-24T00:30:19+08:00
categories: [技术]
tags: [Hexo,七牛]
---

国庆期间，收到七牛的测试域名回收邮件，没细看也没怎么在意，因为我仅仅只是拿七牛的对象存储作为我博客的图床而已，但这两天发现我博客中的图片地址全部失效了，进入到七牛的管理后台，在对应的`bucket`中图片已经不能预览和下载了。
<!--more-->
![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201270856944.jpg)

既然七牛不能再用，就要想办法换地方了，一时没找到合适的图床，那就还是将图片放在自己的站点中吧。思路如下：

* 将存储在七牛中的图片下载到本地；
* 上传图片到我自己博客站点中；
* 批量替换博客中的图片地址。

## 下载存储在七牛的图片

因为七牛已过期的存储空间`oec2003`中的图片已经不能预览和下载，所以需要新建一个新的存储空间来做中转，如下图，我创建了一个`oec2003bak`的存储空间：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201270856697.jpg)

将原存储空间`oec2003`的图片迁移到新的`oec2003bak`中需要用到七牛的qshell工具，可以在[https://developer.qiniu.com/kodo/tools/1302/qshell](https://developer.qiniu.com/kodo/tools/1302/qshell)进行下载。

在命令行进入到下载解压到qshell目录中，依次执行下面的命令：

```
ln -s qshell-darwin-x64 qshell
# AK/SK 需要去 个人中心->密钥管理 看下你自己的
./qshell account [AK] [SK]
# 把过期存储空间所有文件列表保存到文件
./qshell listbucket oec2003 myfile.txt
# 过滤出文件名
cat list.txt | awk -F '\t' '{print $1}' > myfile_name.txt
# 把过期的文件列表搬迁到新的存储空间,我这里会出现让输入一个确认字符串，照着输入就行
./qshell batchcopy oec2003 oec2003bak myfile_name.txt
```

AK和SK的查找方式如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201270857762.jpg)

命令执行完成后，等待几分钟，去看新建的存储空间，会发现图片已经全部迁移过来了，新的域名有一个月的有效期，所以这些图片在一个月内是有效的。

在qshell目录中创建配置文件`download_file.conf`，文件内容如下：

```
{
    "dest_dir"   :   "/tmp/qiniu/", #存放下载文件的路径
    "bucket"     :   "oec2003bak",  #新创建的用于中转的存储空间的名称
    "prefix"     :   "",
    "suffixes"   :   "",
    "cdn_domain" :   "http://pgs486sru.bkt.clouddn.com", #新创建的存储空间的外链域名
    "referer"    :   "",
    "log_file"   :   "download.log",
    "log_level"  :   "info",
    "log_rotate" :   1,
    "log_stdout" :   false
}
```

在命令行中进入到qshell目录中，执行下面命令进行文件下载：

```
./qshell qdownload download_file.conf
```

## 上传图片到我自己博客站点中

这个步骤因人而异，我博客系统使用的是hexo，我的做法很简单，在发布目录public下的img中创建post目录，将所有下载的图片文件拷贝到post目录中。

下面就等待图片地址替换后一起将内容和图片push到服务器。

## 批量替换图片地址

图片拷贝完成后，接下来就要做批量替换链接了，老的地址如下：

>http://oec2003.qiniudn.com/fengwei_p_wechat-1.png

新的地址如下：

>http://fwhyy.com/img/post/fengwei_p_wechat-1.png

在命令行进入到`hexo`的`source/_posts`目录，执行下面命令进行批量替换：

```
sed -i -e 's#(http://oec2003.qiniudn.com#(http://fwhyy.com/img/post#g' /Users/ican_macbookpro/Documents/fengwei/hblog/source/_posts/*.md
rm *.md-e
```

替换完成后，在hexo的目录下执行下面命令发布博客内容：

```
hexo g
hexo d
```

