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
- [ ] data migration
- [ ] pingxx
- [ ] forestadmin 
- [ ] test cms function
- [ ] amazon email 看看阿里云中有没有替代方案 （yiliang）
- [ ] non-root

### Yiliang's Note:

#### Move nginx out of container, as well as certbot 

cert location: `/etc/letsencrypt/live/www.circlingquanquan.com`, which supports 2 sub domains. 

``` shell
root@ali1:/etc/letsencrypt/live/www.circlingquanquan.com# certbot certificates
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: www.circlingquanquan.com
    Serial Number: 3edb14a2266aee18ebc14909f3c92dc3110
    Key Type: RSA
    Domains: www.circlingquanquan.com api.circlingquanquan.com
    Expiry Date: 2021-06-15 20:33:11+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/www.circlingquanquan.com/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/www.circlingquanquan.com/privkey.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
root@ali1:/etc/letsencrypt/live/www.circlingquanquan.com#
```

nginx conf example (2 sub domains share single cert): 

``` text
server {
   server_name www.circlingquanquan.com
   listen 80;

   listen 443 ssl; # managed by Certbot
   ssl_certificate /etc/letsencrypt/live/www.circlingquanquan.com/fullchain.pem; # managed by Certbot
   ssl_certificate_key /etc/letsencrypt/live/www.circlingquanquan.com/privkey.pem; # managed by Certbot
   include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
   ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

   location / {
       proxy_pass http://localhost:8080;
   }

   location /forest_admin/ {
       proxy_pass http://localhost:3310/;
   }
}

server {
    server_name api.circlingquanquan.com
    listeni 80

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/www.circlingquanquan.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/www.circlingquanquan.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

    location / {
       proxy_pass http://localhost:4567;
   }
}
```

#### Cert renew:

1. always use `certbot renew --dry-run` for testing: 
``` shell
root@ali1:/etc/systemd/system# certbot renew --dry-run
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/www.circlingquanquan.com.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Cert not due for renewal, but simulating renewal for dry run
Plugins selected: Authenticator nginx, Installer nginx
Simulating renewal of an existing certificate for www.circlingquanquan.com and api.circlingquanquan.com
Performing the following challenges:
http-01 challenge for api.circlingquanquan.com
http-01 challenge for www.circlingquanquan.com
Using default address 80 for authentication.
Waiting for verification...
Cleaning up challenges

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
new certificate deployed with reload of nginx server; fullchain is
/etc/letsencrypt/live/www.circlingquanquan.com/fullchain.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations, all simulated renewals succeeded:
  /etc/letsencrypt/live/www.circlingquanquan.com/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
root@ali1:/etc/systemd/system#
```

2. The renew is supported by certbot out of the box via systemd timers, don't change unless we change the domain names.
``` shell
root@ali1:/etc/systemd/system# systemctl list-timers | grep renew
Thu 2021-03-18 07:39:00 CST  1h 14min left n/a                          n/a          snap.certbot.renew.timer     snap.certbot.renew.service
root@ali1:/etc/systemd/system#
```
