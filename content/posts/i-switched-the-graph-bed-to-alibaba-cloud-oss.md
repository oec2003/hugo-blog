---
title: 我将图床换到了阿里云 OSS
date: 2023-01-14T09:36:56+08:00
categories: [成长]
tags: [博客,图床]
---

关于博客的图床，一直都是白嫖，最早放过七牛云，然后经历过一次惨痛的迁移，才知道便宜的东西才是最贵的，后来存放到 Github 中，然后使用 jsdelivr 的 CDN 加速，最近发现 jsdelivr 的 CDN 也需要科学才能访问了。
<!--more-->
于是，决定图床不能再省了。

最后的方案就是使用阿里云 OSS ，最低配置 40G 就够用了，费用也很便宜，5 年 45 块钱。

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162157651.webp)

具体操作和迁移步骤如下：

1、购买阿里云的 OSS 后，创建桶（Bucket），命名为：oec2003-blog ：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156915.webp)

2、在 oec2003-blog 这个桶中创建目录 imgs 用来存放图片：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156308.webp)

3、给 oec2003-blog 这个桶进行授权，我这里给的权限是读写：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156629.webp)

4、在阿里云管理后台，点击右上角的头像，在弹窗中点击 AccesKey 管理，在该功能中创建 AccessKey，后面配置 PicGo 时会用到：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156394.webp)

5、查看 OSS 对应桶的概览，页面下方有对应的域名和节点的区域，这些信息在配置 PicGo 时会用到：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156076.webp)

5、在 PicGo 中配置阿里云 OOS，并设置为默认图床：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156235.webp)

* KeyId 和 KeySecret ：使用第四步中创建的；
* Bucket：使用第一步中创建的桶名；
* 设定存储区域和自定义域名：使用第五步中查看到的信息；
* 设定存储路径：使用第二步中创建的目录名。

6、PicGo 配置好后，就可以在 Obsidian 或 Typora 中进行上传测试，出现下图这样的地址替换说明配置成功：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156937.webp)

7、因为之前的图片都是存储在 Github 中，所以需要将 Github 仓库中的图下载到本地，然后传输到阿里云的 OSS 中，先将存储图片的仓库拉到本地：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156152.webp)

8、在 OOS 对应桶中进行文件上传：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202306162156984.webp)

9、将博客中的地址由原来地址中的 `oec2003-blog.oss-cn-shanghai.aliyuncs.com/imgs` 批量替换为 `oec2003-blog.oss-cn-shanghai.aliyuncs.com/imgs` 就可以了。

10、最后，说明下，阿里云的 OSS 除了存储包的费用 5 年 45 之外，还会产生流程的费用，不过我的博客访问量不大，这个费用会非常低。
