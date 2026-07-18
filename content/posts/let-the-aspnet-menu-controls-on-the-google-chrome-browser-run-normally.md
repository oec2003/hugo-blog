---
title: 让 ASP.NET Menu 控件在 Google Chrome 浏览器上正常运行
date: 2010-11-11
categories: [技术]
tags: [AspNet, Chrome]
---

最近在帮朋友做一管理系统，里面用到了Asp.Net的Menu控件，由于我的Chrome浏览器为默认，运行后发现二级菜单不能正常出来，网上查到解决方法是在项目中创建一个Others.browser文件，文件代码如下：

```
<browsers>
  <browser id="Safari3" parentID="Safari1Plus">
    <identification>
      <userAgent match="Safari/\d+\.\d+" />
    </identification>
    <capture>
      <userAgent match="Version/(?'version'\d+\.\d+)" />
    </capture>
    <capabilities>
      <capability name="browser" value="Safari3" />
      <capability name="version" value="${version}" />
    </capabilities>
    <controlAdapters>
      <adapter controlType="System.Web.UI.WebControls.Menu"
               adapterType="" />
    </controlAdapters>
  </browser>
  <browser id="GoogleChrome" parentID="Safari3">
    <identification>
      <userAgent match="Chrome/(?'version'\d+\.\d+)" />
    </identification>
    <capabilities>
      <capability name="browser" value="Googlebot" />
    </capabilities>
  </browser>
</browsers>
```

