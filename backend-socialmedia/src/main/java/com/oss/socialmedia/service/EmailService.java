package com.oss.socialmedia.service;


import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.oss.socialmedia.controller.request.ReqEmail;

import java.io.IOException;
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

    public String sendEmail(ReqEmail emailRequest) throws IOException {
        // String emailContent = getEmailTemplate();
        
        String frontendUrl = "http://localhost:3000/auth/register-info?email=" + emailRequest.getRecipientEmails();
        String emailContent = "<html>" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>Verify Your Email</title>" +
            "<style>" +
            "body {" +
            "font-family: Arial, sans-serif;" +
            "background-color: #f4f4f4;" +
            "margin: 0;" +
            "padding: 0;" +
            "}" +
            ".container {" +
            "max-width: 600px;" +
            "margin: 20px auto;" +
            "background: #ffffff;" +
            "padding: 20px;" +
            "border-radius: 8px;" +
            "box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);" +
            "text-align: center;" +
            "}" +
            ".logo {" +
            "margin-bottom: 20px;" +
            "}" +
            "h1 {" +
            "color: #333;" +
            "}" +
            "p {" +
            "color: #666;" +
            "font-size: 16px;" +
            "}" +
            ".btn {" +
            "display: inline-block;" +
            "background: #007BFF;" +
            "color: #ffffff;" +
            "text-decoration: none;" +
            "padding: 12px 20px;" +
            "border-radius: 5px;" +
            "font-size: 16px;" +
            "margin-top: 20px;" +
            "}" +
            ".btn:hover {" +
            "background: #0056b3;" +
            "}" +
            ".footer {" +
            "margin-top: 20px;" +
            "font-size: 14px;" +
            "color: #999;" +
            "}" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<div class=\"container\">" +
            "<h1>Verify Your Email Address</h1>" +
            "<p>Welcome to <strong>TripleT</strong>! Please click the button below to verify your email address and activate your account.</p>" +
            "<a href='" + frontendUrl + "' class=\"btn\">Verify Email</a>" +
            "<p>If you did not request this, please ignore this email.</p>" +
            "<div class=\"footer\">" +
            "&copy; 2025 TripleT. All rights reserved." +
            "</div>" +
            "</div>" +
            "</body>" +
            "</html>";
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
