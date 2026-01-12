# Makefile for WhiteLabel

.PHONY: all install lint test build clean

# Default target
all: install lint test build

# Install dependencies
install:
	npm install

# Run linter
lint:
	npm run lint

# Format code
format:
	npm run format

# Run tests
test:
	npm run test -- --run

# Build for production
build:
	npm run build

# Clean build artifacts
clean:
	rm -rf dist coverage
