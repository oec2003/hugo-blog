---
title: dotNET Core 中怎样操作 AD？
date: 2019-09-30T22:18:21+08:00
categories: [技术]
tags: [dotNET Core,AD]
---

做企业应用开发难免会跟 AD 打交道，在之前的 dotNET FrameWork 时代，通常使用 System.DirectoryServices 的相关类来操作 AD ，在 dotNET Core 中没有这个命名空间，在张善友大佬的推荐下，知道了 Novell.Directory.Ldap。

<!--more-->

操作 AD，通常有两种常见的场景：

* 将第三方数据源数据（人事系统）同步到 AD 中
* 将 AD 数据同步到自己的数据库中

本文将介绍在 dotNET Core 中使用 Novell.Directory.Ldap 将 AD 数据同步到数据库的操作。

## 环境

* dotNET Core：2.1
* Novell.Directory.Ldap.NETStandard2_0：3.1.0

## 安装 Novell.Directory.Ldap 包

在 VS2019 中添加 NuGet 包引用，如下图：

![](https://img.fwhyy.com/15775248319643.webp)

安装完成后，在类中添加`using Novell.Directory.Ldap;`引用便可使用相关的 API 方法了。

## 同步思路

1、连接 AD
2、遍历所有需要同步的根 OU
3、递归的方式进行部门和人员的同步操作

## 基本操作

### 同步方法

```
public bool Sync()
{
    ADConnect();
    if (_connection == null)
    {
        throw new Exception("AD连接错误，请确认AD相关信息配置正确!");
    }
    
    bool result = true;
    List<LdapEntry> entryList = this.GetRootEntries(_adPaths, _adHost);
    _org = new Org();
    _user = new User();
    Org rootOrg = _org.GetRootOrg();
    foreach (LdapEntry entry in entryList)
    {
        SyncDirectoryEntry(entry, rootOrg, entry);
    }

    return result;
}
```

### 连接 AD

```
public bool ADConnect()
{
    _adHost = "192.168.16.160";
    string adAdminUserName = "administrator";
    string adAdminPassword = "123456";
    _adPaths =new string[] { "OU=oec2003,DC=COM,DC=cn" };

    if ((string.IsNullOrEmpty(_adHost) || string.IsNullOrEmpty(adAdminUserName)) ||
        string.IsNullOrEmpty(adAdminPassword))
    {
        return false;
    }
    try
    {
        _connection = new LdapConnection();
        _connection.Connect(_adHost, LdapConnection.DEFAULT_PORT);
        _connection.Bind(adAdminUserName, adAdminPassword);
    }
    catch
    {
        return false;
    }

    return true;
}
```

### 递归操作

```
private void SyncDirectoryEntry(LdapEntry rootEntry, Org parentOrg, LdapEntry currentEntry)
{
    List<LdapEntry> entryList = currentEntry.Children(_connection);
    foreach (LdapEntry entry in entryList)
    {
        if (entry.IsOrganizationalUnit())
        {
            Org org = this.SyncOrgFromEntry(rootEntry, parentOrg, entry);
            this.SyncDirectoryEntry(rootEntry, org, entry);
        }
        else if (entry.IsUser())
        {
            this.SyncUserFromEntry(rootEntry, parentOrg, entry);
        }
    }
}
```

### 同步部门

```
private Org SyncOrgFromEntry(LdapEntry rootEntry, Org parentOrg, LdapEntry entry)
{
    string orgId = entry.Guid().ToLower();
    Org org = this._org.GetOrgById(orgId) as Org;
    if (org != null)
    {
        if (entry.ContainsAttr("ou"))
        {
            org.Name = entry.getAttribute("ou").StringValue + string.Empty;
        }
        //设置其他属性的值
        _org.UpdateOrg(org);
        return org;
    }
    org = new Org
    {
        Id = orgId,
        ParentId = parentOrg.Id,
    };

    //设置其他属性的值
    this._org.AddOrg(org);
    return org;
}
```

### 同步用户

```
private User SyncUserFromEntry(LdapEntry rootEntry, Org parentOrg, LdapEntry entry)
{
    string userId = entry.Guid().ToLower();
    User user = this._user.GetUserById(userId);
    if (user != null)
    {
        user.ParentId = parentOrg.Id;
        //设置其他属性的值
        this._user.UpdateUser(user);
          
        return user;
    }
    user = new User
    {
        Id = userId,
        ParentId = parentOrg.Id
    };
    //设置其他属性的值
    this._user.AddUser(user);
    return user;
}
```

## 辅助方法

为了方便代码的编写和复用，将一些操作提取到了扩展方法中。

### 获取 Entry 的 GUID

```
public static string Guid(this LdapEntry entry)
{
    var bytes = (byte[])(entry.getAttribute("objectGUID").ByteValue as object);
    var guid = new Guid(bytes);
    return guid.ToString();
}
```

### 获取 Entry 的 子级

```
public static List<LdapEntry> Children(this LdapEntry entry, LdapConnection connection)
{
    //string filter = "(&(objectclass=user))";
    List<LdapEntry> entryList = new List<LdapEntry>();
    LdapSearchResults lsc = connection.Search(entry.DN, LdapConnection.SCOPE_ONE, "objectClass=*", null, false);
    if (lsc == null) return entryList;

    while (lsc.HasMore())
    {
        LdapEntry nextEntry = null;
        try
        {
            nextEntry = lsc.Next();

            if (nextEntry.IsUser() || nextEntry.IsOrganizationalUnit())
            {
                entryList.Add(nextEntry);
            }
        }
        catch (LdapException e)
        {
            continue;
        }
    }
    return entryList;
}
```

### 判断 Entry 是否为用户

```
public static bool IsUser(this LdapEntry entry)
{
    return entry.ObjectClass().Contains("user");
}
```

### 判断 Entry 是否为部门

```
public static bool IsOrganizationalUnit(this LdapEntry entry)
{
    return entry.ObjectClass().Contains("organizationalunit");
}
```

### 获取 Entry 的修改时间

```
public static DateTime WhenChanged(this LdapEntry entry)
{
    string value = entry.getAttribute("whenChanged").StringValue;
    if (value.Split('.').Length > 1)
    {
        value = value.Split('.')[0];
    }
    DateTime whenChanged = DateTime.ParseExact(value, "yyyyMMddHHmmss", System.Globalization.CultureInfo.CurrentCulture);
    return whenChanged;
}
```

### 判断 Entry 中属性是否存在

```
public static bool ContainsAttr(this LdapEntry entry, string attrName)
{
    LdapAttribute ldapAttribute = new LdapAttribute(attrName);
    return entry.getAttributeSet().Contains(ldapAttribute);
}
```

### 根据名称获取 Entry 中的属性值

```
public static string AttrStringValue(this LdapEntry entry, string attrName)
{
    if (!entry.ContainsAttr(attrName))
    {
        return string.Empty;
    }
    return entry.getAttribute(attrName).StringValue;
}
```

## 总结

文中没有做更多文字性的介绍，可以从下面链接中下载代码进行调试就很容易理解了。

## 参考

示例代码：[https://github.com/oec2003/StudySamples/tree/master/DotNetCoreAdDemo/DotNetCoreAdDemo](https://github.com/oec2003/StudySamples/tree/master/DotNetCoreAdDemo/DotNetCoreAdDemo)
官方文档：[https://www.novell.com/documentation/developer/ldapcsharp/?page=/documentation/developer/ldapcsharp/cnet/data/front.html](https://www.novell.com/documentation/developer/ldapcsharp/?page=/documentation/developer/ldapcsharp/cnet/data/front.html)

祝大家假期快乐！

