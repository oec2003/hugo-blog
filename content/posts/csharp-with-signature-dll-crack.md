---
title: C# 带签名dll破解
date: 2016-03-09
categories: [技术]
tags: [C#, ildasm, 破解]
comments: true
---

首先申明，本文只是从技术的角度来分析下怎样破解带签名的C#写的dll文件。大家如有遇到收费的软件或类库还是应该去购买正版，程序员何苦为难程序员呢。
<!--more-->
## 不带签名的破解

不带签名的dll文件的破解很简单，通常有下面三个步骤：
1. 使用反编译工具对dll文件进行反编译，找到校验过期的相关代码，反编译工具可以使用ILSpy或Reflector;
2. 使用ildasm.exe工具将dll导出成il文本文件，在该文件中找到相关的代码进行修改；
3. 使用ildasm.exe工具将修改后的il文件编译成dll文件。

下面看一个例子，假设有ClassLibrary1.dll文件，该类库中的有关校验过期的代码如下：

```
public static class License
{
   private static bool licenseExpired;

   internal static void CheckLicense()
   {
       //if语句中判断是否过期
       if(true)
       {
           //标示是否过期，设置成true表示过期
           License.licenseExpired = true;
       }
   }
}
```

使用ILSpy进行反编译看到的代码如下:

![wpid-14574474852300](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290621267.jpg)

现在使用ildasm.exe对该dll文件进行导出成il文本文件:

![wpid-14574476388347](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290621868.jpg)

使用文本编辑器打开il文件，找到校验对相关代码：

![wpid-14574478634829](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290621309.jpg)

1. 上图中的红框部分代码对应的就是License.licenseExpired = true;这行代码；
2. 第97行代码IL_0004:ldc.i4.1代表的就是true，等待着赋值给下面的licenseExpired；
3. 修改97行的代码为IL_0004:ldc.i4.0，然后保存il文件。

打开命令行，进入到il文件所在到目录，执行下面的命令；

```
c:\windows\microsoft.net\framework\v4.0.30319\ilasm.exe /dll/resource=ClassLibrary1.res ClassLibrary1.il
```

![wpid-14574490215799](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290621142.jpg)

现在在il文件的目录中可以看到生成的dll文件：

![wpid-14574491293072](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290621585.jpg)

反编译生成的dll文件，可以看出代码已经被修改，如下图：

![wpid-14574491097269](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290621613.jpg)

## 带签名dll的破解

如果程序集是带签名的程序集，在经过上面的步骤进行破解后，dll文件依然不能正常使用，通常会报如下错误：

> 未能加载文件或程序集“ClassLibrary1”或它的某一个依赖项。未能验证强名称签名。此程序集可能已被篡改，或者已被延迟签名，但没有用正确的私钥进行完全签名。 (异常来自 >HRESULT:0x80131045)

经过对比发现经过签名的dll文件和未签名的dll文件的区别在于签名的dll文件生成的il代码中会多处如下的代码：

![wpid-14574511220078](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290622206.jpg)

将il代码中上面红框部分代码删除，重新生成的dll文件就是去掉了签名的dll文件。不出什么意外的话此时的dll文件可以正常使用了，但有时又会出现如下的错误：

> 重写成员“xxx”时违反了继承安全性规则。重写方法的安全可访问性必须与所重写方法的安全可访问性匹配

解决该问题需要在Assemblyinfo.cs文件中添加如下代码：

```
[assembly: System.Security.SecurityRules(System.Security.SecurityRuleSet.Level1)]
```

![wpid-14574514129726](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201290623267.jpg)

上面添加的代码对应的il代码为：

```
  .custom instance void [mscorlib]System.Security.SecurityRulesAttribute::.ctor(valuetype [mscorlib]System.Security.SecurityRuleSet) = ( 01 00 01 00 00 ) 
```

将上面的代码添加到il的相应位置，重新生成dll文件就OK了。

总结

本文是以技术研究学习为目的，不提倡对收费的软件或类库进行破解使用。

