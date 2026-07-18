---
title: 消除window.close()的提示窗口
date: 2009-01-08
categories: [技术]
tags: [javascript]
---

Window.close()这句脚本是用来关闭当前窗口，如果是在window.open的窗口中执行Window.close()，将会很顺利地将窗口关闭，但如果是在一非window.open打开的窗口中执行Window.close()，将会弹出一个提示窗口，如下：

![2010-12-30_124855](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201300636671.gif)

要在程序中消除这个提示框也很简单，不过在IE6和IE7稍有不同

1. IE6

```
<html xmlns="http://www.w3.org/1999/xhtml" >
<head id="Head1" runat="server">
    <title>IE6Close</title>
    <script type="text/javascript">
    function closeWin()
    {
        window.opener=null;
        window.close();
    }
    </script>
</head>
<body>
    <form id="form2" runat="server">
    <div>
        <input id="btnClose" type="button" value="close"  onclick="closeWin()"/>
    </div>
    </form>
</body>
</html>
```

2.IE7

```
<html xmlns="http://www.w3.org/1999/xhtml" >
<head id="Head1" runat="server">
    <title>IE7Colse</title>
    <script type="text/javascript">
    function closeWin()
    {
        window.open('','_self','');
        window.close();
    }
    </script>
</head>
<body>
    <form id="form2" runat="server">
    <div>
        <input id="btnClose" type="button" value="close" onclick="closeWin()"/>
    </div>
    </form>
</body>
</html>
```

