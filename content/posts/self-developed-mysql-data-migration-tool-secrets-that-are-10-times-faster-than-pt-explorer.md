---
title: 自研 MySQL 数据迁移工具：比 pt-archiver 快 10 倍的秘密
date: 2026-01-16T14:00:00+08:00
categories: [技术]
tags: [数据库,MySQL,Python,性能优化]
---
在上一篇文章《[[使用 pt-archiver 迁移 mysql 数据]]》中，我介绍了使用 Percona Toolkit 工具集中的 `pt-archiver` 进行历史数据归档的方法。

<!-- more -->

`pt-archiver` 功能强大且成熟，但在某些特定场景下，它的性能表现并不尽如人意。

例如，当我尝试将 200 万行历史数据迁移到一个已经包含 500 万行数据的归档表中时，`pt-archiver` 的速度非常慢。最根本的原因有两个：

1、是因为它在插入数据时，目标表的索引在持续更新，随着表越来越大，索引维护的开销也呈指数级增长。

2、pt-archiver 在批量执行时拼接的 SQL 并非是多值 SQL，而是多条 Insert 语句的拼接。而多值 SQL 的执行效率要远超多条 Insert 语句的拼接。

为了解决这个问题，我借助 AI 的能力编写了一个 Python 工具（`data_migrate`），通过先删索引-批量插入-重建索引的策略，实现了性能的飞跃。

## 核心思路

1、**迁移前**：把原表和目标表上除主键和查询字段相关之外的索引先保存到 json 文件中，然后删除。

2、**迁移中**：使用 `INSERT INTO ... VALUES (...), (...), ...` 这种多值 SQL 的方式进行批量写入。因为没有索引的负担，目标表写入速度和原表的删除速度都非常快。

3、**迁移后**：一次性重建所有索引。MySQL 重建索引是经过优化的（排序后批量构建），比逐行维护快得多。

此外，针对复杂的筛选条件（例如 `WHERE id IN (SELECT ...)`），引入了快照表机制，避免在循环分页中反复执行昂贵的子查询。

快照表逻辑很简单，就是先将需要过滤的 id 查询出来存到一个临时表中，再通过临时表中的 id 进行过滤。

## 工具实现

这个工具使用 Python 编写，基于 `PyMySQL` 驱动。主要包含以下几个模块：

- `migrator.py`: 核心迁移控制器。
- `index_manager.py`: 负责智能地删除和恢复索引。
- `db_manager.py`: 数据库连接池管理。

### 1、智能索引优化

这是性能提升的关键。在 `IndexManager` 类中，实现了 `drop_indexes` 和 `restore_indexes` 方法。

值得注意的是，我们不能无脑删除所有索引。如果迁移的 `WHERE` 条件依赖某个索引（例如按 `create_time` 过滤），删掉它会导致源表查询变慢。因此，我加入了一个简单的逻辑：**解析 WHERE 子句，保留查询所需的索引**。

```python
# data_migrate/tools/data_migrate/index_manager.py 部分代码
def drop_indexes(self, table_name, indexes, keep_columns=None):
     """删除索引并持久化到文件
     :param keep_columns: 需要保留的列名列表（字符串列表），如果索引包含这些列，则不删除
     """
     if not indexes:
         return

     # 持久化索引信息到文件，防止程序中断丢失
     backup_file = f"{table_name}_indexes_backup.json"
     try:
         with open(backup_file, 'w', encoding='utf-8') as f:
             json.dump(indexes, f, ensure_ascii=False, indent=2)
         logger.info(f"索引备份已保存至: {backup_file}")
     except Exception as e:
         logger.error(f"保存索引备份失败: {e}，将跳过索引删除操作以保证安全。")
         return

     # 过滤需要删除的索引
     indexes_to_drop = []
     for idx in indexes:
         should_drop = True
         if keep_columns:
             # 检查索引列是否包含在保留列表中
             # idx['columns'] 是 ["`col1`", "`col2`"] 格式
             for col in idx['columns']:
                 clean_col = col.strip('`')
                 if clean_col in keep_columns:
                     logger.info(f"  -> 保留表 {table_name} 的索引 {idx['name']}，因为涉及查询列 {clean_col}")
                     should_drop = False
                     break
         if should_drop:
             indexes_to_drop.append(idx)

     if not indexes_to_drop:
          logger.info(f"表 {table_name} 没有需要删除的索引（所有索引均被保留或无索引）。")
          return

     logger.info(f"正在删除表 {table_name} 的 {len(indexes_to_drop)} 个索引以加速写入...")
     conn = self.db_manager.get_connection()
     for idx in indexes_to_drop:
         try:
             sql = f"ALTER TABLE `{table_name}` DROP INDEX `{idx['name']}`"
             logger.info(f"  -> 删除索引: {idx['name']}")
             with conn.cursor() as cursor:
                 cursor.execute(sql)
             conn.commit()
         except Exception as e:
             logger.error(f"删除索引 {idx['name']} 失败: {e}")

