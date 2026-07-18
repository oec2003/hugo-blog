---
title: Net Remoting Error:试图创建未绑定类型的代理
date: 2010-07-07
categories: [技术]
tags: [Remoting, 错误解决]
---

在使用Net Remoting时 如果客户端程序出现“试图创建未绑定类型的代理”的错误时，只需将远程对象继承MarshalByRefObject类就可以解决了。

