package com.golpe.antigolpe.card;

import com.golpe.antigolpe.user.Cartao;
import com.golpe.antigolpe.user.CartaoRepository;
import com.golpe.antigolpe.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
public class CartaoController {

    private final CartaoRepository cartaoRepository;

    // Endpoint para LISTAR os cartões do usuário logado
    @GetMapping
    public ResponseEntity<List<Cartao>> getMyCards() {
        User currentUser = getCurrentUser();
        List<Cartao> cards = cartaoRepository.findByUser(currentUser);
        return ResponseEntity.ok(cards);
    }

    // Endpoint para ADICIONAR um novo cartão
    @PostMapping
    public ResponseEntity<Cartao> addCard(@RequestBody Cartao cartao) {
        User currentUser = getCurrentUser();
        cartao.setUser(currentUser); // Associa o cartão ao usuário logado
        Cartao savedCartao = cartaoRepository.save(cartao);
        return ResponseEntity.ok(savedCartao);
    }

    // Endpoint para REMOVER um cartão
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable Integer cardId) {
        User currentUser = getCurrentUser();
        // Lógica para garantir que o usuário só pode deletar o próprio cartão
        cartaoRepository.findById(cardId)
                .filter(card -> card.getUser().getId().equals(currentUser.getId()))
                .ifPresent(cartaoRepository::delete);
        
        return ResponseEntity.noContent().build();
    }


    // Método auxiliar para pegar o usuário atualmente autenticado
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}