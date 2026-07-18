---
title: jQuery boxy插件的确认框在AspNet中的应用
date: 2010-11-20
categories: [技术]
tags: [JQuery,AspNet]
---

jQuery有不少弹出框的插件，boxy应该算的上是功能和效果都还不错的一款了。先来看一张效果图吧。

![2010-11-20_134247](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290715574.png)

在Web开发中经常会使用到Alert和Confirm弹出框，在Asp.Net中的删除按钮上我们常常会加上删除的确认提示，以避免误删除数据，就像上面图片那样。我们一般会写出这样的代码。

```
<html xmlns="http://www.w3.org/1999/xhtml" >
<head runat="server">
    <title></title>
     <script type="text/javascript">
         function confirmDel() {
             return confirm("您确认要删除吗？");
         }
    </script>
</head>
<body>
    <form id="form1" runat="server">
        <asp:Button ID="btnDel" runat="server" 
               OnClientClick="return confirmDel();" Text="删除" />
    </form>
</body>
</html>
```

上面的代码很简单，confirm弹出框会有两个按钮，点击确定返回true，点击取消返回false。在boxy插件中也有confirm方法，调用代码如下：

```
$(document).ready(function() {
    $("#btnDel").click(function() {
        Boxy.confirm("您确认要删除吗？", function() { }, null);
        return false;
    });
});
```

Boxy的confirm方法有三个参数分别是确认信息内容，弹出框点击确定的回调函数，一些设置项比如标题。上面的代码中如果不加上return false，那么弹出框会闪现，然后删除按钮的后天事件还是执行了。加上return false，那么不管是点击确定还是取消都不会执行后台事件，这显然达不到我们的要求，看来只能打点击确定后的回调函数的主意了。可以在一个公用的js文件中将Boxy的confirm封装一下：

![2010-11-20_140830](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290716976.png)

页面的调用代码如下：

```
$(document).ready(function() {
    $("#Button1").click(function() { return confirmO(this, "您确认删除吗？") });

});
```

经过这样修改后，但点击弹出框的确定按钮时就会执行服务器事件了。

