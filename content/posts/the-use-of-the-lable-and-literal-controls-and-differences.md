---
title: Lable和Literal控件的使用和区别
date: 2010-01-23
categories: [技术]
tags: [AspNet, lable]
---

Lable和Literal这两个控件是我们非常熟悉的两个控件，都是用作内容呈现用的，但他们之间也有不同之处，分别应用于不同的地方。Lable控件会将内容呈现在html标签span中，即Lable控件的Text属性的值会包含在<span>标签中。而Literal控件生成的代码则比较干净，它的Text属性的值将直接显示在页面中，看下面两段代码：

Lable：

```
<asp:Label ID="lblUserName" runat="server" Text="用户名"></asp:Label>
<asp:TextBox ID="txtUserName" runat="server"></asp:TextBox><br />
<asp:Label ID="lblPwd" runat="server" Text="密码"></asp:Label>
<asp:TextBox ID="txtPwd" runat="server"></asp:TextBox><br />
```

Literal：

```
<asp:Literal runat="server" ID="litUserName" Text="用户名"></asp:Literal>
<asp:TextBox ID="txtUserName1" runat="server"></asp:TextBox><br />
<asp:Literal runat="server" ID="litPwd" Text="密码"></asp:Literal>
<asp:TextBox ID="txtPwd1" runat="server"></asp:TextBox><br />
```

上面两段程序运行的结果都如下图：

![2010-12-29_1138351](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201302120262.png)

再来看看上面的代码生成的源码：

Lable

```
<span id="lblUserName">用户名</span>
<input name="txtUserName" type="text" id="txtUserName" /><br />
<span id="lblPwd">密码</span>
<input name="txtPwd" type="text" id="txtPwd" /><br />
```

Literal

```
用户名
<input name="txtUserName1" type="text" id="txtUserName1" /><br />
密码
<input name="txtPwd1" type="text" id="txtPwd1" /><br />
```

从源码中可以很清楚看出Lable最终在客户端会生成Span标签，而Literal则直接显示文本，记得曾经维护过的一个自定义控件，在不同留言器中有样式问题，调试很久最终发现就是Lable生成的Span惹的祸，最终换成Literal得以解决，所以后来但凡要显示文本的地方我基本都是用Literal。不过Lable也不是一无是处，Lable控件有一个AssociatedControlID，可以将该属性指向一个表单控件的ID，通常为TextBox，看下面代码：

```
<asp:Label ID="lblUserName" runat="server" AssociatedControlID="txtUserName" Text="用户名"></asp:Label>
<asp:TextBox ID="txtUserName" runat="server"></asp:TextBox><br />
<asp:Label ID="lblPwd" runat="server" AssociatedControlID="txtPwd" Text="密码"></asp:Label>
<asp:TextBox ID="txtPwd" runat="server"></asp:TextBox><br />
```

和上面的代码基本一样只是添加了AssociatedControlID属性，分别指向了两个TextBox控件的ID，添加了这个属性后生成的源码就变了，如下：

```
<label for="txtUserName" id="lblUserName">用户名</label>
<input name="txtUserName" type="text" id="txtUserName" /><br />
<label for="txtPwd" id="lblPwd">密码</label>
<input name="txtPwd" type="text" id="txtPwd" /><br />
```

可以看出有Span标签变成了lable标签 for属性指向了TextBox的id。AssociatedControlID属性的使用能够给残障人士带来方便，如果使用读屏器之类的辅助设备来和网站进行交互，AssociatedControlID属性能帮助辅助设备将标签和字段关联起来。除此之外还有一个好处就是当点击标签时，所关联的TextBox就会获得焦点。

由于Lable控件的内容最终呈现在Span标签中，所以Lable控件也支持Span标签的一些属性，如BackColor，CssClass等。Literal控件不生成Span标签，当然也不支持那些属性，不过Literal控件有个Mode属性，该属性有三个值

* Encode ：在编码Html内容后再显示控件的内容
* PassThrough ：显示控件的内容不进行编码
* Transform ：清除一些不支持的标记后在呈现内容

看下面的代码：

```
<asp:Literal runat="server" ID="litHr1" Text="<hr />" Mode="Encode"></asp:Literal>
<asp:Literal runat="server" ID="litHr2" Text="<hr />" Mode="PassThrough"></asp:Literal>
<asp:Literal runat="server" ID="litHr3" Text="<hr />" Mode="Transform"></asp:Literal>
```

上面的三行代码运行后的结果为：<hr/>  一条横线 一条横线。第三种如果是运行在移动电话这样的不支持<hr/>的设备中，将不会显示横线。

