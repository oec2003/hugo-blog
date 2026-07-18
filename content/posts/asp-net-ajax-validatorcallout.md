---
title: Asp.Net Ajax—ValidatorCallout控件使用
date: 2007-09-06
categories: [技术]
tags: [Ajax,AspNet]
---

## 简介

ValidatorCallout控件是一个用来绑定验证控件的提示控件,让验证的信息的显示可以更加地直观. 如下
<!--more-->

## 重要属性

* TargetControlID:要绑定的验证控件的ID
* Width:弹出的提示信息的宽度
* HighlightCssClass:弹出的提示信息所应用的样式
* WarningIconImageUrl:弹出信息中的警示图片的地址

## 示例

1 打开vs2005,新建一个AjaxControlToolKit网站,命名为oec2003_ValidatorCallout 。

2 打开默认生成的Default.aspx页面,切换到窗体视图 。

3 在页面中拖拽两个TextBox,两个RequiredFieldValidator和两个ValidatorCallout控件 。

4两个RequiredFieldValidator控件对应两个TextBox,来验证两个文本框不能为空,同时定义错误提示信息,这些错误信息将会通过ValidatorCallout来显示,将RequiredFieldValidator的Display属性设置为none,否则错误提示信息就会在两个地方同时显示,这是我们不想看到的,代码如下

```
<asp:requiredfieldvalidator id="RequiredFieldValidator1" runat="server" controltovalidate="TextBox1"
       display="None" errormessage="姓名不能为空<br>请输入姓名"></asp:requiredfieldvalidator>
   <br />
   密 &nbsp;&nbsp; 码：<asp:textbox id="TextBox2" runat="server" textmode="Password" width="148px"></asp:textbox>
   <asp:requiredfieldvalidator id="RequiredFieldValidator2" runat="server" controltovalidate="TextBox2"
       display="None" errormessage="密码不能为空，请输入密码"></asp:requiredfieldvalidator>
```

5 设置两个ValidatorCallout控件对应两个RequiredFieldValidator控件,代码如下

```
<ajaxtoolkit:validatorcalloutextender id="ValidatorCalloutExtender1" runat="server"
     targetcontrolid="RequiredFieldValidator1">
     </ajaxtoolkit:validatorcalloutextender>
 <ajaxtoolkit:validatorcalloutextender id="ValidatorCalloutExtender2" runat="server"
     targetcontrolid="RequiredFieldValidator2">
     </ajaxtoolkit:validatorcalloutextender>
```

6 保存设计,运行程序,当没有在文本框中输入文字而提交表单时,就会在文本框后面出现一个错误提示框,如下图所示

![2010-12-30_165947](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290825393.gif)