```

### 2、批量读写与事务控制

为了减少网络交互和事务开销，我使用了 `executemany` 进行批量插入。

```python
# data_migrate/tools/data_migrate/migrator.py

# 1. 批量读取
select_sql = f"SELECT * FROM {source_table} WHERE {where_clause} LIMIT {LIMIT}"

cursor.execute(select_sql)
rows = cursor.fetchall()

# 2. 批量构建 INSERT
insert_sql = f"INSERT INTO {dest_table} ({cols}) VALUES ({placeholders})"
cursor.executemany(insert_sql, values_list)

# 3. 批量删除源数据 (可选)
if delete_source:

delete_sql = f"DELETE FROM {source_table} WHERE `{pk_col}` IN (...)"
cursor.execute(delete_sql, pk_values)

# 4. 提交事务
conn.commit()

```

### 3、快照表机制

如果迁移条件是 `state=4` 的关联数据，通常需要 `JOIN` 或 `IN` 子查询。为了避免每次分页都查一遍，我在迁移开始前创建一个临时表 `data_id_tmp`，把符合条件的 ID 先存下来。

```python

def _prepare_snapshot(self):
    """创建临时表用于迁移条件快照"""
    logger.info("正在准备(重建)临时表 data_id_tmp ...")
    conn = self.db_manager.get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DROP TABLE IF EXISTS data_id_tmp")
            # 使用普通表，以便调试或在不同会话中复用（如果需要），但这里脚本是单会话
            cursor.execute("CREATE TABLE data_id_tmp AS SELECT id FROM t_test_rel WHERE state = 4")
            # 添加索引以优化 IN 查询性能
            cursor.execute("ALTER TABLE data_id_tmp ADD INDEX idx_id (id)")
            conn.commit()
        logger.info("临时表准备完成。")
        return True
    except Exception as e:
        logger.error(f"创建临时表失败: {e}")
        return False

```

## 使用 Docker 的方式使用

 1、在项目根目录下创建 Dockerfile 文件，内容如下：

```Dockerfile
# 使用官方 Python 轻量级镜像
FROM python:3.9-slim
# 设置工作目录
WORKDIR /app
# 设置环境变量，确保 Python 输出不被缓存
ENV PYTHONUNBUFFERED=1
# 复制依赖文件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# 复制项目代码
COPY . .
# 赋予入口脚本执行权限
RUN chmod +x entrypoint.sh
# 默认启动命令
CMD ["./entrypoint.sh"]
```

2、执行下面命令构建镜像：

```
docker build -t fw-tools:1.0 .
```

3、找到需要迁移的数据库的 docker 网络名称备用：

```
docker network ls
```

4、修改配置文件  docker-compose.yml

![](https://img.fwhyy.com/2026/20260119203818.webp)

上图红框部分修改为第三步获取的名称。

5、修改通用配置 configs/common.env

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=123456
DB_NAME=test
```

- DB_HOST：**修改为数据库容器的容器IP**
- DB_PORT：数据库端口
- DB_USER：数据库用户名
- DB_PASS：数据库密码
- DB_NAME：数据库名称

6、修改 configs/data_migrate.env

```
# Migration Configuration
LIMIT=5000
SLEEP=1
# 是否启用索引优化（自动删除和重建非主键索引以加速写入）
# 这将作为全局默认值，如果任务中没有单独配置，则使用此值
ENABLE_INDEX_OPTIMIZATION=false

# 可在任务中配置 "enable_index_optimization": false 来覆盖全局设置
MIGRATION_TASKS='[
  {
    "source": "t_test1",
    "dest": "t_test1_bak",
    "where": "id IN (SELECT rel_id FROM data_id_tmp)",
    "description": "迁移t_test1已经完成的记录",
    "enable_index_optimization": true
  }
]'

```

