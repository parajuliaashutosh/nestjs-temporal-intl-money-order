REGISTRY = registry.aashutoshparajuli.com.np
IMAGE   = money-order/backend
TAG      = 2.0.1

FULL_IMAGE = $(REGISTRY)/$(IMAGE):$(TAG)

build:
	docker build -t $(FULL_IMAGE) .

push:
	docker push $(FULL_IMAGE)

deploy: build push

migrate:
	node dist/migration-runner.js

clean:
	docker image rm -f $(FULL_IMAGE) $(LATEST_IMAGE) || true

print:
	@echo "Registry : $(REGISTRY)"
	@echo "Image    : $(IMAGE)"
	@echo "Tag      : $(TAG)"
	@echo "Full     : $(FULL_IMAGE)"

.PHONY: build push deploy clean print migrate
