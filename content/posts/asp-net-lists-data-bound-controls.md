---
title: Asp.Net中列表数据绑定控件浅析
date: 2007-01-03
categories: [技术]
tags: [AspNet]
---

在Asp.Net中用来显示列表数据的控件有`Repeater`，`DataList`,`DataGrid`三种.

DataGrid的灵活性很强，内置了丰富的事件，提供分页，编辑，排序等一些特性，对表格的操作也是非常方便的，而且还有很多种的风格可选，由于自带了很多的功能和特性，所以开发速度很快，容易部署。但它的性能不是很高，每次的操作都会返回到服务器。主要用在对有排序、分页、编辑和多列的显示，而且对性能的要求不是很高，一般情况下数据源是一个DateSet。
<!--more-->
DataList和DataGrid一样也有强大的模版特性，支持数据的编辑，性能比DataGrid好，不足之处在于开发周期相对与DataGrid较长，没有DataGrid中的编辑器，实现分页和排序比较困难。主要应用在单列的数据列表，高性能的自定义数据表。

Repeater是完全以HTML的方式呈现，更加自由灵活，性能是三种显示控件中最高的。但不支持编辑、分页、排序，几乎没有什么特性。开发周期是最长的。主要用在一些对性能和灵活性比较高的数据的显示。

在使用DataGrid时应该注意的一些问题

DataGrid控件有一个很重的属性AutoGenerateColumns，默认的时候该属性的值是true，当他为true的时候，会将绑定的表中所有的字段都显示出来，而我们在实际应用的时候往往只需要把我们想要的字段显示，这时候我们要将AutoGenerateColumns属性的值设置为false，可以自定义地选择显示那些列在控件上。如果我们设置成了自动生成列，就不要再再DataGrid中指定显示列，否则就会产生重复列。

在DataGrid中的非模版列找一个控件可以用datagriditem.Cells[第几个单元格].Controls[第几个控件] 这时候下标是从0开始的，但是在使用模版列时，Control的index必须都要加一，因为Control[0]是LiteralControl,值为空相当于一个空格。这时最好是采datagriditem.findcontrol[“控件名称”]来获得。

当我们在DataGrid中添加了按钮列的删除时，我们要去判断要删除了数据项是否为最后一项，如果是最后一项，还应判断当前页是否为第一页，如果不是第一页，应该将当前的索引减1。在DataGrid中的deleteCommand事件中添加以下代码可以实现。

```
if(this.datagrid.items.count= =1)
{
     if(this.DataGrid.CurrentPageIndex!=0)
     {
        This.DataGrid.CurrentPageIndex=this.DataGrid.CurrentPageIndex-1;
     }
}
```

在删除一条记录时为了更人性化，应该在我们点击删除按钮时，会弹出一个对话框来让我们确定是否要删除记录，在DataGrid控件的ItemDataBound事件中添加以下代码可以实现这个功能，并且是在客户端执行。

```
Switch(e.Item.ItemType)
{
    Case ListItemType.Item;
    Case ListIetmType.EditItem;
    Case ListItemType.AlternatingItem;
    LinkButton lb=(LinkButton)e.Item.Cells[].Controls[0];
    Lb.Attributs.Add(“onclick”,”return confirm(‘确定删除这条记录吗？’)”);
    Break;
}
```

上面的代码倒数第二行中的return很重要，一定不能去掉了，否则当弹出对话框后，不管你点的是“确定”还是“取消”都会删除选中记录。

