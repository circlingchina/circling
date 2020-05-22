SERVER_DOCKERFILE = dockerfiles/Dockerfile.server
REGISTRY = gcr.io
NAME := ${REGISTRY}/circling-deploy/circling-server
COMMIT := $$(git rev-parse --short HEAD)
FULL_TAG:= ${NAME}:${COMMIT}
LATEST_TAG := ${NAME}:latest

build: build_server

build_server:
	@echo building $(FULL_TAG)
	@docker build -t $(FULL_TAG) -f $(SERVER_DOCKERFILE) .
	@docker tag ${FULL_TAG} ${LATEST_TAG}

push: build_server
	@echo pushing to $(REGISTRY)
	@docker push $(NAME)

deploy: push
	@echo deploying on remote servers
	@ansible-playbook server/machine-config/3-deploy-containers.yml --extra-vars "image_tag=$(COMMIT)"