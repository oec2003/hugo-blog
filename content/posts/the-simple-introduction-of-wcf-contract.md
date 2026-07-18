---
title: WCF契约的简单介绍（服务契约 数据契约 消息契约）
date: 2010-07-21
categories: [技术]
tags: [WCF]
---

本篇博文只是简单说下WCF中的契约的种类、作用以及一些简单的代码示例。在WCF中契约分为服务契约、数据契约和消息契约。下面对这几种契约进行简单的介绍。

## 服务契约

服务契约描述了暴露给外部的类型（接口或类）、服务所支持的操作、使用的消息交换模式和消息的格式。每个WCF服务必须实现至少一个服务契约。使用服务契约必须要引用命名空间System.ServiceModel 。服务契约中常用到的三个特性：

### ServiceContractAttribute

该特性定义在类或接口上，用来描述一个相关操作的集合。ServiceContractAttribute特性还有如下的一些属性值可以设置：

* Name：给服务契约定义一个名称，而不是使用接口或是类的类型名，在客户端添加服务引用时会用到。
* Namespace：命名空间，默认值为http://tempuri.org。
* CallbackContract：将另一个服务契约定义为回调契约，使得客户端可以接收服务端的异步消息。
* ProtectionLevel：控制契约中发送给消息的保护方式是否需要被签名和加密。该属性为System.Net.Security.ProtectionLevel枚举类型。
* SessionMode：确定会话是否为公开服务契约的端点所支持。
* ConfigurationName：服务的配置名称。

```
[ServiceContract(Name="HelloWorld",Namespace="http://oec2003.cnblogs.com"]
public interface IHelloWorldService
{ 

}
```

### OperationContractAttribute

用OperationContractAttribute标记的方法即为一个服务操作，简单的使用该特性就可以让一个方法加入到服务契约的操作队列中，可以被客户端所调用。该特性也有一些设置消息交换方式的属性。如下

* Name：定义一个操作名称，而不是使用方法名称。
* Action：该操作消息的动作标题。
* ReplyAction：响应该操作消息的动作标题。
* IsOneWay：设置该操作是否单向和没有回复，如果操作是单向的，将不支持ReplyAction。
* ProtectionLevel：允许你控制特定的操作消息是否被保护，操作中的ProtectionLevel属性将覆盖服务契约中的ProtectionLevel。该属性为System.Net.Security.ProtectionLevel枚举类型。
* IsInitiating：操作是否可以用来初始化会话。
* IsTerminating：操作是否中止一个会话。
* AsyncPattern：将服务操作定义为异步实现模式。

```
[ServiceContract(Namespace="http://oec2003.cnblogs.com",Name="oec2003",
    ConfigurationName="IHelloWorldService")]
public interface IHelloWorldService
{
    [OperationContract(Name="oec2003SayHello",
        Action = "http://oec2003.cnblogs.com/IHelloWorldService/Hello",
        ReplyAction = "http://oec2003.cnblogs.com/IHelloWorldService/HelloReply")]
    string SayHello();
}
```

### MessageParameterAttribute

使用 MessageParameterAttribute 可以控制参数或返回值的名称。此属性对于已用 MessageContractAttribute 特性标记的参数无效。该特性只有一个Name属性，看如下代码：

```
[ServiceContract(Namespace="http://oec2003.cnblogs.com",Name="oec2003",
    ConfigurationName="IHelloWorldService")]
public interface IHelloWorldService
{
    [OperationContract]
    [return: MessageParameter(Name = "responseString")]
    string SayHello([MessageParameter(Name = "string")]string meg);
}
```

## 数据契约

使用数据契约必须引用System.Runtime.Serialization命名空间，在类型上使用DataContractAttribute可以创建数据契约，类型中的成员使用DataMember标记。代码如下：

```
[DataContract]
public class User
{
    [DataMember]
    public int Age { get; set; }
    [DataMember]
    public string Name { get; set; }
    [DataMember]
    public string Email { get; set; }
}
```

### DataContractAttribute

DataContractAttribute特性定义在类型之上，类型包括类、结构、枚举但不包括接口。DataContractAttribute特性不能被继承，即继承自有DataContractAttribute特性标记的类并不是数据契约，必须显示使用DataContractAttribute标记才能成为数据契约。DataContractAttribute特性有IsReference、Name和Namespace三个属性：

* IsReference：bool类型，表示在进行序列化的时候是否保持对象现有的引用结构。
* Name：名称。
* Namespace：命名空间。

