---
title: 利用 Github Actions 同步佳明国内到国际
date: 2024-01-15T17:25:11+08:00
categories: [技术]
tags: [Github, Actions, Garmin, Garmin Connect,跑步]
topic: on-the-road
series_chapter: 第一章 跑步
series_section: 跑步工具
series_order: 410
---

2019 年就开始在使用佳明的 245 ，最近才知道佳明分为国内区和国际区，而且两个区的账号是独立的，数据不互通。而 runalyze 、Strava 等跑步分析工具又只能和国际区进行连接同步。

所以本文就是用来告诉你怎样将佳明国内区同步到国际区，这样就能正常使用  runalyze 和 Strava 了。
<!--more-->
## 步骤

1、进行账号注册和各种配置；

2、使用开源代码库 DailySync 进行同步。

## 账号设置

如果你正在使用佳明手表，那么肯定已经有了国内区的账号了，如果是将要使用，可以在这个地址进行注册：

https://connect.garmin.cn/signin/

### 佳明国际区

佳明国际区的的账号注册地址是：https://connect.garmin.com/signin/ 。登录后进行如下设置：

![](https://img.fwhyy.com/2024/202401150604663.webp)

* 存储和处理设置为同意
* 设备上传设置为启用

### Strava

Strava 的地址是：https://www.strava.com/ ，注册成功后需要进行简单配置，如下图：

![](https://img.fwhyy.com/2024/202401150604145.webp)

* 数据权限设置允许访问
* 右边「社交关系」下面对佳明进行连接

### Github

如果没有 Github 的账号，需要注册一个，地址如下：

https://github.com/

注册登录后，访问：https://github.com/lijiehao1/DailySync ，这个开源项目地址，将这个项目 Fork 到自己的账号下。

![](https://img.fwhyy.com/2024/202401150604835.webp)

正常情况下，Fork 项目没有问题，但我实际验证时发现 Github 上的代码貌似不是最新的，作者把最新的代码放在 Gitlab 上，所以建议在 Gitlab 上下载代码，然后上传到自己个 Github 账号中 ，Gitlab 项目地址如下：

https://gitlab.com/gooin/dailysync

## 配置 Github Actions

1、在 Github 中，进入到上传的项目，点击上面的 Settings 页签：

![](https://img.fwhyy.com/2024/202401150604917.webp)

2、点击左侧的 Actions 菜单，在右边的 Repository secrets 中添加环境变量： 

![](https://img.fwhyy.com/2024/202401150605472.webp)

3、设置好的界面如下：

![](https://img.fwhyy.com/2024/202401150605948.webp)

* GARMIN_USERNAME：中国区账号
* GARMIN_PASSWORD：中国区密码
* GARMIN_GLOBAL_USERNAME：国际区账号
* GARMIN_GLOBAL_PASSWORD：国际区密码
* GARMIN_MIGRATE_NUM：每次要迁移的数量，不要填太大，可以先填写 1 ，进行测试
* GARMIN_MIGRATE_START：从第几条活动开始，可以设置为 0

4、切换到 Actions 页签，然后点击绿色按钮启用，如果已经可以看到 workflow 的列表，则忽略此步骤：

![](https://img.fwhyy.com/2024/202401150606469.webp)

5、可以看到在左侧有所有 workflow 的列表，我们重点关注从国区到国际区的迁移和同步：

![](https://img.fwhyy.com/2024/202401150606029.webp)

* Migrate Garmin CN to Garmin Global：从国区到国际区的迁移，历史数据迁移可以使用这个
* Sync Garmin CN to Garmin Global：从国区到国际区的同步，新数据同步可以使用这个

6、当我们点击进入「Migrate Garmin CN to Garmin Global」workflow 时，如果没有发现手动触发的按钮，则需要进行 yml 文件的配置，将下图红框处的代码注释放开：

![](https://img.fwhyy.com/2024/202401150611337.webp)

修改完成配置后，就能看到手动触发的按钮了：

![](https://img.fwhyy.com/2024/202401150611877.webp)

7、点击按钮「Run workflow」进行手动执行。在迁移日志中，如果看到类似这样的日志，说明迁移成功：

![](https://img.fwhyy.com/2024/202401150611398.webp)

8、这时登录进入佳明的国际区，查看所有活动，发现已经同步一条数据进来了：

![](https://img.fwhyy.com/2024/202401150611626.webp)

9、修改 Setting 中设置的环境变量 GARMIN_MIGRATE_NUM、GARMIN_MIGRATE_START ，因为初始设置的是从位置 0 开始，迁移了 1 条，所以修改为：

* GARMIN_MIGRATE_NUM：100
* GARMIN_MIGRATE_START：1

表示从位置 1 开始，同步 100 条，如果设置同步的条数越多，需要等待的时间就越长。并且通过验证发现，Start 的索引是按时间从最新往最旧排的。执行几轮之后，国际区已经有了全部数据：

![](https://img.fwhyy.com/2024/202401150612454.webp)

10、上面已经在 Strava 中进行了和佳明国际区的连接，这时进入到 Strava 中看看，可以看到数据已经正常同步了：

![](https://img.fwhyy.com/2024/202401150612241.webp)

11、对于 Actions 中我们不需要的 Workflow ，可以选择禁用：

![](https://img.fwhyy.com/2024/202401150612644.webp)

12、上面介绍了手动迁移的 Workflow，自动同步用的是：Sync Garmin CN to Garmin Global ，默认是开启的，每 6 个小时同步一次，如果想要修改同步频率，编辑 yml 文件，修改下图红框部分：

![](https://img.fwhyy.com/2024/202401150613348.webp)

因为通常都是早上跑步，7 点之前就跑完了，我可以设置每天早上 7 点执行，那么 cron 表达式可以设置为：

```
00 7 * * *
```
