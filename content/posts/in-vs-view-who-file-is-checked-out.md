---
title: 在VS中查看文件是谁签出的
date: 2011-08-20
categories: [技术]
tags: [AspNet, VSS]
---

最近的项目使用的源码管理器是VSS，有时候你想修改的文件被别人签出了，所以我们需要知道该文件是被谁签出了，好及时和他沟通。我原来的做法都是直接进入VSS管理器中进行查看，但这样很麻烦，每次都要打开VSS管理器。其实可以在VS中进行简单的设置就可以了，步骤如下：

1 在VS中的菜单上单击鼠标右键，然后选择显示“源代码管理”

![2011-08-13_160609](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300706197.png)

2 选中要查看的文件后，在源代码管理中单击“属性”

![2011-08-13_160643](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300706261.png)

3 打开第2个标签页“Check Out Status”，可以看到签出人等信息。

![2011-08-13_160833](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300706850.png)



