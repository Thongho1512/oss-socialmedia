package com.oss.socialmedia.service;


import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oss.socialmedia.controller.request.ReqEmail;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.api.url}")
    private String apiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OkHttpClient client = new OkHttpClient();

    private String getEmailTemplate() throws IOException {
        Path path = new ClassPathResource("templates/email.html").getFile().toPath();
        return Files.readString(path);
  
    }
    public String sendEmail(ReqEmail emailRequest) throws IOException {
        String emailContent = getEmailTemplate();
        Map<String, Object> emailData = new HashMap<>();
        Map<String, String> sender = new HashMap<>();
        sender.put("name", "tripleT");
        sender.put("email", "thongho1512@gmail.com");
        emailData.put("sender", sender);

        List<Map<String, String>> recipients = emailRequest.getRecipientEmails().stream()
                .map(email -> Map.of("email", email))
                .toList();

        emailData.put("to", recipients);
        emailData.put("subject", "Verify email");
        emailData.put("htmlContent", emailContent);

        RequestBody body = RequestBody.create(
                MediaType.parse("application/json"),
                objectMapper.writeValueAsString(emailData)
        );

        Request request = new Request.Builder()
                .url(apiUrl)
                .post(body)
                .addHeader("accept", "application/json")
                .addHeader("content-type", "application/json")
                .addHeader("api-key", apiKey)
                .build();

        Response response = client.newCall(request).execute();
        return response.body().string();
    }
}
