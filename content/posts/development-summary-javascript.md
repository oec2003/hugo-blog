---
title: 开发总结—Javascript篇
date: 2008-05-25
categories: [技术]
tags: [javascript,小技巧]
---

本文是我在平时工作中所遇到的javascript方面的一些知识总结，主要针对在asp.net中使用脚本。
<!--more-->

1.TextBox的验证（这个其实算是正则的内容了）

```
<!--用正则表达式限制只能输入中文-->
<input type="text" onkeyup="value=value.replace(/[^\u4E00-\u9FA5]/g,'')"
onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\u4E00-\u9FA5]/g,''))" />

<!--用正则表达式限制只能输入数字-->
<input type="text" onkeyup="value=value.replace([^\d]/g,'') "
onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\d]/g,''))" />

<!--用正则表达式限制只能输入数字和英文-->
<input type="text" onkeyup="value=value.replace([\W]/g,'') "
onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\d]/g,''))" />

<!--驗證數字和小數點-->
<input   type="text"  ID="Text1"   onkeyup="value=value.replace(/[^\d|^\.]/g,'')"
onbeforepaste="clipboardData.setData('text',clipboardData.getData('text').replace(/[^\d|^\.]/g,''))">
```

上面代码中 onbeforepaste属性是防止复制粘贴

2. 判断CheckBoxList有没有选择

```
//id为CheckBoxList控件的ID
//return true 说明没有选择
function checkLocCate(id) {
    var status = true;
    var inputs = document.getElementById(id).getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type == "checkbox" && inputs[i].checked == true) {
            status = false;
        }
    }
    return status;
}
```

3.为DropDownList添加项

```
//id为DropDownList控件的ID
function addOptions(id) {
    var ddl = document.getElementById(id);
    //将DropDownList的内容清空
    ddl.options.length = 0;
    for (var i = 0; i < 10; i++) {
        //Options的第一个参数为Text值，第二个参数为Value值
        ddl.add(new Option(i, i));
    }
}
```

4.为table添加行和列

在javascript中添加行和列是通过insertRow和inertCell来实现的，看下面一个例子

