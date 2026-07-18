---
title:   Asp.Net Ajax-HoverMenu控件使用
date:  2007-09-06
categories: [技术]
tags:  [Ajax,AspNet]
---

## 简介

通过名字我们可以看出这是一个菜单控件，当鼠标移动到指定的位置时，在不影响其他的元素的情况下出现一个菜单，并允许用户进行一些操作。
<!--more-->
## 重要属性

*   TargetControlID:要显示菜单的目标控件的I
*   PopupControlID:作为弹出菜单的控件的I
*   HoverCssClass:鼠标移动到目标控件时目标控件的样
*   PopupPosition:弹出菜单所在的位置，共有五个值(bottom,top,left,right,center
*   OffsetX:菜单距离目标控件的位置--横坐
*   OffsetY:菜单距离目标控件的位置--纵坐
*   PopDelay:弹出菜单的延迟时间

## 示例1

1 打开vs2005，创建一个AjaxControlToolKit网站，命名为oec2003_HoverMenu
2 打开默认Default.aspx页，切换到设计视图
3 在页面中添加一个TextBox和一个Panel控件，并在Panel控件中添加三个LinkButton控件，如下

```
<asp:panel id="Panel1" runat="server" height="50px" width="125px"> 
<asp:LinkButton ID="LinkButton1" runat="server" OnClick="LinkButton1_Click">日期</asp:LinkButton> 
<asp:LinkButton ID="LinkButton3" runat="server" OnClick="LinkButton3_Click">时间</asp:LinkButton>
<asp:LinkButton ID="LinkButton2" runat="server" OnClick="LinkButton2_Click">姓名</asp:LinkButton> 
</asp:panel>
```

4 在页面中添加HoverMenu控件，并设置其属性，代码如下

```
<ajaxToolkit:HoverMenuExtender ID="HoverMenuExtender1" runat="server" TargetControlID="TextBox1" 
            OffsetX="-1" OffsetY="-1" HoverCssClass="hover" PopupControlID="Panel1" PopupPosition="bottom">
</ajaxToolkit:HoverMenuExtender>
```

5 切换到代码视图，在head元素间添加css样式，用来实现鼠标移动到目标控件时的样式，如下

```
<style type="text/css">
    .hover
    {
       background-color:blue;
       background-repeat:repeat-x;
       background-position:left top;
    }
 </style>
```

6 前面在Panel中放置了三个LinkButton控件，点击了LinkButton控件后会在文本框中出现相应的内容，LinkButton的单击事件代码如下

```
protected void LinkButton1_Click(object sender, EventArgs e)
{
    TextBox1.Text = DateTime.Now.ToShortDateString();
}
protected void LinkButton3_Click(object sender, EventArgs e)
{
    TextBox1.Text = DateTime.Now.TimeOfDay.ToString();
}
protected void LinkButton2_Click(object sender, EventArgs e)
{
    TextBox1.Text = "oec2003";
}

```

7 保存设计，运行程序，将鼠标移动文本框上时，会发现，文本框的样式变成了我们自定义的样式了，而且还会弹出一个菜单，就是Panel控件

点击菜单中的按钮在文本框中就会出现相应的内容

## 示例2

上面做了一个HoverMenu控件的简单应用，其实HoverMenu控件也可以用于GridView 控件中来替换编辑功能，让编辑列可以出现在我们自定义的菜单中，下面就来看看是怎么实现的吧

1 在网站中新建一个web 页，命名为oec2003_GridViewHoverMenu.aspx
2 切换到设计视图，在页面中添加ScriptManager和UpdatePanel控件
3 在UpdatePanel控件中添加GridView和SqlDataSource控件，并配置数据源，如下

```
<asp:sqldatasource id="SqlDataSource1" runat="server" conflictdetection="CompareAllValues"
    connectionstring="<%$ ConnectionStrings:studentConnectionString %>" 
    deletecommand="DELETE FROM [studentInfo] WHERE [stuID] = @original_stuID AND 
      [stuName] = @original_stuName"
    insertcommand="INSERT INTO [studentInfo] ([stuID], [stuName]) VALUES (@stuID, @stuName)"
    oldvaluesparameterformatstring="original_{0}" selectcommand="SELECT * FROM [studentInfo]"
    updatecommand="UPDATE [studentInfo] SET [stuName] = 
       @stuName WHERE [stuID] = @original_stuID AND [stuName] = @original_stuName">
<DeleteParameters>
    <asp:Parameter Name="original_stuID" Type="String" />
    <asp:Parameter Name="original_stuName" Type="String" />
</DeleteParameters>
<UpdateParameters>
    <asp:Parameter Name="stuName" Type="String" />
    <asp:Parameter Name="original_stuID" Type="String" />
    <asp:Parameter Name="original_stuName" Type="String" />
</UpdateParameters>
<InsertParameters>
    <asp:Parameter Name="stuID" Type="String" />
    <asp:Parameter Name="stuName" Type="String" />
</InsertParameters>
</asp:sqldatasource>
```

4 打开GridView控件的编辑列窗口，将stuName 字段设置成模板列

5 我们要在GridView控件中实现两个菜单，一个是在普通模式下的“编辑”和“删除”，一个是在编辑状态下的“更新”和“取消”

6 编辑模板列，会发现在窗口中有ItemTemplate和EditItemTemplate两项，分别在这两项下添加HoverMenu和Panl控件，每个Panel控件中放置两个LinkButton控件，属性设置如下

```
<edititemtemplate>
    &nbsp;<asp:TextBox ID="TextBox1" runat="server" 
Text='<%# Bind("stuName") %>'></asp:TextBox>
    <ajaxToolkit:HoverMenuExtender ID="HoverMenuExtender2" runat="server" 
TargetControlID="TextBox1" 
PopupControlID="Panel2" OffsetX="10" OffsetY="-1" PopupPosition="right">
    </ajaxToolkit:HoverMenuExtender>
    <asp:Panel ID="Panel2" runat="server" Height="50px" Width="125px">
    <asp:LinkButton ID="LinkButton3" runat="server" CommandArgument="Update" 
CommandName="Update">更新</asp:LinkButton>
    <asp:LinkButton ID="LinkButton4" runat="server" CommandArgument="Cacel" 
CommandName="Cancel">取消</asp:LinkButton></asp:Panel>
</edititemtemplate>
<itemtemplate>
    <asp:Label ID="Label1" runat="server" Text='<%# Bind("stuName") %>'></asp:Label>
    <ajaxToolkit:HoverMenuExtender ID="HoverMenuExtender1" runat="server" 
TargetControlID="Label1" PopupControlID="Panel1" OffsetX="10" OffsetY="-1" 
PopupPosition="right">
    </ajaxToolkit:HoverMenuExtender>
    <asp:Panel ID="Panel1" runat="server" Height="50px" Width="125px">
    <asp:LinkButton ID="LinkButton1" runat="server" CommandArgument="Edit" 
CommandName="Edit">编辑</asp:LinkButton>
    <asp:LinkButton ID="LinkButton2" runat="server" CommandArgument="Delete" 
CommandName="Delete">删除</asp:LinkButton></asp:Panel>
</itemtemplate>
```

在这儿要注意，因为LinkButton要实现对GridView的数据行的编辑功能，所以LinkButton的CommandArgument和CommandName属性要设置成对应的GridView 的方法的名字，如编辑功能对应的CommandName应该设置成Edit.

7 保存设计，运行程序，当鼠标移动到stuName列的数据行上时，就会出现自定义的菜单，可以实现编辑功能。功能和在GridView中启用编辑的功能一样

