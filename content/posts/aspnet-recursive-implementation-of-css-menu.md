---
title: Asp.net中递归实现CSS菜单
date: 2009-04-18
categories: [技术]
tags: [AspNet]
---

现在网络上有各种各样的非常漂亮的css菜单，不过大多都是静态的，菜单项都是在页面中写死的，这样就不是很灵活，每次要修改菜单都要去修改页面，下面就介绍一个从数据库中读取菜单项的动态css菜单的例子。
<!--more-->

1 首先创建数据表Menu，添加三个基本字段id pid menu

![2010-12-30_112106](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292132358.gif)

表建好后，添加一些测试数据

![2010-12-30_112140](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292132944.gif)

2 在项目中创建用户控件LeftMenu，菜单一般可以做成用户控件或是放在Masterpage中。LeftMenu中代码如下。

```
<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LeftMenu.ascx.cs"
 Inherits="LeftMenu" %>
<style type="text/css">
body { margin: 0; padding: 30px; background: #FFF; color: #666; }
h1 { font: bold 16px Arial, Helvetica, sans-serif; }
p { font: 11px Arial, Helvetica, sans-serif; }
a { color: #900; text-decoration: none; }
a:hover { background: #900; color: #FFF; }
/*CSS Code for Menu Begin:*/
/* Root = Vertical, Secondary = Vertical */
ul#navmenu,
ul#navmenu li,
ul#navmenu ul { margin: 0; border: 0 none; padding: 0; width: 160px;  list-style: none; }
ul#navmenu li { display: block !important; /*For GOOD browsers*/
display: inline; /*For IE*/ position: relative; }
/* Root Menu */
ul#navmenu a { border: 1px solid #FFF; border-right-color: #CCC;
border-bottom-color: #CCC; padding: 0 6px; display: block;
background: #EEE; color: #666; font: bold 10px/22px Verdana, Arial, Helvetica, sans-serif;
text-decoration: none; height: auto !important; height: 1%; /*For IE*/
}
/* Root Menu Hover Persistence */
ul#navmenu a:hover,
ul#navmenu li:hover a,
ul#navmenu li.iehover a { background: #CCC; color: #FFF; }
/* 2nd Menu */
ul#navmenu li:hover li a,
ul#navmenu li.iehover li a { background: #EEE; color: #666; }
/* 2nd Menu Hover Persistence */
ul#navmenu li:hover li a:hover,
ul#navmenu li:hover li:hover a,
ul#navmenu li.iehover li a:hover,
ul#navmenu li.iehover li.iehover a { background: #CCC; color: #FFF; }
/* 3rd Menu */
ul#navmenu li:hover li:hover li a,
ul#navmenu li.iehover li.iehover li a { background: #EEE; color: #666; }
/* 3rd Menu Hover Persistence */
ul#navmenu li:hover li:hover li a:hover,
ul#navmenu li:hover li:hover li:hover a,
ul#navmenu li.iehover li.iehover li a:hover,
ul#navmenu li.iehover li.iehover li.iehover a { background: #CCC; color: #FFF; }
/* 4th Menu */
ul#navmenu li:hover li:hover li:hover li a,
ul#navmenu li.iehover li.iehover li.iehover li a { background: #EEE; color: #666; }
/* 4th Menu Hover */
ul#navmenu li:hover li:hover li:hover li a:hover,
ul#navmenu li.iehover li.iehover li.iehover li a:hover { background: #CCC; color: #FFF; }
ul#navmenu ul,
ul#navmenu ul ul,
ul#navmenu ul ul ul { display: none; position: absolute; top: 0; left: 160px; }
/* Do Not Move - Must Come Before display:block for Gecko */
ul#navmenu li:hover ul ul,
ul#navmenu li:hover ul ul ul,
ul#navmenu li.iehover ul ul,
ul#navmenu li.iehover ul ul ul { display: none; }
ul#navmenu li:hover ul,
ul#navmenu ul li:hover ul,
ul#navmenu ul ul li:hover ul,
ul#navmenu li.iehover ul,
ul#navmenu ul li.iehover ul,
ul#navmenu ul ul li.iehover ul { display: block; }
</style>
<script type="text/javascript">
<!--
    navHover = function() {
        var lis = document.getElementById("navmenu").getElementsByTagName("LI");
        for (var i = 0; i < lis.length; i++) {
            lis[i].onmouseover = function() {
                this.className += " iehover";
            }
            lis[i].onmouseout = function() {
                this.className = this.className.replace(new RegExp(" iehover\\b"), "");
            }
        }
    }
    if (window.attachEvent) window.attachEvent("onload", navHover);
-->
</script> 

<ul id="navmenu">
    <%= _menu %>
</ul>
```

3 编写后台代码，主要思路是使用递归来实现菜单的层级关系。

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
//new using
using System.Data;
using System.Data.Sql;
using System.Text;

public partial class LeftMenu : System.Web.UI.UserControl
{
    protected string _menu = string.Empty;

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            BindMenu();
        }
    }

    private void BindMenu()
    {
        StringBuilder sb = new StringBuilder();
        OledbHelper helper = new OledbHelper();
        DataSet ds = helper.GetDs("select * from [Menu]");
        if (ds != null && ds.Tables.Count > 0 &&
                ds.Tables[0] != null && ds.Tables[0].Rows.Count > 0)
        {
            DataRow[] rows = ds.Tables[0].Select("ParentID=0");
            foreach (DataRow dr in rows)
            {
                string id = dr["ID"].ToString();
                string name = dr["Name"].ToString();
                sb.Append("<li><a href=\"http://blog.fwhyy.com\">" + name + "</a>\r\n");
                  sb.Append(GetSubMenu(id, ds.Tables[0]));
                sb.Append("</li>\r\n");
            }
            _menu = sb.ToString();
        }
    }

    private string GetSubMenu(string pid, DataTable dt)
    {
        StringBuilder sb = new StringBuilder();
        DataRow[] rows = dt.Select("ParentID=" + pid);
        sb.Append("<ul>\r\n");
        foreach (DataRow dr in rows)
        {
            string id = dr["ID"].ToString();
            string name = dr["Name"].ToString();
            sb.Append("<li><a href=\"http://blog.fwhyy.com\">" + name + "</a>\r\n");
            sb.Append(GetSubMenu(id, dt));  //递归
            sb.Append("</li>\r\n");
        }
        sb.Append("</ul>\r\n");
        return sb.ToString();
    }
}
```

4 创建aspx页面Menu 将用户控件拖到页面中，运行就可以看到效果。

![2010-12-30_112219](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292132511.gif)

注：该例子需要有一个静态的css菜单作为模板，网络上很多的css菜单都可以来套用，当然css很强的朋友自己来设计会更好。

[Demo下载](http://files.cnblogs.com/oec2003/site1.rar)

