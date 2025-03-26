package com.oss.socialmedia.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String baseDir = Paths.get(System.getProperty("user.dir"), "upload").toAbsolutePath().toString();

        registry.addResourceHandler("/upload/images/**")
                .addResourceLocations("file:" + baseDir + "/images/");

        registry.addResourceHandler("/upload/videos/**")
                .addResourceLocations("file:" + baseDir + "/videos/");
    }
}
