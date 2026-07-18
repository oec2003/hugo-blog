---
title: 在 .NET8 中获取 k8s 集群的 namespace id
date: 2024-08-28T08:22:21+08:00
categories: [技术]
tags: [.net8,k8s,namespace]
---

将程序和机器进行绑定是一种 License 校验的方法，需要能获取到机器的唯一标识，比如获取机器的 Mac 地址就是获取唯一标识的一种方式，命令如下：

<!--more-->

```shell
ifconfig |egrep 'ether' |awk '{{print $2}}'
```

但如果程序部署在 k8s 中，每次容器构建，使用上面命令获取的 Mac 地址就会发生变化，我使用 kubesphere 做测试发现的确如此。

那么在 k8s 环境中想要获取唯一标识应该怎么办呢？

## 思路

1、在 kubesphere 中，通常会以项目来进行组织，kubesphere 中的项目就是 k8s 中的 namespace，可以通过获取 namespace id 的方式来获取唯一标识。

2、.NET8 容器内部需要安装 kubectl 命令。

## 步骤

1、构建 .NET8 底包镜像，供后面程序使用，Dockerfile 内容如下：

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
RUN apt-get install -y curl

# 安装 kubectl

RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \

chmod +x kubectl && \

mv kubectl /usr/local/bin/kubectl

# 确保 kubectl 已正确安装
RUN kubectl version --client
```

在 Dockerfile 所在目录执行下面命令进行镜像构建：

```
docker build -t net8-kube .
```


2、编写示例程序获取 namespace id，获取 namespace id 的命令如下：

```shell
kubectl get namespace s2-test -o jsonpath='{.metadata.uid}'
```

创建一个 .NET8 的 WebAPI 项目，执行上面命令，并将结果输出，代码如下：

```csharp
using System.Diagnostics;  
  
var builder = WebApplication.CreateBuilder(args);  
  
builder.Services.AddEndpointsApiExplorer();  
builder.Services.AddSwaggerGen();  
  
var app = builder.Build();  
  
if (app.Environment.IsDevelopment())  
{  
    app.UseSwagger();  
    app.UseSwaggerUI();  
}  
  
app.UseHttpsRedirection();  
  
app.MapGet("/GetNamespaceId", (string name) =>  
    {  
        string result = "id is empty";  
        try  
        {  
            string cmd = "kubectl get namespace "+name+" -o jsonpath='{.metadata.uid}'";  
            result= "id is :"+ExecuteCommand(cmd);  
        }        catch (Exception ex)  
        {            Console.WriteLine(ex.Message);  
        }        return result;  
    })    .WithOpenApi();  
  
app.Run();  
  
  
string ExecuteCommand(string command)  
{  
    var processInfo = new ProcessStartInfo("bash", "-c \"" + command + "\"")  
    {        RedirectStandardOutput = true,  
        RedirectStandardError = true,  
        UseShellExecute = false,  
        CreateNoWindow = true  
    };  
  
    var process = new Process { StartInfo = processInfo };  
    process.Start();  
  
    string output = process.StandardOutput.ReadToEnd();  
    process.WaitForExit();  
    return output.Trim();  
}
```

3、将程序发布，并在 publish 目录中创建 Dockerfile 文件：

```dockerfile
FROM net8-kube:latest 
COPY . /app  
WORKDIR /app  

ENTRYPOINT ["dotnet", "namespaceid.dll"]
```

在 publish 目录中执行 `docker build -t namespace-id-test .`  命令进行测试程序的镜像构建。

4、在 kubesphere 中创建一个 test 项目，在该项目中创建无状态负载部署示例程序，调用程序中的示例接口，发现 namespace id 并没有获取到，日志中有报错信息：

>Error from server (Forbidden): namespaces is forbidden: User "system:serviceaccount:test:default" cannot list resource "namespaces" in API group "" at the cluster scope

这个错误表明，当前在容器内执行 `kubectl` 命令的用户（`system:serviceaccount:test:default`）没有足够的权限在集群范围内列出命名空间（`namespaces`）。这个问题通常与 k8s 中的角色绑定（RoleBinding）或集群角色绑定（ClusterRoleBinding）配置有关。

可以使用下面命令来查看对应账户是否有权限：

```shell
kubectl auth can-i list namespaces --as=system:serviceaccount:test:default
```

结果返回 yes 说明该 `ServiceAccount` 有权限，返回 no 说明没有权限。

一种简单的解决方法就是将账户绑定到管理员角色上，命令如下：

```shell
kubectl create clusterrolebinding test-admin-binding \ --clusterrole=cluster-admin \ --serviceaccount=test:default
```

但 cluster-admin 权限过大，在生产环境中不太安全，下面是用另一种方法来解决，在服务器中创建一个 `namespace_reader.yaml` 的文件，内容如下：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: namespace-reader
rules:
- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["get", "list", "watch"]

```

使用下面命令执行后就创建了一个名为 `namespace-reader` 的角色。

```
kubectl apply -f namespace_reader.yaml 
```

角色创建成功后，就可以将 `ServiceAccount` 绑定到这个只读角色了，命令如下：

```
kubectl create clusterrolebinding test-namespace-reader-binding \
--clusterrole=namespace-reader \
--serviceaccount=test:default
```

5、`ServiceAccount` 权限绑定后，再调用接口进行测试，会发现已经可以正常获取 namespace id 了。

