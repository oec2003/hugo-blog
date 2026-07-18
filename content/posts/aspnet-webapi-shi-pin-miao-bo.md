---
title: Asp.Net WebAPI 视频秒播
date: 2015-12-12
categories: [技术]
tags: [WebAPI]
---

看标题知道本文是关于WebAPI和视频播放的，关于在Web上使用的视频播放插件有很多，像flowplayer、jdplayer等等。使用这些控件通常使用服务器上物理文件的相对路径或是一个API地址返回一个视频流。通常情况下视频播放控件会将视频流全部加载后才开始播放，当视频文件较大时，这个等待时间是不能接受的，本文主要介绍怎样实现秒播。
<!--more-->
## 涉及知识点

* Asp.Net WebAPI
* Html5
* HTTP 206
* Content-Range

## WebAPI实现

[https://gist.github.com/oec2003/85f4a3fbfdf675674ee3](https://gist.github.com/oec2003/85f4a3fbfdf675674ee3)

## HTML5调用

```
<body>
    <video id="mainPlayer" width="640" height="360" 
        autoplay="autoplay" controls="controls" onloadeddata="onLoad()">
        <source src="http://10.104.15.10:8010/api/file/media/play/5656b988cbcbb513b8900b88" />
    </video>
</body>
```

## 参考

[http://www.codeproject.com/Articles/820146/HTTP-Partial-Content-In-ASP-NET-Web-API-Video](http://www.codeproject.com/Articles/820146/HTTP-Partial-Content-In-ASP-NET-Web-API-Video)

