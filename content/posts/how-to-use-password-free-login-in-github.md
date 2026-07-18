---
title: 怎样在  Github  中使用免密登录？
date: 2023-07-23T09:49:05+08:00
categories: [技术]
tags: [ Github]
---

我们在互联网上注册各种网站，密码经常会忘记，非常麻烦。以前还能各网站使用同一密码，虽然不太安全，但好记。现在各种网站的密码规则变强，还都不太一样，记密码就更难了。

如果有一种方式，能免密登录，就可以解决记不住密码的烦恼了。
<!--more-->

## 什么是免密登录？

免密登录其实我们每天都在使用。

手机上按下指纹、或者刷个脸就能进入系统，类似这样的操作就是免密登录，只不过在  PC  使用浏览器访问网站时，大多都还是需要使用账号密码登录，为了安全性，可能还需要输入各种稀奇古怪的验证码。

现在有一种无需输入密码的解决方案：Passkey 。

## 什么是 Passkey ？

1、Passkey  不需要使用密码，而是使用密钥，接入了  Passkey 的网站会保存用户的公钥，登陆时用户使用私钥。

2、用户不需要知道私钥是什么，也不需要在登录时输入私钥，私钥通过「身份管理器」来提供。

2、「身份管理器」负责生成密钥，私钥自己保管，公钥提供给网站，「身份管理器」通常指指纹识别、人脸识别、或一些专用设备。

3、用户登录，网站会向「身份管理器」发请求，身份管理器验证身份（指纹、人脸识别）后允许使用私钥。

4、对用户来说就是按下指纹就登录网站了。

5、Passkey 的官网地址为：https://www.passkeys.io/ ，可以去进行体验。

## 如何在  Github  中使用？

1、点击「头像」->「Feature preview」->「Passkeys」，将 Passkeys  功能开启，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221655666.webp)

2、点击「头像」->「Settings」，进行设置：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221655807.webp)

3、开启了  Passkeys  功能后，在「Password and authentication」设置中就可以看到  Passkeys  的设置，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221655985.webp)

4、点击「Add a passkey」后会出现  Github  的登录确认：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221655819.webp)

5、确认后点击「Add passkey」按钮：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221656679.webp)

6、因为我的使用场景是  Mac  上的  Chrome  浏览器，我选择的是「此设备」：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221655038.webp)

7、根据向导继续，会弹出指纹校验的界面，在电脑上进行指纹识别就可以了：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221655571.webp)

8、指纹识别成功后，如下图：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221655331.webp)

9、可以看到在  Passkeys  中成功加入了我的身份信息：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221655885.webp)

10、现在可以退出  Github  来试试新的登录方式了，点击使用  Passkey  方式，进行指纹识别就可以成功登录了：

![](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202307221656776.webp)

## 最后

希望  Passkey  能被更多的网站接入，这样就可以解决记密码的烦恼了。