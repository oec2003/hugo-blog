---
title: 几个不同类型无刷新联动例子
date: 2007-11-30
categories: [技术]
tags: [Ajax, AspNet, 无刷新联动]
---

## Iframe实现无刷新联动

iframe的无刷新其实是局部刷新，状态栏的滚动条还是会滚动，只是页面不会闪烁，这是一种比较老的技术了，在处理的数据两大的时候会比较慢，在本例中需要两个页面：oec2003index.aspx和oec2003frame.asapx,oec2003index.aspx用来显示界面，其中有一个iframe标记，指向oec2003frame.aspx页用来显示结果
<!--more-->

### oec2003index.aspx前台代码

```
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="oec2003Index.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>无标题页</title>

    <script type="text/javascript">
        function Query() {
            var ddlpro = document.getElementById('ddlPro');
            var pro = ddlpro.options[ddlpro.selectedIndex].innerText;
            if (pro != "") {
                document.getElementById("iframe1").src = "oec2003frame.aspx?Pro=" + pro;
            }
        }

    </script>

</head>
<body>
    <form id="form2" runat="server">
    <div>
        <table border="1" cellpadding="3" cellspacing="0" width="600px">
            <tr>
                <td colspan="2" align="center">
                    Iframe实现局部刷新
                </td>
            </tr>
            <tr>
                <td>
                    省份名称:
                </td>
                <td>
                    <select id="ddlPro" style="width: 201px">
                        <option value="湖北">湖北</option>
                        <option value="河北">河北</option>
                        <option value="广东">广东</option>
                        <option value="河南">河南</option>
                    </select>
                    <input id="Button1" type="button" value="查询" onclick="Query()" />
                </td>
            </tr>
            <tr>
                <td>
                    显示城市列表
                </td>
                <td>
                    <iframe src="oec2003frame.aspx" style="text-align: center" id="iframe1" width="100%"
                        height="100%" frameborder="0" scrolling="no" />
                </td>
            </tr>
        </table>
    </div>
    </form>
</body>
</html>
```

### oec2003frame.aspx的前台代码：

```
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="oec2003frame.aspx.cs" Inherits="myframe" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "
http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>无标题页</title>
</head>
<body>
    <form id="form2" runat="server">
    <div>
        <asp:DropDownList ID="ddlCity" runat="server" Width="179px">
        </asp:DropDownList>
    </div>
    </form>
</body>
</html>
```

### oec2003frame.aspx后台代码：

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

public partial class myframe : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string pro = Request.QueryString["pro"];
        switch (pro)
        {
            case "湖北":
                this.ddlCity.Items.Clear();
                this.ddlCity.Items.Add("武汉");
                this.ddlCity.Items.Add("黄冈");
                this.ddlCity.Items.Add("黄石");
                this.ddlCity.Items.Add("襄樊");
                break;
            case "河北":
                this.ddlCity.Items.Clear();
                this.ddlCity.Items.Add("石家庄");
                this.ddlCity.Items.Add("唐山");
                this.ddlCity.Items.Add("承德");
                this.ddlCity.Items.Add("邯郸");
                break;
            case "广东":
                this.ddlCity.Items.Clear();
                this.ddlCity.Items.Add("广州");
                this.ddlCity.Items.Add("佛山");
                this.ddlCity.Items.Add("深圳");
                this.ddlCity.Items.Add("珠海");
                break;
            case "河南":
                this.ddlCity.Items.Clear();
                this.ddlCity.Items.Add("郑州");
                this.ddlCity.Items.Add("新乡");
                this.ddlCity.Items.Add("安阳");
                this.ddlCity.Items.Add("信阳");
                break;
        }
    }
}
```

## Javascript无刷新联动

### 前台页面代码：

```
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="oec2003index.aspx.cs"
 Inherits="jacascript_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>无标题页</title>

    <script type="text/javascript">
        function FillData(strcity) {

            document.getElementById("ddlCity").options.length = 0;
            var indexofcity;
            var city;
            while (strcity.length > 0) {
                indexofcity = strcity.indexOf(",");
                if (indexofcity > 0) {
                    city = strcity.substring(0, indexofcity);

                    strcity = strcity.substring(indexofcity + 1);
                    document.getElementById("ddlCity").add(new Option(city, city));
                }
                else {
                    document.getElementById("ddlCity").add(new Option(strcity, strcity));
                    break;
                }

            }
        }
    </script>

