// js/dashboard.js (Corrigido sem Math.random)
import { auth } from './auth.js';
import { loadNavbar } from './common.js';
import { cardApi, transactionApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificar autenticação e carregar Navbar
    if (!auth.requireAuth()) {
        return;
    }
    loadNavbar();

    // 2. Pegar os elementos da página
    const alertCard = document.getElementById('alert-card');
    const alertMessageDiv = document.getElementById('alert-message');
    const revisarBtn = document.getElementById('revisar-btn');
    const cardsSummaryElement = document.getElementById('cards-summary');
    const recentTransactionsElement = document.getElementById('recent-transactions');

    // 3. Carregar Resumo de Cartões (em paralelo)
    (async () => {
        try {
            const cards = await cardApi.getCards();
            cardsSummaryElement.innerHTML = ''; // Limpa o "Carregando..."
            
            if (cards.length === 0) {
                cardsSummaryElement.innerHTML = '<p>Nenhum cartão cadastrado.</p>';
            } else {
                // Exibe até 2 cartões no resumo
                cards.slice(0, 2).forEach(card => {
                    const cardHtml = `
                        <div class="card-mini">
                            <div class="card-flag">${card.bandeira}</div>
                            <p>**** ${card.ultimos4Digitos}</p>
                            <p>${card.dataValidade}</p>
                        </div>
                    `;
                    cardsSummaryElement.insertAdjacentHTML('beforeend', cardHtml);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar resumo de cartões:', error);
            cardsSummaryElement.innerHTML = '<p>Erro ao carregar cartões.</p>';
        }
    })(); // A função se auto-executa

    // 4. Carregar Histórico de Transações E VERIFICAR ALERTA
    try {
        const allTransactions = await transactionApi.getAllMyTransactions();
        recentTransactionsElement.innerHTML = ''; // Limpa o "Carregando..."

        if (allTransactions.length === 0) {
            recentTransactionsElement.innerHTML = '<p>Nenhuma transação recente.</p>';
        } else {
            // Popula o histórico com as 3 mais recentes
            allTransactions.slice(0, 3).forEach(transacao => {
                const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor);
                const date = new Date(transacao.dataHora);
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                
                const transactionHtml = `
                    <div class="transaction-item">
                        <div class="details">
                            <strong>${transacao.estabelecimento}</strong>
                            <span>${formattedDate} - Cartão final ${transacao.cartao.ultimos4Digitos}</span>
                        </div>
                        <div class="amount ${transacao.valor < 0 ? 'negative' : ''}">${formattedValue}</div>
                    </div>
                `;
                recentTransactionsElement.insertAdjacentHTML('beforeend', transactionHtml);
            });
        }

        // --- INÍCIO DA LÓGICA DE ALERTA REAL ---
        // Removemos o Math.random() e agora procuramos uma transação real.
        
        const suspiciousTransaction = allTransactions.find(t => t.status === 'SUSPEITA');

        if (suspiciousTransaction) {
            // Encontrou uma! Mostra o alerta.
            alertMessageDiv.textContent = `Transação suspeita detectada de R$ ${suspiciousTransaction.valor} em ${suspiciousTransaction.estabelecimento}.`;
            alertCard.style.display = 'block';
            revisarBtn.onclick = () => {
                window.location.href = 'transactions.html'; // Manda o usuário para a lista de transações
            };
        } else {
            // Nenhuma transação suspeita. Esconde o alerta.
            alertCard.style.display = 'none';
        }
        // --- FIM DA LÓGICA DE ALERTA REAL ---

    } catch (error) {
        console.error('Erro ao carregar histórico de transações:', error);
        recentTransactionsElement.innerHTML = '<p>Erro ao carregar transações.</p>';
        alertCard.style.display = 'none'; // Garante que o alerta não apareça se der erro
    }

    // 5. Lógica para Botões de Navegação
    document.getElementById('add-new-card-btn').addEventListener('click', () => {
        window.location.href = 'cards.html';
    });

    document.getElementById('view-all-transactions-btn').addEventListener('click', () => {
        window.location.href = 'transactions.html';
    });
});