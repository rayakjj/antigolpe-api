// js/api.js
const API_BASE_URL = 'http://localhost:8080/api/v1';

async function callApi(endpoint, method = 'GET', body = null, requiresAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error('Nenhum token JWT encontrado. Redirecionando para login...');
            window.location.href = 'index.html'; // Redireciona para o login
            throw new Error('Unauthorized');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Se a resposta for 204 No Content (como na deleção), não tenta parsear JSON
    if (response.status === 204) {
        return { status: 204 }; // Retorna um objeto indicando sucesso sem conteúdo
    }

    const data = await response.json();

    if (!response.ok) {
        // Se a resposta não for OK (ex: 400, 401, 500), joga um erro
        const error = new Error(data.message || 'Erro na requisição');
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

// Funções específicas para o módulo de autenticação
export const authApi = {
    register: (firstname, lastname, email, password) => 
        callApi('/auth/register', 'POST', { firstname, lastname, email, password }, false), // Não requer autenticação
    authenticate: (email, password) => 
        callApi('/auth/authenticate', 'POST', { email, password }, false), // Não requer autenticação
};

// Funções específicas para o módulo de cartões
export const cardApi = {
    getCards: () => callApi('/cards'),
    addCard: (cardData) => callApi('/cards', 'POST', cardData),
    deleteCard: (cardId) => callApi(`/cards/${cardId}`, 'DELETE', null, true), // Certifique-se que o token está indo para o DELETE
};

// Funções específicas para o módulo de transações
export const transactionApi = {
    getTransactionsByCard: (cardId) => callApi(`/transactions/cartao/${cardId}`),
    getAllMyTransactions: () => callApi('/transactions'),
    addTransaction: (cardId, transactionData) => callApi(`/transactions/cartao/${cardId}`, 'POST', transactionData),
};