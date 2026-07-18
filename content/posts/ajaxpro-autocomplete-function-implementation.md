---
title: AjaxPro版自动完成（Autocomplete）功能实现
date: 2009-07-13
categories: [技术]
tags: [ajaxpro, AspNet, Autocomplete]
---

07年的时候写过一篇有关自动完成(Atuocomplete)的文章 [asp.net Ajax —AutoComplete控件使用](http://www.cnblogs.com/oec2003/archive/2007/08/18/860870.html) ，那篇文章中使用的是Asp.net Ajax ControlTollKit中的一个控件，虽然那时对里面几十个控件都研究过，不过遗憾的是在实际开发中确从未用到过，鉴于现在Ajaxpro的易用性和普遍性，本文将使用ajaxpro来实现自动完成的功能。
<!--more-->

使用Ajaxpro之前，还是来重温下使用Ajaxpro的四个必备条件。

1 添加对Ajaxpro的引用。

2 配置webconfig的httpHandlers 节点，代码如下：

```
<add verb="*" path="ajaxpro/*.ashx" type="AjaxPro.AjaxHandlerFactory, AjaxPro.2"/>
```

3 在PageLoad中注册类 ，代码如下

```
AjaxPro.Utility.RegisterTypeForAjax(typeof(Autocomplete2.AjaxproDemo));
```

4 后台被调用的方法上要写上`[AjaxPro.AjaxMethod()]` 标记

本示例将采用Ajaxpro根据文本框中输入的关键字从后台取出结果返回到客户端，由于是演示后台使用List作为数据源，数据是用程序添加的，在正式使用时可以换成在数据库中取值的方式。代码如下：

前台代码：

```
<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="AjaxproDemo.aspx.cs"
  Inherits="Autocomplete2.AjaxproDemo" %>

  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "
  http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

  <html xmlns="http://www.w3.org/1999/xhtml" >
  <head id="Head1" runat="server">
      <title>Ajaxpro-Autocomplete</title>
      <style type="text/css">
      #divText
     {
         display:none;
         position:absolute;
         z-index:100;
         width:252px;
         height:200px;
         border:1px solid #6EBDD0;
         background-color:#EEF4F7;
     }

     #txtKeyword
     {
         width:250px;
         border:1px solid #6EBDD0;
     }
     </style>

     <script type="text/javascript">

         function displayDiv(id, mode) {
             var divText = document.getElementById("divText");
             if (mode) {
                 divText.style.display = "inline";
             } else {
                 divText.style.display = "none";
             }
         }

         function getText(obj) {
             var keyword = obj.value;
             var x = obj.offsetLeft;
             var y = obj.offsetTop;
             while (obj = obj.offsetParent) {
                 x += obj.offsetLeft;
                 y += obj.offsetTop;
             }

             if (keyword != "") {
                 var result = Autocomplete2.AjaxproDemo.GetText(keyword).value;
                 var divText = document.getElementById("divText");
                 if (result != "" && result!=null) {
                     //divText.style.display = "inline";
                     displayDiv("divText", true);
                     divText.style.top = (parseInt(y, 10) + 21) + "px";
                     divText.style.left = x + "px";
                     divText.innerHTML = result;
                 }
                 else {
                     displayDiv("divText", false);
                 }
             }
         }

         function setText(obj) {
             displayDiv("divText", false);
             document.getElementById("txtKeyword").value = obj.innerHTML;

         }
         function setColor(obj) {
             obj.style.backgroundColor = "#D0E4E9";
         }
         function clearColor(obj) {
             obj.style.backgroundColor = ""
         }
     </script>
 </head>
 <body>
     <form id="form2" runat="server">
     <input id="txtKeyword" type="text" onkeyup="getText(this)" />

     <!---->
     <div id="divText" runat="server" >

     </div>
     <!---->
     </form>
 </body>
 </html> 
```

后台代码：

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
//new using
using System.Data.Linq.SqlClient;
using AjaxPro;
using System.Text;

namespace Autocomplete2
{
    /// <summary>
    /// Ajaxpro-Autocomplete
    /// </summary>
    public partial class AjaxproDemo : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            AjaxPro.Utility.RegisterTypeForAjax(typeof(AjaxproDemo));
        }

        /// <summary>
        ///根据关键字匹配和关键字相符的结果返回
        /// </summary>
        /// <param name="keyWord">关键字</param>
        /// <returns></returns>
        [AjaxPro.AjaxMethod()]
        public string GetText(string keyWord)
        {
            List<Content> list = new List<Content>();
            list.Add(new Content("asp.net mvc"));
            list.Add(new Content("asp.net ajax"));
            list.Add(new Content("asp.net 教程"));
            list.Add(new Content("asp.net 视频教程"));
            list.Add(new Content("asp.net 源码"));
            list.Add(new Content("asp.net cms"));
            list.Add(new Content("asp.net 3.5"));
            list.Add(new Content("c# 数组"));
            list.Add(new Content("c# 多线程"));
            list.Add(new Content("oec2003"));
            list.Add(new Content("oec2004"));
            list.Add(new Content("oec2005"));
            list.Add(new Content("oec2006"));
            var q = list.Where(p => p.Title.StartsWith(keyWord)).Take(10);

            StringBuilder sb = new StringBuilder();
            try
            {
                if (q.Count() > 0)
                {
                    foreach (var t in q.ToList<Content>())
                    {
                        sb.Append("<div onclick=\"setText(this)\"" +
                           "onmouseover=\"setColor(this)\" " +
                           "onmouseout=\"clearColor(this)\" " +
                           "style=\"cursor:pointer;width:100%\">" +
                            t.Title + "</div>");
                    }
                }
                return sb.ToString();
            }
            catch
            {
                return "";
            }
        }
    }

    public class Content
    {
        public string Title { get; set; }

        public Content(string title)
        {
            Title = title;
        }
    }
}
```

运行结果如下图：

![2010-12-29_170842](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292118239.gif)
![2010-12-29_170928](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292118226.gif)

注：Ajax.net有Ajaxpro.dll和Ajax.dll两个版本，这两个版本在使用时有些区别。

1 webconfig的配置不一样

Ajaxpro.dll的webconfig配置如下:

```
<add verb="*" path="ajaxpro/*.ashx" type="AjaxPro.AjaxHandlerFactory, AjaxPro.2"/>
```

Ajax.dll的webconfig配置如下 :

```
<add verb="Post,Get"path="ajax/*.ashx" type="Ajax.AjaxHandlerFactory,Ajax"/>
```

2 在客户端调用后台方法时有区别

Ajax.dll在调用时直接写类名.方法名就可以，如下

```
var result = AjaxproDemo.GetText(keyword).value;
```

Ajaxpro.dll在调用时要加上命名空间，如下：

```
var result = Autocomplete2.AjaxproDemo.GetText(keyword).value;
```

[示例下载](http://files.cnblogs.com/oec2003/Autocomplete2.rar)

