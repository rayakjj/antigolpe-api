package com.golpe.antigolpe.transaction;

import com.golpe.antigolpe.fraud.FraudDetectionService; // <-- 1. IMPORTA O NOVO SERVIÇO
import com.golpe.antigolpe.user.Cartao;
import com.golpe.antigolpe.user.CartaoRepository;
import com.golpe.antigolpe.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransacaoController {

    private final TransacaoRepository transacaoRepository;
    private final CartaoRepository cartaoRepository;
    private final FraudDetectionService fraudService; // <-- 2. INJETA O NOVO SERVIÇO

    // Endpoint para ADICIONAR uma nova transação a um cartão
    @PostMapping("/cartao/{cartaoId}")
    public ResponseEntity<Transacao> addTransactionToCard(
            @PathVariable Integer cartaoId,
            @RequestBody Transacao transacao // O JSON vem aqui
    ) {
        User currentUser = getCurrentUser();

        // Verifica se o cartão existe e pertence ao usuário logado
        Optional<Cartao> optionalCartao = cartaoRepository.findById(cartaoId);
        if (optionalCartao.isEmpty() || !optionalCartao.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build(); // Cartão não encontrado ou não pertence ao usuário
        }

        Cartao cartao = optionalCartao.get();
        transacao.setCartao(cartao); // Associa a transação ao cartão
        transacao.setDataHora(LocalDateTime.now()); // Define a data/hora atual

        // --- 3. A GRANDE MUDANÇA ESTÁ AQUI ---
        // Em vez de aprovar direto, perguntamos ao serviço de fraude
        String status = fraudService.analyzeTransaction(transacao);
        transacao.setStatus(status);
        // --- FIM DA MUDANÇA ---

        Transacao savedTransacao = transacaoRepository.save(transacao);
        return ResponseEntity.ok(savedTransacao);
    }

    // Endpoint para LISTAR todas as transações de um cartão específico
    @GetMapping("/cartao/{cartaoId}")
    public ResponseEntity<List<Transacao>> getTransactionsByCard(@PathVariable Integer cartaoId) {
        User currentUser = getCurrentUser();

        // Verifica se o cartão existe e pertence ao usuário
        Optional<Cartao> optionalCartao = cartaoRepository.findById(cartaoId);
        if (optionalCartao.isEmpty() || !optionalCartao.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(transacaoRepository.findByCartao(optionalCartao.get()));
    }

    // Endpoint para LISTAR TODAS as transações do usuário logado
    @GetMapping
    public ResponseEntity<List<Transacao>> getAllMyTransactions() {
        User currentUser = getCurrentUser();
        List<Cartao> userCards = cartaoRepository.findByUser(currentUser);

        // Para cada cartão, busca suas transações e coleta em uma única lista
        List<Transacao> allTransactions = userCards.stream()
                .flatMap(cartao -> transacaoRepository.findByCartao(cartao).stream())
                .sorted((t1, t2) -> t2.getDataHora().compareTo(t1.getDataHora())) // Ordena por data mais recente
                .collect(Collectors.toList());

        return ResponseEntity.ok(allTransactions);
    }

    // Método auxiliar para pegar o usuário atualmente autenticado
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}