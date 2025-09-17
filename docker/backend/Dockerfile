# Build stage
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /build
COPY backend/pom.xml .
RUN mvn dependency:go-offline
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM amazoncorretto:21

WORKDIR /app
COPY --from=build /build/target/book-nexus-*.jar app.jar

EXPOSE 8080

CMD java -jar -Dspring.profiles.active=${ACTIVE_PROFILE:-prod} app.jar