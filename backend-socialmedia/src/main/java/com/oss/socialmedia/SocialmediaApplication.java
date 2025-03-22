package com.oss.socialmedia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.ConfigurableEnvironment;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class SocialmediaApplication {

	public static void main(String[] args) {
		// Load environment variables from .env file
		Dotenv dotenv = Dotenv.load();
		String apiKey = dotenv.get("SENDINBLUE_API_KEY");

		// Set the environment variable for Spring
		SpringApplication app = new SpringApplication(SocialmediaApplication.class);
		app.addInitializers(applicationContext -> {
			ConfigurableEnvironment env = applicationContext.getEnvironment();
			env.getSystemProperties().put("SENDINBLUE_API_KEY", apiKey);
		});
		app.run(args);
	}
}
