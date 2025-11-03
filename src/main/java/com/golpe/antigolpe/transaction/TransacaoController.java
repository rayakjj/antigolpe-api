package com.golpe.antigolpe.transaction;

import com.golpe.antigolpe.user.Cartao; // Precisamos do Cartao para associar a transação
import com.golpe.antigolpe.user.CartaoRepository; // Para buscar o cartão
import com.golpe.antigolpe.user.User; // Para o usuário logado
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransacaoController {

    private final TransacaoRepository transacaoRepository;
    private final CartaoRepository cartaoRepository; // Precisamos para verificar se o cartão pertence ao usuário

    // Endpoint para REGISTRAR uma nova transação
    // Recebe o ID do cartão ao qual a transação pertence
    @PostMapping("/cartao/{cartaoId}")
    public ResponseEntity<Transacao> addTransaction(
            @PathVariable Integer cartaoId,
            @RequestBody Transacao transacao) {

        User currentUser = getCurrentUser(); // Pega o usuário logado

        // Verifica se o cartão existe e pertence ao usuário logado
        Optional<Cartao> optionalCartao = cartaoRepository.findById(cartaoId);
        if (optionalCartao.isEmpty() || !optionalCartao.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build(); // Cartão não encontrado ou não pertence ao usuário
        }

        Cartao cartao = optionalCartao.get();
        
        transacao.setCartao(cartao); // Associa a transação ao cartão encontrado
        transacao.setDataHora(LocalDateTime.now()); // Define a data/hora atual para a transação
        transacao.setStatus("APROVADA"); // Status padrão (pode ser mais complexo futuramente)
        
        Transacao savedTransacao = transacaoRepository.save(transacao);
        return ResponseEntity.ok(savedTransacao);
    }

    // Endpoint para LISTAR todas as transações de um cartão específico
    @GetMapping("/cartao/{cartaoId}")
    public ResponseEntity<List<Transacao>> getTransactionsByCard(@PathVariable Integer cartaoId) {
        User currentUser = getCurrentUser(); // Pega o usuário logado

        // Verifica se o cartão existe e pertence ao usuário logado
        Optional<Cartao> optionalCartao = cartaoRepository.findById(cartaoId);
        if (optionalCartao.isEmpty() || !optionalCartao.get().getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.notFound().build(); // Cartão não encontrado ou não pertence ao usuário
        }

        Cartao cartao = optionalCartao.get();
        List<Transacao> transactions = transacaoRepository.findByCartao(cartao);
        return ResponseEntity.ok(transactions);
    }

    // Endpoint para LISTAR todas as transações de TODOS os cartões do usuário logado
    // Útil para o "Histórico recente de Transações" do Dashboard
    @GetMapping
    public ResponseEntity<List<Transacao>> getAllMyTransactions() {
        User currentUser = getCurrentUser(); // Pega o usuário logado
        
        // Busca todos os cartões do usuário
        List<Cartao> userCards = cartaoRepository.findByUser(currentUser);
        
        // Para cada cartão, busca suas transações e coleta em uma única lista
        List<Transacao> allTransactions = userCards.stream()
                .flatMap(cartao -> transacaoRepository.findByCartao(cartao).stream())
                .sorted((t1, t2) -> t2.getDataHora().compareTo(t1.getDataHora())) // Opcional: ordenar por data mais recente
                .toList();

        return ResponseEntity.ok(allTransactions);
    }


    // Método auxiliar para pegar o usuário atualmente autenticado
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }
}