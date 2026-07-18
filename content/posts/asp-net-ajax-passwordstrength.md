---
title:   Asp.Net Ajax-Passwordstrength控件使用
date:  2007-08-25
categories: [技术]
tags:  [Ajax,AspNet]
---

## 简介

PasswordStrength控件是用来提示用户输入密码的情况,用户在密码框中输入密码时,在文本框的后面会有一个提示,显示密码的强度,这种提示有两种方式:文本和进度条,提示信息的位置也可以由我们来自己设置,样式可以写CSS来定义。当密码框失去焦点时提示信息会自动消失。下面就来看看该控件的重要属性吧。
<!--more-->

## 重要属性

*   TargetControlID:密码框的I
*   DisplayPosition:提示信息显示的位置，一共有6个值分别是：RightSide AboveRight AboveLeft LeftSide BelowRight BelowLef
*   StrengthIndicatorType:设置显示的方式,文本或是进度
*   Text:文本方式显
*   BarIndicator:以进度条方式显
*   PreferredPasswordLength:最合适的密码长
*   TextCssClass:提示信息的样
*   MinimumNumericCharacters:密码中至少要包含的数字的个
*   MinimumSymbolCharacters:密码中至少要包含特殊字符的个
*   BarBorderCssClass:提示进度条的边框样
*   BarIndicatorCssClass:提示进度条的样式 &lt;

## 示例

1 打开vs2005,新建一个AjaxControlToolKit网站，命名为oec2003_PasswordStrength.

2 打开默认的Default.aspx页面，切换到设计视图

3 在页面中添加一个文本框控件和一个PasswordStrength控件，设置PasswordStrength空间的属性，如下：

```
&lt;ajaxtoolkit:passwordstrength id="PasswordStrength1" runat="server" targetcontrolid="TextBox1"

       strengthindicatortype="BarIndicator" preferredpasswordlength="12" mini mumnumericcharacters="3"

       minimumsymbolcharacters="1" barindicatorcssclass="bartype" barbordercssclass="barborder"&gt;

       &lt;/ajaxtoolkit:passwordstrength&gt;
```

4 在head标记中添加CSS样式，如下

```
&lt;style type="text/css"&gt;
     .bartype
     {
         color:blue;
         background-color:green;

     }
     .barborder
     {
        border-style:solid;
        border-width:1px;
        width:200px;
        vertical-align:middle;
    }
&lt;/style&gt;
```

5 保存设计，按F5运行就OK了。

这个控件虽然很方便，但感觉还是不是很灵活，也许是我还没有把这个控件研究透彻吧，待以后慢慢深入。

此控件还有 preFixTexts属性（用来显示提示信息的前缀）和TextStrengthDescriptions（密码强度的提示信息的内容，如弱，强）属性，但是这两个控件的设置只有在StrengthIndicatorType属性设置成Text时才有效，设置成进度条样式时看不见前缀和强度提示消息，不知道是此控件原本如此还有我有的地方设置不对 ，迷惑...........

