# Estágio 1: Build (Compilar o Java com o Maven)
FROM maven:3-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Estágio 2: Run (Rodar a aplicação)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia o .jar que foi criado no Estágio 1
COPY --from=build /app/target/antigolpe-0.0.1-SNAPSHOT.jar app.jar

# Expõe a porta que o Spring usa
EXPOSE 8080

# Comando para rodar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]