- LIMIT：每次批量迁移数据的数量
- SLEEP：每批次迁移完后 sleep 的秒数，默认1秒
- ENABLE_INDEX_OPTIMIZATION：是否启用索引优化，默认 false ，启用的意思是在迁移之前会先删除源和目标表的索引，迁移完成后，再加回来，该配置会被迁移任务中的设置覆盖
- MIGRATION_TASKS：迁移任务配置，可以配置多组
	- source：源表表名
	- dest：目标表表名
	- where：对源表的数据进行数据过滤，条件中的 data_id_tmp 系统每次运行会自动创建并装载数据
	- description：务必写清描述，后面维护的人就知道任务的意图
	- enable_index_optimization：是否索引优化，这个配置会覆盖全局配置

7、执行下面命令来构建容器：

```
docker compose up -d
```

8、开始执行数据迁移，先输入下面命令进入交互界面，然后按照提示进行操作：

```
docker attach fw_tools_console
```

```
================================================================
   S2 Tools 工具箱
================================================================
1) 数据迁移 (Data Migrate)
2) 缓存管理 (Cache) - [开发中]

q) 退出
----------------------------------------------------------------
请选择工具类别: 
```

选择 1 ，回车后进入数据迁移交互中：

```
请选择工具类别: 1
2026-01-19 12:31:11 - INFO - 成功连接到数据库: 172.66.5.7:3306/test

================================================================
   Python 数据库迁移工具 (通用配置版)
================================================================
1) 迁移t_test1已经完成的记录
2) 执行所有任务
3) 显示配置
q) 返回上级菜单
----------------------------------------------------------------
请选择一个选项: 
```

选择对应的操作执行，成功后的日志如下：

```
================================================================
   Python 数据库迁移工具 (通用配置版)
================================================================
1) 迁移t_test1已经完成的记录
2) 执行所有任务
3) 显示配置
q) 返回上级菜单
----------------------------------------------------------------
请选择一个选项: 2

当前配置:
  主机:     172.66.5.7
  数据库:   test
  操作:     即将按顺序执行所有配置的迁移任务
您确定要继续吗? [y/N] y
2026-01-19 12:34:38 - INFO - 正在执行第 1/1 个任务...
2026-01-19 12:34:38 - INFO - 开始迁移任务: t_test1 -> t_test1_bak
2026-01-19 12:34:38 - INFO - 条件: id IN (SELECT rel_id FROM data_id_tmp)
2026-01-19 12:34:38 - INFO - 索引优化: 启用
2026-01-19 12:34:38 - INFO - 每次处理: 5000 条, 完成后休眠: 1.0 秒
2026-01-19 12:34:38 - INFO - 索引备份已保存至: t_test1_indexes_backup.json
2026-01-19 12:34:38 - INFO - 正在删除表 t_test1 的 1 个索引以加速写入...
2026-01-19 12:34:38 - INFO -   -> 删除索引: email
2026-01-19 12:34:38 - INFO - 已迁移: 3 行 (本批次: 3 行, 插入: 0.00s, 删除: 0.00s, 总耗时: 0.01s)
2026-01-19 12:34:39 - INFO - 没有更多数据需要迁移，数据阶段完成。
2026-01-19 12:34:39 - INFO - 正在恢复表 t_test1 的 1 个索引...
2026-01-19 12:34:39 - INFO -   -> 恢复索引: email
2026-01-19 12:34:39 - INFO - 索引恢复完成，已删除备份文件: t_test1_indexes_backup.json
2026-01-19 12:34:39 - INFO - 任务结束，共迁移 3 行。

================================================================
   Python 数据库迁移工具 (通用配置版)
================================================================
1) 迁移t_test1已经完成的记录
2) 执行所有任务
3) 显示配置
q) 返回上级菜单
----------------------------------------------------------------
请选择一个选项: 
```

新的工具经过测试，原表 300 万、目标表 500 万的情况下，迁移 100 万～200 万数据，只需要 1 个多小时。

## 总结

通过“空间换时间”（快照表）和“策略换时间”（延迟索引构建），这个 Python 工具在处理百万级数据归档时，性能比 `pt-archiver` 提升了数倍。

性能的提升有一部分是来自于索引的删除，生产系统需要谨慎操作。

工具源码地址：https://github.com/oec2003/data_migrate
