package com.golpe.antigolpe.transaction;

import com.golpe.antigolpe.user.Cartao; // Precisamos do Cartao para filtrar por ele
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Integer> {
    
    // Método para encontrar todas as transações de um cartão específico
    List<Transacao> findByCartao(Cartao cartao);
    
    // Você pode adicionar outros métodos de busca aqui, como:
    // List<Transacao> findByCartaoAndStatus(Cartao cartao, String status);
    // List<Transacao> findByCartaoOrderByDataHoraDesc(Cartao cartao); // Para o histórico recente
}