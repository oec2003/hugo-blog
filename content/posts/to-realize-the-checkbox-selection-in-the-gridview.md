---
title: GridView中实现CheckBox的全选
date: 2007-11-09
categories: [技术]
tags: [AspNet,CheckBox,gridview,全选]
---

## 用服务器端的方法
在页面上放一个gridview控件，配置好数据源，编辑列，添加一个模版列，再编辑模版，放入一个checkbox控件。代码如下：
<!--more-->

```
<asp:GridView ID="GridView1" runat="server" AllowPaging="True" AutoGenerateColumns="False"
        DataKeyNames="AreaID" DataSourceID="SqlDataSource1">
        <Columns>
            <asp:BoundField DataField="AreaID" HeaderText="AreaID" ReadOnly="True" SortExpression="AreaID" />
            <asp:BoundField DataField="CityID" HeaderText="CityID" SortExpression="CityID" />
            <asp:TemplateField>
                <HeaderTemplate>
                    <asp:CheckBox ID="chkAll" runat="server" AutoPostBack="True" 
                                          OnCheckedChanged="chkAll_CheckedChanged" />
                </HeaderTemplate>
                <ItemTemplate>
                    <asp:CheckBox ID="chkItem" runat="server" />
                </ItemTemplate>
            </asp:TemplateField>
        </Columns>
    </asp:GridView>
```

## 后台cs代码

```
protected void chkAll_CheckedChanged(object sender, EventArgs e)
{
    for (int i = 0; i < this.GridView1.Rows.Count; i++)
    {
        ((CheckBox)GridView1.Rows[i].FindControl("chkItem")).Checked =
            ((CheckBox)this.GridView1.HeaderRow.FindControl("chkAll")).Checked;
    }
}
```

## 用脚本实现

```
<asp:GridView ID="GridView1" runat="server" AllowPaging="True" AutoGenerateColumns="False"
        DataKeyNames="AreaID" DataSourceID="SqlDataSource1">
        <Columns>
            <asp:BoundField DataField="AreaID" HeaderText="AreaID" ReadOnly="True" 
                      SortExpression="AreaID" />
            <asp:BoundField DataField="CityID" HeaderText="CityID" SortExpression="CityID" />
            <asp:TemplateField>
                <HeaderTemplate>
                    <input id="chkAll"  onclick="SelectAll(this)"; type=checkbox>
                </HeaderTemplate>
                <ItemTemplate>
                    <input id="chkItem" type=checkbox>
                 </ItemTemplate>
            </asp:TemplateField>
        </Columns>
    </asp:GridView>
```

## 在客户端写javascript

```
function SelectAll(chkbox)
{
   var box=chkbox;
   state=theBox.checked;
   elem=box.form.elements;
   for(i=0;i<elem.length;i++)
   if(elem[i].type=="checkbox" && elem[i].id!=box.id)
    {
         if(elem[i].checked!=state)
         {
            elem[i].click();
         }
    }
 }
```

