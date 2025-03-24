package com.oss.socialmedia.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.oss.socialmedia.controller.request.ReqEmail;
import com.oss.socialmedia.service.EmailService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@RestController
@Tag(name = "email controller")
@Slf4j(topic = "EMAIL-CONTROLLER")
@RequiredArgsConstructor
@RequestMapping("/api/v1/email")
public class EmailController {

    private final EmailService emailService;


    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody ReqEmail emailRequest) {
        try {
            // Tạo URL xác thực từ email người dùng
            
            String response = emailService.sendEmail(emailRequest);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error sending email: " + e.getMessage());
        }
    }
}
