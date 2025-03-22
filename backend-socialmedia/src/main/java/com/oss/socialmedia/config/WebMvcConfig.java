package com.oss.socialmedia.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations("file:D:/OSS/socialmedia/upload/images/");
        
        registry.addResourceHandler("/uploads/videos/**")
                .addResourceLocations("file:D:/OSS/socialmedia/upload/videos/");
    }
}
