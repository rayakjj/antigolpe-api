package com.golpe.antigolpe.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health") // Este é o caminho que o Render vai checar
    public ResponseEntity<String> checkHealth() {
        // Retorna uma resposta 200 OK com uma mensagem simples
        return ResponseEntity.ok("{\"status\": \"UP\"}"); 
    }
}