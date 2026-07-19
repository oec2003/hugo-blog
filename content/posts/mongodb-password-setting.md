---
title: MongoDB密码设置
date: 2024-06-06T08:49:13+08:00
categories: [技术]
tags: [MongoDB]
---

给 MongoDB 设置密码有两种情况：

1、给创建的 MongDB 容器添加密码。

2、给现有的无密码的 MongoDB 容器进行密码设置。

在设置密码之前，先说说 MongoDB 的版本，之前一直使用 5.0.2 和 5.0.14 版本比较多，然而这两个版本都是有安全漏洞的，所以大版本如果选择 5 ，可以选择 5.0.24 。

<!--more-->

![](https://img.fwhyy.com/2024/202406051625025.webp)

## 新创建容器设置密码

1、在 CentOS 服务器中创建目录 mongodb_pwd ，目录结构如下：

![](https://img.fwhyy.com/2024/202406051625451.webp)

2、使用下面命令给 mongo-init.js 文件添加执行权限：

```
chmod +x mongo-init.js
```

3、mongo-init.js 文件内容如下：

```
print('create user start #################################################################');

db = db.getSiblingDB("oec2003_db");

db.createUser({
  user: "oec2003",
  pwd: "Aa12345678",
  roles: [
    {
      role: "readWrite",
      db: "oec2003_db"
    }
  ]
});

db.createCollection('oec2003');

print('create user end #################################################################');
```

* 加上 print 为了更好地查看容器日志。
* `getSiblingDB()` 是 MongoDB shell 提供的一个方法，它允许你切换到另一个数据库，而不需要重新连接到MongoDB实例。这个方法返回一个新的 `DB` 对象，意思是数据库不存在会新创建一个。
* db.createCollection('oec2003')：在用户创建完成后，创建了一个名为 oec2003 的 collection ，默认创建一个 collection 是为方便测试，因为没有任何内容的库，使用 show dbs 或者客户端连上是看不见新创建的数据库 oec2003_db 。

4、docker-compose.yml 文件内容如下：

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0.24
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "37017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: Aa123456
    volumes:
      - mongo-data:/data/db
      - ./config/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

volumes:
  mongo-data:
```

* environment 环境变量设置根账户的用户名和密码，可以理解为超级管理员账号
* volumes 中映射的 mongo-init.js 文件在 MongoDB 容器第一次运行的时候会被执行，是否被执行可以通过执行 `docker logs -f mongodb` 命令查看日志：

![](https://img.fwhyy.com/2024/202406051625831.webp)

如果没有出现上图中的日志，需要检查下 mongo-init.js 文件是否有执行权限。

5、进入容器，使用 mongo 进入 MongoDB 的 shell 模式，会发现可以正常进入，但如果执行一些命令会出现没有权限的提示：

```
docker exec -it mongodb bash
mongo
> use admin
> db.getUsers()
```

![](https://img.fwhyy.com/2024/202406051625837.webp)

所以，在加了密码的 MongoDB 中需要使用下面命令进行登录：

```
mongo -u root -p Aa123456 --authenticationDatabase "admin"
```

* 用户名和密码为 docker-compose.yml 文件中 environment 中定义的。

6、使用用户名密码登录后，在进行用户的查询：

```
docker exec -it mongodb bash
mongo -u root -p Aa123456 --authenticationDatabase "admin"
> use oec2003_db
> db.getUsers()
```

![](https://img.fwhyy.com/2024/202406051625948.webp)

## 给现有容器进行密码设置

1、原始构建容器的脚本可能是这样的：

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0.24
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "47017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

2、网上看到很多设置密码的方式，直接进入 MongoDB 的 shell 模式，针对数据库进行账号密码的添加：

```shell
use oec2003_db
db.createUser({
  user: "oec2003",
  pwd: "Aa12345678",
  roles: [
    {
      role: "readWrite",
      db: "oec2003_db"
    }
  ]
});

```

但只是针对库加了用户和密码，会发现，客户端工具，不使用密码一样可以登录，并且能操作库里的内容。

3、这时，修改 docker-compose.yml 文件 ，添加 auth认证：

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:5.0.24
    container_name: mongodb
    restart: unless-stopped
    ports:
      - "47017:27017"
    volumes:
      - mongo-data:/data/db
    command: --auth

volumes:
  mongo-data:
```

重新构建容器，这时用客户端访问数据库，或者 collection 就会出现如下提示：

![](https://img.fwhyy.com/2024/202406051626019.webp)

## 最后

1、新创建的时候 yml 文件没有添加 --auth ，也是需要使用用户名密码才能使用，但对现有无密码容器进行修改，必须添加 --auth ，还不知道原因（可能是我操作问题 。

2、对现有无密码容器进行修改时，不管是在 environment 中添加根密码，还是手动进入 shell 中添加，只要没有添加 --auth ，一样可以无密码登录。

3、按照上面步骤进行配置，是可以达到密码保护的作用。
