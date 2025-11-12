package com.golpe.antigolpe.transaction;

import com.golpe.antigolpe.user.Cartao;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal; // Para valores monetários com precisão
import java.time.LocalDateTime; // Para data e hora da transação

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "transacao")
public class Transacao {

    @Id
    @GeneratedValue
    private Integer id;

    private BigDecimal valor; // Usar BigDecimal para precisão monetária
    private LocalDateTime dataHora; // Registro exato da transação
    private String estabelecimento; // Onde a transação ocorreu
    private String status; // Ex: "APROVADA", "NEGADA", "PENDENTE", "SUSPEITA"
    private String tipoTransacao; // Ex: "COMPRA", "SAQUE", "ESTORNO" (pode ser usado para análise)

    // Relacionamento Many-to-One com Cartao
    // Uma transação pertence a um cartão
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartao_id") // Coluna na tabela 'transacao' que faz referência ao ID do cartão
    private Cartao cartao;

    // Você pode adicionar um campo para detecção de fraude aqui futuramente
    // Ex: private Boolean fraudeDetectada = false;
    // Ou até um enum para tipo de fraude
}