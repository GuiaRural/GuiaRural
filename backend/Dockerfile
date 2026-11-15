# Estágio de Build usando Maven e Java 21 (conforme a stack do GuiaRural)
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copia os arquivos de configuração e dependências primeiro para aproveitar o cache
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline

# Copia o código-fonte e faz o empacotamento
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Estágio de Execução (imagem mais leve apenas com o JRE)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copia o arquivo .jar gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# O Render injeta a variável PORT automaticamente; expomos a porta padrão
EXPOSE 8080

# Executa a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]