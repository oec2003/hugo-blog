---
title: 通过修改数据库的方式禁用WordPress插件
date: 2013-01-04
categories: [成长]
tags: [WordPress,博客]
---

最近个人博客的空间到期了，之前的是香港的空间，这次看见美国空间做活动感觉比较划算就换了美国空间，需要将原空间中的程序源文件备份下来，上传到新的美国空间中，这么一折腾折腾出问题了。

为了防止垃圾评论，我在博客中安装了一个验证码的插件，这次换空间后，发现插件不能使用了（出现的图片什么都不显示），导致后台管理登陆不进去，Google之，发现可以通过修改数据库的方式来禁用插件，在wp_options表的option_name列下，找到active_plugins行 ，查询出该行的option_value值为

> a:12:{i:0;s:19:”akismet/akismet.php”;i:1;s:23:”antivirus/antivirus.php”;i:2;s:33:”configure-smtp/configure-smtp.php”;i:3;s:35:”delete-revision/delete-revision.php”;i:4;s:36:”google-sitemap-generator/sitemap.php”;i:5;s:43:”guestbook-generator/guestbook_generator.php”;i:6;s:39:”si-captcha-for-wordpress/si-captcha.php”;i:7;s:29:”wp-db-backup/wp-db-backup.php”;i:8;s:23:”wp-kit-cn/wp-kit-cn.php”;i:9;s:27:”wp-pagenavi/wp-pagenavi.php”;i:10;s:33:”wp-security-scan/securityscan.php”;i:11;s:35:”wp-utf8-excerpt/wp-utf8-excerpt.php”;}

上面值中的i:6;s:39:”si-captcha-for-wordpress/si-captcha.php”; 为验证码插件的启用代码，将其删除后保存即可。

验证码插件禁用了，登陆后却报错了，貌似是什么方法找不到了，因为不怎么熟PHP，就不纠结了，直接按之前的一篇博文《[WordPress升级其实很简单](http://blog.fwhyy.com/2012/04/wordpress-upgrade-is-very-simple/)》中的方法将WordPress升级，问题解决。

