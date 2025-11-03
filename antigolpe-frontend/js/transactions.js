// js/transactions.js
import { auth } from './auth.js';
import { loadNavbar } from './common.js';
import { transactionApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar autenticação e carregar Navbar
    if (!auth.requireAuth()) {
        return;
    }
    loadNavbar();

    const transactionsListElement = document.getElementById('transactions-list');

    // Função para carregar e exibir as transações
    async function loadTransactions() {
        transactionsListElement.innerHTML = '<p>Carregando transações...</p>';
        try {
            const allTransactions = await transactionApi.getAllMyTransactions();
            transactionsListElement.innerHTML = ''; // Limpa antes de popular

            if (allTransactions.length === 0) {
                transactionsListElement.innerHTML = '<p>Você não possui nenhuma transação registrada.</p>';
            } else {
                allTransactions.forEach(transacao => {
                    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transacao.valor);
                    const date = new Date(transacao.dataHora);
                    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                    const transactionHtml = `
                        <div class="transaction-list-item">
                            <div class="details">
                                <strong>${transacao.estabelecimento}</strong>
                                <span>${formattedDate} ${formattedTime}</span>
                                <span>Status: ${transacao.status}</span>
                            </div>
                            <div class="amount ${transacao.status === 'SUSPEITA' ? 'negative' : ''}">
                                ${formattedValue}
                            </div>
                        </div>
                    `;
                    transactionsListElement.insertAdjacentHTML('beforeend', transactionHtml);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            transactionsListElement.innerHTML = '<p>Erro ao carregar transações.</p>';
        }
    }

    // Carrega as transações ao iniciar a página
    loadTransactions();
});