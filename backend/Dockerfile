# JAR được build sẵn trên máy local bằng: mvn package -DskipTests
# Docker chỉ copy JAR vào, không compile lại → nhẹ và nhanh
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY target/personal-web-backend-1.0.0.jar app.jar
EXPOSE 8282
ENTRYPOINT ["java", "-Xms128m", "-Xmx400m", "-jar", "app.jar", "--spring.profiles.active=prod"]
