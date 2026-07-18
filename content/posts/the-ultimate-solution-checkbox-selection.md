---
title: CheckBox全选终极方案
date: 2008-10-23
categories: [技术]
tags: [AspNet,CheckBox,javascript,全选]
---

在我们的程序开发中经常会要用到CheckBox的全选，通常情况下是在一些数据绑定控件中如Gridview等
<!--more-->

下面以Repeater为例，在Repeater的header 和item中放入CheckBox控件 。

```
<asp:Repeater ID="rptGroup" runat="server">
    <HeaderTemplate>
        <table width="100%" cellspacing="1" >
            <tr>
                <td width="3%" align="center" >
                  <input type="checkbox" id="chkAll" name="chkAll" value="checkbox"
                  onclick="checkAll   ('chkAll',this);" />
                </td>
            </tr>
    </HeaderTemplate>
    <ItemTemplate>
        <tr>
        <td align="center" >
          <input type="checkbox" name="chkSelect" value='<%# Eval("ID") %>'
          onclick="checkAll('chkAll',this);"/>
        </td>
        </tr>
    </ItemTemplate>
    <FooterTemplate>
        </table>
    </FooterTemplate>
 </asp:Repeater>
```

下面就是js脚本了

checkAll方法是实现CheckBox的全选和取消全选的。

```
function checkAll(chkAllID, thisObj) {
    var chkAll = document.getElementById(chkAllID);
    var chks = document.getElementsByTagName("input");
    var chkNo = 0;
    var selectNo = 0;
    for (var i = 0; i < chks.length; i++) {
        if (chks[i].type == "checkbox") {
            //全选触发事件
            if (chkAll == thisObj) {
                chks[i].checked = thisObj.checked;
            }
            //非全选触发
            else {
                if (chks[i].checked && chks[i].id != chkAllID)
                    selectNo++;
            }
            if (chks[i].id != chkAllID) {
                chkNo++;
            }
        }
    }
    if (chkAll != thisObj) {
        chkAll.checked = chkNo == selectNo;
    }
} 
```

checkSelectNo 函数是用来获取 所有checkbox 选中的个数 这个在用来判断 是否有勾选时非常有用。

```
function checkSelectNo(chkAllID) {
    var chks = document.getElementsByTagName("input");
    var selectNo = 0;
    for (var i = 0; i < chks.length; i++) {
        if (chks[i].type == "checkbox") {
            if (chks[i].id != chkAllID && chks[i].checked) {
                selectNo++;
            }
        }
    }
    return selectNo;
} 
```

