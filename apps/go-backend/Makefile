.PHONY: build run push deploy help stop build-run format watch

# Configuration
DOCKER_IMAGE := my-go-project:latest
GCP_REGION := us-central1
GCP_PROJECT_ID ?= your-project-id
GCP_REGISTRY := gcr.io

help:
	@echo "Available commands:"
	@echo "  make build          - Build Docker image locally"
	@echo "  make run            - Run Docker container locally (port 8080)"
	@echo "  make stop           - Stop running container"
	@echo "  make push           - Push image to Google Container Registry"
	@echo "  make deploy         - Deploy to Cloud Run"
	@echo "  make build-run      - Build and run locally"
	@echo "  make watch          - Watch files and auto-restart on changes"
	@echo "  make format         - Format and organize imports"
	@echo "  make swagger        - Regenerate Swagger docs (JSON only)"
	@echo ""
	@echo "Note: Linting and testing run automatically via GitHub Actions"
	@echo ""
	@echo "Set GCP_PROJECT_ID before deploying:"
	@echo "  make deploy GCP_PROJECT_ID=your-project-id"

build:
	docker build -t $(DOCKER_IMAGE) .

run:
	docker run -p 8080:8080 -e PORT=8080 $(DOCKER_IMAGE)

stop:
	docker ps -q | xargs -r docker stop

push:
	docker build -t $(GCP_REGISTRY)/$(GCP_PROJECT_ID)/$(DOCKER_IMAGE) .
	docker push $(GCP_REGISTRY)/$(GCP_PROJECT_ID)/$(DOCKER_IMAGE)

deploy:
	gcloud run deploy my-go-project \
		--image $(GCP_REGISTRY)/$(GCP_PROJECT_ID)/$(DOCKER_IMAGE) \
		--platform managed \
		--region $(GCP_REGION) \
		--allow-unauthenticated \
		--set-env-vars PORT=8080

build-run: build run

format:
	go install golang.org/x/tools/cmd/goimports@latest
	gofmt -s -w .
	@PATH="$$(go env GOPATH)/bin:$$PATH" goimports -w .

watch:
	@echo "Installing air..." && go install github.com/air-verse/air@latest
	$(shell go env GOPATH)/bin/air

swagger:
	@echo "Regenerating Swagger docs..."
	$(shell go env GOPATH)/bin/swag init -g main.go --parseDependency --parseInternal
	@rm -f docs/swagger.yaml
	@echo "✅ Swagger docs updated (JSON only)"

.DEFAULT_GOAL := help
