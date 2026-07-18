---
title: Asp.net 2.0的Eval方法详解
date: 2009-01-14
categories: [技术]
tags: [AspNet, Eval]
---

实际上Eval方法是TemplateControl的，而System.Web.UI.Page和System.Web.UI.UserControl都继承于TemplateControl，所以我们可以在Page和UserControl上直接调用个方法。
Page.Eval方法可以帮助我们更好的撰写数据绑定表达式，在ASP.NET   1.x时代，数据绑定表达式的一般形式是：
<!--more-->

```
<%# DataBinder.Eval(Container,“DataItem.Name”)   %>
```

而在ASP.NET   2.0中，同样的代码，我们可以这样写：

```
<%# Eval(“Name”)%>
```

ASP.NET 2.0是怎么实现的呢？我们先从Eval方法来研究，通过反射.NET  fromwork   2.0类库的源代码，我们可以看到这个方法是这样实现的：

```
protected internal object   Eval(string   expression)
{
    this.CheckPageExists();
    return   DataBinder.Eval(this.Page.GetDataItem(),   expression);
}
```

第一行我们不必管，这是检查调用的时候有没有Page对象的，如果没有则会抛出一个异常。关键是第二行：

```
return   DataBinder.Eval(this.Page.GetDataItem(),   expression);
```

Page.GetDataItem()也是2.0中新增的一个方法，用途是正是取代ASP.NET 1.x中的Container.DataItem。
看来不摸清楚GetDataItem()方法，我们也很难明白Eval的原理。GetDataItem的实现也很简单：

```
public object GetDataItem()
{
    if ((this._dataBindingContext == null) || (this._dataBindingContext.Count == 0))
    {
        throw new InvalidOperationException(SR.GetString("Page_MissingDataBindingContext"));
    }
    return this._dataBindingContext.Peek();
}
```

我们注意到了有一个内部对象_dataBindingContext，通过查源代码发现这是一个Stack类型的东西。所以他有Peek方法。而这一段代码很容易看懂，先判断这个Stack是否被实例化，然后，判断这个Stack里面是不是有任何元素，如果Stack没有被实例化或者没有元素则抛出一个异常。最后是将这个堆栈顶部的元素返回。
ASP.NET  2.0用了一个Stack来保存所谓的DataItem，我们很快就查到了为这个堆栈压元素和弹出元素的方法：Control.DataBind方法：

```
protected virtual void DataBind(bool raiseOnDataBinding)
{
    //这个标志的用处在上下文中很容易推出来，如果有DataItem压栈，则在后面出栈。
    bool flag1 = false;
    //判断控件是不是数据绑定容器，实际上就是判断控件类是不是实现了INamingContainer
    if (this.IsBindingContainer)
    {
        bool flag2;
        //这个方法是判断控件是不是有DataItem属性，并把它取出来。
        object obj1 = DataBinder.GetDataItem(this, out   flag2);
        if (flag2 && (this.Page != null))//如果控件有DataItem
        {
            //把DataItem压栈，PushDataBindingContext就是调用_dataBindingContext的Push方法
            this.Page.PushDataBindingContext(obj1);
            flag1 = true;
        }
    }
    try
    {
        //这里是判断是不是触发DataBinding事件的。
        if (raiseOnDataBinding)
        {
            this.OnDataBinding(EventArgs.Empty);
        }
        //对子控件进行数据绑定，如果这个控件有DataItem，则上面会将DataItem压入栈顶，这样，
        //在子控件里面调用Eval或者GetDataItem方法，就会把刚刚压进去的DataItem给取出来。
        this.DataBindChildren();
    }
    finally
    {
        //如果刚才有压栈，则现在弹出来。
        if (flag1)
        {
            //PopDataBindingContext就是调用_dataBindingContext的Pop方法
            this.Page.PopDataBindingContext();
        }
    }
}
```

至此，我们已经可以完全了解ASP.NET   2.0中GetDataIten和Eval方法运作的原理了

关于效率：

毋庸置疑的是强类型转换Container的效率是最高的，Eval最终是调用DataBinder.Eval方法，DataBinder.Eval是采用反射来获取数据的，这显然不如强类型数据转换。

我们可以比较一下各种方法：

```
((Type)Container.DataItem).Property
```

这种方法效率是最高的，因为不存在任何反射。其次是：

```
((Type)GetDataItem()).Property
```

这种方法效率差的原因在于多了一个Stack的Peek操作，当然，实际上这点儿差别可以忽略。
最后是：Eval或者DataBinder.Eval，这两种方法都使用反射来查找属性或者索引器成员，效率大打折扣。
另外一个值得注意的问题是，所有实现了INamingContainer接口的Control，都应该实现IDataItemContainer接口，因为在Control.DataBind的时候，如果发现控件实现了INamingContainer接口，就会试图去寻找它的DataItem，如果这个控件没有实现IDataItemContainer，则DataBinder.GetDataItem方法会使用反射看看控件有没有一个叫做DataItem的属性成员，显然这不是我们希望看到的。

其实ASP.NET还有一个标记接口：INonBindingContainer，实现了INamingContainer接口的控件可以选择同时实现这个来命令ASP.NET不去寻找DataItem，可是很可惜，不知道微软出于什么目的，这个接口是internal的……
其实效率方面不必太重视了，Eval表达式很好看的，即使有那么极端的重视效率，GeDataItem也是不错的选择。毋庸置疑的是强类型转换Container的效率是最高的，Eval最终是调用DataBinder.Eval方法，DataBinder.Eval是采用反射来获取数据的，这显然不如强类型数据转换。



