SERVER_DOCKERFILE = dockerfiles/Dockerfile.server
REGISTRY = gcr.io
NAME := ${REGISTRY}/circling-deploy/circling-server
COMMIT ?= $$(git rev-parse --short HEAD)
FULL_TAG:= ${NAME}:${COMMIT}
LATEST_TAG := ${NAME}:latest

ALI_REGISTRY = registry.cn-beijing.aliyuncs.com
ALI_NAME := ${ALI_REGISTRY}/circlingchina/circling_aliyun
ALI_FULL_TAG := ${ALI_NAME}:${COMMIT}
ALI_LATEST_TAG := ${ALI_NAME}:latest

# ALI FE
FE_DOCKERFILE = dockerfiles/Dockerfile.client
ALI_FE_NAME := ${ALI_REGISTRY}/circlingchina/circling_aliyun
ALI_FE_FULL_TAG := ${ALI_NAME}_fe:${COMMIT}
ALI_FE_LATEST_TAG := ${ALI_NAME}_fe:latest


all: build push deploy
build:
	@echo building $(FULL_TAG)
	@docker build -t $(FULL_TAG) -f $(SERVER_DOCKERFILE) .
	@docker tag ${FULL_TAG} ${LATEST_TAG}

push:
	@echo pushing to $(REGISTRY)
	@docker push $(FULL_TAG)
	@docker push $(LATEST_TAG)

deploy:
	@echo deploying on remote servers
	@ansible-playbook server/machine-config/4-deploy-containers.yml --extra-vars "image_tag=$(COMMIT)"

build_ali:
	@echo building $(ALI_FULL_TAG)
	@docker build -t $(ALI_FULL_TAG) -f $(SERVER_DOCKERFILE) .
	@docker tag ${ALI_FULL_TAG} ${ALI_LATEST_TAG}

build_ali_fe:
	@echo building $(ALI_FE_FULL_TAG)
	@docker build -t $(ALI_FE_FULL_TAG) -f $(FE_DOCKERFILE) .
	@docker tag ${ALI_FE_FULL_TAG} ${ALI_FE_LATEST_TAG}

push_ali:
	@docker login --username=dev@1370088337995916 registry.cn-beijing.aliyuncs.com -p=abcd1234
	@echo pushing to $(ALI_REGISTRY)
	@docker push $(ALI_FULL_TAG)
	@docker push $(ALI_LATEST_TAG)

push_ali_fe:
	@docker login --username=dev@1370088337995916 registry.cn-beijing.aliyuncs.com -p=abcd1234
	@echo pushing to $(ALI_REGISTRY)
	@docker push $(ALI_FE_FULL_TAG)
	@docker push $(ALI_FE_LATEST_TAG)

local_up: build
	@docker-compose up server