```
[DataContract(IsReference=true,Name="MyUser",Namespace="http://oec2003.cnblogs.com")]
public class User
{
    [DataMember]
    public int Age { get; set; }
    [DataMember]
    public string Name { get; set; }
    [DataMember]
    public string Email { get; set; }
}
```

### DataMemberAttribute

使用DataMemberAttribute标记的类型成员才能成为数据契约的数据成员。这个和服务契约中的OperationContractAttribute类似。DataMemberAttribute特性有如下四个属性:

* EmitDefaultValue：表明在数据成员的值等于默认值的情况下，是否还须要将其序列化到最终的XML中，默认值为true，表示默认值会参与序列化。
* IsRequired：bool类型，表明属性成员是否是必须的成员，默认值为false。
* Name：数据成员的别名。
* Order：相应的数据成员在最终序列化的XML中出现的位置，默认是按字母顺序排列的。

```
[DataContract(IsReference=true,Name="MyUser",Namespace="http://oec2003.cnblogs.com")]
public class User
{
    [DataMember(EmitDefaultValue=true,IsRequired=true,
        Name="Oec2003_Age",Order=1)]
    public int Age { get; set; }
    [DataMember(EmitDefaultValue = true, IsRequired = true,
        Name = "Oec2003_Name", Order = 2)]
    public string Name { get; set; }
    [DataMember(EmitDefaultValue = true, IsRequired = false,
        Name = "Oec2003_Email", Order = 3)]
    public string Email { get; set; }
}
```

## 消息契约

使用消息契约必须引用System.ServiceModel命名空间，消息契约和数据契约一样都是定义在数据类型上。和数据契约不同的是消息契约更多的是关注数据成员在SOAP消息中的表示。定义一个消息契约需要用到MessageContractAttribute特性，另外还涉及到MessageHeaderAttribute和MessageBodyMemberAttribute这两个特性，MessageContractAttribute特性标记在类型上，MessageHeaderAttribute和MessageBodyMemberAttribute特性标记在数据成员上。

```
[MessageContract]
public class MessageTest
{
    [MessageHeader]
    public int Age { get; set; }
    [MessageHeader]
    public string Name { get; set; }
    [MessageBodyMember]
    public string Email { get; set; }
}
```

### MessageContractAttribute

通过在一个类型上使用MessageContractAttribute标记可以使之成为一个消息契约。MessageContractAttribute特性含有如下几个属性：

* IsWrapped：是否为定义的主体成员（一个或者多个）添加一个额外的根节点。
* WrapperName：根节点的名称。
* WrapperNamespace：根节点的命名空间。
* ProtectionLevel：表示保护级别，WCF中通过System.Net.Security.ProtectionLevel枚举定义消息的保护级别。一般有3种可选的保护级别：None、Sign和EncryptAndSign。

```
[MessageContract(IsWrapped=false,WrapperName="MyMessage",
    WrapperNamespace="http://oec2003.com")]
public class MessageTest
{
    //省略
}
```

### MessageHeaderAttribute

使用MessageHeaderAttribute标记的数据成员将会出现在SOAP消息的头部，该特性包含下面几个属性：

* Actor：为一个URI值，表示处理该报头的目标节点。
* MustUnderstand：bool类型，表明Actor定义的节点是否必须理解并处理该节点。
* Name：名称。
* Namespace：命名空间。
* ProtectionLevel：表示保护级别。
* Relay：表明该报头是否需要传递到下一个SOAP节点。

```
[MessageContract]
public class MessageTest
{
    [MessageHeader(Actor="http://oec2003.com/Age",MustUnderstand=true,Name="MyAge",
        Namespace="http://oec2003.com",Relay=true)]
    public int Age { get; set; }
    [MessageHeader]
    public string Name { get; set; }
}
```

### MessageBodyMemberAttribute

使用MessageHeaderAttribute标记的数据成员将会出现在SOAP消息的主体部分，该特性包含下面的属性：

* Order：Order属性用来控制成员在SOAP主体部分中出现的位置，默认按字母顺序排列。
* Name：名称。
* Namespace：命名空间。
* ProtectionLevel：表示保护级别。

```
[MessageContract(IsWrapped=false,WrapperName="MyMessage",
    WrapperNamespace="http://oec2003.com")]
public class MessageTest
{
    [MessageBodyMember(Order = 1)]
    public string Email { get; set; }
}
```

本文对WCF的服务契约、数据契约和消息契约进行了简单的介绍，并对使用这些契约所要用到的特性以及特性里的属性进行了说明，有关跟深入的应用将在以后的博文中介绍。

