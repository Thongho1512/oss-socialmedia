FROM openjdk:21

ARG JAR_FILE=target/*.jar

COPY ${JAR_FILE} socialmedia.jar

ENTRYPOINT ["java", "-jar", "socialmedia.jar"]

EXPOSE 8080
