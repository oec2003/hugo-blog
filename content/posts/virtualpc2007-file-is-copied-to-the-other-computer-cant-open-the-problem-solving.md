---
title: VirtualPC2007的文件复制到其他电脑不能打开的问题解决
date: 2011-03-04
categories: [技术]
tags: [Virtual PC, 小技巧]
---

在使用VirtualPC的时候，我一般都习惯保存当前状态的方式关机，这样在下次使用的时候可以保证继续我上次的工作状态。最近我将保存状态的VirtualPC2007的文件拷贝到另一台电脑中，然后用VirtualPC2007去添加，我选择的是已经存在的虚机，这时会报一个错误，如下图：

![201103040011](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290625609.png)

经过查询得知，解决此问题的方法为启动VirtualPC后，按照添加新的虚机的方法去做，直到提示要选择硬盘的时候，选择已经存在的虚机硬盘，然后选择要添加虚机的vhd文件。这样就可以顺利的添加成功了。

这时复制过来的虚机文件中的vmc文件还是以前的保存了状态的那个文件，新的vmc文件在目录C:\Users\Administrator\Documents\My Virtual Machines\虚机的名字 目录下，可以将此文件替换原来的vmc文件。

吃一堑长一智，以后如果要将虚机拷贝到别的电脑上用，一定要先将虚机关机。

