---
title: Response.Redirect在新窗口打开 && 3.0扩展方法
date: 2009-01-07
categories: [技术]
tags: [AspNet, DotNet3.0]
---

Response.Rederect在默认情况下是在本页跳转，所以除了在js中用window.open 或是给A标签添加target属性之外，在后台似乎不能来打开新的页面，其实不然，通过设置form的target属性同样可以让Response.Rederect所指向的url在新的窗口打开。下面用三种方法来实现。
<!--more-->

1 .给form指定target属性，那么本页面中所有的Response.Rederect都将在新的窗口中打开。代码如下：

```
protected void Page_Load(object sender, EventArgs e)
{
    form1.Target = "_blank";
}
```

或
```
<form id="form2" runat="server" target="_blank">
```

2 .用脚本针对某个控件来指定form的target，代码如下：

html代码：

```
<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs"
Inherits="ResponseRedirectDemo._Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head id="Head1" runat="server">
    <title>ResponseRedirectDemo</title>
</head>
<body>
    <form id="form2" runat="server" target="_blank">
    <div>
        <asp:Button ID="Button1" runat="server" OnClick="Button1_Click"
            Text="OpenNewWindow"/>
        <asp:Button ID="Button2" runat="server" OnClick="Button2_Click"
            Text="OpenOldWindow" />
    </div>
    </form>
</body>
</html>
```

C#代码：

```
namespace ResponseRedirectDemo
{
    public partial class _Default : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            Button1.Attributes.Add("onclick", "this.form.target='_blank'");
            Button2.Attributes.Add("onclick", "this.form.target=''");
        }

        protected void Button1_Click(object sender, EventArgs e)
        {
            Response.Redirect("http://oec2003.cnblogs.com");
        }

        protected void Button2_Click(object sender, EventArgs e)
        {
            Response.Redirect("http://oec2003.cnblogs.com");
        }
    }
}
```

上面的代码中点击button1在新窗口打开，点击button2在本页打开。

3 .除了设置form的target属性，要在新的窗口打开页面就只能用open，可以写个通用的方法来实现，如下：

```
public class RedirectHelper
{
    public static void Redirect(string url,
        string target, string windowFeatures)
    {
        HttpContext context = HttpContext.Current;
        if ((String.IsNullOrEmpty(target) ||
            target.Equals("_self", StringComparison.OrdinalIgnoreCase)) &&
            String.IsNullOrEmpty(windowFeatures))
        {
            context.Response.Redirect(url);
        }
        else
        {
            Page page = (Page)context.Handler;
            if (page == null)
            {
                throw new
                InvalidOperationException("Cannot redirect to new window.");
            }
            url = page.ResolveClientUrl(url);
            string script;
            if (!String.IsNullOrEmpty(windowFeatures))
            {
                script = @"window.open(""{0}"", ""{1}"", ""{2}"");";
            }
            else
            {
                script = @"window.open(""{0}"", ""{1}"");";
            }
            script = String.Format(script, url, target, windowFeatures);
            page.ClientScript.RegisterStartupScript(page.GetType(),
                "Redirect", script, true);

        }
    }
}
```

这样就可以在程序中使用RedirectHelper.Redirect(“oec2003.aspx”, “_blank”, “”); 第三个参数为open窗口的一些属性 。但这样好像还不是很方便，在.net3.5中提供了扩展方法的特性，在这里也可以借用一下，将上面的静态方法实现为Response.Redirect的一个重载。具体代码如下：

```
public static class RedirectHelper
{
    public static void Redirect(this HttpResponse response,
        string url, string target, string windowFeatures)
    {
        if ((String.IsNullOrEmpty(target) ||
            target.Equals("_self", StringComparison.OrdinalIgnoreCase)) &&
            String.IsNullOrEmpty(windowFeatures))
        {
            response.Redirect(url);
        }
        else
        {
            Page page = (Page)HttpContext.Current.Handler; if (page == null)
            {
                throw new
                InvalidOperationException("Cannot redirect to new window .");
            }
            url = page.ResolveClientUrl(url);
            string script;
            if (!String.IsNullOrEmpty(windowFeatures))
            {
                script = @"window.open(""{0}"", ""{1}"", ""{2}"");";
            }
            else
            {
                script = @"window.open(""{0}"", ""{1}"");";
            }
            script = String.Format(script, url, target, windowFeatures);
            ScriptManager.RegisterStartupScript(page,
                typeof(Page), "Redirect", script, true);
        }
    }
}
```

将该类添加到项目中后，在程序中输入Response.Redirect会发现该方法有三个重载了，这样再结合前面的form的target 就非常方便了。

