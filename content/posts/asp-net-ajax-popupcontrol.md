---
title: Asp.Net Ajax-PopupControl控件使用
date: 2007-09-19
categories: [技术]
tags: [Ajax,AspNet]
---

## 简介

Popupcontrol可以弹出任意类型的控件，不管是在服务器控件还是html控件。就是在某控件获取焦点时弹出另外一个控件，进行一些操作后，隐藏弹出的控件。
<!--more-->

## 重要属性

* TargetControlID:需要弹出的控件的id
* PopupControlID:作为弹出控件的id
* Position:弹出控件的位置
* OffsetX/OffsetY:弹出控件的位置与默认位置的相对坐标

## 实例

1 打开vs2005，新建一个AjaxControlToolKit网站，命名为AjaxPopupControl
2 打开默认生成的Default.aspx页面，切换到窗体的设计视图
3 在页面中拽一个UpdatePanel,一个PopupControlExtender,一个TextBox和一个Calendar控件
4 设置PopupcontrolExtender控件的属性，要求当文本框获得焦点时再其右侧弹出Calendar控件，如下

```
<ajaxToolkit:PopupControlExtender ID="PopupControlExtender1" runat="server"
                 TargetControlID="TextBox1" PopupControlID="Calendar1" Position="right">
</ajaxToolkit:PopupControlExtender>
```

5 在Calendar控件的SelectionChanged事件中添加代码，让选择日期后能将选择的日期显示在文本框中，如下

```
protected void Calendar1_SelectionChanged(object sender, EventArgs e)
{
    this.TextBox1.Text = this.Calendar1.SelectedDate.ToShortDateString();
}
```

6 保存设计，运行程序，当鼠标单击文本框时就会在文本框的右边显示日历控件，选择一个日期，该日期就会显示在文本框中

