package com.golpe.antigolpe.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartaoRepository extends JpaRepository<Cartao, Integer> {
    
    // Método para encontrar todos os cartões de um usuário específico
    List<Cartao> findByUser(User user);
}