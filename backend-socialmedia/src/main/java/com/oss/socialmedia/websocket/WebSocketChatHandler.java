package com.oss.socialmedia.websocket;



import com.oss.socialmedia.model.MessageEntity;
import com.oss.socialmedia.service.MessageService;

import lombok.RequiredArgsConstructor;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketChatHandler {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(MessageEntity message) {
        // Lưu tin nhắn vào database
        MessageEntity savedMessage = messageService.saveMessage(message.getSenderId(), message.getReceiverId(), message.getContent());

        // Gửi tin nhắn đến người nhận theo channel cá nhân
        messagingTemplate.convertAndSendToUser(
                message.getReceiverId(), "/queue/messages", savedMessage
        );
    }

    // @MessageMapping("/chat.sendMessage")
    // @SendTo("/topic/public")
    // public MessageEntity sendMessage(MessageEntity message) {
    //     return messageService.saveMessage(message.getSenderId(), message.getReceiverId(), message.getContent());
    // }
}