</head>
<body>
    <form id="form2" runat="server">
    <div>
        <table width="700px" border="1" cellpadding="5" cellspacing="0">
            <tr>
                <td colspan="2" align="center">
                    脚本方法实现刷新
                </td>
            </tr>
            <tr>
                <td>
                    选择省份:
                </td>
                <td>
                    <select id="ddlPro" style="width: 201px">
                        <option value="湖北">湖北</option>
                        <option value="河北">河北</option>
                        <option value="广东">广东</option>
                        <option value="河南">河南</option>
                    </select>
                    <input id="btnQuery" type="button" value=" 查询" onclick="City()" />
                </td>
            </tr>
            <tr>
                <td>
                    城市:
                </td>
                <td>
                    <asp:DropDownList ID="ddlCity" runat="server" Width="201px">
                    </asp:DropDownList>
                </td>
            </tr>
        </table>
    </div>
    </form>
</body>
</html>
```

### 后台代码：

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
using System.Text;

public partial class jacascript_Default : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        StringBuilder myscript = new StringBuilder();
        myscript.Append("function City() {\n");
        myscript.Append("var ddlpro=document.getElementById('ddlPro');\n");
        myscript.Append("var pro=ddlpro.options[ddlpro.selectedIndex].innerText;\n");
        //myscript.Append("var pro=document.getElementById('txtPro').value;\n");
        myscript.Append("switch(pro) { \n");
        myscript.Append("case '湖北':\n");
        myscript.Append("FillData('" + GetCityStr("湖北") + "');\n");
        myscript.Append("break;\n");
        myscript.Append("case '河北':\n");
        myscript.Append("FillData('" + GetCityStr("河北") + "');\n");
        myscript.Append("break;\n");
        myscript.Append("case '广东':\n");
        myscript.Append("FillData('" + GetCityStr("广东") + "');\n");
        myscript.Append("break;\n");
        myscript.Append("case '河南':\n");
        myscript.Append("FillData('" + GetCityStr("河南") + "');\n");
        myscript.Append("break;}\n");
        myscript.Append("}\n");

        Page.ClientScript.RegisterClientScriptBlock(typeof(string), "city", myscript.ToString(), true);

    }

    private string GetCityStr(string pro)
    {
        string city = "";
        switch (pro)
        {
            case "湖北":
                city = "武汉,黄冈,黄石,襄樊";
                break;
            case "河北":
                city = "石家庄,唐山,承德,邯郸";
                break;
            case "广东":
                city = "广州,佛山,深圳,珠海";
                break;
            case "河南":
                city = "郑州,新乡,安阳,信阳";
                break;
        }
        return city;
    }
}
```

## CallBack无刷新联动

### 前台代码：

```
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="oec2003index.aspx.cs"
Inherits="callback_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>无标题页</title>

    <script type="text/javascript">
         function FillData()
         {
             var ddlpro=document.getElementById('ddlPro');
             var pro=ddlpro.options[ddlpro.selectedIndex].value;
             <% =ClientScript.GetCallbackEventReference(this,"pro","FillDll",null) %>
         } 

        function FillDll(strcity)
        {
            document.getElementById("ddlCity").options.length=0;
            var indexofcity;
            var city;
            while(strcity.length>0)
            {
                indexofcity=strcity.indexOf(",");
                if(indexofcity>0)
                {
                    city=strcity.substring(0,indexofcity);
                    strcity=strcity.substring(indexofcity+1);
                    document.getElementById("ddlCity").add(new Option(city,city));
                }
                else
                {
                    document.getElementById("ddlCity").add(new Option(strcity,strcity));
                    break;
                }
            }
        }
    </script>

</head>
<body>
    <form id="form2" runat="server">
    <div>
        <table width="700px" border="1" cellpadding="5" cellspacing="0">
            <tr>
                <td colspan="2" align="center">
                    callback方法实现刷新
                </td>
            </tr>
            <tr>
                <td>
                    选择省份:
                </td>
                <td>
                    <select id="ddlPro" style="width: 200px">
                        <option value="湖北">湖北</option>
                        <option value="河北">河北</option>
                        <option value="广东">广东</option>
                        <option value="河南">河南</option>
                    </select>
                    <input id="btnQuery" type="button" value=" 查询" onclick="FillData()" />
                </td>
            </tr>
            <tr>
                <td>
                    城市:
                </td>
                <td>
                    <asp:DropDownList ID="ddlCity" runat="server" Width="201px">
                    </asp:DropDownList>
                </td>
            </tr>
        </table>
    </div>
    </form>
</body>
</html>
```

