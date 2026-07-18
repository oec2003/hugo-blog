---
title: 解决Asp.Net Ajax UpdatePanel 乱码问题
date: 2007-07-25
categories: [技术]
tags: [Ajax,AspNet]
---

UpdatePanel中当ContentComplate里面存在TextBox的时候会出现中文乱码

一般存在这样两个解决方案：

1. 在web.config里面增加下面代码。

```
<globalization fileEncoding="utf-8" requestEncoding="utf-8"
  responseEncoding="utf-8" culture="zh-CN"/>
```
<!--more-->

2. 在后台代码里面对乱码进行decoder操作

上面两种都不是好的方案，第一个可能会导致其他的页面出现问题， 第二个虽然存到数据库中的是正确的，但是，用户看到的仍然是乱码，严重影响用户体验。那么，最好的解决方法在哪里？

解决思路：我们可以通过对`web.config`文件增加` <location> `配置节来对特定文件或者目录进行`encoding`配置 ，如下：

```
<location path="此处为目录或文件名">
    <system.web>
      <globalization fileEncoding="utf-8" requestEncoding="utf-8" 

                responseEncoding="utf-8" culture="zh-CN"/>
    </system.web>
</location>
```

