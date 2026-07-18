---
title: Nexus：一站式私有仓库管理（NuGet、Maven、NPM、Docker）
date: 2021-03-01T08:05:00+08:00
categories: [技术]
tags: [Nexus,包管理]
---

我们在日常开发中经常需要使用到私有仓库，比如 dotNET 中的 NuGet、Java 中的 Maven、前端的 npm，还有 Docker 镜像，每一个私有仓库各自管理，维护起来比较麻烦，而 Nexus 可以将其统一起来。

<!--more-->

本文将介绍 Nexus 的安装以及怎样进行 NuGet 、Maven、npm 和 Docker 镜像的管理。

## 环境

- Nexus：3.29.2
- NuGet：5.5.1
- Maven：3.6.3
- NPM：6.14.8
- Docker：19.03.13
- 操作系统：CentOS 7

## 安装

可以使用直接在服务器进行安装或者使用 Docker 镜像的方式安装，本文采用 Docker 镜像的方式安装。

1、执行下面的命令进行容器的构建。

```
docker run -d -p 8081:8081 -p 8082:8082 --name nexus_8081 -v /root/data/nexus:/nexus-data --restart=always sonatype/nexus3
```

- 命令中的 `-v /root/data/nexus:/nexus-data` 是将 Nexus 的数据目录映射到本地；
- nexus 目录需要给编辑的权限；
- 8082 端口的映射目的是为了推送 docker 镜像。

2、执行下面命令开放端口。

```
firewall-cmd --zone=public --add-port=8081/tcp --permanent
firewall-cmd --reload
```

3、构建完后，需要等几十秒到几分钟不等，程序有一个初始化的过程，然后访问 http://ip:8081 ，可以出现下图界面：

![iShot2022-02-01 21.35.47](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012144643.jpg)

4、根据弹窗的提示在映射的目录 /root/data/nexus 中找到 admin.password 中的内容就可以正常登录了。

## NuGet

1、在 Repositories 功能中创建 NuGet 的私有仓库 NuGetTest ,仓库模板选择 nuget(hosted) 。

![iShot2022-02-01 21.36.44](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012144144.jpg)

2、在 VS2019 中创建一个 NugetTest 的类库项目，在项目上点击右键→打包，在项目的 bin/Debug 目录中会生成 NugetTest.1.0.0.nupkg 文件。

3、点击「admin」→「NuGet API Key」，在该功能界面获取 key ，这个 key 在推送 NuGet 包时需要用到。

![iShot2022-02-01 21.37.05](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143464.jpg)

4、将 nuget.exe 程序文件也放到 bin/Debug 目录中，然后打开命令行进入到该目录，执行下面命令进行包的推送。

```
nuget.exe push NugetTest.1.0.0.nupkg dab3d4df-1eec-36e0-9b75-09b5b4b0ac41 -source http://10.211.55.6:8081/repository/NuGetTest
```

推送成功如下图：

![iShot2022-02-01 21.37.31](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143175.jpg)

5、在 VS2019 中的 NuGet 包管理器中添加源。

![iShot2022-02-01 21.37.52](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143998.jpg)

6、在引用时选择添加的 NuGetTest 源，如下图：

![iShot2022-02-01 21.38.41](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143287.jpg)

## Maven

1、在 Repositories 功能中创建 Maven 的私有仓库 MavenTest ,仓库模板选择 maven(hosted)，Deployment policy 需要设置为 Allow redeply，否则在推送时会报 400 的错误。

![iShot2022-02-01 21.39.14](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143103.jpg)

2、在 Maven 的配置文件 /apache-maven-3.6.3/conf/settings.xml 中的 Servers 节点添加 Server 配置，如下：

```
<server>
  <id>releases</id>
  <username>test</username>
  <password>000000</password>
</server>
```

- username 和 password 是在 Nexus 中创建的测试账户；
- id 需要和 Maven 项目中的 pom.xml  文件中配置的 id 一致。

3、在 IntelliJ IDEA 中创建 Maven 项目 MavenTest，在项目中的 pom.xml 文件中添加如下内容：

```
<distributionManagement>
    <repository>
        <id>releases</id>
        <name>releases</name>
        <url>http://10.211.55.6:8081/repository/MavenTest/</url>
    </repository>
</distributionManagement>
```

- id：和上面的 settings.xml  文件中的 id 一致即可；
- url：在 Nenux 中创建的 Maven 仓库的地址。

4、因为仓库创建的是 Release 版本的，如果 pom.xml 文件的 version 中包含 SNAPSHOT ，需要删除，否则在推送时会报 400 的错误。

