---
title: 使用 pt-archiver 迁移 mysql 数据
date: 2026-01-13T16:43:00+08:00
categories: [技术]
tags: [插件,数据库,MySQL]
---
在软件系统中，随着业务增长，有些表数据量会越来越大，为了提升性能，会将表进行拆分。这就需要定时将数据从源表迁移到目标表。

<!-- more -->

通常使用一个 sql 语句就能实现数据的迁移：

```sql
insert into t_business_finished 
select * from t_business where state=4;

delete from t_business where state=4;
```

但这种操作在数据量很大时速度很慢，资源消耗也比较大。

后来发现 pt-archiver 这个工具可以做这个事情。pt-archiver 有下面几个优点：

- 支持分批（chunk）读取和写入，避免一次性加载大量数据导致内存溢出或锁表。
- 可以通过 `--limit` 控制每次处理的行数，配合 `--txn-size` 控制事务大小。
- 支持 `--sleep` ，避免对生产库造成过大的压力。
-  可以通过 `--progress` 来查看进度。

下面就简单说下 pt-archiver 是怎么使用的，因为我测试的环境 mysql 是使用 docker 构建的，下面示例中 pt-archiver 也是使用 docker 的方式运行。

1、拉取镜像

```shell
docker pull percona/percona-toolkit:latest
```

2、如果是企业内网，不能拉取镜像，就将镜像保存为 tar 文件，赋值到内网服务器 load 即可

```shell
# 外网服务器进行保存
docker save -o percona-toolkit.tar percona/percona-toolkit:latest

# 拷贝到内网后load
docker load -i percona-toolkit.tar
```

3、执行下面命令就可以进行数据的迁移：

```sql
docker run -it --rm --network test_net percona/percona-toolkit:latest   pt-archiver --source h=172.66.5.7,P=3306,u=root,p=123456,D=test,t=t_user --dest h=172.66.5.7,P=3306,u=root,p=123456,D=test,t=t_user_bak --where "1=1"  --limit 10 --progress 10 --txn-size 10 --sleep 1  --no-delete --statistics --why-quit --header
```

- --network：设置和数据库的容器在一个网络中
- --source 源表相关配置
	- h：数据库的容器 IP
	- P：数据库的容器内部端口
	- u：数据库用户名
	- p：数据库密码
	- D：数据库名称
	- t：表名
- --dest：目标表相关配置
- --where：从源表获取数据的 where 条件
- --limit：每次获取数据的条数
- --progress 10：每处理 10 行就向终端输出一条进度信息
- --txn-size 10：每 10 行组成一个事务，提交一次
- --sleep 1：每批提交后暂停 1 秒，降低负载。
- --no-delete：只复制，不删除源表数据
- --statistics：结束后打印总计行数、耗时、吞吐量等汇总
- --why-quit：如果提前退出，告知原因
- --header：进度信息前打印表头

执行效果如下：