```
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>AddRow</title>
    <style type="text/css">
        .BlackBorder
        {
            background-color: #000;
            font-size: 12px;
        }
        .BlackBorder tr
        {
            background-color: #fff;
        }
    </style>
</head>
<body>
    <form id="form2" runat="server">
    <div>
        <table width="400px">
            <tr>
                <td>
                    姓名：
                    <input id="txtName" style="width: 100px;" />
                    年龄：
                    <input id="txtAge" style="width: 50px;" />
                    <input id="txtAdd" type="button" value="新增" onclick="return insertRow()" />
                </td>
            </tr>
            <tr>
                <td>
                    <table id="tMemInfo" width="100%" class="BlackBorder" cellpadding="0" cellspacing="1"
                        border="0" style="padding-left: 5px;">
                        <tr style="background-color: #E0E0E0;">
                            <td style="width: 150px;">
                                姓名
                            </td>
                            <td style="width: 100px;">
                                年龄
                            </td>
                            <td>
                                管理
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
    </form>

    <script type="text/javascript">

        function insertRow() {

            var name = document.getElementById("txtName").value;
            var age = document.getElementById("txtAge").value;

            if (name == "") {
                alert("請填寫姓名");
                document.getElementById("txtName").focus();
                return false;
            }
            if (age == "") {
                alert("請填寫年龄");
                document.getElementById("txtAge").focus();
                return false;
            }

            var myTable = document.getElementById("tMemInfo");
            var objRow = myTable.insertRow(1);
            var objCell = objRow.insertCell(0);
            objCell.innerHTML = "<input type='text' style='width:100px;'  style='display:none'/><span >"
                                      + name + "</span>";
            var objCell = objRow.insertCell(1);
            objCell.innerHTML = "<input type='text' style='width:50px;'  style='display:none'/><span >"
                                      + age + "</span>";
            var objCell = objRow.insertCell(2);
            objCell.innerHTML = " <input type='button' value='取消' onclick='cancel()' style='display:none'/> " +
                     " <input type='button' value='儲存' onclick='save()' style='display:none'/>" +
                     " <input type='button' value='修改' onclick='edit()'  />" +
                     " <input type='button' value='删除' onclick='deleteRow()' />";

            document.getElementById("txtName").value = "";
            document.getElementById("txtAge").value = "";
            document.getElementById("txtName").focus();
        }

        //删除行
        function deleteRow() {
            var myTable = document.getElementById("tMemInfo");
            var trList = myTable.getElementsByTagName("tr");
            var row = 0;
            for (var i = 0; i < trList.length; i++) {
                if (event.srcElement.parentNode.parentNode == trList[i])
                    row = i;
            }
            myTable.deleteRow(row);
        }

        function cancel() {
            var e = event.srcElement.parentElement.parentElement;
            e.childNodes[0].childNodes[0].style.display = "none";
            e.childNodes[0].childNodes[1].style.display = "";
            e.childNodes[1].childNodes[0].style.display = "none";
            e.childNodes[1].childNodes[1].style.display = "";
            e.childNodes[2].childNodes[0].style.display = "none";
            e.childNodes[2].childNodes[2].style.display = "none";
            e.childNodes[2].childNodes[4].style.display = "";
            e.childNodes[2].childNodes[6].style.display = "";

        }

        function save() {
            var e = event.srcElement.parentElement.parentElement;
            e.childNodes[0].childNodes[0].style.display = "none";
            e.childNodes[0].childNodes[1].style.display = "";
            e.childNodes[1].childNodes[0].style.display = "none";
            e.childNodes[1].childNodes[1].style.display = "";
            e.childNodes[2].childNodes[0].style.display = "none";
            e.childNodes[2].childNodes[2].style.display = "none";
            e.childNodes[2].childNodes[4].style.display = "";
            e.childNodes[2].childNodes[6].style.display = "";
            e.childNodes[0].childNodes[1].innerHTML = e.childNodes[0].childNodes[0].value;
            e.childNodes[1].childNodes[1].innerHTML = e.childNodes[1].childNodes[0].value;
        }

        function edit() {
            var e = event.srcElement.parentElement.parentElement;
            e.childNodes[0].childNodes[0].style.display = "";
            e.childNodes[0].childNodes[1].style.display = "none";
            e.childNodes[1].childNodes[0].style.display = "";
            e.childNodes[1].childNodes[1].style.display = "none";
            e.childNodes[2].childNodes[0].style.display = "";
            e.childNodes[2].childNodes[2].style.display = "";
            e.childNodes[2].childNodes[4].style.display = "none";
            e.childNodes[2].childNodes[6].style.display = "none";
            e.childNodes[0].childNodes[0].value = e.childNodes[0].childNodes[1].innerHTML;
            e.childNodes[1].childNodes[0].value = e.childNodes[1].childNodes[1].innerHTML;
        }
    </script>

</body>
</html>
```

5 在javascript中setTimeOut和setInterval的區別

```
//1秒钟执行一次函数1
window.setInterval("函數1", 1000);

//延迟1秒钟执行函数2
window.setTiemout("函數2", 1000);
```

6 js获取字符串的长度

```
var str = str.replace(/[^\x00-\xff]/g, "**").length;
```

7 javascript中的一些验证

```
//去空格
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
//validate email
function IsMail(mail)
{
    var patrn = /^w+([-+.]w+)*@w+([-.]w+)*.w+([-.]w+)*$/;
    return patrn.test(mail);
}

//validate url
function IsURL(url)
{
    var regexp = /^http://[A-Za-z0-9]+.[A-Za-z0-9]+[/=?%-&_~`@[]':+!]*([^<>""])*$/;
    return regexp.test(url);
}
```

不断更新中……



