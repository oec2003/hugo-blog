---
title: 体验vs2010 （功能改进篇）
date: 2009-10-24
categories: [技术]
tags: [DotNet4,vs2010]
---

下午在使用vs2010进行了一些简单的编码体验，下面谈一下和以前版本的一些不同的地方，仅限于工具的使用方面，有关Net4.0方面的知识将在以后深入研究。

首先来看下创建项目的对话框，在左边的Installed Templates里多出了几个选项，如Cloud Service、F#等。点击左边栏中的C#，在右边的模板列表中可以看到Silverlight、asp.net mvc2 已经集成在其中了。而在在选择net framework 版本的下拉框的右边有一个排序的对话框，可以根据名称对模板列表进行排序。

![2010-12-29_153755](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300643854.png)

作为一个web开发人员，当然是首先要试试asp.net web application了，点击C#下面的Web，可以在右边的模板列表中看到有Asp.net Web Application 和Empty Asp.net Web Application 两个Asp.net的模板，先来创建一个Asp.net Web Application 。会发现多了一些目录

![2010-12-29_153841](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300643911.png)

目录相对于以前的版本多了不少，而且还加入了jquery，乍一看好像是创建了Asp.net mvc项目。个人感觉在这些多出了目录用处也不是很多。如果觉得不需要这么多的自动创建的目录和文件可以选择创建Empty Asp.net Web Application 项目，这可是觉得干净的一个项目就只有一个Web.config文件

![2010-12-29_153930](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300643074.png)

说起Web.config文件，跟vs08里的Web.config文件实在是简化太多了，这个改进也是我非常喜欢的。Net4对应的CLR版本是4.0 以前的2.0、3.0.3.5的CLR版本都是2.0 ，所以Net4中的machine.config文件时和先前版本中的machine.config是并列安装的。新的.NET 4 machine.config文件现在自动注册我们以前所有的ASP.NET 标识部分（section）, 处理器和模块等。所以在项目中见到的Web.config文件时非常简洁的

```
<?xml version="1.0"?>
<configuration>

    <system.web>
        <compilation debug="true" targetFramework="4.0" />
    </system.web>
    <system.webServer>
      <modules runAllManagedModulesForAllRequests="true"/>
    </system.webServer>

</configuration>
```

在界面的编码框部分我发现了一个小细节，大家都知道我们可以以标签的形式打开很多的页面，在以前的版本中，关闭的小叉是在最右边，或者是直接再当前标签上点击右键选择关闭。在vs2010中每个标签页上都有一个关闭小叉叉，和现在很多的多标签浏览器类似，这样确实方便了不少。

![2010-12-29_154008](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300643127.png)

现在就来开始编码的体验了，发现vs2010中的代码智能提示相对于以前版本的智能提示有了一个小的改进，不过这个小小的改进还是很有用的，比如在以前版本中输入一个Response会出现所有列表，而在vs2010中会对显示的内容进行过滤只显示和Response相关的。

vs2008

![2010-12-29_154409](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300643506.png)

vs2010

![2009-10-24_221338](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300644084.png)

除了能过滤外还可以对关键词进行搜索，看下图就很清楚了，输入ind后就自动把TabIndex搜索出来了。

![2010-12-29_154545](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300644289.png)

在智能提示中还有一种比骄有趣的功能，比如Textbox有BackColor和BorderColor属性，这两个属性都是由两个单词组成，是要输入每个单词的首字母就能将这两个属性过滤出来，如下图：

![2009-10-24_223717](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300644676.png)

好了，先就写这么多吧，更多的功能还有待慢慢研究和使用。

ps 该攒钱买本了啊，我这老爷本跑vs2010还是很吃力啊

