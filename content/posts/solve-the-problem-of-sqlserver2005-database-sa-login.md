---
title: 解决sqlserver2005数据库sa登录问题
date: 2007-12-02
categories: [技术]
tags: [Sql,SqlServer,错误解决]
---

如果安装sql server 2005的时候，设置的身份验证模式为”windows”(默认), 安装完成后,   再设置为”sql server和windows”的身份验证模式, 则sa用户是被禁用的。必须启用它。
<!--more-->
1 用Windows身份验证登陆(这个应该是不会存在问题的，在新安装好实例(SQL Server)的情况下，Windows身份验证是不可能被禁用的(安装过程中没有可以设置禁用Windows身份验证的地方)

Manage Studio–菜单”文件”–“连接对象资源管理器”，身份验证中选择”Windows Authentication”

2 连接成功后，右键你的实例，选择”属性”

3 在”属性”窗口中，转到”Security”(安全性)项，在”服务器身份验证”中设置为”SQL Server和Windows身份验证模式”，确定，根据提示，你应该重新启动sql服务。

4 重新启动sql服务后，照用Windows身份验证连接，然后执行下面的语句启用sa用户，同时清除sa的密码(能成功登陆后再根据你的需要设置)。

```
EXEC   sp_password   null,null,'sa'
ALTER   LOGIN   sa   ENABLE   
```

5 语句执行完成后，再用sa连接你的实例，应该就没有问题了。
注：如果执行

```
EXEC   sp_password   null,null,'sa'
ALTER   LOGIN   sa   ENABLE   
```

这句话时报如下的错：  
    
```  
Msg   15118,   Level   16,   State   1,   Line   1
密码有效性验证失败。该密码不够复杂，不符合Windows策略要求。
```

则说明你的服务器的密码策略有复杂性要求（SQL2005的密码复杂性与Windows的密码复杂性策略是关联的），则要求你把sa的密码设置为一个复杂的密码，因此得改为如下语句：

```
EXEC   sp_password   null,   ’复杂的密码',   'sa'
ALTER   LOGIN   sa   ENABLE
```

