---
title: C#用md5判断GridFS中文件是否存在
date: 2015-05-21
categories: [技术]
tags: [GridFS, MongoDB]
---

假设使用MongoDB的GridFS做分布式文件系统，同样的文件在文件系统中只存一份，那么在存入文件时就需要判断文件是否已经存在，在GridFS中每个文件都有唯一的md5哈希值，只需要用文件的md5值判断是否在GridFS中已经存在就可以了，所谓的秒传功能就是用的该原理。

## 技术栈

C#、VS2013、MongoDB、GridFS

## 实现

1 . 首先根据文件流得到md5值，代码如下：

```
  //计算文件的MD5码
        public static string GetMD5Hash(Stream stream)
        {
            string result = "";
            string hashData = "";
            byte[] arrbytHashValue;
            System.Security.Cryptography.MD5CryptoServiceProvider md5Hasher =
                       new System.Security.Cryptography.MD5CryptoServiceProvider();

            try
            {
                arrbytHashValue = md5Hasher.ComputeHash(stream);//计算指定Stream 对象的哈希值
                //由以连字符分隔的十六进制对构成的String，其中每一对表示value 中对应的元素；例如“F-2C-4A”
                hashData = System.BitConverter.ToString(arrbytHashValue);
                //替换-
                hashData = hashData.Replace("-", "");
                result = hashData;
            }
            catch (System.Exception ex)
            {
                //记录日志
            }

            return result;
        }
```

2 . 根据md5值在GridFS中进行唯一性校验，方法如下：
```
        public string IsExist(string tag)
        {
            string id = "";
            var files = _gridFs.Find(Query.EQ("md5", BsonValue.Create(tag)));
            if(files.Count() > 0)
            {
                id=files.FirstOrDefault().Id.ToString();
            }
            return id;
        }
```

3 . GridFS操作类的完整代码参考

[https://gist.github.com/oec2003/6c1d473a5a5b61a9d131](https://gist.github.com/oec2003/6c1d473a5a5b61a9d131)



