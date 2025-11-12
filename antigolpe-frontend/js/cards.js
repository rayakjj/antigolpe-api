// js/cards.js
import { auth } from './auth.js';
import { loadNavbar } from './common.js';
import { cardApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar autenticação e carregar Navbar
    if (!auth.requireAuth()) {
        return;
    }
    loadNavbar();

    const cardsGridElement = document.getElementById('cards-grid');
    const addCardBtn = document.getElementById('add-new-card-btn');
    const addCardFormContainer = document.getElementById('add-card-form-container');
    const saveNewCardBtn = document.getElementById('save-new-card-btn');
    const cancelAddCardBtn = document.getElementById('cancel-add-card-btn');
    const addCardErrorMessageDiv = document.getElementById('add-card-error-message');

    const newCardBandeira = document.getElementById('new-card-bandeira');
    
    // --- MUDANÇA 1: Mudar a variável para pegar o ID do novo campo ---
    // (Presume que o ID no seu HTML é 'new-card-numero')
    const newCardNumero = document.getElementById('new-card-numero'); 
    
    const newCardNomeTitular = document.getElementById('new-card-nomeTitular');
    const newCardDataValidade = document.getElementById('new-card-dataValidade');

    // Função para carregar e exibir os cartões
    async function loadCards() {
        cardsGridElement.innerHTML = '<p>Carregando cartões...</p>';
        try {
            const cards = await cardApi.getCards();
            cardsGridElement.innerHTML = ''; // Limpa antes de popular

            if (cards.length === 0) {
                cardsGridElement.innerHTML = '<p>Você não possui nenhum cartão cadastrado.</p>';
            } else {
                cards.forEach(card => {
                    const cardHtml = `
                        <div class="card-full">
                            <div class="card-flag">${card.bandeira}</div>
                            <div class="chip"></div>
                            <div class="card-number">**** **** **** ${card.ultimos4Digitos}</div>
                            <div class="card-holder-info">
                                <span>${card.nomeTitular}</span>
                                <span>${card.dataValidade}</span>
                            </div>
                            <div class="card-actions">
                                <button class="btn-small btn-delete-card" data-card-id="${card.id}">Remover</button>
                            </div>
                        </div>
                    `;
                    cardsGridElement.insertAdjacentHTML('beforeend', cardHtml);
                });

                // Adiciona listeners para os botões de remover
                document.querySelectorAll('.btn-delete-card').forEach(button => {
                    button.addEventListener('click', async (event) => {
                        const cardId = event.target.dataset.cardId;
                        if (confirm('Tem certeza que deseja remover este cartão?')) {
                            try {
                                await cardApi.deleteCard(cardId);
                                alert('Cartão removido com sucesso!');
                                loadCards(); // Recarrega a lista
                            } catch (error) {
                                console.error('Erro ao remover cartão:', error);
                                alert('Erro ao remover cartão: ' + (error.data ? error.data.message : 'Verifique o console.'));
                            }
                        }
                    });
                });
            }
        } catch (error) {
            console.error('Erro ao carregar cartões:', error);
            cardsGridElement.innerHTML = '<p>Erro ao carregar cartões.</p>';
        }
    }

    // Carrega os cartões ao iniciar a página
    loadCards();

    // Lógica para mostrar/esconder o formulário de adicionar cartão
    addCardBtn.addEventListener('click', () => {
        addCardFormContainer.style.display = 'block';
        addCardBtn.style.display = 'none'; // Esconde o botão "Adicionar"
        cardsGridElement.style.display = 'none'; // Esconde a lista de cartões
        addCardErrorMessageDiv.style.display = 'none';
        
        // --- MUDANÇA 2: Limpar o campo de número completo ---
        newCardBandeira.value = '';
        newCardNumero.value = ''; // Limpa o campo de número do cartão
        newCardNomeTitular.value = '';
        newCardDataValidade.value = '';
    });

    cancelAddCardBtn.addEventListener('click', () => {
        addCardFormContainer.style.display = 'none';
        addCardBtn.style.display = 'block';
        cardsGridElement.style.display = 'grid'; // Mostra a lista de cartões novamente
    });

    // Lógica para salvar novo cartão
    saveNewCardBtn.addEventListener('click', async () => {
        const bandeira = newCardBandeira.value.toUpperCase();
        
        // --- MUDANÇA 3: Pega o número completo e remove espaços ---
        const fullCardNumber = newCardNumero.value.replace(/\s/g, ''); // Remove espaços em branco
        
        const nomeTitular = newCardNomeTitular.value.toUpperCase();
        const dataValidade = newCardDataValidade.value;

        addCardErrorMessageDiv.style.display = 'none';

        // --- MUDANÇA 4: Atualiza a validação ---
        if (!bandeira || !fullCardNumber || !nomeTitular || !dataValidade) {
            addCardErrorMessageDiv.textContent = 'Por favor, preencha todos os campos.';
            addCardErrorMessageDiv.style.display = 'block';
            return;
        }
        
        // Validação simples de número de cartão (13 a 19 dígitos, apenas números)
        if (fullCardNumber.length < 13 || fullCardNumber.length > 19 || isNaN(fullCardNumber)) {
            addCardErrorMessageDiv.textContent = 'Por favor, insira um número de cartão válido.';
            addCardErrorMessageDiv.style.display = 'block';
            return;
        }
        
        // Validação MM/AA (básica)
        const dateRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
        if (!dateRegex.test(dataValidade)) {
            addCardErrorMessageDiv.textContent = 'Formato de validade inválido (MM/AA).';
            addCardErrorMessageDiv.style.display = 'block';
            return;
        }

        // --- MUDANÇA 5: O "TRUQUE" - Extrai só os últimos 4 dígitos ---
        const ultimos4Digitos = fullCardNumber.slice(-4);

        // Enviamos apenas os dados seguros para o backend
        const cardData = { bandeira, ultimos4Digitos, nomeTitular, dataValidade };

        try {
            await cardApi.addCard(cardData);
            alert('Cartão adicionado com sucesso!');
            addCardFormContainer.style.display = 'none';
            addCardBtn.style.display = 'block';
            cardsGridElement.style.display = 'grid';
            loadCards(); // Recarrega a lista de cartões
        } catch (error) {
            console.error('Erro ao adicionar cartão:', error);
            addCardErrorMessageDiv.textContent = error.data ? error.data.message : 'Erro ao adicionar cartão.';
            addCardErrorMessageDiv.style.display = 'block';
        }
    });
});