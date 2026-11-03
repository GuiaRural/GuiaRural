# Variáveis
PORT ?= 8080
BACKEND_DIR = backend
MAVEN = ./mvnw

.PHONY: help run run-port test clean

# Exibe a ajuda com os comandos disponíveis
help:
	@echo "Comandos disponíveis:"
	@echo "  make run         - Inicia a aplicação Spring Boot na pasta backend (porta padrão 8080)"
	@echo "  make run-port    - Inicia a aplicação na porta especificada (ex: make run-port PORT=8081)"
	@echo "  make test        - Executa os testes unitários do backend"
	@echo "  make clean       - Limpa os arquivos compilados da pasta target"

# Inicia o Spring Boot na porta padrão (8080)
run:
	@echo "A iniciar o backend na porta $(PORT)..."
	cd $(BACKEND_DIR) && $(MAVEN) spring-boot:run

# Inicia o Spring Boot numa porta personalizada
run-port:
	@echo "A iniciar o backend na porta $(PORT)..."
	cd $(BACKEND_DIR) && $(MAVEN) spring-boot:run -Dspring-boot.run.arguments="--server.port=$(PORT)"

# Executa os testes unitários dentro da pasta backend
test:
	@echo "A executar os testes unitários no backend..."
	cd $(BACKEND_DIR) && $(MAVEN) test

# Limpa a build do backend
clean:
	@echo "A limpar a pasta target..."
	cd $(BACKEND_DIR) && $(MAVEN) clean