### 后台代码：

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

public partial class callback_Default : System.Web.UI.Page,ICallbackEventHandler
{
 private string _data;
 protected void Page_Load(object sender, EventArgs e)
 { 

 } 

 //ICallbackEventHandler 成员
}
```

## Ajax无刷新联动

该例子也要用到两个页面：oec203index.aspx和oec2003datapage.aspx. oec2003datapage.aspx主要用来回送要显示的数据

### oec2003.aspx页面前台代码：

```
<%@ Page Language="C#" AutoEventWireup="true" CodeFile="oec2003index.aspx.cs"
Inherits="ajax_Default" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>无标题页</title>

    <script type="text/javascript">
        var xmlhttp;
        function getData() {
            var ddlpro = document.getElementById("ddlPro");
            var pro = ddlpro.options[ddlpro.selectedIndex].innerText;
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            xmlhttp.onreadystatechange = statechange;
            xmlhttp.Open("GET", "oec2003datapage.aspx?pro=" + pro, true);
            xmlhttp.Send();
        }

        function statechange() {
            if (xmlhttp.readystate == 4) {
                if (xmlhttp.status == 200) {
                    FillData(xmlhttp.responseText);
                }
            }
        }
        function FillData(strcity) {
            document.getElementById("ddlCity").options.length = 0;
            var indexofcity;
            var city;
            while (strcity.length > 0) {
                indexofcity = strcity.indexOf(",");
                if (indexofcity > 0) {
                    city = strcity.substring(0, indexofcity);
                    strcity = strcity.substring(indexofcity + 1);
                    document.getElementById("ddlCity").add(new Option(city, city));
                }
                else {
                    document.getElementById("ddlCity").add(new Option(strcity, strcity));
                    break;
                }
            }
        }
    </script>

</head>
<body>
    <form id="form1" runat="server">
    <div>
        <table width="700px" border="1" cellpadding="5" cellspacing="0">
            <tr>
                <td colspan="2" align="center">
                    ajax方法实现刷新
                </td>
            </tr>
            <tr>
                <td>
                    选择省份:
                </td>
                <td>
                    <select id="ddlPro" style="width: 201px">
                        <option value="湖北">湖北</option>
                        <option value="河北">河北</option>
                        <option value="广东">广东</option>
                        <option value="河南">河南</option>
                    </select>
                    <input id="btnQuery" type="button" value=" 查询" onclick="getData()" />
                </td>
            </tr>
            <tr>
                <td>
                    城市:
                </td>
                <td>
                    <asp:DropDownList ID="ddlCity" runat="server" Width="201px">
                    </asp:DropDownList>
                </td>
            </tr>
        </table>
    </div>
    </form>
</body>
</html>
```

### oec2003datapage.aspx后台代码：

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

public partial class ajax_datapage : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string pro = Request.QueryString["pro"];
        Response.Clear();
        switch (pro)
        {
            case "湖北":
                Response.Write("武汉,黄冈,黄石,襄樊");
                break;
            case "河北":
                Response.Write("石家庄,唐山,承德,邯郸");
                break;
            case "广东":
                Response.Write("广州,佛山,深圳,珠海");
                break;
            case "河南":
                Response.Write("郑州,新乡,安阳,信阳");
                break;
        }
    }
}
```