![Pasted image 20260112145815](https://img.fwhyy.com/2026/202601121643946.webp)

上面的命令可以达到目的，但执行有点麻烦，可以写个 shell 脚本封装下来提升易用性。

```shell
#!/bin/bash
DB_HOST="${DB_HOST:-172.66.5.7}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-123456}"
DB_NAME="${DB_NAME:-test}"

# Docker 配置
DOCKER_IMAGE="${DOCKER_IMAGE:-percona/percona-toolkit:latest}"
DOCKER_NETWORK="${DOCKER_NETWORK:-test_net}"

# pt-archiver 设置
LIMIT="${LIMIT:-10}"
PROGRESS="${PROGRESS:-10}"
CHARSET="${CHARSET:-utf8mb4}"
SLEEP="${SLEEP:-1}"  # 默认每次提交后休眠 1 秒

# 输出颜色设置
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

# ------------------------------------------------------------------------------
# 辅助函数
# ------------------------------------------------------------------------------

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装或未在 PATH 中。"
        exit 1
    fi
}

confirm_action() {
    echo -e "\n${YELLOW}当前配置:${NC}"
    echo "  主机:     $DB_HOST"
    echo "  数据库:   $DB_NAME"
    echo "  网络:     $DOCKER_NETWORK"
    echo "  操作:     $1"
    echo ""
    read -p "您确定要继续吗? [y/N] " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0 
            ;;
        *)
            log_info "操作已取消。"
            return 1
            ;;
    esac
}

# ------------------------------------------------------------------------------
# 核心迁移函数
# ------------------------------------------------------------------------------
do_migrate() {
    local source_table=$1
    local dest_table=$2
    local where_clause=$3

    log_info "开始迁移: $source_table -> $dest_table"

    # 构建数据源名称 (DSN)
    local source_dsn="h=${DB_HOST},P=${DB_PORT},u=${DB_USER},p=${DB_PASS},D=${DB_NAME},t=${source_table}"
    local dest_dsn="h=${DB_HOST},P=${DB_PORT},u=${DB_USER},p=${DB_PASS},D=${DB_NAME},t=${dest_table}"

    # 构建 Docker 命令
    echo "----------------------------------------------------------------"
    echo "正在执行 pt-archiver..."
    echo "----------------------------------------------------------------"

    docker run -it --rm \
        --network "$DOCKER_NETWORK" \
        "$DOCKER_IMAGE" \
        pt-archiver \
        --source "$source_dsn" \
        --dest "$dest_dsn" \
        --where "$where_clause" \
        --limit "$LIMIT" \
        --progress "$PROGRESS" \
        --sleep "$SLEEP" \
        --no-delete \
        --txn-size "$LIMIT" \
        --statistics \
        --why-quit \
        --header \

    local status=$?

    if [ $status -eq 0 ]; then
        log_info "$source_table 迁移成功完成。"
    else
        log_error "$source_table 迁移失败，退出代码为 $status。"
    fi
}

# ------------------------------------------------------------------------------
# 任务列表
# ------------------------------------------------------------------------------

migrate_test() {
    local where="1=1"

    if confirm_action "迁移 t_user "; then
        do_migrate "t_user" "t_user_bak" "$where"
    fi
}

# ------------------------------------------------------------------------------
# 主菜单
# ------------------------------------------------------------------------------

check_docker

while true; do
    echo "================================================================"
    echo "   数据库迁移工具"
    echo "================================================================"
    echo "1) 迁移 t_user"
    echo "2) 显示配置"
    echo "q) 退出"
    echo "----------------------------------------------------------------"
    read -p "请选择一个选项: " choice

    case "$choice" in
        1)
            migrate_test
            ;;
        2)
            echo ""
            echo "数据库主机: $DB_HOST"
            echo "数据库端口: $DB_PORT"
            echo "数据库名称: $DB_NAME"
            echo "Docker网络: $DOCKER_NETWORK"
            echo ""
            ;;
        q|Q)
            log_info "正在退出。"
            exit 0
            ;;
        *)
            log_error "无效选项。"
            ;;
    esac
    echo ""
    read -p "按回车键继续..."
done

```

`migrate.sh` 脚本是一个自动化的数据迁移工具，它封装了 Docker 和 `pt-archiver` 的复杂命令，通过简单的交互式菜单来帮助您完成数据库迁移任务。

首次使用前，需要给脚本赋予可执行权限：

```bash
chmod +x migrate.sh
```

直接运行脚本即可进入交互界面：

```bash
./migrate.sh
```

运行后，您将看到如下中文菜单：

```text
================================================================
   数据库迁移工具
================================================================
1) 迁移 t_user
2) 显示配置
q) 退出
----------------------------------------------------------------
请选择一个选项: 1

当前配置:
  主机:     172.66.5.7
  数据库:   test
  网络:     test_net
  操作:     迁移 t_user 

您确定要继续吗? [y/N] y
[INFO] 开始迁移: t_user -> t_user_bak
----------------------------------------------------------------
正在执行 pt-archiver...
----------------------------------------------------------------
TIME                ELAPSED   COUNT
2026-01-12T08:33:58       0       0
2026-01-12T08:33:58       0      10
2026-01-12T08:33:59       1      20
2026-01-12T08:34:00       2      30
2026-01-12T08:34:01       3      40
2026-01-12T08:34:02       4      50
2026-01-12T08:34:03       5      60
```

`pt-archiver` 对一些数据的操作进行了封装，使用比较方便，但在测试过程中发现，如果往一个已经有 500 万数据的表中再迁移 200 万的数据，速度比较慢。

下一篇会讲讲如何自己撸一个程序达到和 `pt-archiver` 差不多的功能，但性能有大幅提升。