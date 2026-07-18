---
title: 解决Windows Server2008 R2中IE开网页时弹出阻止框
date: 2011-10-15
categories: [技术]
tags: [IE, win2008]
---

相信使用Windows Server2008的朋友都遇到过这种情况，用IE打开网站时会弹出“Internet Explorer增强安全配置正在阻止来自下列网站的此应用程序中的内容”的对话框。如下图所示：

![2011-10-14_205047-300x243](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301946631.png)

禁止弹出此类对话框的步骤：

1 打开服务器管理器，在”安全信息“栏的右侧点击”配置IE ESC“

![2011-10-14_204750-300x150](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301946326.png)

2 在弹出的对话框中将”管理员“和”用户“都选择为“禁用”

![2011-10-14_204830-300x289](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201301947894.png)

3 确定后，再浏览网页那烦人的弹出框就不会再出现了。