![iShot2022-02-01 21.39.46](/Users/fengwei/Documents/my/typora-img/nexus-manage/iShot2022-02-01 21.39.46.jpg)

5、在 IDEA 工具的 Maven 模块中进行 depoly 。

![iShot2022-02-01 21.40.08](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143763.jpg)

6、推送成功后，在 Nexus 中可以看到如下内容：

![iShot2022-02-01 21.40.29](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143798.jpg)

7、创建一个 spring boot 的项目，并修改 pom.xml 文件，在 dependencies 节点添加依赖，并添加 repositories 配置，如下：

```
<dependencies>
    <dependency>
        <groupId>org.example</groupId>
        <artifactId>MavenTest</artifactId>
        <version>1.0</version>
    </dependency>
</dependencies>
<repositories>
    <repository>
        <id>releases</id>
        <name>releases</name>
        <url>http://10.211.55.6:8081/repository/MavenTest/</url>
        <releases>
            <enabled>true</enabled>
        </releases>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

8、在 IDEA 中的 build 模块中进行同步就可以将 maven 包拉取到项目中。

![iShot2022-02-01 21.40.55](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143407.jpg)

## NPM

1、在 Repositories 功能中创建 npm 的私有仓库 NpmTest ,仓库模板选择 npm(hosted)，Deployment policy 需要设置为 Allow redeply，否则在推送时会报 400 的错误。

2、使用 vue 创建一个项目 nexus-test 。

3、使用下面命令进行本地注册，后面的地址为创建的 npm 私有库的地址。

```
npm config set registry http://10.211.55.6:8081/repository/NpmTest/
```

4、想要将自己的 npm 包推送到私有仓库中，需要先使用下面的命令进行登录。

```
npm login –registry=http://10.211.55.6:8081/repository/NpmTest/
```

5、修改 vue 项目根目录中的 package.json 文件，将 private 设置为 false ，版本号 version 根据需要进行修改。

6、在 Nexus 的 Realms 模块进行设置，将 npm Bearer Token Realm 选到右边的 Active 栏中，此处不设置，在推送时会出现 401 的错误。

![iShot2022-02-01 21.41.14](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143061.jpg)

7、执行下面命令进行包的推送：

```
npm publish --registry=http://10.211.55.6:8081/repository/NpmTest
```

8、创建一个新的 vue 项目 nexus-test1 来进行私有仓库的使用，先进行仓库地址的注册。

```
npm config set registry http://10.211.55.6:8081/repository/NpmTest/
```

9、执行 `npm install nexus-test` 进行包的安装，安装成功如下图：

![iShot2022-02-01 21.41.41](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143091.jpg)

## Docker

1、在 Repositories 功能中创建 docker 的私有仓库 DockerTest ,仓库模板选择 docker(hosted) 。

![iShot2022-02-01 21.42.13](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143442.jpg)

- 勾选 http，设置端口为 8082 ，此处的端口为创建 Nexus 容器时设置的 8082 端口 ；
- 勾选允许匿名拉取镜像；
- 勾选运行客户端通过 API 访问。

2、在 Nexus 的 Realms 模块进行设置，将 Docker Bearer Token Realm 选到右边的 Active 栏中。

![iShot2022-02-01 21.42.38](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143232.jpg)

3、在 CentOS 7 系统中安装 Docker ，然后再 /etc/docker/ 目录中创建 daemon.json 文件，内容如下：

```
{
   "insecure-registries": ["10.211.55.6:9999"]
}
```

4、执行下面命令进行配置的加载。

```
systemctl daemon-reload
systemctl restart docker
```

5、在 root 目录中创建 nexus-docker 目录，目录中创建 Dockerfile 文件用来构建一个新的镜像，内容如下：

```
FROM nginx:latest
COPY . /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

6、执行下面命令进行镜像的构建和推送到服务端。

```
# 构建镜像
docker build -t nexus-docker .
# 将镜像 tag 成服务端的地址
docker tag nexus-docker-test:latest 10.211.55.6:8082/nexus-docker-test:latest
# 进行登录 
docker login -u test -p 000000 10.211.55.6:8082
# 推送镜像
docker push 10.211.55.6:8082/nexus-docker-test:latest
```

操作成功如下图所示：

![iShot2022-02-01 21.43.00](https://cdn.jsdelivr.net/gh/oec2003/hblog-images/img/202202012143410.jpg)

7、使用镜像的时候，只要服务器进行了第三步中的地址注册，就可以使用 `docker pull 10.211.55.6:8082/nexus-docker-test:latest` 进行镜像拉取。

希望本文对您有所帮助！
