---
title: jQuery知识总结
date: 2013-04-13
categories: [技术]
tags: [JQuery]
---

## 前言

jQuery一直都在用，但都是在用时查查手册，并没有系统的学过，最近组内做jQuery交流，花了几天时间系统了学习了下，做了个PPT，本文是根据PPT总结而来，有些地方做了些补充。希望对jQuery初学者有些帮助。

## jQuery简介

### 简介

jQuery是一个兼容多浏览器的javascript库，核心理念是write less,do more(写的更少,做的更多)。 jQuery在2006年1月由美国人John Resig在纽约的barcamp发布，吸引了来自世界各地的众多javascript高手加入，现在由Dave Methvin率领团队进行开发。如今， jQuery已经成为最流行的javascript库，在世界前10000个访问最多的网站中，有超过55%在使用jQuery 。【摘自百度百科】

### 下载地址

[http://jquery.com/](http://jquery.com/)

### 源码地址

[https://github.com/jquery/jquery](https://github.com/jquery/jquery)

可以通过 `git clone git://github.com/jquery/jquery.git`来获取源码。

### 在线文档

* [http://www.ostools.net/apidocs/apidoc?api=jquery ](http://www.ostools.net/apidocs/apidoc?api=jquery )
* [http://www.ostools.net/](http://www.ostools.net/)上有各种在线工具，在此推荐下。

### 使用jQuery

使用jQuery首先需要在页面中进行引用，如下：

```
<script type=”text/javascript” src=”Scripts/jquery-1.8.1.min.js”></script>
```

使用的代码如下：

```
$(document).ready(function () {
    $("#div1").html("hello world");
});

$(function () {
    $("#btnOK").bind("click", function () { 

    });
});
```

上面的代码相当于window.onload，不过跟window.onload还是有一些区别，后面会以表格的形式来展现他们的区别。在jQuery中到处可以见到$符号，这是jQuery里的一种简写，$("#btnOK")和jQuery("#btnOK")是等价的。

### window.onload和$(document).ready()的区别


|  | WINDOW.ONLOAD | $(DOCUMENT).READY() |
| --- | --- | --- |
| 执行时间 | 网页所有内容加载完后执行 | DOM结构加载完后就执行，效率更高 |
| 编写个数 | 1个 | 多个，多个的执行顺序取决于函数的顺序以及引用文件的顺序 |
| 是否支持简写 | 不支持 | 简写形式为：$(function(){}); |

### DOM对象和jQuery对象转换

获取DOM对象代码如下：

```
//获取DOM对象
var div1 = document.getElementById("div1");

div1.innerHTML = "oec2003";
```

获取jQuery对象代码如下:

```
//获取jQuery对象
var div1 = $("#div1");

div1.html("oec2003");
```

jQuery对象转DOM对象

```
//因为ajQuery对象是一个数组对象，所以转换为DOM对象时要用索引的形式

var $div1 = $("#div1"); //jQuery对象

var div1 = $div1[0]; //转换为了DOM对象

var div2 = $div1.get(0); //和上面一行效果一样

div1.innerHTML = "oec2003";
```

DOM对象转jQuery对象

```
//DOM对象转jQuery只需用$包装即可

var div1 = document.getElementById("div1");

var $div1 = $(div1); //转换为了jQuery对象

$div1.html("oec2003");
```

### 解决冲突

有时会有jQuery和其他的库或自己写的一些公共脚本文件一起使用的场景，就有可能会出现$冲突的问题，冲突的解决分两种情况：

1、jQuery库在其他库之后引用，如下所示：

```
<script type=”text/javascript” src=”Scripts/jquery-1.8.1.min.js”></script>

<script type=”text/javascript” src=”Scripts/common.js”></script>
```

在common.js中有对$重新定义，代码如下：

```
function $(id) {
    return document.getElementById(id);
}
```

下面是在jQuery中解决冲突的代码，有四种方式：

```
//方式1
jQuery.noConflict(); //将$控制权移交出去，以前使用$的地方都改用jQuery
jQuery(document).ready(function () {
    alert(jQuery("#span1").html());
});

window.onload = function () {
    $("span1").innerHTML = "oec2003";
}

//方式2
var $j=jQuery.noConflict(); //定义快捷方式
$j(document).ready(function () {
    alert($j("#span1").html());
});

window.onload = function () {
    $("span1").innerHTML = "oec2003";
}

//方式3
jQuery.noConflict(); //在函数内部继续使用$
jQuery(function ($) {
    alert($("#span1").html());
});

window.onload = function () {
    $("span1").innerHTML = "oec2003";
}

//方式4
jQuery.noConflict(); //在函数内部继续使用$另一种方式
(function ($) {
    $(function(){
        alert($("#span1").html());
    });
})(jQuery);

window.onload = function () {
    $("span1").innerHTML = "oec2003";
}
```

2、jQuery库在其他库之前使用

```
//如果先引用jQuery脚本，可以不使用noConflict
//jQuery.noConflict(); 
jQuery(document).ready(function () {
    alert(jQuery("#span1").html());
});

window.onload = function () {
    $("span1").innerHTML = "oec2003";
}
```

## 选择器

### 基本选择器

```
<body>
    <div>
        <div id="div1">
            aaaaaaaaaaa</div>
        <div class="c1">
            bbbbbbbbb</div>
        <span>ccccccccc</span>
    </div>
</body>

$(function () {
    $("#div1").html("hello world 1"); //根据id匹配元素（a）
    $(".c1").html("hello  world 2"); //根据Yclass匹配元素（b）
    $("span").html("hello world 3"); //根据元素名称匹配 （c）
    $("span,div.c1").html("hello world 4"); //匹配页面所有的span 和class=c1的div（b c）
    $("*").html("hello world 5"); //匹配页面所有元素,也包含body
});
```

### 层级选择器

```
<body>
    <span id="span1">
        aaaaaaaaa</span>
    <span class="c1">
        bbbbbbbbb</span>
    <div>
        ccccccccc
        <span>ddddddddd</span>
    </div>
    <div>eeeeeeeee</div>
</body>

$(function () {
    $("body span").html("hello world 1"); //选取body中所有的span（a b d）
    $("body&gt;span").html("hello world 2"); //选取body元素的子span元素(a b)
    $("span.c1+div").html("hello world 3"); //选取class为c1的span的下一个div元素，注意是同级元素
    $("span.c1").next().html("hello world 3"); //跟上行效果相同 (c)
    $("span.c1~div").html("hello world 4"); //选取class为c1的span的后面的所有div
    $("span.c1").nextAll().html("hello world 4"); //跟上行效果相同(c e)
});
```

### 基本过滤选择器

```
<body>
    <h1>header1</h1>
    <h2>header2</h2>
    <h3>header3</h3>
    <span id="span1">aaaaaaaaa</span>
    <span class="c1">bbbbbbbbb</span>
    <div>
        ccccccccc
        <span>ddddddddd</span>
    </div>
    <div>eeeeeeeee</div>
</body>

$(function () {
    $("div:first").html("hello world 1"); //选取所有div中的第一个div
    $("span:last").html("hello world 2"); //选取所有span中的最后一个
    $("span:not(.c1)").html("hello world 3"); //选取除class为c1的span外的所有span
    $("span:even").html("hello world 4"); //选取索引为偶数的span，索引从0开始
    $("span:odd").html("hello world 5"); //选取索引为奇数的span，索引从0开始
    $("span:eq(2)").html("hello world 6"); //选取指定索引的span，索引从0开始
    $("span:gt(0)").html("hello world 7"); //选取大于指定索引的span，不包含指定索引
    $("span:lt(2)").html("hello world 8"); //选取小于指定索引的span，不包含指定索引
    $(":header").html("hello world 9"); //选取页面中所有的标题元素 h1 h2 h3...
});
```

### 内容过滤选择器

```
<body>
    <span id="span1">aaaaaaaaa</span>
    <span class="c1">bbbbbbbbb</span>
    <span></span>
    <div>
        ccccccccc
        <span id="span2" class="c2">ddddddddd</span>
    </div>
    <div>eeeeeeeee</div>
</body>

$(function () {
    $("span:contains(aa)").html("hello world 1"); //选取内容包含aa的span元素
    $("span:empty").html("hello world 2"); //选取空的span元素
    $("div:has(span)").html("hello world 3"); //选取包含span的div元素
    $("span:parent").html("hello world 4"); //选取包含子元素的span元素，包含文本
});
```

### 属性过滤选择器

```
<body>
    <span id="span1">aaaaaaaaa</span>
    <span class="c1">bbbbbbbbb</span>
    <span></span>
    <div>
        ccccccccc
        <span id="span2" class="c2">ddddddddd</span>
    </div>
    <div>eeeeeeeee</div>
</body>

$(function () {
    $("span[id]").html("hello world 1"); //选取有属性id的span元素
    $("span[id=span2]").html("hello world 2"); //选取属性id等于span2的span元素
    $("span[id!=span2]").html("hello world 3"); //选取属性id不等于为span2的span元素
    $("span[id^=span]").html("hello world 4"); //选取属性id以span开始的span元素
    $("span[id$=2]").html("hello world 5"); //选取属性id以2结尾的span元素
    $("span[id*=an]").html("hello world 6"); //选取属性id包含an的span元素
    $("span[id*=an][class$=2]").html("hello world 6"); //选取属性id包含an并且class以结尾的span元素
});
```

### 子元素过滤选择器

```
<body>
   <div class="c1">
        <span>aaaaaaaa</span><span>cccccccc</span><span>dddddddd</span>
   </div>
   <div class="c1">
        <span>aaaaaaaa</span><span>cccccccc</span><span>dddddddd</span>
   </div>
   <div class="c1">
        <span>aaaaaaaa</span>
   </div>
</body>

$(function () {
    $("div.c1 :nth-child(1)").html("hello world 1"); //选取class等于c1的div的指定索引子元素
    $("div.c1 :nth-child(even)").html("hello world 2"); //选取class等于c1的div的偶数子元素
    $("div.c1 :nth-child(odd)").html("hello world 3"); //选取class等于c1的div的奇数子元素
    $("div.c1 :first-child").html("hello world 4"); //选取class等于c1的div的第一个子元素
    $("div.c1 :last-child").html("hello world 5"); //选取class等于c1的div的最后一个子元素
    $("div.c1 :only-child").html("hello world 6"); //选取class等于c1的div只有一个子元素的子元素
});
```

### 表单选择器

```
<body>
  <form id="form1" action="#">
    <input type="button" value="button1" />
    <input type="text" value="text1" />
    <input type="text" value="text2" />
    <textarea rows="8" cols="40"></textarea><br />
    <input type="checkbox" name="chk" />篮球
    <input type="checkbox" name="chk" />足球
    <input type="password" />
    <input type="hidden" /><br />
    <select multiple="multiple">
        <option selected="selected">武汉</option>
        <option selected="selected">黄冈</option>
        <option >麻城</option>
    </select>
    <input id="n" type="radio" name="s"/>男
    <input type="radio" name="s"/>女<br />
    <input type="submit" /><input type="reset" />
  </form>
</body>

$(function () {
    //表单中的表单元素
    $("#form1 :input").val("hello world 1");
    //表单中的input元素
    $("#form1 input").val("hello world 1");
    $(":text").val("hello world 2");
    $(":password").val("hello world 3");
    //男的单选框被选中
    $(":radio[id=n]").attr("checked", true);
    $(":checkbox[name=chk]").length;
    $(":submmit").val("提交");
    $(":reset").val("重置");
    $(":button").val("hello world 4");
    $(":hidden").val("hello world 5");
});
```

### 表单对象属性过滤选择器

```
<body>
  <form id="form1" action="#">
    <input type="text" disabled="disabled" value="禁用1" />
    <input type="text"  value="启用1" />
    <input type="text" disabled="disabled" value="禁用2" />
    <input type="text"  value="启用2" />
    <input type="checkbox" name="chk" value="篮球" checked="checked"/>篮球
    <input type="checkbox" name="chk" value="足球" />足球
    <input type="checkbox" name="chk" value="编程" checked="checked"/>编程
    <input type="checkbox" name="chk" value="旅游" checked="checked"/>旅游
    <select multiple="multiple">
        <option selected="selected">武汉</option>
        <option selected="selected">黄冈</option>
        <option >麻城</option>
    </select>
  </form>

$(function () {
    $("#form1 input:enabled").val("hello world 1"); //选取form表单中没有禁用的文本框
    $("#form1 input:disabled").val("hello world 2"); //选取form表单中没有禁用的文本框
    $("#form1 input:checked").attr("checked",false); //选取form表单中选的复选框
    $("select option[selected]").each(function () {
        alert($(this).val());
    });
});
```

### 使用选择器要注意的地方

```
<body>
    <div id="div#1">aaaaaaaaaaa</div>
    <div class="c[1]">bbbbbbbbb</div>
    <div class="c1">
        <div name="div">ccccccccc</div>
        <div name="div">ddddddddd</div>
        <div name="div">eeeeeeeee</div>
        <div class="c1" name="div">fffffffff</div>
    </div>
    <div class="c1" name="div">gggggggg</div>
    <div class="c1" name="div">hhhhhhhh</div>
</body>

$(function () {
    //有时在id或是class中有一些特殊字符如 [等，需要用反斜杠进行转义
    $("#div\\#1").html("hello world 1");
    $(".c\\[1\\]").html("hello world 2");
    //有没有空格的区别
    //有空格是选取class等于c1的div里面的name等于div的div（c d e f）
    $(".c1 [name=div]").html("hello world 3");
    //没有空格是选取class等于c1并且name等于div的div (f g h)
    $(".c1[name=div]").html("hello world 4");
});
```

## 几个简单的示例

折叠效果，很常用的一个功能，在写博客插入代码时，有些就支持代码折叠。实现代码如下：

```
<body>
   <div id="div">
    <h3>jQuery简ò介é</h3>
    <div id="content">
        jQuery是一个兼容多浏览器的javascript库，核心理念是write less,do more(写的更少,做的更多)。 
        jQuery在2006年1月由美国人John Resig在纽约的barcamp发布，吸引了来自世界各地的众多javascript高手加入，
        现在由Dave Methvin率领团队进行开发。如今，jQuery已经成为流行的javascript库，
        在世界前10000个访问最多的网站中，有超过55%在使用jQuery 。
    </div>
   </div>
</body>

$(function () {
    //方法1
    $("#div h3").bind("click", function () {
        if ($("#content").is(":visible")) {
            $("#content").hide();
        } else {
            $("#content").show();
        }
    });

    //方法2
    $("#div h3").toggle(function () { $("#content").hide(); },   function () { $("#content").show(); });
});
```

斑马线，这个在列表中非常常见。

```
<table id="tbl" cellpadding="0" cellspacing="0">
    <tr>
        <th>第一季度</th>
        <th>第二季度</th>
        <th>第三季度</th>
        <th>第四季度</th>
    </tr>
    <tr>
        <td>5444</td>
        <td>3453</td>
        <td>453</td>
        <td>5656</td>
    </tr>
    <tr>
        <td>5454</td>
        <td>7676</td>
        <td>4454</td>
        <td>333</td>
    </tr>
    <tr>
        <td>333</td>
        <td>556</td>
        <td>44</td>
        <td>55</td>
    </tr>
</table>

<script type="text/javascript">
    $(function () {
        //实现单双行以不同的颜色间隔
        $("#tbl tr:odd").addClass("trOdd");
        //实现点击行，改变好行的背景色
        $("#tbl tr").click(function () {
            $(this).addClass("trOdd").siblings().removeClass("trOdd");
        });

    });
</script>

<style type="text/css">
    #tbl{width:300px; border:solid 1px #666; background-color:#eee;}
    #tbl tr{ line-height:25px;}
    #btl tr th{ background-color:#ccc;color:#fff;}
    #tbl .trOdd{ background-color:#fff;}
</style>
```

CheckBox全选，列表中很常用的功能。

```
<table id="tbl" cellpadding="0" cellspacing="0">
    <tr>
        <th><input id="chkAll" type="checkbox" /></th>
        <th>第一季度</th>
        <th>第二季度</th>
        <th>第三季度</th>
        <th>第四季度</th>
    </tr>
    <tr>
        <td><input name="chk" type="checkbox" /></td>
        <td>5444</td>
        <td>3453</td>
        <td>453</td>
        <td>5656</td>
    </tr>
    <tr>
        <td><input name="chk" type="checkbox" /></td>
        <td>5454</td>
        <td>7676</td>
        <td>4454</td>
        <td>333</td>
    </tr>
</table>

<script type="text/javascript">
    $(function () {
        $("#chkAll").bind("click", function () {
            $("input[name='chk']").attr("checked", $(this).attr("checked") == undefined ? false : true);
        });
        $("input[name=chk]").each(function () {
            $(this).bind("click", function () {
                $("#chkAll").attr("checked", $("input[name=chk]:checked").length == $("input[name=chk]").length);
            });
        });

    });
</script>

<style type="text/css">
    #tbl{width:300px; border:solid 1px #666; background-color:#eee;}
    #tbl tr{ line-height:25px;}
    #btl tr th{ background-color:#ccc;color:#fff;}
    #tbl .trOdd{ background-color:#fff;}
</style>
```

## jQuery-Ajax

### 传统的实现方式

```
$(function () {
    var xmlHttp = null;
    $("#btn").bind("click", function () {
        if (window.ActiveXObject) {
            xmlHttp = new ActiveXObject("MicroSoft.XMLHTTP");
        } else if (window.XMLHttpRequest) {
            xmlHttp = new XMLHttpRequest();
        }

        xmlHttp.open("GET", "JQueryAjax.ashx?name=oec2003", true);
        xmlHttp.onreadystatechange = requestCallback;
        xmlHttp.send(null);
    });

    var requestCallback = function () {
        if (xmlHttp.readyState == 4) {
            if (xmlHttp.status == 200) {
                $("#div").html(xmlHttp.responseText);
            }
        }
    }
});
```

### $.load

```
<body>
    <input type="button" id="btn" value="Ajax" /><br />
    <div id="div"></div>
</body>

$(function () {
    //加载AjaxWebForm.aspx页面的id为adiv1的部分，参数以get形式传递
    $("#div").load("AjaxWebForm.aspx?name=oec2003 #div1", function () { });
    //加载AjaxWebForm.aspx页面的id为div2的部分，参数以post形式传递
    $("#div").load("AjaxWebForm.aspx #div2", { name1: "oec2003", age: "30" }, callBack);

    function callBack(responseText, status, xmlHttpObject) {
        alert(responseText);
        alert(status);
        alert(xmlHttpObject);
    }
});
```

### .post

```
$(function () {

    //$.get参数以json格式收集，最终在url上进行传递
    $("#btn").bind("click", function () {
        $.get("JQueryAjax.ashx", { name: "oec2003", age: "30" }, callBack);
    });
    //data的格式可以是html xml json
    function callBack(data, status) {
        $("#div").html(data);
    }
    //$.post
    $("#btn").bind("click", function () {

        $.post("JQueryAjax.ashx", { name: "oec2003", age: "30" }, callBack);
    });
    //data的格式可以是html xml json
    function callBack(data, status) {
        $("#div").html(data);
    }

});
```

### $.ajax

```
<body>
<form id="form1" action="#">
    姓名：<input name="name" type="text" id="txtName" /><br />
    年龄:<input  name="age" type="text" id="txtAge" /><br />
    <input type="button" id="btn" value="Ajax" /><br />
</form>

<div id="div"></div>
</body>

$(function () {
    $("#btn").bind("click", function () {
        $.ajax({
            type: "GET",
            url: "JQueryAjax.ashx",
            async:true, //同步还是异步，默认为异步
            dataType: "html",
            //使用serialize进行数据收集，根据type类型决定传递方式
            data: $("#form1").serialize(),
            beforeSend: function () {
                if ($("#txtName").val() != "oec2003") {
                    alert("姓名必须为aoec2003");
                    return false;
                }
            },
            complete: function () {
                //请求成功或失败均调用
            },
            success: function (data) {
                $("#div").html(data);
            },
            error: function () {
                $("#div").html("出错啦！");
            },
            global:true   //默认为atrue 表示是否出发Ajax全局事件
        });
    });
});
```

## jQuery插件

jQuery有非常丰富的插件，插件可以更高效帮助我们去完成特定的功能，下面列举的是我用到过的很常用的一些插件：

### validate

[http://plugins.jquery.com/validate/](http://plugins.jquery.com/validate/)

### form

[http://www.malsup.com/jquery/form/](http://www.malsup.com/jquery/form/)

### uploadify

[http://www.uploadify.com/download/](http://www.uploadify.com/download/)

下面链接是我10年写的一篇关于uploadify的博客，虽然现在已经跟换了很多个版本，但还是有一定的参考价值。

[http://www.cnblogs.com/oec2003/archive/2010/01/06/1640027.html](http://www.cnblogs.com/oec2003/archive/2010/01/06/1640027.html)

### autocomplete

[http://plugins.jquery.com/ui.autocomplete/](http://plugins.jquery.com/ui.autocomplete/)

### jQuery UI

[http://jqueryui.com/](http://jqueryui.com/)

### jQuery EasyUI

[http://www.jeasyui.com/index.php](http://www.jeasyui.com/index.php)

