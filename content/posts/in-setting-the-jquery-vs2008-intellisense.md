---
title: 在vs2008中设置jquery智能提示
date: 2009-05-20
categories: [技术]
tags: [DotNet, JQuery]
---

1  要确保您的vs2008已经打了sp1补丁，可以点击[这里](http://www.microsoft.com/downloads/details.aspx?FamilyID=27673C47-B3B5-4C67-BD99-84E525B5CE61&displaylang=zh-cn)下载

2  下载 jQuery-vsdoc.js ，如果您安装了asp.net mvc ，可以在mvc的项目下的srcipts目下找到，或是点击[这里](http://docs.jquery.com/Downloading_jQuery#Download_jQuery)下载。

![2010-12-30_104425](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300705034.gif)

3 下载安装一个vs2008支持 -vsdoc.js 智能提示的一个补丁 ，可以点击这里下载

4 准备工作已经做完，现在就可以来试试jquery的智能提示了，用vs2008新建一个项目，在页面的head标签里添加对jquery-1.3.2-vsdoc.js的引用

![2010-12-30_104506](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300705137.gif)

5 现在在js的方法中敲一个$符号，智能提示就会弹出来。

![2010-12-30_104541](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300705914.gif)

参考文章：[http://weblogs.asp.net/scottgu/archive/2008/11/21/jquery-intellisense-in-vs-2008.aspx](http://weblogs.asp.net/scottgu/archive/2008/11/21/jquery-intellisense-in-vs-2008.aspx)

