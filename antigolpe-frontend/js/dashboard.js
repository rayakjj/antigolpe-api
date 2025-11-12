// js/dashboard.js (Corrigido para SEMPRE mostrar o Alerta)
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
    const alertTitle = alertCard.querySelector('h3'); // Pega o H3 "ALERTA!!"
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
    })();

    // 4. Carregar Histórico de Transações E VERIFICAR ALERTA
    try {
        const allTransactions = await transactionApi.getAllMyTransactions();
        recentTransactionsElement.innerHTML = ''; // Limpa o "Carregando..."

        if (allTransactions.length === 0) {
            recentTransactionsElement.innerHTML = '<p>Nenhuma transação recente.</p>';
        } else {
            // Popula o histórico
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

        // --- INÍCIO DA MUDANÇA (LÓGICA DO ALERTA) ---
        const suspiciousTransaction = allTransactions.find(t => t.status === 'SUSPEITA');

        if (suspiciousTransaction) {
            // Se encontrou uma suspeita, mostra o alerta VERMELHO
            alertCard.classList.remove('alert-safe'); // Remove a classe de segurança (se houver)
            alertTitle.textContent = "ALERTA!!";
            alertMessageDiv.textContent = `Transação suspeita detectada de R$ ${suspiciousTransaction.valor} em ${suspiciousTransaction.estabelecimento}.`;
            revisarBtn.style.display = 'block';
            revisarBtn.onclick = () => {
                window.location.href = 'transactions.html';
            };
        } else {
            // Se NÃO encontrou, mostra o alerta "SEGURO" (Azul)
            alertCard.classList.add('alert-safe'); // Adiciona a classe de segurança
            alertTitle.textContent = "Tudo Certo!";
            alertMessageDiv.textContent = "Nenhuma transação suspeita detectada recentemente.";
            revisarBtn.style.display = 'none';
        }
        // --- FIM DA MUDANÇA ---

    } catch (error) {
        console.error('Erro ao carregar histórico de transações:', error);
        recentTransactionsElement.innerHTML = '<p>Erro ao carregar transações.</p>';
        
        // Se der erro ao carregar, mostra o alerta seguro por padrão
        alertCard.classList.add('alert-safe');
        alertTitle.textContent = "Tudo Certo!";
        alertMessageDiv.textContent = "Nenhuma transação suspeita detectada.";
        revisarBtn.style.display = 'none';
    }

    // 5. Lógica para Botões de Navegação
    document.getElementById('add-new-card-btn').addEventListener('click', () => {
        window.location.href = 'cards.html';
    });

    document.getElementById('view-all-transactions-btn').addEventListener('click', () => {
        window.location.href = 'transactions.html';
    });
});