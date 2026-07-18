---
title: 利用HttpModule实现防sql注入
date: 2008-11-23
categories: [技术]
tags: [HttpModule,Sql注入]
---

sql注入是被谈的很多的一个话题，有很多的方法能够实现sql的防注入，在这里就简单说一下如果使用HttpModule来实现sql的防注入。
<!--more-->
在项目中添加一个类让其实现IHttpModule接口。IHttpModule接口有两个方法 Init 和 Dispose。然后在Init方法中来订阅

AcquireRequestState事件。

```
public void Dispose()
{

}

public void Init(HttpApplication context)
{
    context.AcquireRequestState += new EventHandler(context_AcquireRequestState);
}
```
为什么是AcquireRequestState 事件而不是Begin_Request呢 ，因为在Begin_Request执行的时候还没有加载session状态，而在处理的时侯可能会用到session。在AcquireRequestState 事件中我们就要进行相应的处理了，思路如下，一般网站提交数据只有两个地方，表单和url，所以就在该事件中将从这两处提交的数据截取，判断是否有一些危险字符，然后做相应处理。代码如下

```
private void context_AcquireRequestState(object sender, EventArgs e)
{
    HttpContext context = ((HttpApplication)sender).Context;

    try
    {
        string getkeys = string.Empty;
        string sqlErrorPage = "~/Error.aspx";//转向的错误提示页面
        string keyvalue = string.Empty;

        string requestUrl = context.Request.Path.ToString();
        //url提交数据
        if (context.Request.QueryString != null)
        {
            for (int i = 0; i < context.Request.QueryString.Count; i++)
            {
                getkeys = context.Request.QueryString.Keys[i];
                keyvalue = context.Server.UrlDecode(context.Request.QueryString[getkeys]);

                if (!ProcessSqlStr(keyvalue))
                {
                    context.Response.Redirect(sqlErrorPage);
                    context.Response.End();
                    break;
                }
            }
        }
        //表单提交数据
        if (context.Request.Form != null)
        {
            for (int i = 0; i < context.Request.Form.Count; i++)
            {
                getkeys = context.Request.Form.Keys[i];
                keyvalue = context.Server.HtmlDecode(context.Request.Form[i]);
                if (getkeys == "__VIEWSTATE") continue;
                if (!ProcessSqlStr(keyvalue))
                {
                    context.Response.Redirect(sqlErrorPage);
                    context.Response.End();
                    break;
                }
            }
        }
    }
    catch (Exception ex)
    {
    }
}
```

上面的代码只是做了简单的处理，当然也可以在事件中将输入非法关键字的用户ip ,操作页面的url,时间等信息记录在数据库中或是记录在日志中。而且还用到了一个叫ProcessSqlStr的方法，这个方法就是用来处理字符串的，判断是否合法，如下

```
private bool ProcessSqlStr(string str)
{
    bool returnValue = true;
    try
    {
        if (str.Trim() != "")
        {
            //一般将关键词组配置在webconfig中
            //string sqlStr = ConfigurationManager.AppSettings["FilterSql"].Trim();
            string sqlStr = "declare |exec|varchar |cursor |begin |open |drop |creat |select |truncate";

            string[] sqlStrs = sqlStr.Split('|');
            foreach (string ss in sqlStrs)
            {
                if (str.ToLower().IndexOf(ss) >= 0)
                {
                    m_sqlstr = ss;
                    returnValue = false;
                    break;
                }
            }
        }
    }
    catch
    {
        returnValue = false;
    }
    return returnValue;
}
```

到这儿类就写好了，再在web.config中做相应的配置就大功告成

```
<httpModules>
    <add type="SqlHttpModule " name="SqlHttpModule"/>
</httpModules>
```

用这种方法很方便，只需在这一处做处理，全站都能应用到，不过如果一个用户想用varchar 等sql的关键字来做用户名注册的话也会被挡掉，

不过应该没人这么无聊吧，呵呵！

