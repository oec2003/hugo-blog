---
title: Asp.Net Ajax —AutoComplete控件使用
date: 2007-08-18
categories: [技术]
tags: [Ajax,AspNet,Autocomplete]
---

以前见到google和迅雷等网站在搜索文本框中输入文字后能自动提示,感觉这种功能很炫也很实用.现在在学习asp.net ajax 发现AjaxControlToolKit工具包中的AutoComplete控件就能实现这种功能,而且非常简单.
<!--more-->

## 简介

AutoComplete控件就是在用户在文本框输入前几个字母或是汉字的时候,该控件就能从存放数据的文或是数据库里将所有以这些字母开头的数据提示给用户,供用户选择,提供方便.

## 重要属性

* TargetControlID:指定要实现提示功能的控件。
* ServicePath:WebService的路径，提取数据的方法是写在一个WebService中的。
* ServeiceMethod:写在WebService中的用于提取数据的方法的名字。
* MinimumPrefixLength:用来设置用户输入多少字母才出现提示效果。
* CompletionSetCount:设置提示数据的行数。
* CompletionInterval:从服务器获取书的时间间隔，单位是毫秒。

## 示例

打开vs2005创建一个AjaxControlToolKit网站。
在网站的App_Data文件夹下添加文本文件TextFile.txt,并在其中添加数据，如下

![2010-12-30_191105](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290818209.gif)

在网站的根目录下添加一个Web服务，命名为oec2003_AutoComplete，系统自动将Web服务两个部分，设计部分oec2003_AutoComplete.asmx和代码部分oec2003_AutoComplete.cs，其中oec2003_AutoComplete.cs文件自动放入到App_Code目录下。打开oec2003_AutoComplete.cs文件，添加获取数据的方法GetCompleteList,代码如下：

```c#
using System;
using System.Web;
using System.Collections;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.IO;

/// <summary>
/// AutoComplete 的摘要说明
/// </summary>
[WebService(Namespace = "http://tempuri.org/")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[System.Web.Script.Services.ScriptService]
public class AutoComplete : System.Web.Services.WebService
{
    public AutoComplete()
    {
        //如果使用设计的组件，请取消注释以下行
        //InitializeComponent();
    }

    [WebMethod]
    public string HelloWorld()
    {
        return "Hello World";
    }
    /// <summary>
    /// 获取数据的方法GetCompleteList
    /// </summary>
    //定义静态数组用于保存获取的数据
    private static string[] autoCompleteWordList = null;
    [WebMethod]
    public String[] GetCompleteList(string prefixText, int count)
    {
        if (autoCompleteWordList == null)
        {
            string[] temp = File.ReadAllLines(Server.MapPath("~/App_Data/TextFile.txt"));
            Array.Sort(temp, new CaseInsensitiveComparer());
            autoCompleteWordList = temp;
        }

        int index = Array.BinarySearch(autoCompleteWordList, prefixText, new CaseInsensitiveComparer());
        if (index < 0)
        {
            index = ~index;
        }

        int matchingCount;
        for (matchingCount = 0; matchingCount < count &&
                        index + matchingCount < autoCompleteWordList.Length; matchingCount++)
        {
            if (!autoCompleteWordList[index + matchingCount].StartsWith(prefixText,
                                               StringComparison.CurrentCultureIgnoreCase))
            {
                break;
            }
        }
        String[] returnValue = new string[matchingCount];
        if (matchingCount > 0)
        {
            Array.Copy(autoCompleteWordList, index, returnValue, 0, matchingCount);
        }
        return returnValue;
    }
}
```

由于在上面的代码中使用了File类，所以应该添加如下代码：

```
using System.IO;
```

因为需要在客户端调用Web服务，还需要添加如下代码

```
[System.Web.Script.Services.ScriptService]
```

保存Web 服务的代码

打开根目录下默认生成的Default.aspx

在页面中拖拽一个TextBox控件和一个AutoCompleteExtender控件。

在属性窗口设置AutoCompleteExtender控件的属性，如下

```
<ajaxToolkit:AutoCompleteExtender
            ID="AutoCompleteExtender1"
            runat="server"
            ServiceMethod="GetCompleteList"
            ServicePath="oec2003_AutoComplete.asmx"
            Enabled="true"
            MinimumPrefixLength="2"
               CompletionSetCount="10"
            TargetControlID="TextBox1">
</ajaxToolkit:AutoCompleteExtender>
```

在Web服务中的count参数的值是取CompletionSetCount属性的值。

保存设计的页面，将默认页面设置为起始页，按F5运行后在文本框中输入oe,就能看到想要的结果。

[代码下载](http://files.cnblogs.com/oec2003/AutoComplete_rar.zip)

