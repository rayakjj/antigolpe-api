package com.golpe.antigolpe.fraud;

import com.golpe.antigolpe.transaction.Transacao;
import org.springframework.stereotype.Service;

@Service
public class FraudDetectionService {

    // Define os limites para nossas regras de fraude
    private static final double VALOR_MAXIMO_APROVADO = 1500.00;
    private static final String ESTABELECIMENTO_SUSPEITO = "SITE DE APOSTA ESTRANHO";

    /**
     * Analisa uma transação e retorna um status (APROVADA, SUSPEITA, NEGADA).
     */
    public String analyzeTransaction(Transacao transacao) {

        // --- REGRA 1: Valor da Transação ---
        // Se o valor for muito alto, marcamos como SUSPEITA para revisão.
        if (transacao.getValor().doubleValue() > VALOR_MAXIMO_APROVADO) {
            return "SUSPEITA"; // Ou "NEGADA", dependendo da sua regra de negócio
        }

        // --- REGRA 2: Estabelecimento Suspeito ---
        // Se o nome do estabelecimento estiver em uma "lista negra"
        if (transacao.getEstabelecimento().equalsIgnoreCase(ESTABELECIMENTO_SUSPEITO)) {
            return "SUSPEITA";
        }

        // (Aqui você pode adicionar mais regras no futuro)

        // Se passou por todas as regras, a transação é aprovada.
        return "APROVADA";
    }
}