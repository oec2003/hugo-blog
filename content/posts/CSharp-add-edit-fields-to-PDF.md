---
title: C#给PDF添加编辑域
date: 2017-01-04T23:02:20+08:00
categories: [技术]
tags: [C#, iTextSharp, PDF]
---

PDF文档通常是不能编辑的，但有些时候需要在PDF文档中填写日期或签名之类，就需要在PDF有能编辑的文本域，本文介绍怎样用C#来实现这一功能。
<!--more-->
## 环境

工具：VS2015
语言：C#
操作PDF类库：iTextSharp 5.5.10
生成的PDF预览的工具：Skim、福昕阅读器、Acrobat Reader

## 代码实现

### 获取文档的页数

```
PdfReader reader = new PdfReader(@"C:\WorkSpace\1.pdf");
int count1 = reader.NumberOfPages;
```

### 创建文本域

```
TextField fieldDate = new TextField(stamp.Writer, new iTextSharp.text.Rectangle(105, 100, 240, 125), "date1");
fieldDate.BackgroundColor = BaseColor.WHITE;
fieldDate.BorderWidth = 1;
fieldDate.BorderColor = BaseColor.BLACK;
fieldDate.BorderStyle = 4;
fieldDate.FontSize = 11f;
```

`iTextSharp.text.Rectangle(105, 100, 240, 125)` 用来设置文本域的位置，四个参数分别为：llx、lly、urx、ury：

* llx 为Left ，lly 为Bottom,urx 为Right，ury 为Top
* 其中：Width=Right - Left Heigth = Top - Bototom

### 创建文本

```
Chunk cname = new Chunk("Date:", FontFactory.GetFont("Futura", 16f,new BaseColor(170,64,0)));
Phrase pname = new Phrase(cname);
PdfContentByte pdfover = stamp.GetOverContent(count);
ColumnText.ShowTextAligned(pdfover, Element.ALIGN_CENTER, pname, 400, 420, 0);
```

### 完整代码

```
public static void AddTextField()
{
      PdfReader reader = new PdfReader(@"C:\WorkSpace\1.pdf");
      FileStream out1 = new FileStream(@"C:\WorkSpace\2.pdf", FileMode.Create, FileAccess.Write);
      PdfStamper stamp = new PdfStamper(reader, out1);
      int count1 = reader.NumberOfPages;
      
      TextField fieldDate = new TextField(stamp.Writer, new iTextSharp.text.Rectangle(105, 100, 240, 125), "date");
      fieldDate.BackgroundColor = BaseColor.WHITE;
      fieldDate.BorderWidth = 1;
      fieldDate.BorderColor = BaseColor.BLACK;
      fieldDate.BorderStyle = 4;
      fieldDate.FontSize = 11f;
      
      TextField fieldSign = new TextField(stamp.Writer, new iTextSharp.text.Rectangle(430, 100, 530, 125), "sign");
      fieldSign.BackgroundColor = BaseColor.WHITE;
      fieldSign.BorderWidth = 1;
      fieldSign.BorderColor = BaseColor.BLACK;
      fieldSign.BorderStyle = 4;
      fieldSign.FontSize = 11f;
      Chunk cname = new Chunk("Date:", FontFactory.GetFont("Futura", 16f,new BaseColor(170,64,0)));
      Chunk ctitle = new Chunk("User Sign:", FontFactory.GetFont("Futura", 16f, new BaseColor(0, 128, 128)));
      Phrase pname = new Phrase(cname);
      Phrase ptitle = new Phrase(ctitle);
      
      //PdfContentBye类，用来设置图像和文本的绝对位置 
      PdfContentByte over = stamp.GetOverContent(count1);
      ColumnText.ShowTextAligned(over, Element.ALIGN_CENTER, pname, 400, 420, 0);
      ColumnText.ShowTextAligned(over, Element.ALIGN_CENTER, ptitle, 400, 350, 0);
      
      stamp.AddAnnotation(fieldDate.GetTextField(), count);
      stamp.AddAnnotation(fieldSign.GetTextField(), count);
      stamp.FormFlattening = true; 
      stamp.Close();
}
```



