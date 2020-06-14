Since the circling project doesn't have a full time devop team, its best to:
1) keep the servers stateless
2) automatically provision a new set of servers on-demand

## Prerequisits for provisioning new web servers:

- install Terraform
- install Ansible: https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html
- configure access to cloud provider (scripts provided for gcloud, aliyun)

# Google Cloud

## Access

Install and init gcloud via: <https://cloud.google.com/sdk/docs/downloads-apt-get>

Obtain service account credentials at <https://console.cloud.google.com/apis/credentials>

Place credentials in a folder

```
mkdir ~/.circling-api
mv circling-sa-key.json ~/.circling-api/
cat ~/.circling-api/keyfile.json | docker login -u _json_key --password-stdin https://gcr.io
```

## Provision machines

Install terraform: <https://learn.hashicorp.com/terraform/gcp/install>

Execute terraform script

```
cd server/machine-config/tf-google
terraform apply
```

## Configure machines

```
ansible-playbook circling-api-playbook.yml -vv --extra-vars user_pass=<PASSWORD> -K
```

## Install certbot

This is the one step that seem to be easier to perform outside of ansible for now
And it should only be done on the machine serving https.

```
sudo certbot --nginx -d api.circlingchina.org
```

## Deploy

At this point deployment can be made. In the root dir:

```
make
```

Verify results in server machine:

```
curl localhost:4567/healthcheck
```

Verify results remotely:

```
curl https://api.circlingchina.org/healthcheck
```