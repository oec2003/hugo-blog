---
title: 在JS方法中返回多个值的三种方法
date: 2009-12-11
categories: [技术]
tags: [javascript]
---

在使用JS编程中，有时需要在一个方法返回两个个或两个以上的数据，用下面的几种方法都可以实现：

1 使用数组的方式，如下：

```
<html>
<head>
    <title>JS函数返回多个值--oec2003</title>
</head>
<body>
    <input type="button" onclick="getNames()" value="test" />

    <script type="text/javascript">
function getData()
{
    var names=new Array("oec2003","oec2004");
    return names;
}
function getNames()
{
    var names=getData();
    alert(getData()[0]); //返回oec2003
}
</script>

</body>
</html>
```

2 将数据封装到Json中返回，如下：

```
<html>
<head>
<title>JS函数返回多个值--oec2003</title>
</head>
<body>
<input type="button" onclick="getInfo()" value="test"/>
<script type="text/javascript">
function getData()
{
    var info={"name":"oec2003","age":"25"};
    return info;
}
function getInfo()
{
    var info=getData();
    var name=info["name"];
    var age=info["age"];
    alert("姓名："+name+" 年龄："+age);
}
</script>
</body>
</html>
```

更详细的Json的介绍请看这里

3 这是最简单的一种方法，看下面代码：

```
<html>
<head>
<title>JS函数返回多个值--oec2003</title>
</head>
<body>
<input type="button" onclick="getInfo()" value="test"/>
<script type="text/javascript">
    function getData()
    {
        return ["oec2003", 25]
    }
    function getInfo()
    {
        var info = getData();
        alert("姓名：" + info[0] + "年龄：" + info[1]);
    }
</script>
</body>
</html>
```

