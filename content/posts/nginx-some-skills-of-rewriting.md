---
title: Nginx：rewrite 的几个技巧
date: 2020-07-06T17:10:59+08:00
categories: [技术]
tags: [Nginx]
---

在软件的发布中，我们经常会使用到 Nginx，Nginx 的功能非常的庞杂，其中 rewrite 是一个非常常用的功能模块，本文介绍 rewrite 的基本概念和几个小技巧。

<!--more-->

rewrite 是 Nginx 中的一个模块，这个模块用来重定向页面，在 rewrite 模块中包含了几个指令来实现不同的功能：

* return
* rewrite
* if

## return 指令

return 指令是 rewrite 模块中非常常用的一个指令，可以帮助我们做重定向和一些简单的返回。

### 语法

```
return code text;
return code URL;
return URL;
```

return 指令的语法由两个或三个部分组成：
* return： 关键字
* code：http 状态码，当没有设置 code 时，默认使用 302
* text 或 URL：返回的字符串或跳转的地址

### 使用范围

* server 节点
* location 节点
* if 块中

![](https://img.fwhyy.com/2022/202201300736363.webp)

* 在 server 节点中的 return 的优先级要高于 location 节点的 return，不管 return 指令写在 location 节点的上方还是下方
* 在 return 指令中使用 code，经常会用到 301 或 302 ，区别如下：
    * 301：永久重定向，例如访问 a.com，通过 return 使用 301 重定向到了 b.com，然后修改 return 的地址为 c.com，访问 a.com，还是访问的 b.com，因为被缓存了
    * 302：临时重定向，例如访问 a.com，通过 return 使用 302 重定向到了 b.com，然后修改 return 的地址为 c.com，访问 a.com，会跳转到 c.com，不会被缓存

## rewrite 指令

可以根据指定的正则表达式将用户请求的 url 转换成一个新的 url 进行重定向。

### 语法

```
rewrite regex replacement [flag];
```

return 指令的语法四个部分组成：
* rewrite： 关键字
* regex：正则表达式，用于匹配用户请求的 url 地址
* replacement：新的 url 地址，当地址开头为 http 或 https ，默认为 302 重定向
* flag：替换后的 url 根据 flag 进行处理，flag 有四个值
    * last：使用 replacement 的地址重新进行 location 匹配
    * break：会停止后面脚本的执行
    * redirect：返回 302 重定向，地址栏显示重定向后的url
    * permanent：返回 301 重定向，地址栏显示重定向后的url

### 使用范围

* server 节点
* location 节点
* if 块中

![](https://img.fwhyy.com/2022/202201300736593.webp)

* rewrite 指令的适用范围和 return 指令的是一致的，优先级也相同
* 当 rewrite 指令和 return 指令同时存在时，如果 rewrite 最后的 flag 不是 break，会继续执行 rewrite 之后的 return 指令
* 没有指定 flag 的情况下，默认为 302 重定向

## if 指令

通过 if 指令进行一些条件的判断，然后进行 return、rewrite 或是其他的一些处理。

### 语法

```
if(condition){
}
```

### 使用范围

* server 节点
* location 节点

![](https://img.fwhyy.com/2022/202201300737754.webp)

### if 判断的一些规则

* 变量和字符串做比较，使用 = 或 !=
* 将变量和正则表达式做比较：
    * 大小写敏感：~ 或 !~
    * 大小写不敏感：~* 或 !~* ，例如上图中的示例
* 检查文件是否存在，使用 -f 或 !-f
* 检查目录是否存在，使用 -d 或 !-d

## 示例

下面以近期用到的两个场景来演示实际的用法。

### PC 端跳转到移动端

场景描述：

* PC 端发布后的地址为：192.168.0.1
* 移动端采用 H5 开发，发布后的地址：192.168.0.1:81
* 在手机上访问 PC 端地址，跳转到移动端
* PC 端和移动端使用同一个接口地址，接口地址是在 PC 端使用 /api 进行的代理
* 只有页面的请求跳转到移动端，接口的请求不需要跳转

配置如下：

```
server {
    listen       80;
    server_name  localhost;

    set $flag 0;

    if ($http_user_agent ~* (mobile|nokia|iphone|ipad|android|samsung|htc|blackberry) ) {
      set $flag "${flag}1";
    }

    if ($request_uri !~* /api/) {
      set $flag "${flag}2";
    }

    if ($flag = "012") {
       rewrite  ^(.*)    http://192.168.0.1:81? permanent;
    }

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    location /api/ {
      proxy_pass http://192.168.0.1:5000/;
    }

    error_page   500 502 503 504  /50x.html;
}
```

* 两个条件都满足的情况下，进行跳转
    * 设备类型为移动端
    * 请求的路由中不包含 /api
* 因为 if 指令的条件的限制，不能再一个 condition 中使用多条件，所以定义了一个变量 $flag 来做判断


### 将源地址中的特定参数传递到目标地址

场景描述：

* 上面的示例中，跳转到移动端后进入的是移动端的登录页面，因为没有登录人的身份
* 现在假设 PC 端的地址后有 authcode 的参数用来确定身份，除此之外还有其他的参数，例如：`http://192.168.0.1?id=xxxxx&authcode=xxxxxxxx`
* 需要再跳转后将 authcode 传递到移动端的地址后面，例如：`http://192.168.0.1:81?authcode=xxxxxxxx` 移动端可以做解析实现直接登录

配置如下：

![](https://img.fwhyy.com/2022/202201300737305.webp)

