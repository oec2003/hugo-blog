---
title: Asp.Net Ajax—Calendar控件使用
date: 2007-11-05
categories: [技术]
tags: [Ajax,AspNet]
---

## 简介

Calendar控件是一个很简单的控件，主要用来在页面中提供日历的选择，其实现在已经有很多用javascript写的[日历控件](http://blog.csdn.net/21aspnet/archive/2007/05/14/1607712.aspx)，但是Canlendar日历控件能够让我们更快速地来实现这种效果，只需要进行一些简单的设置即可。
<!--more-->

## 重要属性

* TargetControlID：用来显示选择日期的控件，改控件必需为TextBox
* CssClass：设置日历的样式
* Format：显示日期的格式，如yyMMdd,会显示071105
* PopupButtonID：当日期是通过选定某个按钮弹出的时候，为改按钮的ID，一般为一个日历图片

## 示例1

1.打开visual studio2005，新建一个AjaxControlToolkit网站。

2.在网站根目录下添加一个窗体，命名为Calendar1.aspx。

3.切换到设计视图，在页面上添加ScriptManger，一个TextBox和一个CalendarEntender控件。

4.设置CalendarExtender控件的属性如下：

```
<cc1:CalendarExtender TargetControlID="txtDate" runat="server"
Format="yyMMdd" ID="calDate"   CssClass="MyCalendar"/>
```

下面是样式代码，对应上面的CssClass，关于改样式的解释在后面讲到：

```
<style type="text/css">
       .MyCalendar .ajax__calendar_container
      {
          border:1px solid #646464;
          background-color:#faac38;

      }
      .MyCalendar .ajax__calendar_other .ajax__calendar_day,
      .MyCalendar .ajax__calendar_other .ajax__calendar_year
      {
          color:#ffffff;
      }
      .MyCalendar .ajax__calendar_hover .ajax__calendar_day
      {
          color:red;
          background-color:#e8e8e8;
      }
      .MyCalendar .ajax__calendar_active .ajax__calendar_day
      {
          color:blue;
          font-weight:bolder;
          background-color:#e8e8e8;
      }
  </style>
```

5.保存设计，F5运行，当文本框控件获得焦点时就会弹出日历控件，选择日期后所选日期会按照所设定的格式显示在文本框中，然后日历控件会自动隐藏。

## 示例2

这个例子是单击一个图片按钮后会弹出日历控件，这个在网站中也是经常用到的

1.在网站的根目录下新建一个web窗体，命名为Calendar2.aspx.

2.步骤和上面的一样，只是在页面中多了一个image控件，Calendar控件的设置如下：

```
<cc1:CalendarExtender TargetControlID="txtDate" runat="server" Format="yyMMdd"
ID="calDate"  PopupButtonID="imgDate" CssClass="MyCalendar"/>
```

设置基本上和上一个示例一样，多了一个PopupButtonID，用来制定点击的图片。

3.保存设计，按F5运行，当单击日历图片时会弹出日历控件，选择了日期，控件会隐藏，选择的日期会显示在文本框中。

注：属性Format用来控制日期显示的格式，但要注意代表月的M一定要大写，如：yyyy－MM－dd，yyyy/M/d,yyyy年MM月dd日

CssClass说明：

* .ajax_calendar_container:日历控件的整体内容部分
* .ajax_calendar_footer:日历控件的页脚部分
* .ajax_calendar_header:日历控件的页眉部分
* .ajax_calendar_activa .ajax_calendar_day:选中日期时的样式，一般选择过的日期会以另一种颜色显示。
* .ajax_calendar_hover .ajax_calendar_day:鼠标划过日期时的样式，一般改变悬停在的日期的前景色和背景色。
* .ajax_calendar_other .ajax_calendar_day:非本月日期的样式名

