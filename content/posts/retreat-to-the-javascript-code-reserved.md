---
title: 给Javascript代码“预留退路”
date: 2011-06-16
categories: [技术]
tags: [javascript]
---

所谓给Javascript代码“预留退路”意思就是当用户将浏览器的Javascript功能禁用的时候，页面中使用了Javascript的地方要能够以变通的方式得以运行，而不能让用户看到出错或是点击某按钮而毫无反应，这也是用户体验很重要的一部分。

举个简单的例子来说，点击页面中的一个链接可以弹出一个新的页面，我们通常会使用window.open，代码如下：

```
<a href="#" onclick="openWin('http://baidu.com');">百度</a>
<script type="text/javascript">
    function openWin(url) {
        window.open(url, "openwin", "width=600,height=400");
    }
</script>
```

或

```
<a href="javascript:openWin1('http://baidu.com');" >百度</a>
<script type="text/javascript">
    function openWin(url) {
        window.open(url, "openwin", "width=600,height=400");
    }
</script>
```

上面的两种方法第一种将href的值设置为#，第二种使用伪协议javascript: ，这两种做法都不是很好，没有“预留退路”，当用户将浏览器的Javascript禁用后，点击链接都不是我们想要的结果，正确的做法如下：

```
<a href="http://baidu.com/"
  onclick="openWin(this.getAttribute('href'));return false;" >百ù度è</a>
 <script type="text/javascript">
     function openWin1(url) {
         window.open(url, "openwin", "width=600,height=400");
     }
 </script>
```

改进后的方法在禁用Javascript后，也会打开href中的链接地址，只是打开方式有所不同，相比上面两种已经好多了。

