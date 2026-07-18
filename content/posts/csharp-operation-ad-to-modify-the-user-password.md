---
title: C#操作AD修改用户密码
date: 2015-09-24
categories: [技术]
tags: [AD, C#]
---

本文的标题是C#操作AD来修改用户密码，其实在微软的API中没有修改密码的方法（我理解的修改密码是需要输入旧密码进行验证），只有重置密码的方法。重置密码的代码大概如下：
<!--more-->
```
user.Invoke("SetPassword", new object[] { newPassword });
user.CommitChanges();
```

本文主要来谈谈怎样在没有提供修改密码方法的前提下来进行密码的修改，主要是对旧密码的验证。

## 遇到的问题

C#验证一个AD账户的密码是否正确通常的方式是new一个用户Entry对象看是否报异常，如果没有异常说明密码是正确的，代码如下：

```
using (user = new DirectoryEntry(LDAPAddress, account, password,      AuthenticationTypes.Secure))
{
      object obj = user.NativeObject;
      user.Close();
}     
```

现在如果用户的密码过期，或是创建用户的时候勾选了“用户下次登录必须修改密码”，调用上面的代码即便是正确的密码也会抛异常，异常信息为“用户名或密码不正确”，这样就无法对旧密码进行校验了。通过对异常信息的分析终于找到解决的办法。

## 问题解决

按上面的描述会有四种情况：

1. 密码过期，校验时输入的正确密码；
2. 密码过期，校验时输入的错误密码；
3. 勾选了“下次登录必须修改密码”，校验时输入正确的密码；
4. 勾选了“下次登录必须修改密码”，校验时输入错误的密码。

取异常信息的代码如下：

```
catch (Exception ex)
{
     string extendError = 
                ((System.DirectoryServices.DirectoryServicesCOMException)(ex)).ExtendedErrorMessage;
     if (extendError.Contains("data 773") ||  extendError.Contains("data 532"))
     {
         result = ADLoginResult.Success;
     }
     else
     {
          errMsg = ex.Message + "请联系管理员！";
     }
}
```

针对上面的四种情况，得到的异常信息如下：

> //下次登录必须修改密码 ，正确的密码
> 8009030C: LdapErr: DSID-0C0904DC, comment: AcceptSecurityContext error, data 773, v1db1

> //下次登录必须修改密码 ，错误的密码
> 8009030C: LdapErr: DSID-0C0904DC, comment: AcceptSecurityContext error, data 52e, v1db1

> //密码过期 ，正确的密码
> 8009030C: LdapErr: DSID-0C0904DC, comment: AcceptSecurityContext error, data 532, v1db1

> //密码过期 ，错误的密码
> 8009030C: LdapErr: DSID-0C0904DC, comment: AcceptSecurityContext error, data 52e, v1db1

可以看出，当密码错误时，返回的错误信息中有data 52e的数据，可以依据异常信息中的这种差别来进行旧密码的校验。

## 总结

本文实乃在没有找到官方相关方法后的一种无奈之举，实在是极其不优雅，不过倒可以解决问题。如果您有更好的方法，望在评论中告知。

