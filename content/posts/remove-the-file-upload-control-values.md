---
title: 清除上传控件 File 的值
date: 2008-07-04
categories: [技术]
tags: [javascript]
---

因为File控件的value值是只读的，所以用document.getElementById(“File1″).value=”” 并不能清楚file控件的值。
<!--more-->

可以用一下方法实现

```
<script type="text/javascript">
    function clear() {

        var file1 = document.getElementById("File1");

        file1.select();

        document.execCommand('Delete')

    }
</script>
<input id="File1" type="file" runat="server" />

<input id="btnClear" value="清空" onclick="clear()" />
```



