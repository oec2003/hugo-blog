---
title: 解决AJAX中使用UpdatePanel后再用Response.Write();无法弹出对话框问题
date: 2008-01-19
categories: [技术]
tags: [Ajax,AspNet,错误解决]
---

在AJAX支持的网站中使用想使用Response.Wrie(‘’); 或 Page. RegisterStartupScript (); 弹出一些提示对话框，没有效果。有如下三种解决方法：
<!--more-->

1 System.Web.UI.ScriptManager.RegisterStartupScript来替代Page.ClientScript.RegisterStartupScript

函数原型：

```
System.Web.UI.ScriptManager.RegisterStartupScript（Contrl control, Type type,string key,string script, bool addScriptTags）;
```

参数：

* control:要要注册此段javascript语句的控件ID,如下面示例的按钮ID btnUnReport
* type:这个参数是注册脚本块控件的类型,即updatepanel的类型。一般直接用this.GetType()即可
* key:为要执行的javascirpt语句起的名字，可以随便起，类似控件的name属性
* script:javascript语句
* addScriptTags:为true时，前边的script参数可以不用再写javascript标签；为false,则需自己为script参数添加<script language=’javascript’></script>标签。

注：要多传一个Control参数，如果这个control在UpdatePanel里，则运行脚本，如果这个control不在UpdatePanel则不运行这段脚本。

例如:

```
System.Web.UI.ScriptManager.RegisterStartupScript(btnTestthis.GetType(), "test",
        "alert('test');window.close();", true);
```

2 注册DataItem方法

前台代码

```
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="WebForm1.aspx.cs" Inherits="WebForm1" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>无标题页</title>
</head>
<body>
    <form id="form1" runat="server">
    <asp:ScriptManager ID="ScriptManager1" runat="server">
    </asp:ScriptManager>

    <script type="text/javascript">
        Sys.WebForms.PageRequestManager.getInstance().add_pageLoading(
            function(sender, e) {
                var dataItem = e.get_dataItems()["<%= this.UpdatePanel1.ClientID %>"]();
                    alert(dataItem.Name);
            });
    </script>

    <div>
        <asp:UpdatePanel ID="UpdatePanel1" runat="server">
            <ContentTemplate>
                <asp:Button ID="test" runat="server" Text="test" OnClick="test_Click" />
            </ContentTemplate>
        </asp:UpdatePanel>
    </div>
    </form>
</body>
</html>
```

后台代码

```
using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Web.Script.Serialization;

public partial class WebForm1 : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }
    protected void test_Click(object sender, EventArgs e)
    {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        ScriptManager.GetCurrent(this.Page).RegisterDataItem(this.UpdatePanel1,
            "var _f = function(){alert('Hello World!');}; _f;", true);

    }

}
```

3 使用Javascript的非模态对话框弹出提示

```
Page.RegisterStartupScript("alert",
  "<script language='javascript'>window.showModelessDialog("javascript:alert('test');window.close();",
  "","status:no;resizable:no;help:no;dialogHeight:height:30px;dialogHeight:40px;")</script>"); 
```

