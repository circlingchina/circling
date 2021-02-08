# Deployment

- 前后端分开部署
- ngninx 给静态页面
- ngninx reverse proxy - api请求(api.circlingquanquan.com)打到后端node服务

- 前端 一个docker image = nginx + staic files
- 后端 一个docker image = server

由于缺乏CD服务器(本地充当CD服务器)，本地直接部署至ali ECS, .env文件在本地部署前需要准备好，然后build进docker image

流程：

1. 本地git提交
2. 构建镜像（需要用1中的git commit hash）
3. push镜像
4. 登录阿里云ECS
5. 更新镜像
6. 重新运行容器

问题：

1. AWS InvalidClientToken - 注册时触发
2. 服务没有防挂的保障

其他备注：

1. ECS root密码修改了
2. 代码库中，PG连接信息硬编码至代码中（被我修改成了阿里云的）

TODO：
1. CD server
2. CDN(any free CDN?)