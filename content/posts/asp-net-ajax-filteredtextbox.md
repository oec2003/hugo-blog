---
title: Asp.Net Ajax—FilteredTextBox控件使用
date: 2007-08-21
categories: [技术]
tags: [Ajax,AspNet]
---

## 简介

FilterTextBox控件是一种文本框的过滤控件，可以阻止用户进行不准确的输入，相比较vs里提供的验证控件显得更为严格，验证控件是在用户输入了不准确的输入后，给出相应的提示，而现在要介绍的FilterTextBox都不给用户输入错误数据的机会。
<!--more-->

## 重要属性

* TargetControlID：用来设置要控制的文本框 
* FilterType:设置被过滤的类型，提供四种 
* Custom:如果选择这个选项，就可以在另外的一个属性中自定义不被过滤的字符 
* Numbers：让关联的文本框只能输入数字
* UppercaseLetters:让关联的文本框只能输入大写字母
* LowercaseLetters:让关联的文本框只能输入小写字母
* ValidChars:当FilterType设置为Custom时，用来设置有效的字符

## 示例

1 打开vs2005，新建一个AjaxControlToolKit网站，命名为oec2003_FilteredTextBox;
2 打开默认生成的Default.aspx页面，切换到设计视图;
3 在页面中拖拽4个TextBox和4个FilterTextBoxExtender控件。控件的源码如下:

```
<ajaxtoolkit:filteredtextboxextender id="FilteredTextBoxExtender1" runat="server"
    targetcontrolid="TextBox1" filtertype="UppercaseLetters">
  </ajaxtoolkit:filteredtextboxextender>
<ajaxtoolkit:filteredtextboxextender id="FilteredTextBoxExtender2" runat="server"
    targetcontrolid="TextBox2" filtertype="LowercaseLetters">
  </ajaxtoolkit:filteredtextboxextender>
<ajaxtoolkit:filteredtextboxextender id="FilteredTextBoxExtender3" runat="server"
    targetcontrolid="TextBox3" filtertype="Numbers">
  </ajaxtoolkit:filteredtextboxextender>
<ajaxtoolkit:filteredtextboxextender id="FilteredTextBoxExtender4" runat="server"
    targetcontrolid="TextBox4" validchars="oec2003" filtertype="Custom">
 </ajaxtoolkit:filteredtextboxextender>
```

4 保存所有的设计，运行网站，试试看，第四个文本框中就只能输入oec2003了，输入其他的字符时就会发现文本框是没有反应的。

在页面上如果有一个GridView用来显示数据库的一些数据，而且数据库中有一些数值型的字段，在GridView中可以编辑获取的数据，在这儿用FilterTextBox控件是再合适不过了，可以避免用户在更新时输入不正确的数据。

1 新建一个web页面，在页面中添加ScriptManager和UpdatePanel控件;

2 在UpdatePanel控件中添加一个GridView控件，并配置数据源，按照向导进行，当出现下图时，点击高级按钮;

![2010-12-30_191105](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290818572.gif)

3 在高级对话框中钩选[生成insert update delete语句] 项只有选了此项，GridView才能实现编辑功能;

4 数据源配置好后，将GridView的数值的字段转换为模板列;

5 编辑GridView的模板列，在模板列中添加FilterTextBox控件，并设置过滤属性为numbers，TargetControlID关联上模板列中的文本框，模板列代码如下：

```
<edititemtemplate>
    <asp:TextBox ID="TextBox1" runat="server" 
                                   Text='<%# Bind("min_lvl") %>'></asp:TextBox>
    <ajaxToolkit:FilteredTextBoxExtender ID="FilteredTextBoxExtender1" runat="server"
        TargetControlID="TextBox1" FilterType="Numbers">
    </ajaxToolkit:FilteredTextBoxExtender>
</edititemtemplate>
  <edititemtemplate>
    <asp:TextBox ID="TextBox2" runat="server" 
                                      Text='<%# Bind("max_lvl") %>'></asp:TextBox>
   <ajaxToolkit:FilteredTextBoxExtender ID="FilteredTextBoxExtender2" runat="server"
       TargetControlID="TextBox2" FilterType="Numbers">
   </ajaxToolkit:FilteredTextBoxExtender>
</edititemtemplate>
```

保存设计，按f5运行，编辑Gridview就会发现，数值型字段的文本框就只能输入数字了。

