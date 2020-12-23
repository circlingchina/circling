SERVER_DOCKERFILE = dockerfiles/Dockerfile.server
REGISTRY = gcr.io
NAME := ${REGISTRY}/circling-deploy/circling-server
COMMIT ?= $$(git rev-parse --short HEAD)
FULL_TAG:= ${NAME}:${COMMIT}
LATEST_TAG := ${NAME}:latest

all: build push deploy
build:
	@echo building $(FULL_TAG)
	@docker build -t $(FULL_TAG) -f $(SERVER_DOCKERFILE) .
	@docker tag ${FULL_TAG} ${LATEST_TAG}

push:
	@echo pushing to $(REGISTRY)
	@docker push $(NAME)

deploy:
	@echo deploying on remote servers
	@ansible-playbook server/machine-config/4-deploy-containers.yml --extra-vars "image_tag=latest"

local_up: build
	@docker-compose up server
