---
title:  一个简单的WCF示例
date:  2010-07-15
categories: [技术]
tags:  [WCF]
---

WCF程序分为三个部分：服务、宿主和客户端。下面就一步一步按这三个部分来构建一个简单的WCF程序。可以选择这三个部分都创建独立的解决方案，也可以在一个解决方案中创建三个项目。在下面的例子中将采用将三个项目放在一个解决方案中。服务使用类库项目，宿主和客户端使用控制台程序。
<!--more-->

创建一个空的解决方案命名为WCFDemo，在该解决方案中创建两个控制台项目和一个类库项目，分别为Client、Host和Service。在这三个项目中分别引用程序集`System.ServiceModel`，另外在`Service`项目中引用程序集`using System.Runtime.Serialization`

![2010-07-15_110417](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292106808.png)

在本例中Service的功能就是提供一个返回`HelloWorld`的方法。在`Service`项目中添加一个名为`IHelloWorldService`的接口，并给接口添加相应的契约，代码如下：

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
//new using
using System.Runtime.Serialization;
using System.ServiceModel;
namespace Service
{
    [ServiceContract(Name="http://oec2003.cnblogs.com")]
    public interface IHelloWorldService
    {

        [OperationContract]
        string SayHello();
    }
}
```

将Service项目中的类Class1重命名为`HelloWorldService`，让该类继承接口`IHelloWorldService`，并实现方法SayHello。代码如下：

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ServiceModel;
namespace Service
{
    public class HelloWorldService:IHelloWorldService
    {
        public string SayHello()
        {
            return "Hello oec2003";
        }
    }
}
```

至此，服务类已经编写好了，编译下该项目，接下来就开始做宿主了，首先在Host项目中添加对Service项目的引用，如下图：

![2010-07-15_112926](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202201292106554.png)

在Host项目中需要初始化`ServiceHost`，并添加端点，代码如下:

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ServiceModel;
using Service;
namespace Host
{
    class Program
    {
        static void Main(string[] args)
        {
            using (ServiceHost host = new ServiceHost(typeof(HelloWorldService)))
            {
                host.AddServiceEndpoint(typeof(IHelloWorldService), new BasicHttpBinding(),
                    new Uri("http://localhost:10000/Service/HelloWorldService"));
                if (host.State != CommunicationState.Opening)
                    host.Open();
                Console.WriteLine("服务已经启动！");
                Console.ReadLine();
            }
        }
    }
}
```

宿主到这儿也写好了，本例中的端点是用程序的方式来编写的，还可以使用配置文件的方式来做，有关配置文件的方式在以后的博客中会提到。现在开始写客户程序，将Service项目中的`IHelloWorldService`接口复制一份到Client项目中，在生成客户代理时用到。客户端程序代码如下：

```
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ServiceModel;
namespace Client
{
    class Program
    {
        static void Main(string[] args)
        {
            EndpointAddress ea =
                new EndpointAddress("http://localhost:10000/Service/HelloWorldService");
            IHelloWorldService proxy =
                ChannelFactory&lt;IHelloWorldService&gt;.CreateChannel(new BasicHttpBinding(),ea);
            Console.WriteLine(proxy.SayHello());
            Console.ReadLine();
        }
    }
}
```

**注：上面代码的EndpointAddress地址要和Host中的EndPoint地址一致**

所有代码编写完成，先运行Host，再运行Client，会看到结果如下：

[![](http://blog.fwhyy.com/wp-content/uploads/2010/07/2010-07-15_121033.png "2010-07-15_121033")](http://blog.fwhyy.com/wp-content/uploads/2010/07/2010-07-15_121033.png)

host

[![](http://blog.fwhyy.com/wp-content/uploads/2010/07/2010-07-15_121042.png "2010-07-15_121042")](http://blog.fwhyy.com/wp-content/uploads/2010/07/2010-07-15_121042.png)

Client

## 总结

* 本例中只是实现了一个很简单的功能，是我们对WCF有个全局性的了解，知道一个基本的运行流程

* Host项目中设置服务端点用的是程序实现，而且直接给出完整URI。这个服务端点的地址设置是很灵活的，可以程序写、可以配置文件配置、可以写完整URI、可以使用相对地址。如果使用了相对地址在`ServiceHost`中药设置基地址

* Host项目中的绑定使用的是`BasicHttpBinding`，绑定是用来定义通信信道，`BasicHttpBinding`绑定可以实现基本的`Http`协议的需求。绑定的方式有很多种，可以根据实际开发需求选择

* `Client`项目中的代理创建方式是使用`ChannelFactory`手动创建的，使用这种方式创建需要有服务的操作元数据，本例中将`Service`项目中的`IHelloWorldService`接口复制了一份在客户端来提供操作元数据。生成代理还有其他多种方式，以后博文中再写。

[源码下载](http://files.cnblogs.com/oec2003/WCFDemo.rar)

