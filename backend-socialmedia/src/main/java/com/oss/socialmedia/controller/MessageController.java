package com.oss.socialmedia.controller;

import java.util.List;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.oss.socialmedia.model.MessageEntity;
import com.oss.socialmedia.service.MessageService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Tag(name = "Message controller")
@Slf4j(topic = "MESSAGE-CONTROLLER")
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;


    @PostMapping("/send")
    public MessageEntity sendMessage(@RequestParam String senderId, @RequestParam String receiverId, @RequestParam String content) {
        return messageService.saveMessage(senderId, receiverId, content);
    }

    @GetMapping("/history")
    public List<MessageEntity> getChatHistory(@RequestParam String senderId, @RequestParam String receiverId) {
        return messageService.getChatHistory(senderId, receiverId);
    }
}