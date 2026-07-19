---
title: 迁移Wordpress到Docker
date: 2024-05-14T08:40:00+08:00
categories: [技术]
tags: [Docker, WordPress]
---

很多年前我的个人博客是部署在 Linode 的服务器，后来又给女儿弄了一个博客记录女儿的成长，使用的是 Wordpress ，老婆执笔。现在我的博客早已迁移到了 github ，女儿也长大了，博客好几年没有更新，准备停掉 linode 服务器，将女儿博客迁移到本地。

<!--more-->

迁移有三个步骤：

1、备份原博客数据；

2、本地部署 wordpress；

3、还原。

## 备份

1、将服务器 wwwroot 目录中的文件拷贝到本地。

![](https://img.fwhyy.com/2024/202405131556894.webp)

2、将 mysql 数据库进行备份。

## 本地部署 wordpress

本地部署 wordpress 采用 docker-compose 的方式，wordpress 使用的是最新版本，mysql 和之前 linode 服务器使用的同一版本，docker-compose.yml 文件内容如下：

```yaml
version: '3'

networks:
 wp_net:
  driver: bridge
  ipam:
   driver: default
   config:
    - subnet: 172.88.1.0/24

services:
  db:
    image: mysql:5.7
    volumes:
      - ./data:/var/lib/mysql
    restart: always
    ports:
      - "13306:3306"
    environment:
      - TZ=Asia/Shanghai
      - MYSQL_ROOT_PASSWORD=Aa123456
      - MYSQL_DATABASE=wordpress
      - MYSQL_USER=wpadmin
      - MYSQL_PASSWORD=Aa123456
    command: mysqld --character-set-server=utf8 --collation-server=utf8_general_ci --default-authentication-plugin=mysql_native_password
    networks:
     wp_net:
      ipv4_address: 172.88.1.2


  wp:
    image: wordpress:latest
    ports:
      - "12000:80"
    restart: always
    volumes:
      - ./wordpress/:/var/www/html
    environment:
      - TZ=Asia/Shanghai
      - WORDPRESS_DB_HOST=db:3306
      - WORDPRESS_DB_USER=wpadmin
      - WORDPRESS_DB_PASSWORD=Aa123456
      - WORDPRESS_DB_NAME=wordpress
    networks:
     wp_net:
      ipv4_address: 172.88.1.3

volumes:
  db_data: {}
  wordpress_data: {}
```

在 docker-compose.yml 所在目录执行 `docker-compose up -d ` 进行容器构建，构建完成后，就可以在浏览器输入 http://localhost:12000 进行访问：

![](https://img.fwhyy.com/2024/202405131556737.webp)

按照向导进行博客的初始化：

![](https://img.fwhyy.com/2024/202405131556583.webp)

## 还原

因之前部署的 wordperss 版本和现在最新的版本差异很大，所以没有使用完全覆盖的方式。

1、在构建的数据库中创建一个名为 wordpress_bak 的库，将备份的数据库还原到这个库中。

```shell
docker cp backup.sql 78fdd98f5834:/
docker exec -it 78fdd98f5834 bash
>mysql -uroot -pAa123456 wordpress < backup.sql
```

2、构建成功后，默认的 wordpress 库中的表有些示例数据，使用下面语句将示例数据删除：

```sql
DELETE FROM wp_posts
DELETE from wp_terms
```

3、备份 wordpress_bak 库中的 wp_posts 表，发现备份时提示错误：

![](https://img.fwhyy.com/2024/202405131556515.webp)

原因是还原的数据库日期类型的字段有不符合要求的默认值，将 wp_posts 表中的日期字段的默认值去掉即可。

4、使用下面语句将 wp_posts 表中 post_content 字段中内容的域名进行替换，这一步骤是将文章中的图片地址替换为本地地址：

```
update wp_posts set post_content = REPLACE(post_content,'http://xxxx.me','http://localhost:12000')
```

5、将 wordpress_bak 库中的 wp_posts、wp_terms 两个表的数据同步到 wordpress 库。同步完后，可以在浏览器访问：http://localhost:12000 ，可以看到所有的文章列表，但点击去后图片不能显示。

6、将备份的 wwwroot 中的 /wp_content/uploads 目录复制到新安装的 wordpress/wp_content 目录中，这时图片就能正常访问了。
