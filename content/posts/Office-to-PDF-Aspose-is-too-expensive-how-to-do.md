---
title: Office转PDF，Aspose太贵，怎么办
date: 2019-01-13T13:48:21+08:00
categories: [技术]
tags: [dotNET Core,Office]
---

在程序开发中经常需要将`Office`文件转换成`PDF`，著名的`Aspose`的三大组件可以很容易完成这个功能，但是`Aspose`的每个组件都单独收费，而且每个都卖的不便宜。在老大的提示下，换了一种思路来解决这个问题。

<!--more-->

## 环境

dotNetCore:2.1
CentOS:7.5
Docker:18.06.1-ce

## 步骤

1、`Docker`中安装`libreoffice`和`dotNetCore`；
2、编写转换程序；
3、程序以服务的方式部署在`Docker`中。

## 配置Docker环境

因为需要部署`dotNetCore`的程序，开始的想法是依赖`microsoft/dotnet:2.1-aspnetcore-runtime`镜像创建容器，然后在容器中安装`libreoffice`，后来发现容器中没法执行`yum`命令（可能是没找到方法）。最后换了一种思路，依赖`centos`镜像创建容器，在容器中安装`dotNetCore2.1`和`libreoffice`。

### 安装`libreofiicie`

```
yum install libreoffice 
```

### 安装`dotnetCore2.1`

```
sudo rpm -Uvh https://packages.microsoft.com/config/rhel/7/packages-microsoft-prod.rpm
sudo yum update
sudo yum install aspnetcore-runtime-2.1
```

## 转换程序编写

在`C#`中使用`libreoffice`转换`office`为`pdf`，网上有很多的代码示例，在这里还需要引入消息队列，整个程序是一个消息队列的消费者。简单说就是，用户上传了一个`office`文件，上传成功后会发一个消息，该程序中接收到消息就进行转换。

### 消息监听

```
    class Program
    {
        static IPowerPointConverter converter = new PowerPointConverter();

        static void Main(string[] args)
        {

            var mqManager = new MQManager(new MqConfig
            {
                AutomaticRecoveryEnabled = true,
                HeartBeat = 60,
                NetworkRecoveryInterval = new TimeSpan(60),

                Host = ConfigurationManager.AppSettings["mqhostname"], 
                UserName = ConfigurationManager.AppSettings["mqusername"],
                Password = ConfigurationManager.AppSettings["mqpassword"],
                Port = ConfigurationManager.AppSettings["mqport"]
            });


            if (mqManager != null && mqManager.Connected)
            {
                Console.WriteLine("RabbitMQ连接初始化成功。");
                Console.WriteLine("RabbitMQ消息接收中...");

                mqManager.Subscribe<PowerPointConvertMessage>(message =>
                {
                    if (message != null)
                    {
                        converter.OnWork(message);
                        Console.WriteLine(message.FileInfo);
                    }
                });
            }
            else
            {
                Console.WriteLine("RabbitMQ连接初始化失败,请检查连接。");
                Console.ReadLine();
            }
        }
    }
```

### 文件转换

```
        public bool OnWork(MQ.Messages Message)
        {
            PowerPointConvertMessage message = (PowerPointConvertMessage)Message;
            string sourcePath = string.Empty;
            string destPath = string.Empty;
            try
            {
                if(message == null)
                    return false;
                Stream sourceStream = fileOperation.GetFile(message.FileInfo.FileId);
                string filename = message.FileInfo.FileId;
                string extension = System.IO.Path.GetExtension(message.FileInfo.FileName);
                sourcePath = System.IO.Path.Combine(Directory.GetCurrentDirectory(), filename + extension);
                destPath = System.IO.Path.Combine(Directory.GetCurrentDirectory(), string.Format("{0}.pdf", filename));

                if (!SaveToFile(sourceStream, sourcePath))
                    return false;
                var psi = new ProcessStartInfo("libreoffice", string.Format("--invisible --convert-to pdf  {0}", filename + extension)) { RedirectStandardOutput = true };
                // 启动
                var proc = Process.Start(psi);
                if (proc == null)
                {
                    Console.WriteLine("不能执行.");
                    return false;
                }
                else
                {
                    Console.WriteLine("-------------开始执行--------------");
                    //开始读取
                    using (var sr = proc.StandardOutput)
                    {
                        while (!sr.EndOfStream)
                        {
                            Console.WriteLine(sr.ReadLine());
                        }
                        if (!proc.HasExited)
                        {
                            proc.Kill();
                        }
                    }
                    Console.WriteLine("---------------执行完成------------------");
                    Console.WriteLine($"退出代码 ： {proc.ExitCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
            finally
            {
                if (File.Exists(destPath))
                {
                    var destFileInfo = UploadFile(destPath, string.Format("{0}.pdf", Path.GetFileNameWithoutExtension(message.FileInfo.FileName)));
                }
                if (File.Exists(destPath))
                {
                    System.IO.File.Delete(destPath);
                }
            }
            return true;
        }
```

上面只是一些代码片段，完整示例会上传到`Github`上，文章末尾会给出地址。

## 部署代码到Docker

此程序是`dotNetCore`编写的控制台程序，希望以服务的方式在后台运行，下面介绍怎样将控制台程序以服务的方式运行：

1、将发布后的代码放在容器的`/root/officetopdf/publish`目录中
2、在 `/lib/systemd/system`目录中创建文件`officetopdf.service`；
3、文件内容如下：

```
[Unit]
Description=office to pdf service

[Service]
ExecStart=/usr/bin/dotnet /root/officetopdf/publish/Office2PDF.dll

[Install]
WantedBy=default.target
```

4、使用下面命令创建和启动服务；

```
systemctrl daemon-reload
systemctrl start officetopdf
```

## 示例

[https://github.com/oec2003/StudySamples/tree/master/Office2PDF](https://github.com/oec2003/StudySamples/tree/master/Office2PDF)

