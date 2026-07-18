---
title: WordPress安装主题出错解决
date: 2013-01-07
categories: [成长]
tags: [WordPress, 主题, 错误解决]
---

将空间转移到美国空间后发现在WordPress后台安装主题时需要输入FTP地址和账号密码，如下：

![image-20220129064719906](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290647006.png)

输入地址和账号密码后，点击继续报如下错误：

```php
> PHP Warning: touch() [<a href='function.touch'>function.touch</a>]:

> Utime failed: No error in H:\root\home\oec2003-003\www\site1\fwblog\wp-admin\includes\file.php on line 179
```

解决方法：

* 1 确保WordPress的上传目录有可写权限
* 2 在wp-config.php文件的底部添加如下代码即可。

```
define('WP_TEMP_DIR',ABSPATH.'wp-content/uploads/');
```

