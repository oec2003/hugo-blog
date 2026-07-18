---
title:  Ajax,其实并不难
date:  2007-07-23
categories: [技术]
tags:  [Ajax,AspNet]
---

Ajax是一种应用技术的缩写，全称为`Asynchronous Javascript And XML `,这种技术的使用可以更好地提高用户的体验。组成这种技术的主要因素有：`javascript`语言，`css`样式表，`XMLHttpRequest`数据交换对象和`Dom`对象。
<!--more-->
`XMLHttpRequest`对象是`ajax`技术的关键，它是依附于浏览器的一个组件。在`IE`和`firefox`两种不同的浏览器中，

`XMLHttpRequest`对象的声明也不同，通常我们需要判断一下浏览器再创建对象，代码如下：

```
var xmlhttp;
function createRequest() {
    if (window.ActiveXObject) {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    else if (window.XMLHTttpRequest) {
        xmlhttp = new XMLHttpRequest();
    }
}
```

创建好`http`对象后，下一个步骤是加载数据所在的服务器。Ajax可以从其他网站获取数据，也可以从`xml`中获取，

语法如下：

*   xmlHttp.open(method, url, bool)
*   method 表示http的请求方法，一共有5种方法：get,post,head,put,delete,其中比较常用的是get和post
*   url表示数据的地址，如果是本地地址就指定具体的路径，如果是其他的网站的数据就指定完整的url地址。

bool表示是否使用异步获取，true表示异步，false表示同步。如下：

```
xmlHttp.open("get", "http://blog.csdn.net/oec2003", true);
xmlHttp.open("get", "oec2003.xml", true);
```

在异步调用开始请求前，需要将状态改变时的事件和jacascript定义的方式挂钩，如下：

```
xmlHttp.onreadystatechange = oec;
function oec() {
    //4表示异步调用完成，200表示异步调用成功
    if (xmlhttp.readystate == 4 && xmlhttp.states == 200) {
        alert("哈哈，异步调用成功");
    }
}
```

当加载完请求后，还需要发送一个http请求，一般表示请求的数据。

```
xmlhttp.send(params);
```

其中params表示可选的参数，如果请求的数据不要参数可以直接在括号中写null。

最后就是处理异步获取的数据，数据的类型有两种：

*   文本型：用XMLHttp.ResponseText获取
*   ml类型：用XMLHttp.ResponseXML获取。

