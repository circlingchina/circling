SERVER_DOCKERFILE = dockerfiles/Dockerfile.server
REGISTRY = gcr.io
NAME := ${REGISTRY}/circling-deploy/circling-server
COMMIT ?= $$(git rev-parse --short HEAD)
FULL_TAG:= ${NAME}:${COMMIT}
LATEST_TAG := ${NAME}:latest

build:
	@echo building $(FULL_TAG)
	@docker build -t $(FULL_TAG) -f $(SERVER_DOCKERFILE) .
	@docker tag ${FULL_TAG} ${LATEST_TAG}

push: build
	@echo pushing to $(REGISTRY)
	@docker push $(NAME)

deploy: push
	@echo deploying on remote servers
	@ansible-playbook server/machine-config/3-deploy-containers.yml --extra-vars "image_tag=$(COMMIT)"

local_up: build
	@docker-compose up server