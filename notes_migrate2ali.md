# Deployment

- 前后端分开部署
- ngninx 给静态页面
- ngninx reverse proxy - api请求(api.circlingquanquan.com)打到后端node服务

- 前端 一个docker image = nginx + staic files
- 后端 一个docker image = server

由于缺乏CD服务器(本地充当CD服务器)，本地直接部署至ali ECS, .env文件在本地部署前需要准备好，然后 build 进 docker image


Deploy steps:

1. 本地git提交
2. build/push images `make aliyun_server`, `make aliyun_fe`
3. 登录阿里云ECS
4. docker pull images：
    ``` shell
    docker pull registry-vpc.cn-beijing.aliyuncs.com/circlingchina/circling_aliyun_fe:latest
    docker pull registry-vpc.cn-beijing.aliyuncs.com/circlingchina/circling_aliyun:latest
    ```
5. `cd /root/circling_deploy/ && docker-compose restart`

** 首次部署时:
1. Copy `dockerfiles/docker-compose.yml` 和 `init-letsencrypt.sh` 到 `/root/circling_deploy` 下
    ``` shell
    scp dockerfiles/docker-compose.yml root@47.95.8.171:/root/circling_deploy/
    scp dockerfiles/init-letsencrypt.sh root@47.95.8.171:/root/circling_deploy/
    ```
2. Follow deploy steps.
3. If the certbot container is not running, run `docker-compose restart`

问题：
1. 服务没有防挂的保障

TODO:
1. data migration
2. pingxx
3. forestadmin 
4. test cms function
5. amazon email 看看阿里云中有没有替代方案 （yiliang）

