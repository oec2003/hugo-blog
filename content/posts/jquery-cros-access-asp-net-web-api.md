---
title: jQuery跨域调用Asp.Net Web API
date: 2015-08-15
categories: [技术]
tags: [Cros, JQuery, Web API]
---

Asp.Net Web API是一个轻量级的Web服务，当Web API和Web程序不是部署在同一域的时候，要使用jQuery来实现调用API的接口就存在跨域的问题。下面介绍两种方式来解决jQuery调用API跨域的问题。
<!--more-->
## 环境

* IIS：IIS8.0
* VS：VS2013
* .Net Framework：4.5

## 第一种方法

微软提供了一种在服务端的跨域的方法，详细步骤可以参考下面链接：

[http://www.asp.net/web-api/overview/security/enabling-cross-origin-requests-in-web-api](http://www.asp.net/web-api/overview/security/enabling-cross-origin-requests-in-web-api)

总结一下就是下面的几个步骤：

1、 使用NuGet命令Install-Package Microsoft.AspNet.WebApi.Cors 安装依赖项；

2、 WebApiConfig类修改如下，该类在App_Start目录下。

```
public static class WebApiConfig
{
    public static void Register(HttpConfiguration config)
    {
        // Web API configuration and services
        //下面一行为跨域添加的代码
        config.EnableCors();
        // Web API routes
        config.MapHttpAttributeRoutes();

        config.Routes.MapHttpRoute(
            name: "DefaultApi",
            routeTemplate: "api/{controller}/{id}",
            defaults: new { id = RouteParameter.Optional }
        );
    }
}
```

3、在Api的Controller上添加特性，如下：

```
[EnableCors(origins:"*",headers:"*",methods:"*")]
[RoutePrefix("api/pro")]
public class ProjectFilesApiController : ApiController
{
```

origins： 访问API的客户端的地址，比如http://localhost:8001 ，如有多个可以用逗号隔开，设置为*号表示任何客户端都可以访问。

## 第二种方法

第二种方法相对比较简单，只是修改下配置文件即可。

![3cefded1gw1ev2lixluhwj20jr08tq5a](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300719856.jpg)

配置文件代码如下：

```
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="Access-Control-Allow-Origin" value="*" />
        <add name="Access-Control-Allow-Headers" value="Content-Type" />
        <add name="Access-Control-Allow-Methods" value="GET, POST, PUT, DELETE, OPTIONS" />
      </customHeaders>
    </httpProtocol>

    <handlers>
      <remove name="ExtensionlessUrlHandler-Integrated-4.0" />
      <!--<remove name="OPTIONSVerbHandler" />-->
      <remove name="TRACEVerbHandler" />
      <add name="ExtensionlessUrlHandler-Integrated-4.0" path="*." verb="*" type="System.Web.Handlers.TransferRequestHandler" preCondition="integratedMode,runtimeVersionv4.0" />
    </handlers>
    <directoryBrowse enabled="true" />
  </system.webServer>
```

## 问题

上面的两种方法都可以达到跨域的效果，但是这两种方法都只支持IE10+，Chrome下没有问题。想要支持IE10以下的浏览器，需要在调用之前设置下jQuery的跨域属性，代码如下：

```
function corsTest() {
    //设置jQuery支持跨域
    jQuery.support.cors = true;
    $.ajax({
        url: "http://localhost:8010/api/pro/empty",
        type: "POST",
        dataType: "json",
        success: function (data) {
            alert(data);
        },
        error: function (a) {
            alert(a);
        }
    });
}
```

