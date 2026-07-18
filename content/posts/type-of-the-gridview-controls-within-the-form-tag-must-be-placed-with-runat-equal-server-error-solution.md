---
title: 类型“GridView”的控件 必须放在具有 runat=server 的窗体标记内 错误的解决方法
date: 2007-12-16
categories: [技术]
tags: [AspNet,GrdiView,错误解决]
---

## 错误提示: 

> 类型“GridView”的控件  必须放在具有 runat=server 的窗体标记内

## 解决方法:

在后台文件中重载VerifyRenderingInServerForm方法,如:

```
public override void VerifyRenderingInServerForm(Control control)
{
    //base.VerifyRenderingInServerForm(control);
}
```

