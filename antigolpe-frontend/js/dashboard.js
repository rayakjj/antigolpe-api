// js/dashboard.js
import { auth } from './auth.js';
import { loadNavbar } from './common.js';
import { cardApi, transactionApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar autenticação e carregar Navbar
    if (!auth.requireAuth()) {
        return; // Se não autenticado, já redirecionou
    }
    loadNavbar(); // Carrega o navbar

    // Pega o email do localStorage (usado como nome temporariamente)
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        document.getElementById('user-name').textContent = userEmail.split('@')[0]; // Ex: "rayan" de "rayan@email.com"
    }

    // 2. Carregar Resumo de Cartões
    const cardsSummaryElement = document.getElementById('cards-summary');
    try {
        const cards = await cardApi.getCards();
        cardsSummaryElement.innerHTML = ''; // Limpa o "Carregando cartões..."

        if (cards.length === 0) {
            cardsSummaryElement.innerHTML = '<p>Nenhum cartão cadastrado.</p>';
        } else {
            // Exibe até 2 cartões no resumo, simulando o Figma
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

    // 3. Carregar Histórico Recente de Transações (as 3 últimas)
    const recentTransactionsElement = document.getElementById('recent-transactions');
    try {
        const allTransactions = await transactionApi.getAllMyTransactions();
        recentTransactionsElement.innerHTML = ''; // Limpa o "Carregando transações..."

        if (allTransactions.length === 0) {
            recentTransactionsElement.innerHTML = '<p>Nenhuma transação recente.</p>';
        } else {
            // Limita às 3 transações mais recentes (já ordenado pelo backend, se houver)
            allTransactions.slice(0, 3).forEach(transacao => {
                const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor);
                const date = new Date(transacao.dataHora);
                const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

                const transactionHtml = `
                    <div class="transaction-item">
                        <div class="details">
                            <strong>${transacao.estabelecimento}</strong>
                            <span>${formattedValue} - ${time}</span>
                        </div>
                        <div class="amount ${transacao.status === 'SUSPEITA' ? 'negative' : ''}">
                            ${transacao.status === 'SUSPEITA' ? 'ALERTA!' : formattedValue}
                        </div>
                    </div>
                `;
                recentTransactionsElement.insertAdjacentHTML('beforeend', transactionHtml);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar histórico de transações:', error);
        recentTransactionsElement.innerHTML = '<p>Erro ao carregar transações.</p>';
    }

    // 4. Lógica para Botões de Navegação
    document.getElementById('add-new-card-btn').addEventListener('click', () => {
        window.location.href = 'cards.html'; // Ou um formulário de modal, por enquanto redireciona
    });

    document.getElementById('view-all-transactions-btn').addEventListener('click', () => {
        window.location.href = 'transactions.html';
    });
    
    // Alerta de Transação Suspeita (simulado por enquanto)
    const alertMessageDiv = document.getElementById('alert-message');
    const revisarBtn = document.getElementById('revisar-btn');

    // Por enquanto, vamos simular uma alerta se houver transações (ou adicionar uma condição mais real depois)
    // Para realmente detectar fraude, você precisaria da lógica no backend e um campo `isSuspicious` na Transacao
    if (Math.random() > 0.7) { // 30% de chance de mostrar alerta para testes
        alertMessageDiv.textContent = 'Transação suspeita detectada no seu cartão final 4321.'; // Hardcoded para o exemplo
        revisarBtn.style.display = 'block';
        revisarBtn.addEventListener('click', () => {
            alert('Funcionalidade de revisão de transação suspeita (ainda a ser implementada).');
            // Futuramente, redirecionaria para a transação específica
        });
    } else {
         alertMessageDiv.textContent = 'Nenhuma transação suspeita detectada recentemente.';
    }

});