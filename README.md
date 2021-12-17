# Circling China Site hosted in Aliyun
last update: 2021/12


## 本地开发

### 准备工作

#### 工具安装

- homebrew

  https://brew.sh/

- postgres

`brew install postgres`

- docker

https://www.docker.com/get-started

- node 

https://nodejs.org/en/ OR

`brew install node` OR

Install nvm to manage the node versions, refer to: https://github.com/nvm-sh/nvm

##### 开发环境搭建

###### 后端

后端代码在 server 目录下。 

在 server 目录下执行 `npm run dev` 或 `npm run start` 可以启动后端服务。 

如果需要在本地起服务器后端并开发调试，需要在本地起数据库，并保证本地的数据库schema和线上环境一致。 

注意在 create_db.sh 中 hard code 了数据库的用户名和密码：
dbname: circling_db
password: cirlcing
username: circling
dbname for testing: circling_test_db

通过以下步骤可以完成数据库的初始化：
1. 在本地安装PG数据库
2. 执行 server/db/create_db.sh 创建DB
3. 在 psql 执行 server/db/init_tables.sql 创建第一个版本的表结构。
4. 在 psql 依次执行 server/db/migrations/*.sql, 注意文件名的前缀，按照时间顺序依次执行。 今后每一次对数据库做的修改，都在这里记录下修改内容，方便回溯。

本地测试:
保证数据库启动以后，在server目录下执行 `npm run test`

###### 前端

前端代码在 src 目录下。

在根目录下执行 `npm run dev` 可以启动前端调试，这一步不需要启动后端也可以进行，支持热更新。

## 发布

1. 保证本地服务器端测试没有问题

