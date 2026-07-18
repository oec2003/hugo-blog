---
title: Asp.Net站点整合Discuz论坛实现同步注册和单点登录
date: 2011-04-01
categories: [技术]
tags: [AspNet, Discuz, 单点登录]
---

最近在一个小站中整合了Discuz论坛，查阅了些资料后实现了同步注册和单点登录。

Discuz是以虚拟目录的方式加载网站中，整合Discuz到网站中进行安装要注意一下几个问题：

![2011-04-01_163915](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292105539.png)

* Discuz所在的目录需要添加NETWORK SERVICE 和IIS_User这两个账户的权限。
* Discuz根目录下的DNT.config文件需要修改，将<Forumpath>/</Forumpath>修改为<Forumpath>/BBS/</Forumpath>，BBS为虚拟目录的名称。
* 由于我网站用了第三方的控件，在webconfig文件中进行了相关设置，然后在访问论坛时提示缺少程序集的引用，后来把第三方控件的dll加到Discuz下的bin目录中得以解决。

下面说说怎样实现同步注册和单点登录

其实在研究后发现很简单，当然我现在做的只是同域的情况下，跨域的情况还没研究，估计也不会很难，应该只是多了一个设置cookieDomain的过程。Discuz给我们提供了一个DiscuzToolkit的工具包，提供了很多API供调用，下面就一步步来吧。

1 安装好Discuz论坛后，进入后台管理，选择扩展-》通行证设置-》添加整合程序设置

* 应用程序名称：可以随便输入
* 应用程序Url地址：我填写的是我站点的地址
* 登录完成后返回地址：同上

2 记下生成的APIKey和密匙，在后面的代码编写中会用到

![2011-04-01_164204](http://fwhyy.com/img/post/2011-04-01_164204.png)

3 我将APIKey，密匙都配置在了webconfig文件中

![2011-04-01_164509](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292106145.png)

* APIKey：value值为后台生成的APIKey
* Secret：value值为后台生成的密匙
* Url：value值为BBS的路径

4 写一个公共的BBSHelper类，将添加用户，登录，改密码等方法封装在里面。注意要引用命名空间Discuz.Toolkit

```
/// <summary>
/// 同步Discuz论坛帮助类
/// </summary>
public class DiscuzBBSHelper
{
    private string _apiKey = string.Empty;
    private string _secret = string.Empty;
    private string _url = string.Empty;
    DiscuzSession _ds;

    public DiscuzBBSHelper()
    {
        _apiKey = ConfigHelper.APIKey();
        _secret = ConfigHelper.Secret();
        _url = ConfigHelper.Url();
        _ds = new DiscuzSession(_apiKey, _secret, _url);
    }

    /// <summary>
    /// 登录
    /// </summary>
    public void Login(string userName,string pwd)
    {
        int uid = _ds.GetUserID(userName);
        _ds.Login(uid, pwd, false, 100, "");
    }

    /// <summary>
    /// 登出
    /// </summary>
    public void Logout()
    {
        _ds.Logout("");
        _ds.session_info = null;
        HttpContext.Current.Session["AuthToken"] = null;
    }

    /// <summary>
    /// 创建用户
    /// </summary>
    public void AddUser(string userName,string pwd)
    {
        _ds.Register(userName, pwd, "", false);
    }

    /// <summary>
    /// 修改密码
    /// </summary>
    public void ChangePWD(string userName,string oldPWD,string newPWD)
    {
        int uid = _ds.GetUserID(userName);
        _ds.ChangeUserPassword(uid, oldPWD, newPWD, newPWD, "");
    }
}
```

5 在网站需要的地方调用该类中的方法即可，如下：

```
//同步论坛
DiscuzBBSHelper bbs = new DiscuzBBSHelper();
bbs.Login(username, pwd);
```



