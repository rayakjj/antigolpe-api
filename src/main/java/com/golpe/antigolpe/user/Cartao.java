package com.golpe.antigolpe.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cartao")
public class Cartao {

    @Id
    @GeneratedValue
    private Integer id;

    private String ultimos4Digitos;
    private String nomeTitular;
    private String dataValidade; // Formato "MM/AA"
    private String bandeira; // Ex: "Visa", "Mastercard"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore // Para evitar que os dados do usuário venham junto com o cartão na resposta da API
    private User user;
}