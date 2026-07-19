---
title: Angular4跨域问题解决
date: 2017-09-11T23:56:42+08:00
categories: [技术]
tags: [Angular4, 跨域]
---

之前在使用Angular1.x的时候就碰到过跨域的问题，在博文《[Angularjs跨域调用Asp.Net WebAPI](http://fwhyy.com/2016/01/angularjs-cross-domain-call-webapi-asp-net/)》中有做过介绍。本文介绍下在Angular4中解决跨域问题的两种方法。

<!--more-->
## 方法一：DotNetCore API后端实现跨域

在项目中使用NuGet安装`Microsoft.AspNetCore.Cors.2.0.0`包，如下图：

![](https://img.fwhyy.com/2022/202201290819790.webp)

在项目根目录下的`Startup.cs`文件中添加如下代码：

```
public void ConfigureServices(IServiceCollection services)
{
   services.AddMvc();
   //下面代码是用来设置跨域的
	services.AddCors(options =>
	{
		options.AddPolicy("any", builder =>
		{
			builder.AllowAnyOrigin() //允许任何来源的主机访问
			.AllowAnyMethod()
			.AllowAnyHeader()
			.AllowCredentials();//指定处理cookie
		});
	});
}
```

在`Controller`中使用`using`引入相关命名空间：

```
using Microsoft.AspNetCore.Cors;
```

在需要进行跨域方法的或者类上加上跨域的特性，如下：

```
[EnableCors("any")]
[HttpGet("{id}")]
public string Get(int id)
{
    return "value1";
}
```

## 方法二：在Angular4中使用配置代理

`Angular`启动的默认端口微`4200`，假设上面写的`Core API`发布的端口为`8000`，现在在`Angular`项目的根目录下添加文件`proxy.conf.json`，文件内容如下：

```
{
    "/api": {
        "target": "http://localhost:8000"
    }
}
```

修改根目录下的`package.json`文件的配置，如下图：

![](https://img.fwhyy.com/2022/202201290819638.webp)

在`ng server`后面添加`--proxy-config`配置，指向刚刚添加的`proxy.conf.json`文件。

调用接口时具体代码如下：

```
import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import { Http } from '@angular/http';
import "rxjs/Rx";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.css']
})
export class LeftNavComponent implements OnInit {

  data:Observable<any>;
  leftNavs=[];
  constructor(public http:Http) {
    //代理启用，/api会转向到代理地址
    this.data=this.http.get("/api/leftnav").map(response=>response.json());
  }

  ngOnInit() {
    this.data.subscribe(d=>{
      this.leftNavs=d;
    });
  }
}

```
在终端中执行命令`npm start`来启动应用，可以看到执行的命令中已经带了代理参数，如下图：

![](https://img.fwhyy.com/2022/202201290820171.webp)

在浏览器中输入`http://localhost:4200`，看看是不是已经解决了跨域问题了。

