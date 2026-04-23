package com.carenode.sync;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SyncStatusController {

    @MessageMapping("/status")
    @SendTo("/topic/sync-status")
    public String sendStatus(String status) {
        return status;
    }
}